import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { FixedExpenseBudget, AccountType } from '../types';
import { formatCurrency } from '../services/financialEngine';
import { QuickAddExpenseModal } from '../components/QuickAddExpenseModal';
import { 
  Plus, 
  AlertTriangle, 
  CheckCircle2, 
  Trash2, 
  Receipt, 
  User, 
  Briefcase,
  Utensils,
  Coffee,
  Bus,
  Smartphone,
  Calendar
} from 'lucide-react';

export const ExpensesView: React.FC = () => {
  const { 
    fixedBudgets, 
    addFixedBudget, 
    deleteFixedBudget, 
    ledger, 
    financialPosition, 
    settings,
    quickAddExpense 
  } = useApp();

  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [activeAccountTab, setActiveAccountTab] = useState<'all' | 'company' | 'personal'>('all');
  
  // New Fixed Budget modal
  const [isNewBudgetOpen, setIsNewBudgetOpen] = useState(false);
  const [budgetName, setBudgetName] = useState('');
  const [budgetCategory, setBudgetCategory] = useState('Rent');
  const [budgetLimit, setBudgetLimit] = useState('20000');
  const [budgetDueDay, setBudgetDueDay] = useState('5');
  const [budgetNotes, setBudgetNotes] = useState('');

  const expenseLedger = ledger.filter(e => {
    const isExpense = e.type.startsWith('expense_');
    if (!isExpense) return false;
    if (activeAccountTab === 'all') return true;
    return e.account === activeAccountTab;
  });

  const handleCreateFixedBudget = (e: React.FormEvent) => {
    e.preventDefault();
    const limit = parseFloat(budgetLimit);
    if (!budgetName.trim() || isNaN(limit) || limit <= 0) return;

    addFixedBudget({
      name: budgetName.trim(),
      category: budgetCategory,
      monthlyLimit: limit,
      dueDay: parseInt(budgetDueDay) || 1,
      notes: budgetNotes.trim() || undefined
    });

    setBudgetName('');
    setIsNewBudgetOpen(false);
  };

  const handleOneTapQuick = (cat: string, amt: number, account: AccountType) => {
    quickAddExpense(amt, cat, account, `${cat} quick entry`, 'M-Pesa');
  };

  return (
    <div className="space-y-6 pb-20">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="t-group text-[var(--ok)]">
              Discipline & Limits
            </span>
            <span className="text-[var(--text-3)]">·</span>
            <span className="t-caption">Fixed Limits & Speed Capture</span>
          </div>
          <h2 className="t-title text-xl font-bold mt-0.5">
            Daily Expenses & Monthly Fixed Budgets
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsQuickAddOpen(true)}
            className="px-4 py-2 glass glass--pill is-active text-[var(--text)] font-semibold text-xs border border-white/60 shadow-[var(--glow)] transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2]" />
            Quick Add Expense
          </button>
          <button
            onClick={() => setIsNewBudgetOpen(true)}
            className="px-3.5 py-2 glass glass--pill text-[var(--text-2)] hover:text-[var(--text)] font-medium text-xs border border-white/40 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" strokeWidth={1.5} />
            Set Budget Limit
          </button>
        </div>
      </div>

      {/* Speed Capture One-Tap Grid */}
      <div className="p-5 glass space-y-3 shadow-[var(--glass-shadow)]">
        <div className="flex items-center justify-between border-b border-white/20 pb-2">
          <span className="t-group">
            One-Tap Quick Capture Presets
          </span>
          <span className="t-caption">Tap to instantly record expense</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2.5">
          {[
            { label: 'Lunch', amount: 300, icon: Utensils, account: 'personal' as AccountType },
            { label: 'Supper', amount: 450, icon: Utensils, account: 'personal' as AccountType },
            { label: 'Breakfast', amount: 200, icon: Coffee, account: 'personal' as AccountType },
            { label: 'Fare / Uber', amount: 250, icon: Bus, account: 'personal' as AccountType },
            { label: 'Airtime', amount: 100, icon: Smartphone, account: 'personal' as AccountType },
            { label: 'Studio Fuel', amount: 1500, icon: Bus, account: 'company' as AccountType }
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <button
                key={idx}
                onClick={() => handleOneTapQuick(item.label, item.amount, item.account)}
                className="p-3 glass glass--tile hover:bg-white/30 text-left transition-all active:scale-95 group cursor-pointer shadow-[var(--glass-shadow)]"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <Icon className="w-4 h-4 text-[var(--text-2)] group-hover:text-[var(--text)] transition-colors" strokeWidth={1.5} />
                  <span className="text-[10px] uppercase font-mono font-bold text-[var(--text-3)] glass glass--pill px-1.5 py-0.5">
                    {item.account === 'personal' ? 'P' : 'C'}
                  </span>
                </div>
                <span className="text-xs font-semibold text-[var(--text)] block">{item.label}</span>
                <span className="text-xs font-mono font-semibold text-[var(--text)]">
                  {formatCurrency(item.amount, settings.currency)}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Monthly Fixed Expenses & Limits */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="t-group">
              Monthly Fixed Expenses & Spending Limits
            </h3>
            <span className="text-[var(--text-3)]">·</span>
            <span className="t-caption">Approaching & Exceeded Alerts</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {fixedBudgets.map((b) => {
            const remaining = Math.max(0, b.monthlyLimit - b.spentThisMonth);
            const percentageUsed = Math.min(100, Math.round((b.spentThisMonth / b.monthlyLimit) * 100));
            const isExceeded = b.spentThisMonth > b.monthlyLimit;
            const isApproaching = percentageUsed >= 80 && !isExceeded;

            return (
              <div
                key={b.id}
                className="p-4 glass glass--tile space-y-3 shadow-[var(--glass-shadow)]"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-[var(--text)]">{b.name}</span>
                    </div>
                    <span className="t-caption text-left capitalize block">{b.category} · Due Day {b.dueDay}</span>
                  </div>
                  <button
                    onClick={() => deleteFixedBudget(b.id)}
                    className="icon-btn"
                    title="Delete Budget"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-[var(--text-3)]" strokeWidth={1.5} />
                  </button>
                </div>

                {/* Progress Bar */}
                <div className="space-y-1.5">
                  <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        isExceeded ? 'bg-[var(--alert)]' :
                        isApproaching ? 'bg-[var(--pending)]' : 'bg-[var(--ok)]'
                      }`}
                      style={{ width: `${percentageUsed}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-mono text-[var(--text-2)]">
                      Spent: <strong className="text-[var(--text)] font-semibold">{formatCurrency(b.spentThisMonth, settings.currency)}</strong>
                    </span>
                    <span className="font-mono t-caption">
                      Limit: {formatCurrency(b.monthlyLimit, settings.currency)}
                    </span>
                  </div>
                </div>

                {/* Status Indicator */}
                <div className="flex items-center justify-between text-xs pt-1 border-t border-white/20">
                  <span className="t-label">Remaining Budget:</span>
                  <span className={`font-mono font-semibold ${
                    isExceeded ? 'text-[var(--alert)]' :
                    isApproaching ? 'text-[var(--pending)]' : 'text-[var(--ok)]'
                  }`}>
                    {isExceeded 
                      ? `Exceeded by ${formatCurrency(b.spentThisMonth - b.monthlyLimit, settings.currency)}`
                      : formatCurrency(remaining, settings.currency)}
                  </span>
                </div>

                {isApproaching && (
                  <div className="flex items-center gap-1.5 text-xs text-[var(--pending)] font-medium">
                    <AlertTriangle className="w-3.5 h-3.5" strokeWidth={1.5} />
                    <span>Approaching monthly spending limit ({percentageUsed}%)</span>
                  </div>
                )}
                {isExceeded && (
                  <div className="flex items-center gap-1.5 text-xs text-[var(--alert)] font-medium">
                    <AlertTriangle className="w-3.5 h-3.5" strokeWidth={1.5} />
                    <span>Exceeded monthly limit!</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Expenses Ledger Table */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="t-group">
            Expense Ledger Records
          </h3>
          <div className="flex items-center gap-1 p-1 glass glass--pill">
            <button
              onClick={() => setActiveAccountTab('all')}
              className={`px-3 py-1 text-xs font-semibold rounded-full transition-all cursor-pointer ${
                activeAccountTab === 'all' ? 'glass glass--pill is-active text-[var(--text)] shadow-[var(--glow)]' : 'text-[var(--text-2)] hover:text-[var(--text)]'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setActiveAccountTab('company')}
              className={`px-3 py-1 text-xs font-semibold rounded-full transition-all cursor-pointer ${
                activeAccountTab === 'company' ? 'glass glass--pill is-active text-[var(--text)] shadow-[var(--glow)]' : 'text-[var(--text-2)] hover:text-[var(--text)]'
              }`}
            >
              Company
            </button>
            <button
              onClick={() => setActiveAccountTab('personal')}
              className={`px-3 py-1 text-xs font-semibold rounded-full transition-all cursor-pointer ${
                activeAccountTab === 'personal' ? 'glass glass--pill is-active text-[var(--text)] shadow-[var(--glow)]' : 'text-[var(--text-2)] hover:text-[var(--text)]'
              }`}
            >
              Personal
            </button>
          </div>
        </div>

        <div className="glass overflow-hidden shadow-[var(--glass-shadow)]">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-white/10 text-[var(--text-2)] uppercase tracking-wider font-semibold border-b border-white/20">
                <tr>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Description</th>
                  <th className="px-4 py-3">Account</th>
                  <th className="px-4 py-3">Channel / Code</th>
                  <th className="px-4 py-3 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/20">
                {expenseLedger.slice(0, 15).map((e) => (
                  <tr key={e.id} className="hover:bg-white/10">
                    <td className="px-4 py-3 font-mono text-[var(--text-2)]">{e.date}</td>
                    <td className="px-4 py-3 font-semibold text-[var(--text)]">{e.category}</td>
                    <td className="px-4 py-3 text-[var(--text-2)]">{e.description}</td>
                    <td className="px-4 py-3 uppercase font-mono text-[var(--text)]">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold glass glass--pill ${
                        e.account === 'company' ? 'text-[var(--ok)] bg-[var(--ok)]/15 border-[var(--ok)]/40' : 'text-[var(--text)] bg-white/20 border-white/40'
                      }`}>
                        {e.account}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-[var(--text-3)]">{e.paymentMethod} {e.referenceCode ? `(${e.referenceCode})` : ''}</td>
                    <td className="px-4 py-3 text-right font-mono font-semibold text-[var(--text)]">
                      −{formatCurrency(e.amount, settings.currency)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Quick Add Modal */}
      <QuickAddExpenseModal isOpen={isQuickAddOpen} onClose={() => setIsQuickAddOpen(false)} />

      {/* New Budget Modal */}
      {isNewBudgetOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/20 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-md glass-modal rounded-[28px] p-6 space-y-4 shadow-[var(--glass-shadow)] animate-modal-enter">
            <h3 className="t-title text-base font-semibold">Create Monthly Budget Limit</h3>
            <form onSubmit={handleCreateFixedBudget} className="space-y-3">
              <div>
                <label className="block t-label mb-1">Budget Name</label>
                <input
                  type="text"
                  required
                  value={budgetName}
                  onChange={(e) => setBudgetName(e.target.value)}
                  placeholder="e.g. Studio Rent, Fibre Internet, Food"
                  className="w-full px-3 py-2 glass-input rounded-xl text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block t-label mb-1">Category</label>
                  <input
                    type="text"
                    required
                    value={budgetCategory}
                    onChange={(e) => setBudgetCategory(e.target.value)}
                    className="w-full px-3 py-2 glass-input rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="block t-label mb-1">Due Day of Month (1-31)</label>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    required
                    value={budgetDueDay}
                    onChange={(e) => setBudgetDueDay(e.target.value)}
                    className="w-full px-3 py-2 glass-input rounded-xl font-mono text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block t-label mb-1">Monthly Spending Limit ({settings.currency})</label>
                <input
                  type="number"
                  step="any"
                  required
                  value={budgetLimit}
                  onChange={(e) => setBudgetLimit(e.target.value)}
                  className="w-full px-3 py-2 glass-input rounded-xl font-mono text-sm"
                />
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsNewBudgetOpen(false)}
                  className="px-3.5 py-1.5 text-xs text-[var(--text-2)] hover:text-[var(--text)] glass glass--pill font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 glass glass--pill is-active text-[var(--text)] font-semibold text-xs border border-white/60 shadow-[var(--glow)]"
                >
                  Save Budget
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
