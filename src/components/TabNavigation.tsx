'use client';

import { useState } from 'react';

export type TabId = 'qualifying' | 'heats' | 'final';

interface Tab {
  id: TabId;
  label: string;
}

const TABS: Tab[] = [
  { id: 'qualifying', label: 'Qualifying' },
  { id: 'heats', label: 'Heats & Race 1' },
  { id: 'final', label: 'Final & Race 2' },
];

interface TabNavigationProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
}

export default function TabNavigation({ activeTab, onTabChange }: TabNavigationProps) {
  return (
    <div className="sticky top-0 z-20 flex bg-[#222222] border-b border-[#333]">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`flex-1 py-3 px-2 text-sm font-semibold text-center transition-colors relative ${
            activeTab === tab.id
              ? 'text-[#FFE600]'
              : 'text-gray-500 active:text-gray-300'
          }`}
        >
          {tab.label}
          {activeTab === tab.id && (
            <span className="absolute bottom-0 left-2 right-2 h-[2px] bg-[#FFE600] rounded-t" />
          )}
        </button>
      ))}
    </div>
  );
}
