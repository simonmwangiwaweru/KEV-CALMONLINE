import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { WorkerPaymentRecord } from '../types';
import { formatCurrency } from '../services/financialEngine';
import { X, Check } from 'lucide-react';

interface SettleWorkerModalProps {
  isOpen: boolean;
  onClose: () => void;
  record: WorkerPaymentRecord | null;
}

export const SettleWorkerModal: React.FC<SettleWorkerModalProps> = ({
  isOpen,
  onClose,
  record
}) => {
  const { settleWorkerPayment, settings } = useApp();

  const [amount, setAmount] = useState<string>(record ? String(record.balanceRemaining) : '0');
  const [paymentMethod, setPaymentMethod] = useState<string>('M-Pesa');
  const [referenceCode, setReferenceCode] = useState<string>('');

  if (!isOpen || !record) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(amount);
    if (isNaN(num) || num <= 0) return;

    settleWorkerPayment(
      record.id,
      num,
      paymentMethod,
      referenceCode.trim() || `MPESA-${Date.now().toString().slice(-6)}`
    );

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/20 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="w-full max-w-md glass-modal rounded-[28px] shadow-[var(--glass-shadow)] overflow-hidden flex flex-col animate-modal-enter"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4.5 border-b border-white/20 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="t-group text-[var(--pending)]">
                Direct Job Cost
              </span>
              <span className="text-[var(--text-3)]">·</span>
              <span className="t-caption">End-of-Day Labour</span>
            </div>
            <h3 className="t-title text-base sm:text-lg mt-0.5">Settle Daily Worker</h3>
          </div>
          <button
            onClick={onClose}
            className="icon-btn"
            aria-label="Close modal"
          >
            <X className="w-4 h-4 text-[var(--text-2)]" strokeWidth={1.5} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="p-3.5 glass glass--tile space-y-1.5 text-xs shadow-[var(--glass-shadow)]">
            <div className="flex justify-between font-medium">
              <span className="t-label">Worker:</span>
              <span className="text-[var(--text)] font-semibold">{record.workerName}</span>
            </div>
            {record.jobName && (
              <div className="flex justify-between">
                <span className="t-label">Job:</span>
                <span className="text-[var(--text-2)] font-medium">{record.jobName}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="t-label">Agreed Daily Pay:</span>
              <span className="font-mono text-[var(--text)] font-semibold">
                {formatCurrency(record.agreedPay, settings.currency)}
              </span>
            </div>
            <div className="flex justify-between font-semibold border-t border-white/20 pt-1.5">
              <span className="text-[var(--text)]">Balance Due Now:</span>
              <span className="font-mono text-[var(--pending)] text-sm font-semibold">
                {formatCurrency(record.balanceRemaining, settings.currency)}
              </span>
            </div>
          </div>

          <div>
            <label className="block t-label uppercase font-medium mb-1.5">
              Amount Paid ({settings.currency})
            </label>
            <input
              type="number"
              step="any"
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-3.5 py-2.5 glass-input font-mono text-lg font-semibold focus:outline-none"
            />
          </div>

          <div>
            <label className="block t-label mb-1">
              Payment Method
            </label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full px-3.5 py-2 glass-input text-sm focus:outline-none"
            >
              <option value="M-Pesa" className="bg-[#5f8a68] text-white">M-Pesa</option>
              <option value="Cash" className="bg-[#5f8a68] text-white">Cash</option>
              <option value="Bank Transfer" className="bg-[#5f8a68] text-white">Bank Transfer</option>
            </select>
          </div>

          <div>
            <label className="block t-label mb-1">
              Transaction Reference / Code (Required)
            </label>
            <input
              type="text"
              required
              value={referenceCode}
              onChange={(e) => setReferenceCode(e.target.value)}
              placeholder="e.g. QKD99288M1"
              className="w-full px-3.5 py-2 glass-input font-mono text-sm focus:outline-none uppercase"
            />
          </div>

          <p className="t-caption text-left">
            Note: Hired workers are paid as direct job costs and reduce job profit immediately.
          </p>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3 glass glass--pill is-active text-[var(--text)] font-semibold text-sm border border-white/80 shadow-[var(--glow)] transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Check className="w-4 h-4 stroke-[2.5]" />
              Confirm Payment & Settle Worker
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
