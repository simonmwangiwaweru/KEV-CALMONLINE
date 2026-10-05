import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { User } from 'firebase/auth';
import {
  subscribeToAuth,
  loginWithGoogle,
  loginWithEmail,
  registerWithEmail,
  logoutUser,
  saveAllUserDataToFirestore,
  loadUserDataFromFirestore
} from '../services/firebase';
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
  NotificationItem,
  AccountType,
  PriorityLevel,
  PaymentStatus,
  JobStatus
} from '../types';
import {
  STORAGE_KEYS,
  DEFAULT_SETTINGS,
  generateSeedData,
  loadFromStorage,
  saveToStorage,
  initializeAppState
} from '../services/storage';
import {
  calculateFinancialPosition,
  calculatePaymentAllocation,
  calculateGivingRecommendation,
  calculateWeeklyStatus,
  getWeekRange
} from '../services/financialEngine';

interface AppContextType {
  // Data
  settings: SystemSettings;
  clients: Client[];
  jobs: JobBooking[];
  products: ProductSale[];
  recurringClients: RecurringClient[];
  workers: DailyWorker[];
  workerPayments: WorkerPaymentRecord[];
  ledger: LedgerEntry[];
  fixedBudgets: FixedExpenseBudget[];
  givingRequests: GivingRequest[];
  weeklyCloses: WeeklyCloseRecord[];
  activities: ActivityTask[];
  notifications: NotificationItem[];

  // Computed Positions
  financialPosition: ReturnType<typeof calculateFinancialPosition>;
  weeklyStatus: ReturnType<typeof calculateWeeklyStatus>;
  currentWeekInfo: ReturnType<typeof getWeekRange>;
  currentWeekClose: WeeklyCloseRecord | undefined;
  todaySummary: {
    receivedToday: number;
    spentToday: number;
    jobsCompletedToday: number;
    upcomingBookingsCount: number;
    todayExpensesList: LedgerEntry[];
    todayIncomesList: LedgerEntry[];
  };
  thisMonthSummary: {
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

  // Actions
  updateSettings: (newSettings: SystemSettings) => void;
  addClient: (client: Omit<Client, 'id' | 'createdAt'>) => Client;
  addJob: (job: Omit<JobBooking, 'id' | 'createdAt' | 'balanceRemaining' | 'directCosts'>) => JobBooking;
  updateJob: (job: JobBooking) => void;
  recordClientPayment: (
    jobId: string,
    amount: number,
    paymentMethod: string,
    referenceCode: string,
    date?: string,
    notes?: string
  ) => { allocation: ReturnType<typeof calculatePaymentAllocation> };
  addJobCost: (
    jobId: string,
    cost: Omit<JobBooking['directCosts'][0], 'id'>
  ) => void;
  addProductSale: (sale: Omit<ProductSale, 'id' | 'totalSalesAmount' | 'totalCost' | 'netProfit'>) => void;
  addWorker: (worker: Omit<DailyWorker, 'id'>) => DailyWorker;
  recordWorkerPayment: (payment: Omit<WorkerPaymentRecord, 'id' | 'createdAt' | 'balanceRemaining'>) => void;
  settleWorkerPayment: (paymentId: string, amountPaid: number, method: string, referenceCode: string) => void;
  quickAddExpense: (
    amount: number,
    category: string,
    account: AccountType,
    description: string,
    paymentMethod?: string,
    referenceCode?: string
  ) => void;
  addRecurringClient: (client: Omit<RecurringClient, 'id' | 'amountPaidThisMonth' | 'isOverdue'>) => void;
  markRecurringPaymentReceived: (
    id: string,
    amount: number,
    paymentMethod: string,
    referenceCode: string
  ) => void;
  addFixedBudget: (budget: Omit<FixedExpenseBudget, 'id' | 'spentThisMonth'>) => void;
  updateFixedBudget: (budget: FixedExpenseBudget) => void;
  deleteFixedBudget: (id: string) => void;
  submitGivingRequest: (
    personName: string,
    phone: string,
    amountRequested: number,
    reason: string,
    priority: PriorityLevel,
    decision: 'give_recommended' | 'adjust' | 'give_full' | 'do_not_give',
    customAmount?: number,
    referenceCode?: string,
    notes?: string
  ) => GivingRequest;
  recordWeeklySavingsDeposit: (
    amount: number,
    bankAccount: string,
    referenceCode: string,
    date?: string
  ) => void;
  recordWeeklyTithePayment: (
    amount: number,
    paymentMethod: string,
    referenceCode: string,
    date?: string
  ) => void;
  transferWeeklyOwnerSalary: (
    amount: number,
    paymentMethod: string,
    referenceCode: string,
    date?: string
  ) => void;
  completeWeeklyClose: (weekId?: string) => void;
  overrideWeeklyClose: (
    weekId: string,
    reason: string,
    carryForwardSavings?: number,
    carryForwardTithe?: number
  ) => void;
  addTask: (task: Omit<ActivityTask, 'id'>) => void;
  updateTaskStatus: (taskId: string, status: ActivityTask['status']) => void;
  deleteTask: (taskId: string) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  resetToSampleData: () => void;
  exportDatabaseJson: () => string;
  importDatabaseJson: (json: string) => boolean;

  // Firebase Auth & Cloud Sync
  currentUser: User | null;
  isCloudSyncing: boolean;
  lastCloudSyncTime: string | null;
  cloudSyncError: string | null;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  signInWithGoogleAccount: () => Promise<void>;
  signInWithEmailAccount: (email: string, pass: string) => Promise<void>;
  registerWithEmailAccount: (email: string, pass: string, name?: string) => Promise<void>;
  signOutAccount: () => Promise<void>;
  syncLocalToCloud: () => Promise<void>;
  pullCloudToLocal: () => Promise<void>;
}

const AppContext = createContext<AppContextType | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize storage
  useEffect(() => {
    initializeAppState();
  }, []);

