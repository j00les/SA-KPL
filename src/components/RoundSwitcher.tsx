'use client';

import { useState, useRef, useEffect } from 'react';
import { Round, RaceClass } from '@/lib/types';
import { CLASS_COLORS, CLASS_LABELS } from '@/lib/constants';

const ALL_CLASSES: RaceClass[] = ['women', 'junior', 'pro-am', 'pro'];
const DEFAULT_CLASSES: RaceClass[] = ['junior', 'pro'];

interface RoundSwitcherProps {
  rounds: Round[];
  activeRoundId: string | null;
  onSelect: (roundId: string) => void;
  editable?: boolean;
  onAdd?: (name: string, tabLabels?: [string, string, string], classes?: RaceClass[]) => void;
  onRename?: (roundId: string, updates: { name?: string; classes?: RaceClass[] }) => void;
  onDelete?: (roundId: string) => void;
}

export default function RoundSwitcher({
  rounds,
  activeRoundId,
  onSelect,
  editable = false,
  onAdd,
  onRename,
  onDelete,
}: RoundSwitcherProps) {
  const [open, setOpen] = useState(false);
  const [adding, setAdding] = useState(false);
  const [addName, setAddName] = useState('');
  const [addClasses, setAddClasses] = useState<RaceClass[]>([...DEFAULT_CLASSES]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editClasses, setEditClasses] = useState<RaceClass[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const addInputRef = useRef<HTMLInputElement>(null);
  const editInputRef = useRef<HTMLInputElement>(null);

  const activeRound = rounds.find((r) => r.id === activeRoundId);

  // Close dropdown on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
        setAdding(false);
        setEditingId(null);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  // Focus inputs when shown
  useEffect(() => {
    if (adding) addInputRef.current?.focus();
  }, [adding]);
  useEffect(() => {
    if (editingId) editInputRef.current?.focus();
  }, [editingId]);

  const handleAdd = () => {
    if (!addName.trim() || !onAdd || addClasses.length === 0) return;
    onAdd(addName.trim(), undefined, addClasses);
    setAddName('');
    setAddClasses([...DEFAULT_CLASSES]);
    setAdding(false);
  };

  const handleRename = () => {
    if (!editingId || !onRename) return;
    const round = rounds.find((r) => r.id === editingId);
    if (!round) return;
    const nameChanged = editName.trim() && editName.trim() !== round.name;
    const classesChanged = JSON.stringify(editClasses) !== JSON.stringify(round.classes);
    if (nameChanged || classesChanged) {
      onRename(editingId, {
        ...(nameChanged ? { name: editName.trim() } : {}),
        ...(classesChanged ? { classes: editClasses } : {}),
      });
    }
    setEditingId(null);
    setEditName('');
  };

  const handleDelete = (roundId: string, roundName: string) => {
    if (!onDelete) return;
    if (confirm(`Delete "${roundName}" and all its sessions?`)) {
      onDelete(roundId);
      setOpen(false);
    }
  };

  const toggleClass = (cls: RaceClass, list: RaceClass[], setList: (v: RaceClass[]) => void) => {
    if (list.includes(cls)) {
      if (list.length <= 1) return; // must have at least 1
      setList(list.filter((c) => c !== cls));
    } else {
      setList([...list, cls]);
    }
  };

  if (rounds.length === 0) return null;

  return (
    <div className="relative px-4 py-2 bg-[#0D0D0D]" ref={dropdownRef}>
      {/* Trigger button */}
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 w-full px-3 py-2 rounded-lg bg-[#141414] border border-[#2A2A2A] text-gray-100 text-sm font-medium active:bg-[#1A1A1A] transition-colors"
      >
        <svg className="w-4 h-4 text-[#FFE600] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <span className="flex-1 text-left truncate">{activeRound?.name ?? 'Select Round'}</span>
        <svg
          className={`w-4 h-4 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute left-4 right-4 top-full mt-1 z-50 rounded-lg bg-[#141414] border border-[#2A2A2A] shadow-xl overflow-hidden">
          {rounds.map((round) => (
            <div key={round.id}>
              <div
                className={`flex items-center gap-2 px-3 py-2.5 text-sm ${
                  round.id === activeRoundId
                    ? 'bg-[#1A1A1A] text-[#FFE600] font-bold'
                    : 'text-gray-200 active:bg-[#1A1A1A]'
                }`}
              >
                {editingId === round.id ? (
                  <input
                    ref={editInputRef}
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleRename();
                      if (e.key === 'Escape') setEditingId(null);
                    }}
                    onBlur={handleRename}
                    className="flex-1 bg-[#0D0D0D] border border-[#333] rounded px-2 py-1 text-sm text-gray-100 focus:border-[#FFE600] focus:outline-none"
                  />
                ) : (
                  <button
                    className="flex-1 text-left truncate"
                    onClick={() => {
                      onSelect(round.id);
                      setOpen(false);
                    }}
                  >
                    {round.name}
                  </button>
                )}

                {editable && editingId !== round.id && (
                  <div className="flex items-center gap-1 shrink-0">
                    {/* Edit */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingId(round.id);
                        setEditName(round.name);
                        setEditClasses([...round.classes]);
                      }}
                      className="p-1 text-gray-500 active:text-gray-200"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>
                    {/* Delete */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(round.id, round.name);
                      }}
                      className="p-1 text-gray-500 active:text-red-400"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>

              {/* Class toggles when editing */}
              {editable && editingId === round.id && (
                <div className="px-3 pb-2.5 flex gap-1.5">
                  {ALL_CLASSES.map((cls) => (
                    <button
                      key={cls}
                      onClick={() => toggleClass(cls, editClasses, setEditClasses)}
                      className="flex-1 py-1.5 rounded text-[10px] font-bold text-white transition-opacity"
                      style={{
                        backgroundColor: CLASS_COLORS[cls],
                        opacity: editClasses.includes(cls) ? 1 : 0.2,
                      }}
                    >
                      {CLASS_LABELS[cls]}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}

          {/* Add new round */}
          {editable && (
            <>
              {adding ? (
                <div className="px-3 py-2.5 border-t border-[#2A2A2A] space-y-2">
                  <div className="flex gap-2">
                    <input
                      ref={addInputRef}
                      value={addName}
                      onChange={(e) => setAddName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleAdd();
                        if (e.key === 'Escape') { setAdding(false); setAddName(''); }
                      }}
                      placeholder="Round name..."
                      className="flex-1 bg-[#0D0D0D] border border-[#333] rounded px-2 py-1 text-sm text-gray-100 placeholder:text-gray-500 focus:border-[#FFE600] focus:outline-none"
                    />
                    <button
                      onClick={handleAdd}
                      disabled={!addName.trim() || addClasses.length === 0}
                      className="px-3 py-1 rounded bg-[#FFE600] text-black text-xs font-bold disabled:opacity-40"
                    >
                      Add
                    </button>
                  </div>
                  <div className="flex gap-1.5">
                    {ALL_CLASSES.map((cls) => (
                      <button
                        key={cls}
                        onClick={() => toggleClass(cls, addClasses, setAddClasses)}
                        className="flex-1 py-1.5 rounded text-[10px] font-bold text-white transition-opacity"
                        style={{
                          backgroundColor: CLASS_COLORS[cls],
                          opacity: addClasses.includes(cls) ? 1 : 0.2,
                        }}
                      >
                        {CLASS_LABELS[cls]}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setAdding(true)}
                  className="w-full px-3 py-2.5 text-sm text-gray-400 text-left border-t border-[#2A2A2A] active:bg-[#1A1A1A] flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                  New Round
                </button>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
