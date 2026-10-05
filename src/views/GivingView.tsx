import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { formatCurrency } from '../services/financialEngine';
import { GivingDecisionModal } from '../components/GivingDecisionModal';
import { 
  HeartHandshake, 
  Sparkles, 
  Users, 
  CheckCircle2, 
  TrendingDown, 
  History,
  Phone,
  ShieldCheck,
  Plus
} from 'lucide-react';

export const GivingView: React.FC = () => {
  const { givingRequests, settings } = useApp();
  const [isDecisionModalOpen, setIsDecisionModalOpen] = useState(false);

  const now = new Date();
  const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  
  const currentMonthGivings = givingRequests.filter(g => g.monthKey === currentMonthKey);
  const actualGivenThisMonth = currentMonthGivings
    .filter(g => g.amountGiven > 0)
    .reduce((sum, g) => sum + g.amountGiven, 0);

  const totalRequestedThisMonth = currentMonthGivings.reduce((sum, g) => sum + g.amountRequested, 0);
  const totalRecommendedThisMonth = currentMonthGivings.reduce((sum, g) => sum + g.recommendedAmount, 0);

  const uniquePeopleSupported = new Set(
    currentMonthGivings.filter(g => g.amountGiven > 0).map(g => g.personName.trim().toLowerCase())
  ).size;

  const remainingBudget = Math.max(0, settings.monthlyGivingBudget - actualGivenThisMonth);
  const percentUsed = Math.min(100, Math.round((actualGivenThisMonth / settings.monthlyGivingBudget) * 100));

  return (
    <div className="space-y-6 pb-20">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="t-group text-[var(--ok)]">
              Personal Discipline
            </span>
            <span className="text-[var(--text-3)]">·</span>
            <span className="t-caption">Runway Protection Algorithm</span>
          </div>
          <h2 className="t-title text-xl font-bold mt-0.5">
            Smart Support & Giving System
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsDecisionModalOpen(true)}
            className="px-4 py-2 glass glass--pill is-active text-[var(--text)] font-semibold text-xs border border-white/60 shadow-[var(--glow)] transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 stroke-[1.8]" />
            New Giving Request
          </button>
        </div>
      </div>

      {/* Giving Dashboard Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        
        {/* Monthly Budget Card */}
        <div className="p-4 glass glass--tile space-y-1 shadow-[var(--glass-shadow)]">
          <span className="t-label block">Monthly Giving Budget</span>
          <p className="t-readout font-mono font-semibold">
            {formatCurrency(settings.monthlyGivingBudget, settings.currency)}
          </p>
          <span className="t-caption text-left font-mono block">
            {percentUsed}% utilized this month
          </span>
        </div>

        {/* Actual Given */}
        <div className="p-4 glass glass--tile space-y-1 shadow-[var(--glass-shadow)]">
          <span className="t-label block">Actual Given</span>
          <p className="t-readout font-mono font-semibold text-[var(--text)]">
            {formatCurrency(actualGivenThisMonth, settings.currency)}
          </p>
          <span className="t-caption text-left block">
            Deducted from personal wallet
          </span>
        </div>

        {/* Remaining Budget */}
        <div className="p-4 glass glass--tile space-y-1 shadow-[var(--glass-shadow)]">
          <span className="t-label block">Remaining Budget</span>
          <p className="t-readout font-mono font-semibold text-[var(--ok)]">
            {formatCurrency(remainingBudget, settings.currency)}
          </p>
          <span className="t-caption text-left text-[var(--ok)] font-medium block">
            Safe giving balance
          </span>
        </div>

        {/* People Supported */}
        <div className="p-4 glass glass--tile space-y-1 shadow-[var(--glass-shadow)]">
          <span className="t-label block">People Supported</span>
          <p className="t-readout font-mono font-semibold">
            {uniquePeopleSupported} / {settings.maxMonthlyPeopleSupported}
          </p>
          <span className="t-caption text-left block">
            Monthly limit cap
          </span>
        </div>

      </div>

      {/* Comparison: Requested vs Recommended vs Given */}
      <div className="p-5 glass flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-[var(--glass-shadow)]">
        <div>
          <span className="t-group block">
            Discipline Comparison · This Month
          </span>
          <p className="t-label mt-0.5">
            The algorithm protects you from burning your giving budget too early in the month.
          </p>
        </div>
        <div className="flex items-center gap-4 text-xs font-mono">
          <div>
            <span className="t-caption text-left block uppercase font-medium">Total Requested</span>
            <span className="text-[var(--text)] font-semibold">{formatCurrency(totalRequestedThisMonth, settings.currency)}</span>
          </div>
          <span className="text-[var(--text-3)] font-bold">→</span>
          <div>
            <span className="t-caption text-left block uppercase font-medium">Recommended</span>
            <span className="text-[var(--text)] font-semibold">{formatCurrency(totalRecommendedThisMonth, settings.currency)}</span>
          </div>
          <span className="text-[var(--text-3)] font-bold">→</span>
          <div>
            <span className="t-caption text-left block uppercase font-medium">Actually Given</span>
            <span className="text-[var(--ok)] font-semibold">{formatCurrency(actualGivenThisMonth, settings.currency)}</span>
          </div>
        </div>
      </div>

      {/* Giving Requests History & Audit Log */}
      <div className="space-y-3">
        <h3 className="t-group">
          Giving Requests & Decision Log
        </h3>

        {givingRequests.length === 0 ? (
          <div className="p-10 text-center glass t-caption">
            No giving requests logged yet. Use "New Giving Request" when someone asks for financial assistance.
          </div>
        ) : (
          <div className="glass overflow-hidden shadow-[var(--glass-shadow)]">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-white/10 text-[var(--text-2)] uppercase tracking-wider font-semibold border-b border-white/20">
                  <tr>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Person</th>
                    <th className="px-4 py-3">Reason</th>
                    <th className="px-4 py-3">Priority</th>
                    <th className="px-4 py-3">Requested</th>
                    <th className="px-4 py-3">Recommended</th>
                    <th className="px-4 py-3">Actually Given</th>
                    <th className="px-4 py-3">Decision</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/20">
                  {givingRequests.map((req) => (
                    <tr key={req.id} className="hover:bg-white/10">
                      <td className="px-4 py-3 font-mono text-[var(--text-2)]">{req.date}</td>
                      <td className="px-4 py-3 font-semibold text-[var(--text)]">
                        {req.personName}
                        {req.phone && <span className="block text-[10px] font-mono text-[var(--text-3)] font-normal">{req.phone}</span>}
                      </td>
                      <td className="px-4 py-3 text-[var(--text-2)] max-w-xs truncate">{req.reason}</td>
                      <td className="px-4 py-3 capitalize">
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full glass glass--pill ${
                          req.priority === 'urgent' ? 'text-[var(--alert)] bg-[var(--alert)]/15 border-[var(--alert)]/40' :
                          req.priority === 'important' ? 'text-[var(--pending)] bg-[var(--pending)]/15 border-[var(--pending)]/40' : 'text-[var(--text-2)]'
                        }`}>
                          {req.priority.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono text-[var(--text-2)]">
                        {formatCurrency(req.amountRequested, settings.currency)}
                      </td>
                      <td className="px-4 py-3 font-mono font-semibold text-[var(--text)]">
                        {formatCurrency(req.recommendedAmount, settings.currency)}
                      </td>
                      <td className="px-4 py-3 font-mono font-semibold text-[var(--ok)]">
                        {formatCurrency(req.amountGiven, settings.currency)}
                      </td>
                      <td className="px-4 py-3 text-[11px] font-medium text-[var(--text-2)] capitalize">
                        {req.decision.replace(/_/g, ' ')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Decision Modal */}
      <GivingDecisionModal
        isOpen={isDecisionModalOpen}
        onClose={() => setIsDecisionModalOpen(false)}
      />

    </div>
  );
};
