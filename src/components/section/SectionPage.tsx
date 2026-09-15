import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Plus, 
  LayoutGrid, 
  GitCommitVertical, 
  BookOpen, 
  Search, 
  Calendar, 
  Star, 
  Edit2, 
  Trash2, 
  Copy, 
  Image as ImageIcon, 
  Mic, 
  Video as VideoIcon, 
  Sparkles 
} from 'lucide-react';
import { Section, Entry, SectionLayout } from '../../types';
import { DynamicIcon } from '../common/DynamicIcon';
import { EntryEditorModal } from '../editor/EntryEditorModal';
import { EntryDetailModal } from '../editor/EntryDetailModal';
import { useToast } from '../common/ToastContext';

interface SectionPageProps {
  section: Section;
  entries: Entry[];
  onBack: () => void;
  onSaveEntry: (entry: Entry, isNew: boolean) => void;
  onDeleteEntry: (entryId: string) => void;
  onToggleFavorite: (entryId: string) => void;
}

export const SectionPage: React.FC<SectionPageProps> = ({
  section,
  entries,
  onBack,
  onSaveEntry,
  onDeleteEntry,
  onToggleFavorite,
}) => {
  const { showToast } = useToast();

  const [layout, setLayout] = useState<SectionLayout>(section.layout || 'grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  // Modals state
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<Entry | null>(null);
  const [viewingEntry, setViewingEntry] = useState<Entry | null>(null);

  // Extract all unique tags in this section
  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    entries.forEach(e => e.tags.forEach(t => tagSet.add(t)));
    return Array.from(tagSet);
  }, [entries]);

  // Filter entries
  const filteredEntries = useMemo(() => {
    return entries.filter(entry => {
      const matchesSearch =
        entry.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesTag = selectedTag ? entry.tags.includes(selectedTag) : true;

      return matchesSearch && matchesTag;
    });
  }, [entries, searchQuery, selectedTag]);

  // Duplicate entry handler
  const handleDuplicate = (entry: Entry) => {
    const duplicated: Entry = {
      ...entry,
      id: 'entry-' + Date.now(),
      title: `${entry.title} (Copy)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    onSaveEntry(duplicated, true);
    showToast('Entry duplicated', 'success');
  };

  // Group entries chronologically for Timeline view
  const timelineGroups = useMemo(() => {
    const groups: { year: string; months: { month: string; entries: Entry[] }[] }[] = [];
    const sorted = [...filteredEntries].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const map = new Map<string, Map<string, Entry[]>>();

    sorted.forEach(e => {
      const d = new Date(e.date);
      const year = isNaN(d.getFullYear()) ? 'Unknown' : d.getFullYear().toString();
      const month = isNaN(d.getMonth())
        ? 'General'
        : d.toLocaleDateString('en-US', { month: 'long' });

      if (!map.has(year)) map.set(year, new Map());
      const yearMap = map.get(year)!;
      if (!yearMap.has(month)) yearMap.set(month, []);
      yearMap.get(month)!.push(e);
    });

    map.forEach((monthMap, year) => {
      const monthArr: { month: string; entries: Entry[] }[] = [];
      monthMap.forEach((ents, month) => {
        monthArr.push({ month, entries: ents });
      });
      groups.push({ year, months: monthArr });
    });

    return groups;
  }, [filteredEntries]);

  // Empty state messages customized by section name
  const getEmptyStateMessage = () => {
    if (section.id === 'projects') {
      return {
        title: 'No projects documented yet.',
        desc: 'Start logging something you have built, tested, or experimented with.',
      };
    }
    if (section.id === 'memories') {
      return {
        title: 'No memories captured yet.',
        desc: 'Record a timeless milestone or snapshot worth remembering forever.',
      };
    }
    return {
      title: `No entries in ${section.name} yet.`,
      desc: 'Start writing, recording voice notes, or attaching photos in this notebook.',
    };
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="w-full pb-16"
    >
      {/* Back Button & Top Navigation */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <button
          onClick={onBack}
          className="px-3.5 py-2 rounded-xl glass-button-secondary text-xs font-semibold flex items-center gap-2 text-slate-300 hover:text-white"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </button>

        {/* View Switchers */}
        <div className="flex items-center p-1 rounded-xl bg-white/5 border border-white/10 gap-1">
          <button
            onClick={() => setLayout('grid')}
            className={`p-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${
              layout === 'grid'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
            title="Grid View"
          >
            <LayoutGrid className="w-4 h-4" />
            <span className="hidden sm:inline">Grid</span>
          </button>

          <button
            onClick={() => setLayout('timeline')}
            className={`p-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${
              layout === 'timeline'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
            title="Chronological Timeline View"
          >
            <GitCommitVertical className="w-4 h-4" />
            <span className="hidden sm:inline">Timeline</span>
          </button>

          <button
            onClick={() => setLayout('notebook')}
            className={`p-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${
              layout === 'notebook'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
            title="Notebook Diary View"
          >
            <BookOpen className="w-4 h-4" />
            <span className="hidden sm:inline">Notebook</span>
          </button>
        </div>
      </div>

      {/* Section Hero Banner */}
      <div className="rounded-3xl glass-card p-6 sm:p-8 mb-8 relative overflow-hidden">
        <div
          className="absolute -top-20 -right-20 w-64 h-64 rounded-full blur-3xl opacity-30 pointer-events-none"
          style={{ backgroundColor: section.color }}
        />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div
              className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center border shadow-xl shrink-0"
              style={{
                backgroundColor: `${section.color}20`,
                borderColor: `${section.color}40`,
                color: section.color,
              }}
            >
              <DynamicIcon name={section.icon} size={28} className="w-7 h-7" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-4xl font-extrabold font-display text-white tracking-tight">
                  {section.name}
                </h1>
                {section.isCustom && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-white/10 text-slate-300">
                    Custom Dimension
                  </span>
                )}
              </div>
              <p className="text-xs sm:text-sm text-slate-300/80 mt-1 max-w-xl leading-relaxed">
                {section.description}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              setEditingEntry(null);
              setIsEditorOpen(true);
            }}
            className="px-5 py-3 rounded-2xl glass-button-primary flex items-center justify-center gap-2 text-xs sm:text-sm font-bold shadow-xl shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Entry</span>
          </button>
        </div>

        {/* Filter and Search Bar inside Header */}
        <div className="mt-6 pt-5 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search entries in this realm..."
              className="w-full pl-9 pr-4 py-2 rounded-xl glass-input text-xs text-white placeholder-slate-400"
            />
          </div>

          {allTags.length > 0 && (
            <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto py-1">
              <button
                onClick={() => setSelectedTag(null)}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-colors shrink-0 ${
                  selectedTag === null
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white/5 text-slate-400 hover:text-white'
                }`}
              >
                All Tags ({entries.length})
              </button>
              {allTags.map((tag, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-colors shrink-0 ${
                    selectedTag === tag
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white/5 text-slate-400 hover:text-white'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Entries Section */}
      {filteredEntries.length === 0 ? (
        <div className="rounded-3xl glass-card p-12 text-center flex flex-col items-center justify-center">
          <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-500 mb-4">
            <Sparkles className="w-7 h-7 text-indigo-400" />
          </div>
          <h3 className="text-lg font-bold font-display text-white mb-1">
            {getEmptyStateMessage().title}
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 max-w-md mb-6">
            {getEmptyStateMessage().desc}
          </p>
          <button
            onClick={() => {
              setEditingEntry(null);
              setIsEditorOpen(true);
            }}
            className="px-5 py-2.5 rounded-xl glass-button-primary text-xs font-bold flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add First Entry</span>
          </button>
        </div>
      ) : (
        <>
          {/* GRID VIEW */}
          {layout === 'grid' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredEntries.map(entry => {
                const firstImage = entry.media.find(m => m.type === 'image');
                const hasAudio = entry.media.some(m => m.type === 'audio');
                const hasVideo = entry.media.some(m => m.type === 'video');

                return (
                  <div
                    key={entry.id}
                    onClick={() => setViewingEntry(entry)}
                    className="group cursor-pointer rounded-3xl glass-card p-5 flex flex-col justify-between overflow-hidden hover:border-indigo-500/40 transition-all duration-300"
                  >
                    {firstImage && (
                      <div className="w-full h-44 rounded-2xl overflow-hidden mb-3.5 bg-slate-900 relative">
                        <img
                          src={firstImage.url}
                          alt={entry.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute top-2 right-2 flex items-center gap-1.5">
                          {entry.isFavorite && (
                            <div className="p-1 rounded-md bg-black/60 backdrop-blur-xs text-amber-400">
                              <Star className="w-3.5 h-3.5 fill-amber-400" />
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
                          <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                          <span>{entry.date}</span>
                        </div>

                        <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                          <button
                            onClick={() => onToggleFavorite(entry.id)}
                            className="text-slate-400 hover:text-amber-400 transition-colors"
                          >
                            <Star
                              className={`w-3.5 h-3.5 ${
                                entry.isFavorite ? 'text-amber-400 fill-amber-400' : ''
                              }`}
                            />
                          </button>
                        </div>
                      </div>

                      <h3 className="text-base font-bold font-display text-white group-hover:text-indigo-200 transition-colors line-clamp-2">
                        {entry.title}
                      </h3>

                      <p className="text-xs text-slate-400 line-clamp-3 mt-2 leading-relaxed font-sans">
                        {entry.content.replace(/#|\*|_/g, '')}
                      </p>
                    </div>

                    {/* Card Meta & Media indicators */}
                    <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        {entry.media.length > 0 && (
                          <div className="flex items-center gap-1 text-[11px] text-slate-400">
                            {firstImage && <ImageIcon className="w-3.5 h-3.5 text-emerald-400" />}
                            {hasVideo && <VideoIcon className="w-3.5 h-3.5 text-purple-400" />}
                            {hasAudio && <Mic className="w-3.5 h-3.5 text-amber-400" />}
                            <span>{entry.media.length}</span>
                          </div>
                        )}
                        {entry.tags.length > 0 && (
                          <span className="text-[10px] text-indigo-300 bg-indigo-500/10 px-2 py-0.5 rounded font-mono truncate max-w-[130px]">
                            {entry.tags[0]}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5" onClick={e => e.stopPropagation()}>
                        <button
                          onClick={() => {
                            setEditingEntry(entry);
                            setIsEditorOpen(true);
                          }}
                          className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
                          title="Edit"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDuplicate(entry)}
                          className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
                          title="Duplicate"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDeleteEntry(entry.id)}
                          className="p-1 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* CHRONOLOGICAL TIMELINE VIEW */}
          {layout === 'timeline' && (
            <div className="space-y-8 max-w-3xl mx-auto">
              {timelineGroups.map((yearGroup, yIdx) => (
                <div key={yIdx} className="relative">
                  {/* Year Header */}
                  <div className="sticky top-20 z-20 mb-4 inline-block px-4 py-1 rounded-xl glass-panel border border-indigo-500/30 text-indigo-300 font-display font-bold text-sm shadow-md">
                    {yearGroup.year}
                  </div>

                  <div className="relative pl-6 sm:pl-8 border-l-2 border-indigo-500/20 space-y-6">
                    {yearGroup.months.map((monthGroup, mIdx) => (
                      <div key={mIdx} className="space-y-4">
                        <div className="flex items-center gap-2">
                          <div className="absolute -left-[5px] w-2 h-2 rounded-full bg-indigo-400 ring-4 ring-[#07090e]" />
                          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                            {monthGroup.month}
                          </h4>
                        </div>

                        <div className="space-y-3">
                          {monthGroup.entries.map(entry => (
                            <div
                              key={entry.id}
                              onClick={() => setViewingEntry(entry)}
                              className="group cursor-pointer rounded-2xl glass-card p-4 hover:border-indigo-500/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                            >
                              <div className="min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-[11px] font-mono text-slate-400">
                                    {entry.date}
                                  </span>
                                  {entry.isFavorite && (
                                    <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                                  )}
                                </div>
                                <h3 className="text-sm sm:text-base font-bold text-white group-hover:text-indigo-200 transition-colors truncate">
                                  {entry.title}
                                </h3>
                              </div>

                              <div className="flex items-center gap-2 shrink-0">
                                {entry.tags.slice(0, 2).map((t, idx) => (
                                  <span
                                    key={idx}
                                    className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-slate-400"
                                  >
                                    {t}
                                  </span>
                                ))}
                                <button
                                  onClick={e => {
                                    e.stopPropagation();
                                    setEditingEntry(entry);
                                    setIsEditorOpen(true);
                                  }}
                                  className="p-1 rounded text-slate-400 hover:text-white"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* NOTEBOOK DIARY VIEW */}
          {layout === 'notebook' && (
            <div className="space-y-6 max-w-3xl mx-auto">
              {filteredEntries.map(entry => (
                <div
                  key={entry.id}
                  className="rounded-3xl glass-card p-6 sm:p-8 hover:border-indigo-500/30 transition-all"
                >
                  <div className="flex items-center justify-between gap-2 pb-3 border-b border-white/5 mb-4">
                    <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
                      <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                      <span>{entry.date}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onToggleFavorite(entry.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-amber-400"
                      >
                        <Star
                          className={`w-4 h-4 ${
                            entry.isFavorite ? 'text-amber-400 fill-amber-400' : ''
                          }`}
                        />
                      </button>
                      <button
                        onClick={() => {
                          setEditingEntry(entry);
                          setIsEditorOpen(true);
                        }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-white"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDeleteEntry(entry.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <h2
                    onClick={() => setViewingEntry(entry)}
                    className="text-xl sm:text-2xl font-bold font-display text-white hover:text-indigo-300 cursor-pointer transition-colors mb-3"
                  >
                    {entry.title}
                  </h2>

                  <div className="text-slate-300 text-sm leading-relaxed whitespace-pre-line mb-4 font-sans">
                    {entry.content}
                  </div>

                  {entry.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-3 border-t border-white/5">
                      {entry.tags.map((t, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded text-xs font-mono bg-white/5 text-indigo-300"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Editor Modal */}
      <EntryEditorModal
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        section={section}
        existingEntry={editingEntry}
        onSaveEntry={onSaveEntry}
      />

      {/* Detail Viewer Modal */}
      <EntryDetailModal
        isOpen={!!viewingEntry}
        onClose={() => setViewingEntry(null)}
        entry={viewingEntry}
        section={section}
        onEdit={ent => {
          setViewingEntry(null);
          setEditingEntry(ent);
          setIsEditorOpen(true);
        }}
        onDuplicate={handleDuplicate}
        onDelete={ent => {
          setViewingEntry(null);
          onDeleteEntry(ent.id);
        }}
        onToggleFavorite={ent => onToggleFavorite(ent.id)}
      />
    </motion.div>
  );
};
