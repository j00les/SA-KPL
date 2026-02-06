'use client';

import { useState } from 'react';
import Image from 'next/image';
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
      <header className="relative bg-[#1A1A1A] overflow-hidden">
        {/* Diagonal racing stripes */}
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            background: 'repeating-linear-gradient(135deg, transparent, transparent 10px, #FFE600 10px, #FFE600 20px)',
          }}
        />
        {/* Bottom accent line */}
        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#E10600] via-[#FFE600] to-[#E10600]" />

        <div className="relative flex items-center justify-between px-4 pt-3 pb-2">
          <Image
            src="/sa-logo.png"
            alt="Speed Adrenaline"
            width={120}
            height={48}
            className="h-8 w-auto"
            priority
          />
          <ConnectionStatus />
        </div>
        <div className="relative px-4 pb-3 flex items-baseline gap-2">
          <h1 className="text-white text-lg font-bold tracking-wider">
            KPL ROUND 2
          </h1>
          <span className="text-[#FFE600] text-[10px] font-bold tracking-widest uppercase opacity-80">
            7 Feb 2026
          </span>
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
