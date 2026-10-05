import {
  SystemSettings,
  Client,
  JobBooking,
  ProductSale,
  RecurringClient,
  DailyWorker,
  WorkerPaymentRecord,
  LedgerEntry,
  FixedExpenseBudget,
  GivingRequest,
  WeeklyCloseRecord,
  ActivityTask,
  NotificationItem
} from '../types';
import { getWeekRange } from './financialEngine';

const STORAGE_KEYS = {
  SETTINGS: 'kazifinance_settings',
  CLIENTS: 'kazifinance_clients',
  JOBS: 'kazifinance_jobs',
  PRODUCTS: 'kazifinance_products',
  RECURRING_CLIENTS: 'kazifinance_recurring_clients',
  WORKERS: 'kazifinance_workers',
  WORKER_PAYMENTS: 'kazifinance_worker_payments',
  LEDGER: 'kazifinance_ledger',
  FIXED_BUDGETS: 'kazifinance_fixed_budgets',
  GIVING_REQUESTS: 'kazifinance_giving_requests',
  WEEKLY_CLOSES: 'kazifinance_weekly_closes',
  ACTIVITIES: 'kazifinance_activities',
  NOTIFICATIONS: 'kazifinance_notifications'
};

export const DEFAULT_SETTINGS: SystemSettings = {
  currency: 'KES',
  currencySymbol: 'KES',
  allocationBase: 'net_profit',
  savingsPercentage: 10,
  tithePercentage: 10,
  companyReservePercentage: 20,
  personalSalaryPercentage: 30,
  operationsPercentage: 30,
  salaryRuleType: 'percentage',
  salaryProfitPercentage: 40,
  salaryWeeklyCap: 15000,
  monthlyGivingBudget: 2000,
  maxMonthlyPeopleSupported: 4,
  weekStartDay: 1, // Monday
  titheDay: 6      // Saturday
};

