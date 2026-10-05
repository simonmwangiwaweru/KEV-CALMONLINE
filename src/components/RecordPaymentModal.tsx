import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { formatCurrency } from '../services/financialEngine';
import { X, CheckCircle2 } from 'lucide-react';

interface RecordPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedJobId?: string;
  onPaymentSuccess?: (amount: number, directCosts: number, sourceName: string) => void;
}

export const RecordPaymentModal: React.FC<RecordPaymentModalProps> = ({
  isOpen,
  onClose,
  preselectedJobId,
  onPaymentSuccess
}) => {
  const { jobs, recordClientPayment, settings } = useApp();

  const unpaidJobs = jobs.filter(j => j.paymentStatus !== 'fully_paid');
  const defaultJobId = preselectedJobId || (unpaidJobs.length > 0 ? unpaidJobs[0].id : '');

  const [selectedJobId, setSelectedJobId] = useState<string>(defaultJobId);
  const selectedJob = jobs.find(j => j.id === selectedJobId);

  const [amount, setAmount] = useState<string>(selectedJob ? String(selectedJob.balanceRemaining) : '5000');
  const [paymentMethod, setPaymentMethod] = useState<string>('M-Pesa');
  const [referenceCode, setReferenceCode] = useState<string>('');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState<string>('');

  if (!isOpen) return null;

  const handleJobChange = (jobId: string) => {
    setSelectedJobId(jobId);
    const j = jobs.find(x => x.id === jobId);
    if (j) {
      setAmount(String(j.balanceRemaining > 0 ? j.balanceRemaining : j.agreedPrice));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedJob) return;

    const num = parseFloat(amount);
    if (isNaN(num) || num <= 0) return;

    recordClientPayment(
      selectedJob.id,
      num,
      paymentMethod,
      referenceCode.trim() || `PAY-${Date.now().toString().slice(-6)}`,
      date,
      notes.trim()
    );

    const directCostsTotal = selectedJob.directCosts.reduce((sum, c) => sum + c.amount, 0);

    onClose();

    if (onPaymentSuccess) {
      onPaymentSuccess(num, directCostsTotal, `${selectedJob.serviceName} (${selectedJob.clientName})`);
    }
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
                Income Capture
              </span>
              <span className="text-[var(--text-3)]">·</span>
              <span className="t-caption">Company Money First</span>
            </div>
            <h3 className="t-title text-base sm:text-lg mt-0.5">Record Client Payment</h3>
          </div>
          <button
            onClick={onClose}
            className="icon-btn"
            aria-label="Close modal"
          >
            <X className="w-4 h-4 text-[var(--text-2)]" strokeWidth={1.5} />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
          
          {/* Select Job / Booking */}
          <div>
            <label className="block t-label uppercase font-medium mb-1.5">
              Select Client Job / Booking
            </label>
            <select
              value={selectedJobId}
              onChange={(e) => handleJobChange(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 glass-input text-sm focus:outline-none"
            >
              <option value="" disabled className="bg-[#5f8a68] text-white">-- Choose a Job --</option>
              {jobs.map((job) => (
                <option key={job.id} value={job.id} className="bg-[#5f8a68] text-white">
                  {job.serviceName} · {job.clientName} (Bal: {formatCurrency(job.balanceRemaining, settings.currency)})
                </option>
              ))}
            </select>
          </div>

          {selectedJob && (
            <div className="p-3.5 glass glass--tile text-xs space-y-1.5 shadow-[var(--glass-shadow)]">
              <div className="flex justify-between">
                <span className="t-label">Total Agreed Price:</span>
                <span className="font-mono font-semibold text-[var(--text)]">
                  {formatCurrency(selectedJob.agreedPrice, settings.currency)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="t-label">Already Paid:</span>
                <span className="font-mono font-semibold text-[var(--ok)]">
                  {formatCurrency(selectedJob.amountPaid, settings.currency)}
                </span>
              </div>
              <div className="flex justify-between font-semibold pt-1 border-t border-white/20">
                <span className="text-[var(--text)]">Remaining Balance:</span>
                <span className="font-mono font-semibold text-[var(--pending)]">
                  {formatCurrency(selectedJob.balanceRemaining, settings.currency)}
                </span>
              </div>
            </div>
          )}

          {/* Amount Received */}
          <div>
            <label className="block t-label uppercase font-medium mb-1.5">
              Amount Received Now ({settings.currency})
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-mono font-semibold text-[var(--text-3)] text-sm">
                {settings.currency}
              </span>
              <input
                type="number"
                step="any"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0"
                className="w-full pl-16 pr-4 py-2.5 glass-input font-mono text-lg font-semibold focus:outline-none"
              />
            </div>
          </div>

          {/* Payment Method & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block t-label mb-1">
                Payment Channel
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full px-3.5 py-2 glass-input text-sm focus:outline-none"
              >
                <option value="M-Pesa" className="bg-[#5f8a68] text-white">M-Pesa</option>
                <option value="Bank Transfer" className="bg-[#5f8a68] text-white">Bank Transfer (Stanbic/KCB/Equity)</option>
                <option value="Cash" className="bg-[#5f8a68] text-white">Cash</option>
                <option value="Cheque" className="bg-[#5f8a68] text-white">Cheque</option>
              </select>
            </div>

            <div>
              <label className="block t-label mb-1">
                Payment Date
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3.5 py-2 glass-input text-sm font-mono focus:outline-none"
              />
            </div>
          </div>

          {/* Transaction Reference Code (Required for auditability) */}
          <div>
            <label className="block t-label mb-1">
              Receipt / Transaction Reference (e.g. M-Pesa Code)
            </label>
            <input
              type="text"
              required
              value={referenceCode}
              onChange={(e) => setReferenceCode(e.target.value)}
              placeholder="e.g. QKD99211A4"
              className="w-full px-3.5 py-2 glass-input font-mono text-sm focus:outline-none uppercase"
            />
            <p className="t-caption text-left mt-1">
              Required by system principles to ensure audit integrity and no silent edits.
            </p>
          </div>

          <div>
            <label className="block t-label mb-1">
              Notes (Optional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. 50% deposit before shoot day"
              className="w-full px-3.5 py-2 glass-input text-sm focus:outline-none"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3.5 glass glass--pill is-active text-[var(--text)] font-semibold text-sm border border-white/80 shadow-[var(--glow)] transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
              Record Payment & View Allocation
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
