'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import { useRaceData } from '@/hooks/useRaceData';
import { useSocket } from '@/hooks/useSocket';
import DriverResultForm from '@/components/DriverResultForm';
import AddDriverInline from '@/components/AddDriverInline';
import ConnectionStatus from '@/components/ConnectionStatus';
import {
  RaceResult,
  QualifyingResult,
  SessionStatus,
} from '@/lib/types';
import { CLASS_COLORS, CLASS_LABELS } from '@/lib/constants';
import { RaceClass } from '@/lib/types';
import { formatTime, formatGap, timeToMs } from '@/lib/time-utils';

interface FormResult {
  driverId: string;
  driverName: string;
  bestLap: string;
  totalTime: string;
  gap: string;
}

export default function RaceInputPage() {
  const params = useParams();
  const router = useRouter();
  const raceId = params.id as string;
  const { data, activeRound, getSession, saveRaceResults, saveQualifyingResults, addDriver, removeDriver, updateSessionLabel, updateSessionClass } =
    useRaceData();
  const { isConnected } = useSocket();

  const [results, setResults] = useState<FormResult[]>([]);
  const [status, setStatus] = useState<SessionStatus>('not-started');
  const [saving, setSaving] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [editingLabel, setEditingLabel] = useState(false);
  const [labelDraft, setLabelDraft] = useState('');

  const session = data ? getSession(raceId) : null;
  const isQualifying = session?.type === 'qualifying';

  // Initialize form from session data
  useEffect(() => {
    if (!session || initialized) return;

    const formResults: FormResult[] = session.drivers.map((driver) => {
      const existing = session.results.find((r) => r.driverId === driver.id);
      if (existing) {
        const totalTime = isQualifying ? '' : (existing as RaceResult).totalTime || '';
        const gap = isQualifying ? '' : (existing as RaceResult).gap || '';
        return {
          driverId: driver.id,
          driverName: driver.name,
          bestLap: existing.bestLap || '',
          totalTime,
          gap: gap === '--' ? '' : gap, // P1 gap is "--", show empty in form
        };
      }
      return {
        driverId: driver.id,
        driverName: driver.name,
        bestLap: '',
        totalTime: '',
        gap: '',
      };
    });

    // For race sessions, restore saved order (sort by position)
    if (!isQualifying && session.results.length > 0) {
      const posMap = new Map(session.results.map((r) => [r.driverId, r.position ?? 999]));
      formResults.sort((a, b) => (posMap.get(a.driverId) ?? 999) - (posMap.get(b.driverId) ?? 999));
    }

    setResults(formResults);
    setStatus(session.status);
    setInitialized(true);
  }, [session, initialized]);

  // Sync newly added/removed drivers — use functional updater to avoid stale closure
  useEffect(() => {
    if (!session || !initialized) return;

    const sessionIds = new Set(session.drivers.map((d) => d.id));

    setResults((prev) => {
      const currentIds = new Set(prev.map((r) => r.driverId));

      // Add new drivers
      const newDrivers = session.drivers.filter((d) => !currentIds.has(d.id));

      // Remove deleted drivers
      const filtered = prev.filter((r) => sessionIds.has(r.driverId));

      if (newDrivers.length === 0 && filtered.length === prev.length) {
        return prev; // No changes
      }

      return [
        ...filtered,
        ...newDrivers.map((d) => ({
          driverId: d.id,
          driverName: d.name,
          bestLap: '',
          totalTime: '',
          gap: '',
        })),
      ];
    });
  }, [session?.drivers, initialized]);

  // Compute positions: qualifying = sorted by bestLap time, race = card order
  const computePositions = useCallback(
    (list: FormResult[]): Map<string, number | null> => {
      if (!isQualifying) {
        // Race: position = card order (index + 1)
        const positions = new Map<string, number | null>();
        list.forEach((r, i) => positions.set(r.driverId, i + 1));
        return positions;
      }
      // Qualifying: sort by bestLap time
      const withTime = list
        .map((r) => ({ id: r.driverId, ms: timeToMs(formatTime(r.bestLap)) }))
        .filter((r) => r.ms > 0)
        .sort((a, b) => a.ms - b.ms);

      const positions = new Map<string, number | null>();
      list.forEach((r) => positions.set(r.driverId, null));
      withTime.forEach((r, i) => positions.set(r.id, i + 1));
      return positions;
    },
    [isQualifying]
  );

  const positions = computePositions(results);

  // Move driver up/down in the list (for race sessions)
  const handleMoveUp = useCallback((index: number) => {
    if (index <= 0) return;
    setResults((prev) => {
      const next = [...prev];
      [next[index - 1], next[index]] = [next[index], next[index - 1]];
      return next;
    });
  }, []);

  const handleMoveDown = useCallback((index: number) => {
    setResults((prev) => {
      if (index >= prev.length - 1) return prev;
      const next = [...prev];
      [next[index], next[index + 1]] = [next[index + 1], next[index]];
      return next;
    });
  }, []);

  const handleFieldChange = useCallback(
    (driverId: string, field: string, value: string) => {
      setResults((prev) =>
        prev.map((r) => (r.driverId === driverId ? { ...r, [field]: value } : r))
      );
    },
    []
  );

  const handleRemoveDriver = useCallback(
    (driverId: string) => {
      removeDriver(raceId, driverId);
      setResults((prev) => prev.filter((r) => r.driverId !== driverId));
    },
    [raceId, removeDriver]
  );

  const handleAddDriver = useCallback(
    (name: string) => {
      addDriver(raceId, name);
    },
    [raceId, addDriver]
  );

  const handleSave = useCallback(() => {
    if (!session) return;
    setSaving(true);

    const savedPositions = computePositions(results);

    // Determine status based on results
    let autoStatus: SessionStatus;
    if (isQualifying) {
      const hasAnyResult = results.some((r) => r.bestLap);
      const allComplete = results.every((r) => r.bestLap);
      autoStatus = allComplete ? 'completed' : hasAnyResult ? 'in-progress' : 'not-started';
    } else {
      // Race: consider it started once we have drivers, completed once P2+ all have gaps
      const hasGaps = results.some((r, i) => i > 0 && r.gap);
      const allGaps = results.length <= 1 || results.every((r, i) => i === 0 || r.gap);
      autoStatus = allGaps && results.length > 0 ? 'completed' : hasGaps ? 'in-progress' : 'not-started';
    }

    if (isQualifying) {
      const qualResults: QualifyingResult[] = results.map((r) => ({
        driverId: r.driverId,
        driverName: r.driverName,
        position: savedPositions.get(r.driverId) ?? null,
        bestLap: formatTime(r.bestLap),
      }));
      saveQualifyingResults(raceId, qualResults, autoStatus);
    } else {
      const raceResults: RaceResult[] = results.map((r, i) => ({
        driverId: r.driverId,
        driverName: r.driverName,
        position: savedPositions.get(r.driverId) ?? null,
        bestLap: '',
        totalTime: '',
        gap: i === 0 ? '--' : formatGap(r.gap),
      }));
      saveRaceResults(raceId, raceResults, autoStatus);
    }

    setTimeout(() => {
      setSaving(false);
      setStatus(autoStatus);
    }, 300);
  }, [session, results, isQualifying, raceId, saveRaceResults, saveQualifyingResults, computePositions]);

  if (!data) {
    return (
      <div className="min-h-screen bg-[#0D0D0D] flex items-center justify-center">
        <p className="text-gray-500">Connecting...</p>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-[#0D0D0D] flex items-center justify-center">
        <p className="text-gray-400">Session not found</p>
      </div>
    );
  }

  const classColor = CLASS_COLORS[session.raceClass];

  return (
    <div className="min-h-screen bg-[#0D0D0D] pb-24">
      {/* Header */}
      <header className="bg-[#111111] sticky top-0 z-30">
        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#E10600] via-[#FFE600] to-[#E10600]" />
        <div className="flex items-center justify-between px-4 py-3">
          <button
            onClick={() => router.push('/admin')}
            className="text-white flex items-center gap-1 text-sm font-medium active:opacity-70"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back
          </button>
          <ConnectionStatus />
        </div>
        <div className="px-4 pb-3">
          <div className="flex items-center gap-2">
            <span
              className="w-3 h-3 rounded-sm flex-shrink-0"
              style={{ backgroundColor: classColor }}
            />
            {editingLabel ? (
              <input
                autoFocus
                value={labelDraft}
                onChange={(e) => setLabelDraft(e.target.value)}
                onBlur={() => {
                  if (labelDraft.trim() && labelDraft.trim() !== session.label) {
                    updateSessionLabel(raceId, labelDraft.trim());
                  }
                  setEditingLabel(false);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
                  if (e.key === 'Escape') setEditingLabel(false);
                }}
                className="bg-transparent text-white font-bold text-lg border-b border-[#FFE600] outline-none flex-1 min-w-0"
              />
            ) : (
              <h1
                className="text-white font-bold text-lg active:opacity-70"
                onClick={() => {
                  setLabelDraft(session.label);
                  setEditingLabel(true);
                }}
              >
                {session.label}
                <svg className="inline-block w-4 h-4 ml-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </h1>
            )}
          </div>
          {/* Class selector */}
          <div className="flex gap-1.5 mt-2">
            {(activeRound?.classes ?? (Object.keys(CLASS_COLORS) as RaceClass[])).map((cls) => (
              <button
                key={cls}
                onClick={() => updateSessionClass(raceId, cls)}
                className="px-2.5 py-1 rounded text-[10px] font-bold text-white transition-opacity"
                style={{
                  backgroundColor: CLASS_COLORS[cls],
                  opacity: session.raceClass === cls ? 1 : 0.25,
                }}
              >
                {CLASS_LABELS[cls]}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Driver Forms */}
      <main className="px-4 py-4 space-y-4">
        {results.map((result, index) => {
          const driver = session.drivers.find((d) => d.id === result.driverId);
          if (!driver) return null;

          return (
            <DriverResultForm
              key={result.driverId}
              driver={driver}
              raceClass={session.raceClass}
              isQualifying={isQualifying}
              position={positions.get(result.driverId) ?? null}
              result={result}
              onChange={(field, value) =>
                handleFieldChange(result.driverId, field, value)
              }
              onRemove={() => handleRemoveDriver(result.driverId)}
              onMoveUp={!isQualifying && index > 0 ? () => handleMoveUp(index) : undefined}
              onMoveDown={!isQualifying && index < results.length - 1 ? () => handleMoveDown(index) : undefined}
            />
          );
        })}

        <AddDriverInline onAdd={handleAddDriver} />
      </main>

      {/* Save Button */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-[#0D0D0D]/90 backdrop-blur border-t border-[#2A2A2A]">
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full py-4 rounded-lg font-bold text-white text-base tracking-wide active:opacity-80 disabled:opacity-50 transition-opacity"
          style={{ backgroundColor: '#E10600' }}
        >
          {saving ? 'SAVING...' : 'SAVE RESULTS'}
        </button>
      </div>
    </div>
  );
}
