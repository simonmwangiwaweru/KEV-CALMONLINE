import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { AccountType } from '../types';
import { X, Check, Utensils, Coffee, Bus, Smartphone, Briefcase, User } from 'lucide-react';

interface QuickAddExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const QuickAddExpenseModal: React.FC<QuickAddExpenseModalProps> = ({
  isOpen,
  onClose
}) => {
  const { quickAddExpense, settings } = useApp();

  const [amount, setAmount] = useState<string>('300');
  const [category, setCategory] = useState<string>('Lunch');
  const [account, setAccount] = useState<AccountType>('personal');
  const [description, setDescription] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<string>('M-Pesa');
  const [referenceCode, setReferenceCode] = useState<string>('');

  if (!isOpen) return null;

  const quickCategories = [
    { name: 'Breakfast/Food', icon: Coffee, defaultAmount: '200', defaultAccount: 'personal' as AccountType },
    { name: 'Lunch', icon: Utensils, defaultAmount: '350', defaultAccount: 'personal' as AccountType },
    { name: 'Supper', icon: Utensils, defaultAmount: '450', defaultAccount: 'personal' as AccountType },
    { name: 'Transport / Fare', icon: Bus, defaultAmount: '200', defaultAccount: 'personal' as AccountType },
    { name: 'Airtime / Data', icon: Smartphone, defaultAmount: '100', defaultAccount: 'personal' as AccountType },
    { name: 'Company Operations', icon: Briefcase, defaultAmount: '1500', defaultAccount: 'company' as AccountType },
    { name: 'Studio Transport / Uber', icon: Bus, defaultAmount: '1200', defaultAccount: 'company' as AccountType },
    { name: 'Personal Errands', icon: User, defaultAmount: '500', defaultAccount: 'personal' as AccountType }
  ];

  const handleSelectQuickPreset = (preset: typeof quickCategories[0]) => {
    setCategory(preset.name);
    setAmount(preset.defaultAmount);
    setAccount(preset.defaultAccount);
    setDescription(preset.name);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(amount);
    if (isNaN(num) || num <= 0) return;

    quickAddExpense(
      num,
      category,
      account,
      description.trim() || `${category} expense`,
      paymentMethod,
      referenceCode.trim() || undefined
    );

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/20 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="w-full max-w-lg glass-modal rounded-t-[28px] sm:rounded-[28px] shadow-[var(--glass-shadow)] overflow-hidden flex flex-col max-h-[92vh] animate-modal-enter"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile drag handle indicator */}
        <div className="sm:hidden w-10 h-1.5 bg-white/40 rounded-full mx-auto my-2" />

        {/* Header */}
        <div className="px-6 py-4.5 border-b border-white/20 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="t-group text-[var(--ok)]">
                Speed Capture
              </span>
              <span className="text-[var(--text-3)]">·</span>
              <span className="t-caption">Immediate Expense Entry</span>
            </div>
            <h3 className="t-title text-base sm:text-lg mt-0.5">Record Daily Expense</h3>
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
          
          {/* Account Selector (Company vs Personal) */}
          <div>
            <label className="block t-label uppercase font-medium mb-1.5">
              Account Deduction
            </label>
            <div className="grid grid-cols-2 gap-2 p-1.5 glass glass--pill">
              <button
                type="button"
                onClick={() => setAccount('personal')}
                className={`py-2 px-3 text-xs font-semibold rounded-full flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  account === 'personal'
                    ? 'glass glass--pill is-active text-[var(--text)] shadow-[var(--glow)]'
                    : 'text-[var(--text-2)] hover:text-[var(--text)]'
                }`}
              >
                <User className="w-3.5 h-3.5" strokeWidth={1.5} />
                Personal Wallet
              </button>
              <button
                type="button"
                onClick={() => setAccount('company')}
                className={`py-2 px-3 text-xs font-semibold rounded-full flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  account === 'company'
                    ? 'glass glass--pill is-active text-[var(--text)] shadow-[var(--glow)]'
                    : 'text-[var(--text-2)] hover:text-[var(--text)]'
                }`}
              >
                <Briefcase className="w-3.5 h-3.5" strokeWidth={1.5} />
                Company Account
              </button>
            </div>
          </div>

          {/* Quick 1-Tap Presets */}
          <div>
            <label className="block t-label uppercase font-medium mb-1.5">
              One-Tap Presets
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {quickCategories.map((preset, idx) => {
                const isSelected = category === preset.name;
                const Icon = preset.icon;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectQuickPreset(preset)}
                    className={`p-2.5 glass glass--tile text-left flex flex-col justify-between transition-all cursor-pointer ${
                      isSelected
                        ? 'is-active border-white/80 shadow-[var(--glow)]'
                        : 'hover:bg-white/30'
                    }`}
                  >
                    <Icon className="w-4 h-4 mb-1 text-[var(--text-2)]" strokeWidth={1.5} />
                    <div>
                      <span className="block text-xs font-semibold truncate text-[var(--text)]">
                        {preset.name.split('/')[0]}
                      </span>
                      <span className="t-caption text-left font-mono">
                        {settings.currency} {preset.defaultAmount}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Amount Input */}
          <div>
            <label className="block t-label uppercase font-medium mb-1.5">
              Amount ({settings.currency})
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

          {/* Category & Description */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block t-label mb-1">
                Category
              </label>
              <input
                type="text"
                required
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="e.g. Lunch, Fuel, Internet"
                className="w-full px-3.5 py-2 glass-input text-sm focus:outline-none"
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
                <option value="Card" className="bg-[#5f8a68] text-white">Card</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block t-label mb-1">
              Description / Notes (Optional)
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Java House with client, Uber back to studio"
              className="w-full px-3.5 py-2 glass-input text-sm focus:outline-none"
            />
          </div>

          <div>
            <label className="block t-label mb-1">
              Receipt / Transaction Code (Optional)
            </label>
            <input
              type="text"
              value={referenceCode}
              onChange={(e) => setReferenceCode(e.target.value)}
              placeholder="e.g. QKD99401P5"
              className="w-full px-3.5 py-2 glass-input font-mono text-xs focus:outline-none uppercase"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3 glass glass--pill is-active text-[var(--text)] font-semibold text-sm border border-white/80 shadow-[var(--glow)] transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Check className="w-4 h-4 stroke-[2.5]" />
              Record {settings.currency} {amount || '0'} Expense
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
