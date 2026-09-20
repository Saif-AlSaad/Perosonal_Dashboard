import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search, X, Calendar, ArrowRight, Sparkles } from 'lucide-react';
import { Section, Entry } from '../../types';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  sections: Section[];
  entries: Entry[];
  onSelectResult: (entry: Entry, section: Section) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  sections,
  entries,
  onSelectResult,
}) => {
  const [query, setQuery] = useState('');

  // Keyboard shortcut listener (Ctrl+K or Cmd+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const sectionMap = useMemo(() => {
    const map = new Map<string, Section>();
    sections.forEach(s => map.set(s.id, s));
    return map;
  }, [sections]);

  // Search results
  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();

    return entries
      .filter(entry => {
        const titleMatch = entry.title.toLowerCase().includes(q);
        const contentMatch = entry.content.toLowerCase().includes(q);
        const tagMatch = entry.tags.some(t => t.toLowerCase().includes(q));
        const dateMatch = entry.date.toLowerCase().includes(q);
        const section = sectionMap.get(entry.sectionId);
        const sectionMatch = section ? section.name.toLowerCase().includes(q) : false;

        return titleMatch || contentMatch || tagMatch || dateMatch || sectionMatch;
      })
      .map(entry => ({
        entry,
        section: sectionMap.get(entry.sectionId)!,
      }))
      .filter(item => Boolean(item.section));
  }, [query, entries, sectionMap]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-slate-900/50 dark:bg-black/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: -20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: -20 }}
        className="w-full max-w-2xl rounded-3xl bg-white dark:glass-panel border border-slate-200 dark:border-white/10 shadow-2xl overflow-hidden flex flex-col max-h-[75vh]"
      >
        {/* Search Bar Input */}
        <div className="p-4 border-b border-slate-200 dark:border-white/10 flex items-center gap-3">
          <Search className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0" />
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search across all dimensions, notes, tags (#project, #qa), dates..."
            className="w-full bg-transparent border-0 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-sm focus:outline-none"
            autoFocus
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="px-2 py-0.5 text-[10px] font-mono bg-slate-100 dark:bg-white/10 rounded border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto p-3 divide-y divide-slate-100 dark:divide-white/5">
          {!query.trim() ? (
            <div className="p-8 text-center text-slate-500">
              <Sparkles className="w-8 h-8 mx-auto mb-2 text-indigo-500/60 dark:text-indigo-400/60" />
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-300">Quick Global Search</p>
              <p className="text-xs text-slate-500 mt-1">
                Type keywords like "BD Connect", "Cypress", "Sylhet", "#qa", or "2026"
              </p>
            </div>
          ) : results.length === 0 ? (
            <div className="p-8 text-center text-slate-500">
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-300">No matching entries found</p>
              <p className="text-xs text-slate-500 mt-1">Try another search term or tag</p>
            </div>
          ) : (
            results.map(({ entry, section }) => (
              <div
                key={entry.id}
                onClick={() => {
                  onSelectResult(entry, section);
                  onClose();
                }}
                className="py-3 px-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-white/5 cursor-pointer flex items-center justify-between gap-3 group transition-colors"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider"
                      style={{
                        backgroundColor: `${section.color}20`,
                        color: section.color,
                      }}
                    >
                      {section.name}
                    </span>
                    <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-400 dark:text-slate-500" />
                      {entry.date}
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-300 transition-colors truncate">
                    {entry.title}
                  </h4>

                  <p className="text-xs text-slate-600 dark:text-slate-400 truncate mt-0.5">
                    {entry.content.replace(/#|\*|_/g, '')}
                  </p>
                </div>

                <div className="shrink-0 flex items-center gap-2">
                  {entry.tags.slice(0, 1).map((t, i) => (
                    <span key={i} className="text-[10px] text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-white/5 px-2 py-0.5 rounded border border-slate-200 dark:border-white/5">
                      {t}
                    </span>
                  ))}
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-slate-800 dark:group-hover:text-white transition-colors" />
                </div>
              </div>
            ))
          )}
        </div>
      </motion.div>
    </div>
  );
};
