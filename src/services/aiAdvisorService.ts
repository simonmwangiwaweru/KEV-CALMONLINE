/**
 * AI Financial Advisor Service
 * Packages the live KaziFinance financial & operational context and communicates with /api/ai/chat.
 */

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: string;
}

export interface FinancialSnapshotPayload {
  asOf: string;
  settings: {
    currency: string;
    currencySymbol: string;
    allocationBase: string;
    savingsPercentage: number;
    tithePercentage: number;
    companyReservePercentage: number;
    personalSalaryPercentage: number;
    operationsPercentage: number;
    salaryWeeklyCap: number;
    monthlyGivingBudget: number;
  };
  financialPosition: {
    cashAtHand: number;
    companyMoney: number;
    personalMoney: number;
    savingsBalance: number;
    reservedForExpenses: number;
    availableToSpend: number;
    totalTithePaid: number;
    companyInflow: number;
    companyOutflow: number;
  };
  weeklyDiscipline: {
    weekId: string;
    daysRemainingInWeek: number;
    status: string;
    requiredActions: string[];
    checklistProgress: Record<string, boolean>;
  };
  metrics: {
    today: {
      receivedToday: number;
      spentToday: number;
      jobsCompletedToday: number;
      upcomingBookingsCount: number;
    };
    thisMonth: {
      totalIncome: number;
      totalCompanyExpenses: number;
      totalPersonalExpenses: number;
      totalSavings: number;
      totalTithes: number;
      totalProductionCosts: number;
      totalTransportCosts: number;
      totalHiredLabourCosts: number;
      totalProfit: number;
      totalClientBalancesPending: number;
    };
  };
  jobsSummary: {
    totalJobs: number;
    pendingOrActiveJobs: Array<{
      id: string;
      clientName: string;
      clientPhone: string;
      serviceName: string;
      agreedPrice: number;
      amountPaid: number;
      balanceRemaining: number;
      paymentStatus: string;
      status: string;
      jobDate: string;
      directCostsTotal: number;
    }>;
    recentCompletedJobs: Array<{
      id: string;
      clientName: string;
      serviceName: string;
      agreedPrice: number;
      amountPaid: number;
      balanceRemaining: number;
      paymentStatus: string;
    }>;
  };
  labourAndWorkers: {
    activeWorkersCount: number;
    unpaidWorkerLiabilitiesTotal: number;
    unpaidPaymentsList: Array<{
      workerName: string;
      jobName?: string;
      agreedPay: number;
      amountPaid: number;
      balanceRemaining: number;
      dateWorked: string;
    }>;
    workersRoster: Array<{
      name: string;
      role: string;
      dailyAgreedPay: number;
      active: boolean;
    }>;
  };
  budgetsAndExpenses: {
    fixedBudgets: Array<{
      name: string;
      category: string;
      monthlyLimit: number;
      spentThisMonth: number;
      utilizationPercent: number;
    }>;
  };
  givingEngine: {
    monthlyBudget: number;
    totalGivenThisMonth: number;
    remainingBudget: number;
    recentRequests: Array<{
      personName: string;
      amountRequested: number;
      recommendedAmount: number;
      amountGiven: number;
      decision: string;
      reason: string;
      priority: string;
    }>;
  };
  recentLedgerEntries: Array<{
    date: string;
    amount: number;
    type: string;
    account: string;
    category: string;
    description: string;
  }>;
  userProfile?: {
    displayName: string;
    email: string;
  };
  clientsDirectory?: Array<{
    id: string;
    name: string;
    phone: string;
    organization?: string;
    notes?: string;
  }>;
  recurringClients?: Array<{
    clientName: string;
    monthlyAmount: number;
    dueDay: number;
    paidThisMonth: number;
    isOverdue: boolean;
    lastPaymentDate?: string;
  }>;
  scheduledActivities?: Array<{
    title: string;
    date: string;
    time?: string;
    priority: string;
    status: string;
  }>;
  activeNotifications?: Array<{
    title: string;
    message: string;
    severity: string;
    date: string;
  }>;
  weeklyClosesHistory?: Array<{
    weekNumber: number;
    year: number;
    status: string;
    savingsDeposited: number;
    tithePaid: number;
    salaryTransferred: number;
    isOverridden?: boolean;
    overrideReason?: string;
    carryForwardSavings?: number;
    carryForwardTithe?: number;
  }>;
}

