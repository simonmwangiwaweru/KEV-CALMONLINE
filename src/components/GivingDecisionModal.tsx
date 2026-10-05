import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { PriorityLevel } from '../types';
import { calculateGivingRecommendation, formatCurrency } from '../services/financialEngine';
import { X, Sparkles } from 'lucide-react';

interface GivingDecisionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GivingDecisionModal: React.FC<GivingDecisionModalProps> = ({
  isOpen,
  onClose
}) => {
  const { settings, givingRequests, submitGivingRequest } = useApp();

  const [personName, setPersonName] = useState('');
  const [phone, setPhone] = useState('');
  const [amountRequested, setAmountRequested] = useState('1000');
  const [reason, setReason] = useState('');
  const [priority, setPriority] = useState<PriorityLevel>('important');
  const [customAmount, setCustomAmount] = useState('500');
  const [referenceCode, setReferenceCode] = useState('');
  const [notes, setNotes] = useState('');
  const [step, setStep] = useState<'input' | 'decision'>('input');

  const now = new Date();
  const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const monthGivings = givingRequests.filter(g => g.monthKey === currentMonthKey && g.amountGiven > 0);
  const alreadyGiven = monthGivings.reduce((sum, g) => sum + g.amountGiven, 0);
  const peopleCount = new Set(monthGivings.map(g => g.personName.trim().toLowerCase())).size;

  const numRequested = parseFloat(amountRequested) || 0;

  const recommendation = useMemo(() => {
    return calculateGivingRecommendation(
      numRequested,
      priority,
      settings.monthlyGivingBudget,
      alreadyGiven,
      peopleCount,
      settings.maxMonthlyPeopleSupported,
      now
    );
  }, [numRequested, priority, settings, alreadyGiven, peopleCount]);

  if (!isOpen) return null;

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!personName.trim() || numRequested <= 0) return;
    setCustomAmount(String(recommendation.recommendedAmount));
    setStep('decision');
  };

  const handleConfirmDecision = (decision: 'give_recommended' | 'adjust' | 'give_full' | 'do_not_give') => {
    submitGivingRequest(
      personName.trim(),
      phone.trim(),
      numRequested,
      reason.trim(),
      priority,
      decision,
      parseFloat(customAmount) || 0,
      referenceCode.trim() || undefined,
      notes.trim() || undefined
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/20 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="w-full max-w-lg glass-modal rounded-[28px] shadow-[var(--glass-shadow)] overflow-hidden flex flex-col max-h-[90vh] animate-modal-enter"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4.5 border-b border-white/20 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="t-group text-[var(--ok)]">
                Smart Support Engine
              </span>
              <span className="text-[var(--text-3)]">·</span>
              <span className="t-caption">Personal Budget Protection</span>
            </div>
            <h3 className="t-title text-base sm:text-lg mt-0.5">Support / Giving Request</h3>
          </div>
          <button
            onClick={onClose}
            className="icon-btn"
            aria-label="Close modal"
          >
            <X className="w-4 h-4 text-[var(--text-2)]" strokeWidth={1.5} />
          </button>
        </div>

        {/* Month Context Bar */}
        <div className="px-6 py-3 bg-white/10 border-b border-white/20 flex items-center justify-between text-xs">
          <div>
            <span className="t-label">Monthly Budget:</span>{' '}
            <span className="font-mono font-semibold text-[var(--text)]">{formatCurrency(settings.monthlyGivingBudget, settings.currency)}</span>
          </div>
          <div>
            <span className="t-label">Remaining:</span>{' '}
            <span className="font-mono font-semibold text-[var(--ok)]">
              {formatCurrency(recommendation.remainingBudget, settings.currency)}
            </span>
          </div>
          <div>
            <span className="t-label">Supported:</span>{' '}
            <span className="font-mono font-semibold text-[var(--text)]">
              {peopleCount} / {settings.maxMonthlyPeopleSupported}
            </span>
          </div>
        </div>

        {step === 'input' ? (
          <form onSubmit={handleCalculate} className="p-6 overflow-y-auto space-y-4">
            <div>
              <label className="block t-label mb-1">
                Person Requesting Help
              </label>
              <input
                type="text"
                required
                value={personName}
                onChange={(e) => setPersonName(e.target.value)}
                placeholder="e.g. Uncle Peter, Cousin Jane"
                className="w-full px-3.5 py-2 glass-input text-sm focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block t-label mb-1">
                  Phone (Optional)
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+254 7..."
                  className="w-full px-3.5 py-2 glass-input text-sm font-mono focus:outline-none"
                />
              </div>

              <div>
                <label className="block t-label mb-1">
                  Amount Requested ({settings.currency})
                </label>
                <input
                  type="number"
                  step="any"
                  required
                  value={amountRequested}
                  onChange={(e) => setAmountRequested(e.target.value)}
                  className="w-full px-3.5 py-2 glass-input font-mono font-semibold text-base focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block t-label mb-1">
                Reason / Need
              </label>
              <textarea
                required
                rows={2}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="e.g. Prescription medicine refill, school bus fare"
                className="w-full px-3.5 py-2 glass-input text-sm focus:outline-none resize-none"
              />
            </div>

            <div>
              <label className="block t-label mb-1">
                Urgency & Priority
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {(['urgent', 'important', 'normal', 'not_important'] as PriorityLevel[]).map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setPriority(lvl)}
                    className={`py-2 px-2.5 rounded-full text-xs font-semibold capitalize transition-all cursor-pointer ${
                      priority === lvl
                        ? 'glass glass--pill is-active text-[var(--text)] shadow-[var(--glow)]'
                        : 'glass glass--pill text-[var(--text-2)] hover:text-[var(--text)]'
                    }`}
                  >
                    {lvl.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-3 glass glass--pill is-active text-[var(--text)] font-semibold text-sm border border-white/80 shadow-[var(--glow)] transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-4 h-4 stroke-[2]" />
                Run Smart Recommendation
              </button>
            </div>
          </form>
        ) : (
          <div className="p-6 overflow-y-auto space-y-4">
            {/* Recommendation Result Card */}
            <div className="p-4 glass glass--tile space-y-2 shadow-[var(--glass-shadow)] border border-[var(--ok)]/40 bg-[var(--ok)]/15">
              <div className="flex items-center justify-between">
                <span className="t-group text-[var(--ok)]">
                  Recommended Giving Amount
                </span>
                <span className="t-caption font-mono">
                  {recommendation.daysRemaining} days left in month
                </span>
              </div>
              <p className="text-3xl font-semibold font-mono text-[var(--ok)]">
                {formatCurrency(recommendation.recommendedAmount, settings.currency)}
              </p>
              <p className="t-label">
                {recommendation.reason}
              </p>
            </div>

            {/* Requested vs Recommended Summary */}
            <div className="p-3.5 glass glass--tile text-xs space-y-1.5 shadow-[var(--glass-shadow)]">
              <div className="flex justify-between">
                <span className="t-label">Person:</span>
                <span className="text-[var(--text)] font-semibold">{personName}</span>
              </div>
              <div className="flex justify-between">
                <span className="t-label">Amount Requested:</span>
                <span className="font-mono text-[var(--text)] font-semibold">
                  {formatCurrency(numRequested, settings.currency)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="t-label">Priority:</span>
                <span className="capitalize text-[var(--pending)] font-semibold">{priority}</span>
              </div>
            </div>

            {/* Reference Code input */}
            <div>
              <label className="block t-label mb-1">
                Transaction Reference Code (If giving via M-Pesa / Bank)
              </label>
              <input
                type="text"
                value={referenceCode}
                onChange={(e) => setReferenceCode(e.target.value)}
                placeholder="e.g. QKD99551L2"
                className="w-full px-3.5 py-2 glass-input font-mono text-xs focus:outline-none uppercase"
              />
            </div>

            {/* Custom Adjust input if adjusting */}
            <div>
              <label className="block t-label mb-1">
                Adjust Custom Amount ({settings.currency})
              </label>
              <input
                type="number"
                step="any"
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
                className="w-full px-3.5 py-2 glass-input font-mono text-sm focus:outline-none"
              />
            </div>

            {/* Decision Buttons */}
            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                type="button"
                onClick={() => handleConfirmDecision('give_recommended')}
                className="py-2.5 px-3 glass glass--pill is-active text-[var(--text)] font-semibold text-xs border border-white/80 shadow-[var(--glow)] transition-all cursor-pointer"
              >
                Give Recommended ({formatCurrency(recommendation.recommendedAmount, settings.currency)})
              </button>

              <button
                type="button"
                onClick={() => handleConfirmDecision('adjust')}
                className="py-2.5 px-3 glass glass--pill text-[var(--text-2)] hover:text-[var(--text)] font-semibold text-xs transition-all cursor-pointer shadow-[var(--glass-shadow)]"
              >
                Give Adjusted ({formatCurrency(parseFloat(customAmount) || 0, settings.currency)})
              </button>

              <button
                type="button"
                onClick={() => handleConfirmDecision('give_full')}
                className="py-2.5 px-3 glass glass--pill text-[var(--pending)] hover:bg-[var(--pending)]/10 font-semibold text-xs transition-all cursor-pointer shadow-[var(--glass-shadow)] border border-[var(--pending)]/40"
              >
                Give Full Requested ({formatCurrency(numRequested, settings.currency)})
              </button>

              <button
                type="button"
                onClick={() => handleConfirmDecision('do_not_give')}
                className="py-2.5 px-3 glass glass--pill text-[var(--text-3)] hover:text-[var(--text)] font-medium text-xs transition-all cursor-pointer shadow-[var(--glass-shadow)]"
              >
                Do Not Give (Log Request)
              </button>
            </div>

            <button
              type="button"
              onClick={() => setStep('input')}
              className="w-full py-2 text-xs text-[var(--text-2)] hover:text-[var(--text)] transition-colors font-semibold cursor-pointer"
            >
              ← Back to Edit Request
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
