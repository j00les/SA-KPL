'use client';

import { useState } from 'react';
import Image from 'next/image';
import TabNavigation, { TabId } from '@/components/TabNavigation';
import ConnectionStatus from '@/components/ConnectionStatus';
import RaceSummaryCard from '@/components/RaceSummaryCard';
import QualSummaryCard from '@/components/QualSummaryCard';
import RoundSwitcher from '@/components/RoundSwitcher';
import { useRaceData } from '@/hooks/useRaceData';
import { RaceClass, SessionType } from '@/lib/types';
import { CLASS_COLORS } from '@/lib/constants';

const TAB_TO_CATEGORY = {
  qualifying: 'qualifying',
  heats: 'heatsAndRace1',
  final: 'finalAndRace2',
} as const;

const TAB_DEFAULT_TYPE: Record<TabId, SessionType> = {
  qualifying: 'qualifying',
  heats: 'heat',
  final: 'race',
};

const ALL_CLASS_OPTIONS: { value: RaceClass; label: string }[] = [
  { value: 'women', label: 'Women' },
  { value: 'junior', label: 'Junior' },
  { value: 'pro-am', label: 'Pro-Am' },
  { value: 'pro', label: 'Pro' },
];

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<TabId>('qualifying');
  const { data, rounds, activeRoundId, activeRound, setActiveRound, addSession, addRound, updateRound, deleteRound } = useRaceData();

  const classOptions = activeRound
    ? ALL_CLASS_OPTIONS.filter((opt) => activeRound.classes.includes(opt.value))
    : ALL_CLASS_OPTIONS;
  const [showAddForm, setShowAddForm] = useState(false);
  const [newLabel, setNewLabel] = useState('');
  const [newClass, setNewClass] = useState<RaceClass>(activeRound?.classes[0] ?? 'pro');

  const handleAddSession = () => {
    if (!newLabel.trim()) return;
    const category = TAB_TO_CATEGORY[activeTab];
    const type = TAB_DEFAULT_TYPE[activeTab];
    addSession(category, type, newClass, newLabel.trim());
    setNewLabel('');
    setShowAddForm(false);
  };

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

        <div className="relative flex justify-end px-4 pt-3">
          <ConnectionStatus />
        </div>
        <div className="relative flex flex-col items-center pb-4 -mt-1">
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
          <span className="text-[#FFE600] text-[9px] font-bold tracking-[0.3em] uppercase mt-1 border border-[#FFE600]/40 rounded px-2 py-0.5">
            Timing Operator
          </span>
        </div>
      </header>

      <RoundSwitcher
        rounds={rounds}
        activeRoundId={activeRoundId}
        onSelect={setActiveRound}
        editable
        onAdd={addRound}
        onRename={(roundId, updates) => updateRound(roundId, updates)}
        onDelete={deleteRound}
      />

      <TabNavigation
        activeTab={activeTab}
        onTabChange={setActiveTab}
        labels={activeRound?.tabLabels}
        editable
        onLabelChange={(labels) => {
          if (activeRoundId) updateRound(activeRoundId, { tabLabels: labels });
        }}
      />

      <main className="px-4 py-4 pb-8 space-y-3">
        {!data ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-gray-500 text-sm">Connecting...</div>
          </div>
        ) : (
          <>
            {activeTab === 'qualifying' &&
              data.qualifying.map((session) => (
                <QualSummaryCard key={session.id} session={session} editable />
              ))}

            {activeTab === 'heats' &&
              data.heatsAndRace1.map((session) => (
                <RaceSummaryCard key={session.id} session={session} editable />
              ))}

            {activeTab === 'final' &&
              data.finalAndRace2.map((session) => (
                <RaceSummaryCard key={session.id} session={session} editable />
              ))}

            {/* Add Session */}
            {showAddForm ? (
              <div className="rounded-lg bg-[#1A1A1A] p-4 space-y-3 border-2 border-dashed border-[#333]">
                <input
                  autoFocus
                  type="text"
                  placeholder="Session name (e.g. Q Pro-Am Group A)"
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleAddSession();
                    if (e.key === 'Escape') setShowAddForm(false);
                  }}
                  className="w-full h-11 rounded-md border border-[#333] bg-[#141414] px-3 text-sm font-medium text-gray-100 placeholder:text-gray-500 focus:border-[#FFE600] focus:ring-1 focus:ring-[#FFE600] focus:outline-none"
                />
                <div className="flex gap-2">
                  {classOptions.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setNewClass(opt.value)}
                      className="flex-1 py-2 rounded-md text-xs font-bold text-white transition-opacity"
                      style={{
                        backgroundColor: CLASS_COLORS[opt.value],
                        opacity: newClass === opt.value ? 1 : 0.3,
                      }}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowAddForm(false)}
                    className="flex-1 py-2.5 rounded-md text-sm font-medium text-gray-300 bg-[#2A2A2A] active:bg-[#333]"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddSession}
                    disabled={!newLabel.trim()}
                    className="flex-1 py-2.5 rounded-md text-sm font-bold text-white bg-[#E10600] active:opacity-80 disabled:opacity-40"
                  >
                    Add
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowAddForm(true)}
                className="w-full py-3 rounded-lg border-2 border-dashed border-[#333] text-gray-500 text-sm font-medium active:bg-[#1A1A1A] transition-colors"
              >
                + Add Session
              </button>
            )}
          </>
        )}
      </main>
    </div>
  );
}
