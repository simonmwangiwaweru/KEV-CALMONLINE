import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { JobStatus } from '../types';
import { X, Check } from 'lucide-react';

interface NewJobModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NewJobModal: React.FC<NewJobModalProps> = ({ isOpen, onClose }) => {
  const { clients, addJob, addClient, settings } = useApp();

  const [serviceName, setServiceName] = useState('');
  const [clientId, setClientId] = useState(clients.length > 0 ? clients[0].id : 'new');
  const [newClientName, setNewClientName] = useState('');
  const [newClientPhone, setNewClientPhone] = useState('');
  const [newClientOrg, setNewClientOrg] = useState('');
  const [agreedPrice, setAgreedPrice] = useState('30000');
  const [amountPaid, setAmountPaid] = useState('10000');
  const [jobDate, setJobDate] = useState(new Date().toISOString().split('T')[0]);
  const [bookingDate, setBookingDate] = useState(new Date().toISOString().split('T')[0]);
  const [status, setStatus] = useState<JobStatus>('pending');
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const priceNum = parseFloat(agreedPrice);
    const paidNum = parseFloat(amountPaid) || 0;
    if (isNaN(priceNum) || priceNum <= 0) return;

    let finalClientId = clientId;
    let finalClientName = '';
    let finalClientPhone = '';

    if (clientId === 'new') {
      if (!newClientName.trim() || !newClientPhone.trim()) return;
      const created = addClient({
        name: newClientName.trim(),
        phone: newClientPhone.trim(),
        organization: newClientOrg.trim() || undefined
      });
      finalClientId = created.id;
      finalClientName = created.name;
      finalClientPhone = created.phone;
    } else {
      const existing = clients.find(c => c.id === clientId);
      if (existing) {
        finalClientName = existing.name;
        finalClientPhone = existing.phone;
      }
    }

    addJob({
      clientId: finalClientId,
      clientName: finalClientName,
      clientPhone: finalClientPhone,
      serviceName: serviceName.trim(),
      bookingDate,
      jobDate,
      agreedPrice: priceNum,
      amountPaid: paidNum,
      paymentStatus: paidNum >= priceNum ? 'fully_paid' : paidNum > 0 ? 'deposit_paid' : 'not_paid',
      status,
      notes: notes.trim() || undefined
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/20 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="w-full max-w-lg glass-modal rounded-[28px] shadow-[var(--glass-shadow)] overflow-hidden flex flex-col max-h-[90vh] animate-modal-enter"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4.5 border-b border-white/20 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="t-group text-[var(--ok)]">
                Service Booking
              </span>
              <span className="text-[var(--text-3)]">·</span>
              <span className="t-caption">Add to Schedule & Ledger</span>
            </div>
            <h3 className="t-title text-base sm:text-lg mt-0.5">Create New Job / Booking</h3>
          </div>
          <button 
            onClick={onClose} 
            className="icon-btn"
            aria-label="Close modal"
          >
            <X className="w-4 h-4 text-[var(--text-2)]" strokeWidth={1.5} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
          <div>
            <label className="block t-label mb-1">
              Job / Service Title
            </label>
            <input
              type="text"
              required
              value={serviceName}
              onChange={(e) => setServiceName(e.target.value)}
              placeholder="e.g. Wedding Photography, Corporate Documentary"
              className="w-full px-3.5 py-2 glass-input text-sm focus:outline-none"
            />
          </div>

          <div>
            <label className="block t-label mb-1">
              Client
            </label>
            <select
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              className="w-full px-3.5 py-2 glass-input text-sm focus:outline-none"
            >
              {clients.map((c) => (
                <option key={c.id} value={c.id} className="bg-[#5f8a68] text-white">
                  {c.name} {c.organization ? `(${c.organization})` : ''} - {c.phone}
                </option>
              ))}
              <option value="new" className="bg-[#5f8a68] text-white">+ Add New Client</option>
            </select>
          </div>

          {clientId === 'new' && (
            <div className="p-3.5 glass glass--tile space-y-2 text-xs">
              <span className="t-group text-[var(--ok)] block">New Client Details:</span>
              <input
                type="text"
                placeholder="Client Full Name"
                required
                value={newClientName}
                onChange={(e) => setNewClientName(e.target.value)}
                className="w-full px-3 py-1.5 glass-input text-xs"
              />
              <input
                type="text"
                placeholder="Phone Number (e.g. +254 7...)"
                required
                value={newClientPhone}
                onChange={(e) => setNewClientPhone(e.target.value)}
                className="w-full px-3 py-1.5 glass-input text-xs font-mono"
              />
              <input
                type="text"
                placeholder="Organization (Optional)"
                value={newClientOrg}
                onChange={(e) => setNewClientOrg(e.target.value)}
                className="w-full px-3 py-1.5 glass-input text-xs"
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block t-label mb-1">
                Agreed Total Price ({settings.currency})
              </label>
              <input
                type="number"
                step="any"
                required
                value={agreedPrice}
                onChange={(e) => setAgreedPrice(e.target.value)}
                className="w-full px-3.5 py-2 glass-input font-mono font-semibold text-sm focus:outline-none"
              />
            </div>

            <div>
              <label className="block t-label mb-1">
                Deposit Received ({settings.currency})
              </label>
              <input
                type="number"
                step="any"
                value={amountPaid}
                onChange={(e) => setAmountPaid(e.target.value)}
                className="w-full px-3.5 py-2 glass-input font-mono font-semibold text-sm focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block t-label mb-1">
                Booking Date
              </label>
              <input
                type="date"
                required
                value={bookingDate}
                onChange={(e) => setBookingDate(e.target.value)}
                className="w-full px-3.5 py-2 glass-input text-sm font-mono"
              />
            </div>

            <div>
              <label className="block t-label mb-1">
                Execution / Job Date
              </label>
              <input
                type="date"
                required
                value={jobDate}
                onChange={(e) => setJobDate(e.target.value)}
                className="w-full px-3.5 py-2 glass-input text-sm font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block t-label mb-1">
              Job Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as JobStatus)}
              className="w-full px-3.5 py-2 glass-input text-sm"
            >
              <option value="pending" className="bg-[#5f8a68] text-white">Pending</option>
              <option value="in_progress" className="bg-[#5f8a68] text-white">In Progress</option>
              <option value="completed" className="bg-[#5f8a68] text-white">Completed</option>
            </select>
          </div>

          <div>
            <label className="block t-label mb-1">
              Notes
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. 2 cameras required, delivery via hard drive"
              className="w-full px-3.5 py-2 glass-input text-sm"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3 glass glass--pill is-active text-[var(--text)] font-semibold text-sm border border-white/80 shadow-[var(--glow)] transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Check className="w-4 h-4 stroke-[2.5]" />
              Create Job & Schedule
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
