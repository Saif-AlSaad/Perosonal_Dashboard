import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { Section, Entry } from '../../types';
import { SectionCard } from './SectionCard';
import { useToast } from '../common/ToastContext';

interface SectionGridProps {
  sections: Section[];
  entries: Entry[];
  onSelectSection: (section: Section) => void;
  onOpenAddModal: () => void;
  onEditSection: (section: Section) => void;
  onDeleteSection: (section: Section) => void;
  onReorderSections: (newOrderIds: string[]) => void;
}

export const SectionGrid: React.FC<SectionGridProps> = ({
  sections,
  entries,
  onSelectSection,
  onOpenAddModal,
  onEditSection,
  onDeleteSection,
  onReorderSections,
}) => {
  const { showToast } = useToast();
  const [draggedId, setDraggedId] = useState<string | null>(null);

  // Compute entries count map
  const entryCountMap = React.useMemo(() => {
    const map: Record<string, number> = {};
    for (const entry of entries) {
      map[entry.sectionId] = (map[entry.sectionId] || 0) + 1;
    }
    return map;
  }, [entries]);

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedId(id);
    e.dataTransfer.setData('text/plain', id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedId || draggedId === targetId) return;

    const sourceIndex = sections.findIndex(s => s.id === draggedId);
    const targetIndex = sections.findIndex(s => s.id === targetId);

    if (sourceIndex === -1 || targetIndex === -1) return;

    const newSections = [...sections];
    const [moved] = newSections.splice(sourceIndex, 1);
    newSections.splice(targetIndex, 0, moved);

    const newIds = newSections.map(s => s.id);
    onReorderSections(newIds);
    setDraggedId(null);
    showToast('Dashboard sections rearranged', 'success');
  };

  return (
    <div className="w-full">
      {/* Section Header with Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-bold font-display text-white tracking-tight">
              Life OS Dimensions
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/15 text-indigo-300 border border-indigo-500/20">
              {sections.length} Realms
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 font-sans">
            Floating 3D personal notebooks. Drag cards to reorder your universe.
          </p>
        </div>

        <button
          onClick={onOpenAddModal}
          className="self-start sm:self-auto px-4 py-2.5 rounded-2xl glass-button-primary flex items-center gap-2 text-xs font-semibold shadow-lg"
        >
          <Plus className="w-4 h-4" />
          <span>Add Custom Section</span>
        </button>
      </div>

      {/* Grid of 3D Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {sections.map(section => (
          <SectionCard
            key={section.id}
            section={section}
            entryCount={entryCountMap[section.id] || 0}
            onClick={() => onSelectSection(section)}
            onEdit={onEditSection}
            onDelete={onDeleteSection}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          />
        ))}

        {/* Add Section Action Card */}
        <button
          onClick={onOpenAddModal}
          className="group relative min-h-[220px] rounded-3xl border-2 border-dashed border-white/10 hover:border-indigo-500/50 hover:bg-indigo-500/5 transition-all duration-300 p-6 flex flex-col items-center justify-center text-center cursor-pointer"
        >
          <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 group-hover:border-indigo-500/40 group-hover:bg-indigo-500/15 flex items-center justify-center text-slate-400 group-hover:text-indigo-300 mb-3 transition-all duration-300 group-hover:scale-110">
            <Plus className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold font-display text-slate-300 group-hover:text-white transition-colors">
            Create New Dimension
          </h3>
          <p className="text-xs text-slate-500 group-hover:text-slate-400 mt-1 max-w-[180px] leading-relaxed">
            Books, Movies, Bucket List, Fitness, Certificates, and more
          </p>
        </button>
      </div>
    </div>
  );
};