  const [settings, setSettings] = useState<SystemSettings>(() => loadFromStorage(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS));
  const [clients, setClients] = useState<Client[]>(() => loadFromStorage(STORAGE_KEYS.CLIENTS, []));
  const [jobs, setJobs] = useState<JobBooking[]>(() => loadFromStorage(STORAGE_KEYS.JOBS, []));
  const [products, setProducts] = useState<ProductSale[]>(() => loadFromStorage(STORAGE_KEYS.PRODUCTS, []));
  const [recurringClients, setRecurringClients] = useState<RecurringClient[]>(() => loadFromStorage(STORAGE_KEYS.RECURRING_CLIENTS, []));
  const [workers, setWorkers] = useState<DailyWorker[]>(() => loadFromStorage(STORAGE_KEYS.WORKERS, []));
  const [workerPayments, setWorkerPayments] = useState<WorkerPaymentRecord[]>(() => loadFromStorage(STORAGE_KEYS.WORKER_PAYMENTS, []));
  const [ledger, setLedger] = useState<LedgerEntry[]>(() => loadFromStorage(STORAGE_KEYS.LEDGER, []));
  const [fixedBudgets, setFixedBudgets] = useState<FixedExpenseBudget[]>(() => loadFromStorage(STORAGE_KEYS.FIXED_BUDGETS, []));
  const [givingRequests, setGivingRequests] = useState<GivingRequest[]>(() => loadFromStorage(STORAGE_KEYS.GIVING_REQUESTS, []));
  const [weeklyCloses, setWeeklyCloses] = useState<WeeklyCloseRecord[]>(() => loadFromStorage(STORAGE_KEYS.WEEKLY_CLOSES, []));
  const [activities, setActivities] = useState<ActivityTask[]>(() => loadFromStorage(STORAGE_KEYS.ACTIVITIES, []));
  const [notifications, setNotifications] = useState<NotificationItem[]>(() => loadFromStorage(STORAGE_KEYS.NOTIFICATIONS, []));

