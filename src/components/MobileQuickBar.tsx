import React from 'react';
import { 
  LayoutDashboard, 
  Briefcase, 
  Users, 
  CheckCircle2, 
  Plus 
} from 'lucide-react';

interface MobileQuickBarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenQuickExpense: () => void;
}

export const MobileQuickBar: React.FC<MobileQuickBarProps> = ({
  activeTab,
  setActiveTab,
  onOpenQuickExpense
}) => {
  const tabs = [
    { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
    { id: 'jobs', label: 'Jobs', icon: Briefcase },
    { id: 'quick', label: 'Expense', icon: Plus, isAction: true },
    { id: 'workers', label: 'Labour', icon: Users },
    { id: 'weekly-closing', label: 'Discipline', icon: CheckCircle2 }
  ];

  return (
    <div className="lg:hidden fixed bottom-3 left-3 right-3 z-40 max-w-md mx-auto">
      <nav 
        aria-label="Mobile Navigation"
        className="glass glass--pill glass--lifted px-2 py-1.5 flex items-center justify-around shadow-[var(--glass-shadow)] border border-white/40"
      >
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          if (tab.isAction) {
            return (
              <button
                key={tab.id}
                onClick={onOpenQuickExpense}
                className="flex flex-col items-center justify-center -mt-5 group min-h-[44px] min-w-[44px] cursor-pointer"
                aria-label="Quick Add Expense"
              >
                <div className="w-12 h-12 rounded-full glass is-active flex items-center justify-center border border-white/80 shadow-[var(--glow)] transition-transform group-hover:scale-105 active:scale-95 text-[var(--text)]">
                  <Icon className="w-6 h-6" strokeWidth={1.8} stroke="currentColor" />
                </div>
                <span className="text-[11px] font-semibold text-[var(--text)] mt-1 tracking-tight">
                  Expense
                </span>
              </button>
            );
          }

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center justify-center min-h-[44px] min-w-[48px] px-2 py-1 transition-all cursor-pointer rounded-2xl ${
                isActive 
                  ? 'glass--tile is-active text-[var(--text)] font-semibold' 
                  : 'text-[var(--text-2)] hover:text-[var(--text)]'
              }`}
            >
              <Icon 
                className="w-5 h-5 mb-0.5" 
                strokeWidth={1.5}
                stroke="currentColor"
              />
              <span 
                className={`text-[11px] tracking-tight leading-tight ${
                  isActive ? 'font-semibold text-[var(--text)]' : 'font-medium text-[var(--text-2)]'
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};
