import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { MobileQuickBar } from './components/MobileQuickBar';
import { QuickAddExpenseModal } from './components/QuickAddExpenseModal';
import { RecordPaymentModal } from './components/RecordPaymentModal';
import { AllocationModal } from './components/AllocationModal';
import { WeeklyCloseModal } from './components/WeeklyCloseModal';
import { NotificationDrawer } from './components/NotificationDrawer';
import { AIChatModal } from './components/AIChatModal';
import { AuthModal } from './components/AuthModal';
import { InstallAppModal } from './components/InstallAppModal';
import { Sparkles } from 'lucide-react';

// Views
import { DashboardView } from './views/DashboardView';
import { JobsView } from './views/JobsView';
import { WorkersView } from './views/WorkersView';
import { ExpensesView } from './views/ExpensesView';
import { GivingView } from './views/GivingView';
import { WeeklyClosingView } from './views/WeeklyClosingView';
import { ActivitiesView } from './views/ActivitiesView';
import { ReportsView } from './views/ReportsView';
import { SettingsView } from './views/SettingsView';

function MainApp() {
  const { isAuthModalOpen, setIsAuthModalOpen } = useApp();
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isQuickExpenseOpen, setIsQuickExpenseOpen] = useState(false);
  const [isRecordPaymentOpen, setIsRecordPaymentOpen] = useState(false);
  const [isWeeklyCloseOpen, setIsWeeklyCloseOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isAIChatOpen, setIsAIChatOpen] = useState(false);
  const [aiInitialPrompt, setAiInitialPrompt] = useState<string | undefined>(undefined);

  const handleOpenAIChat = (prompt?: string) => {
    setAiInitialPrompt(prompt);
    setIsAIChatOpen(true);
  };

  // Immediate allocation popup state after income
  const [allocationData, setAllocationData] = useState<{
    isOpen: boolean;
    amount: number;
    directCosts: number;
    sourceName: string;
  }>({
    isOpen: false,
    amount: 0,
    directCosts: 0,
    sourceName: ''
  });

  const handlePaymentRecordedSuccess = (amount: number, directCosts: number, sourceName: string) => {
    setAllocationData({
      isOpen: true,
      amount,
      directCosts,
      sourceName
    });
  };

  return (
    <div className="min-h-screen text-[var(--text)] flex flex-col font-sans selection:bg-emerald-500/20 selection:text-[#2c4636] relative overflow-x-hidden">
      
      {/* Top Bar (adheres to 3-Zone Top Bar Contract) */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenQuickExpense={() => setIsQuickExpenseOpen(true)}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        onOpenAIChat={() => handleOpenAIChat()}
        onOpenInstallModal={() => setIsInstallModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-36 lg:pb-16">
        {activeTab === 'dashboard' && (
          <DashboardView
            onOpenQuickExpense={() => setIsQuickExpenseOpen(true)}
            onOpenRecordPayment={() => setIsRecordPaymentOpen(true)}
            onOpenWeeklyClose={() => setIsWeeklyCloseOpen(true)}
            onNavigateToTab={setActiveTab}
            onOpenAIChat={handleOpenAIChat}
          />
        )}

        {activeTab === 'jobs' && (
          <JobsView
            onOpenRecordPayment={(jobId) => {
              setIsRecordPaymentOpen(true);
            }}
            onPaymentSuccess={handlePaymentRecordedSuccess}
          />
        )}

        {activeTab === 'workers' && <WorkersView />}

        {activeTab === 'expenses' && <ExpensesView />}

        {activeTab === 'giving' && <GivingView />}

        {activeTab === 'weekly-closing' && <WeeklyClosingView />}

        {activeTab === 'activities' && <ActivitiesView />}

        {activeTab === 'reports' && <ReportsView />}

        {activeTab === 'settings' && <SettingsView />}
      </main>

      {/* Mobile-First Fixed Bottom Navigation Bar (Pages 4 & 17) */}
      <MobileQuickBar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenQuickExpense={() => setIsQuickExpenseOpen(true)}
      />

      {/* Global Modals */}
      <QuickAddExpenseModal
        isOpen={isQuickExpenseOpen}
        onClose={() => setIsQuickExpenseOpen(false)}
      />

      <RecordPaymentModal
        isOpen={isRecordPaymentOpen}
        onClose={() => setIsRecordPaymentOpen(false)}
        onPaymentSuccess={handlePaymentRecordedSuccess}
      />

      <AllocationModal
        isOpen={allocationData.isOpen}
        onClose={() => setAllocationData(prev => ({ ...prev, isOpen: false }))}
        receivedAmount={allocationData.amount}
        directCosts={allocationData.directCosts}
        sourceDescription={allocationData.sourceName}
      />

      <WeeklyCloseModal
        isOpen={isWeeklyCloseOpen}
        onClose={() => setIsWeeklyCloseOpen(false)}
      />

      <NotificationDrawer
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        onNavigateToTab={setActiveTab}
      />

      {/* Floating AI Advisor Trigger Button (Accessible from every view & device) */}
      <button
        onClick={() => handleOpenAIChat()}
        className="fixed bottom-20 lg:bottom-6 right-4 lg:right-8 z-40 flex items-center gap-2.5 px-4 py-2.5 rounded-full glass hover:bg-white/60 border border-emerald-600/40 bg-white/40 shadow-xl hover:shadow-2xl backdrop-blur-md text-[var(--text)] transition-all hover:scale-105 active:scale-95 cursor-pointer group"
        aria-label="Open Calm Online AI Advisor"
      >
        <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-xs group-hover:rotate-12 transition-transform">
          <Sparkles className="w-3.5 h-3.5 animate-pulse" />
        </div>
        <span className="text-xs font-bold tracking-tight">AI Advisor</span>
      </button>

      {/* Global AI Chat Modal */}
      <AIChatModal
        isOpen={isAIChatOpen}
        onClose={() => {
          setIsAIChatOpen(false);
          setAiInitialPrompt(undefined);
        }}
        initialPrompt={aiInitialPrompt}
      />

      {/* Firebase Cloud Sync & Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />

      {/* Mobile PWA Install Modal */}
      <InstallAppModal
        isOpen={isInstallModalOpen}
        onClose={() => setIsInstallModalOpen(false)}
      />

    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <MainApp />
    </AppProvider>
  );
}
