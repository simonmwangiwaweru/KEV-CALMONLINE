import React, { useState } from 'react';
import { Sparkles, ArrowRight, Bot, TrendingUp, HelpCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatCurrency } from '../services/financialEngine';

interface AIQuickBarProps {
  onOpenAIChat: (initialPrompt?: string) => void;
}

export const AIQuickBar: React.FC<AIQuickBarProps> = ({ onOpenAIChat }) => {
  const { settings, financialPosition, weeklyStatus, thisMonthSummary } = useApp();
  const [quickInput, setQuickInput] = useState('');

  const handleQuickSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickInput.trim()) return;
    onOpenAIChat(quickInput);
    setQuickInput('');
  };

  return (
    <div className="glass p-4 sm:p-5 rounded-3xl border border-white/60 shadow-[var(--glass-shadow)] bg-white/20 backdrop-blur-md relative overflow-hidden group">
      {/* Subtle background glow */}
      <div className="absolute -right-8 -top-8 w-32 h-32 bg-emerald-400/10 rounded-full blur-2xl pointer-events-none" />
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left: Branding & status */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl glass flex items-center justify-center border border-white/70 shadow-xs text-emerald-800 bg-white/40 shrink-0">
            <Sparkles className="w-5 h-5 text-emerald-700 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm sm:text-base text-[var(--text)] tracking-tight">
                Calm Online AI Intelligence
              </h3>
              <span className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-emerald-600/15 text-emerald-800 border border-emerald-600/25">
                Gemini 3.8
              </span>
            </div>
            <p className="text-xs text-[var(--text-2)] mt-0.5">
              Instant analysis across your {formatCurrency(thisMonthSummary.totalIncome, settings.currency)} revenue, client debts, worker payouts & discipline rules.
            </p>
          </div>
        </div>

        {/* Right: Quick Action Chips */}
        <div className="flex items-center flex-wrap gap-2">
          <button
            onClick={() => onOpenAIChat("What happened recently in my business? Give me an executive breakdown of recent income, jobs, expenses, and weekly status.")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl glass hover:bg-white/50 border border-white/50 text-xs font-semibold text-[var(--text)] transition-all hover:scale-[1.02] active:scale-95 shadow-xs cursor-pointer"
          >
            <span>⚡ What happened?</span>
          </button>

          <button
            onClick={() => onOpenAIChat("What do you suggest I do next based on my current financial position, worker liabilities, and discipline status?")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl glass hover:bg-white/50 border border-white/50 text-xs font-semibold text-[var(--text)] transition-all hover:scale-[1.02] active:scale-95 shadow-xs cursor-pointer"
          >
            <span>💡 What do you suggest?</span>
          </button>

          <button
            onClick={() => onOpenAIChat()}
            className="flex items-center gap-1.5 px-3.5 py-1.5 glass glass--pill is-active text-[var(--text)] font-semibold border border-emerald-600/40 bg-emerald-500/20 hover:bg-emerald-500/30 text-xs shadow-[var(--glow)] transition-all hover:scale-[1.02] active:scale-95 cursor-pointer ml-auto sm:ml-0"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-800" />
            <span>Ask Advisor</span>
            <ArrowRight className="w-3.5 h-3.5 text-emerald-800" />
          </button>
        </div>
      </div>

      {/* Inline Quick Search / Question Bar */}
      <form onSubmit={handleQuickSubmit} className="mt-3 relative flex items-center">
        <input
          type="text"
          value={quickInput}
          onChange={(e) => setQuickInput(e.target.value)}
          placeholder="Ask a question e.g. 'Can I pay myself salary?', 'Who owes us money?', 'Review worker debts'..."
          className="w-full pl-4 pr-24 py-2.5 text-xs sm:text-sm glass-input text-[var(--text)] placeholder-[var(--text-3)] border border-white/60 focus:border-emerald-600 focus:outline-none transition-all shadow-inner"
        />
        <button
          type="submit"
          disabled={!quickInput.trim()}
          className="absolute right-1.5 px-3.5 py-1.5 glass glass--pill is-active text-[var(--text)] font-semibold border border-emerald-600/40 bg-emerald-500/20 hover:bg-emerald-500/30 disabled:opacity-40 disabled:cursor-not-allowed text-xs transition-all cursor-pointer flex items-center gap-1 shadow-xs"
        >
          <span>Ask</span>
          <ArrowRight className="w-3 h-3 text-emerald-800" />
        </button>
      </form>
    </div>
  );
};
