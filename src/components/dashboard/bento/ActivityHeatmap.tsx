import React, { useState, useMemo } from 'react';
import { 
  Flame, 
  Calendar, 
  TrendingUp, 
  Sparkles
} from 'lucide-react';
import { Entry, ActivityItem } from '../../../types';

interface ActivityHeatmapProps {
  entries: Entry[];
  activities: ActivityItem[];
}

interface DayData {
  dateStr: string;
  displayDate: string;
  count: number;
  entriesCount: number;
  activitiesCount: number;
  level: 0 | 1 | 2 | 3 | 4;
}

export const ActivityHeatmap: React.FC<ActivityHeatmapProps> = ({ entries, activities }) => {
  const [hoveredDay, setHoveredDay] = useState<DayData | null>(null);

  // Generate days over the past 20 weeks (~140 days) aligned to weeks (starting on Sunday)
  const { weeks, stats } = useMemo(() => {
    const today = new Date();
    today.setHours(23, 59, 59, 999);

    // Map counts by YYYY-MM-DD
    const countsMap = new Map<string, { entries: number; activities: number }>();

    // Process entries
    entries.forEach(e => {
      // Entry date can be e.date (YYYY-MM-DD) or e.createdAt
      const d = e.date ? e.date.slice(0, 10) : e.createdAt.slice(0, 10);
      if (!countsMap.has(d)) countsMap.set(d, { entries: 0, activities: 0 });
      countsMap.get(d)!.entries += 1;
    });

    // Process activities
    activities.forEach(a => {
      const d = a.timestamp.slice(0, 10);
      if (!countsMap.has(d)) countsMap.set(d, { entries: 0, activities: 0 });
      countsMap.get(d)!.activities += 1;
    });

    const totalWeeks = 20;
    const daysToShow = totalWeeks * 7;

    // End at upcoming Saturday or today
    const endDate = new Date(today);
    const dayOfWeek = endDate.getDay(); // 0 is Sunday, 6 is Saturday
    endDate.setDate(endDate.getDate() + (6 - dayOfWeek));

    const startDate = new Date(endDate);
    startDate.setDate(startDate.getDate() - daysToShow + 1);

    const generatedWeeks: DayData[][] = [];
    let currentWeek: DayData[] = [];

    let totalActivitiesCount = 0;
    let activeDaysCount = 0;

    const cursor = new Date(startDate);
    while (cursor <= endDate) {
      const dateStr = cursor.toISOString().slice(0, 10);
      const counts = countsMap.get(dateStr) || { entries: 0, activities: 0 };
      const count = counts.entries + counts.activities;

      if (count > 0 && cursor <= today) {
        totalActivitiesCount += count;
        activeDaysCount++;
      }

      let level: 0 | 1 | 2 | 3 | 4 = 0;
      if (count === 1) level = 1;
      else if (count >= 2 && count <= 3) level = 2;
      else if (count >= 4 && count <= 6) level = 3;
      else if (count > 6) level = 4;

      currentWeek.push({
        dateStr,
        displayDate: cursor.toLocaleDateString([], {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        }),
        count: cursor > today ? 0 : count,
        entriesCount: counts.entries,
        activitiesCount: counts.activities,
        level: cursor > today ? 0 : level,
      });

      if (currentWeek.length === 7) {
        generatedWeeks.push(currentWeek);
        currentWeek = [];
      }

      cursor.setDate(cursor.getDate() + 1);
    }

    if (currentWeek.length > 0) {
      generatedWeeks.push(currentWeek);
    }

    // Calculate streaks
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;

    const streakCursor = new Date(today);
    // Check if today has activity, otherwise start checking from yesterday
    const todayStr = streakCursor.toISOString().slice(0, 10);
    const todayActive = (countsMap.get(todayStr)?.entries || 0) + (countsMap.get(todayStr)?.activities || 0) > 0;

    if (!todayActive) {
      streakCursor.setDate(streakCursor.getDate() - 1);
    }

    while (true) {
      const dStr = streakCursor.toISOString().slice(0, 10);
      const c = (countsMap.get(dStr)?.entries || 0) + (countsMap.get(dStr)?.activities || 0);
      if (c > 0) {
        currentStreak++;
        streakCursor.setDate(streakCursor.getDate() - 1);
      } else {
        break;
      }
    }

    // Compute longest streak over all past dates in the window
    const allDaysSorted = Array.from(countsMap.keys()).sort();
    allDaysSorted.forEach((dStr, idx) => {
      const prevDStr = allDaysSorted[idx - 1];
      if (prevDStr) {
        const diff = (new Date(dStr).getTime() - new Date(prevDStr).getTime()) / (1000 * 60 * 60 * 24);
        if (diff === 1) {
          tempStreak++;
        } else {
          tempStreak = 1;
        }
      } else {
        tempStreak = 1;
      }
      if (tempStreak > longestStreak) {
        longestStreak = tempStreak;
      }
    });

    return {
      weeks: generatedWeeks,
      stats: {
        totalContributions: totalActivitiesCount,
        activeDays: activeDaysCount,
        currentStreak: Math.max(currentStreak, todayActive ? 1 : 0),
        longestStreak: Math.max(longestStreak, currentStreak),
      },
    };
  }, [entries, activities]);

  // Color mapper for intensity levels
  const getLevelClasses = (level: number) => {
    switch (level) {
      case 1:
        return 'bg-indigo-500/35 border-indigo-500/50 hover:border-indigo-400';
      case 2:
        return 'bg-indigo-500/70 border-indigo-400/80 hover:border-indigo-300';
      case 3:
        return 'bg-cyan-500/85 border-cyan-400 hover:border-cyan-200';
      case 4:
        return 'bg-gradient-to-tr from-indigo-400 to-cyan-300 border-white shadow-sm hover:brightness-125';
      case 0:
      default:
        return 'bg-white/[0.04] border-white/[0.04] hover:border-white/20';
    }
  };

  return (
    <div className="relative rounded-3xl glass-card p-6 overflow-hidden flex flex-col justify-between group border border-white/10 shadow-2xl min-h-[260px]">
      {/* Ambient background glow */}
      <div className="absolute top-0 right-1/4 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header: Title & Streak Highlights */}
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/5">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-400">
            <Calendar className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold font-display text-white tracking-tight">
              Life Consistency & Milestones
            </h4>
            <p className="text-[11px] text-slate-400 font-sans">
              20-Week Activity & Memory Heatmap
            </p>
          </div>
        </div>

        {/* Streak & Metrics Badges */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-300 text-xs font-semibold">
            <Flame className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span>{stats.currentStreak} Day Streak</span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/5 border border-white/5 text-slate-300 text-xs">
            <TrendingUp className="w-3.5 h-3.5 text-cyan-400" />
            <span>{stats.totalContributions} Contributions</span>
          </div>
        </div>
      </div>

      {/* Center: Contribution Matrix Grid */}
      <div className="relative z-10 my-4 overflow-x-auto pb-2">
        <div className="min-w-[640px] flex gap-1.5">
          {weeks.map((week, weekIdx) => (
            <div key={weekIdx} className="flex flex-col gap-1.5 flex-1">
              {week.map((day, dayIdx) => (
                <div
                  key={dayIdx}
                  onMouseEnter={() => setHoveredDay(day)}
                  onMouseLeave={() => setHoveredDay(null)}
                  className={`w-3.5 h-3.5 rounded-md border transition-all duration-150 cursor-pointer ${getLevelClasses(
                    day.level
                  )}`}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Bar: Hover Tooltip & Legend */}
      <div className="relative z-10 pt-3 border-t border-white/5 flex items-center justify-between gap-3 text-xs">
        {/* Dynamic Hover Details */}
        <div className="flex items-center gap-1.5 text-slate-300 min-h-[18px]">
          {hoveredDay ? (
            <span className="text-[11px]">
              <strong className="text-white font-semibold">
                {hoveredDay.count} {hoveredDay.count === 1 ? 'event' : 'events'}
              </strong>{' '}
              on {hoveredDay.displayDate}
              {hoveredDay.count > 0 && (
                <span className="text-slate-400 text-[10px] ml-1">
                  ({hoveredDay.entriesCount} entries, {hoveredDay.activitiesCount} edits)
                </span>
              )}
            </span>
          ) : (
            <span className="text-[11px] text-slate-400 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-indigo-400 inline" />
              Hover over a square to view daily vault interactions
            </span>
          )}
        </div>

        {/* Level Legend */}
        <div className="flex items-center gap-1.5 text-[10px] text-slate-400 shrink-0">
          <span>Less</span>
          <span className="w-2.5 h-2.5 rounded-xs bg-white/[0.04] border border-white/[0.04]" />
          <span className="w-2.5 h-2.5 rounded-xs bg-indigo-500/35 border border-indigo-500/50" />
          <span className="w-2.5 h-2.5 rounded-xs bg-indigo-500/70 border border-indigo-400/80" />
          <span className="w-2.5 h-2.5 rounded-xs bg-cyan-500/85 border border-cyan-400" />
          <span className="w-2.5 h-2.5 rounded-xs bg-gradient-to-tr from-indigo-400 to-cyan-300 border border-white" />
          <span>More</span>
        </div>
      </div>
    </div>
  );
};
