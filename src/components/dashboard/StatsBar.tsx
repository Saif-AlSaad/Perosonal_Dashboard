import React from 'react';
import { Layers, FileText, Image, Video, Mic, Star } from 'lucide-react';
import { DashboardStats } from '../../types';

interface StatsBarProps {
  stats: DashboardStats;
  onFilterFavorites?: () => void;
}

export const StatsBar: React.FC<StatsBarProps> = ({ stats, onFilterFavorites }) => {
  const statItems = [
    { label: 'Sections', value: stats.sectionsCount, icon: Layers, color: 'text-indigo-400' },
    { label: 'Entries', value: stats.entriesCount, icon: FileText, color: 'text-sky-400' },
    { label: 'Photos', value: stats.photosCount, icon: Image, color: 'text-emerald-400' },
    { label: 'Videos', value: stats.videosCount, icon: Video, color: 'text-purple-400' },
    { label: 'Voice Notes', value: stats.audioCount, icon: Mic, color: 'text-amber-400' },
    { label: 'Favorites', value: stats.favoritesCount, icon: Star, color: 'text-rose-400', clickable: true },
  ];

  return (
    <div className="w-full grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      {statItems.map((item, idx) => {
        const Icon = item.icon;
        return (
          <div
            key={idx}
            onClick={item.clickable ? onFilterFavorites : undefined}
            className={`p-3.5 rounded-2xl glass-card flex items-center gap-3.5 transition-all ${
              item.clickable ? 'cursor-pointer hover:border-rose-500/40 hover:bg-rose-500/5' : ''
            }`}
          >
            <div className={`p-2 rounded-xl bg-white/5 border border-white/5 ${item.color}`}>
              <Icon className="w-4 h-4" />
            </div>
            <div>
              <div className="text-lg sm:text-xl font-bold font-display text-white tracking-tight leading-tight">
                {item.value}
              </div>
              <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                {item.label}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
