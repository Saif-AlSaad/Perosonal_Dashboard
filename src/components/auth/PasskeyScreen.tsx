import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  KeyRound, 
  Eye, 
  EyeOff, 
  Lock, 
  Sparkles, 
  ArrowRight, 
  User, 
  UserPlus, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { hashPasskey, setAuthenticated } from '../../services/auth';
import { saveProfile, saveSettings } from '../../services/db';
import { UserProfile, UserSettings } from '../../types';
import { BackgroundLayer } from '../background/BackgroundLayer';

interface PasskeyScreenProps {
  profile: UserProfile;
  settings: UserSettings;
  onUnlock: () => void;
  onRegisterSuccess?: (updatedProfile: UserProfile, updatedSettings: UserSettings) => void;
}

type AuthMode = 'unlock' | 'register';

export const PasskeyScreen: React.FC<PasskeyScreenProps> = ({ 
  profile, 
  settings, 
  onUnlock,
  onRegisterSuccess 
}) => {
  const [mode, setMode] = useState<AuthMode>('unlock');

  // Unlock State
  const [passkey, setPasskey] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Register State
  const [regUsername, setRegUsername] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showRegConfirmPassword, setShowRegConfirmPassword] = useState(false);

  // Status & Feedback State
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(false);

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  // Password Strength Calculation for Registration
  const passwordStrength = useMemo(() => {
    if (!regPassword) return { score: 0, label: '', color: 'bg-slate-700', textCol: 'text-slate-500' };
    let score = 0;
    if (regPassword.length >= 4) score += 1;
    if (regPassword.length >= 8) score += 1;
    if (/[0-9!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(regPassword)) score += 1;
    if (/[A-Z]/.test(regPassword) && /[a-z]/.test(regPassword)) score += 1;

    if (score <= 1) return { score: 1, label: 'Weak', color: 'bg-rose-500', textCol: 'text-rose-400' };
    if (score === 2) return { score: 2, label: 'Fair', color: 'bg-amber-500', textCol: 'text-amber-400' };
    if (score === 3) return { score: 3, label: 'Good', color: 'bg-cyan-500', textCol: 'text-cyan-400' };
    return { score: 4, label: 'Strong', color: 'bg-emerald-500', textCol: 'text-emerald-400' };
  }, [regPassword]);

  // Real-time confirmation matching status
  const isConfirmMatching = useMemo(() => {
    if (!regConfirmPassword) return null;
    return regPassword === regConfirmPassword;
  }, [regPassword, regConfirmPassword]);

  // Handle Unlock Existing Account
  const handleUnlock = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!passkey) {
      setError('Please enter your passkey');
      triggerShake();
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const inputHash = await hashPasskey(passkey);
      if (inputHash === settings.passkeyHash) {
        // Successful authentication
        setAuthenticated(true);
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#6366f1', '#06b6d4', '#a855f7'],
        });
        onUnlock();
      } else {
        setError('Incorrect passkey. Please try again.');
        triggerShake();
      }
    } catch {
      setError('Authentication error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Registration
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedUsername = regUsername.trim();
    if (!trimmedUsername) {
      setError('Please enter a username');
      triggerShake();
      return;
    }
    if (trimmedUsername.length < 2) {
      setError('Username must be at least 2 characters');
      triggerShake();
      return;
    }
    if (!regPassword) {
      setError('Please create a password');
      triggerShake();
      return;
    }
    if (regPassword.length < 4) {
      setError('Password must be at least 4 characters');
      triggerShake();
      return;
    }
    if (regPassword !== regConfirmPassword) {
      setError('Passwords do not match');
      triggerShake();
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const newHash = await hashPasskey(regPassword);
      
      const updatedProfile: UserProfile = {
        ...profile,
        name: trimmedUsername,
      };

      const updatedSettings: UserSettings = {
        ...settings,
        passkeyHash: newHash,
      };

      // Persist to IndexedDB
      await Promise.all([
        saveProfile(updatedProfile),
        saveSettings(updatedSettings),
      ]);

      setAuthenticated(true);

      confetti({
        particleCount: 70,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#6366f1', '#06b6d4', '#a855f7', '#10b981'],
      });

      if (onRegisterSuccess) {
        onRegisterSuccess(updatedProfile, updatedSettings);
      } else {
        onUnlock();
      }
    } catch {
      setError('Registration failed. Please try again.');
      triggerShake();
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (newMode: AuthMode) => {
    setMode(newMode);
    setError(null);
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-4 overflow-hidden bg-[#07090e]">
      {/* Dynamic Background */}
      <BackgroundLayer config={settings.background} />

      {/* Ambient background glow orbs */}
      <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-1/4 right-1/3 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none translate-x-1/2 translate-y-1/2" />

      {/* Main Glassmorphic Card */}
      <motion.div
        layout
        initial={{ opacity: 0, scale: 0.94, y: 20 }}
        animate={{ 
          opacity: 1, 
          scale: 1, 
          y: 0,
          x: shake ? [-10, 10, -8, 8, -4, 4, 0] : 0 
        }}
        transition={{ 
          layout: { duration: 0.35, ease: [0.16, 1, 0.3, 1] },
          duration: 0.5, 
          ease: [0.16, 1, 0.3, 1] 
        }}
        className="relative z-10 w-full max-w-md p-6 sm:p-8 rounded-3xl glass-panel border border-white/10 shadow-2xl backdrop-blur-2xl flex flex-col items-center text-center"
      >
        {/* Top Segmented Navigation Tabs */}
        <div className="flex items-center p-1 rounded-2xl bg-black/40 border border-white/10 mb-6 w-full max-w-[260px]">
          <button
            type="button"
            onClick={() => handleTabChange('unlock')}
            className={`relative flex-1 py-2 text-xs font-medium rounded-xl transition-colors duration-200 flex items-center justify-center gap-1.5 ${
              mode === 'unlock' ? 'text-white font-semibold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {mode === 'unlock' && (
              <motion.div
                layoutId="auth-active-pill"
                className="absolute inset-0 rounded-xl bg-gradient-to-r from-indigo-500/90 to-purple-500/90 border border-white/20 shadow-lg"
                transition={{ type: 'spring', stiffness: 450, damping: 35 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5" />
              Sign In
            </span>
          </button>

          <button
            type="button"
            onClick={() => handleTabChange('register')}
            className={`relative flex-1 py-2 text-xs font-medium rounded-xl transition-colors duration-200 flex items-center justify-center gap-1.5 ${
              mode === 'register' ? 'text-white font-semibold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {mode === 'register' && (
              <motion.div
                layoutId="auth-active-pill"
                className="absolute inset-0 rounded-xl bg-gradient-to-r from-indigo-500/90 to-cyan-500/90 border border-white/20 shadow-lg"
                transition={{ type: 'spring', stiffness: 450, damping: 35 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-1.5">
              <UserPlus className="w-3.5 h-3.5" />
              Register
            </span>
          </button>
        </div>

        {/* Dynamic Mode Views */}
        <AnimatePresence mode="wait">
          {mode === 'unlock' ? (
            /* UNLOCK / SIGN IN VIEW */
            <motion.div
              key="unlock-section"
              initial={{ opacity: 0, y: 12, filter: 'blur(4px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -12, filter: 'blur(4px)' }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="w-full flex flex-col items-center"
            >
              {/* Profile Avatar with Glowing Halo */}
              <div className="relative mb-5 group">
                <div className="absolute -inset-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500 rounded-full blur-md opacity-70 group-hover:opacity-100 transition duration-500 animate-pulse" />
                <div className="relative w-20 h-20 sm:w-22 sm:h-22 rounded-full overflow-hidden border-2 border-white/20 shadow-inner bg-slate-900 flex items-center justify-center">
                  {profile.avatarUrl ? (
                    <img
                      src={profile.avatarUrl}
                      alt={profile.name}
                      className="w-full h-full object-cover"
                      loading="eager"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-600 to-cyan-600 text-white text-xl font-bold">
                      {profile.name ? profile.name.slice(0, 2).toUpperCase() : 'ME'}
                    </div>
                  )}
                </div>
                <div className="absolute bottom-0 right-0 p-1.5 bg-indigo-600 rounded-full border-2 border-slate-900 shadow-md">
                  <Lock className="w-3.5 h-3.5 text-white" />
                </div>
              </div>

              {/* Welcome Text */}
              <h1 className="text-2xl sm:text-3xl font-bold font-display tracking-tight text-white mb-1">
                Welcome back, {profile.name ? profile.name.split(' ')[0] : 'Explorer'}
              </h1>
              <p className="text-xs sm:text-sm text-slate-300/80 mb-6 flex items-center justify-center gap-1.5 font-sans">
                <Sparkles className="w-4 h-4 text-cyan-400 inline shrink-0" />
                Your personal world is waiting.
              </p>

              {/* Passkey Input Form */}
              <form onSubmit={handleUnlock} className="w-full space-y-4">
                <div className="space-y-1.5 text-left">
                  <label className="text-xs font-medium text-slate-300 ml-1">Passkey</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <KeyRound className="w-4 h-4" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={passkey}
                      onChange={e => {
                        setPasskey(e.target.value);
                        if (error) setError(null);
                      }}
                      placeholder="Enter your passkey"
                      className="w-full pl-10 pr-11 py-3 rounded-xl glass-input text-slate-100 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-200 transition-colors"
                      aria-label={showPassword ? 'Hide passkey' : 'Show passkey'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-400 font-medium text-left"
                  >
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                    <span>{error}</span>
                  </motion.div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-4 rounded-xl glass-button-primary flex items-center justify-center gap-2 text-sm font-semibold tracking-wide disabled:opacity-50 transition-all duration-200 shadow-lg hover:shadow-indigo-500/25 active:scale-[0.99]"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Unlock Dashboard</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Switch to Register footer action */}
              <div className="mt-5 text-xs text-slate-400 flex items-center justify-center gap-1.5">
                <span>New to MyWorld?</span>
                <button
                  type="button"
                  onClick={() => handleTabChange('register')}
                  className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors hover:underline focus:outline-none"
                >
                  Create an account
                </button>
              </div>
            </motion.div>
          ) : (
            /* REGISTRATION VIEW */
            <motion.div
              key="register-section"
              initial={{ opacity: 0, y: 12, filter: 'blur(4px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -12, filter: 'blur(4px)' }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="w-full flex flex-col items-center"
            >
              {/* Header Badge */}
              <div className="relative mb-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500/20 via-purple-500/20 to-cyan-500/20 border border-white/15 flex items-center justify-center shadow-inner">
                  <UserPlus className="w-6 h-6 text-cyan-400" />
                </div>
                <div className="absolute -bottom-1 -right-1 p-1 bg-indigo-600 rounded-full border border-slate-900 shadow">
                  <Sparkles className="w-3 h-3 text-white" />
                </div>
              </div>

              {/* Title & Subtitle */}
              <h1 className="text-2xl sm:text-3xl font-bold font-display tracking-tight text-white mb-1">
                Create Account
              </h1>
              <p className="text-xs sm:text-sm text-slate-300/80 mb-5 font-sans">
                Set up your profile and security credentials
              </p>

              {/* Registration Form */}
              <form onSubmit={handleRegister} className="w-full space-y-3.5 text-left">
                {/* Username Field */}
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-300 ml-1 flex items-center justify-between">
                    <span>Username</span>
                    <span className="text-[10px] text-slate-500 font-mono">Visible on dashboard</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <User className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      value={regUsername}
                      onChange={e => {
                        setRegUsername(e.target.value);
                        if (error) setError(null);
                      }}
                      placeholder="e.g. Alex Hunter"
                      maxLength={40}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-slate-100 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                      autoFocus
                    />
                  </div>
                </div>

                {/* Create Password Field */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between ml-1">
                    <label className="text-xs font-medium text-slate-300">Create Password</label>
                    {regPassword && (
                      <span className={`text-[10px] font-semibold tracking-wide ${passwordStrength.textCol}`}>
                        {passwordStrength.label}
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <KeyRound className="w-4 h-4" />
                    </div>
                    <input
                      type={showRegPassword ? 'text' : 'password'}
                      value={regPassword}
                      onChange={e => {
                        setRegPassword(e.target.value);
                        if (error) setError(null);
                      }}
                      placeholder="Create a passkey (min 4 chars)"
                      className="w-full pl-10 pr-11 py-2.5 rounded-xl glass-input text-slate-100 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegPassword(!showRegPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-200 transition-colors"
                      aria-label={showRegPassword ? 'Hide password' : 'Show password'}
                    >
                      {showRegPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Password Strength Indicator Bars */}
                  {regPassword.length > 0 && (
                    <div className="pt-1 px-1 flex items-center gap-1.5">
                      {[1, 2, 3, 4].map(idx => (
                        <div
                          key={idx}
                          className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                            idx <= passwordStrength.score ? passwordStrength.color : 'bg-slate-700/60'
                          }`}
                        />
                      ))}
                    </div>
                  )}
                </div>

                {/* Confirm Password Field */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between ml-1">
                    <label className="text-xs font-medium text-slate-300">Confirm Password</label>
                    {isConfirmMatching !== null && (
                      <span className={`text-[10px] flex items-center gap-1 font-medium ${
                        isConfirmMatching ? 'text-emerald-400' : 'text-rose-400'
                      }`}>
                        {isConfirmMatching ? (
                          <>
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Match</span>
                          </>
                        ) : (
                          <>
                            <AlertCircle className="w-3 h-3" />
                            <span>Mismatch</span>
                          </>
                        )}
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <input
                      type={showRegConfirmPassword ? 'text' : 'password'}
                      value={regConfirmPassword}
                      onChange={e => {
                        setRegConfirmPassword(e.target.value);
                        if (error) setError(null);
                      }}
                      placeholder="Confirm your passkey"
                      className="w-full pl-10 pr-11 py-2.5 rounded-xl glass-input text-slate-100 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegConfirmPassword(!showRegConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-200 transition-colors"
                      aria-label={showRegConfirmPassword ? 'Hide password' : 'Show password'}
                    >
                      {showRegConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Inline Error Message */}
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-400 font-medium text-left"
                  >
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                    <span>{error}</span>
                  </motion.div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-2 py-3 px-4 rounded-xl glass-button-primary flex items-center justify-center gap-2 text-sm font-semibold tracking-wide disabled:opacity-50 transition-all duration-200 shadow-lg hover:shadow-cyan-500/25 active:scale-[0.99]"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Complete Registration</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Switch to Unlock footer action */}
              <div className="mt-5 text-xs text-slate-400 flex items-center justify-center gap-1.5">
                <span>Already have an account?</span>
                <button
                  type="button"
                  onClick={() => handleTabChange('unlock')}
                  className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors hover:underline focus:outline-none"
                >
                  Sign in
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Card Footer Note */}
        <div className="mt-6 pt-4 border-t border-white/5 w-full flex items-center justify-center text-xs text-slate-500">
          <span>Private MyWorld • Client Encrypted</span>
        </div>
      </motion.div>
    </div>
  );
};

