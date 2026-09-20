import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  Settings as SettingsIcon, 
  User, 
  Shield, 
  Database, 
  X, 
  Check, 
  Download, 
  Upload, 
  AlertTriangle, 
  Sparkles, 
  Lock, 
  Eye, 
  EyeOff 
} from 'lucide-react';
import { UserProfile, UserSettings } from '../../types';
import { hashPasskey } from '../../services/auth';
import { exportAllData, importData, resetDatabaseToSeed } from '../../services/db';
import { useToast } from '../common/ToastContext';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  settings: UserSettings;
  onSaveProfile: (profile: UserProfile) => void;
  onSaveSettings: (settings: UserSettings) => void;
  onDataReload: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  profile,
  settings,
  onSaveProfile,
  onSaveSettings,
  onDataReload,
}) => {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'experience' | 'data'>('profile');

  // Profile Form State
  const [profileForm, setProfileForm] = useState<UserProfile>(profile);

  // Security Form State
  const [currentPasskey, setCurrentPasskey] = useState('');
  const [newPasskey, setNewPasskey] = useState('');
  const [confirmPasskey, setConfirmPasskey] = useState('');
  const [showPasskeys, setShowPasskeys] = useState(false);
  const [autoLockMinutes, setAutoLockMinutes] = useState(settings.autoLockMinutes);

  // Experience Settings
  const [reducedMotion, setReducedMotion] = useState(settings.reducedMotion);

  // Reset Confirmation State
  const [isConfirmingReset, setIsConfirmingReset] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  // File input for JSON restore
  const importFileRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Profile Save
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveProfile(profileForm);
    showToast('Profile information updated', 'success');
  };

  // Passkey Change
  const handleChangePasskey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPasskey || !newPasskey) {
      showToast('Please fill in current and new passkeys', 'error');
      return;
    }

    const currentHash = await hashPasskey(currentPasskey);
    if (currentHash !== settings.passkeyHash) {
      showToast('Current passkey is incorrect', 'error');
      return;
    }

    if (newPasskey !== confirmPasskey) {
      showToast('New passkeys do not match', 'error');
      return;
    }

    if (newPasskey.length < 4) {
      showToast('Passkey should be at least 4 characters', 'error');
      return;
    }

    const newHash = await hashPasskey(newPasskey);
    const updatedSettings = {
      ...settings,
      passkeyHash: newHash,
      autoLockMinutes,
    };

    onSaveSettings(updatedSettings);
    setCurrentPasskey('');
    setNewPasskey('');
    setConfirmPasskey('');
    showToast('Passkey changed successfully', 'success');
  };

  // Experience Toggle Save
  const handleExperienceChange = (key: 'reducedMotion', val: boolean) => {
    setReducedMotion(val);

    const updated = {
      ...settings,
      [key]: val,
    };
    onSaveSettings(updated);
    showToast('Reduced Motion setting updated', 'info');
  };

  // Export JSON Backup
  const handleExportData = async () => {
    try {
      const json = await exportAllData();
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `demo-life-os-backup-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      showToast('Complete backup exported successfully', 'success');
    } catch {
      showToast('Failed to export backup', 'error');
    }
  };

  // Import JSON Backup
  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const text = reader.result as string;
        const success = await importData(text);
        if (success) {
          showToast('Data restored successfully! Refreshing view...', 'success');
          onDataReload();
          onClose();
        } else {
          showToast('Invalid backup file', 'error');
        }
      } catch {
        showToast('Error parsing backup file', 'error');
      }
    };
    reader.readAsText(file);
  };

  // Reset to default seed
  const handleResetData = async () => {
    setIsResetting(true);
    try {
      await resetDatabaseToSeed();
      showToast('Database reset to authentic demo state', 'success');
      onDataReload();
      onClose();
    } catch (err) {
      console.error('Reset failed', err);
      showToast('Reset failed. Please try again.', 'error');
    } finally {
      setIsResetting(false);
      setIsConfirmingReset(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 dark:bg-black/80 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="w-full max-w-2xl rounded-3xl bg-white dark:glass-panel border border-slate-200 dark:border-white/10 shadow-2xl p-6 sm:p-8 relative my-auto max-h-[90vh] flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-white/10 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-500/15 border border-indigo-200 dark:border-indigo-500/30 text-indigo-600 dark:text-indigo-400">
              <SettingsIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold font-display text-slate-900 dark:text-white">System Settings</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Manage identity, security, experience, and data</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 my-4 p-1 rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5 shrink-0 overflow-x-auto">
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shrink-0 cursor-pointer ${
              activeTab === 'profile' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Profile</span>
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shrink-0 cursor-pointer ${
              activeTab === 'security' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Security</span>
          </button>
          <button
            onClick={() => setActiveTab('experience')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shrink-0 cursor-pointer ${
              activeTab === 'experience' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Motion & FX</span>
          </button>
          <button
            onClick={() => setActiveTab('data')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shrink-0 cursor-pointer ${
              activeTab === 'data' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>Data Vault</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto py-2 space-y-6 pr-1">
          {/* PROFILE TAB */}
          {activeTab === 'profile' && (
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={profileForm.name}
                    onChange={e => setProfileForm({ ...profileForm, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl glass-input text-white text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                    Title / Role
                  </label>
                  <input
                    type="text"
                    value={profileForm.title}
                    onChange={e => setProfileForm({ ...profileForm, title: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl glass-input text-white text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                  Tagline (Header Display)
                </label>
                <input
                  type="text"
                  value={profileForm.tagline}
                  onChange={e => setProfileForm({ ...profileForm, tagline: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl glass-input text-white text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                  Bio / Philosophy
                </label>
                <textarea
                  rows={3}
                  value={profileForm.bio}
                  onChange={e => setProfileForm({ ...profileForm, bio: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl glass-input text-white text-xs resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    value={profileForm.location}
                    onChange={e => setProfileForm({ ...profileForm, location: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl glass-input text-white text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                    Education
                  </label>
                  <input
                    type="text"
                    value={profileForm.education}
                    onChange={e => setProfileForm({ ...profileForm, education: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl glass-input text-white text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                    Current Focus
                  </label>
                  <input
                    type="text"
                    value={profileForm.careerFocus}
                    onChange={e => setProfileForm({ ...profileForm, careerFocus: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl glass-input text-white text-xs"
                  />
                </div>
              </div>

              {/* Social Links */}
              <div className="pt-2 border-t border-white/5 space-y-3">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Online Presence & Links
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="url"
                    placeholder="GitHub URL"
                    value={profileForm.socialLinks.github || ''}
                    onChange={e =>
                      setProfileForm({
                        ...profileForm,
                        socialLinks: { ...profileForm.socialLinks, github: e.target.value },
                      })
                    }
                    className="px-3 py-2 rounded-xl glass-input text-white text-xs"
                  />
                  <input
                    type="url"
                    placeholder="LinkedIn URL"
                    value={profileForm.socialLinks.linkedin || ''}
                    onChange={e =>
                      setProfileForm({
                        ...profileForm,
                        socialLinks: { ...profileForm.socialLinks, linkedin: e.target.value },
                      })
                    }
                    className="px-3 py-2 rounded-xl glass-input text-white text-xs"
                  />
                  <input
                    type="url"
                    placeholder="Portfolio URL"
                    value={profileForm.socialLinks.portfolio || ''}
                    onChange={e =>
                      setProfileForm({
                        ...profileForm,
                        socialLinks: { ...profileForm.socialLinks, portfolio: e.target.value },
                      })
                    }
                    className="px-3 py-2 rounded-xl glass-input text-white text-xs"
                  />
                  <input
                    type="email"
                    placeholder="Email Address"
                    value={profileForm.socialLinks.email || ''}
                    onChange={e =>
                      setProfileForm({
                        ...profileForm,
                        socialLinks: { ...profileForm.socialLinks, email: e.target.value },
                      })
                    }
                    className="px-3 py-2 rounded-xl glass-input text-white text-xs"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl glass-button-primary text-xs font-bold flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Save Profile</span>
                </button>
              </div>
            </form>
          )}

          {/* SECURITY TAB */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              {/* Change Passkey Form */}
              <form onSubmit={handleChangePasskey} className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Change Entry Passkey
                  </h4>
                  <button
                    type="button"
                    onClick={() => setShowPasskeys(!showPasskeys)}
                    className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                  >
                    {showPasskeys ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    <span>{showPasskeys ? 'Hide' : 'Reveal'}</span>
                  </button>
                </div>

                <div>
                  <label className="block text-xs text-slate-400 mb-1">Current Passkey</label>
                  <input
                    type={showPasskeys ? 'text' : 'password'}
                    value={currentPasskey}
                    onChange={e => setCurrentPasskey(e.target.value)}
                    placeholder="Enter current passkey (default: demopass)"
                    className="w-full px-3.5 py-2.5 rounded-xl glass-input text-white text-xs"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">New Passkey</label>
                    <input
                      type={showPasskeys ? 'text' : 'password'}
                      value={newPasskey}
                      onChange={e => setNewPasskey(e.target.value)}
                      placeholder="Enter new passkey"
                      className="w-full px-3.5 py-2.5 rounded-xl glass-input text-white text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Confirm New Passkey</label>
                    <input
                      type={showPasskeys ? 'text' : 'password'}
                      value={confirmPasskey}
                      onChange={e => setConfirmPasskey(e.target.value)}
                      placeholder="Confirm new passkey"
                      className="w-full px-3.5 py-2.5 rounded-xl glass-input text-white text-xs"
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl glass-button-primary text-xs font-bold flex items-center gap-1.5"
                  >
                    <Lock className="w-3.5 h-3.5" />
                    <span>Update Passkey</span>
                  </button>
                </div>
              </form>

              {/* Auto-lock timer setting */}
              <div className="pt-4 border-t border-white/5">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                  Session Auto-Lock Inactivity Timeout
                </h4>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { label: 'Disabled', val: 0 },
                    { label: '5 Minutes', val: 5 },
                    { label: '15 Minutes', val: 15 },
                    { label: '30 Minutes', val: 30 },
                  ].map(item => (
                    <button
                      key={item.val}
                      type="button"
                      onClick={() => {
                        setAutoLockMinutes(item.val);
                        onSaveSettings({ ...settings, autoLockMinutes: item.val });
                        showToast(`Auto-lock set to ${item.label}`, 'info');
                      }}
                      className={`py-2 px-2.5 rounded-xl border text-xs font-medium transition-all ${
                        autoLockMinutes === item.val
                          ? 'bg-indigo-600 border-indigo-500 text-white shadow-md'
                          : 'glass-button-secondary text-slate-300'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* EXPERIENCE TAB */}
          {activeTab === 'experience' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl glass-card flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white">Prefers Reduced Motion</h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Minimizes large scale UI motion effects and floating card micro-physics
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleExperienceChange('reducedMotion', !reducedMotion)}
                  className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${
                    reducedMotion ? 'bg-indigo-600' : 'bg-white/10'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white transition-transform ${
                      reducedMotion ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
          )}

          {/* DATA & BACKUP TAB */}
          {activeTab === 'data' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl glass-card flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h4 className="text-sm font-bold text-white">Export Full JSON Backup</h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Download complete snapshot of your profile, notebooks, audio notes, photos, and settings
                  </p>
                </div>
                <button
                  onClick={handleExportData}
                  className="px-4 py-2.5 rounded-xl glass-button-primary text-xs font-bold flex items-center gap-2 shrink-0"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Backup</span>
                </button>
              </div>

              <div className="p-4 rounded-2xl glass-card flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h4 className="text-sm font-bold text-white">Restore from Backup File</h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Import an existing JSON backup to restore all data into IndexedDB
                  </p>
                </div>
                <button
                  onClick={() => importFileRef.current?.click()}
                  className="px-4 py-2.5 rounded-xl glass-button-secondary text-xs font-semibold flex items-center gap-2 shrink-0"
                >
                  <Upload className="w-4 h-4 text-emerald-400" />
                  <span>Select JSON File</span>
                </button>
                <input
                  ref={importFileRef}
                  type="file"
                  accept=".json,application/json"
                  className="hidden"
                  onChange={handleImportFile}
                />
              </div>

              <div className="p-4 rounded-2xl border border-rose-500/20 bg-rose-500/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h4 className="text-sm font-bold text-rose-300 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-rose-400" />
                    <span>Reset to Default Demo State</span>
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {isConfirmingReset
                      ? '⚠️ Are you sure? All custom sections and entries will be replaced with demo data.'
                      : 'Clears custom data and re-seeds authentic default profile & entries for Demo User'}
                  </p>
                </div>

                {isConfirmingReset ? (
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => setIsConfirmingReset(false)}
                      disabled={isResetting}
                      className="px-3 py-2 rounded-xl glass-button-secondary text-xs font-semibold text-slate-300 hover:text-white"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleResetData}
                      disabled={isResetting}
                      className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-rose-600/30"
                    >
                      {isResetting ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <span>Confirm Reset</span>
                      )}
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsConfirmingReset(true)}
                    className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shrink-0 transition-colors"
                  >
                    Reset Data
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
