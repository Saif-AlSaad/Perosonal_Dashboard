import React from 'react';
import { Entry, ActivityItem } from '../../../types';
import { CosmicClockFocus } from './CosmicClockFocus';
import { AmbientSoundscape } from './AmbientSoundscape';
import { QuickScratchpad } from './QuickScratchpad';
import { ActivityHeatmap } from './ActivityHeatmap';
import { LayoutDashboard } from 'lucide-react';

interface BentoHubProps {
  entries: Entry[];
  activities: ActivityItem[];
  onConvertToEntry?: (data: { title: string; content: string }) => void;
}

export const BentoHub: React.FC<BentoHubProps> = ({
  entries,
  activities,
  onConvertToEntry,
}) => {
  return (
    <section className="w-full space-y-4" aria-label="Bento Command Nexus">
      {/* Subtle Section Label */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <LayoutDashboard className="w-3.5 h-3.5" />
          </div>
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
            Command Nexus & Focus Hub
          </h3>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] font-mono text-slate-400">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>REALTIME SYNC</span>
        </div>
      </div>

      {/* Asymmetrical Bento Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Widget 1: Cosmic Live Clock & Focus Orb (lg:col-span-7) */}
        <div className="lg:col-span-7">
          <CosmicClockFocus />
        </div>

        {/* Widget 2: Ambient Soundscape Generator (lg:col-span-5) */}
        <div className="lg:col-span-5">
          <AmbientSoundscape />
        </div>

        {/* Widget 3: Quick Scratchpad / Sticky Notes (lg:col-span-5) */}
        <div className="lg:col-span-5">
          <QuickScratchpad onConvertToEntry={onConvertToEntry} />
        </div>

        {/* Widget 4: Activity & Life Consistency Heatmap (lg:col-span-7) */}
        <div className="lg:col-span-7">
          <ActivityHeatmap entries={entries} activities={activities} />
        </div>
      </div>
    </section>
  );
};
