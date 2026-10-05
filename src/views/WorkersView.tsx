import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { DailyWorker, WorkerPaymentRecord } from '../types';
import { formatCurrency } from '../services/financialEngine';
import { SettleWorkerModal } from '../components/SettleWorkerModal';
import { 
  Users, 
  UserPlus, 
  AlertTriangle, 
  CheckCircle2, 
  Plus, 
  Phone, 
  Briefcase, 
  Clock, 
  Check 
} from 'lucide-react';

export const WorkersView: React.FC = () => {
  const { workers, workerPayments, addWorker, recordWorkerPayment, jobs, settings } = useApp();

  const [activeTab, setActiveTab] = useState<'pending' | 'history' | 'roster'>('pending');
  const [selectedRecordToSettle, setSelectedRecordToSettle] = useState<WorkerPaymentRecord | null>(null);

  // New Worker Form Modal
  const [isNewWorkerOpen, setIsNewWorkerOpen] = useState(false);
  const [workerName, setWorkerName] = useState('');
  const [workerPhone, setWorkerPhone] = useState('');
  const [workerRole, setWorkerRole] = useState('Camera Operator');
  const [workerRate, setWorkerRate] = useState('3500');

  // New Daily Shift Record Form
  const [isLogShiftOpen, setIsLogShiftOpen] = useState(false);
  const [selectedWorkerId, setSelectedWorkerId] = useState(workers.length > 0 ? workers[0].id : '');
  const [selectedJobId, setSelectedJobId] = useState('');
  const [shiftDate, setShiftDate] = useState(new Date().toISOString().split('T')[0]);
  const [agreedPay, setAgreedPay] = useState('3500');
  const [amountPaidNow, setAmountPaidNow] = useState('0');
  const [payMethod, setPayMethod] = useState('M-Pesa');
  const [payRef, setPayRef] = useState('');

  const unpaidRecords = workerPayments.filter(p => !p.isPaid);
  const paidRecords = workerPayments.filter(p => p.isPaid);

  const handleCreateWorker = (e: React.FormEvent) => {
    e.preventDefault();
    if (!workerName.trim()) return;
    addWorker({
      name: workerName.trim(),
      phone: workerPhone.trim() || undefined,
      role: workerRole.trim(),
      dailyAgreedPay: parseFloat(workerRate) || 0,
      active: true
    });
    setWorkerName('');
    setWorkerPhone('');
    setIsNewWorkerOpen(false);
  };

  const handleLogShift = (e: React.FormEvent) => {
    e.preventDefault();
    const w = workers.find(x => x.id === selectedWorkerId);
    if (!w) return;
    const j = jobs.find(x => x.id === selectedJobId);

    const agreed = parseFloat(agreedPay) || w.dailyAgreedPay;
    const paid = parseFloat(amountPaidNow) || 0;

    recordWorkerPayment({
      workerId: w.id,
      workerName: w.name,
      jobId: j?.id,
      jobName: j?.serviceName,
      dateWorked: shiftDate,
      agreedPay: agreed,
      amountPaid: paid,
      paymentMethod: payMethod,
      paymentReference: payRef.trim() || undefined,
      isPaid: paid >= agreed
    });

    setIsLogShiftOpen(false);
    setAmountPaidNow('0');
    setPayRef('');
  };

  return (
    <div className="space-y-6 pb-20">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="t-group text-[var(--pending)]">
              Direct Job Expense
            </span>
            <span className="text-[var(--text-3)]">·</span>
            <span className="t-caption">Never Part of Owner Salary</span>
          </div>
          <h2 className="t-title text-xl font-bold mt-0.5">
            Daily Worker & Hired Labour Payments
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsLogShiftOpen(true)}
            className="px-4 py-2 glass glass--pill is-active text-[var(--text)] font-semibold text-xs border border-white/60 shadow-[var(--glow)] transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Clock className="w-4 h-4 stroke-[1.8]" />
            Log Labour Shift
          </button>

          <button
            onClick={() => setIsNewWorkerOpen(true)}
            className="px-3.5 py-2 glass glass--pill text-[var(--text-2)] hover:text-[var(--text)] font-medium text-xs border border-white/40 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <UserPlus className="w-4 h-4" strokeWidth={1.5} />
            Add Worker
          </button>
        </div>
      </div>

      {/* End-Of-Day Labour Alert Banner */}
      {unpaidRecords.length > 0 ? (
        <div className="p-4 glass rounded-[var(--r-card)] border border-[var(--pending)]/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-[var(--glass-shadow)] bg-[var(--pending)]/10">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-[var(--pending)] shrink-0 mt-0.5" strokeWidth={1.5} />
            <div>
              <h3 className="t-group text-[var(--pending)]">
                End-of-Day Unpaid Labour Checklist
              </h3>
              <p className="t-label mt-0.5">
                {unpaidRecords.length} worker(s) have pending daily wages. Clear before end-of-day wrap to maintain trust and protect weekly calculations.
              </p>
            </div>
          </div>
          <span className="text-xs font-mono font-semibold text-[var(--text)] glass glass--pill px-3 py-1.5 border border-[var(--pending)]/40">
            Total Due: {formatCurrency(unpaidRecords.reduce((sum, r) => sum + r.balanceRemaining, 0), settings.currency)}
          </span>
        </div>
      ) : (
        <div className="p-4 glass rounded-[var(--r-card)] border border-[var(--ok)]/40 flex items-center gap-3 shadow-[var(--glass-shadow)] bg-[var(--ok)]/10">
          <CheckCircle2 className="w-5 h-5 text-[var(--ok)] shrink-0" strokeWidth={1.5} />
          <p className="t-label text-[var(--ok)] font-medium">
            All daily workers are currently fully settled. No pending end-of-day labour wages.
          </p>
        </div>
      )}

      {/* Segmented View Selector */}
      <div className="flex items-center gap-1 p-1 glass glass--pill w-fit">
        <button
          onClick={() => setActiveTab('pending')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-full transition-all cursor-pointer ${
            activeTab === 'pending'
              ? 'glass glass--pill is-active text-[var(--text)] shadow-[var(--glow)]'
              : 'text-[var(--text-2)] hover:text-[var(--text)]'
          }`}
        >
          Unpaid Shifts ({unpaidRecords.length})
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-full transition-all cursor-pointer ${
            activeTab === 'history'
              ? 'glass glass--pill is-active text-[var(--text)] shadow-[var(--glow)]'
              : 'text-[var(--text-2)] hover:text-[var(--text)]'
          }`}
        >
          Payment History ({paidRecords.length})
        </button>
        <button
          onClick={() => setActiveTab('roster')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-full transition-all cursor-pointer ${
            activeTab === 'roster'
              ? 'glass glass--pill is-active text-[var(--text)] shadow-[var(--glow)]'
              : 'text-[var(--text-2)] hover:text-[var(--text)]'
          }`}
        >
          Worker Roster ({workers.length})
        </button>
      </div>

      {/* TAB 1: PENDING / UNPAID SHIFTS */}
      {activeTab === 'pending' && (
        <div className="space-y-3">
          {unpaidRecords.length === 0 ? (
            <div className="p-10 text-center glass rounded-2xl t-caption">
              No unpaid shifts. Great job settling your team on time!
            </div>
          ) : (
            unpaidRecords.map((rec) => (
              <div
                key={rec.id}
                className="p-4 glass glass--tile flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all shadow-[var(--glass-shadow)]"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-[var(--text)]">{rec.workerName}</span>
                    <span className="text-[var(--text-3)]">·</span>
                    <span className="t-caption font-mono">{rec.dateWorked}</span>
                  </div>
                  {rec.jobName && (
                    <p className="t-label">
                      Job: <span className="text-[var(--text)] font-medium">{rec.jobName}</span>
                    </p>
                  )}
                  {rec.notes && (
                    <p className="t-caption text-left italic">{rec.notes}</p>
                  )}
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <span className="t-caption block">Balance Due:</span>
                    <span className="text-base font-semibold font-mono text-[var(--pending)]">
                      {formatCurrency(rec.balanceRemaining, settings.currency)}
                    </span>
                  </div>

                  <button
                    onClick={() => setSelectedRecordToSettle(rec)}
                    className="px-4 py-2 glass glass--pill is-active text-[var(--text)] font-semibold text-xs border border-white/60 shadow-[var(--glow)] transition-all cursor-pointer"
                  >
                    Pay & Settle
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 2: PAYMENT HISTORY */}
      {activeTab === 'history' && (
        <div className="glass overflow-hidden shadow-[var(--glass-shadow)]">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-white/10 text-[var(--text-2)] uppercase tracking-wider font-semibold border-b border-white/20">
                <tr>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Worker</th>
                  <th className="px-4 py-3">Job / Project</th>
                  <th className="px-4 py-3">Agreed Pay</th>
                  <th className="px-4 py-3">Amount Paid</th>
                  <th className="px-4 py-3">Channel / Code</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/20">
                {paidRecords.map((r) => (
                  <tr key={r.id} className="hover:bg-white/10">
                    <td className="px-4 py-3 font-mono text-[var(--text-2)]">{r.dateWorked}</td>
                    <td className="px-4 py-3 font-semibold text-[var(--text)]">{r.workerName}</td>
                    <td className="px-4 py-3 text-[var(--text-2)]">{r.jobName || 'General Labour'}</td>
                    <td className="px-4 py-3 font-mono text-[var(--text-2)]">{formatCurrency(r.agreedPay, settings.currency)}</td>
                    <td className="px-4 py-3 font-mono text-[var(--ok)] font-semibold">{formatCurrency(r.amountPaid, settings.currency)}</td>
                    <td className="px-4 py-3 font-mono text-[var(--text-3)]">{r.paymentMethod} {r.paymentReference ? `(${r.paymentReference})` : ''}</td>
                    <td className="px-4 py-3 text-[var(--ok)] font-semibold">✓ Paid & Verified</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: WORKER ROSTER */}
      {activeTab === 'roster' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {workers.map((w) => (
            <div key={w.id} className="p-4 glass glass--tile space-y-2 shadow-[var(--glass-shadow)]">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-[var(--text)]">{w.name}</span>
                <span className="text-xs text-[var(--text-2)] font-mono font-medium">
                  {formatCurrency(w.dailyAgreedPay, settings.currency)}/day
                </span>
              </div>
              <p className="t-caption text-left text-[var(--ok)] font-medium">{w.role}</p>
              {w.phone && (
                <p className="t-caption text-left font-mono flex items-center gap-1.5">
                  <Phone className="w-3 h-3 text-[var(--text-3)]" strokeWidth={1.5} />
                  {w.phone}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Settle Worker Modal */}
      <SettleWorkerModal
        isOpen={!!selectedRecordToSettle}
        onClose={() => setSelectedRecordToSettle(null)}
        record={selectedRecordToSettle}
      />

      {/* New Worker Modal */}
      {isNewWorkerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/20 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-md glass-modal rounded-[28px] p-6 space-y-4 shadow-[var(--glass-shadow)] animate-modal-enter">
            <h3 className="t-title text-base">Add Team Worker</h3>
            <form onSubmit={handleCreateWorker} className="space-y-3">
              <div>
                <label className="block t-label mb-1">Name</label>
                <input
                  type="text"
                  required
                  value={workerName}
                  onChange={(e) => setWorkerName(e.target.value)}
                  placeholder="e.g. John Doe"
                  className="w-full px-3 py-2 glass-input text-sm"
                />
              </div>
              <div>
                <label className="block t-label mb-1">Role / Skill</label>
                <input
                  type="text"
                  required
                  value={workerRole}
                  onChange={(e) => setWorkerRole(e.target.value)}
                  placeholder="e.g. Camera Operator, Sound Tech, Driver"
                  className="w-full px-3 py-2 glass-input text-sm"
                />
              </div>
              <div>
                <label className="block t-label mb-1">Standard Daily Rate ({settings.currency})</label>
                <input
                  type="number"
                  required
                  value={workerRate}
                  onChange={(e) => setWorkerRate(e.target.value)}
                  className="w-full px-3 py-2 glass-input font-mono text-sm"
                />
              </div>
              <div>
                <label className="block t-label mb-1">Phone Number (M-Pesa)</label>
                <input
                  type="text"
                  value={workerPhone}
                  onChange={(e) => setWorkerPhone(e.target.value)}
                  placeholder="+254 7..."
                  className="w-full px-3 py-2 glass-input font-mono text-sm"
                />
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsNewWorkerOpen(false)}
                  className="px-3.5 py-1.5 text-xs text-[var(--text-2)] hover:text-[var(--text)] glass glass--pill font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 glass glass--pill is-active text-[var(--text)] font-semibold text-xs border border-white/60 shadow-[var(--glow)]"
                >
                  Save Worker
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Log Labour Shift Modal */}
      {isLogShiftOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/20 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-md glass-modal rounded-[28px] p-6 space-y-4 shadow-[var(--glass-shadow)] animate-modal-enter">
            <h3 className="t-title text-base font-semibold">Log Daily Labour Shift</h3>
            <form onSubmit={handleLogShift} className="space-y-3">
              <div>
                <label className="block t-label mb-1">Worker</label>
                <select
                  value={selectedWorkerId}
                  onChange={(e) => setSelectedWorkerId(e.target.value)}
                  className="w-full px-3 py-2 glass-input rounded-xl text-sm"
                >
                  {workers.map((w) => (
                    <option key={w.id} value={w.id} className="bg-[#5f8a68] text-white">{w.name} ({w.role})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block t-label mb-1">Link to Job (Optional)</label>
                <select
                  value={selectedJobId}
                  onChange={(e) => setSelectedJobId(e.target.value)}
                  className="w-full px-3 py-2 glass-input rounded-xl text-sm"
                >
                  <option value="" className="bg-[#5f8a68] text-white">-- General Studio / Unlinked --</option>
                  {jobs.map((j) => (
                    <option key={j.id} value={j.id} className="bg-[#5f8a68] text-white">{j.serviceName} ({j.clientName})</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block t-label mb-1">Agreed Pay</label>
                  <input
                    type="number"
                    value={agreedPay}
                    onChange={(e) => setAgreedPay(e.target.value)}
                    className="w-full px-3 py-2 glass-input rounded-xl font-mono text-sm"
                  />
                </div>
                <div>
                  <label className="block t-label mb-1">Paid Now</label>
                  <input
                    type="number"
                    value={amountPaidNow}
                    onChange={(e) => setAmountPaidNow(e.target.value)}
                    className="w-full px-3 py-2 glass-input rounded-xl font-mono text-sm"
                  />
                </div>
              </div>
              {parseFloat(amountPaidNow) > 0 && (
                <div>
                  <label className="block t-label mb-1">M-Pesa Reference</label>
                  <input
                    type="text"
                    value={payRef}
                    onChange={(e) => setPayRef(e.target.value)}
                    placeholder="e.g. QKD99288M1"
                    className="w-full px-3 py-2 glass-input rounded-xl font-mono text-xs uppercase"
                  />
                </div>
              )}
              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsLogShiftOpen(false)}
                  className="px-3.5 py-1.5 text-xs text-[var(--text-2)] hover:text-[var(--text)] glass glass--pill font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 glass glass--pill is-active text-[var(--text)] font-semibold text-xs border border-white/60 shadow-[var(--glow)]"
                >
                  Record Shift
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
