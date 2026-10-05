import React from 'react';
import { useApp } from '../context/AppContext';
import { formatCurrency } from '../services/financialEngine';
import { 
  X, 
  ShieldCheck, 
  PiggyBank, 
  Church, 
  Wallet, 
  Briefcase 
} from 'lucide-react';

interface AllocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  receivedAmount: number;
  directCosts?: number;
  sourceDescription?: string;
  onTransferSalary?: (amount: number) => void;
  onDepositSavings?: (amount: number) => void;
}

export const AllocationModal: React.FC<AllocationModalProps> = ({
  isOpen,
  onClose,
  receivedAmount,
  directCosts = 0,
  sourceDescription = 'Client Payment',
  onTransferSalary,
  onDepositSavings
}) => {
  const { settings } = useApp();

  if (!isOpen) return null;

  const base = settings.allocationBase === 'net_profit' 
    ? Math.max(0, receivedAmount - directCosts)
    : receivedAmount;

  const savings = Math.round((base * settings.savingsPercentage) / 100);
  const tithe = Math.round((base * settings.tithePercentage) / 100);
  const reserve = Math.round((base * settings.companyReservePercentage) / 100);
  const salary = Math.round((base * settings.personalSalaryPercentage) / 100);
  const operations = Math.max(0, base - savings - tithe - reserve - salary);

  const allocationItems = [
    {
      label: 'Keep for Business Reserve',
      percentage: settings.companyReservePercentage,
      amount: reserve,
      description: 'Retain in company account to protect against slow months',
      icon: Briefcase,
      color: 'text-[var(--text)]'
    },
    {
      label: 'Save / Bank',
      percentage: settings.savingsPercentage,
      amount: savings,
      description: 'Transfer to designated savings goal / high-yield account',
      icon: PiggyBank,
      color: 'text-[var(--ok)]',
      actionLabel: 'Bank Now',
      action: () => {
        onDepositSavings?.(savings);
        onClose();
      }
    },
    {
      label: 'Set Aside for Tithe',
      percentage: settings.tithePercentage,
      amount: tithe,
      description: 'Accumulates for Saturday verified tithe payment',
      icon: Church,
      color: 'text-[var(--pending)]'
    },
    {
      label: 'Available for Personal Salary',
      percentage: settings.personalSalaryPercentage,
      amount: salary,
      description: 'Eligible for owner withdrawal into personal wallet',
      icon: Wallet,
      color: 'text-[var(--text)]',
      actionLabel: 'Transfer',
      action: () => {
        onTransferSalary?.(salary);
        onClose();
      }
    },
    {
      label: 'Available for Operations / Costs',
      percentage: settings.operationsPercentage,
      amount: operations,
      description: 'Fuel, equipment maintenance, daily worker wages, supplies',
      icon: ShieldCheck,
      color: 'text-[var(--text-2)]'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/20 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="w-full max-w-lg glass-modal rounded-[28px] shadow-[var(--glass-shadow)] overflow-hidden flex flex-col max-h-[90vh] animate-modal-enter"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-white/20 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="t-group text-[var(--ok)]">
                Automatic Money Allocation
              </span>
              <span className="text-[var(--text-3)]">·</span>
              <span className="t-caption">Financial Discipline Rule</span>
            </div>
            <h3 className="t-title text-base sm:text-lg mt-0.5">
              What To Do With This Money
            </h3>
            <p className="t-label mt-0.5">
              Source: {sourceDescription}
            </p>
          </div>
          <button
            onClick={onClose}
            className="icon-btn"
            aria-label="Close modal"
          >
            <X className="w-4 h-4 text-[var(--text-2)]" strokeWidth={1.5} />
          </button>
        </div>

        {/* Amount Summary */}
        <div className="px-6 py-3.5 bg-white/10 border-b border-white/20 flex items-center justify-between text-xs">
          <div>
            <span className="t-label">Received:</span>{' '}
            <span className="font-mono font-semibold text-[var(--text)]">
              {formatCurrency(receivedAmount, settings.currency)}
            </span>
            {directCosts > 0 && (
              <span className="t-caption text-left ml-2 font-mono">
                (Costs: {formatCurrency(directCosts, settings.currency)})
              </span>
            )}
          </div>
          <div>
            <span className="t-label">Calculation Base:</span>{' '}
            <span className="font-mono font-semibold text-[var(--ok)]">
              {formatCurrency(base, settings.currency)}
            </span>
          </div>
        </div>

        {/* List of Recommended Buckets */}
        <div className="p-6 overflow-y-auto space-y-3">
          {allocationItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={index}
                className="p-3.5 glass glass--tile flex items-center justify-between gap-3 shadow-[var(--glass-shadow)]"
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 glass glass--pill mt-0.5">
                    <Icon className="w-4 h-4 text-[var(--text-2)]" strokeWidth={1.5} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-[var(--text)]">
                        {item.label}
                      </span>
                      <span className="t-caption font-mono">
                        ({item.percentage}%)
                      </span>
                    </div>
                    <p className="t-caption text-left mt-0.5">
                      {item.description}
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <p className={`text-base font-semibold font-mono tabular-nums ${item.color}`}>
                    {formatCurrency(item.amount, settings.currency)}
                  </p>
                  {item.actionLabel && (
                    <button
                      onClick={item.action}
                      className="mt-1 text-[11px] font-semibold text-[var(--text)] glass glass--pill hover:bg-white/40 px-3 py-1 shadow-[var(--glass-shadow)] transition-all cursor-pointer"
                    >
                      {item.actionLabel}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/20 bg-white/5 flex items-center justify-between">
          <span className="t-caption">
            Rules can be customized anytime in Settings.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold glass glass--pill is-active text-[var(--text)] border border-white/80 shadow-[var(--glow)] cursor-pointer"
          >
            Acknowledge & Close
          </button>
        </div>
      </div>
    </div>
  );
};
