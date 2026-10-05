import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  Bell, 
  Plus, 
  Settings as SettingsIcon,
  ShieldCheck,
  AlertTriangle,
  Lock,
  Sparkles,
  Cloud,
  Smartphone
} from 'lucide-react';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenQuickExpense: () => void;
  onOpenNotifications: () => void;
  onOpenAIChat: () => void;
  onOpenInstallModal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenQuickExpense,
  onOpenNotifications,
  onOpenAIChat,
  onOpenInstallModal
}) => {
  const {
    weeklyStatus,
    currentWeekInfo,
    notifications,
    currentUser,
    isCloudSyncing,
    setIsAuthModalOpen
  } = useApp();
  const unreadCount = notifications.filter(n => !n.read).length;

  const navLinks = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'jobs', label: 'Jobs & Bookings' },
    { id: 'workers', label: 'Labour & Workers' },
    { id: 'expenses', label: 'Expenses & Budgets' },
    { id: 'giving', label: 'Giving Engine' },
    { id: 'weekly-closing', label: 'Weekly Discipline' },
    { id: 'reports', label: 'Reports & Ledgers' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full glass border-b border-white/40 shadow-[var(--glass-shadow)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Zone 1: Wordmark */}
        <button
          onClick={() => setActiveTab('dashboard')}
          className="text-left group flex items-center gap-2.5 cursor-pointer focus:outline-none"
        >
          <div className="w-9 h-9 rounded-2xl glass flex items-center justify-center transition-transform group-hover:scale-105 border border-white/50 bg-white/30">
            <span className="text-sm font-extrabold tracking-tight text-[var(--text)] group-hover:opacity-80 transition-opacity">
              co
            </span>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="text-base font-bold tracking-tight text-[var(--text)] leading-none capitalize">
                calm online
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--text-2)] shadow-[0_0_8px_rgba(63,92,74,0.6)]" />
            </div>
            <span className="t-caption text-left mt-0.5 font-mono">
              {currentWeekInfo.weekId}
            </span>
          </div>
        </button>

        {/* Zone 2: Glass Pill Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1 glass glass--pill p-1">
          {navLinks.map((link) => {
            const isActive = activeTab === link.id;
            return (
              <button
                key={link.id}
                onClick={() => setActiveTab(link.id)}
                className={`px-3.5 py-1 text-xs rounded-full whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'glass glass--pill is-active font-semibold text-[var(--text)] shadow-[var(--glow)]'
                    : 'text-[var(--text-2)] hover:text-[var(--text)] hover:bg-white/20'
                }`}
              >
                {link.label}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: 1-2 Primary Actions & Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Status pill based on discipline */}
          <button
            onClick={() => setActiveTab('weekly-closing')}
            className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-full border transition-all cursor-pointer shadow-xs ${
              weeklyStatus.status === 'WEEK_COMPLETE'
                ? 'glass glass--pill is-active text-[var(--text)] font-semibold'
                : 'glass glass--pill text-[var(--text-2)] font-medium'
            }`}
            title="Weekly Financial Closing Status"
          >
            {weeklyStatus.status === 'WEEK_COMPLETE' && <ShieldCheck className="w-3.5 h-3.5" strokeWidth={1.5} />}
            {weeklyStatus.status === 'ACTION_REQUIRED' && <AlertTriangle className="w-3.5 h-3.5" strokeWidth={1.5} />}
            {weeklyStatus.status === 'WEEK_NOT_CLOSED' && <Lock className="w-3.5 h-3.5" strokeWidth={1.5} />}
            <span>
              {weeklyStatus.status === 'WEEK_COMPLETE' ? 'WEEK COMPLETE' : 
               weeklyStatus.status === 'ACTION_REQUIRED' ? 'ACTION REQUIRED' : 'WEEK NOT CLOSED'}
            </span>
          </button>

          {/* AI Advisor Button */}
          <button
            onClick={onOpenAIChat}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[var(--text)] glass glass--pill hover:bg-white/50 border border-emerald-600/40 bg-emerald-500/10 shadow-[var(--glass-shadow)] transition-all active:scale-[0.98] whitespace-nowrap cursor-pointer group"
            title="Calm Online AI Advisor"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-700 group-hover:rotate-12 transition-transform" strokeWidth={2} />
            <span className="hidden sm:inline">AI Advisor</span>
            <span className="sm:hidden">AI</span>
          </button>

          {/* Quick Expense CTA */}
          <button
            onClick={onOpenQuickExpense}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-[var(--text)] glass glass--pill hover:bg-white/40 border border-white/60 shadow-[var(--glass-shadow)] transition-all active:scale-[0.98] whitespace-nowrap cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" strokeWidth={1.8} />
            <span className="hidden xs:inline">Quick Expense</span>
            <span className="xs:hidden">Expense</span>
          </button>

          {/* Notification Button */}
          <button
            onClick={onOpenNotifications}
            className="icon-btn relative"
            aria-label="View notifications"
          >
            <Bell className="w-4 h-4" strokeWidth={1.5} />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[var(--text)] ring-2 ring-white/60" />
            )}
          </button>

          {/* Firebase Cloud Sync Button */}
          <button
            onClick={() => setIsAuthModalOpen(true)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold glass glass--pill hover:bg-white/50 border transition-all active:scale-[0.98] whitespace-nowrap cursor-pointer ${
              currentUser
                ? 'text-emerald-700 border-emerald-600/30 bg-emerald-500/10'
                : 'text-[var(--text-muted)] border-white/60 hover:text-[var(--text)]'
            }`}
            title={currentUser ? `Cloud Sync Active (${currentUser.email || 'Signed in'})` : 'Connect Free Firebase Cloud'}
          >
            <Cloud className={`w-3.5 h-3.5 ${isCloudSyncing ? 'animate-pulse text-indigo-500' : currentUser ? 'text-emerald-600' : ''}`} />
            <span className="hidden sm:inline">
              {currentUser ? (isCloudSyncing ? 'Syncing...' : 'Cloud Synced') : 'Cloud Sync'}
            </span>
          </button>

          {/* Mobile Phone Install CTA */}
          {onOpenInstallModal && (
            <button
              onClick={onOpenInstallModal}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold glass glass--pill hover:bg-white/50 border border-white/60 text-[var(--text)] transition-all active:scale-[0.98] whitespace-nowrap cursor-pointer"
              title="Get Calm Online on your Phone (iOS / Android)"
            >
              <Smartphone className="w-3.5 h-3.5 text-emerald-700" strokeWidth={1.8} />
              <span className="hidden lg:inline">Get on Phone</span>
            </button>
          )}

          {/* Settings Tab Button */}
          <button
            onClick={() => setActiveTab('settings')}
            className={`icon-btn ${activeTab === 'settings' ? 'is-active' : ''}`}
            aria-label="Settings"
          >
            <SettingsIcon className="w-4 h-4" strokeWidth={1.5} />
          </button>
        </div>
      </div>
    </header>
  );
};
