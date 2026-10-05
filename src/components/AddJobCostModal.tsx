import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { JobBooking } from '../types';
import { X, Check } from 'lucide-react';

interface AddJobCostModalProps {
  isOpen: boolean;
  onClose: () => void;
  job: JobBooking | null;
}

export const AddJobCostModal: React.FC<AddJobCostModalProps> = ({ isOpen, onClose, job }) => {
  const { addJobCost, workers, settings } = useApp();

  const [category, setCategory] = useState<'transport' | 'hired_labour' | 'equipment' | 'production' | 'other'>('transport');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('2000');
  const [workerId, setWorkerId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('M-Pesa');
  const [paymentReference, setPaymentReference] = useState('');
  const [isPaid, setIsPaid] = useState(true);

  if (!isOpen || !job) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(amount);
    if (isNaN(num) || num <= 0 || !description.trim()) return;

    const selectedWorker = workers.find(w => w.id === workerId);

    addJobCost(job.id, {
      jobId: job.id,
      category,
      description: description.trim(),
      amount: num,
      date: new Date().toISOString().split('T')[0],
      workerId: workerId || undefined,
      workerName: selectedWorker?.name || undefined,
      paymentMethod,
      paymentReference: paymentReference.trim() || undefined,
      isPaid
    });

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
                Direct Job Expense
              </span>
              <span className="text-[var(--text-3)]">·</span>
              <span className="t-caption">Reduces Job Profit</span>
            </div>
            <h3 className="t-title text-base sm:text-lg mt-0.5">Add Cost to Job</h3>
            <p className="t-caption text-left truncate mt-0.5">{job.serviceName}</p>
          </div>
          <button 
            onClick={onClose} 
            className="icon-btn"
            aria-label="Close modal"
          >
            <X className="w-4 h-4 text-[var(--text-2)]" strokeWidth={1.5} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-3.5">
          <div>
            <label className="block t-label mb-1">
              Cost Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as any)}
              className="w-full px-3.5 py-2 glass-input text-sm focus:outline-none"
            >
              <option value="transport" className="bg-[#5f8a68] text-white">Transport / Fuel / Uber</option>
              <option value="hired_labour" className="bg-[#5f8a68] text-white">Hired Labour / Daily Worker</option>
              <option value="equipment" className="bg-[#5f8a68] text-white">Equipment Rental / Lenses / Drone</option>
              <option value="production" className="bg-[#5f8a68] text-white">Production Materials / Printing / Props</option>
              <option value="other" className="bg-[#5f8a68] text-white">Other Direct Expense</option>
            </select>
          </div>

          <div>
            <label className="block t-label mb-1">
              Description
            </label>
            <input
              type="text"
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Uber to venue, 24-70mm lens rental"
              className="w-full px-3.5 py-2 glass-input text-sm focus:outline-none"
            />
          </div>

          <div>
            <label className="block t-label mb-1">
              Amount ({settings.currency})
            </label>
            <input
              type="number"
              step="any"
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-3.5 py-2 glass-input font-mono font-semibold text-base focus:outline-none"
            />
          </div>

          {category === 'hired_labour' && (
            <div>
              <label className="block t-label mb-1">
                Link to Registered Worker (Optional)
              </label>
              <select
                value={workerId}
                onChange={(e) => setWorkerId(e.target.value)}
                className="w-full px-3.5 py-2 glass-input text-sm"
              >
                <option value="" className="bg-[#5f8a68] text-white">-- Non-registered or One-off --</option>
                {workers.map((w) => (
                  <option key={w.id} value={w.id} className="bg-[#5f8a68] text-white">{w.name} ({w.role})</option>
                ))}
              </select>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block t-label mb-1">
                Payment Method
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full px-3.5 py-2 glass-input text-sm"
              >
                <option value="M-Pesa" className="bg-[#5f8a68] text-white">M-Pesa</option>
                <option value="Cash" className="bg-[#5f8a68] text-white">Cash</option>
                <option value="Bank Transfer" className="bg-[#5f8a68] text-white">Bank Transfer</option>
              </select>
            </div>

            <div>
              <label className="block t-label mb-1">
                Receipt / Ref Code
              </label>
              <input
                type="text"
                value={paymentReference}
                onChange={(e) => setPaymentReference(e.target.value)}
                placeholder="Optional"
                className="w-full px-3.5 py-2 glass-input font-mono text-sm uppercase"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="isPaid"
              checked={isPaid}
              onChange={(e) => setIsPaid(e.target.checked)}
              className="w-4 h-4 rounded accent-[#5f8a68] cursor-pointer"
            />
            <label htmlFor="isPaid" className="t-label cursor-pointer">
              Mark as already paid out now
            </label>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 text-xs text-[var(--text-2)] hover:text-[var(--text)] glass glass--pill font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 glass glass--pill is-active text-[var(--text)] font-semibold text-xs border border-white/60 shadow-[var(--glow)] flex items-center gap-1.5"
            >
              <Check className="w-4 h-4 stroke-[2.5]" />
              Add Cost to Job
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
