import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { CurrencyCode, SystemSettings } from '../types';
import { 
  Check, 
  RotateCcw, 
  Download, 
  Upload, 
  PiggyBank, 
  Church, 
  Wallet, 
  Briefcase,
  ShieldCheck,
  Cloud,
  RefreshCw,
  Smartphone
} from 'lucide-react';
import { InstallAppModal } from '../components/InstallAppModal';

export const SettingsView: React.FC = () => {
  const { 
    settings, 
    updateSettings, 
    resetToSampleData, 
    exportDatabaseJson, 
    importDatabaseJson,
    currentUser,
    isCloudSyncing,
    lastCloudSyncTime,
    setIsAuthModalOpen,
    syncLocalToCloud
  } = useApp();

  const [form, setForm] = useState<SystemSettings>({ ...settings });
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [importJsonText, setImportJsonText] = useState('');
  const [showImportModal, setShowImportModal] = useState(false);
  const [showResetConfirmModal, setShowResetConfirmModal] = useState(false);
  const [showInstallModal, setShowInstallModal] = useState(false);
  const [importStatus, setImportStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const currencies: CurrencyCode[] = ['KES', 'USD', 'EUR', 'GBP', 'TZS', 'UGX', 'ZAR'];

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(form);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const handleDownloadBackup = () => {
    const jsonStr = exportDatabaseJson();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `calm_online_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    if (!importJsonText.trim()) return;
    const ok = importDatabaseJson(importJsonText);
    if (ok) {
      setImportStatus('success');
      setTimeout(() => {
        setShowImportModal(false);
        setImportStatus('idle');
      }, 1500);
    } else {
      setImportStatus('error');
    }
  };

  const totalPercentage = 
    form.savingsPercentage + 
    form.tithePercentage + 
    form.companyReservePercentage + 
    form.personalSalaryPercentage + 
    form.operationsPercentage;

  return (
    <div className="space-y-6 pb-20 max-w-4xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="t-group text-[var(--ok)]">
              System Configuration
            </span>
            <span className="text-[var(--text-3)]">·</span>
            <span className="t-caption">Allocation Rules & Currency</span>
          </div>
          <h2 className="t-title text-xl font-bold mt-0.5">
            Settings & Financial Rules
          </h2>
        </div>

        {saveSuccess && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 glass glass--pill text-[var(--ok)] text-xs font-semibold animate-in fade-in border border-[var(--ok)]/40 bg-[var(--ok)]/15">
            <Check className="w-3.5 h-3.5 text-[var(--ok)]" />
            Settings saved successfully
          </div>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        
        {/* Currency & Base Settings */}
        <div className="p-6 glass space-y-4 shadow-[var(--glass-shadow)]">
          <h3 className="t-group">
            Currency & Calculation Base
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block t-label mb-1">
                Operating Currency
              </label>
              <select
                value={form.currency}
                onChange={(e) => {
                  const val = e.target.value as CurrencyCode;
                  setForm({ ...form, currency: val, currencySymbol: val });
                }}
                className="w-full px-3.5 py-2.5 glass-input text-sm focus:outline-none font-mono"
              >
                {currencies.map(c => (
                  <option key={c} value={c} className="bg-[#5f8a68] text-white">{c}</option>
                ))}
              </select>
              <p className="t-caption text-left mt-1">
                Default: KES (Kenyan Shilling). All balances and displays update instantly.
              </p>
            </div>

            <div>
              <label className="block t-label mb-1">
                Allocation Calculation Base
              </label>
              <select
                value={form.allocationBase}
                onChange={(e) => setForm({ ...form, allocationBase: e.target.value as any })}
                className="w-full px-3.5 py-2.5 glass-input text-sm focus:outline-none"
              >
                <option value="net_profit" className="bg-[#5f8a68] text-white">Net Profit (Deduct direct job costs first)</option>
                <option value="gross_income" className="bg-[#5f8a68] text-white">Total Gross Income Received</option>
              </select>
              <p className="t-caption text-left mt-1">
                Recommending allocations from Net Profit prevents starving operations of cost money.
              </p>
            </div>
          </div>
        </div>

        {/* Automatic Money Allocation Percentages */}
        <div className="p-6 glass space-y-4 shadow-[var(--glass-shadow)]">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="t-group">
                Automatic Money Allocation Percentages
              </h3>
              <p className="t-label mt-0.5">
                Suggested immediately after every client payment or sale.
              </p>
            </div>
            <span className={`text-xs font-mono font-semibold px-2.5 py-0.5 glass glass--pill ${
              totalPercentage === 100 ? 'text-[var(--ok)] border-[var(--ok)]/40 bg-[var(--ok)]/15' : 'text-[var(--alert)] border-[var(--alert)]/40 bg-[var(--alert)]/15'
            }`}>
              Total: {totalPercentage}%
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            <div>
              <label className="block t-label mb-1 flex items-center gap-1">
                <PiggyBank className="w-3.5 h-3.5 text-[var(--text-2)]" strokeWidth={1.5} /> Savings Allocation (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={form.savingsPercentage}
                onChange={(e) => setForm({ ...form, savingsPercentage: parseInt(e.target.value) || 0 })}
                className="w-full px-3.5 py-2 glass-input font-mono text-sm"
              />
            </div>

            <div>
              <label className="block t-label mb-1 flex items-center gap-1">
                <Church className="w-3.5 h-3.5 text-[var(--text-2)]" strokeWidth={1.5} /> Tithe Allocation (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={form.tithePercentage}
                onChange={(e) => setForm({ ...form, tithePercentage: parseInt(e.target.value) || 0 })}
                className="w-full px-3.5 py-2 glass-input font-mono text-sm"
              />
            </div>

            <div>
              <label className="block t-label mb-1 flex items-center gap-1">
                <Briefcase className="w-3.5 h-3.5 text-[var(--text-2)]" strokeWidth={1.5} /> Company Reserve (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={form.companyReservePercentage}
                onChange={(e) => setForm({ ...form, companyReservePercentage: parseInt(e.target.value) || 0 })}
                className="w-full px-3.5 py-2 glass-input font-mono text-sm"
              />
            </div>

            <div>
              <label className="block t-label mb-1 flex items-center gap-1">
                <Wallet className="w-3.5 h-3.5 text-[var(--text-2)]" strokeWidth={1.5} /> Personal Salary (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={form.personalSalaryPercentage}
                onChange={(e) => setForm({ ...form, personalSalaryPercentage: parseInt(e.target.value) || 0 })}
                className="w-full px-3.5 py-2 glass-input font-mono text-sm"
              />
            </div>

            <div>
              <label className="block t-label mb-1 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-[var(--text-2)]" strokeWidth={1.5} /> Operations (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={form.operationsPercentage}
                onChange={(e) => setForm({ ...form, operationsPercentage: parseInt(e.target.value) || 0 })}
                className="w-full px-3.5 py-2 glass-input font-mono text-sm"
              />
            </div>
          </div>
        </div>

        {/* Weekly Salary Rules */}
        <div className="p-6 glass space-y-4 shadow-[var(--glass-shadow)]">
          <h3 className="t-group">
            Weekly Salary / Owner Pay Calculation Rule
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block t-label mb-1">
                Salary Rule Type
              </label>
              <select
                value={form.salaryRuleType}
                onChange={(e) => setForm({ ...form, salaryRuleType: e.target.value as any })}
                className="w-full px-3.5 py-2.5 glass-input text-sm focus:outline-none"
              >
                <option value="percentage" className="bg-[#5f8a68] text-white">Option A: Percentage of Available Profit</option>
                <option value="cap" className="bg-[#5f8a68] text-white">Option B: Maximum Weekly Salary Cap</option>
                <option value="custom" className="bg-[#5f8a68] text-white">Option C: Custom / Manual Amount</option>
              </select>
            </div>

            {form.salaryRuleType === 'percentage' && (
              <div>
                <label className="block t-label mb-1">
                  Profit Percentage for Salary (%)
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={form.salaryProfitPercentage}
                  onChange={(e) => setForm({ ...form, salaryProfitPercentage: parseInt(e.target.value) || 40 })}
                  className="w-full px-3.5 py-2 glass-input font-mono text-sm"
                />
              </div>
            )}

            {form.salaryRuleType === 'cap' && (
              <div>
                <label className="block t-label mb-1">
                  Weekly Salary Cap ({form.currency})
                </label>
                <input
                  type="number"
                  step="any"
                  value={form.salaryWeeklyCap}
                  onChange={(e) => setForm({ ...form, salaryWeeklyCap: parseFloat(e.target.value) || 15000 })}
                  className="w-full px-3.5 py-2 glass-input font-mono text-sm"
                />
              </div>
            )}
          </div>
        </div>

        {/* Giving Budget & People Limits */}
        <div className="p-6 glass space-y-4 shadow-[var(--glass-shadow)]">
          <h3 className="t-group">
            Giving & Support System Parameters
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block t-label mb-1">
                Monthly Giving Budget ({form.currency})
              </label>
              <input
                type="number"
                step="any"
                value={form.monthlyGivingBudget}
                onChange={(e) => setForm({ ...form, monthlyGivingBudget: parseFloat(e.target.value) || 2000 })}
                className="w-full px-3.5 py-2 glass-input font-mono text-sm"
              />
            </div>

            <div>
              <label className="block t-label mb-1">
                Max People Limit Per Month
              </label>
              <input
                type="number"
                min="1"
                max="50"
                value={form.maxMonthlyPeopleSupported}
                onChange={(e) => setForm({ ...form, maxMonthlyPeopleSupported: parseInt(e.target.value) || 4 })}
                className="w-full px-3.5 py-2 glass-input font-mono text-sm"
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div>
          <button
            type="submit"
            className="w-full py-3.5 glass glass--pill is-active text-[var(--text)] font-semibold text-sm border border-white/80 shadow-[var(--glow)] transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Check className="w-4 h-4 stroke-[2.5]" />
            Save Configuration Changes
          </button>
        </div>

      </form>

      {/* Firebase Cloud Database & Multi-Device Sync */}
      <div className="p-6 glass space-y-4 shadow-[var(--glass-shadow)] border border-emerald-500/20 bg-emerald-500/5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Cloud className="w-5 h-5 text-emerald-500" />
              <h3 className="t-group text-emerald-700">
                Firebase Cloud Database (Free Spark Tier)
              </h3>
              <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-500/20 text-emerald-700 border border-emerald-500/30">
                Active & Provisioned
              </span>
            </div>
            <p className="t-label mt-1">
              Google Cloud Firestore database with multi-device sync, real-time persistence, and zero monthly subscription costs.
            </p>
          </div>

          <div className="text-right">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
              currentUser ? 'bg-emerald-500/15 text-emerald-800 border border-emerald-500/30' : 'bg-amber-500/15 text-amber-800 border border-amber-500/30'
            }`}>
              <span className={`w-2 h-2 rounded-full ${currentUser ? 'bg-emerald-500' : 'bg-amber-500'}`} />
              {currentUser ? `Signed In (${currentUser.email || 'User'})` : 'Local Storage Mode'}
            </span>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-white/40 border border-white/60 text-xs space-y-1">
          <div className="flex items-center justify-between text-[var(--text-muted)]">
            <span>Cloud Database Engine:</span>
            <span className="font-semibold text-[var(--text)]">Google Cloud Firestore</span>
          </div>
          <div className="flex items-center justify-between text-[var(--text-muted)]">
            <span>Free Tier Quotas:</span>
            <span className="font-semibold text-emerald-700">50,000 reads/day · 20,000 writes/day · 1GB storage (100% Free)</span>
          </div>
          <div className="flex items-center justify-between text-[var(--text-muted)]">
            <span>Last Sync Timestamp:</span>
            <span className="font-medium text-[var(--text)]">
              {lastCloudSyncTime ? new Date(lastCloudSyncTime).toLocaleString() : 'Not synced yet'}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-1">
          <button
            type="button"
            onClick={() => setIsAuthModalOpen(true)}
            className="px-4 py-2 glass glass--pill text-[var(--text)] font-semibold text-xs border border-emerald-500/40 bg-emerald-500/10 hover:bg-emerald-500/20 transition-all flex items-center gap-2 cursor-pointer shadow-[var(--glass-shadow)]"
          >
            <Cloud className="w-4 h-4 text-emerald-600" />
            {currentUser ? 'Manage Cloud Account & Sync' : 'Sign In & Enable Cloud Sync'}
          </button>

          {currentUser && (
            <button
              type="button"
              onClick={async () => {
                await syncLocalToCloud();
              }}
              disabled={isCloudSyncing}
              className="px-4 py-2 glass glass--pill text-[var(--text)] font-semibold text-xs border border-white/40 hover:bg-white/30 transition-all flex items-center gap-2 cursor-pointer shadow-[var(--glass-shadow)] disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-indigo-500 ${isCloudSyncing ? 'animate-spin' : ''}`} />
              {isCloudSyncing ? 'Syncing...' : 'Sync to Cloud Now'}
            </button>
          )}

          <button
            type="button"
            onClick={() => setShowInstallModal(true)}
            className="px-4 py-2 glass glass--pill text-[var(--text)] font-semibold text-xs border border-white/60 hover:bg-white/40 transition-all flex items-center gap-2 cursor-pointer shadow-[var(--glass-shadow)]"
          >
            <Smartphone className="w-3.5 h-3.5 text-emerald-700" />
            Install on Phone
          </button>
        </div>
      </div>

      {/* Database Backup & Disaster Recovery */}
      <div className="p-6 glass space-y-4 shadow-[var(--glass-shadow)]">
        <div>
          <h3 className="t-group">
            Data Safety, Backup & Reset
          </h3>
          <p className="t-label mt-0.5">
            Export full system state (JSON) or reset to demo data for testing.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleDownloadBackup}
            className="px-4 py-2 glass glass--pill text-[var(--text)] font-semibold text-xs border border-white/40 hover:bg-white/30 transition-all flex items-center gap-2 cursor-pointer shadow-[var(--glass-shadow)]"
          >
            <Download className="w-4 h-4 text-[var(--ok)]" strokeWidth={1.5} />
            Download Complete JSON Backup
          </button>

          <button
            type="button"
            onClick={() => setShowImportModal(true)}
            className="px-4 py-2 glass glass--pill text-[var(--text)] font-semibold text-xs border border-white/40 hover:bg-white/30 transition-all flex items-center gap-2 cursor-pointer shadow-[var(--glass-shadow)]"
          >
            <Upload className="w-4 h-4 text-[var(--text-2)]" strokeWidth={1.5} />
            Import Backup JSON
          </button>

          <button
            type="button"
            onClick={() => setShowResetConfirmModal(true)}
            className="px-4 py-2 glass glass--pill text-[var(--alert)] font-semibold text-xs border border-[var(--alert)]/40 hover:bg-[var(--alert)]/15 transition-all flex items-center gap-2 cursor-pointer shadow-[var(--glass-shadow)]"
          >
            <RotateCcw className="w-4 h-4 text-[var(--alert)]" strokeWidth={1.5} />
            Reset to Fresh Demonstration Data
          </button>
        </div>
      </div>

      {/* Reset Confirmation Alert Dialog */}
      {showResetConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/25 backdrop-blur-md animate-in fade-in duration-200">
          <div 
            className="w-full max-w-md glass-modal p-6 space-y-4 shadow-[var(--glass-shadow)] animate-modal-enter"
            onClick={(e) => e.stopPropagation()}
            role="alertdialog"
            aria-labelledby="reset-dialog-title"
            aria-describedby="reset-dialog-desc"
          >
            <div className="flex items-start gap-3.5">
              <div className="p-3 glass glass--tile border border-[var(--alert)]/40 bg-[var(--alert)]/15 text-[var(--alert)] shrink-0">
                <RotateCcw className="w-5 h-5" strokeWidth={1.5} />
              </div>
              <div>
                <h3 id="reset-dialog-title" className="t-title text-base">
                  Reset Financial Records?
                </h3>
                <p id="reset-dialog-desc" className="t-label mt-1">
                  This will clear all current transactions, jobs, worker logs, and ledger entries, replacing them with a fresh set of realistic demonstration records. This action cannot be undone.
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-2.5 pt-2 border-t border-white/20">
              <button
                type="button"
                onClick={() => setShowResetConfirmModal(false)}
                className="px-4 py-2 text-xs font-semibold text-[var(--text-2)] hover:text-[var(--text)] glass glass--pill"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  resetToSampleData();
                  setShowResetConfirmModal(false);
                }}
                className="px-4 py-2 glass glass--pill text-[var(--alert)] font-semibold text-xs border border-[var(--alert)]/40 bg-[var(--alert)]/20 shadow-[var(--glass-shadow)]"
              >
                Reset Database
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/20 backdrop-blur-md animate-in fade-in duration-200">
          <div 
            className="w-full max-w-lg glass-modal p-6 space-y-4 shadow-[var(--glass-shadow)] animate-modal-enter"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="t-title text-base">Import JSON Backup</h3>
            <textarea
              rows={8}
              value={importJsonText}
              onChange={(e) => setImportJsonText(e.target.value)}
              placeholder="Paste JSON database backup content here..."
              className="w-full p-3 glass-input font-mono text-xs focus:outline-none"
            />
            {importStatus === 'error' && (
              <p className="text-xs text-[var(--alert)] font-medium">Failed to parse JSON. Please check file format.</p>
            )}
            {importStatus === 'success' && (
              <p className="text-xs text-[var(--ok)] font-medium">Database imported successfully!</p>
            )}
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowImportModal(false)}
                className="px-3.5 py-1.5 text-xs text-[var(--text-2)] hover:text-[var(--text)] glass glass--pill font-medium"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleImport}
                className="px-4 py-2 glass glass--pill is-active text-[var(--text)] font-semibold text-xs border border-white/60 shadow-[var(--glow)]"
              >
                Confirm Import
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile PWA Install Modal */}
      <InstallAppModal
        isOpen={showInstallModal}
        onClose={() => setShowInstallModal(false)}
      />

    </div>
  );
};
