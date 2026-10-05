import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { formatCurrency } from '../services/financialEngine';
import confetti from 'canvas-confetti';
import { 
  X, 
  CheckCircle2, 
  AlertTriangle, 
  Lock, 
  ArrowRight, 
  ArrowLeft
} from 'lucide-react';

interface WeeklyCloseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WeeklyCloseModal: React.FC<WeeklyCloseModalProps> = ({
  isOpen,
  onClose
}) => {
  const {
    currentWeekInfo,
    currentWeekClose,
    weeklyStatus,
    recordWeeklySavingsDeposit,
    recordWeeklyTithePayment,
    transferWeeklyOwnerSalary,
    completeWeeklyClose,
    overrideWeeklyClose,
    settings
  } = useApp();

  const [activeStep, setActiveStep] = useState<number>(1);

  // Form states for each step
  // Step 3: Savings
  const [savingsAmount, setSavingsAmount] = useState<string>(String(weeklyStatus.savingsExpected));
  const [savingsAccount, setSavingsAccount] = useState<string>('KCB Goal Account 118492023');
  const [savingsReference, setSavingsReference] = useState<string>('');

  // Step 4: Tithe
  const [titheAmount, setTitheAmount] = useState<string>(String(weeklyStatus.titheExpected));
  const [titheMethod, setTitheMethod] = useState<string>('M-Pesa Paybill');
  const [titheReference, setTitheReference] = useState<string>('');

  // Step 6: Salary
  const [salaryAmount, setSalaryAmount] = useState<string>(String(weeklyStatus.salaryRecommended));
  const [salaryMethod, setSalaryMethod] = useState<string>('M-Pesa');
  const [salaryReference, setSalaryReference] = useState<string>('');

  // Override modal state
  const [isOverrideMode, setIsOverrideMode] = useState<boolean>(false);
  const [overrideReason, setOverrideReason] = useState<string>('');

  if (!isOpen) return null;

  const handleDepositSavings = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(savingsAmount);
    if (isNaN(num) || num <= 0 || !savingsReference.trim()) return;

    recordWeeklySavingsDeposit(num, savingsAccount, savingsReference.trim());
    setActiveStep(4);
  };

  const handlePayTithe = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(titheAmount);
    if (isNaN(num) || num <= 0 || !titheReference.trim()) return;

    recordWeeklyTithePayment(num, titheMethod, titheReference.trim());
    setActiveStep(5);
  };

  const handleTransferSalary = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(salaryAmount);
    if (isNaN(num) || num <= 0 || !salaryReference.trim()) return;

    transferWeeklyOwnerSalary(num, salaryMethod, salaryReference.trim());
    setActiveStep(7);
  };

  const handleFinalClose = () => {
    completeWeeklyClose();
    confetti({
      particleCount: 120,
      spread: 70,
      origin: { y: 0.6 }
    });
    onClose();
  };

  const handleExecuteOverride = (e: React.FormEvent) => {
    e.preventDefault();
    if (!overrideReason.trim()) return;

    const remainingSavings = Math.max(0, weeklyStatus.savingsExpected - weeklyStatus.savingsDeposited);
    const remainingTithe = Math.max(0, weeklyStatus.titheExpected - weeklyStatus.tithePaid);

    overrideWeeklyClose(
      currentWeekClose?.id || `wc-${currentWeekInfo.weekNumber}`,
      overrideReason.trim(),
      remainingSavings,
      remainingTithe
    );
    onClose();
  };

  const isSavingsDone = weeklyStatus.savingsDeposited >= weeklyStatus.savingsExpected && weeklyStatus.savingsExpected > 0;
  const isTitheDone = weeklyStatus.tithePaid >= weeklyStatus.titheExpected && !!currentWeekClose?.titheVerified;
  const isSalaryDone = weeklyStatus.salaryTransferred > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/20 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="w-full max-w-2xl glass-modal rounded-[28px] shadow-[var(--glass-shadow)] overflow-hidden flex flex-col max-h-[92vh] animate-modal-enter"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4.5 border-b border-white/20 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="t-group text-[var(--ok)]">
                Weekly Discipline Assistant
              </span>
              <span className="text-[var(--text-3)]">·</span>
              <span className="t-caption font-mono">{currentWeekInfo.weekId}</span>
            </div>
            <h3 className="t-title text-base sm:text-lg mt-0.5">
              7-Step Mandatory Closing Sequence
            </h3>
          </div>
          <button
            onClick={onClose}
            className="icon-btn"
            aria-label="Close modal"
          >
            <X className="w-4 h-4 text-[var(--text-2)]" strokeWidth={1.5} />
          </button>
        </div>

        {/* 7-Step Navigation Indicator */}
        <div className="px-6 py-3 bg-white/10 border-b border-white/20 flex items-center justify-between overflow-x-auto gap-2">
          {[
            { num: 1, label: 'Audit Records' },
            { num: 2, label: 'Net Profit' },
            { num: 3, label: 'Bank Savings' },
            { num: 4, label: 'Saturday Tithe' },
            { num: 5, label: 'Salary Rule' },
            { num: 6, label: 'Transfer Pay' },
            { num: 7, label: 'Final Lock' }
          ].map((s) => (
            <button
              key={s.num}
              onClick={() => setActiveStep(s.num)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs whitespace-nowrap transition-all cursor-pointer ${
                activeStep === s.num
                  ? 'glass glass--pill is-active text-[var(--text)] shadow-[var(--glow)] font-semibold'
                  : 'text-[var(--text-2)] hover:text-[var(--text)]'
              }`}
            >
              <span className={`w-4 h-4 rounded-full text-[10px] flex items-center justify-center font-mono ${
                activeStep === s.num ? 'bg-white/80 text-[var(--text)] font-bold' : 'glass text-[var(--text-3)]'
              }`}>
                {s.num}
              </span>
              <span className="hidden sm:inline">{s.label}</span>
            </button>
          ))}
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6">

          {/* STEP 1: Audit Records */}
          {activeStep === 1 && (
            <div className="space-y-4">
              <h4 className="t-group">
                Step 1: Check Incomes, Job Costs & Daily Workers
              </h4>
              <p className="t-label">
                Ensure all incoming revenue from jobs, product sales, and daily hired labour payments are logged before calculating weekly profit.
              </p>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-4 glass glass--tile shadow-[var(--glass-shadow)]">
                  <span className="t-label block mb-1">Money Received This Week:</span>
                  <span className="text-xl font-semibold font-mono text-[var(--ok)]">
                    {formatCurrency(weeklyStatus.moneyReceived, settings.currency)}
                  </span>
                </div>
                <div className="p-4 glass glass--tile shadow-[var(--glass-shadow)]">
                  <span className="t-label block mb-1">Direct Costs (Transport/Labour):</span>
                  <span className="text-xl font-semibold font-mono text-[var(--pending)]">
                    {formatCurrency(weeklyStatus.directCosts, settings.currency)}
                  </span>
                </div>
              </div>

              {weeklyStatus.hasUnpaidWorkers ? (
                <div className="p-4 glass rounded-[var(--r-card)] border border-[var(--alert)]/40 bg-[var(--alert)]/15 flex items-start gap-3 shadow-[var(--glass-shadow)]">
                  <AlertTriangle className="w-5 h-5 text-[var(--alert)] shrink-0 mt-0.5" strokeWidth={1.5} />
                  <div>
                    <h5 className="t-group text-[var(--alert)]">Action Required: Unpaid Workers Detected</h5>
                    <p className="t-label text-[var(--alert)] mt-1">
                      You have {weeklyStatus.unpaidWorkersCount} unpaid worker record(s). Workers must be settled before week closing to prevent understating direct job costs.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-4 glass rounded-[var(--r-card)] border border-[var(--ok)]/40 bg-[var(--ok)]/15 flex items-center gap-3 shadow-[var(--glass-shadow)]">
                  <CheckCircle2 className="w-5 h-5 text-[var(--ok)] shrink-0" strokeWidth={1.5} />
                  <span className="t-label text-[var(--ok)] font-medium">
                    All hired worker payments for this week are cleared and verified.
                  </span>
                </div>
              )}

              <div className="pt-4 flex justify-end">
                <button
                  onClick={() => setActiveStep(2)}
                  className="px-4 py-2 glass glass--pill is-active text-[var(--text)] font-semibold text-xs border border-white/60 shadow-[var(--glow)] flex items-center gap-1.5 cursor-pointer"
                >
                  Proceed to Step 2 <ArrowRight className="w-3.5 h-3.5" strokeWidth={1.5} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Calculate Business Position */}
          {activeStep === 2 && (
            <div className="space-y-4">
              <h4 className="t-group">
                Step 2: Calculate Business Position & Available Profit
              </h4>
              <p className="t-label">
                Formula: Total Money Received − Direct Job Costs − General Business Expenses = Available Business Profit.
              </p>

              <div className="p-4.5 glass glass--tile space-y-2 text-xs shadow-[var(--glass-shadow)]">
                <div className="flex justify-between py-1">
                  <span className="t-label">Total Money Received:</span>
                  <span className="font-mono font-semibold text-[var(--text)]">
                    {formatCurrency(weeklyStatus.moneyReceived, settings.currency)}
                  </span>
                </div>
                <div className="flex justify-between py-1 text-[var(--pending)]">
                  <span>Less Direct Production & Job Costs:</span>
                  <span className="font-mono font-semibold">
                    − {formatCurrency(weeklyStatus.directCosts, settings.currency)}
                  </span>
                </div>
                <div className="flex justify-between py-1 t-label border-b border-white/20 pb-2">
                  <span>Less Company Operations:</span>
                  <span className="font-mono">
                    − {formatCurrency(weeklyStatus.companyExpenses, settings.currency)}
                  </span>
                </div>
                <div className="flex justify-between py-2 font-semibold text-sm">
                  <span className="text-[var(--text)]">Available Business Profit:</span>
                  <span className="font-mono text-base font-semibold text-[var(--ok)]">
                    {formatCurrency(weeklyStatus.netBusinessProfit, settings.currency)}
                  </span>
                </div>
              </div>

              <div className="pt-4 flex justify-between">
                <button
                  onClick={() => setActiveStep(1)}
                  className="text-xs text-[var(--text-2)] hover:text-[var(--text)] glass glass--pill px-3.5 py-1.5 font-medium flex items-center gap-1"
                >
                  <ArrowLeft className="w-3.5 h-3.5" strokeWidth={1.5} /> Back
                </button>
                <button
                  onClick={() => setActiveStep(3)}
                  className="px-4 py-2 glass glass--pill is-active text-[var(--text)] font-semibold text-xs border border-white/60 shadow-[var(--glow)] flex items-center gap-1.5 cursor-pointer"
                >
                  Proceed to Step 3: Savings <ArrowRight className="w-3.5 h-3.5" strokeWidth={1.5} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Complete Savings / Banking */}
          {activeStep === 3 && (
            <div className="space-y-4">
              <h4 className="t-group">
                Step 3: Complete Weekly Savings Deposit
              </h4>
              <p className="t-label">
                A non-negotiable rule of the system: Transfer the calculated weekly savings into your bank/goal account and record the deposit reference code.
              </p>

              {isSavingsDone ? (
                <div className="p-4 glass rounded-[var(--r-card)] border border-[var(--ok)]/40 bg-[var(--ok)]/15 space-y-2 shadow-[var(--glass-shadow)]">
                  <div className="flex items-center gap-2 text-[var(--ok)] font-semibold text-xs">
                    <CheckCircle2 className="w-4 h-4 text-[var(--ok)]" strokeWidth={1.5} />
                    <span>Savings Completed for this Week</span>
                  </div>
                  <p className="text-xs text-[var(--text)]">
                    Deposited: <span className="font-mono font-semibold">{formatCurrency(weeklyStatus.savingsDeposited, settings.currency)}</span>
                  </p>
                  <p className="t-caption text-left font-mono">
                    Reference: {currentWeekClose?.savingsReference || 'VERIFIED'}
                  </p>
                </div>
              ) : (
                <form onSubmit={handleDepositSavings} className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block t-label mb-1">
                        Amount to Deposit ({settings.currency})
                      </label>
                      <input
                        type="number"
                        step="any"
                        required
                        value={savingsAmount}
                        onChange={(e) => setSavingsAmount(e.target.value)}
                        className="w-full px-3.5 py-2 glass-input font-mono font-semibold text-base focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block t-label mb-1">
                        Deposit Bank / Account Name
                      </label>
                      <input
                        type="text"
                        required
                        value={savingsAccount}
                        onChange={(e) => setSavingsAccount(e.target.value)}
                        placeholder="e.g. KCB Goal Account, Stanbic Money Market"
                        className="w-full px-3.5 py-2 glass-input text-sm focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block t-label mb-1">
                      Bank Deposit / Transaction Reference Code (Required)
                    </label>
                    <input
                      type="text"
                      required
                      value={savingsReference}
                      onChange={(e) => setSavingsReference(e.target.value)}
                      placeholder="e.g. KCB-DEP-99214 or M-Pesa Code"
                      className="w-full px-3.5 py-2 glass-input font-mono text-sm focus:outline-none uppercase"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 glass glass--pill is-active text-[var(--text)] font-semibold text-xs border border-white/60 shadow-[var(--glow)] transition-all cursor-pointer"
                  >
                    Confirm Savings Deposit & Next
                  </button>
                </form>
              )}

              <div className="pt-2 flex justify-between">
                <button onClick={() => setActiveStep(2)} className="text-xs text-[var(--text-2)] hover:text-[var(--text)] glass glass--pill px-3.5 py-1.5 font-medium flex items-center gap-1">
                  <ArrowLeft className="w-3.5 h-3.5" strokeWidth={1.5} /> Back
                </button>
                <button
                  onClick={() => setActiveStep(4)}
                  className="px-4 py-2 glass glass--pill is-active text-[var(--text)] font-semibold text-xs border border-white/60 shadow-[var(--glow)] flex items-center gap-1.5 cursor-pointer"
                >
                  Step 4: Tithe <ArrowRight className="w-3.5 h-3.5" strokeWidth={1.5} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: Pay Saturday Tithe */}
          {activeStep === 4 && (
            <div className="space-y-4">
              <h4 className="t-group">
                Step 4: Saturday Tithe Settlement (Verification Required)
              </h4>
              <p className="t-label">
                User must enter: Amount paid, Date paid, Payment method, Receipt code / transaction reference. Only after a valid amount and reference is entered is the tithe marked PAID AND VERIFIED.
              </p>

              {isTitheDone ? (
                <div className="p-4 glass rounded-[var(--r-card)] border border-[var(--ok)]/40 bg-[var(--ok)]/15 space-y-2 shadow-[var(--glass-shadow)]">
                  <div className="flex items-center gap-2 text-[var(--ok)] font-semibold text-xs">
                    <CheckCircle2 className="w-4 h-4 text-[var(--ok)]" strokeWidth={1.5} />
                    <span>Tithe Paid and Verified</span>
                  </div>
                  <p className="text-xs text-[var(--text)]">
                    Amount: <span className="font-mono font-semibold">{formatCurrency(weeklyStatus.tithePaid, settings.currency)}</span>
                  </p>
                  <p className="t-caption text-left font-mono">
                    Receipt / Code: {currentWeekClose?.titheReference || 'VERIFIED'}
                  </p>
                </div>
              ) : (
                <form onSubmit={handlePayTithe} className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block t-label mb-1">
                        Tithe Amount Due ({settings.currency})
                      </label>
                      <input
                        type="number"
                        step="any"
                        required
                        value={titheAmount}
                        onChange={(e) => setTitheAmount(e.target.value)}
                        className="w-full px-3.5 py-2 glass-input font-mono font-semibold text-base focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block t-label mb-1">
                        Payment Method
                      </label>
                      <select
                        value={titheMethod}
                        onChange={(e) => setTitheMethod(e.target.value)}
                        className="w-full px-3.5 py-2 glass-input text-sm focus:outline-none"
                      >
                        <option value="M-Pesa Paybill" className="bg-[#5f8a68] text-white">M-Pesa Paybill</option>
                        <option value="Church Bank Account" className="bg-[#5f8a68] text-white">Church Bank Account</option>
                        <option value="Cash Offering" className="bg-[#5f8a68] text-white">Cash Offering Envelope</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block t-label mb-1">
                      Receipt Code / M-Pesa Transaction Reference (Required)
                    </label>
                    <input
                      type="text"
                      required
                      value={titheReference}
                      onChange={(e) => setTitheReference(e.target.value)}
                      placeholder="e.g. QKZ772199B"
                      className="w-full px-3.5 py-2 glass-input font-mono text-sm focus:outline-none uppercase"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 glass glass--pill is-active text-[var(--text)] font-semibold text-xs border border-white/60 shadow-[var(--glow)] transition-all cursor-pointer"
                  >
                    Verify & Mark Tithe Paid
                  </button>
                </form>
              )}

              <div className="pt-2 flex justify-between">
                <button onClick={() => setActiveStep(3)} className="text-xs text-[var(--text-2)] hover:text-[var(--text)] glass glass--pill px-3.5 py-1.5 font-medium flex items-center gap-1">
                  <ArrowLeft className="w-3.5 h-3.5" strokeWidth={1.5} /> Back
                </button>
                <button
                  onClick={() => setActiveStep(5)}
                  className="px-4 py-2 glass glass--pill is-active text-[var(--text)] font-semibold text-xs border border-white/60 shadow-[var(--glow)] flex items-center gap-1.5 cursor-pointer"
                >
                  Step 5: Salary <ArrowRight className="w-3.5 h-3.5" strokeWidth={1.5} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 5: Calculate Weekly Salary */}
          {activeStep === 5 && (
            <div className="space-y-4">
              <h4 className="t-group">
                Step 5: Weekly Salary / Owner Pay Calculation
              </h4>
              <p className="t-label">
                Because income is unpredictable, salary is calculated weekly after business obligations.
              </p>

              <div className="p-4.5 glass glass--tile space-y-2 text-xs shadow-[var(--glass-shadow)]">
                <div className="flex justify-between">
                  <span className="t-label">Available Business Profit:</span>
                  <span className="font-mono font-semibold text-[var(--text)]">
                    {formatCurrency(weeklyStatus.netBusinessProfit, settings.currency)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="t-label">Rule in Effect:</span>
                  <span className="text-[var(--ok)] font-semibold">
                    {settings.salaryRuleType === 'percentage' 
                      ? `${settings.salaryProfitPercentage}% of Profit` 
                      : `Weekly Cap KES ${settings.salaryWeeklyCap.toLocaleString()}`}
                  </span>
                </div>
                <div className="flex justify-between border-t border-white/20 pt-2 font-semibold">
                  <span className="text-[var(--text)]">Recommended Owner Salary:</span>
                  <span className="font-mono text-[var(--ok)] text-base">
                    {formatCurrency(weeklyStatus.salaryRecommended, settings.currency)}
                  </span>
                </div>
              </div>

              <div className="pt-2 flex justify-between">
                <button onClick={() => setActiveStep(4)} className="text-xs text-[var(--text-2)] hover:text-[var(--text)] glass glass--pill px-3.5 py-1.5 font-medium flex items-center gap-1">
                  <ArrowLeft className="w-3.5 h-3.5" strokeWidth={1.5} /> Back
                </button>
                <button
                  onClick={() => setActiveStep(6)}
                  className="px-4 py-2 glass glass--pill is-active text-[var(--text)] font-semibold text-xs border border-white/60 shadow-[var(--glow)] flex items-center gap-1.5 cursor-pointer"
                >
                  Step 6: Transfer Salary <ArrowRight className="w-3.5 h-3.5" strokeWidth={1.5} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 6: Transfer Salary */}
          {activeStep === 6 && (
            <div className="space-y-4">
              <h4 className="t-group">
                Step 6: Execute Company → Personal Salary Transfer
              </h4>
              <p className="t-label">
                Moves money from Company Balance into Personal Wallet. Recorded in the append-only ledger.
              </p>

              {isSalaryDone ? (
                <div className="p-4 glass rounded-[var(--r-card)] border border-[var(--ok)]/40 bg-[var(--ok)]/15 space-y-2 shadow-[var(--glass-shadow)]">
                  <div className="flex items-center gap-2 text-[var(--ok)] font-semibold text-xs">
                    <CheckCircle2 className="w-4 h-4 text-[var(--ok)]" strokeWidth={1.5} />
                    <span>Owner Salary Transferred</span>
                  </div>
                  <p className="text-xs text-[var(--text)]">
                    Transferred: <span className="font-mono font-semibold">{formatCurrency(weeklyStatus.salaryTransferred, settings.currency)}</span>
                  </p>
                </div>
              ) : (
                <form onSubmit={handleTransferSalary} className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block t-label mb-1">
                        Salary Transfer Amount ({settings.currency})
                      </label>
                      <input
                        type="number"
                        step="any"
                        required
                        value={salaryAmount}
                        onChange={(e) => setSalaryAmount(e.target.value)}
                        className="w-full px-3.5 py-2 glass-input font-mono font-semibold text-base focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block t-label mb-1">
                        Transfer Channel
                      </label>
                      <select
                        value={salaryMethod}
                        onChange={(e) => setSalaryMethod(e.target.value)}
                        className="w-full px-3.5 py-2 glass-input text-sm focus:outline-none"
                      >
                        <option value="M-Pesa" className="bg-[#5f8a68] text-white">M-Pesa to Personal Line</option>
                        <option value="Bank Transfer" className="bg-[#5f8a68] text-white">Bank Transfer (Company to Personal)</option>
                        <option value="Cash Withdrawal" className="bg-[#5f8a68] text-white">Cash Withdrawal</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block t-label mb-1">
                      Transfer Reference / Code (Required)
                    </label>
                    <input
                      type="text"
                      required
                      value={salaryReference}
                      onChange={(e) => setSalaryReference(e.target.value)}
                      placeholder="e.g. OWN-W40-01"
                      className="w-full px-3.5 py-2 glass-input font-mono text-sm focus:outline-none uppercase"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 glass glass--pill is-active text-[var(--text)] font-semibold text-xs border border-white/60 shadow-[var(--glow)] transition-all cursor-pointer"
                  >
                    Transfer to Personal & Next
                  </button>
                </form>
              )}

              <div className="pt-2 flex justify-between">
                <button onClick={() => setActiveStep(5)} className="text-xs text-[var(--text-2)] hover:text-[var(--text)] glass glass--pill px-3.5 py-1.5 font-medium flex items-center gap-1">
                  <ArrowLeft className="w-3.5 h-3.5" strokeWidth={1.5} /> Back
                </button>
                <button
                  onClick={() => setActiveStep(7)}
                  className="px-4 py-2 glass glass--pill is-active text-[var(--text)] font-semibold text-xs border border-white/60 shadow-[var(--glow)] flex items-center gap-1.5 cursor-pointer"
                >
                  Step 7: Final Lock <ArrowRight className="w-3.5 h-3.5" strokeWidth={1.5} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 7: Final Lock & Verification */}
          {activeStep === 7 && (
            <div className="space-y-4">
              <h4 className="t-group">
                Step 7: Week Close Verification & Lock
              </h4>

              <div className="p-4.5 glass glass--tile space-y-2.5 text-xs shadow-[var(--glass-shadow)]">
                <div className="flex items-center justify-between">
                  <span className="t-label">1. All income & jobs recorded:</span>
                  <span className="text-[var(--ok)] font-semibold">✓ Verified</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="t-label">2. All daily hired workers paid:</span>
                  <span className={!weeklyStatus.hasUnpaidWorkers ? 'text-[var(--ok)] font-semibold' : 'text-[var(--alert)] font-semibold'}>
                    {!weeklyStatus.hasUnpaidWorkers ? '✓ Verified' : '✗ Unpaid Workers Pending'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="t-label">3. Weekly savings banked:</span>
                  <span className={isSavingsDone ? 'text-[var(--ok)] font-semibold' : 'text-[var(--pending)] font-semibold'}>
                    {isSavingsDone ? '✓ Verified' : 'Pending Reference'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="t-label">4. Saturday tithe verified:</span>
                  <span className={isTitheDone ? 'text-[var(--ok)] font-semibold' : 'text-[var(--pending)] font-semibold'}>
                    {isTitheDone ? '✓ Verified' : 'Pending Receipt'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="t-label">5. Weekly owner pay transferred:</span>
                  <span className={isSalaryDone ? 'text-[var(--ok)] font-semibold' : 't-caption'}>
                    {isSalaryDone ? '✓ Complete' : 'Optional / Retained in Company'}
                  </span>
                </div>
              </div>

              {/* Complete Lock CTA */}
              <div className="space-y-2 pt-2">
                <button
                  onClick={handleFinalClose}
                  className="w-full py-3.5 glass glass--pill is-active text-[var(--text)] font-semibold text-sm border border-white/80 shadow-[var(--glow)] transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Lock className="w-4 h-4 stroke-[1.8]" />
                  Lock & Close Week {currentWeekInfo.weekId}
                </button>

                {/* Override trigger */}
                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => setIsOverrideMode(!isOverrideMode)}
                    className="text-xs text-[var(--text-2)] hover:text-[var(--pending)] transition-colors underline cursor-pointer font-medium"
                  >
                    Need to start new week with pending items? Use Override / Carry-Forward
                  </button>
                </div>
              </div>

              {/* Override Drawer */}
              {isOverrideMode && (
                <form onSubmit={handleExecuteOverride} className="p-4 glass rounded-[var(--r-card)] border border-[var(--pending)]/40 bg-[var(--pending)]/10 space-y-3 text-xs animate-in fade-in shadow-[var(--glass-shadow)]">
                  <div className="flex items-center gap-2 text-[var(--pending)] font-semibold">
                    <AlertTriangle className="w-4 h-4 text-[var(--pending)]" strokeWidth={1.5} />
                    <span>Logged Accountability Override</span>
                  </div>
                  <p className="t-label">
                    Overrides carry pending obligations to the next week and log an immutable entry in the audit trail.
                  </p>
                  <div>
                    <label className="block t-label mb-1">
                      Mandatory Reason for Override:
                    </label>
                    <textarea
                      required
                      rows={2}
                      value={overrideReason}
                      onChange={(e) => setOverrideReason(e.target.value)}
                      placeholder="e.g. Bank system maintenance delayed savings deposit until Monday morning"
                      className="w-full px-3 py-2 glass-input text-xs focus:outline-none"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-2.5 glass glass--pill text-[var(--pending)] font-semibold text-xs border border-[var(--pending)]/40 hover:bg-[var(--pending)]/20 cursor-pointer transition-all shadow-[var(--glass-shadow)]"
                  >
                    Confirm Override & Carry Obligations Forward
                  </button>
                </form>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