  // Firebase Auth & Cloud Sync States
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isCloudSyncing, setIsCloudSyncing] = useState<boolean>(false);
  const [lastCloudSyncTime, setLastCloudSyncTime] = useState<string | null>(() => localStorage.getItem('calm_last_cloud_sync'));
  const [cloudSyncError, setCloudSyncError] = useState<string | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);

  // Sync to local storage on changes
  useEffect(() => { saveToStorage(STORAGE_KEYS.SETTINGS, settings); }, [settings]);
  useEffect(() => { saveToStorage(STORAGE_KEYS.CLIENTS, clients); }, [clients]);
  useEffect(() => { saveToStorage(STORAGE_KEYS.JOBS, jobs); }, [jobs]);
  useEffect(() => { saveToStorage(STORAGE_KEYS.PRODUCTS, products); }, [products]);
  useEffect(() => { saveToStorage(STORAGE_KEYS.RECURRING_CLIENTS, recurringClients); }, [recurringClients]);
  useEffect(() => { saveToStorage(STORAGE_KEYS.WORKERS, workers); }, [workers]);
  useEffect(() => { saveToStorage(STORAGE_KEYS.WORKER_PAYMENTS, workerPayments); }, [workerPayments]);
  useEffect(() => { saveToStorage(STORAGE_KEYS.LEDGER, ledger); }, [ledger]);
  useEffect(() => { saveToStorage(STORAGE_KEYS.FIXED_BUDGETS, fixedBudgets); }, [fixedBudgets]);
  useEffect(() => { saveToStorage(STORAGE_KEYS.GIVING_REQUESTS, givingRequests); }, [givingRequests]);
  useEffect(() => { saveToStorage(STORAGE_KEYS.WEEKLY_CLOSES, weeklyCloses); }, [weeklyCloses]);
  useEffect(() => { saveToStorage(STORAGE_KEYS.ACTIVITIES, activities); }, [activities]);
  useEffect(() => { saveToStorage(STORAGE_KEYS.NOTIFICATIONS, notifications); }, [notifications]);

  // Firebase Auth Subscription & Initial Cloud Sync
  useEffect(() => {
    const unsubscribe = subscribeToAuth(async (user) => {
      setCurrentUser(user);
      if (user) {
        try {
          setIsCloudSyncing(true);
          const cloudData = await loadUserDataFromFirestore(user.uid);
          if (cloudData && (cloudData.clients?.length || cloudData.ledger?.length || cloudData.settings)) {
            if (cloudData.settings) setSettings(cloudData.settings);
            if (cloudData.clients) setClients(cloudData.clients);
            if (cloudData.jobs) setJobs(cloudData.jobs);
            if (cloudData.products) setProducts(cloudData.products);
            if (cloudData.recurringClients) setRecurringClients(cloudData.recurringClients);
            if (cloudData.workers) setWorkers(cloudData.workers);
            if (cloudData.workerPayments) setWorkerPayments(cloudData.workerPayments);
            if (cloudData.ledger) setLedger(cloudData.ledger);
            if (cloudData.fixedBudgets) setFixedBudgets(cloudData.fixedBudgets);
            if (cloudData.givingRequests) setGivingRequests(cloudData.givingRequests);
            if (cloudData.weeklyCloses) setWeeklyCloses(cloudData.weeklyCloses);
            if (cloudData.activities) setActivities(cloudData.activities);
            if (cloudData.notifications) setNotifications(cloudData.notifications);
            const now = new Date().toISOString();
            setLastCloudSyncTime(now);
            localStorage.setItem('calm_last_cloud_sync', now);
          } else {
            // First time cloud user: automatically upload local data to user's new cloud database
            await saveAllUserDataToFirestore(user.uid, {
              settings,
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
            });
            const now = new Date().toISOString();
            setLastCloudSyncTime(now);
            localStorage.setItem('calm_last_cloud_sync', now);
          }
        } catch (err) {
          console.error('[Calm Online] Cloud sync init error:', err);
        } finally {
          setIsCloudSyncing(false);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  // Debounced auto-save to Firestore if user is logged in
  useEffect(() => {
    if (!currentUser) return;
    const timer = setTimeout(async () => {
      try {
        setIsCloudSyncing(true);
        setCloudSyncError(null);
        await saveAllUserDataToFirestore(currentUser.uid, {
          settings,
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
        });
        const now = new Date().toISOString();
        setLastCloudSyncTime(now);
        localStorage.setItem('calm_last_cloud_sync', now);
      } catch (err: unknown) {
        const e = err as Error;
        console.error('[Calm Online] Auto-sync failed:', e);
        setCloudSyncError(e?.message || 'Cloud sync failed');
      } finally {
        setIsCloudSyncing(false);
      }
    }, 2500);

    return () => clearTimeout(timer);
  }, [
    currentUser,
    settings,
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
  ]);

  // Current Week Info
  const currentWeekInfo = useMemo(() => getWeekRange(new Date(), settings.weekStartDay), [settings.weekStartDay]);

  // Current Week Close Record
  const currentWeekClose = useMemo(() => {
    return weeklyCloses.find(w => w.weekNumber === currentWeekInfo.weekNumber && w.year === currentWeekInfo.year);
  }, [weeklyCloses, currentWeekInfo]);

  // Financial Position (The 5 Buckets)
  const financialPosition = useMemo(() => {
    return calculateFinancialPosition(ledger, fixedBudgets);
  }, [ledger, fixedBudgets]);

  // Weekly Status & Discipline Engine
  const weeklyStatus = useMemo(() => {
    const weeklyLedger = ledger.filter(e => {
      return e.date >= currentWeekInfo.startDate && e.date <= currentWeekInfo.endDate;
    });
    const unpaidWorkers = workerPayments.filter(w => !w.isPaid);
    return calculateWeeklyStatus(currentWeekClose, weeklyLedger, unpaidWorkers, settings);
  }, [currentWeekClose, ledger, workerPayments, currentWeekInfo, settings]);

  // Today Summary
  const todaySummary = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    const todayEntries = ledger.filter(e => e.date === todayStr);
    
    let receivedToday = 0;
    let spentToday = 0;
    const todayExpensesList: LedgerEntry[] = [];
    const todayIncomesList: LedgerEntry[] = [];

    todayEntries.forEach(entry => {
      if (entry.type.startsWith('income_')) {
        receivedToday += entry.amount;
        todayIncomesList.push(entry);
      } else if (entry.type.startsWith('expense_')) {
        spentToday += entry.amount;
        todayExpensesList.push(entry);
      }
    });

    const jobsCompletedToday = jobs.filter(j => j.jobDate === todayStr && j.status === 'completed').length;
    const upcomingBookingsCount = jobs.filter(j => j.jobDate >= todayStr && j.status !== 'cancelled' && j.status !== 'completed').length;

    return {
      receivedToday,
      spentToday,
      jobsCompletedToday,
      upcomingBookingsCount,
      todayExpensesList,
      todayIncomesList
    };
  }, [ledger, jobs]);

  // This Month Summary
  const thisMonthSummary = useMemo(() => {
    const now = new Date();
    const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const monthEntries = ledger.filter(e => e.date.startsWith(currentMonthKey));

    let totalIncome = 0;
    let totalCompanyExpenses = 0;
    let totalPersonalExpenses = 0;
    let totalSavings = 0;
    let totalTithes = 0;
    let totalProductionCosts = 0;
    let totalTransportCosts = 0;
    let totalHiredLabourCosts = 0;

    monthEntries.forEach(e => {
      if (e.type.startsWith('income_')) {
        totalIncome += e.amount;
      } else if (e.account === 'company' && (e.type === 'expense_company_op' || e.type === 'expense_job_cost' || e.type === 'expense_daily_worker')) {
        totalCompanyExpenses += e.amount;
        if (e.category.toLowerCase().includes('production')) totalProductionCosts += e.amount;
        if (e.category.toLowerCase().includes('transport') || e.category.toLowerCase().includes('fuel')) totalTransportCosts += e.amount;
        if (e.type === 'expense_daily_worker' || e.category.toLowerCase().includes('labour')) totalHiredLabourCosts += e.amount;
      } else if (e.account === 'personal' && (e.type === 'expense_personal' || e.type === 'expense_giving')) {
        totalPersonalExpenses += e.amount;
      }

      if (e.type === 'transfer_savings_deposit') {
        totalSavings += e.amount;
      }
      if (e.type === 'payment_tithe') {
        totalTithes += e.amount;
      }
    });

    const totalProfit = Math.max(0, totalIncome - totalCompanyExpenses);
    const totalClientBalancesPending = jobs.reduce((sum, j) => sum + (j.balanceRemaining || 0), 0);

    return {
      totalIncome,
      totalCompanyExpenses,
      totalPersonalExpenses,
      totalSavings,
      totalTithes,
      totalProductionCosts,
      totalTransportCosts,
      totalHiredLabourCosts,
      totalProfit,
      totalClientBalancesPending
    };
  }, [ledger, jobs]);

  // ================= ACTIONS ================= //

  const updateSettings = (newSettings: SystemSettings) => {
    setSettings(newSettings);
  };

  const addClient = (clientData: Omit<Client, 'id' | 'createdAt'>): Client => {
    const newClient: Client = {
      ...clientData,
      id: `client-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    setClients(prev => [newClient, ...prev]);
    return newClient;
  };

  const addJob = (jobData: Omit<JobBooking, 'id' | 'createdAt' | 'balanceRemaining' | 'directCosts'>): JobBooking => {
    const balance = Math.max(0, jobData.agreedPrice - jobData.amountPaid);
    let paymentStatus: PaymentStatus = 'not_paid';
    if (jobData.amountPaid >= jobData.agreedPrice) {
      paymentStatus = 'fully_paid';
    } else if (jobData.amountPaid > 0) {
      paymentStatus = jobData.amountPaid >= jobData.agreedPrice * 0.3 ? 'deposit_paid' : 'partially_paid';
    }

    const newJob: JobBooking = {
      ...jobData,
      id: `job-${Date.now()}`,
      balanceRemaining: balance,
      paymentStatus,
      directCosts: [],
      createdAt: new Date().toISOString()
    };

    setJobs(prev => [newJob, ...prev]);

    // If an initial deposit/payment was made at booking, record in ledger
    if (jobData.amountPaid > 0) {
      const ledgerEntry: LedgerEntry = {
        id: `led-${Date.now()}`,
        date: jobData.bookingDate || new Date().toISOString().split('T')[0],
        amount: jobData.amountPaid,
        type: 'income_job',
        account: 'company',
        bucket: 'company',
        category: 'Client Booking Payment',
        description: `Payment for ${jobData.serviceName} from ${jobData.clientName}`,
        paymentMethod: 'Bank/M-Pesa',
        relatedJobId: newJob.id,
        relatedClientId: jobData.clientId,
        createdAt: new Date().toISOString()
      };
      setLedger(prev => [ledgerEntry, ...prev]);
    }

    // Add activity if scheduled
    if (jobData.jobDate) {
      const task: ActivityTask = {
        id: `act-${Date.now()}`,
        title: `${jobData.serviceName} (${jobData.clientName})`,
        date: jobData.jobDate,
        time: '09:00',
        priority: 'high',
        status: 'pending',
        relatedJobId: newJob.id,
        relatedClientId: jobData.clientId,
        relatedName: jobData.clientName
      };
      setActivities(prev => [task, ...prev]);
    }

    return newJob;
  };

  const updateJob = (updated: JobBooking) => {
    setJobs(prev => prev.map(j => j.id === updated.id ? updated : j));
  };

  const recordClientPayment = (
    jobId: string,
    amount: number,
    paymentMethod: string,
    referenceCode: string,
    date: string = new Date().toISOString().split('T')[0],
    notes?: string
  ) => {
    let targetJob = jobs.find(j => j.id === jobId);
    if (!targetJob) {
      throw new Error(`Job ${jobId} not found`);
    }

    const newAmountPaid = targetJob.amountPaid + amount;
    const newBalance = Math.max(0, targetJob.agreedPrice - newAmountPaid);
    let newPaymentStatus: PaymentStatus = 'partially_paid';
    if (newAmountPaid >= targetJob.agreedPrice) {
      newPaymentStatus = 'fully_paid';
    } else if (newAmountPaid > 0) {
      newPaymentStatus = newAmountPaid >= targetJob.agreedPrice * 0.4 ? 'deposit_paid' : 'partially_paid';
    }

    const updatedJob: JobBooking = {
      ...targetJob,
      amountPaid: newAmountPaid,
      balanceRemaining: newBalance,
      paymentStatus: newPaymentStatus
    };

    setJobs(prev => prev.map(j => j.id === jobId ? updatedJob : j));

    // Append to ledger
    const ledgerEntry: LedgerEntry = {
      id: `led-${Date.now()}`,
      date,
      amount,
      type: 'income_job',
      account: 'company',
      bucket: 'company',
      category: 'Client Payment',
      description: `Payment for ${targetJob.serviceName} (${targetJob.clientName})`,
      paymentMethod,
      referenceCode,
      relatedJobId: jobId,
      relatedClientId: targetJob.clientId,
      notes,
      createdAt: new Date().toISOString()
    };

    setLedger(prev => [ledgerEntry, ...prev]);

    // Calculate allocation recommendation
    const directCostsTotal = targetJob.directCosts.reduce((sum, c) => sum + c.amount, 0);
    const allocation = calculatePaymentAllocation(amount, directCostsTotal, settings);

    return { allocation };
  };

  const addJobCost = (
    jobId: string,
    costData: Omit<JobBooking['directCosts'][0], 'id'>
  ) => {
    const targetJob = jobs.find(j => j.id === jobId);
    if (!targetJob) return;

    const newCost: JobBooking['directCosts'][0] = {
      ...costData,
      id: `cost-${Date.now()}`
    };

    const updatedJob: JobBooking = {
      ...targetJob,
      directCosts: [...targetJob.directCosts, newCost]
    };

    setJobs(prev => prev.map(j => j.id === jobId ? updatedJob : j));

    // Append to ledger if cost was paid
    if (costData.isPaid) {
      const ledgerEntry: LedgerEntry = {
        id: `led-${Date.now()}`,
        date: costData.date,
        amount: costData.amount,
        type: 'expense_job_cost',
        account: 'company',
        bucket: 'company',
        category: costData.category === 'transport' ? 'Transport' : 
                  costData.category === 'hired_labour' ? 'Hired Labour' : 
                  costData.category === 'equipment' ? 'Equipment Rental' : 'Production Cost',
        description: costData.description,
        paymentMethod: costData.paymentMethod,
        referenceCode: costData.paymentReference,
        relatedJobId: jobId,
        createdAt: new Date().toISOString()
      };
      setLedger(prev => [ledgerEntry, ...prev]);
    }
  };

  const addProductSale = (saleData: Omit<ProductSale, 'id' | 'totalSalesAmount' | 'totalCost' | 'netProfit'>) => {
    const totalSalesAmount = saleData.sellingPrice * saleData.quantity;
    const totalCost = (saleData.productCost * saleData.quantity) + saleData.transportCost + saleData.otherCosts;
    const netProfit = totalSalesAmount - totalCost;

    const newSale: ProductSale = {
      ...saleData,
      id: `prod-${Date.now()}`,
      totalSalesAmount,
      totalCost,
      netProfit
    };

    setProducts(prev => [newSale, ...prev]);

    // Ledger Income
    const incomeEntry: LedgerEntry = {
      id: `led-${Date.now()}-inc`,
      date: saleData.date,
      amount: totalSalesAmount,
      type: 'income_product',
      account: 'company',
      bucket: 'company',
      category: 'Product Sale',
      description: `Sold ${saleData.quantity}x ${saleData.productName}${saleData.customerName ? ` to ${saleData.customerName}` : ''}`,
      paymentMethod: 'Direct Payment',
      createdAt: new Date().toISOString()
    };

    // Ledger Cost
    const costEntry: LedgerEntry = {
      id: `led-${Date.now()}-cost`,
      date: saleData.date,
      amount: totalCost,
      type: 'expense_company_op',
      account: 'company',
      bucket: 'company',
      category: 'Product Production & Shipping',
      description: `Cost of goods & transport for ${saleData.productName}`,
      paymentMethod: 'Operational Funds',
      createdAt: new Date().toISOString()
    };

    setLedger(prev => [costEntry, incomeEntry, ...prev]);
  };

  const addWorker = (workerData: Omit<DailyWorker, 'id'>): DailyWorker => {
    const newWorker: DailyWorker = {
      ...workerData,
      id: `w-${Date.now()}`
    };
    setWorkers(prev => [...prev, newWorker]);
    return newWorker;
  };

  const recordWorkerPayment = (paymentData: Omit<WorkerPaymentRecord, 'id' | 'createdAt' | 'balanceRemaining'>) => {
    const balanceRemaining = Math.max(0, paymentData.agreedPay - paymentData.amountPaid);
    const newRecord: WorkerPaymentRecord = {
      ...paymentData,
      id: `wp-${Date.now()}`,
      balanceRemaining,
      createdAt: new Date().toISOString()
    };

    setWorkerPayments(prev => [newRecord, ...prev]);

    // If paid, append to ledger
    if (paymentData.amountPaid > 0) {
      const ledgerEntry: LedgerEntry = {
        id: `led-${Date.now()}`,
        date: paymentData.dateWorked,
        amount: paymentData.amountPaid,
        type: 'expense_daily_worker',
        account: 'company',
        bucket: 'company',
        category: 'Hired Labour',
        description: `Paid daily worker ${paymentData.workerName}${paymentData.jobName ? ` for ${paymentData.jobName}` : ''}`,
        paymentMethod: paymentData.paymentMethod,
        referenceCode: paymentData.paymentReference,
        relatedJobId: paymentData.jobId,
        createdAt: new Date().toISOString()
      };
      setLedger(prev => [ledgerEntry, ...prev]);
    }
  };

  const settleWorkerPayment = (paymentId: string, amountPaid: number, method: string, referenceCode: string) => {
    const target = workerPayments.find(p => p.id === paymentId);
    if (!target) return;

    const totalPaid = target.amountPaid + amountPaid;
    const balance = Math.max(0, target.agreedPay - totalPaid);

    const updated: WorkerPaymentRecord = {
      ...target,
      amountPaid: totalPaid,
      balanceRemaining: balance,
      isPaid: balance === 0,
      paymentMethod: method,
      paymentReference: referenceCode
    };

    setWorkerPayments(prev => prev.map(p => p.id === paymentId ? updated : p));

    // Ledger entry
    const ledgerEntry: LedgerEntry = {
      id: `led-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      amount: amountPaid,
      type: 'expense_daily_worker',
      account: 'company',
      bucket: 'company',
      category: 'Hired Labour Settlement',
      description: `Settled payment for daily worker ${target.workerName}`,
      paymentMethod: method,
      referenceCode,
      relatedJobId: target.jobId,
      createdAt: new Date().toISOString()
    };
    setLedger(prev => [ledgerEntry, ...prev]);
  };

  const quickAddExpense = (
    amount: number,
    category: string,
    account: AccountType,
    description: string,
    paymentMethod: string = 'M-Pesa',
    referenceCode?: string
  ) => {
    const todayStr = new Date().toISOString().split('T')[0];
    const newEntry: LedgerEntry = {
      id: `led-${Date.now()}`,
      date: todayStr,
      amount,
      type: account === 'company' ? 'expense_company_op' : 'expense_personal',
      account,
      bucket: account === 'company' ? 'company' : 'personal',
      category,
      description: description || `${category} expense`,
      paymentMethod,
      referenceCode,
      createdAt: new Date().toISOString()
    };

    setLedger(prev => [newEntry, ...prev]);

    // Check if this matches a fixed budget category and update spent
    const matchingBudget = fixedBudgets.find(b => 
      b.category.toLowerCase() === category.toLowerCase() || 
      b.name.toLowerCase().includes(category.toLowerCase())
    );
    if (matchingBudget) {
      setFixedBudgets(prev => prev.map(b => 
        b.id === matchingBudget.id ? { ...b, spentThisMonth: b.spentThisMonth + amount } : b
      ));
    }
  };

  const addRecurringClient = (clientData: Omit<RecurringClient, 'id' | 'amountPaidThisMonth' | 'isOverdue'>) => {
    const newRec: RecurringClient = {
      ...clientData,
      id: `rc-${Date.now()}`,
      amountPaidThisMonth: 0,
      isOverdue: false
    };
    setRecurringClients(prev => [...prev, newRec]);
  };

  const markRecurringPaymentReceived = (
    id: string,
    amount: number,
    paymentMethod: string,
    referenceCode: string
  ) => {
    const target = recurringClients.find(r => r.id === id);
    if (!target) return;

    const todayStr = new Date().toISOString().split('T')[0];
    const updated: RecurringClient = {
      ...target,
      amountPaidThisMonth: target.amountPaidThisMonth + amount,
      lastPaymentDate: todayStr,
      isOverdue: false
    };

    setRecurringClients(prev => prev.map(r => r.id === id ? updated : r));

    // Ledger
    const entry: LedgerEntry = {
      id: `led-${Date.now()}`,
      date: todayStr,
      amount,
      type: 'income_recurring',
      account: 'company',
      bucket: 'company',
      category: 'Recurring Retainer',
      description: `Monthly Retainer from ${target.clientName} (${target.serviceProvided})`,
      paymentMethod,
      referenceCode,
      createdAt: new Date().toISOString()
    };

    setLedger(prev => [entry, ...prev]);
  };

  const addFixedBudget = (budgetData: Omit<FixedExpenseBudget, 'id' | 'spentThisMonth'>) => {
    const newBudget: FixedExpenseBudget = {
      ...budgetData,
      id: `fb-${Date.now()}`,
      spentThisMonth: 0
    };
    setFixedBudgets(prev => [...prev, newBudget]);
  };

  const updateFixedBudget = (updated: FixedExpenseBudget) => {
    setFixedBudgets(prev => prev.map(b => b.id === updated.id ? updated : b));
  };

  const deleteFixedBudget = (id: string) => {
    setFixedBudgets(prev => prev.filter(b => b.id !== id));
  };

  const submitGivingRequest = (
    personName: string,
    phone: string,
    amountRequested: number,
    reason: string,
    priority: PriorityLevel,
    decision: 'give_recommended' | 'adjust' | 'give_full' | 'do_not_give',
    customAmount?: number,
    referenceCode?: string,
    notes?: string
  ): GivingRequest => {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    // Get current month giving stats
    const currentMonthGivings = givingRequests.filter(g => g.monthKey === monthKey && g.amountGiven > 0);
    const alreadyGivenThisMonth = currentMonthGivings.reduce((sum, g) => sum + g.amountGiven, 0);
    const peopleSupportedCount = new Set(currentMonthGivings.map(g => g.personName.trim().toLowerCase())).size;

    const recResult = calculateGivingRecommendation(
      amountRequested,
      priority,
      settings.monthlyGivingBudget,
      alreadyGivenThisMonth,
      peopleSupportedCount,
      settings.maxMonthlyPeopleSupported,
      now
    );

    let finalGivenAmount = 0;
    if (decision === 'give_recommended') {
      finalGivenAmount = recResult.recommendedAmount;
    } else if (decision === 'give_full') {
      finalGivenAmount = amountRequested;
    } else if (decision === 'adjust' && customAmount !== undefined) {
      finalGivenAmount = customAmount;
    } else {
      finalGivenAmount = 0;
    }

    const newRequest: GivingRequest = {
      id: `gv-${Date.now()}`,
      personName,
      phone,
      date: todayStr,
      amountRequested,
      reason,
      priority,
      recommendedAmount: recResult.recommendedAmount,
      amountGiven: finalGivenAmount,
      decision,
      monthKey,
      referenceCode,
      notes
    };

    setGivingRequests(prev => [newRequest, ...prev]);

    // If money was given, it reduces personal budget
    if (finalGivenAmount > 0) {
      const ledgerEntry: LedgerEntry = {
        id: `led-${Date.now()}`,
        date: todayStr,
        amount: finalGivenAmount,
        type: 'expense_giving',
        account: 'personal',
        bucket: 'giving',
        category: 'Support / Giving',
        description: `Support given to ${personName}: ${reason}`,
        paymentMethod: 'M-Pesa',
        referenceCode,
        createdAt: new Date().toISOString()
      };
      setLedger(prev => [ledgerEntry, ...prev]);
    }

    return newRequest;
  };

  const recordWeeklySavingsDeposit = (
    amount: number,
    bankAccount: string,
    referenceCode: string,
    date: string = new Date().toISOString().split('T')[0]
  ) => {
    // 1. Ledger entry (transfer from company to savings)
    const ledgerEntry: LedgerEntry = {
      id: `led-${Date.now()}`,
      date,
      amount,
      type: 'transfer_savings_deposit',
      account: 'company',
      bucket: 'savings',
      category: 'Savings Deposit',
      description: `Weekly discipline savings deposit to ${bankAccount}`,
      paymentMethod: 'Bank Transfer',
      referenceCode,
      createdAt: new Date().toISOString()
    };

    setLedger(prev => [ledgerEntry, ...prev]);

    // 2. Update weekly close record
    setWeeklyCloses(prev => {
      const existing = prev.find(w => w.weekNumber === currentWeekInfo.weekNumber && w.year === currentWeekInfo.year);
      if (existing) {
        return prev.map(w => w.id === existing.id ? {
          ...w,
          savingsDeposited: (w.savingsDeposited || 0) + amount,
          savingsAccount: bankAccount,
          savingsReference: referenceCode,
          savingsDate: date,
          checklist: { ...w.checklist, savingsCompleted: true }
        } : w);
      } else {
        const newRecord: WeeklyCloseRecord = {
          id: `wc-${currentWeekInfo.weekNumber}`,
          weekNumber: currentWeekInfo.weekNumber,
          year: currentWeekInfo.year,
          startDate: currentWeekInfo.startDate,
          endDate: currentWeekInfo.endDate,
          status: 'action_required',
          totalIncome: weeklyStatus.moneyReceived,
          totalDirectCosts: weeklyStatus.directCosts,
          totalCompanyExpenses: weeklyStatus.companyExpenses,
          netBusinessProfit: weeklyStatus.netBusinessProfit,
          savingsExpected: weeklyStatus.savingsExpected,
          savingsDeposited: amount,
          savingsAccount: bankAccount,
          savingsReference: referenceCode,
          savingsDate: date,
          titheExpected: weeklyStatus.titheExpected,
          tithePaid: 0,
          titheVerified: false,
          salaryRecommended: weeklyStatus.salaryRecommended,
          salaryTransferred: 0,
          companyRetained: 0,
          checklist: {
            allIncomeRecorded: true,
            allJobCostsRecorded: true,
            allWorkersPaid: !weeklyStatus.hasUnpaidWorkers,
            savingsCompleted: true,
            titheVerified: false,
            salaryTransferred: false,
            weeklySummaryReviewed: false
          }
        };
        return [newRecord, ...prev];
      }
    });
  };

  const recordWeeklyTithePayment = (
    amount: number,
    paymentMethod: string,
    referenceCode: string,
    date: string = new Date().toISOString().split('T')[0]
  ) => {
    // 1. Ledger entry
    const ledgerEntry: LedgerEntry = {
      id: `led-${Date.now()}`,
      date,
      amount,
      type: 'payment_tithe',
      account: 'company',
      bucket: 'tithe',
      category: 'Tithe Payment',
      description: 'Saturday Tithe settlement with verified receipt',
      paymentMethod,
      referenceCode,
      createdAt: new Date().toISOString()
    };

    setLedger(prev => [ledgerEntry, ...prev]);

    // 2. Update weekly close record
    setWeeklyCloses(prev => {
      const existing = prev.find(w => w.weekNumber === currentWeekInfo.weekNumber && w.year === currentWeekInfo.year);
      if (existing) {
        return prev.map(w => w.id === existing.id ? {
          ...w,
          tithePaid: (w.tithePaid || 0) + amount,
          tithePaymentMethod: paymentMethod,
          titheReference: referenceCode,
          titheDate: date,
          titheVerified: true,
          checklist: { ...w.checklist, titheVerified: true }
        } : w);
      } else {
        const newRecord: WeeklyCloseRecord = {
          id: `wc-${currentWeekInfo.weekNumber}`,
          weekNumber: currentWeekInfo.weekNumber,
          year: currentWeekInfo.year,
          startDate: currentWeekInfo.startDate,
          endDate: currentWeekInfo.endDate,
          status: 'action_required',
          totalIncome: weeklyStatus.moneyReceived,
          totalDirectCosts: weeklyStatus.directCosts,
          totalCompanyExpenses: weeklyStatus.companyExpenses,
          netBusinessProfit: weeklyStatus.netBusinessProfit,
          savingsExpected: weeklyStatus.savingsExpected,
          savingsDeposited: 0,
          titheExpected: weeklyStatus.titheExpected,
          tithePaid: amount,
          tithePaymentMethod: paymentMethod,
          titheReference: referenceCode,
          titheDate: date,
          titheVerified: true,
          salaryRecommended: weeklyStatus.salaryRecommended,
          salaryTransferred: 0,
          companyRetained: 0,
          checklist: {
            allIncomeRecorded: true,
            allJobCostsRecorded: true,
            allWorkersPaid: !weeklyStatus.hasUnpaidWorkers,
            savingsCompleted: false,
            titheVerified: true,
            salaryTransferred: false,
            weeklySummaryReviewed: false
          }
        };
        return [newRecord, ...prev];
      }
    });
  };

  const transferWeeklyOwnerSalary = (
    amount: number,
    paymentMethod: string,
    referenceCode: string,
    date: string = new Date().toISOString().split('T')[0]
  ) => {
    // Moves Company -> Personal
    const companyOut: LedgerEntry = {
      id: `led-${Date.now()}-out`,
      date,
      amount,
      type: 'transfer_owner_salary',
      account: 'company',
      bucket: 'company',
      category: 'Owner Salary Withdrawal',
      description: 'Weekly owner salary withdrawal from company',
      paymentMethod,
      referenceCode,
      createdAt: new Date().toISOString()
    };

    const personalIn: LedgerEntry = {
      id: `led-${Date.now()}-in`,
      date,
      amount,
      type: 'transfer_owner_salary',
      account: 'personal',
      bucket: 'personal',
      category: 'Owner Salary Inflow',
      description: 'Owner salary received into personal wallet',
      paymentMethod,
      referenceCode,
      createdAt: new Date().toISOString()
    };

    setLedger(prev => [companyOut, personalIn, ...prev]);

    // Update weekly close record
    setWeeklyCloses(prev => {
      const existing = prev.find(w => w.weekNumber === currentWeekInfo.weekNumber && w.year === currentWeekInfo.year);
      if (existing) {
        return prev.map(w => w.id === existing.id ? {
          ...w,
          salaryTransferred: amount,
          salaryReference: referenceCode,
          salaryDate: date,
          checklist: { ...w.checklist, salaryTransferred: true }
        } : w);
      }
      return prev;
    });
  };

  const completeWeeklyClose = (weekId?: string) => {
    setWeeklyCloses(prev => {
      return prev.map(w => {
        if (!weekId || w.id === weekId || (w.weekNumber === currentWeekInfo.weekNumber && w.year === currentWeekInfo.year)) {
          return {
            ...w,
            status: 'completed',
            closedAt: new Date().toISOString(),
            checklist: {
              ...w.checklist,
              allIncomeRecorded: true,
              allJobCostsRecorded: true,
              allWorkersPaid: true,
              savingsCompleted: true,
              titheVerified: true,
              salaryTransferred: true,
              weeklySummaryReviewed: true
            }
          };
        }
        return w;
      });
    });
  };

  const overrideWeeklyClose = (
    weekId: string,
    reason: string,
    carryForwardSavings: number = 0,
    carryForwardTithe: number = 0
  ) => {
    setWeeklyCloses(prev => {
      return prev.map(w => {
        if (w.id === weekId || (w.weekNumber === currentWeekInfo.weekNumber && w.year === currentWeekInfo.year)) {
          return {
            ...w,
            status: 'overridden',
            isOverridden: true,
            overrideReason: reason,
            overrideDate: new Date().toISOString(),
            overrideCarryForwardSavings: carryForwardSavings,
            overrideCarryForwardTithe: carryForwardTithe
          };
        }
        return w;
      });
    });
  };

  const addTask = (taskData: Omit<ActivityTask, 'id'>) => {
    const newTask: ActivityTask = {
      ...taskData,
      id: `act-${Date.now()}`
    };
    setActivities(prev => [newTask, ...prev]);
  };

  const updateTaskStatus = (taskId: string, status: ActivityTask['status']) => {
    setActivities(prev => prev.map(t => t.id === taskId ? { ...t, status } : t));
  };

  const deleteTask = (taskId: string) => {
    setActivities(prev => prev.filter(t => t.id !== taskId));
  };

  const markNotificationRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const resetToSampleData = () => {
    const seed = generateSeedData();
    setSettings(seed.settings);
    setClients(seed.clients);
    setJobs(seed.jobs);
    setProducts(seed.products);
    setRecurringClients(seed.recurringClients);
    setWorkers(seed.workers);
    setWorkerPayments(seed.workerPayments);
    setLedger(seed.ledger);
    setFixedBudgets(seed.fixedBudgets);
    setGivingRequests(seed.givingRequests);
    setWeeklyCloses(seed.weeklyCloses);
    setActivities(seed.activities);
    setNotifications(seed.notifications);

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
  };

  const signInWithGoogleAccount = async () => {
    setCloudSyncError(null);
    await loginWithGoogle();
  };

  const signInWithEmailAccount = async (email: string, pass: string) => {
    setCloudSyncError(null);
    await loginWithEmail(email, pass);
  };

  const registerWithEmailAccount = async (email: string, pass: string, name?: string) => {
    setCloudSyncError(null);
    await registerWithEmail(email, pass, name);
  };

  const signOutAccount = async () => {
    setCloudSyncError(null);
    await logoutUser();
  };

  const syncLocalToCloud = async () => {
    if (!currentUser) {
      setIsAuthModalOpen(true);
      return;
    }
    setIsCloudSyncing(true);
    setCloudSyncError(null);
    try {
      await saveAllUserDataToFirestore(currentUser.uid, {
        settings,
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
      });
      const now = new Date().toISOString();
      setLastCloudSyncTime(now);
      localStorage.setItem('calm_last_cloud_sync', now);
    } catch (err: unknown) {
      const e = err as Error;
      setCloudSyncError(e?.message || 'Cloud backup failed');
      throw e;
    } finally {
      setIsCloudSyncing(false);
    }
  };

  const pullCloudToLocal = async () => {
    if (!currentUser) return;
    setIsCloudSyncing(true);
    setCloudSyncError(null);
    try {
      const cloudData = await loadUserDataFromFirestore(currentUser.uid);
      if (cloudData) {
        if (cloudData.settings) setSettings(cloudData.settings);
        if (cloudData.clients) setClients(cloudData.clients);
        if (cloudData.jobs) setJobs(cloudData.jobs);
        if (cloudData.products) setProducts(cloudData.products);
        if (cloudData.recurringClients) setRecurringClients(cloudData.recurringClients);
        if (cloudData.workers) setWorkers(cloudData.workers);
        if (cloudData.workerPayments) setWorkerPayments(cloudData.workerPayments);
        if (cloudData.ledger) setLedger(cloudData.ledger);
        if (cloudData.fixedBudgets) setFixedBudgets(cloudData.fixedBudgets);
        if (cloudData.givingRequests) setGivingRequests(cloudData.givingRequests);
        if (cloudData.weeklyCloses) setWeeklyCloses(cloudData.weeklyCloses);
        if (cloudData.activities) setActivities(cloudData.activities);
        if (cloudData.notifications) setNotifications(cloudData.notifications);
        const now = new Date().toISOString();
        setLastCloudSyncTime(now);
        localStorage.setItem('calm_last_cloud_sync', now);
      }
    } catch (err: unknown) {
      const e = err as Error;
      setCloudSyncError(e?.message || 'Failed to pull cloud data');
      throw e;
    } finally {
      setIsCloudSyncing(false);
    }
  };

  const exportDatabaseJson = () => {
    const backup = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      settings,
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
    return JSON.stringify(backup, null, 2);
  };

  const importDatabaseJson = (jsonStr: string): boolean => {
    try {
      const data = JSON.parse(jsonStr);
      if (data.settings) setSettings(data.settings);
      if (Array.isArray(data.clients)) setClients(data.clients);
      if (Array.isArray(data.jobs)) setJobs(data.jobs);
      if (Array.isArray(data.products)) setProducts(data.products);
      if (Array.isArray(data.recurringClients)) setRecurringClients(data.recurringClients);
      if (Array.isArray(data.workers)) setWorkers(data.workers);
      if (Array.isArray(data.workerPayments)) setWorkerPayments(data.workerPayments);
      if (Array.isArray(data.ledger)) setLedger(data.ledger);
      if (Array.isArray(data.fixedBudgets)) setFixedBudgets(data.fixedBudgets);
      if (Array.isArray(data.givingRequests)) setGivingRequests(data.givingRequests);
      if (Array.isArray(data.weeklyCloses)) setWeeklyCloses(data.weeklyCloses);
      if (Array.isArray(data.activities)) setActivities(data.activities);
      if (Array.isArray(data.notifications)) setNotifications(data.notifications);
      return true;
    } catch (e) {
      console.error('Failed to import database JSON', e);
      return false;
    }
  };

  return (
    <AppContext.Provider
      value={{
        settings,
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
        notifications,
        financialPosition,
        weeklyStatus,
        currentWeekInfo,
        currentWeekClose,
        todaySummary,
        thisMonthSummary,
        updateSettings,
        addClient,
        addJob,
        updateJob,
        recordClientPayment,
        addJobCost,
        addProductSale,
        addWorker,
        recordWorkerPayment,
        settleWorkerPayment,
        quickAddExpense,
        addRecurringClient,
        markRecurringPaymentReceived,
        addFixedBudget,
        updateFixedBudget,
        deleteFixedBudget,
        submitGivingRequest,
        recordWeeklySavingsDeposit,
        recordWeeklyTithePayment,
        transferWeeklyOwnerSalary,
        completeWeeklyClose,
        overrideWeeklyClose,
        addTask,
        updateTaskStatus,
        deleteTask,
        markNotificationRead,
        markAllNotificationsRead,
        resetToSampleData,
        exportDatabaseJson,
        importDatabaseJson,
        currentUser,
        isCloudSyncing,
        lastCloudSyncTime,
        cloudSyncError,
        isAuthModalOpen,
        setIsAuthModalOpen,
        signInWithGoogleAccount,
        signInWithEmailAccount,
        registerWithEmailAccount,
        signOutAccount,
        syncLocalToCloud,
        pullCloudToLocal
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
