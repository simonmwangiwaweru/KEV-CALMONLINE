import React, { useState } from 'react';
import {
  X,
  Cloud,
  CheckCircle2,
  AlertCircle,
  LogOut,
  RefreshCw,
  Mail,
  Lock,
  User as UserIcon,
  ShieldCheck,
  Zap,
  ArrowRight
} from 'lucide-react';
import { useApp } from '../context/AppContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const {
    currentUser,
    isCloudSyncing,
    lastCloudSyncTime,
    cloudSyncError,
    signInWithGoogleAccount,
    signInWithEmailAccount,
    registerWithEmailAccount,
    signOutAccount,
    syncLocalToCloud,
    pullCloudToLocal
  } = useApp();

  const [mode, setMode] = useState<'signin' | 'register'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [syncSuccessMsg, setSyncSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setAuthError(null);
    try {
      await signInWithGoogleAccount();
    } catch (err: unknown) {
      const e = err as Error;
      setAuthError(e?.message || 'Google sign-in failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setAuthError('Please fill in both email and password.');
      return;
    }
    setLoading(true);
    setAuthError(null);
    try {
      if (mode === 'signin') {
        await signInWithEmailAccount(email, password);
      } else {
        await registerWithEmailAccount(email, password, displayName);
      }
    } catch (err: unknown) {
      const e = err as Error;
      let msg = e?.message || 'Authentication failed.';
      if (msg.includes('auth/invalid-credential') || msg.includes('auth/wrong-password')) {
        msg = 'Invalid email or password.';
      } else if (msg.includes('auth/email-already-in-use')) {
        msg = 'An account with this email already exists.';
      } else if (msg.includes('auth/weak-password')) {
        msg = 'Password should be at least 6 characters.';
      }
      setAuthError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleManualSync = async () => {
    setSyncSuccessMsg(null);
    try {
      await syncLocalToCloud();
      setSyncSuccessMsg('Data successfully backed up to your Firebase cloud account!');
      setTimeout(() => setSyncSuccessMsg(null), 4000);
    } catch (err: unknown) {
      const e = err as Error;
      setAuthError(e?.message || 'Cloud backup failed.');
    }
  };

  const handlePullSync = async () => {
    if (!confirm('This will load your records from the cloud. Continue?')) return;
    setSyncSuccessMsg(null);
    try {
      await pullCloudToLocal();
      setSyncSuccessMsg('Latest cloud records loaded successfully!');
      setTimeout(() => setSyncSuccessMsg(null), 4000);
    } catch (err: unknown) {
      const e = err as Error;
      setAuthError(e?.message || 'Could not pull cloud records.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/20 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="w-full max-w-lg glass-modal rounded-[28px] shadow-[var(--glass-shadow)] border border-white/60 overflow-hidden flex flex-col max-h-[90vh] animate-modal-enter text-[var(--text)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glass Header */}
        <div className="px-6 py-4 border-b border-white/30 flex items-center justify-between bg-white/20 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl glass flex items-center justify-center border border-white/60 shadow-xs text-emerald-700 bg-white/40">
              <Cloud className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="t-group text-emerald-800">
                  Cloud Sync & Account
                </span>
                <span className="text-[var(--text-3)]">·</span>
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-500/15 text-emerald-800 border border-emerald-500/30">
                  Firebase Free Spark
                </span>
              </div>
              <p className="t-label mt-0.5 text-xs">
                Real-time backup & cross-device sync for Calm Online
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="icon-btn"
            aria-label="Close modal"
          >
            <X className="w-4 h-4 text-[var(--text-2)]" strokeWidth={1.5} />
          </button>
        </div>

        <div className="p-6 space-y-5 overflow-y-auto">
          {currentUser ? (
            /* Logged In View */
            <div className="space-y-4">
              {/* Account Card */}
              <div className="p-4 rounded-2xl glass border border-white/60 bg-white/40 backdrop-blur-md shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-base shadow-sm">
                      {currentUser.displayName ? currentUser.displayName[0].toUpperCase() : (currentUser.email ? currentUser.email[0].toUpperCase() : 'U')}
                    </div>
                    <div>
                      <div className="font-bold text-sm text-[var(--text)]">
                        {currentUser.displayName || 'Calm Online User'}
                      </div>
                      <div className="text-xs text-[var(--text-2)] flex items-center gap-1.5 mt-0.5">
                        <Mail className="w-3.5 h-3.5 text-emerald-700" />
                        {currentUser.email || 'Anonymous Session'}
                      </div>
                    </div>
                  </div>
                  <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-800 bg-emerald-500/15 px-2.5 py-1 rounded-full border border-emerald-500/30">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    Cloud Active
                  </span>
                </div>

                <div className="pt-2 border-t border-white/20 text-xs text-[var(--text-2)] flex items-center justify-between">
                  <span className="t-label">Last Cloud Sync:</span>
                  <span className="font-mono font-semibold text-[var(--text)]">
                    {lastCloudSyncTime ? new Date(lastCloudSyncTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : 'Pending Initial Sync'}
                  </span>
                </div>
              </div>

              {/* Status Messages */}
              {syncSuccessMsg && (
                <div className="p-3 rounded-2xl glass border border-emerald-500/40 bg-emerald-500/15 text-emerald-800 text-xs flex items-center gap-2 shadow-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="font-medium">{syncSuccessMsg}</span>
                </div>
              )}

              {(authError || cloudSyncError) && (
                <div className="p-3 rounded-2xl glass border border-rose-500/30 bg-rose-500/10 text-rose-800 text-xs flex items-center gap-2 shadow-xs">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span className="font-medium">{authError || cloudSyncError}</span>
                </div>
              )}

              {/* Free Tier Info Badge */}
              <div className="p-3.5 rounded-2xl glass border border-indigo-500/25 bg-indigo-500/10 text-xs space-y-1 shadow-xs">
                <div className="font-bold text-indigo-900 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-indigo-600" />
                  100% Free Firebase Database Tier
                </div>
                <p className="text-[var(--text-2)] text-[11px] leading-relaxed">
                  Your jobs, ledger, and worker records sync directly into Google Cloud Firestore. Free plan covers 50,000 reads and 20,000 writes every day with zero card required.
                </p>
              </div>

              {/* Actions */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <button
                  onClick={handleManualSync}
                  disabled={isCloudSyncing}
                  className="py-2.5 px-4 glass glass--pill is-active text-[var(--text)] font-semibold text-xs border border-emerald-600/40 bg-emerald-500/20 hover:bg-emerald-500/30 flex items-center justify-center gap-2 transition-all shadow-[var(--glow)] active:scale-95 disabled:opacity-50 cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 text-emerald-800 ${isCloudSyncing ? 'animate-spin' : ''}`} />
                  {isCloudSyncing ? 'Backing Up...' : 'Backup to Cloud'}
                </button>

                <button
                  onClick={handlePullSync}
                  disabled={isCloudSyncing}
                  className="py-2.5 px-4 glass glass--pill text-[var(--text)] font-semibold text-xs border border-white/60 hover:bg-white/50 flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer shadow-[var(--glass-shadow)]"
                >
                  <Cloud className="w-3.5 h-3.5 text-indigo-600" />
                  Load Cloud Data
                </button>
              </div>

              {/* Sign Out */}
              <div className="pt-3 border-t border-white/20 flex justify-between items-center">
                <span className="text-[11px] text-[var(--text-3)]">
                  Data remains saved locally even when signed out.
                </span>
                <button
                  onClick={() => signOutAccount()}
                  className="px-3 py-1.5 glass glass--pill text-xs font-semibold text-rose-700 hover:bg-rose-500/15 border border-rose-500/30 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Sign Out
                </button>
              </div>
            </div>
          ) : (
            /* Logged Out / Sign In / Register View */
            <div className="space-y-4">
              {/* Highlight Banner */}
              <div className="p-4 rounded-2xl glass border border-emerald-500/30 bg-emerald-500/10 space-y-1.5 shadow-xs">
                <div className="flex items-center gap-2 font-bold text-xs text-emerald-800">
                  <Zap className="w-4 h-4 text-emerald-600" />
                  Free Cloud Backup & Multi-Device Access
                </div>
                <p className="text-xs text-[var(--text-2)] leading-relaxed">
                  Sign in to securely sync your Calm Online ledger, jobs, and worker records to the cloud. Access your books from your phone or any computer in real time.
                </p>
              </div>

              {/* Google Sign-in Button */}
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full py-2.5 px-4 glass glass--pill hover:bg-white/60 border border-white/70 text-xs font-bold text-[var(--text)] flex items-center justify-center gap-2.5 transition-all shadow-[var(--glass-shadow)] active:scale-95 cursor-pointer disabled:opacity-50"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                Continue with Google
              </button>

              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-white/30" />
                <span className="text-[10px] text-[var(--text-3)] uppercase tracking-wider font-semibold">or with email</span>
                <div className="flex-1 h-px bg-white/30" />
              </div>

              {/* Error Box */}
              {authError && (
                <div className="p-3 rounded-2xl glass border border-rose-500/30 bg-rose-500/10 text-rose-800 text-xs flex items-center gap-2 shadow-xs">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span className="font-medium">{authError}</span>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleEmailSubmit} className="space-y-3">
                {mode === 'register' && (
                  <div>
                    <label className="block t-label mb-1">
                      Your Name / Business Name
                    </label>
                    <div className="relative">
                      <UserIcon className="w-4 h-4 absolute left-3 top-2.5 text-[var(--text-3)]" />
                      <input
                        type="text"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        placeholder="e.g. John K."
                        className="w-full pl-9 pr-3 py-2 text-xs glass-input font-medium"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block t-label mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3 top-2.5 text-[var(--text-3)]" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full pl-9 pr-3 py-2 text-xs glass-input font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block t-label mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3 top-2.5 text-[var(--text-3)]" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-9 pr-3 py-2 text-xs glass-input font-medium"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 px-4 glass glass--pill is-active text-[var(--text)] font-semibold text-xs border border-emerald-600/40 bg-emerald-500/20 hover:bg-emerald-500/30 flex items-center justify-center gap-2 transition-all shadow-[var(--glow)] active:scale-95 disabled:opacity-50 cursor-pointer"
                >
                  {loading ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-800" />
                  ) : (
                    <>
                      <span>{mode === 'signin' ? 'Sign In to Account' : 'Create Free Account'}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-emerald-800" />
                    </>
                  )}
                </button>
              </form>

              {/* Mode switch */}
              <div className="text-center pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setMode(mode === 'signin' ? 'register' : 'signin');
                    setAuthError(null);
                  }}
                  className="text-xs font-semibold text-emerald-800 hover:underline cursor-pointer"
                >
                  {mode === 'signin'
                    ? "Don't have an account yet? Create one for free"
                    : 'Already have an account? Sign In'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
