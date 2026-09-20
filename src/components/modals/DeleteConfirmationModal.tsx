import React from 'react';
import { motion } from 'framer-motion';
import { Trash2, AlertTriangle, X } from 'lucide-react';
import { DynamicIcon } from '../common/DynamicIcon';

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  itemName?: string;
  itemIcon?: string;
  itemColor?: string;
  warningNote?: string;
  confirmText?: string;
  isProcessing?: boolean;
}

export const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  itemName,
  itemIcon,
  itemColor = '#ef4444',
  warningNote,
  confirmText = 'Delete Permanently',
  isProcessing = false,
}) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/80 backdrop-blur-md overflow-y-auto"
      onClick={e => {
        if (e.target === e.currentTarget && !isProcessing) {
          onClose();
        }
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 15 }}
        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
        onClick={e => e.stopPropagation()}
        className="w-full max-w-md rounded-3xl glass-panel border border-rose-500/20 dark:border-rose-500/30 shadow-2xl p-6 sm:p-7 relative my-auto overflow-hidden"
      >
          {/* Ambient red warning glow in top corner */}
          <div
            className="absolute -top-16 -right-16 w-36 h-36 rounded-full blur-3xl pointer-events-none opacity-25"
            style={{ backgroundColor: '#ef4444' }}
          />

          {/* Header */}
          <div className="flex items-start justify-between gap-3 mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-500 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-rose-500" />
              </div>
              <div>
                <h3 className="text-lg font-bold font-display text-slate-900 dark:text-white leading-tight">
                  {title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Confirm destructive action
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              disabled={isProcessing}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 cursor-pointer transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Target Item Preview if provided */}
          {itemName && (
            <div className="my-4 p-3.5 rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center gap-3">
              {itemIcon && (
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center border shadow-sm shrink-0"
                  style={{
                    backgroundColor: `${itemColor}20`,
                    borderColor: `${itemColor}40`,
                    color: itemColor,
                  }}
                >
                  <DynamicIcon name={itemIcon} className="w-5 h-5" />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                  {itemName}
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Dimension Realm & Notebook
                </p>
              </div>
            </div>
          )}

          {/* Description & Warning note */}
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
            {description}
          </p>

          {warningNote && (
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs flex items-start gap-2 mb-5 leading-normal">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{warningNote}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isProcessing}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={onConfirm}
              disabled={isProcessing}
              className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 active:bg-rose-700 shadow-lg shadow-rose-600/30 flex items-center gap-2 cursor-pointer transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Trash2 className="w-4 h-4" />
              <span>{isProcessing ? 'Deleting...' : confirmText}</span>
            </button>
          </div>
        </motion.div>
      </div>
  );
};