// Seed initial realistic data for demonstration
export function generateSeedData() {
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  const weekInfo = getWeekRange(today, 1);

  // Clients
  const clients: Client[] = [
    {
      id: 'c1',
      name: 'Wangari Kamau',
      phone: '+254 712 345 678',
      email: 'wangari@safariadventures.co.ke',
      organization: 'Safari Adventures Kenya',
      notes: 'Corporate client for annual gala & safari tours promo',
      createdAt: '2026-09-10'
    },
    {
      id: 'c2',
      name: 'Brian Ochieng',
      phone: '+254 723 889 123',
      email: 'brian@apextech.co.ke',
      organization: 'Apex Tech Solutions',
      notes: 'Monthly retainer for product launches and developer interviews',
      createdAt: '2026-09-15'
    },
    {
      id: 'c3',
      name: 'Dr. Amina Abdi',
      phone: '+254 733 445 566',
      email: 'amina@wellnesshub.or.ke',
      organization: 'The Wellness Hub',
      notes: 'Brand documentary and podcast studio production',
      createdAt: '2026-09-22'
    },
    {
      id: 'c4',
      name: 'Dennis Mwangi',
      phone: '+254 700 112 233',
      organization: 'Mwangi Wedding & Events',
      notes: 'Wedding photography & drone highlight video',
      createdAt: '2026-09-28'
    }
  ];

  // Jobs
  const jobs: JobBooking[] = [
    {
      id: 'job-1',
      clientId: 'c1',
      clientName: 'Wangari Kamau',
      clientPhone: '+254 712 345 678',
      serviceName: 'Corporate Gala Videography & Livestream',
      bookingDate: '2026-09-25',
      jobDate: todayStr,
      agreedPrice: 35000,
      amountPaid: 25000,
      balanceRemaining: 10000,
      paymentStatus: 'partially_paid',
      status: 'in_progress',
      notes: 'Deposit paid via M-Pesa. Balance upon final edit delivery.',
      createdAt: '2026-09-25',
      directCosts: [
        {
          id: 'cost-1',
          jobId: 'job-1',
          category: 'transport',
          description: 'Uber transport to Trademark Hotel Gigiri & back',
          amount: 2500,
          date: todayStr,
          paymentMethod: 'M-Pesa',
          paymentReference: 'QKD99214L8',
          isPaid: true
        },
        {
          id: 'cost-2',
          jobId: 'job-1',
          category: 'hired_labour',
          description: 'Second Camera Operator (Joseph Otieno)',
          amount: 5000,
          date: todayStr,
          workerId: 'w1',
          workerName: 'Joseph Otieno',
          paymentMethod: 'M-Pesa',
          paymentReference: 'QKD99288M1',
          isPaid: true
        },
        {
          id: 'cost-3',
          jobId: 'job-1',
          category: 'equipment',
          description: 'Wireless audio transmitter rental',
          amount: 3000,
          date: todayStr,
          paymentMethod: 'Cash',
          paymentReference: 'REC-4412',
          isPaid: true
        }
      ]
    },
    {
      id: 'job-2',
      clientId: 'c4',
      clientName: 'Dennis Mwangi',
      clientPhone: '+254 700 112 233',
      serviceName: 'Naivasha Destination Wedding Photoshoot',
      bookingDate: '2026-09-28',
      jobDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
      agreedPrice: 45000,
      amountPaid: 20000,
      balanceRemaining: 25000,
      paymentStatus: 'deposit_paid',
      status: 'pending',
      notes: 'Naivasha Enashipai Resort. Transport arrangements confirmed.',
      createdAt: '2026-09-28',
      directCosts: [
        {
          id: 'cost-4',
          jobId: 'job-2',
          category: 'transport',
          description: 'Fuel to Naivasha & highway toll',
          amount: 4000,
          date: todayStr,
          paymentMethod: 'M-Pesa',
          paymentReference: 'QKD88390X2',
          isPaid: true
        }
      ]
    },
    {
      id: 'job-3',
      clientId: 'c3',
      clientName: 'Dr. Amina Abdi',
      clientPhone: '+254 733 445 566',
      serviceName: 'Podcast Studio Setup & 3-Episode Recording',
      bookingDate: '2026-09-18',
      jobDate: '2026-09-29',
      agreedPrice: 28000,
      amountPaid: 28000,
      balanceRemaining: 0,
      paymentStatus: 'fully_paid',
      status: 'completed',
      notes: 'Client fully cleared invoice. Files delivered via Google Drive.',
      createdAt: '2026-09-18',
      directCosts: [
        {
          id: 'cost-5',
          jobId: 'job-3',
          category: 'production',
          description: 'Acoustic foam tiles and cables',
          amount: 4500,
          date: '2026-09-29',
          paymentMethod: 'M-Pesa',
          paymentReference: 'QKC12994Z5',
          isPaid: true
        },
        {
          id: 'cost-6',
          jobId: 'job-3',
          category: 'hired_labour',
          description: 'Sound assistant (Mercy Cherono)',
          amount: 3500,
          date: '2026-09-29',
          workerId: 'w2',
          workerName: 'Mercy Cherono',
          paymentMethod: 'M-Pesa',
          paymentReference: 'QKC12999A9',
          isPaid: true
        }
      ]
    }
  ];

  // Workers
  const workers: DailyWorker[] = [
    {
      id: 'w1',
      name: 'Joseph Otieno',
      phone: '+254 711 998 877',
      role: 'Camera Operator / Drone Pilot',
      dailyAgreedPay: 5000,
      active: true
    },
    {
      id: 'w2',
      name: 'Mercy Cherono',
      phone: '+254 722 334 455',
      role: 'Sound Engineer & Boom Op',
      dailyAgreedPay: 3500,
      active: true
    },
    {
      id: 'w3',
      name: 'Kevin Mutua',
      phone: '+254 740 667 889',
      role: 'Lighting Tech & Production Runner',
      dailyAgreedPay: 2500,
      active: true
    }
  ];

  // Worker Payment Records
  const workerPayments: WorkerPaymentRecord[] = [
    {
      id: 'wp-1',
      workerId: 'w1',
      workerName: 'Joseph Otieno',
      jobId: 'job-1',
      jobName: 'Corporate Gala Videography',
      dateWorked: todayStr,
      agreedPay: 5000,
      amountPaid: 5000,
      balanceRemaining: 0,
      paymentMethod: 'M-Pesa',
      paymentReference: 'QKD99288M1',
      isPaid: true,
      createdAt: todayStr
    },
    {
      id: 'wp-2',
      workerId: 'w2',
      workerName: 'Mercy Cherono',
      jobId: 'job-3',
      jobName: 'Podcast Studio Setup',
      dateWorked: '2026-09-29',
      agreedPay: 3500,
      amountPaid: 3500,
      balanceRemaining: 0,
      paymentMethod: 'M-Pesa',
      paymentReference: 'QKC12999A9',
      isPaid: true,
      createdAt: '2026-09-29'
    },
    {
      id: 'wp-3',
      workerId: 'w3',
      workerName: 'Kevin Mutua',
      jobId: 'job-1',
      jobName: 'Corporate Gala Videography',
      dateWorked: todayStr,
      agreedPay: 2500,
      amountPaid: 0,
      balanceRemaining: 2500,
      paymentMethod: 'Pending M-Pesa',
      notes: 'End-of-day wrap payment pending wrap-up',
      isPaid: false,
      createdAt: todayStr
    }
  ];

  // Product Sales
  const products: ProductSale[] = [
    {
      id: 'prod-1',
      productName: 'Custom Hardcover Wedding Photo Album (12x12)',
      sellingPrice: 12000,
      quantity: 1,
      totalSalesAmount: 12000,
      productCost: 5500,
      transportCost: 500,
      otherCosts: 300,
      totalCost: 6300,
      netProfit: 5700,
      date: todayStr,
      customerName: 'Faith & Victor',
      notes: 'Printed at Nairobi Printing Press, delivered via Wells Fargo'
    },
    {
      id: 'prod-2',
      productName: 'SanDisk Extreme Pro 128GB SD Card (Pre-loaded)',
      sellingPrice: 4500,
      quantity: 2,
      totalSalesAmount: 9000,
      productCost: 5600,
      transportCost: 400,
      otherCosts: 0,
      totalCost: 6000,
      netProfit: 3000,
      date: '2026-09-27',
      customerName: 'Kipchoge Media',
      notes: 'Direct client sale'
    }
  ];

  // Recurring Clients
  const recurringClients: RecurringClient[] = [
    {
      id: 'rc-1',
      clientName: 'Brian Ochieng (Apex Tech)',
      phone: '+254 723 889 123',
      serviceProvided: 'Monthly Social Media Video Retainer (4 Reels + 2 Interviews)',
      monthlyAgreedAmount: 30000,
      paymentDueDay: 5,
      lastPaymentDate: '2026-09-05',
      amountPaidThisMonth: 0,
      isOverdue: false,
      notes: 'Invoiced on 1st, payment expected by 5th'
    },
    {
      id: 'rc-2',
      clientName: 'The Wellness Hub (Dr. Amina)',
      phone: '+254 733 445 566',
      serviceProvided: 'Monthly Audio Mastering & Podcast Host Maintenance',
      monthlyAgreedAmount: 15000,
      paymentDueDay: 1,
      lastPaymentDate: '2026-09-01',
      amountPaidThisMonth: 15000,
      isOverdue: false,
      notes: 'Cleared for October'
    }
  ];

  // Fixed Monthly Expense Budgets
  const fixedBudgets: FixedExpenseBudget[] = [
    {
      id: 'fb-1',
      name: 'Studio Office Rent (Kilimani)',
      category: 'Rent',
      monthlyLimit: 25000,
      spentThisMonth: 25000,
      dueDay: 5,
      notes: 'Paid via Stanbic Bank on the 1st of every month'
    },
    {
      id: 'fb-2',
      name: 'Fibre Internet (Safaricom Home/Biz)',
      category: 'Internet',
      monthlyLimit: 5000,
      spentThisMonth: 5000,
      dueDay: 10,
      notes: '50 Mbps uncapped fibre'
    },
    {
      id: 'fb-3',
      name: 'Adobe Creative Cloud + Cloud Storage',
      category: 'Software',
      monthlyLimit: 7500,
      spentThisMonth: 0,
      dueDay: 18,
      notes: 'USD subscription billed to card'
    },
    {
      id: 'fb-4',
      name: 'Personal Household Food & Groceries',
      category: 'Food',
      monthlyLimit: 18000,
      spentThisMonth: 4200,
      dueDay: 30,
      notes: 'Weekly supermarket & fresh market runs'
    },
    {
      id: 'fb-5',
      name: 'Personal & Studio Transport Fuel/Uber',
      category: 'Transport',
      monthlyLimit: 12000,
      spentThisMonth: 3800,
      dueDay: 30,
      notes: 'Monthly commute & errands limit'
    }
  ];

  // Ledger Entries
  const ledger: LedgerEntry[] = [
    // Previous week income & company transactions
    {
      id: 'led-1',
      date: '2026-09-29',
      amount: 28000,
      type: 'income_job',
      account: 'company',
      bucket: 'company',
      category: 'Client Job',
      description: 'Payment from Dr. Amina Abdi for Podcast Studio Setup',
      paymentMethod: 'Bank Transfer',
      referenceCode: 'FT2627289901',
      relatedJobId: 'job-3',
      createdAt: '2026-09-29'
    },
    {
      id: 'led-2',
      date: '2026-09-29',
      amount: 4500,
      type: 'expense_job_cost',
      account: 'company',
      bucket: 'company',
      category: 'Production Cost',
      description: 'Acoustic tiles & studio wiring for job-3',
      paymentMethod: 'M-Pesa',
      referenceCode: 'QKC12994Z5',
      relatedJobId: 'job-3',
      createdAt: '2026-09-29'
    },
    {
      id: 'led-3',
      date: '2026-09-29',
      amount: 3500,
      type: 'expense_daily_worker',
      account: 'company',
      bucket: 'company',
      category: 'Hired Labour',
      description: 'Paid Mercy Cherono for Podcast Studio sound tech',
      paymentMethod: 'M-Pesa',
      referenceCode: 'QKC12999A9',
      relatedJobId: 'job-3',
      createdAt: '2026-09-29'
    },
    // Today's job deposit received
    {
      id: 'led-4',
      date: todayStr,
      amount: 25000,
      type: 'income_job',
      account: 'company',
      bucket: 'company',
      category: 'Client Job',
      description: 'Deposit payment from Wangari Kamau (Corporate Gala)',
      paymentMethod: 'M-Pesa',
      referenceCode: 'QKD99211A4',
      relatedJobId: 'job-1',
      createdAt: todayStr
    },
    // Direct job costs today
    {
      id: 'led-5',
      date: todayStr,
      amount: 2500,
      type: 'expense_job_cost',
      account: 'company',
      bucket: 'company',
      category: 'Transport',
      description: 'Uber transport to Gigiri Trademark Hotel',
      paymentMethod: 'M-Pesa',
      referenceCode: 'QKD99214L8',
      relatedJobId: 'job-1',
      createdAt: todayStr
    },
    {
      id: 'led-6',
      date: todayStr,
      amount: 5000,
      type: 'expense_daily_worker',
      account: 'company',
      bucket: 'company',
      category: 'Hired Labour',
      description: 'Paid Joseph Otieno (2nd camera)',
      paymentMethod: 'M-Pesa',
      referenceCode: 'QKD99288M1',
      relatedJobId: 'job-1',
      createdAt: todayStr
    },
    {
      id: 'led-7',
      date: todayStr,
      amount: 3000,
      type: 'expense_job_cost',
      account: 'company',
      bucket: 'company',
      category: 'Equipment Rental',
      description: 'Wireless audio transmitter rental',
      paymentMethod: 'Cash',
      referenceCode: 'REC-4412',
      relatedJobId: 'job-1',
      createdAt: todayStr
    },
    // Product sale today
    {
      id: 'led-8',
      date: todayStr,
      amount: 12000,
      type: 'income_product',
      account: 'company',
      bucket: 'company',
      category: 'Product Sale',
      description: 'Sold Wedding Photo Album to Faith & Victor',
      paymentMethod: 'M-Pesa',
      referenceCode: 'QKD99330X8',
      createdAt: todayStr
    },
    {
      id: 'led-9',
      date: todayStr,
      amount: 6300,
      type: 'expense_company_op',
      account: 'company',
      bucket: 'company',
      category: 'Production & Delivery',
      description: 'Photo album print and delivery charges',
      paymentMethod: 'M-Pesa',
      referenceCode: 'QKD99335T1',
      createdAt: todayStr
    },
    // Owner salary transfer from company to personal
    {
      id: 'led-10',
      date: '2026-09-30',
      amount: 15000,
      type: 'transfer_owner_salary',
      account: 'company',
      bucket: 'company',
      category: 'Owner Salary',
      description: 'Weekly owner withdrawal to personal account',
      paymentMethod: 'Bank Transfer',
      referenceCode: 'OWN-W39-01',
      createdAt: '2026-09-30'
    },
    // Personal salary entry
    {
      id: 'led-11',
      date: '2026-09-30',
      amount: 15000,
      type: 'transfer_owner_salary',
      account: 'personal',
      bucket: 'personal',
      category: 'Owner Salary',
      description: 'Owner salary received in personal account',
      paymentMethod: 'Bank Transfer',
      referenceCode: 'OWN-W39-01',
      createdAt: '2026-09-30'
    },
    // Personal daily expenses
    {
      id: 'led-12',
      date: todayStr,
      amount: 350,
      type: 'expense_personal',
      account: 'personal',
      bucket: 'personal',
      category: 'Lunch',
      description: 'Lunch at Java House Gigiri',
      paymentMethod: 'M-Pesa',
      referenceCode: 'QKD99401P5',
      createdAt: todayStr
    },
    {
      id: 'led-13',
      date: todayStr,
      amount: 200,
      type: 'expense_personal',
      account: 'personal',
      bucket: 'personal',
      category: 'Airtime/Data',
      description: 'Safaricom Tunukiwa airtime',
      paymentMethod: 'M-Pesa',
      referenceCode: 'QKD99450A2',
      createdAt: todayStr
    }
  ];

  // Smart Giving Requests
  const givingRequests: GivingRequest[] = [
    {
      id: 'gv-1',
      personName: 'Uncle Peter',
      phone: '+254 721 556 778',
      date: '2026-09-28',
      amountRequested: 1000,
      reason: 'Urgent prescription refill for blood pressure medicine',
      priority: 'urgent',
      recommendedAmount: 800,
      amountGiven: 800,
      decision: 'give_recommended',
      notes: 'Sent via M-Pesa. Confirmed receipt with pharmacy.',
      monthKey: '2026-09',
      referenceCode: 'QKA88211M9'
    }
  ];

  // Weekly Closes (Previous Week Completed)
  const weeklyCloses: WeeklyCloseRecord[] = [
    {
      id: 'wc-39',
      weekNumber: 39,
      year: 2026,
      startDate: '2026-09-21',
      endDate: '2026-09-27',
      status: 'completed',
      totalIncome: 62000,
      totalDirectCosts: 18000,
      totalCompanyExpenses: 4000,
      netBusinessProfit: 40000,
      savingsExpected: 4000,
      savingsDeposited: 4000,
      savingsAccount: 'KCB Bank Goal Account 118492023',
      savingsReference: 'KCB-DEP-99214',
      savingsDate: '2026-09-26',
      titheExpected: 4000,
      tithePaid: 4000,
      tithePaymentMethod: 'M-Pesa Paybill',
      titheReference: 'QKZ772199B',
      titheDate: '2026-09-26',
      titheVerified: true,
      salaryRecommended: 15000,
      salaryTransferred: 15000,
      salaryReference: 'OWN-W39-01',
      salaryDate: '2026-09-27',
      companyRetained: 17000,
      checklist: {
        allIncomeRecorded: true,
        allJobCostsRecorded: true,
        allWorkersPaid: true,
        savingsCompleted: true,
        titheVerified: true,
        salaryTransferred: true,
        weeklySummaryReviewed: true
      },
      closedAt: '2026-09-27T20:15:00Z'
    },
    // Current week (Open / In Progress)
    {
      id: `wc-${weekInfo.weekNumber}`,
      weekNumber: weekInfo.weekNumber,
      year: weekInfo.year,
      startDate: weekInfo.startDate,
      endDate: weekInfo.endDate,
      status: 'action_required',
      totalIncome: 37000,
      totalDirectCosts: 10500,
      totalCompanyExpenses: 6300,
      netBusinessProfit: 20200,
      savingsExpected: 2020,
      savingsDeposited: 0,
      titheExpected: 2020,
      tithePaid: 0,
      titheVerified: false,
      salaryRecommended: 8080,
      salaryTransferred: 0,
      companyRetained: 8080,
      checklist: {
        allIncomeRecorded: true,
        allJobCostsRecorded: true,
        allWorkersPaid: false, // Kevin Mutua is unpaid today
        savingsCompleted: false,
        titheVerified: false,
        salaryTransferred: false,
        weeklySummaryReviewed: false
      }
    }
  ];

  // Activities & Tasks
  const activities: ActivityTask[] = [
    {
      id: 'act-1',
      title: 'Wrap Trademark Hotel Livestream footage & backup to SSD',
      date: todayStr,
      time: '18:00',
      priority: 'high',
      status: 'in_progress',
      relatedJobId: 'job-1',
      relatedName: 'Safari Adventures Gala'
    },
    {
      id: 'act-2',
      title: 'Pay daily runner Kevin Mutua via M-Pesa',
      date: todayStr,
      time: '19:30',
      priority: 'high',
      status: 'pending',
      notes: 'End-of-day labour clearance'
    },
    {
      id: 'act-3',
      title: 'Inspect drone batteries & camera sensors for Naivasha shoot',
      date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
      time: '10:00',
      priority: 'medium',
      status: 'pending',
      relatedJobId: 'job-2',
      relatedName: 'Naivasha Wedding'
    },
    {
      id: 'act-4',
      title: 'Send monthly retainer invoice to Apex Tech (Brian)',
      date: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
      time: '09:00',
      priority: 'medium',
      status: 'pending',
      relatedClientId: 'c2',
      relatedName: 'Brian Ochieng'
    }
  ];

  // Notifications
  const notifications: NotificationItem[] = [
    {
      id: 'notif-1',
      type: 'unpaid_worker',
      title: 'End-of-Day Labour Payment Pending',
      message: 'Kevin Mutua has not been paid for today’s Gala shoot (KES 2,500 due).',
      severity: 'critical',
      date: todayStr,
      read: false
    },
    {
      id: 'notif-2',
      type: 'upcoming_job',
      title: 'Upcoming Wedding Job in 2 Days',
      message: 'Dennis Mwangi Naivasha destination shoot on Saturday.',
      severity: 'info',
      date: todayStr,
      read: false
    }
  ];

  return {
    settings: DEFAULT_SETTINGS,
    clients,
    jobs,
    products,
    recurringClients,
    workers,
    workerPayments,
    ledger,
    fixedBudgets,
    givingRequests,
    weeklyCloses,
    activities,
    notifications
  };
}

