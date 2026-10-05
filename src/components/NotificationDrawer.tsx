import React from 'react';
import { useApp } from '../context/AppContext';
import { X, Bell, CheckCheck } from 'lucide-react';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToTab: (tab: string) => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  isOpen,
  onClose,
  onNavigateToTab
}) => {
  const { notifications, markNotificationRead, markAllNotificationsRead } = useApp();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/20 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="w-full max-w-sm glass-modal border-l border-white/40 h-full shadow-[var(--glass-shadow)] flex flex-col animate-in slide-in-from-right duration-200 rounded-none sm:rounded-l-[28px]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4.5 border-b border-white/20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-[var(--ok)]" strokeWidth={1.5} />
            <h3 className="t-title text-sm font-semibold">System Reminders</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={markAllNotificationsRead}
              className="text-xs text-[var(--text-2)] hover:text-[var(--text)] flex items-center gap-1 font-semibold cursor-pointer"
            >
              <CheckCheck className="w-3.5 h-3.5" strokeWidth={1.5} />
              Mark all read
            </button>
            <button 
              onClick={onClose} 
              className="icon-btn"
              aria-label="Close notifications"
            >
              <X className="w-4 h-4 text-[var(--text-2)]" strokeWidth={1.5} />
            </button>
          </div>
        </div>

        <div className="p-4 overflow-y-auto space-y-3 flex-1">
          {notifications.length === 0 ? (
            <div className="text-center py-12 t-caption">
              No pending notifications. All systems up to date.
            </div>
          ) : (
            notifications.map((notif) => {
              return (
                <div
                  key={notif.id}
                  onClick={() => {
                    markNotificationRead(notif.id);
                    if (notif.type === 'unpaid_worker') onNavigateToTab('workers');
                    if (notif.type === 'saturday_tithe' || notif.type === 'unclosed_week') onNavigateToTab('weekly-closing');
                    if (notif.type === 'upcoming_job') onNavigateToTab('jobs');
                    onClose();
                  }}
                  className={`p-3.5 glass glass--tile text-left transition-all cursor-pointer shadow-[var(--glass-shadow)] ${
                    notif.read
                      ? 'opacity-60'
                      : notif.severity === 'critical'
                      ? 'border-[var(--alert)]/50 bg-[var(--alert)]/10'
                      : notif.severity === 'warning'
                      ? 'border-[var(--pending)]/50 bg-[var(--pending)]/10'
                      : 'hover:bg-white/30'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className={`text-xs font-semibold ${
                      notif.severity === 'critical' ? 'text-[var(--alert)]' :
                      notif.severity === 'warning' ? 'text-[var(--pending)]' : 'text-[var(--text)]'
                    }`}>
                      {notif.title}
                    </span>
                    {!notif.read && (
                      <span className="w-2 h-2 rounded-full bg-[var(--ok)] shrink-0 mt-1 shadow-[0_0_8px_var(--ok)]" />
                    )}
                  </div>
                  <p className="t-label mt-1 leading-relaxed">
                    {notif.message}
                  </p>
                  <span className="t-caption text-left font-mono mt-2 block">
                    {notif.date}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
