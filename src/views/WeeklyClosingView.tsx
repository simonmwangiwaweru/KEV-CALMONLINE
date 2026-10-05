import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { formatCurrency } from '../services/financialEngine';
import { WeeklyRing } from '../components/WeeklyRing';
import { WeeklyCloseModal } from '../components/WeeklyCloseModal';
import { 
  ShieldCheck, 
  ArrowRight
} from 'lucide-react';

export const WeeklyClosingView: React.FC = () => {
  const { 
    currentWeekInfo, 
    currentWeekClose, 
    weeklyStatus, 
    weeklyCloses, 
    settings 
  } = useApp();

  const [isClosingWizardOpen, setIsClosingWizardOpen] = useState(false);

  const isSavingsDone = weeklyStatus.savingsDeposited >= weeklyStatus.savingsExpected && weeklyStatus.savingsExpected > 0;
  const isTitheDone = weeklyStatus.tithePaid >= weeklyStatus.titheExpected && !!currentWeekClose?.titheVerified;
  const isSalaryDone = weeklyStatus.salaryTransferred > 0;

  return (
    <div className="space-y-6 pb-24">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="t-group text-[var(--ok)]">
              Discipline & Accountability Core
            </span>
            <span className="text-[var(--text-3)]">·</span>
            <span className="t-caption font-mono">{currentWeekInfo.weekId}</span>
          </div>
          <h2 className="t-title text-xl font-bold mt-0.5">
            Weekly Financial Closing System
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsClosingWizardOpen(true)}
            className="px-4 py-2 text-xs font-semibold text-[var(--text)] glass glass--pill hover:bg-white/40 border border-white/60 shadow-[var(--glass-shadow)] transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <ShieldCheck className="w-4 h-4 stroke-[1.8]" />
            Launch 7-Step Closing Sequence
          </button>
        </div>
      </div>

      {/* Main Weekly Checkpoint Status Card with <WeeklyRing /> */}
      <div className="glass p-6 sm:p-7 shadow-[var(--glass-shadow)]">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <WeeklyRing
              save={{ done: weeklyStatus.savingsDeposited, due: weeklyStatus.savingsExpected }}
              tithe={{ done: weeklyStatus.tithePaid, due: weeklyStatus.titheExpected }}
              salary={{ done: weeklyStatus.salaryTransferred, due: weeklyStatus.salaryRecommended }}
              weekClosed={currentWeekClose?.status === 'completed' || weeklyStatus.status === 'WEEK_COMPLETE'}
              weekStatus={weeklyStatus.status === 'WEEK_COMPLETE' ? 'complete' : weeklyStatus.status === 'ACTION_REQUIRED' ? 'action' : 'not_closed'}
            />

            <div className="space-y-1.5 text-center sm:text-left">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <span className="t-group font-mono">
                  Week {currentWeekInfo.weekNumber} ({currentWeekInfo.startDate} to {currentWeekInfo.endDate})
                </span>
                <span className="text-[var(--text-3)]">·</span>
                
                {/* Status chip: Complete = var(--ok), Action required = var(--pending), Not closed = var(--alert) as soft glass pills */}
                <span className={`px-3 py-1 text-xs rounded-full border font-semibold glass glass--pill ${
                  weeklyStatus.status === 'WEEK_COMPLETE'
                    ? 'bg-[var(--ok)]/15 text-[var(--ok)] border-[var(--ok)]/40 shadow-xs'
                    : weeklyStatus.status === 'ACTION_REQUIRED'
                    ? 'bg-[var(--pending)]/15 text-[var(--pending)] border-[var(--pending)]/40 shadow-xs'
                    : 'bg-[var(--alert)]/15 text-[var(--alert)] border-[var(--alert)]/40 shadow-xs'
                }`}>
                  {weeklyStatus.status === 'WEEK_COMPLETE' ? '■ COMPLETE' :
                   weeklyStatus.status === 'ACTION_REQUIRED' ? '■ ACTION REQUIRED' : '■ NOT CLOSED'}
                </span>
              </div>

              <h3 className="t-title text-base sm:text-lg">
                {weeklyStatus.status === 'WEEK_COMPLETE'
                  ? 'All Weekly Obligations Cleared & Verified'
                  : 'Weekly Obligations Pending Verification'}
              </h3>
              <p className="t-label max-w-xl">
                The system locks a week only after all daily worker payments are cleared, savings are deposited with bank reference codes, and Saturday tithe is verified with transaction receipts.
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsClosingWizardOpen(true)}
            className="px-5 py-3 glass glass--pill is-active text-[var(--text)] font-semibold text-xs border border-white/80 shadow-[var(--glow)] transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0"
          >
            <span>Execute 7-Step Sequence</span>
            <ArrowRight className="w-4 h-4" strokeWidth={1.5} />
          </button>
        </div>
      </div>

      {/* The Mandatory Closing Sequence Overview */}
      <div className="p-5 glass space-y-4">
        <div className="flex items-center justify-between border-b border-white/20 pb-2">
          <span className="t-group">
            Mandatory Closing Sequence · Checklist State
          </span>
          <span className="t-caption font-mono font-medium">
            Enforced Weekly Cycle
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          
          <div className="p-3.5 glass glass--tile flex items-center justify-between">
            <div>
              <span className="text-[var(--text)] font-semibold block">1. Audit Records</span>
              <span className="t-caption text-left text-[11px] block">All job payments, product sales, and costs</span>
            </div>
            <span className="font-mono text-[var(--ok)] font-semibold">✓ Logged</span>
          </div>

          <div className="p-3.5 glass glass--tile flex items-center justify-between">
            <div>
              <span className="text-[var(--text)] font-semibold block">2. Daily Workers Settled</span>
              <span className="t-caption text-left text-[11px] block">Direct labour expenses cleared</span>
            </div>
            <span className={`font-mono font-semibold ${!weeklyStatus.hasUnpaidWorkers ? 'text-[var(--ok)]' : 'text-[var(--alert)]'}`}>
              {!weeklyStatus.hasUnpaidWorkers ? '✓ Cleared' : `${weeklyStatus.unpaidWorkersCount} Pending`}
            </span>
          </div>

          <div className="p-3.5 glass glass--tile flex items-center justify-between">
            <div>
              <span className="text-[var(--text)] font-semibold block">3. Bank Savings Deposit</span>
              <span className="t-caption text-left text-[11px] block">
                Expected: {formatCurrency(weeklyStatus.savingsExpected, settings.currency)}
              </span>
            </div>
            <span className={`font-mono font-semibold ${isSavingsDone ? 'text-[var(--ok)]' : 'text-[var(--pending)]'}`}>
              {isSavingsDone ? '✓ Banked' : 'Pending Ref'}
            </span>
          </div>

          <div className="p-3.5 glass glass--tile flex items-center justify-between">
            <div>
              <span className="text-[var(--text)] font-semibold block">4. Saturday Tithe Paid</span>
              <span className="t-caption text-left text-[11px] block">
                Due: {formatCurrency(weeklyStatus.titheExpected, settings.currency)}
              </span>
            </div>
            <span className={`font-mono font-semibold ${isTitheDone ? 'text-[var(--ok)]' : 'text-[var(--pending)]'}`}>
              {isTitheDone ? '✓ Verified' : 'Pending Receipt'}
            </span>
          </div>

          <div className="p-3.5 glass glass--tile flex items-center justify-between">
            <div>
              <span className="text-[var(--text)] font-semibold block">5. Owner Salary Calculated</span>
              <span className="t-caption text-left text-[11px] block">
                Rule: {settings.salaryRuleType === 'percentage' ? `${settings.salaryProfitPercentage}% of Profit` : 'Cap'}
              </span>
            </div>
            <span className="font-mono text-[var(--ok)] font-semibold">
              {formatCurrency(weeklyStatus.salaryRecommended, settings.currency)}
            </span>
          </div>

          <div className="p-3.5 glass glass--tile flex items-center justify-between">
            <div>
              <span className="text-[var(--text)] font-semibold block">6. Salary Transfer Executed</span>
              <span className="t-caption text-left text-[11px] block">Company → Personal transfer logged</span>
            </div>
            <span className={`font-mono font-semibold ${isSalaryDone ? 'text-[var(--ok)]' : 'text-[var(--text-3)]'}`}>
              {isSalaryDone ? `✓ ${formatCurrency(weeklyStatus.salaryTransferred, settings.currency)}` : 'Optional / Retained'}
            </span>
          </div>

        </div>
      </div>

      {/* Historical Week Closings Log */}
      <div className="space-y-3">
        <h3 className="t-group">
          Weekly Closes Audit Trail
        </h3>

        <div className="glass overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-white/10 text-[var(--text-2)] uppercase tracking-wider font-semibold border-b border-white/20">
                <tr>
                  <th className="px-4 py-3">Week</th>
                  <th className="px-4 py-3">Dates</th>
                  <th className="px-4 py-3">Revenue</th>
                  <th className="px-4 py-3">Net Profit</th>
                  <th className="px-4 py-3">Savings Banked</th>
                  <th className="px-4 py-3">Tithe Verified</th>
                  <th className="px-4 py-3">Owner Salary</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/20">
                {weeklyCloses.map((wc) => (
                  <tr key={wc.id} className="hover:bg-white/10">
                    <td className="px-4 py-3 font-mono font-bold text-[var(--text)]">W{wc.weekNumber}</td>
                    <td className="px-4 py-3 font-mono text-[var(--text-2)]">{wc.startDate} to {wc.endDate}</td>
                    <td className="px-4 py-3 font-mono font-semibold text-[var(--text)]">{formatCurrency(wc.totalIncome, settings.currency)}</td>
                    <td className="px-4 py-3 font-mono text-[var(--text-2)] font-semibold">{formatCurrency(wc.netBusinessProfit, settings.currency)}</td>
                    <td className="px-4 py-3 font-mono text-[var(--text)] font-semibold">
                      {formatCurrency(wc.savingsDeposited, settings.currency)}
                      {wc.savingsReference && <span className="block text-[10px] text-[var(--text-3)] font-mono font-normal">{wc.savingsReference}</span>}
                    </td>
                    <td className="px-4 py-3 font-mono text-[var(--text)] font-semibold">
                      {formatCurrency(wc.tithePaid, settings.currency)}
                      {wc.titheReference && <span className="block text-[10px] text-[var(--text-3)] font-mono font-normal">{wc.titheReference}</span>}
                    </td>
                    <td className="px-4 py-3 font-mono text-[var(--text)] font-semibold">
                      {formatCurrency(wc.salaryTransferred, settings.currency)}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase glass glass--pill ${
                        wc.status === 'completed' ? 'text-[var(--ok)] bg-[var(--ok)]/15 border-[var(--ok)]/40' :
                        wc.status === 'overridden' ? 'text-[var(--pending)] bg-[var(--pending)]/15 border-[var(--pending)]/40' :
                        'text-[var(--alert)] bg-[var(--alert)]/15 border-[var(--alert)]/40'
                      }`}>
                        {wc.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal Wizard */}
      <WeeklyCloseModal
        isOpen={isClosingWizardOpen}
        onClose={() => setIsClosingWizardOpen(false)}
      />

    </div>
  );
};
