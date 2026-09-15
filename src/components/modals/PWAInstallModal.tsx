import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Download, Monitor, Smartphone, Check, Sparkles } from 'lucide-react';

interface PWAInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
  canInstall: boolean;
  apkDownloadUrl?: string;
  onInstall: () => Promise<boolean>;
}

export const PWAInstallModal: React.FC<PWAInstallModalProps> = ({
  isOpen,
  onClose,
  canInstall,
  apkDownloadUrl,
  onInstall,
}) => {
  const [activeTab, setActiveTab] = useState<'windows' | 'android' | 'ios'>('windows');

  if (!isOpen) return null;

  const handleInstallClick = async () => {
    if (canInstall) {
      await onInstall();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="w-full max-w-lg rounded-3xl glass-panel border border-white/10 shadow-2xl p-6 sm:p-8 relative my-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold font-display text-white flex items-center gap-2">
                Install 3D Life OS
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  App Mode
                </span>
              </h2>
              <p className="text-xs text-slate-400">Launch in an independent window & run 100% offline</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Direct Install CTA if browser supports native prompt */}
        {canInstall && (
          <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-indigo-500/15 via-purple-500/15 to-cyan-500/15 border border-indigo-500/30 flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-bold text-white flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                1-Click Fast Installation Ready
              </p>
              <p className="text-[11px] text-slate-300 mt-0.5">
                Pin to taskbar/home screen with zero extra download.
              </p>
            </div>
            <button
              onClick={handleInstallClick}
              className="px-4 py-2 rounded-xl glass-button-primary text-xs font-bold shrink-0 shadow-lg flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Install Now</span>
            </button>
          </div>
        )}

        {/* Platform Selector Tabs */}
        <div className="flex rounded-xl bg-white/5 border border-white/10 p-1 mb-5 gap-1">
          <button
            onClick={() => setActiveTab('windows')}
            className={`flex-1 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'windows'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
            <span>Windows / PC</span>
          </button>

          <button
            onClick={() => setActiveTab('android')}
            className={`flex-1 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'android'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Android</span>
          </button>

          <button
            onClick={() => setActiveTab('ios')}
            className={`flex-1 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'ios'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span className="text-xs">🍏</span>
            <span>iPhone / iPad</span>
          </button>
        </div>

        {/* Platform Instructions */}
        <div className="space-y-3 mb-6">
          {activeTab === 'windows' && (
            <div className="space-y-2.5 text-xs text-slate-300">
              <div className="p-3 rounded-2xl bg-white/5 border border-white/5 flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-300 flex items-center justify-center font-mono font-bold text-[11px] shrink-0 mt-0.5">1</span>
                <div>
                  <p className="font-semibold text-white">Look at the browser address bar (top right)</p>
                  <p className="text-slate-400 mt-0.5">
                    Click the <strong>Install icon (⊕ or computer with arrow)</strong> in Google Chrome, Microsoft Edge, or Brave.
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-white/5 border border-white/5 flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-300 flex items-center justify-center font-mono font-bold text-[11px] shrink-0 mt-0.5">2</span>
                <div>
                  <p className="font-semibold text-white">Alternative: Browser Menu</p>
                  <p className="text-slate-400 mt-0.5">
                    Click the <strong>three dots menu (⋮)</strong> in Chrome/Edge &gt; <strong>Save and share</strong> (or Apps) &gt; <strong>Install 3D Life OS</strong>.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'android' && (
            <div className="space-y-2.5 text-xs text-slate-300">
              {/* Direct APK Download CTA */}
              <a
                href={apkDownloadUrl || 'https://github.com/Saif-AlSaad/Perosonal_Dashboard/releases/latest/download/LifeOS.apk'}
                download="LifeOS.apk"
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500/25 to-teal-500/25 hover:from-emerald-500/35 hover:to-teal-500/35 border border-emerald-500/40 text-emerald-200 hover:text-white text-xs font-bold flex items-center justify-center gap-2 shadow-lg transition-all"
              >
                <Download className="w-4 h-4 text-emerald-300 animate-bounce" />
                <span>Download LifeOS.apk Directly</span>
              </a>

              <div className="p-3 rounded-2xl bg-white/5 border border-white/5 flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-300 flex items-center justify-center font-mono font-bold text-[11px] shrink-0 mt-0.5">1</span>
                <div>
                  <p className="font-semibold text-white">Tap the downloaded LifeOS.apk notification</p>
                  <p className="text-slate-400 mt-0.5">
                    Android will prompt &quot;Do you want to install this app?&quot;. Tap <strong>Install</strong>.
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-white/5 border border-white/5 flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-300 flex items-center justify-center font-mono font-bold text-[11px] shrink-0 mt-0.5">2</span>
                <div>
                  <p className="font-semibold text-white">Alternative: Chrome Menu Install</p>
                  <p className="text-slate-400 mt-0.5">
                    Tap the <strong>three dots menu (⋮)</strong> in Chrome &gt; <strong>&quot;Install app&quot;</strong> or <strong>&quot;Add to Home screen&quot;</strong>.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'ios' && (
            <div className="space-y-2.5 text-xs text-slate-300">
              <div className="p-3 rounded-2xl bg-white/5 border border-white/5 flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-purple-500/20 text-purple-300 flex items-center justify-center font-mono font-bold text-[11px] shrink-0 mt-0.5">1</span>
                <div>
                  <p className="font-semibold text-white">Open in Safari</p>
                  <p className="text-slate-400 mt-0.5">
                    Tap the <strong>Share button (box with upward arrow)</strong> at the bottom of Safari.
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-white/5 border border-white/5 flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-purple-500/20 text-purple-300 flex items-center justify-center font-mono font-bold text-[11px] shrink-0 mt-0.5">2</span>
                <div>
                  <p className="font-semibold text-white">Scroll down and tap &quot;Add to Home Screen&quot;</p>
                  <p className="text-slate-400 mt-0.5">
                    Confirm by tapping <strong>Add</strong> at the top right. 3D Life OS will launch in native standalone mode with no Safari toolbars!
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Benefits summary */}
        <div className="pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400">
          <div className="flex items-center gap-1.5 text-emerald-400 font-medium">
            <Check className="w-3.5 h-3.5" />
            <span>Zero install size</span>
          </div>
          <div className="flex items-center gap-1.5 text-indigo-400 font-medium">
            <Check className="w-3.5 h-3.5" />
            <span>100% Offline with IndexedDB</span>
          </div>
          <div className="flex items-center gap-1.5 text-cyan-400 font-medium">
            <Check className="w-3.5 h-3.5" />
            <span>Standalone window</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
