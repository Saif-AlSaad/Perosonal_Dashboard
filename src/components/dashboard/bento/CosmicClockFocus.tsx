import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  Zap, 
  Flame, 
  Compass, 
  Moon, 
  Play, 
  Pause, 
  RotateCcw,
  CheckCircle2,
  ChevronDown
} from 'lucide-react';

export type FocusStateId = 'deep-work' | 'creative-flow' | 'in-zone' | 'zen-peace' | 'cosmic-drift';

interface FocusModeConfig {
  id: FocusStateId;
  label: string;
  icon: React.ElementType;
  color: string;
  glowColor: string;
  description: string;
}

const FOCUS_MODES: FocusModeConfig[] = [
  {
    id: 'deep-work',
    label: 'Deep Work',
    icon: Zap,
    color: '#6366f1',
    glowColor: 'rgba(99, 102, 241, 0.35)',
    description: 'High cognitive intensity & code focus',
  },
  {
    id: 'creative-flow',
    label: 'Creative Flow',
    icon: Sparkles,
    color: '#06b6d4',
    glowColor: 'rgba(6, 182, 212, 0.35)',
    description: 'Expansive ideation & architecture',
  },
  {
    id: 'in-zone',
    label: 'In The Zone',
    icon: Flame,
    color: '#ec4899',
    glowColor: 'rgba(236, 72, 153, 0.35)',
    description: 'Unstoppable velocity & momentum',
  },
  {
    id: 'zen-peace',
    label: 'Zen Peace',
    icon: Compass,
    color: '#10b981',
    glowColor: 'rgba(16, 185, 129, 0.35)',
    description: 'Mindful review & calm clarity',
  },
  {
    id: 'cosmic-drift',
    label: 'Cosmic Drift',
    icon: Moon,
    color: '#f59e0b',
    glowColor: 'rgba(245, 158, 11, 0.35)',
    description: 'Casual vault browsing & memory reading',
  },
];