export function compileFinancialSnapshot(appContext: any): FinancialSnapshotPayload {
  const {
    settings,
    financialPosition,
    weeklyStatus,
    currentWeekInfo,
    todaySummary,
    thisMonthSummary,
    jobs = [],
    workers = [],
    workerPayments = [],
    fixedBudgets = [],
    givingRequests = [],
    ledger = [],
    clients = [],
    recurringClients = [],
    activities = [],
    notifications = [],
    weeklyCloses = [],
    currentUser = null,
  } = appContext;

  const unpaidWorkerRecords = workerPayments.filter((p: any) => !p.isPaid || p.balanceRemaining > 0);
  const totalUnpaidWorkers = unpaidWorkerRecords.reduce((acc: number, curr: any) => acc + (curr.balanceRemaining || 0), 0);

  const pendingOrActiveJobs = jobs
    .filter((j: any) => j.status !== 'completed' && j.status !== 'cancelled')
    .map((j: any) => ({
      id: j.id,
      clientName: j.clientName,
      clientPhone: j.clientPhone,
      serviceName: j.serviceName,
      agreedPrice: j.agreedPrice,
      amountPaid: j.amountPaid,
      balanceRemaining: j.balanceRemaining,
      paymentStatus: j.paymentStatus,
      status: j.status,
      jobDate: j.jobDate,
      directCostsTotal: (j.directCosts || []).reduce((acc: number, c: any) => acc + (c.amount || 0), 0),
    }));

  const recentCompletedJobs = jobs
    .filter((j: any) => j.status === 'completed')
    .slice(0, 5)
    .map((j: any) => ({
      id: j.id,
      clientName: j.clientName,
      serviceName: j.serviceName,
      agreedPrice: j.agreedPrice,
      amountPaid: j.amountPaid,
      balanceRemaining: j.balanceRemaining,
      paymentStatus: j.paymentStatus,
    }));

  const totalGivenThisMonth = givingRequests.reduce((acc: number, curr: any) => acc + (curr.amountGiven || 0), 0);

  return {
    asOf: new Date().toISOString(),
    settings: {
      currency: settings?.currency || 'KES',
      currencySymbol: settings?.currencySymbol || 'KES',
      allocationBase: settings?.allocationBase || 'gross_income',
      savingsPercentage: settings?.savingsPercentage || 10,
      tithePercentage: settings?.tithePercentage || 10,
      companyReservePercentage: settings?.companyReservePercentage || 20,
      personalSalaryPercentage: settings?.personalSalaryPercentage || 30,
      operationsPercentage: settings?.operationsPercentage || 30,
      salaryWeeklyCap: settings?.salaryWeeklyCap || 15000,
      monthlyGivingBudget: settings?.monthlyGivingBudget || 2000,
    },
    financialPosition: {
      cashAtHand: (financialPosition?.companyMoney || 0) + (financialPosition?.personalMoney || 0),
      companyMoney: financialPosition?.companyMoney || 0,
      personalMoney: financialPosition?.personalMoney || 0,
      savingsBalance: financialPosition?.savingsBalance || 0,
      reservedForExpenses: financialPosition?.reservedForExpenses || 0,
      availableToSpend: financialPosition?.availableToSpend || 0,
      totalTithePaid: financialPosition?.totalTithePaid || 0,
      companyInflow: financialPosition?.companyInflow || 0,
      companyOutflow: financialPosition?.companyOutflow || 0,
    },
    weeklyDiscipline: {
      weekId: currentWeekInfo?.weekId || '',
      daysRemainingInWeek: currentWeekInfo?.daysRemaining || 0,
      status: weeklyStatus?.status || 'WEEK_NOT_CLOSED',
      requiredActions: weeklyStatus?.requiredActions || [],
      checklistProgress: weeklyStatus?.checklist || {},
    },
    metrics: {
      today: {
        receivedToday: todaySummary?.receivedToday || 0,
        spentToday: todaySummary?.spentToday || 0,
        jobsCompletedToday: todaySummary?.jobsCompletedToday || 0,
        upcomingBookingsCount: todaySummary?.upcomingBookingsCount || 0,
      },
      thisMonth: {
        totalIncome: thisMonthSummary?.totalIncome || 0,
        totalCompanyExpenses: thisMonthSummary?.totalCompanyExpenses || 0,
        totalPersonalExpenses: thisMonthSummary?.totalPersonalExpenses || 0,
        totalSavings: thisMonthSummary?.totalSavings || 0,
        totalTithes: thisMonthSummary?.totalTithes || 0,
        totalProductionCosts: thisMonthSummary?.totalProductionCosts || 0,
        totalTransportCosts: thisMonthSummary?.totalTransportCosts || 0,
        totalHiredLabourCosts: thisMonthSummary?.totalHiredLabourCosts || 0,
        totalProfit: thisMonthSummary?.totalProfit || 0,
        totalClientBalancesPending: thisMonthSummary?.totalClientBalancesPending || 0,
      },
    },
    jobsSummary: {
      totalJobs: jobs.length,
      pendingOrActiveJobs,
      recentCompletedJobs,
    },
    labourAndWorkers: {
      activeWorkersCount: workers.filter((w: any) => w.active).length,
      unpaidWorkerLiabilitiesTotal: totalUnpaidWorkers,
      unpaidPaymentsList: unpaidWorkerRecords.map((p: any) => ({
        workerName: p.workerName,
        jobName: p.jobName,
        agreedPay: p.agreedPay,
        amountPaid: p.amountPaid,
        balanceRemaining: p.balanceRemaining,
        dateWorked: p.dateWorked,
      })),
      workersRoster: workers.map((w: any) => ({
        name: w.name,
        role: w.role,
        dailyAgreedPay: w.dailyAgreedPay,
        active: w.active,
      })),
    },
    budgetsAndExpenses: {
      fixedBudgets: fixedBudgets.map((b: any) => ({
        name: b.name,
        category: b.category,
        monthlyLimit: b.monthlyLimit,
        spentThisMonth: b.spentThisMonth,
        utilizationPercent: b.monthlyLimit > 0 ? Math.round((b.spentThisMonth / b.monthlyLimit) * 100) : 0,
      })),
    },
    givingEngine: {
      monthlyBudget: settings?.monthlyGivingBudget || 2000,
      totalGivenThisMonth,
      remainingBudget: Math.max(0, (settings?.monthlyGivingBudget || 2000) - totalGivenThisMonth),
      recentRequests: givingRequests.slice(0, 5).map((g: any) => ({
        personName: g.personName,
        amountRequested: g.amountRequested,
        recommendedAmount: g.recommendedAmount,
        amountGiven: g.amountGiven,
        decision: g.decision,
        reason: g.reason,
        priority: g.priority,
      })),
    },
    recentLedgerEntries: ledger.slice(-25).map((l: any) => ({
      date: l.date,
      amount: l.amount,
      type: l.type,
      account: l.account,
      category: l.category,
      description: l.description,
    })),
    userProfile: {
      displayName: currentUser?.displayName || '',
      email: currentUser?.email || '',
    },
    clientsDirectory: clients.slice(0, 15).map((c: any) => ({
      id: c.id,
      name: c.name,
      phone: c.phone,
      organization: c.organization,
      notes: c.notes,
    })),
    recurringClients: recurringClients.map((rc: any) => ({
      clientName: rc.clientName,
      monthlyAmount: rc.monthlyAgreedAmount,
      dueDay: rc.paymentDueDay,
      paidThisMonth: rc.amountPaidThisMonth,
      isOverdue: rc.isOverdue,
      lastPaymentDate: rc.lastPaymentDate,
    })),
    scheduledActivities: activities.slice(0, 10).map((a: any) => ({
      title: a.title,
      date: a.date,
      time: a.time,
      priority: a.priority,
      status: a.status,
    })),
    activeNotifications: notifications.filter((n: any) => !n.read).map((n: any) => ({
      title: n.title,
      message: n.message,
      severity: n.severity,
      date: n.date,
    })),
    weeklyClosesHistory: weeklyCloses.slice(-4).map((w: any) => ({
      weekNumber: w.weekNumber,
      year: w.year,
      status: w.status,
      savingsDeposited: w.savingsDeposited,
      tithePaid: w.tithePaid,
      salaryTransferred: w.salaryTransferred,
      isOverridden: w.isOverridden,
      overrideReason: w.overrideReason,
      carryForwardSavings: w.overrideCarryForwardSavings,
      carryForwardTithe: w.overrideCarryForwardTithe,
    })),
  };
}

export async function askKaziAI(
  messages: Array<{ role: 'user' | 'model'; content: string }>,
  appContext: any
): Promise<string> {
  const snapshot = compileFinancialSnapshot(appContext);

  const res = await fetch('/api/ai/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messages,
      appContextData: snapshot,
    }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `Server returned ${res.status}: ${res.statusText}`);
  }

  const data = await res.json();
  return data.reply;
}
