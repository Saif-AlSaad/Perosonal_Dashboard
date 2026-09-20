import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Check, FolderPlus, Edit, LayoutGrid, GitCommitVertical, BookOpen, Trash2 } from 'lucide-react';
import { Section, SectionLayout } from '../../types';
import { DynamicIcon } from '../common/DynamicIcon';
import { AVAILABLE_ICONS } from '../../constants/icons';
import { useToast } from '../common/ToastContext';

interface SectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  sectionToEdit?: Section | null;
  onSave: (sectionData: Section) => void;
  onDelete?: (section: Section) => void;
  existingCount: number;
}

const presetColors = [
  '#6366f1', // Indigo
  '#06b6d4', // Cyan
  '#a855f7', // Purple
  '#ec4899', // Pink
  '#10b981', // Emerald
  '#f59e0b', // Amber
  '#f43f5e', // Rose
  '#3b82f6', // Blue
];

const SectionModalContent: React.FC<SectionModalProps> = ({
  onClose,
  sectionToEdit,
  onSave,
  onDelete,
  existingCount,
}) => {
  const { showToast } = useToast();

  const [name, setName] = useState(sectionToEdit?.name || '');
  const [icon, setIcon] = useState(sectionToEdit?.icon || 'BookOpen');
  const [description, setDescription] = useState(sectionToEdit?.description || '');
  const [color, setColor] = useState(sectionToEdit?.color || '#6366f1');
  const [layout, setLayout] = useState<SectionLayout>(sectionToEdit?.layout || 'grid');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast('Please enter a section name', 'error');
      return;
    }

    const sectionData: Section = {
      id: sectionToEdit ? sectionToEdit.id : 'sec-' + Date.now(),
      name: name.trim(),
      icon,
      description: description.trim() || `Personal notebook and memory vault for ${name.trim()}`,
      color,
      layout,
      orderIndex: sectionToEdit ? sectionToEdit.orderIndex : existingCount,
      isCustom: sectionToEdit ? sectionToEdit.isCustom : true,
      createdAt: sectionToEdit ? sectionToEdit.createdAt : new Date().toISOString(),
    };

    onSave(sectionData);
    onClose();
    showToast(sectionToEdit ? 'Section updated' : 'New dimension added to your world', 'success');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 dark:bg-black/80 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="w-full max-w-md rounded-3xl glass-panel border border-slate-200 dark:border-white/10 shadow-2xl p-6 sm:p-8 relative my-auto"
      >
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-white/10 mb-5">
          <div className="flex items-center gap-2.5">
            <div
              className="p-2 rounded-xl flex items-center justify-center border"
              style={{ backgroundColor: `${color}20`, borderColor: `${color}40`, color }}
            >
              {sectionToEdit ? <Edit className="w-4 h-4" /> : <FolderPlus className="w-4 h-4" />}
            </div>
            <div>
              <h2 className="text-lg font-bold font-display text-slate-900 dark:text-white">
                {sectionToEdit ? 'Edit Section Realm' : 'Add New Realm'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Create a new notebook dimension</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Section Name */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
              Realm Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Books, Fitness, Bucket List, Certifications..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:glass-input border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-indigo-500"
              autoFocus
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
              Short Description
            </label>
            <input
              type="text"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="What this section represents..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:glass-input border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Icon Picker */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
              Select Realm Icon
            </label>
            <div className="grid grid-cols-7 gap-2 p-2 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 max-h-32 overflow-y-auto">
              {AVAILABLE_ICONS.map(iconName => (
                <button
                  key={iconName}
                  type="button"
                  onClick={() => setIcon(iconName)}
                  className={`p-2 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
                    icon === iconName
                      ? 'bg-indigo-600 text-white shadow-md ring-2 ring-indigo-400'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-white/10'
                  }`}
                  title={iconName}
                >
                  <DynamicIcon name={iconName} size={16} />
                </button>
              ))}
            </div>
          </div>

          {/* Color Selection */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Accent Color
            </label>
            <div className="flex items-center gap-2">
              {presetColors.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-7 h-7 rounded-full transition-transform ${
                    color === c ? 'scale-125 ring-2 ring-white shadow-lg' : 'hover:scale-110'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
              <input
                type="color"
                value={color}
                onChange={e => setColor(e.target.value)}
                className="w-7 h-7 rounded-full bg-transparent cursor-pointer border-0"
                title="Custom color"
              />
            </div>
          </div>

          {/* Preferred Layout */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
              Default Layout Mode
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setLayout('grid')}
                className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                  layout === 'grid'
                    ? 'bg-indigo-600 border-indigo-600 text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 dark:glass-button-secondary border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Grid</span>
              </button>

              <button
                type="button"
                onClick={() => setLayout('timeline')}
                className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                  layout === 'timeline'
                    ? 'bg-indigo-600 border-indigo-600 text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 dark:glass-button-secondary border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300'
                }`}
              >
                <GitCommitVertical className="w-3.5 h-3.5" />
                <span>Timeline</span>
              </button>

              <button
                type="button"
                onClick={() => setLayout('notebook')}
                className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                  layout === 'notebook'
                    ? 'bg-indigo-600 border-indigo-600 text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 dark:glass-button-secondary border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Notebook</span>
              </button>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-between gap-2.5 pt-4 border-t border-slate-200 dark:border-white/10">
            {sectionToEdit && onDelete ? (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onDelete(sectionToEdit);
                }}
                className="px-3.5 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-500 dark:text-rose-400 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete Realm</span>
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:glass-button-secondary border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 text-xs font-semibold cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-md cursor-pointer transition-colors"
              >
                <Check className="w-4 h-4" />
                <span>{sectionToEdit ? 'Save Changes' : 'Create Section'}</span>
              </button>
            </div>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export const SectionModal: React.FC<SectionModalProps> = (props) => {
  if (!props.isOpen) return null;
  return <SectionModalContent key={props.sectionToEdit?.id || 'new'} {...props} />;
};