export const CosmicClockFocus: React.FC = () => {
  const [time, setTime] = useState(new Date());
  const [selectedFocus, setSelectedFocus] = useState<FocusStateId>(() => {
    return (localStorage.getItem('life_os_focus_mode') as FocusStateId) || 'deep-work';
  });
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Focus Timer state (e.g. 25m sprint)
  const [timerActive, setTimerActive] = useState(false);
  const [timerSecondsLeft, setTimerSecondsLeft] = useState(25 * 60);
  const [showTimer, setShowTimer] = useState(false);

  // Update clock every second
  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Timer countdown
  useEffect(() => {
    if (!timerActive) return;
    const interval = setInterval(() => {
      setTimerSecondsLeft((prev) => {
        if (prev <= 1) {
          setTimerActive(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [timerActive]);

  const activeConfig = FOCUS_MODES.find(m => m.id === selectedFocus) || FOCUS_MODES[0];
  const FocusIcon = activeConfig.icon;

  const handleSelectFocus = (modeId: FocusStateId) => {
    setSelectedFocus(modeId);
    localStorage.setItem('life_os_focus_mode', modeId);
    setIsDropdownOpen(false);

    // Subtle update to document root custom variable
    document.documentElement.style.setProperty('--focus-accent', activeConfig.color);
  };

  // Time formatted parts
  const hours = time.toLocaleTimeString([], { hour: '2-digit', hour12: true }).split(' ')[0];
  const ampm = time.toLocaleTimeString([], { hour: '2-digit', hour12: true }).split(' ')[1] || '';
  const minutes = time.getMinutes().toString().padStart(2, '0');
  const seconds = time.getSeconds().toString().padStart(2, '0');

  // Cosmic Stardate Calculation: Year + (Day of year / total days in year)
  const startOfYear = new Date(time.getFullYear(), 0, 1);
  const dayOfYear = Math.floor((time.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  const stardate = `${time.getFullYear()}.${dayOfYear.toString().padStart(3, '0')}`;

  const formattedDate = time.toLocaleDateString([], {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  const timerMin = Math.floor(timerSecondsLeft / 60);
  const timerSec = (timerSecondsLeft % 60).toString().padStart(2, '0');

  return (
    <div className="relative rounded-3xl glass-card p-6 overflow-hidden flex flex-col justify-between group border border-slate-200 dark:border-white/10 shadow-2xl min-h-[260px]">
      {/* Dynamic ambient orb glow based on active focus mode */}
      <div
        className="absolute -top-12 -right-12 w-44 h-44 rounded-full blur-3xl pointer-events-none transition-all duration-700 opacity-30 group-hover:opacity-60"
        style={{ backgroundColor: activeConfig.color }}
      />
      <div
        className="absolute -bottom-10 -left-10 w-32 h-32 rounded-full blur-2xl pointer-events-none transition-all duration-700 opacity-20"
        style={{ backgroundColor: activeConfig.color }}
      />

      {/* Top Bar: Cosmic Stardate & Focus Mode Selector */}
      <div className="relative z-20 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 relative">
            <span
              className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
              style={{ backgroundColor: activeConfig.color }}
            />
            <span
              className="relative inline-flex rounded-full h-2 w-2"
              style={{ backgroundColor: activeConfig.color }}
            />
          </span>
          <span className="text-[11px] font-mono uppercase tracking-widest text-slate-500 dark:text-slate-400">
            STARDATE <span className="text-slate-900 dark:text-slate-200 font-semibold">{stardate}</span>
          </span>
        </div>

        {/* Focus Mode Selector Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs font-semibold text-slate-800 dark:text-slate-200 hover:text-slate-950 dark:hover:text-white transition-all cursor-pointer shadow-xs"
            style={{
              borderColor: `${activeConfig.color}40`,
            }}
          >
            <FocusIcon className="w-3.5 h-3.5" style={{ color: activeConfig.color }} />
            <span>{activeConfig.label}</span>
            <ChevronDown className="w-3 h-3 text-slate-400 opacity-70" />
          </button>

          <AnimatePresence>
            {isDropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: -6, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-9 z-30 w-52 p-1.5 rounded-2xl bg-white dark:glass-panel border border-slate-200 dark:border-white/10 shadow-2xl backdrop-blur-2xl space-y-1"
              >
                <div className="px-2.5 py-1 text-[10px] font-mono text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Select Focus State
                </div>
                {FOCUS_MODES.map((mode) => {
                  const Icon = mode.icon;
                  const isSelected = mode.id === selectedFocus;
                  return (
                    <button
                      key={mode.id}
                      onClick={() => handleSelectFocus(mode.id)}
                      className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-left transition-all text-xs cursor-pointer ${
                        isSelected
                          ? 'bg-indigo-50 dark:bg-white/10 text-indigo-950 dark:text-white font-semibold'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-950 dark:hover:text-white'
                      }`}
                    >
                      <div
                        className="p-1 rounded-lg"
                        style={{ backgroundColor: `${mode.color}25`, color: mode.color }}
                      >
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="truncate">{mode.label}</div>
                      </div>
                      {isSelected && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Center: Live Digital Clock with Animated Pulse */}
      <div className="relative z-10 my-4 flex items-center justify-between gap-4">
        <div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-4xl sm:text-5xl font-black font-display tracking-tight text-slate-900 dark:text-white dark:drop-shadow-md">
              {hours}:{minutes}
            </span>
            <span className="text-xs sm:text-sm font-mono font-bold text-indigo-600 dark:text-indigo-300">
              :{seconds}
            </span>
            <span className="ml-1 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {ampm}
            </span>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400 font-sans mt-1 flex items-center gap-2">
            <span>{formattedDate}</span>
            <span className="text-slate-400 dark:text-slate-600">•</span>
            <span className="text-slate-500 dark:text-slate-400 truncate">
              {Intl.DateTimeFormat().resolvedOptions().timeZone.replace('_', ' ')}
            </span>
          </p>
        </div>

        {/* Breathing Interactive Focus Orb */}
        <div
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="relative cursor-pointer group/orb shrink-0 flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20"
          title="Click to change Focus State"
        >
          {/* Animated concentric pulsing ripples */}
          <div
            className="absolute inset-0 rounded-full animate-ping opacity-25 pointer-events-none"
            style={{ backgroundColor: activeConfig.color }}
          />
          <div
            className="absolute inset-1.5 rounded-full blur-md opacity-70 transition-all duration-500 group-hover/orb:opacity-100"
            style={{ backgroundColor: activeConfig.color }}
          />
          {/* Core Orb */}
          <div
            className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-full border border-white/40 shadow-xl flex items-center justify-center backdrop-blur-md transition-transform duration-300 group-hover/orb:scale-108"
            style={{
              background: `radial-gradient(circle at 30% 30%, #ffffff 0%, ${activeConfig.color} 60%, #000000 100%)`,
            }}
          >
            <FocusIcon className="w-5 h-5 text-white drop-shadow-md" />
          </div>
        </div>
      </div>

      {/* Bottom: Quick 25m Focus Sprint Toggle */}
      <div className="relative z-10 pt-3 border-t border-white/5 flex items-center justify-between gap-3 text-xs">
        {showTimer ? (
          <div className="w-full flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-white text-sm">
                {timerMin}:{timerSec}
              </span>
              <span className="text-[11px] text-slate-400">Sprint</span>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setTimerActive(!timerActive)}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-white transition-colors cursor-pointer"
                title={timerActive ? 'Pause' : 'Start'}
              >
                {timerActive ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={() => {
                  setTimerActive(false);
                  setTimerSecondsLeft(25 * 60);
                }}
                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
                title="Reset Sprint"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setShowTimer(false)}
                className="text-[10px] text-slate-400 hover:text-slate-200 ml-1 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        ) : (
          <>
            <span className="text-slate-500 dark:text-slate-400 truncate text-[11px]">
              State: <span className="text-slate-900 dark:text-slate-200 font-medium">{activeConfig.description}</span>
            </span>
            <button
              onClick={() => setShowTimer(true)}
              className="shrink-0 px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 dark:bg-white/5 dark:hover:bg-white/10 border border-indigo-200 dark:border-white/10 text-indigo-700 dark:text-indigo-300 hover:text-indigo-900 dark:hover:text-white transition-colors flex items-center gap-1 text-[11px] font-semibold cursor-pointer shadow-xs"
            >
              <Zap className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
              <span>25m Sprint</span>
            </button>
          </>
        )}
      </div>
    </div>
  );
};
