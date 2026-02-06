'use client';

import { useState } from 'react';
import TabNavigation, { TabId } from '@/components/TabNavigation';
import ConnectionStatus from '@/components/ConnectionStatus';
import RaceSummaryCard from '@/components/RaceSummaryCard';
import QualSummaryCard from '@/components/QualSummaryCard';
import { useRaceData } from '@/hooks/useRaceData';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<TabId>('qualifying');
  const { data } = useRaceData();

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      {/* Header */}
      <header className="relative bg-[#2D2D2D] overflow-hidden">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            background: 'repeating-linear-gradient(135deg, transparent, transparent 10px, #E10600 10px, #E10600 20px)',
          }}
        />
        <div className="relative flex items-center justify-between px-4 py-3">
          <div>
            <h1 className="text-white text-lg font-bold tracking-wide">
              KPL ROUND 2
            </h1>
            <p className="text-gray-400 text-xs">7 Feb 2026 &middot; Race Timing</p>
          </div>
          <ConnectionStatus />
        </div>
      </header>

      {/* Tabs */}
      <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Content */}
      <main className="px-4 py-4 pb-8 space-y-3">
        {!data ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-gray-400 text-sm">Connecting...</div>
          </div>
        ) : (
          <>
            {activeTab === 'qualifying' &&
              data.qualifying.map((session) => (
                <QualSummaryCard key={session.id} session={session} />
              ))}

            {activeTab === 'heats' &&
              data.heatsAndRace1.map((session) => (
                <RaceSummaryCard key={session.id} session={session} />
              ))}

            {activeTab === 'final' &&
              data.finalAndRace2.map((session) => (
                <RaceSummaryCard key={session.id} session={session} />
              ))}
          </>
        )}
      </main>
    </div>
  );
}
