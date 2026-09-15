import React from 'react';
import { Star, ArrowLeft, Calendar } from 'lucide-react';
import { Entry, Section } from '../../types';

interface FavoritesViewProps {
  entries: Entry[];
  sections: Section[];
  onSelectEntry: (entry: Entry, section: Section) => void;
  onBack: () => void;
}

export const FavoritesView: React.FC<FavoritesViewProps> = ({
  entries,
  sections,
  onSelectEntry,
  onBack,
}) => {
  const favoriteEntries = entries.filter(e => e.isFavorite);
  const sectionMap = React.useMemo(() => {
    const map = new Map<string, Section>();
    for (const s of sections) {
      map.set(s.id, s);
    }
    return map;
  }, [sections]);

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2.5 rounded-xl glass-pill text-slate-300 hover:text-white transition-colors"
            title="Back to Dashboard"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
              <h2 className="text-xl sm:text-2xl font-bold font-display text-white tracking-tight">
                Favorite Memories & Highlights
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
              Curated collection of your most cherished entries across all dimensions.
            </p>
          </div>
        </div>

        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/25">
          {favoriteEntries.length} Starred
        </span>
      </div>

      {favoriteEntries.length === 0 ? (
        <div className="p-12 rounded-3xl glass-card text-center flex flex-col items-center justify-center">
          <Star className="w-12 h-12 text-slate-600 mb-3" />
          <h3 className="text-base font-bold text-slate-300">No favorite entries yet</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm">
            Star any project, travel memory, or thought inside a section notebook to save it here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {favoriteEntries.map(entry => {
            const section = sectionMap.get(entry.sectionId);
            const firstImage = entry.media.find(m => m.type === 'image');

            return (
              <div
                key={entry.id}
                onClick={() => section && onSelectEntry(entry, section)}
                className="group cursor-pointer rounded-3xl glass-card p-5 flex flex-col justify-between overflow-hidden hover:border-amber-500/30 transition-all duration-300"
              >
                {firstImage && (
                  <div className="w-full h-40 rounded-2xl overflow-hidden mb-3 bg-slate-900">
                    <img
                      src={firstImage.url}
                      alt={entry.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                )}

                <div>
                  {section && (
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span
                        className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider"
                        style={{
                          backgroundColor: `${section.color}20`,
                          color: section.color,
                        }}
                      >
                        {section.name}
                      </span>
                      <div className="flex items-center gap-1 text-[11px] text-slate-400 font-mono">
                        <Calendar className="w-3 h-3" />
                        <span>{entry.date}</span>
                      </div>
                    </div>
                  )}

                  <h3 className="text-base font-bold font-display text-white group-hover:text-amber-200 transition-colors line-clamp-2">
                    {entry.title}
                  </h3>

                  <p className="text-xs text-slate-400 line-clamp-2 mt-2 leading-relaxed">
                    {entry.content.replace(/#|\*|_/g, '')}
                  </p>
                </div>

                {entry.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-4 pt-3 border-t border-white/5">
                    {entry.tags.slice(0, 3).map((tag, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] text-slate-400 bg-white/5 px-2 py-0.5 rounded"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
