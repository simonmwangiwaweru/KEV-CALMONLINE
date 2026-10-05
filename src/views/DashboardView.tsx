import React from 'react';
import { useApp } from '../context/AppContext';
import { formatCurrency } from '../services/financialEngine';
import { FlowTree } from '../components/FlowTree';
import { WeeklyRing } from '../components/WeeklyRing';
import { FinancialPositionBar } from '../components/FinancialPositionBar';
import { 
  ShieldCheck, 
  AlertTriangle, 
  Lock, 
  ArrowUpRight, 
  ArrowDownRight, 
  Clock, 
  PiggyBank, 
  Church, 
  Wallet, 
  ArrowRight,
  TrendingUp,
  Briefcase,
  Plus
} from 'lucide-react';
import { AIQuickBar } from '../components/AIQuickBar';

interface DashboardViewProps {
  onOpenQuickExpense: () => void;
  onOpenRecordPayment: () => void;
  onOpenWeeklyClose: () => void;
  onNavigateToTab: (tab: string) => void;
  onOpenAIChat: (prompt?: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onOpenQuickExpense,
  onOpenRecordPayment,
  onOpenWeeklyClose,
  onNavigateToTab,
  onOpenAIChat
}) => {
  const { 
    settings, 
    weeklyStatus, 
    currentWeekInfo, 
    currentWeekClose,
    todaySummary, 
    thisMonthSummary, 
    activities, 
    financialPosition 
  } = useApp();

  const todayStr = new Date().toISOString().split('T')[0];
  const todayTasks = activities.filter(a => a.date === todayStr).slice(0, 4);

  return (
    <div className="space-y-6 pb-24">
      {/* 0. AI FINANCIAL INTELLIGENCE QUICK BAR */}
      <AIQuickBar onOpenAIChat={onOpenAIChat} />
      
      {/* 1. DASHBOARD HERO CARD: <FlowTree /> with quick-capture actions */}
      <div className="glass p-6 sm:p-7 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/30 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="t-title">Income & 4-Bucket Flow</h2>
              <span className="text-[var(--text-3)]">·</span>
              <span className="t-sub font-mono">{currentWeekInfo.weekId}</span>
            </div>
            <p className="t-label mt-0.5">Automated split: Company reserve, Personal salary, Banked savings & Tithe</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onOpenRecordPayment}
              className="text-xs text-[var(--text)] glass glass--pill px-3.5 py-1.5 font-semibold flex items-center gap-1.5 cursor-pointer hover:bg-white/40 shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" strokeWidth={1.8} /> Record Income
            </button>
            <button
              onClick={onOpenQuickExpense}
              className="text-xs text-[var(--text-2)] glass glass--pill px-3 py-1.5 font-medium flex items-center gap-1.5 cursor-pointer hover:bg-white/30"
            >
              <Plus className="w-3.5 h-3.5" strokeWidth={1.5} /> Add Expense
            </button>
          </div>
        </div>

        {/* Hero: FlowTree with Jesus Christ drawing and 4-bucket allocations on all devices */}
        <div className="w-full flex items-center justify-center py-2">
          <FlowTree
            income={weeklyStatus.moneyReceived}
            buckets={{
              company: {
                amount: financialPosition.companyMoney,
                pct: weeklyStatus.moneyReceived > 0 
                  ? Math.min(100, Math.round((financialPosition.companyMoney / weeklyStatus.moneyReceived) * 100))
                  : settings.companyReservePercentage || 25,
                status: 'done'
              },
              personal: {
                amount: weeklyStatus.salaryTransferred,
                pct: weeklyStatus.moneyReceived > 0 
                  ? Math.min(100, Math.round((weeklyStatus.salaryRecommended / weeklyStatus.moneyReceived) * 100))
                  : settings.personalSalaryPercentage || 25,
                status: weeklyStatus.salaryTransferred >= weeklyStatus.salaryRecommended && weeklyStatus.salaryRecommended > 0
                  ? 'done'
                  : weeklyStatus.salaryRecommended > 0 
                  ? 'pending' 
                  : 'none'
              },
              savings: {
                amount: weeklyStatus.savingsDeposited,
                pct: settings.savingsPercentage || 10,
                status: weeklyStatus.savingsComplete ? 'done' : weeklyStatus.savingsExpected > 0 ? 'pending' : 'none'
              },
              tithe: {
                amount: weeklyStatus.tithePaid,
                pct: settings.tithePercentage || 10,
                status: weeklyStatus.titheComplete ? 'done' : weeklyStatus.titheExpected > 0 ? 'pending' : 'none'
              }
            }}
          />
        </div>
      </div>

      {/* 2. FINANCIAL POSITION (ALWAYS VISIBLE) */}
      <FinancialPositionBar />

      {/* 3. WEEKLY DISCIPLINE STATUS INDICATOR & THE 3 WEEKLY QUESTIONS */}
      <div className="glass p-6 sm:p-7 space-y-6">
        
        {/* Weekly Header Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/30 pb-5">
          <div className="flex items-center gap-3.5">
            <div className={`p-3 rounded-2xl ${
              weeklyStatus.status === 'WEEK_COMPLETE' ? 'glass is-active' :
              weeklyStatus.status === 'ACTION_REQUIRED' ? 'glass' :
              'glass'
            }`}>
              {weeklyStatus.status === 'WEEK_COMPLETE' && <ShieldCheck className="w-5 h-5 text-[var(--text)]" strokeWidth={1.5} />}
              {weeklyStatus.status === 'ACTION_REQUIRED' && <AlertTriangle className="w-5 h-5 text-[var(--text-2)]" strokeWidth={1.5} />}
              {weeklyStatus.status === 'WEEK_NOT_CLOSED' && <Lock className="w-5 h-5 text-[var(--text-3)]" strokeWidth={1.5} />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="t-group font-mono">
                  {currentWeekInfo.weekId} Discipline Checkpoint
                </span>
                <span className="text-[var(--text-3)]">·</span>
                <span className={`text-xs font-semibold ${
                  weeklyStatus.status === 'WEEK_COMPLETE' ? 'text-[var(--text)]' : 'text-[var(--text-2)]'
                }`}>
                  {weeklyStatus.status === 'WEEK_COMPLETE' ? '■ WEEK COMPLETE' :
                   weeklyStatus.status === 'ACTION_REQUIRED' ? '■ ACTION REQUIRED' : '■ WEEK NOT CLOSED'}
                </span>
              </div>
              <p className="t-label mt-0.5">
                {weeklyStatus.status === 'WEEK_COMPLETE'
                  ? 'Savings deposited and tithe verified. Ready for next week.'
                  : weeklyStatus.status === 'ACTION_REQUIRED'
                  ? 'Pending obligations require your action before starting a new week.'
                  : 'Previous week savings, banking, tithe, or references missing.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onOpenWeeklyClose}
              className="px-4 py-2 text-xs font-semibold text-[var(--text)] glass glass--pill hover:bg-white/40 border border-white/60 shadow-[var(--glass-shadow)] transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <span>Weekly Discipline Assistant</span>
              <ArrowRight className="w-3.5 h-3.5" strokeWidth={1.5} />
            </button>
          </div>
        </div>

        {/* The 3 Core Weekly Questions */}
        <div>
          <h3 className="t-group mb-3.5">
            The 3 Core Weekly Questions
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Card 1: What do I save? */}
            <div className="p-4.5 glass glass--tile space-y-2.5">
              <div className="flex items-center justify-between text-[var(--text-2)]">
                <span className="t-label font-medium">1. What do I save?</span>
                <PiggyBank className="w-4 h-4 text-[var(--text-2)]" strokeWidth={1.5} />
              </div>
              <div>
                <p className="t-readout font-mono font-semibold">
                  {formatCurrency(weeklyStatus.savingsExpected, settings.currency)}
                </p>
                <div className="flex items-center justify-between text-xs text-[var(--text-2)] mt-1">
                  <span>Banked this week:</span>
                  <span className="font-mono text-[var(--text)] font-semibold">
                    {formatCurrency(weeklyStatus.savingsDeposited, settings.currency)}
                  </span>
                </div>
              </div>
              <div className="pt-2.5 border-t border-white/30 flex items-center justify-between text-[11px]">
                <span className="t-caption text-left">Status:</span>
                <span className="font-semibold text-[var(--text)]">
                  {weeklyStatus.savingsComplete ? '✓ Banked & Ref Logged' : 'Pending Bank Transfer'}
                </span>
              </div>
            </div>

            {/* Card 2: What is my tithe? */}
            <div className="p-4.5 glass glass--tile space-y-2.5">
              <div className="flex items-center justify-between text-[var(--text-2)]">
                <span className="t-label font-medium">2. What is my tithe?</span>
                <Church className="w-4 h-4 text-[var(--text-2)]" strokeWidth={1.5} />
              </div>
              <div>
                <p className="t-readout font-mono font-semibold">
                  {formatCurrency(weeklyStatus.titheExpected, settings.currency)}
                </p>
                <div className="flex items-center justify-between text-xs text-[var(--text-2)] mt-1">
                  <span>Settled this week:</span>
                  <span className="font-mono text-[var(--text)] font-semibold">
                    {formatCurrency(weeklyStatus.tithePaid, settings.currency)}
                  </span>
                </div>
              </div>
              <div className="pt-2.5 border-t border-white/30 flex items-center justify-between text-[11px]">
                <span className="t-caption text-left">Saturday Verification:</span>
                <span className="font-semibold text-[var(--text)]">
                  {weeklyStatus.titheComplete ? '✓ Verified with Receipt' : 'Pending Saturday Receipt'}
                </span>
              </div>
            </div>

            {/* Card 3: What is my salary this week? */}
            <div className="p-4.5 glass glass--tile space-y-2.5">
              <div className="flex items-center justify-between text-[var(--text-2)]">
                <span className="t-label font-medium">3. What is my salary this week?</span>
                <Wallet className="w-4 h-4 text-[var(--text-2)]" strokeWidth={1.5} />
              </div>
              <div>
                <p className="t-readout font-mono font-semibold">
                  {formatCurrency(weeklyStatus.salaryRecommended, settings.currency)}
                </p>
                <div className="flex items-center justify-between text-xs text-[var(--text-2)] mt-1">
                  <span>Transferred to personal:</span>
                  <span className="font-mono text-[var(--text)] font-semibold">
                    {formatCurrency(weeklyStatus.salaryTransferred, settings.currency)}
                  </span>
                </div>
              </div>
              <div className="pt-2.5 border-t border-white/30 flex items-center justify-between text-[11px]">
                <span className="t-caption text-left">Rule:</span>
                <span className="text-[var(--text)] font-mono font-medium">
                  {settings.salaryRuleType === 'percentage' 
                    ? `${settings.salaryProfitPercentage}% Net Profit` 
                    : `Cap KES ${settings.salaryWeeklyCap.toLocaleString()}`}
                </span>
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* 4. TODAY SECTION */}
      <div className="space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="t-title">
              Today's Pulse
            </h3>
            <span className="text-[var(--text-3)]">·</span>
            <span className="t-caption font-mono">{todayStr}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenRecordPayment}
              className="text-xs text-[var(--text)] glass glass--pill px-3 py-1 font-semibold flex items-center gap-1 cursor-pointer hover:bg-white/40"
            >
              <Plus className="w-3.5 h-3.5" strokeWidth={1.5} /> Record Income
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
          <div className="p-4 glass glass--tile">
            <div className="flex items-center justify-between text-[var(--text-2)] mb-1">
              <span className="t-label">Money Received</span>
              <ArrowUpRight className="w-3.5 h-3.5" strokeWidth={1.5} />
            </div>
            <p className="t-readout font-mono font-semibold">
              {formatCurrency(todaySummary.receivedToday, settings.currency)}
            </p>
          </div>

          <div className="p-4 glass glass--tile">
            <div className="flex items-center justify-between text-[var(--text-2)] mb-1">
              <span className="t-label">Money Spent</span>
              <ArrowDownRight className="w-3.5 h-3.5" strokeWidth={1.5} />
            </div>
            <p className="t-readout font-mono font-semibold">
              {formatCurrency(todaySummary.spentToday, settings.currency)}
            </p>
          </div>

          <div className="p-4 glass glass--tile">
            <div className="flex items-center justify-between text-[var(--text-2)] mb-1">
              <span className="t-label">Jobs Active Today</span>
              <Briefcase className="w-3.5 h-3.5" strokeWidth={1.5} />
            </div>
            <p className="t-readout font-mono font-semibold">
              {todaySummary.jobsCompletedToday} / {todaySummary.upcomingBookingsCount}
            </p>
          </div>

          <div className="p-4 glass glass--tile">
            <div className="flex items-center justify-between text-[var(--text-2)] mb-1">
              <span className="t-label">Available Balance</span>
              <TrendingUp className="w-3.5 h-3.5" strokeWidth={1.5} />
            </div>
            <p className="t-readout font-mono font-semibold">
              {formatCurrency(financialPosition.availableToSpend, settings.currency)}
            </p>
          </div>
        </div>

        {/* Quick Lists: Today's Recent Expenses & Activities */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pt-2">
          
          {/* Today's Transactions */}
          <div className="p-5 glass space-y-3">
            <div className="flex items-center justify-between border-b border-white/30 pb-3">
              <span className="t-group">
                Today's Recorded Expenses
              </span>
              <button
                onClick={onOpenQuickExpense}
                className="t-caption px-2.5 py-0.5 glass glass--pill hover:bg-white/40 cursor-pointer text-[var(--text)] font-medium"
              >
                + Add Expense
              </button>
            </div>
            {todaySummary.todayExpensesList.length === 0 ? (
              <p className="t-caption py-3">
                No expenses logged yet today.
              </p>
            ) : (
              <div className="space-y-2">
                {todaySummary.todayExpensesList.slice(0, 4).map((exp) => (
                  <div key={exp.id} className="flex items-center justify-between text-xs py-2 border-b border-white/20 last:border-none">
                    <div>
                      <span className="text-[var(--text)] font-semibold block">{exp.category}</span>
                      <span className="t-caption text-left block truncate max-w-xs">{exp.description}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-mono font-semibold text-[var(--text)] block">
                        −{formatCurrency(exp.amount, settings.currency)}
                      </span>
                      <span className="t-caption block uppercase font-mono">{exp.account}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Today's Activities / Bookings */}
          <div className="p-5 glass space-y-3">
            <div className="flex items-center justify-between border-b border-white/30 pb-3">
              <span className="t-group">
                Today's Bookings & Activities
              </span>
              <button
                onClick={() => onNavigateToTab('activities')}
                className="t-caption px-2.5 py-0.5 glass glass--pill hover:bg-white/40 cursor-pointer text-[var(--text)] font-medium"
              >
                View All
              </button>
            </div>
            {todayTasks.length === 0 ? (
              <p className="t-caption py-3">
                No scheduled activities for today.
              </p>
            ) : (
              <div className="space-y-2">
                {todayTasks.map((task) => (
                  <div key={task.id} className="flex items-center justify-between text-xs py-2 border-b border-white/20 last:border-none">
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-[var(--text-2)] shrink-0" strokeWidth={1.5} />
                      <div>
                        <span className="text-[var(--text)] font-semibold block">{task.title}</span>
                        {task.relatedName && (
                          <span className="t-caption text-left block">{task.relatedName}</span>
                        )}
                      </div>
                    </div>
                    <span className="t-caption font-mono px-2.5 py-0.5 glass glass--pill uppercase font-semibold">
                      {task.status.replace('_', ' ')}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>

      {/* 5. THIS MONTH SECTION (Bottom Part - 100% Crisp Visible Text) */}
      <div className="space-y-3.5 pt-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="t-title">
              This Month Cumulative Performance
            </h3>
            <span className="text-[var(--text-3)]">·</span>
            <span className="t-sub text-xs">Complete Financial Health</span>
          </div>
          <button
            onClick={() => onNavigateToTab('reports')}
            className="text-xs text-[var(--text)] glass glass--pill px-3 py-1 font-semibold cursor-pointer hover:bg-white/40"
          >
            Deep Analytics →
          </button>
        </div>

        {/* 10 high-contrast metric cards with crystal clear typography over bottom grass */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3.5">
          <div className="p-3.5 glass glass--tile glass--lifted space-y-1">
            <span className="t-label block truncate">Total Income</span>
            <span className="text-base font-semibold font-mono text-[var(--text)] tabular-nums block">
              {formatCurrency(thisMonthSummary.totalIncome, settings.currency)}
            </span>
          </div>

          <div className="p-3.5 glass glass--tile glass--lifted space-y-1">
            <span className="t-label block truncate">Company Expenses</span>
            <span className="text-base font-semibold font-mono text-[var(--text)] tabular-nums block">
              {formatCurrency(thisMonthSummary.totalCompanyExpenses, settings.currency)}
            </span>
          </div>

          <div className="p-3.5 glass glass--tile glass--lifted space-y-1">
            <span className="t-label block truncate">Personal Expenses</span>
            <span className="text-base font-semibold font-mono text-[var(--text)] tabular-nums block">
              {formatCurrency(thisMonthSummary.totalPersonalExpenses, settings.currency)}
            </span>
          </div>

          <div className="p-3.5 glass glass--tile glass--lifted space-y-1">
            <span className="t-label block truncate">Total Savings Banked</span>
            <span className="text-base font-semibold font-mono text-[var(--text)] tabular-nums block">
              {formatCurrency(thisMonthSummary.totalSavings, settings.currency)}
            </span>
          </div>

          <div className="p-3.5 glass glass--tile glass--lifted space-y-1">
            <span className="t-label block truncate">Total Tithes Paid</span>
            <span className="text-base font-semibold font-mono text-[var(--text)] tabular-nums block">
              {formatCurrency(thisMonthSummary.totalTithes, settings.currency)}
            </span>
          </div>

          <div className="p-3.5 glass glass--tile glass--lifted space-y-1">
            <span className="t-label block truncate">Production Costs</span>
            <span className="text-base font-semibold font-mono text-[var(--text)] tabular-nums block">
              {formatCurrency(thisMonthSummary.totalProductionCosts, settings.currency)}
            </span>
          </div>

          <div className="p-3.5 glass glass--tile glass--lifted space-y-1">
            <span className="t-label block truncate">Transport Costs</span>
            <span className="text-base font-semibold font-mono text-[var(--text)] tabular-nums block">
              {formatCurrency(thisMonthSummary.totalTransportCosts, settings.currency)}
            </span>
          </div>

          <div className="p-3.5 glass glass--tile glass--lifted space-y-1">
            <span className="t-label block truncate">Hired Labour Costs</span>
            <span className="text-base font-semibold font-mono text-[var(--text)] tabular-nums block">
              {formatCurrency(thisMonthSummary.totalHiredLabourCosts, settings.currency)}
            </span>
          </div>

          <div className="p-3.5 glass glass--tile glass--lifted space-y-1">
            <span className="t-label block truncate">Net Business Profit</span>
            <span className="text-base font-semibold font-mono text-[var(--text)] tabular-nums block">
              {formatCurrency(thisMonthSummary.totalProfit, settings.currency)}
            </span>
          </div>

          <div className="p-3.5 glass glass--tile glass--lifted space-y-1">
            <span className="t-label block truncate">Client Balances Pending</span>
            <span className="text-base font-semibold font-mono text-[var(--text)] tabular-nums block">
              {formatCurrency(thisMonthSummary.totalClientBalancesPending, settings.currency)}
            </span>
          </div>
        </div>
      </div>

    </div>
  );
};