export function loadFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return defaultValue;
    return JSON.parse(raw);
  } catch (e) {
    console.error(`Error loading key ${key}:`, e);
    return defaultValue;
  }
}

export function saveToStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error(`Error saving key ${key}:`, e);
  }
}

export function initializeAppState() {
  const existingSettings = localStorage.getItem(STORAGE_KEYS.SETTINGS);
  if (!existingSettings) {
    const seed = generateSeedData();
    saveToStorage(STORAGE_KEYS.SETTINGS, seed.settings);
    saveToStorage(STORAGE_KEYS.CLIENTS, seed.clients);
    saveToStorage(STORAGE_KEYS.JOBS, seed.jobs);
    saveToStorage(STORAGE_KEYS.PRODUCTS, seed.products);
    saveToStorage(STORAGE_KEYS.RECURRING_CLIENTS, seed.recurringClients);
    saveToStorage(STORAGE_KEYS.WORKERS, seed.workers);
    saveToStorage(STORAGE_KEYS.WORKER_PAYMENTS, seed.workerPayments);
    saveToStorage(STORAGE_KEYS.LEDGER, seed.ledger);
    saveToStorage(STORAGE_KEYS.FIXED_BUDGETS, seed.fixedBudgets);
    saveToStorage(STORAGE_KEYS.GIVING_REQUESTS, seed.givingRequests);
    saveToStorage(STORAGE_KEYS.WEEKLY_CLOSES, seed.weeklyCloses);
    saveToStorage(STORAGE_KEYS.ACTIVITIES, seed.activities);
    saveToStorage(STORAGE_KEYS.NOTIFICATIONS, seed.notifications);
  }
}

export { STORAGE_KEYS };
