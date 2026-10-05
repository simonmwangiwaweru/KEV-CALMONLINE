/**
 * Core Types & Interfaces for KaziFinance
 * Business, Personal Finance & Activity Management System
 */

export type CurrencyCode = 'KES' | 'USD' | 'EUR' | 'GBP' | 'TZS' | 'UGX' | 'ZAR';

export type PaymentStatus = 'not_paid' | 'deposit_paid' | 'partially_paid' | 'fully_paid';
export type JobStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';
export type AccountType = 'company' | 'personal';
export type PriorityLevel = 'urgent' | 'important' | 'normal' | 'not_important';
export type TaskPriority = 'high' | 'medium' | 'low';
export type TaskStatus = 'pending' | 'in_progress' | 'completed';
export type WeekCloseStatus = 'open' | 'action_required' | 'completed' | 'overridden';

export interface SystemSettings {
  currency: CurrencyCode;
  currencySymbol: string;
  // Percentage allocation for incoming revenue
  allocationBase: 'gross_income' | 'net_profit';
  savingsPercentage: number; // e.g. 10%
  tithePercentage: number;   // e.g. 10%
  companyReservePercentage: number; // e.g. 20%
  personalSalaryPercentage: number; // e.g. 30%
  operationsPercentage: number;     // e.g. 30%
  // Salary rules
  salaryRuleType: 'percentage' | 'cap' | 'custom';
  salaryProfitPercentage: number; // e.g. 40%
  salaryWeeklyCap: number;        // e.g. 15,000 KES
  // Giving system budget
  monthlyGivingBudget: number;    // e.g. 2,000 KES
  maxMonthlyPeopleSupported: number; // e.g. 4 people
  // Week settings
  weekStartDay: 0 | 1; // 0 = Sunday, 1 = Monday
  titheDay: 6;         // Saturday (6)
}

export interface Client {
  id: string;
  name: string;
  phone: string;
  email?: string;
  organization?: string;
  notes?: string;
  createdAt: string;
}

export interface JobCostItem {
  id: string;
  jobId: string;
  category: 'transport' | 'hired_labour' | 'equipment' | 'production' | 'other';
  description: string;
  amount: number;
  date: string;
  workerId?: string;
  workerName?: string;
  paymentMethod: string;
  paymentReference?: string;
  isPaid: boolean;
}

export interface JobBooking {
  id: string;
  clientId: string;
  clientName: string;
  clientPhone: string;
  serviceName: string;
  bookingDate: string;
  jobDate: string;
  agreedPrice: number;
  amountPaid: number;
  balanceRemaining: number;
  paymentStatus: PaymentStatus;
  status: JobStatus;
  directCosts: JobCostItem[];
  notes?: string;
  createdAt: string;
}

export interface ProductSale {
  id: string;
  productName: string;
  sellingPrice: number;
  quantity: number;
  totalSalesAmount: number;
  productCost: number;
  transportCost: number;
  otherCosts: number;
  totalCost: number;
  netProfit: number;
  date: string;
  customerName?: string;
  notes?: string;
}

export interface RecurringClient {
  id: string;
  clientName: string;
  phone: string;
  serviceProvided: string;
  monthlyAgreedAmount: number;
  paymentDueDay: number; // 1-31
  lastPaymentDate?: string;
  amountPaidThisMonth: number;
  isOverdue: boolean;
  notes?: string;
}

export interface DailyWorker {
  id: string;
  name: string;
  phone?: string;
  role: string;
  dailyAgreedPay: number;
  active: boolean;
}

export interface WorkerPaymentRecord {
  id: string;
  workerId: string;
  workerName: string;
  jobId?: string;
  jobName?: string;
  dateWorked: string;
  agreedPay: number;
  amountPaid: number;
  balanceRemaining: number;
  paymentMethod: string;
  paymentReference?: string;
  notes?: string;
  isPaid: boolean;
  createdAt: string;
}

export type LedgerEntryType = 
  | 'income_job'
  | 'income_product'
  | 'income_recurring'
  | 'expense_job_cost'
  | 'expense_daily_worker'
  | 'expense_company_op'
  | 'expense_personal'
  | 'transfer_owner_salary'
  | 'transfer_savings_deposit'
  | 'payment_tithe'
  | 'expense_giving';

export interface LedgerEntry {
  id: string;
  date: string;
  amount: number;
  type: LedgerEntryType;
  account: AccountType; // company or personal
  bucket: 'company' | 'personal' | 'savings' | 'tithe' | 'giving' | 'reserve';
  category: string;
  description: string;
  paymentMethod: string;
  referenceCode?: string;
  relatedJobId?: string;
  relatedClientId?: string;
  notes?: string;
  createdAt: string;
}

export interface FixedExpenseBudget {
  id: string;
  name: string;
  category: string;
  monthlyLimit: number;
  spentThisMonth: number;
  dueDay: number;
  notes?: string;
}

export interface GivingRequest {
  id: string;
  personName: string;
  phone?: string;
  date: string;
  amountRequested: number;
  reason: string;
  priority: PriorityLevel;
  recommendedAmount: number;
  amountGiven: number;
  decision: 'give_recommended' | 'adjust' | 'give_full' | 'do_not_give';
  notes?: string;
  monthKey: string; // e.g. "2026-10"
  referenceCode?: string;
}

export interface WeeklyCloseRecord {
  id: string;
  weekNumber: number;
  year: number;
  startDate: string;
  endDate: string;
  status: WeekCloseStatus;
  
  // Calculated financial metrics
  totalIncome: number;
  totalDirectCosts: number;
  totalCompanyExpenses: number;
  netBusinessProfit: number;
  
  // Savings
  savingsExpected: number;
  savingsDeposited: number;
  savingsAccount?: string;
  savingsReference?: string;
  savingsDate?: string;
  
  // Tithe
  titheExpected: number;
  tithePaid: number;
  tithePaymentMethod?: string;
  titheReference?: string;
  titheDate?: string;
  titheVerified: boolean;
  
  // Salary
  salaryRecommended: number;
  salaryTransferred: number;
  salaryReference?: string;
  salaryDate?: string;
  
  // Retained
  companyRetained: number;
  
  // Checklist verification
  checklist: {
    allIncomeRecorded: boolean;
    allJobCostsRecorded: boolean;
    allWorkersPaid: boolean;
    savingsCompleted: boolean;
    titheVerified: boolean;
    salaryTransferred: boolean;
    weeklySummaryReviewed: boolean;
  };
  
  // Override accountability
  isOverridden?: boolean;
  overrideReason?: string;
  overrideDate?: string;
  overrideCarryForwardSavings?: number;
  overrideCarryForwardTithe?: number;
  closedAt?: string;
}

export interface ActivityTask {
  id: string;
  title: string;
  date: string;
  time?: string;
  priority: TaskPriority;
  status: TaskStatus;
  relatedClientId?: string;
  relatedJobId?: string;
  relatedName?: string;
  notes?: string;
}

export interface NotificationItem {
  id: string;
  type: 'unpaid_worker' | 'saturday_tithe' | 'upcoming_job' | 'unclosed_week' | 'budget_warning' | 'recurring_overdue';
  title: string;
  message: string;
  severity: 'info' | 'warning' | 'critical';
  date: string;
  read: boolean;
  actionUrl?: string;
}
