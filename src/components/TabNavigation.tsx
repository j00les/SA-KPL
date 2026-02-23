'use client';

import { useState, useRef, useEffect } from 'react';

export type TabId = 'qualifying' | 'heats' | 'final';

const TAB_IDS: TabId[] = ['qualifying', 'heats', 'final'];

const DEFAULT_LABELS: [string, string, string] = ['Qualifying', 'Heats & Race 1', 'Final & Race 2'];

interface TabNavigationProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
  labels?: [string, string, string];
  editable?: boolean;
  onLabelChange?: (labels: [string, string, string]) => void;
}

export default function TabNavigation({
  activeTab,
  onTabChange,
  labels = DEFAULT_LABELS,
  editable = false,
  onLabelChange,
}: TabNavigationProps) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [draft, setDraft] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingIndex !== null) inputRef.current?.focus();
  }, [editingIndex]);

  const handleSave = () => {
    if (editingIndex === null) return;
    const trimmed = draft.trim();
    if (trimmed && trimmed !== labels[editingIndex] && onLabelChange) {
      const newLabels = [...labels] as [string, string, string];
      newLabels[editingIndex] = trimmed;
      onLabelChange(newLabels);
    }
    setEditingIndex(null);
  };

  return (
    <div className="sticky top-0 z-20 flex bg-[#141414] border-b border-[#2A2A2A]">
      {TAB_IDS.map((tabId, i) => (
        <div key={tabId} className="flex-1 relative">
          {editable && editingIndex === i ? (
            <input
              ref={inputRef}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onBlur={handleSave}
              onKeyDown={(e) => {
                if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
                if (e.key === 'Escape') setEditingIndex(null);
              }}
              className="w-full py-3 px-2 text-sm font-semibold text-center bg-transparent text-[#FFE600] border-b-2 border-[#FFE600] outline-none"
            />
          ) : (
            <button
              onClick={() => {
                if (editable && activeTab === tabId) {
                  setDraft(labels[i]);
                  setEditingIndex(i);
                } else {
                  onTabChange(tabId);
                }
              }}
              className={`w-full py-3 px-2 text-sm font-semibold text-center transition-colors ${
                activeTab === tabId
                  ? 'text-[#FFE600]'
                  : 'text-gray-500 active:text-gray-300'
              }`}
            >
              {labels[i]}
            </button>
          )}
          {activeTab === tabId && editingIndex !== i && (
            <span className="absolute bottom-0 left-2 right-2 h-[2px] bg-[#FFE600] rounded-t" />
          )}
        </div>
      ))}
    </div>
  );
}
