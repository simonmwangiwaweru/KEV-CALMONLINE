import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { JobBooking, JobStatus, PaymentStatus } from '../types';
import { formatCurrency } from '../services/financialEngine';
import { NewJobModal } from '../components/NewJobModal';
import { AddJobCostModal } from '../components/AddJobCostModal';
import { RecordPaymentModal } from '../components/RecordPaymentModal';
import { 
  Plus, 
  Search, 
  Filter, 
  ArrowUpRight, 
  Briefcase, 
  CheckCircle2, 
  Clock, 
  Receipt, 
  TrendingUp,
  AlertCircle,
  Truck,
  Users,
  Camera,
  Layers,
  Phone
} from 'lucide-react';

interface JobsViewProps {
  onOpenRecordPayment: (jobId?: string) => void;
  onPaymentSuccess?: (amount: number, directCosts: number, sourceName: string) => void;
}

export const JobsView: React.FC<JobsViewProps> = ({ onOpenRecordPayment, onPaymentSuccess }) => {
  const { jobs, updateJob, settings } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'all' | 'pending' | 'in_progress' | 'completed'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isNewJobOpen, setIsNewJobOpen] = useState(false);
  const [selectedJobForCost, setSelectedJobForCost] = useState<JobBooking | null>(null);
  const [selectedJobForPayment, setSelectedJobForPayment] = useState<string | undefined>(undefined);
  const [isRecordPaymentOpen, setIsRecordPaymentOpen] = useState(false);

  const filteredJobs = jobs.filter((job) => {
    const matchesFilter = activeSubTab === 'all' || job.status === activeSubTab;
    const matchesSearch = 
      job.serviceName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.clientPhone.includes(searchQuery);
    return matchesFilter && matchesSearch;
  });

  const handleUpdateStatus = (job: JobBooking, newStatus: JobStatus) => {
    updateJob({ ...job, status: newStatus });
  };

  return (
    <div className="space-y-6 pb-20">
      
      {/* Top Header / Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="t-group text-[var(--ok)]">
              Operations & Income Engine
            </span>
            <span className="text-[var(--text-3)]">·</span>
            <span className="t-caption">Jobs & Direct Cost Breakdown</span>
          </div>
          <h2 className="t-title text-xl font-bold mt-0.5">
            Client Jobs & Bookings
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsNewJobOpen(true)}
            className="px-4 py-2 glass glass--pill is-active text-[var(--text)] font-semibold text-xs border border-white/60 shadow-[var(--glow)] transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2]" />
            New Job / Booking
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 glass p-3">
        
        {/* Interactive Segmented Filter Tabs */}
        <div className="flex items-center gap-1 p-1 glass glass--pill overflow-x-auto">
          {[
            { id: 'all', label: 'All Jobs' },
            { id: 'in_progress', label: 'In Progress' },
            { id: 'pending', label: 'Upcoming / Pending' },
            { id: 'completed', label: 'Completed' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-full whitespace-nowrap transition-all cursor-pointer ${
                activeSubTab === tab.id
                  ? 'glass glass--pill is-active text-[var(--text)] shadow-[var(--glow)]'
                  : 'text-[var(--text-2)] hover:text-[var(--text)]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative min-w-[240px]">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-3)]" strokeWidth={1.5} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by client, service or phone..."
            className="w-full pl-9 pr-3 py-1.5 glass-input text-[var(--text)] text-xs placeholder:text-[var(--text-3)] focus:outline-none"
          />
        </div>
      </div>

      {/* Jobs Listing */}
      {filteredJobs.length === 0 ? (
        <div className="p-12 text-center glass">
          <Briefcase className="w-8 h-8 text-[var(--text-3)] mx-auto mb-2" strokeWidth={1.5} />
          <h3 className="t-title text-sm font-semibold">No jobs match your filter</h3>
          <p className="t-caption mt-1">
            Create a new client booking or clear search parameters.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredJobs.map((job) => {
            const totalDirectCosts = job.directCosts.reduce((sum, c) => sum + c.amount, 0);
            const netProfitReceived = job.amountPaid - totalDirectCosts;
            const projectedProfit = job.agreedPrice - totalDirectCosts;

            return (
              <div
                key={job.id}
                className="glass overflow-hidden transition-all shadow-[var(--glass-shadow)]"
              >
                {/* Main Card Header */}
                <div className="p-5 border-b border-white/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-base font-semibold text-[var(--text)]">
                        {job.serviceName}
                      </span>
                      <span className="text-[var(--text-3)]">·</span>
                      <span className="text-xs text-[var(--text-2)] font-medium">
                        {job.clientName}
                      </span>
                      {job.clientPhone && (
                        <span className="text-xs text-[var(--text-3)] font-mono flex items-center gap-1">
                          <Phone className="w-3 h-3 text-[var(--text-3)]" strokeWidth={1.5} />
                          {job.clientPhone}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3 text-xs text-[var(--text-2)]">
                      <span>Job Date: <strong className="text-[var(--text)] font-mono">{job.jobDate}</strong></span>
                      <span>·</span>
                      <span>Booking: <span className="font-mono">{job.bookingDate}</span></span>
                      {job.notes && (
                        <>
                          <span>·</span>
                          <span className="truncate max-w-sm t-caption text-left">{job.notes}</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Status Dropdown & Primary Action */}
                  <div className="flex items-center gap-2 shrink-0">
                    <select
                      value={job.status}
                      onChange={(e) => handleUpdateStatus(job, e.target.value as JobStatus)}
                      className="text-xs font-semibold px-2.5 py-1.5 rounded-full border glass glass--pill text-[var(--text)] focus:outline-none cursor-pointer"
                    >
                      <option value="pending" className="bg-[#5f8a68] text-white">Pending</option>
                      <option value="in_progress" className="bg-[#5f8a68] text-white">In Progress</option>
                      <option value="completed" className="bg-[#5f8a68] text-white">Completed</option>
                      <option value="cancelled" className="bg-[#5f8a68] text-white">Cancelled</option>
                    </select>

                    {job.balanceRemaining > 0 && (
                      <button
                        onClick={() => {
                          setSelectedJobForPayment(job.id);
                          setIsRecordPaymentOpen(true);
                        }}
                        className="px-3 py-1.5 glass glass--pill is-active text-[var(--text)] font-semibold text-xs border border-white/60 shadow-[var(--glow)] transition-all flex items-center gap-1 cursor-pointer"
                      >
                        <Receipt className="w-3.5 h-3.5" strokeWidth={1.5} />
                        Record Payment
                      </button>
                    )}

                    <button
                      onClick={() => setSelectedJobForCost(job)}
                      className="px-3 py-1.5 glass glass--pill text-[var(--text-2)] hover:text-[var(--text)] font-medium text-xs transition-all flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" strokeWidth={1.5} />
                      Add Job Cost
                    </button>
                  </div>
                </div>

                {/* Job Financial Profit Calculator Breakdown */}
                <div className="p-5 bg-white/10 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs border-b border-white/20">
                  <div>
                    <span className="t-label block mb-0.5">Amount Charged</span>
                    <span className="text-base font-semibold font-mono text-[var(--text)]">
                      {formatCurrency(job.agreedPrice, settings.currency)}
                    </span>
                    <span className="t-caption text-left block mt-0.5">
                      Paid: {formatCurrency(job.amountPaid, settings.currency)}
                    </span>
                  </div>

                  <div>
                    <span className="t-label block mb-0.5">Outstanding Balance</span>
                    <span className={`text-base font-semibold font-mono ${job.balanceRemaining > 0 ? 'text-[var(--pending)]' : 'text-[var(--ok)]'}`}>
                      {formatCurrency(job.balanceRemaining, settings.currency)}
                    </span>
                    <span className="t-caption text-left block mt-0.5 capitalize font-medium">
                      {job.paymentStatus.replace('_', ' ')}
                    </span>
                  </div>

                  <div>
                    <span className="t-label block mb-0.5">Direct Costs (Transport/Labour)</span>
                    <span className="text-base font-semibold font-mono text-[var(--text)]">
                      −{formatCurrency(totalDirectCosts, settings.currency)}
                    </span>
                    <span className="t-caption text-left block mt-0.5">
                      {job.directCosts.length} cost item(s)
                    </span>
                  </div>

                  <div>
                    <span className="t-label block mb-0.5">Realized Net Profit</span>
                    <span className={`text-base font-semibold font-mono ${netProfitReceived >= 0 ? 'text-[var(--ok)]' : 'text-[var(--alert)]'}`}>
                      {formatCurrency(netProfitReceived, settings.currency)}
                    </span>
                    <span className="t-caption text-left block mt-0.5 font-mono">
                      Proj: {formatCurrency(projectedProfit, settings.currency)}
                    </span>
                  </div>
                </div>

                {/* Direct Cost Item List */}
                {job.directCosts.length > 0 && (
                  <div className="px-5 py-3.5 bg-white/5">
                    <span className="t-group block mb-2">
                      Direct Costs Incurred for this Job
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                      {job.directCosts.map((c) => (
                        <div key={c.id} className="p-2.5 glass glass--tile text-xs flex justify-between items-center">
                          <div>
                            <span className="text-[var(--text)] font-semibold block truncate max-w-[180px]">{c.description}</span>
                            <span className="t-caption text-left capitalize block">{c.category.replace('_', ' ')} · {c.paymentMethod}</span>
                          </div>
                          <span className="font-mono font-semibold text-[var(--text)] ml-2 shrink-0">
                            {formatCurrency(c.amount, settings.currency)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            );
          })}
        </div>
      )}

      {/* Modals */}
      <NewJobModal isOpen={isNewJobOpen} onClose={() => setIsNewJobOpen(false)} />
      
      <AddJobCostModal 
        isOpen={!!selectedJobForCost} 
        onClose={() => setSelectedJobForCost(null)} 
        job={selectedJobForCost} 
      />

      <RecordPaymentModal
        isOpen={isRecordPaymentOpen}
        onClose={() => {
          setIsRecordPaymentOpen(false);
          setSelectedJobForPayment(undefined);
        }}
        preselectedJobId={selectedJobForPayment}
        onPaymentSuccess={onPaymentSuccess}
      />

    </div>
  );
};
