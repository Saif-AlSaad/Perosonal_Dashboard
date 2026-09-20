import React from 'react';
import { Clock, ArrowRight, PlusCircle, Edit3, Trash, Star } from 'lucide-react';
import { ActivityItem } from '../../types';

interface RecentActivityProps {
  activities: ActivityItem[];
  onSelectActivity: (activity: ActivityItem) => void;
}

export const RecentActivity: React.FC<RecentActivityProps> = ({
  activities,
  onSelectActivity,
}) => {
  if (activities.length === 0) return null;

  const getActivityIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'add':
        return <PlusCircle className="w-3.5 h-3.5 text-emerald-400" />;
      case 'update':
        return <Edit3 className="w-3.5 h-3.5 text-indigo-400" />;
      case 'delete':
        return <Trash className="w-3.5 h-3.5 text-rose-400" />;
      case 'favorite':
        return <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />;
      default:
        return <Clock className="w-3.5 h-3.5 text-cyan-400" />;
    }
  };

  const formatTimestamp = (iso: string) => {
    try {
      const date = new Date(iso);
      const now = new Date();
      const diffHours = Math.round((now.getTime() - date.getTime()) / (1000 * 60 * 60));

      if (diffHours < 1) return 'Just now';
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffHours < 48) return 'Yesterday';
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } catch {
      return 'Recently';
    }
  };

  return (
    <div className="w-full rounded-3xl glass-card p-6 border border-slate-200 dark:border-white/10 shadow-xs">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
          <h3 className="text-base font-bold font-display text-slate-900 dark:text-white">Recent Activity</h3>
        </div>
        <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Timeline Feed</span>
      </div>

      <div className="divide-y divide-slate-100 dark:divide-white/5">
        {activities.slice(0, 5).map(act => (
          <div
            key={act.id}
            onClick={() => onSelectActivity(act)}
            className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-3 group cursor-pointer hover:bg-slate-50 dark:hover:bg-white/5 px-2.5 -mx-2.5 rounded-xl transition-colors"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5 shrink-0">
                {getActivityIcon(act.type)}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-slate-900 dark:text-slate-200 truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-300 transition-colors">
                  {act.entryTitle}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                  in <span className="text-slate-700 dark:text-slate-300 font-medium">{act.sectionName}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span className="text-[10px] text-slate-500 font-mono">
                {formatTimestamp(act.timestamp)}
              </span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition-colors" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
