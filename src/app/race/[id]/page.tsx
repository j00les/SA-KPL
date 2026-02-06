'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import { useRaceData } from '@/hooks/useRaceData';
import { useSocket } from '@/hooks/useSocket';
import DriverResultForm from '@/components/DriverResultForm';
import AddDriverInline from '@/components/AddDriverInline';
import ConnectionStatus from '@/components/ConnectionStatus';
import {
  Session,
  QualifyingSession,
  RaceSession,
  QualifyingResult,
  RaceResult,
  Driver,
  SessionStatus,
} from '@/lib/types';
import { CLASS_COLORS } from '@/lib/constants';

interface FormResult {
  driverId: string;
  driverName: string;
  position: number | null;
  bestLap: string;
  totalTime: string;
  gap: string;
}

export default function RaceInputPage() {
  const params = useParams();
  const router = useRouter();
  const raceId = params.id as string;
  const { data, getSession, saveRaceResults, saveQualifyingResults, addDriver, removeDriver } =
    useRaceData();
  const { isConnected } = useSocket();

  const [results, setResults] = useState<FormResult[]>([]);
  const [status, setStatus] = useState<SessionStatus>('not-started');
  const [saving, setSaving] = useState(false);
  const [initialized, setInitialized] = useState(false);

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
          position: existing.position,
          bestLap: existing.bestLap || '',
          totalTime,
          gap,
        };
      }
      return {
        driverId: driver.id,
        driverName: driver.name,
        position: null,
        bestLap: '',
        totalTime: '',
        gap: '',
      };
    });

    setResults(formResults);
    setStatus(session.status);
    setInitialized(true);
  }, [session, initialized]);

  // Sync newly added/removed drivers
  useEffect(() => {
    if (!session || !initialized) return;

    const currentIds = new Set(results.map((r) => r.driverId));
    const sessionIds = new Set(session.drivers.map((d) => d.id));

    // Add new drivers
    const newDrivers = session.drivers.filter((d) => !currentIds.has(d.id));
    if (newDrivers.length > 0) {
      setResults((prev) => [
        ...prev,
        ...newDrivers.map((d) => ({
          driverId: d.id,
          driverName: d.name,
          position: null,
          bestLap: '',
          totalTime: '',
          gap: '',
        })),
      ]);
    }

    // Remove deleted drivers
    const removedIds = [...currentIds].filter((id) => !sessionIds.has(id));
    if (removedIds.length > 0) {
      setResults((prev) => prev.filter((r) => !removedIds.includes(r.driverId)));
    }
  }, [session?.drivers, initialized]);

  const handleFieldChange = useCallback(
    (driverId: string, field: string, value: string | number | null) => {
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

    // Determine status based on results
    const hasAnyResult = results.some((r) => r.position !== null || r.bestLap);
    const allComplete = results.every((r) => r.position !== null && r.bestLap);
    const autoStatus: SessionStatus = allComplete
      ? 'completed'
      : hasAnyResult
        ? 'in-progress'
        : 'not-started';

    if (isQualifying) {
      const qualResults: QualifyingResult[] = results.map((r) => ({
        driverId: r.driverId,
        driverName: r.driverName,
        position: r.position,
        bestLap: r.bestLap,
      }));
      saveQualifyingResults(raceId, qualResults, autoStatus);
    } else {
      const raceResults: RaceResult[] = results.map((r) => ({
        driverId: r.driverId,
        driverName: r.driverName,
        position: r.position,
        bestLap: r.bestLap,
        totalTime: r.totalTime,
        gap: r.gap || '--',
      }));
      saveRaceResults(raceId, raceResults, autoStatus);
    }

    setTimeout(() => {
      setSaving(false);
      setStatus(autoStatus);
    }, 300);
  }, [session, results, isQualifying, raceId, saveRaceResults, saveQualifyingResults]);

  if (!data) {
    return (
      <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center">
        <p className="text-gray-400">Connecting...</p>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center">
        <p className="text-gray-500">Session not found</p>
      </div>
    );
  }

  const classColor = CLASS_COLORS[session.raceClass];
  const subtitle = isQualifying
    ? `${(session as QualifyingSession).duration} session`
    : `${(session as RaceSession).laps} Laps`;

  return (
    <div className="min-h-screen bg-[#F5F5F5] pb-24">
      {/* Header */}
      <header className="bg-[#2D2D2D] sticky top-0 z-30">
        <div className="flex items-center justify-between px-4 py-3">
          <button
            onClick={() => router.push('/')}
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
              className="w-3 h-3 rounded-sm"
              style={{ backgroundColor: classColor }}
            />
            <h1 className="text-white font-bold text-lg">{session.label}</h1>
          </div>
          <p className="text-gray-400 text-sm mt-0.5 ml-5">{subtitle}</p>
        </div>
      </header>

      {/* Driver Forms */}
      <main className="px-4 py-4 space-y-4">
        {results.map((result) => {
          const driver = session.drivers.find((d) => d.id === result.driverId);
          if (!driver) return null;

          return (
            <DriverResultForm
              key={result.driverId}
              driver={driver}
              raceClass={session.raceClass}
              isQualifying={isQualifying}
              result={result}
              onChange={(field, value) =>
                handleFieldChange(result.driverId, field, value)
              }
              onRemove={
                !driver.isTeam
                  ? () => handleRemoveDriver(result.driverId)
                  : undefined
              }
            />
          );
        })}

        <AddDriverInline onAdd={handleAddDriver} />
      </main>

      {/* Save Button */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/90 backdrop-blur border-t border-gray-200">
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
