import React from 'react';
import { useApp } from '../context/AppContext';
import { formatCurrency } from '../services/financialEngine';
import { 
  Building2, 
  Wallet, 
  PiggyBank, 
  Layers, 
  CheckCheck 
} from 'lucide-react';

export const FinancialPositionBar: React.FC = () => {
  const { financialPosition, settings } = useApp();

  const buckets = [
    {
      title: 'Company Money',
      subtitle: 'Net business cash in hand',
      amount: financialPosition.companyMoney,
      icon: Building2,
      borderClass: 'border-l-emerald-500',
      accentColor: 'text-emerald-700'
    },
    {
      title: 'Personal Salary',
      subtitle: 'Withdrawn for personal use',
      amount: financialPosition.personalMoney,
      icon: Wallet,
      borderClass: 'border-l-sky-500',
      accentColor: 'text-sky-700'
    },
    {
      title: 'Savings',
      subtitle: 'Accumulated in bank account',
      amount: financialPosition.savingsBalance,
      icon: PiggyBank,
      borderClass: 'border-l-purple-500',
      accentColor: 'text-purple-700'
    },
    {
      title: 'Reserved for Bills',
      subtitle: 'Remaining fixed budget items',
      amount: financialPosition.reservedForExpenses,
      icon: Layers,
      borderClass: 'border-l-amber-500',
      accentColor: 'text-amber-700'
    },
    {
      title: 'Available to Spend',
      subtitle: 'Safe personal spendable cash',
      amount: financialPosition.availableToSpend,
      icon: CheckCheck,
      borderClass: 'border-l-teal-500',
      accentColor: 'text-teal-700'
    }
  ];

  return (
    <div className="w-full glass p-5 sm:p-6 shadow-[var(--glass-shadow)]">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h2 className="t-group">
            Financial Position · Always Visible
          </h2>
          <span className="text-[var(--text-3)]">·</span>
          <span className="t-sub text-xs">Strict 5-Bucket Separation</span>
        </div>
        <span className="t-caption font-mono glass glass--pill px-2.5 py-0.5">
          Base: {settings.currency}
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
        {buckets.map((b, idx) => {
          const Icon = b.icon;
          return (
            <div
              key={idx}
              className="p-4 glass glass--tile flex flex-col justify-between"
            >
              <div className="flex items-center justify-between text-[var(--text-2)] mb-2">
                <span className="t-label font-medium truncate">
                  {b.title}
                </span>
                <Icon className="w-4 h-4 text-[var(--text-2)] shrink-0" strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-base sm:text-lg font-semibold font-mono tabular-nums tracking-tight text-[var(--text)]">
                  {formatCurrency(b.amount, settings.currency)}
                </p>
                <p className="t-caption text-left mt-0.5 truncate">
                  {b.subtitle}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
