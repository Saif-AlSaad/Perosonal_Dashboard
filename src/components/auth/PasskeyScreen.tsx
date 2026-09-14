import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { KeyRound, Eye, EyeOff, Lock, Sparkles, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';
import { hashPasskey, setAuthenticated } from '../../services/auth';
import { UserProfile, UserSettings } from '../../types';
import { ThreeScene } from '../canvas/ThreeScene';

interface PasskeyScreenProps {
  profile: UserProfile;
  settings: UserSettings;
  onUnlock: () => void;
}

export const PasskeyScreen: React.FC<PasskeyScreenProps> = ({ profile, settings, onUnlock }) => {
  const [passkey, setPasskey] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(false);

  const handleUnlock = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!passkey) {
      setError('Please enter your passkey');
      setShake(true);
      setTimeout(() => setShake(false), 500);
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
        setShake(true);
        setTimeout(() => setShake(false), 500);
      }
    } catch {
      setError('Authentication error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-4 overflow-hidden bg-[#07090e]">
      {/* 3D Cosmos Background */}
      <ThreeScene enabled={settings.enable3D} />

      {/* Ambient background glow orbs */}
      <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-1/4 right-1/3 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none translate-x-1/2 translate-y-1/2" />

      {/* Main Glassmorphic Unlock Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ 
          opacity: 1, 
          scale: 1, 
          y: 0,
          x: shake ? [-10, 10, -8, 8, -4, 4, 0] : 0 
        }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-md p-8 rounded-3xl glass-panel border border-white/10 shadow-2xl backdrop-blur-2xl flex flex-col items-center text-center"
      >
        {/* Profile Avatar with Glowing Halo */}
        <div className="relative mb-6 group">
          <div className="absolute -inset-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500 rounded-full blur-md opacity-70 group-hover:opacity-100 transition duration-500 animate-pulse" />
          <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-white/20 shadow-inner bg-slate-900 flex items-center justify-center">
            {profile.avatarUrl ? (
              <img
                src={profile.avatarUrl}
                alt={profile.name}
                className="w-full h-full object-cover"
                loading="eager"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-600 to-cyan-600 text-white text-2xl font-bold">
                {profile.name.slice(0, 2).toUpperCase()}
              </div>
            )}
          </div>
          <div className="absolute bottom-0 right-0 p-1.5 bg-indigo-600 rounded-full border-2 border-slate-900 shadow-md">
            <Lock className="w-3.5 h-3.5 text-white" />
          </div>
        </div>

        {/* Welcome Text */}
        <h1 className="text-2xl sm:text-3xl font-bold font-display tracking-tight text-white mb-1.5">
          Welcome back, {profile.name.split(' ')[0]}
        </h1>
        <p className="text-sm text-slate-300/80 mb-6 flex items-center justify-center gap-1.5 font-sans">
          <Sparkles className="w-4 h-4 text-cyan-400 inline" />
          Your personal world is waiting.
        </p>

        {/* Passkey Input Form */}
        <form onSubmit={handleUnlock} className="w-full space-y-4">
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
              className="w-full pl-10 pr-11 py-3.5 rounded-xl glass-input text-slate-100 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
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

          {error && (
            <motion.p
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xs text-rose-400 font-medium text-left px-1"
            >
              {error}
            </motion.p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 rounded-xl glass-button-primary flex items-center justify-center gap-2 text-sm font-semibold tracking-wide disabled:opacity-50"
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

        {/* Card Footer */}
        <div className="mt-6 pt-4 border-t border-white/5 w-full flex items-center justify-center text-xs text-slate-500">
          <span>Private Life OS • Client Encrypted</span>
        </div>
      </motion.div>
    </div>
  );
};
