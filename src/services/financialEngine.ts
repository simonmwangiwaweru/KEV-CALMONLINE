import { 
  SystemSettings, 
  LedgerEntry, 
  JobBooking, 
  ProductSale, 
  WorkerPaymentRecord, 
  FixedExpenseBudget, 
  GivingRequest,
  WeeklyCloseRecord,
  PriorityLevel,
  CurrencyCode 
} from '../types';

export function formatCurrency(amount: number, currency: CurrencyCode = 'KES'): string {
  const rounded = Math.round(amount);
  return `${currency} ${rounded.toLocaleString('en-KE')}`;
}

export function formatNumber(amount: number): string {
  return Math.round(amount).toLocaleString('en-KE');
}

/**
 * Calculates current Financial Position (The 5 Buckets Always Visible)
 */
export function calculateFinancialPosition(
  ledger: LedgerEntry[],
  fixedBudgets: FixedExpenseBudget[]
) {
  let companyInflow = 0;
  let companyOutflow = 0;
  let personalInflow = 0;
  let personalOutflow = 0;
  let savingsBalance = 0;
  let totalTithePaid = 0;

  for (const entry of ledger) {
    if (entry.account === 'company') {
      if (entry.type.startsWith('income_')) {
        companyInflow += entry.amount;
      } else if (
        entry.type === 'expense_job_cost' ||
        entry.type === 'expense_daily_worker' ||
        entry.type === 'expense_company_op' ||
        entry.type === 'transfer_owner_salary' ||
        entry.type === 'transfer_savings_deposit' ||
        entry.type === 'payment_tithe'
      ) {
        companyOutflow += entry.amount;
      }
    } else if (entry.account === 'personal') {
      if (entry.type === 'transfer_owner_salary') {
        personalInflow += entry.amount;
      } else if (entry.type === 'expense_personal' || entry.type === 'expense_giving') {
        personalOutflow += entry.amount;
      }
    }

    if (entry.type === 'transfer_savings_deposit') {
      savingsBalance += entry.amount;
    }
    if (entry.type === 'payment_tithe') {
      totalTithePaid += entry.amount;
    }
  }

  const companyMoney = Math.max(0, companyInflow - companyOutflow);
  const personalMoney = Math.max(0, personalInflow - personalOutflow);

  // Reserved for upcoming fixed expenses: remaining unpaid budget items
  const reservedForExpenses = fixedBudgets.reduce((acc, b) => {
    const remaining = Math.max(0, b.monthlyLimit - b.spentThisMonth);
    return acc + remaining;
  }, 0);

  // Safe available to spend
  const availableToSpend = Math.max(0, personalMoney);

  return {
    companyMoney,
    personalMoney,
    savingsBalance,
    reservedForExpenses,
    availableToSpend,
    totalTithePaid,
    companyInflow,
    companyOutflow,
    personalInflow,
    personalOutflow
  };
}

/**
 * Immediate Allocation Recommendation: "What to do with this money"
 */
export function calculatePaymentAllocation(
  amount: number,
  directCosts: number = 0,
  settings: SystemSettings
) {
  const base = settings.allocationBase === 'net_profit' 
    ? Math.max(0, amount - directCosts) 
    : amount;

  const savings = Math.round((base * settings.savingsPercentage) / 100);
  const tithe = Math.round((base * settings.tithePercentage) / 100);
  const companyReserve = Math.round((base * settings.companyReservePercentage) / 100);
  const personalSalary = Math.round((base * settings.personalSalaryPercentage) / 100);
  const operations = Math.max(0, base - savings - tithe - companyReserve - personalSalary);

  return {
    baseAmount: base,
    directCosts,
    keepForBusinessReserve: companyReserve,
    save: savings,
    setAsideForTithe: tithe,
    availableForPersonalSalary: personalSalary,
    availableForOperations: operations
  };
}

