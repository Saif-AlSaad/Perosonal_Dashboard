import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FilePlus, 
  FolderPlus, 
  Camera, 
  Mic, 
  Search, 
  Lock, 
  X, 
  Zap 
} from 'lucide-react';

interface QuickActionsProps {
  onNewEntry: () => void;
  onNewSection: () => void;
  onUploadPhoto: () => void;
  onRecordVoice: () => void;
  onSearch: () => void;
  onLock: () => void;
}

export const QuickActions: React.FC<QuickActionsProps> = ({
  onNewEntry,
  onNewSection,
  onUploadPhoto,
  onRecordVoice,
  onSearch,
  onLock,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const actions = [
    { label: 'New Entry', icon: FilePlus, color: 'bg-indigo-600 hover:bg-indigo-500', action: onNewEntry },
    { label: 'New Section', icon: FolderPlus, color: 'bg-purple-600 hover:bg-purple-500', action: onNewSection },
    { label: 'Upload Photo', icon: Camera, color: 'bg-emerald-600 hover:bg-emerald-500', action: onUploadPhoto },
    { label: 'Record Voice', icon: Mic, color: 'bg-amber-600 hover:bg-amber-500', action: onRecordVoice },
    { label: 'Search', icon: Search, color: 'bg-sky-600 hover:bg-sky-500', action: onSearch },
    { label: 'Lock Dashboard', icon: Lock, color: 'bg-rose-600 hover:bg-rose-500', action: onLock },
  ];

  return (
    <div className="fixed bottom-6 left-6 z-40">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="mb-3 p-2 rounded-2xl bg-white dark:glass-panel border border-slate-200 dark:border-white/10 shadow-2xl flex flex-col gap-1.5 backdrop-blur-xl min-w-[170px]"
          >
            {actions.map((act, index) => {
              const Icon = act.icon;
              return (
                <button
                  key={index}
                  onClick={() => {
                    setIsOpen(false);
                    act.action();
                  }}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-white/10 text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white transition-all text-xs font-semibold text-left group cursor-pointer"
                >
                  <div className={`p-1.5 rounded-lg text-white ${act.color} transition-transform group-hover:scale-110 shadow-md`}>
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <span>{act.label}</span>
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="p-3.5 rounded-2xl glass-button-primary shadow-2xl border border-white/20 flex items-center justify-center text-white"
        aria-label="Quick action menu"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
            >
              <X className="w-5 h-5" />
            </motion.div>
          ) : (
            <motion.div
              key="open"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              className="flex items-center gap-1.5"
            >
              <Zap className="w-5 h-5 text-amber-300" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
};
