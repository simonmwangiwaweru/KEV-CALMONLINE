import React, { useState, useEffect } from 'react';
import { 
  Smartphone, 
  X, 
  Share2, 
  PlusSquare, 
  Check, 
  Copy, 
  Download, 
  ExternalLink,
  ShieldCheck,
  Zap,
  QrCode,
  FileCode,
  Package,
  HardDrive,
  Globe,
  AlertTriangle,
  ArrowRight
} from 'lucide-react';

interface InstallAppModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InstallAppModal: React.FC<InstallAppModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);
  const [platform, setPlatform] = useState<'android' | 'ios' | 'apk' | 'qr'>('android');
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  // Live active app URL
  const activeDevUrl = 'https://ais-dev-5boe2e5fgvzxmkhzmlmimr-377141129621.europe-west2.run.app';
  
  // Dynamically resolve URL to whichever valid domain the user is actively visiting
  const [currentOrigin, setCurrentOrigin] = useState<string>(activeDevUrl);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.origin.startsWith('http')) {
      const origin = window.location.origin;
      if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
        setCurrentOrigin(activeDevUrl);
      } else {
        setCurrentOrigin(origin);
      }
    }

    // Detect mobile platform
    const ua = navigator.userAgent.toLowerCase();
    if (/iphone|ipad|ipod/.test(ua)) {
      setPlatform('ios');
    } else if (/android/.test(ua)) {
      setPlatform('android');
    } else {
      setPlatform('android');
    }

    // Check if already in standalone mode
    if (window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone) {
      setIsInstalled(true);
    }

    // Listen for beforeinstallprompt event (Android / Chromium)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  if (!isOpen) return null;

  const appUrl = currentOrigin;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&margin=8&data=${encodeURIComponent(appUrl)}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(appUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleNativeInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstalled(true);
      setDeferredPrompt(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/20 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="w-full max-w-lg glass-modal rounded-[28px] shadow-[var(--glass-shadow)] border border-white/60 overflow-hidden flex flex-col max-h-[92vh] animate-modal-enter text-[var(--text)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/30 flex items-center justify-between bg-white/20 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl glass flex items-center justify-center border border-white/60 shadow-xs text-emerald-700 bg-white/40">
              <Smartphone className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="t-group text-emerald-800">
                  Mobile App & Offline APK
                </span>
                <span className="text-[var(--text-3)]">·</span>
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-500/15 text-emerald-800 border border-emerald-500/30">
                  Android & iOS
                </span>
              </div>
              <h3 className="font-bold text-base text-[var(--text)] tracking-tight">
                Get Calm Online On Your Phone
              </h3>
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

        {/* Platform Selector Tabs */}
        <div className="px-6 pt-3 pb-1 border-b border-white/15 bg-white/10 flex flex-wrap gap-1.5 sm:gap-2">
          <button
            onClick={() => setPlatform('android')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-full transition-all cursor-pointer ${
              platform === 'android'
                ? 'glass is-active border border-emerald-600/40 text-emerald-900 shadow-xs'
                : 'text-[var(--text-2)] hover:text-[var(--text)] hover:bg-white/20'
            }`}
          >
            Android (WebAPK)
          </button>
          <button
            onClick={() => setPlatform('apk')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-full transition-all cursor-pointer ${
              platform === 'apk'
                ? 'glass is-active border border-emerald-600/40 text-emerald-900 shadow-xs'
                : 'text-[var(--text-2)] hover:text-[var(--text)] hover:bg-white/20'
            }`}
          >
            Standalone .APK
          </button>
          <button
            onClick={() => setPlatform('ios')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-full transition-all cursor-pointer ${
              platform === 'ios'
                ? 'glass is-active border border-emerald-600/40 text-emerald-900 shadow-xs'
                : 'text-[var(--text-2)] hover:text-[var(--text)] hover:bg-white/20'
            }`}
          >
            iPhone (Safari)
          </button>
          <button
            onClick={() => setPlatform('qr')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-full transition-all cursor-pointer ${
              platform === 'qr'
                ? 'glass is-active border border-emerald-600/40 text-emerald-900 shadow-xs'
                : 'text-[var(--text-2)] hover:text-[var(--text)] hover:bg-white/20'
            }`}
          >
            Scan QR
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4 overflow-y-auto">
          {/* Active Live Link Announcement */}
          <div className="p-3.5 rounded-2xl glass border border-emerald-500/30 bg-emerald-500/10 space-y-1.5 shadow-xs">
            <div className="flex items-center gap-2 font-bold text-xs text-emerald-800">
              <Zap className="w-4 h-4 text-emerald-600" />
              Verified Active URL (Use in Chrome)
            </div>
            <p className="text-xs text-[var(--text-2)] leading-relaxed">
              If your phone showed &quot;Page Not Found&quot;, it was loading the unshared preview. Use the active link below directly in Google Chrome:
            </p>
            <div className="pt-1 flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={appUrl}
                className="w-full px-3 py-1.5 text-xs glass-input font-mono truncate"
              />
              <button
                onClick={handleCopyLink}
                className="px-3.5 py-1.5 glass glass--pill hover:bg-white/60 text-xs font-semibold text-[var(--text)] border border-white/60 flex items-center gap-1.5 cursor-pointer shrink-0 transition-all shadow-xs"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-[var(--text-2)]" />
                    <span>Copy Link</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Standalone .APK Tab */}
          {platform === 'apk' && (
            <div className="space-y-3.5">
              <div className="p-4 rounded-2xl glass border border-indigo-500/30 bg-indigo-500/10 space-y-2 shadow-xs">
                <div className="flex items-center gap-2 font-bold text-xs text-indigo-900">
                  <Package className="w-4 h-4 text-indigo-700" />
                  How to Build / Download a Direct Android .APK File
                </div>
                <p className="text-xs text-[var(--text-2)] leading-relaxed">
                  Calm Online is fully compliant with Android PWA and TWA packaging standards. You can generate a signed standalone <strong>.apk</strong> file in under 60 seconds:
                </p>
              </div>

              <div className="p-4 rounded-2xl glass border border-white/60 bg-white/40 space-y-3 text-xs text-[var(--text-2)]">
                <div className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center shrink-0">1</span>
                  <div>
                    <span className="font-bold text-[var(--text)]">Publish the Public App:</span>
                    <p className="mt-0.5 text-[var(--text-2)]">
                      In the top-right corner of Google AI Studio, click <strong>&quot;Share&quot;</strong> or <strong>&quot;Publish&quot;</strong> to activate the public URL.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center shrink-0">2</span>
                  <div className="flex-1">
                    <span className="font-bold text-[var(--text)]">Go to PWABuilder (Official Microsoft/Google Tool):</span>
                    <p className="mt-0.5 text-[var(--text-2)]">
                      Visit <a href="https://www.pwabuilder.com" target="_blank" rel="noreferrer" className="text-emerald-700 underline font-semibold">pwabuilder.com</a> on your computer or phone.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center shrink-0">3</span>
                  <div>
                    <span className="font-bold text-[var(--text)]">Enter URL &amp; Download APK:</span>
                    <p className="mt-0.5 text-[var(--text-2)]">
                      Paste your Calm Online URL, click <strong>&quot;Package for Android&quot;</strong>, and select <strong>&quot;Download APK&quot;</strong>.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center shrink-0">4</span>
                  <div>
                    <span className="font-bold text-[var(--text)]">Install onto Android:</span>
                    <p className="mt-0.5 text-[var(--text-2)]">
                      Send the downloaded <code>.apk</code> to your phone (via USB, Google Drive, or WhatsApp) and tap to install!
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-xl glass border border-emerald-500/20 bg-emerald-500/5 text-xs text-emerald-900 flex items-center gap-2">
                <HardDrive className="w-4 h-4 text-emerald-600 shrink-0" />
                <span><strong>100% Offline Capable:</strong> All ledger transactions, jobs, workers, and settings are cached locally on your device storage without requiring an internet connection.</span>
              </div>
            </div>
          )}

          {/* Android WebAPK Guide */}
          {platform === 'android' && (
            <div className="space-y-3.5">
              {deferredPrompt && (
                <button
                  onClick={handleNativeInstall}
                  className="w-full py-3 px-4 glass glass--pill is-active text-[var(--text)] font-bold text-sm border border-emerald-600/40 bg-emerald-500/25 hover:bg-emerald-500/35 flex items-center justify-center gap-2 transition-all shadow-[var(--glow)] active:scale-95 cursor-pointer"
                >
                  <Download className="w-4 h-4 text-emerald-800" />
                  <span>Install Calm Online App Now</span>
                </button>
              )}

              <div className="p-4 rounded-2xl glass border border-white/60 bg-white/40 space-y-3 text-xs text-[var(--text-2)]">
                <div className="text-xs font-semibold text-[var(--text)] border-b border-white/30 pb-1.5 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  Fastest Way (Native WebAPK - No build tools required)
                </div>

                <div className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center shrink-0">1</span>
                  <div>
                    <span className="font-bold text-[var(--text)]">Open in Google Chrome:</span>
                    <p className="mt-0.5 text-[var(--text-2)]">
                      Open <strong>Google Chrome</strong> on your Android phone and paste the active URL above.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center shrink-0">2</span>
                  <div>
                    <span className="font-bold text-[var(--text)]">Tap Install App:</span>
                    <p className="mt-0.5 text-[var(--text-2)]">
                      Tap the three dots (<strong>⋮</strong>) in the top-right corner of Chrome, then tap <strong className="text-emerald-800">&quot;Install app&quot;</strong>.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center shrink-0">3</span>
                  <div>
                    <span className="font-bold text-[var(--text)]">Android automatically builds the APK:</span>
                    <p className="mt-0.5 text-[var(--text-2)]">
                      Google Play Services packages the app into an official Android WebAPK with its own dedicated icon, splash screen, and full offline caching.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* iOS Guide */}
          {platform === 'ios' && (
            <div className="p-4 rounded-2xl glass border border-white/60 bg-white/40 space-y-3.5 text-xs text-[var(--text-2)]">
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center shrink-0">1</span>
                <div>
                  <span className="font-bold text-[var(--text)]">Open in Safari:</span>
                  <p className="mt-0.5 text-[var(--text-2)]">
                    Open the link in Apple <strong className="text-[var(--text)]">Safari</strong> browser on your iPhone.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center shrink-0">2</span>
                <div className="flex-1">
                  <span className="font-bold text-[var(--text)]">Tap the Share Icon:</span>
                  <p className="mt-0.5 text-[var(--text-2)] flex items-center gap-1.5">
                    Tap the <strong className="text-[var(--text)] flex items-center gap-1"><Share2 className="w-3.5 h-3.5 inline text-indigo-600" /> Share button</strong> in the bottom toolbar.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center shrink-0">3</span>
                <div>
                  <span className="font-bold text-[var(--text)]">Tap &quot;Add to Home Screen&quot;:</span>
                  <p className="mt-0.5 text-[var(--text-2)] flex items-center gap-1.5">
                    Scroll down and choose <strong className="text-emerald-800 flex items-center gap-1"><PlusSquare className="w-3.5 h-3.5 inline text-emerald-600" /> Add to Home Screen</strong>.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* QR Code Tab */}
          {platform === 'qr' && (
            <div className="flex flex-col items-center justify-center text-center p-4 glass rounded-2xl border border-white/60 bg-white/30 space-y-3">
              <div className="p-3 bg-white rounded-2xl shadow-md border border-slate-200">
                <img 
                  src={qrCodeUrl} 
                  alt="Scan QR code to open Calm Online" 
                  className="w-44 h-44 object-contain"
                />
              </div>
              <p className="text-xs text-[var(--text-2)] max-w-xs">
                Point your Android camera at this QR code to instantly open the active link in Chrome.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