/**
 * Smart Support / Giving Recommendation Algorithm
 * Protects budget early in the month, increases safe flexibility later in the month.
 */
export function calculateGivingRecommendation(
  requestedAmount: number,
  priority: PriorityLevel,
  monthlyBudget: number,
  alreadyGivenThisMonth: number,
  peopleAlreadySupported: number,
  maxPeopleLimit: number = 0,
  targetDate: Date = new Date()
) {
  const remainingBudget = Math.max(0, monthlyBudget - alreadyGivenThisMonth);

  if (remainingBudget <= 0) {
    return {
      recommendedAmount: 0,
      reason: 'Monthly giving budget has been fully reached.',
      remainingBudget: 0,
      isBudgetExhausted: true
    };
  }

  if (maxPeopleLimit > 0 && peopleAlreadySupported >= maxPeopleLimit) {
    return {
      recommendedAmount: 0,
      reason: `Maximum people limit (${maxPeopleLimit} persons) for this month has been reached.`,
      remainingBudget,
      isBudgetExhausted: false
    };
  }

  const dayOfMonth = targetDate.getDate();
  const year = targetDate.getFullYear();
  const month = targetDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysRemaining = daysInMonth - dayOfMonth + 1;

  // Month progress ratio: 0.1 early month -> 0.9 late month
  const monthProgress = dayOfMonth / daysInMonth;

  // Priority weight factor
  const priorityMultipliers: Record<PriorityLevel, number> = {
    urgent: 1.0,
    important: 0.75,
    normal: 0.50,
    not_important: 0.25
  };

  const priorityFactor = priorityMultipliers[priority];

  // Base safe slice: distribute remaining budget across expected requests
  // Early in the month, reserve budget for potential emergency requests
  const safeReserveFactor = 0.35 + (monthProgress * 0.65); // from 35% early month to 100% at end of month
  
  // Calculate recommended amount
  let calculated = requestedAmount * priorityFactor * safeReserveFactor;

  // Cap recommendation to remaining budget and requested amount
  calculated = Math.min(calculated, requestedAmount, remainingBudget);

  // Round to nearest 50 or 100 KES for practical cash giving
  calculated = Math.max(50, Math.round(calculated / 50) * 50);
  calculated = Math.min(calculated, remainingBudget, requestedAmount);

  let explanation = '';
  if (monthProgress < 0.35) {
    explanation = `Early month conservative allocation (${daysRemaining} days left). Protects giving runway for later emergency requests.`;
  } else if (monthProgress > 0.8) {
    explanation = `Late month allocation (${daysRemaining} days left). Healthy remaining budget allows higher support.`;
  } else {
    explanation = `Mid-month balanced recommendation based on ${priority} priority and remaining budget of KES ${remainingBudget.toLocaleString()}.`;
  }

  return {
    recommendedAmount: calculated,
    reason: explanation,
    remainingBudget,
    isBudgetExhausted: false,
    daysRemaining,
    priority
  };
}

/**
 * Calculates current Week boundaries (Monday to Sunday)
 */
export function getWeekRange(date: Date = new Date(), weekStartDay: 0 | 1 = 1) {
  const current = new Date(date);
  const day = current.getDay(); // 0 is Sunday, 1 is Monday
  
  // Calculate diff to start day
  let diff = current.getDate() - day + (day === 0 && weekStartDay === 1 ? -6 : weekStartDay);
  if (weekStartDay === 0 && day !== 0) {
    diff = current.getDate() - day;
  }

  const start = new Date(current.setDate(diff));
  start.setHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);

  // ISO Week number
  const d = new Date(Date.UTC(start.getFullYear(), start.getMonth(), start.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);

  return {
    startDate: start.toISOString().split('T')[0],
    endDate: end.toISOString().split('T')[0],
    weekNumber: weekNo,
    year: start.getFullYear(),
    weekId: `${start.getFullYear()}-W${weekNo < 10 ? '0' + weekNo : weekNo}`
  };
}

