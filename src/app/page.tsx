'use client';

import { useState } from 'react';
import Image from 'next/image';
import TabNavigation, { TabId } from '@/components/TabNavigation';

import RaceSummaryCard from '@/components/RaceSummaryCard';
import QualSummaryCard from '@/components/QualSummaryCard';
import RoundSwitcher from '@/components/RoundSwitcher';
import { useRaceData } from '@/hooks/useRaceData';

export default function PublicDashboard() {
  const [activeTab, setActiveTab] = useState<TabId>('qualifying');
  const { data, rounds, activeRoundId, activeRound, setActiveRound } = useRaceData();

  return (
    <div className="min-h-screen bg-[#0D0D0D]">
      {/* Header */}
      <header className="relative bg-[#111111] overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            background: 'repeating-linear-gradient(135deg, transparent, transparent 10px, #FFE600 10px, #FFE600 20px)',
          }}
        />
        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#E10600] via-[#FFE600] to-[#E10600]" />

        <div className="relative flex flex-col items-center pt-4 pb-4">
          <Image
            src="/sa-logo.png"
            alt="Speed Adrenaline"
            width={180}
            height={72}
            className="h-14 w-auto"
            priority
          />
          <h1 className="text-white text-base font-extrabold tracking-[0.2em] uppercase mt-2">
            Kart Inc Pro League
          </h1>
          <span className="text-[#FFE600] text-[9px] font-bold tracking-[0.3em] uppercase mt-1">
            Live Results
          </span>
        </div>
      </header>

      <RoundSwitcher
        rounds={rounds}
        activeRoundId={activeRoundId}
        onSelect={setActiveRound}
      />

      <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} labels={activeRound?.tabLabels} />

      <main className="px-4 py-4 pb-8 space-y-3">
        {!data ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-gray-500 text-sm">Connecting...</div>
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

            {activeTab === 'qualifying' && data.qualifying.length === 0 && (
              <div className="text-center py-16 text-gray-500 text-sm">No sessions yet</div>
            )}
            {activeTab === 'heats' && data.heatsAndRace1.length === 0 && (
              <div className="text-center py-16 text-gray-500 text-sm">No sessions yet</div>
            )}
            {activeTab === 'final' && data.finalAndRace2.length === 0 && (
              <div className="text-center py-16 text-gray-500 text-sm">No sessions yet</div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
