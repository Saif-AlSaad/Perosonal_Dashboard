import React, { useState } from 'react';
import { Search, Palette, Settings as SettingsIcon, Lock, Sparkles, Download } from 'lucide-react';
import { UserProfile } from '../../types';
import { usePWAInstall } from '../../hooks/usePWAInstall';
import { PWAInstallModal } from '../modals/PWAInstallModal';

interface HeaderProps {
  profile: UserProfile;
  onOpenSearch: () => void;
  onOpenTheme: () => void;
  onOpenSettings: () => void;
  onLock: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  profile,
  onOpenSearch,
  onOpenTheme,
  onOpenSettings,
  onLock,
}) => {
  const { canInstall, isInstalled, isAndroid, apkDownloadUrl, install } = usePWAInstall();
  const [showInstallGuide, setShowInstallGuide] = useState(false);

  const handleInstallAction = async () => {
    if (canInstall) {
      const success = await install();
      if (!success) {
        setShowInstallGuide(true);
      }
    } else {
      setShowInstallGuide(true);
    }
  };
  return (
    <header className="sticky top-0 z-30 w-full px-4 sm:px-8 py-3.5 glass-panel border-b border-white/10 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Left: Avatar & Identity */}
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="relative shrink-0">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full overflow-hidden border border-white/20 shadow-md bg-slate-800 flex items-center justify-center">
              {profile.avatarUrl ? (
                <img
                  src={profile.avatarUrl}
                  alt={profile.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-white text-sm font-bold">
                  {profile.name.slice(0, 2).toUpperCase()}
                </span>
              )}
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-slate-900" title="Active Session" />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-sm sm:text-base font-bold font-display text-white truncate tracking-tight">
                {profile.name}
              </h1>
              <span className="hidden md:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-indigo-500/15 border border-indigo-500/30 text-indigo-300">
                <Sparkles className="w-2.5 h-2.5" />
                Life OS
              </span>
            </div>
            <p className="text-xs text-slate-400 truncate font-sans">
              {profile.tagline}
            </p>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          {/* Direct Android APK Download Button (Auto-detected on Android) */}
          {isAndroid && !isInstalled ? (
            <a
              href={apkDownloadUrl}
              download="LifeOS.apk"
              target="_blank"
              rel="noopener noreferrer"
              id="android-download-apk-btn"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-emerald-500/20 via-teal-500/20 to-cyan-500/20 hover:from-emerald-500/30 hover:to-teal-500/30 border border-emerald-500/40 text-emerald-200 hover:text-white text-xs font-semibold shadow-lg transition-all animate-pulse shrink-0 whitespace-nowrap"
              title="Download Android App (.apk)"
              aria-label="Download Android App (.apk)"
            >
              <span>📥 Download Android App (.apk)</span>
            </a>
          ) : !isInstalled && (
            <button
              onClick={handleInstallAction}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-cyan-500/20 hover:from-indigo-500/30 hover:to-cyan-500/30 border border-indigo-500/40 text-indigo-200 hover:text-white text-xs font-semibold shadow-lg transition-all"
              title="Install 3D Life OS to your desktop or phone home screen"
              aria-label="Install App"
            >
              <Download className="w-3.5 h-3.5 text-cyan-300" />
              <span className="hidden sm:inline">Install App</span>
            </button>
          )}

          {/* Global Search Button */}
          <button
            onClick={onOpenSearch}
            className="flex items-center gap-2 px-3 py-2 rounded-xl glass-pill text-slate-300 hover:text-white text-xs font-medium transition-all group"
            aria-label="Search dashboard (Ctrl+K)"
          >
            <Search className="w-4 h-4 text-slate-400 group-hover:text-indigo-400 transition-colors" />
            <span className="hidden md:inline">Search...</span>
            <kbd className="hidden lg:inline-block px-1.5 py-0.5 text-[10px] font-mono bg-white/10 rounded border border-white/10 text-slate-400">
              ⌘K
            </kbd>
          </button>

          {/* Theme Switcher Button */}
          <button
            onClick={onOpenTheme}
            className="p-2 sm:px-3 sm:py-2 rounded-xl glass-pill text-slate-300 hover:text-white text-xs font-medium flex items-center gap-1.5 transition-all"
            title="Themes & Appearance"
            aria-label="Customize theme"
          >
            <Palette className="w-4 h-4 text-cyan-400" />
            <span className="hidden sm:inline">Theme</span>
          </button>

          {/* Settings Button */}
          <button
            onClick={onOpenSettings}
            className="p-2 sm:px-3 sm:py-2 rounded-xl glass-pill text-slate-300 hover:text-white text-xs font-medium flex items-center gap-1.5 transition-all"
            title="Settings"
            aria-label="Open settings"
          >
            <SettingsIcon className="w-4 h-4 text-indigo-400" />
            <span className="hidden sm:inline">Settings</span>
          </button>

          {/* Lock Dashboard Button */}
          <button
            onClick={onLock}
            className="p-2 sm:px-3 sm:py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-300 hover:text-rose-200 text-xs font-medium flex items-center gap-1.5 transition-all"
            title="Lock Dashboard"
            aria-label="Lock dashboard"
          >
            <Lock className="w-4 h-4 text-rose-400" />
            <span className="hidden sm:inline font-medium">Lock</span>
          </button>
        </div>
      </div>

      {/* PWA Installation Guide Modal */}
      <PWAInstallModal
        isOpen={showInstallGuide}
        onClose={() => setShowInstallGuide(false)}
        canInstall={canInstall}
        apkDownloadUrl={apkDownloadUrl}
        onInstall={install}
      />
    </header>
  );
};