/**
 * Weekly Status & Salary Engine
 */
export function calculateWeeklyStatus(
  currentWeekClose: WeeklyCloseRecord | undefined,
  weeklyLedger: LedgerEntry[],
  unpaidWorkers: WorkerPaymentRecord[],
  settings: SystemSettings
) {
  // Aggregate money received this week
  const moneyReceived = weeklyLedger
    .filter(e => e.account === 'company' && e.type.startsWith('income_'))
    .reduce((sum, e) => sum + e.amount, 0);

  // Aggregate direct production / job costs / labour paid this week
  const directCosts = weeklyLedger
    .filter(e => e.account === 'company' && (e.type === 'expense_job_cost' || e.type === 'expense_daily_worker'))
    .reduce((sum, e) => sum + e.amount, 0);

  // Other company expenses
  const companyExpenses = weeklyLedger
    .filter(e => e.account === 'company' && e.type === 'expense_company_op')
    .reduce((sum, e) => sum + e.amount, 0);

  // Net business profit available
  const netBusinessProfit = Math.max(0, moneyReceived - directCosts - companyExpenses);

  // Expected Savings: % of income or profit
  const savingsBase = settings.allocationBase === 'net_profit' ? netBusinessProfit : moneyReceived;
  const savingsExpected = Math.round((savingsBase * settings.savingsPercentage) / 100);

  // Expected Tithe: % of income or profit
  const titheExpected = Math.round((savingsBase * settings.tithePercentage) / 100);

  // Calculate Owner Salary Available
  let salaryRecommended = 0;
  if (settings.salaryRuleType === 'percentage') {
    salaryRecommended = Math.round((netBusinessProfit * settings.salaryProfitPercentage) / 100);
  } else if (settings.salaryRuleType === 'cap') {
    salaryRecommended = Math.min(settings.salaryWeeklyCap, Math.round(netBusinessProfit * 0.5));
  } else {
    // Custom
    salaryRecommended = Math.round(netBusinessProfit * 0.35);
  }

  // Savings deposited this week
  const savingsDeposited = currentWeekClose?.savingsDeposited || weeklyLedger
    .filter(e => e.type === 'transfer_savings_deposit')
    .reduce((sum, e) => sum + e.amount, 0);

  // Tithe paid this week
  const tithePaid = currentWeekClose?.tithePaid || weeklyLedger
    .filter(e => e.type === 'payment_tithe')
    .reduce((sum, e) => sum + e.amount, 0);

  // Salary transferred this week
  const salaryTransferred = currentWeekClose?.salaryTransferred || weeklyLedger
    .filter(e => e.type === 'transfer_owner_salary')
    .reduce((sum, e) => sum + e.amount, 0);

  // Status computation
  const hasUnpaidWorkers = unpaidWorkers.length > 0;
  const savingsComplete = savingsExpected === 0 || savingsDeposited >= savingsExpected;
  const titheComplete = titheExpected === 0 || (tithePaid >= titheExpected && !!currentWeekClose?.titheVerified);

  let status: 'WEEK_COMPLETE' | 'ACTION_REQUIRED' | 'WEEK_NOT_CLOSED' = 'ACTION_REQUIRED';

  if (currentWeekClose?.status === 'completed') {
    status = 'WEEK_COMPLETE';
  } else if (hasUnpaidWorkers || !savingsComplete || !titheComplete) {
    status = 'ACTION_REQUIRED';
  } else {
    status = 'WEEK_NOT_CLOSED';
  }

  return {
    moneyReceived,
    directCosts,
    companyExpenses,
    netBusinessProfit,
    savingsExpected,
    savingsDeposited,
    savingsComplete,
    titheExpected,
    tithePaid,
    titheComplete,
    salaryRecommended,
    salaryTransferred,
    hasUnpaidWorkers,
    unpaidWorkersCount: unpaidWorkers.length,
    status
  };
}
