'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSocketContext } from '@/context/SocketContext';
import {
  KPLRound2Data,
  Session,
  RaceResult,
  QualifyingResult,
  Driver,
  SessionStatus,
} from '@/lib/types';

export function useRaceData() {
  const { socket } = useSocketContext();
  const [data, setData] = useState<KPLRound2Data | null>(null);

  useEffect(() => {
    if (!socket) return;

    // Request full state on connect
    socket.emit('data:requestFull');

    socket.on('data:fullState', (fullData: KPLRound2Data) => {
      setData(fullData);
    });

    socket.on('race:saved', ({ raceId, results, status }: { raceId: string; results: RaceResult[]; status: SessionStatus }) => {
      setData((prev) => {
        if (!prev) return prev;
        const updated = { ...prev };
        for (const key of ['heatsAndRace1', 'finalAndRace2'] as const) {
          updated[key] = updated[key].map((s) =>
            s.id === raceId ? { ...s, results, status } : s
          );
        }
        return updated;
      });
    });

    socket.on('qualifying:saved', ({ raceId, results, status }: { raceId: string; results: QualifyingResult[]; status: SessionStatus }) => {
      setData((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          qualifying: prev.qualifying.map((s) =>
            s.id === raceId ? { ...s, results, status } : s
          ),
        };
      });
    });

    socket.on('driver:added', ({ driver, raceId }: { driver: Driver; raceId: string }) => {
      setData((prev) => {
        if (!prev) return prev;
        return {
          qualifying: prev.qualifying.map((s) =>
            s.id === raceId ? { ...s, drivers: [...s.drivers, driver] } : s
          ),
          heatsAndRace1: prev.heatsAndRace1.map((s) =>
            s.id === raceId ? { ...s, drivers: [...s.drivers, driver] } : s
          ),
          finalAndRace2: prev.finalAndRace2.map((s) =>
            s.id === raceId ? { ...s, drivers: [...s.drivers, driver] } : s
          ),
        };
      });
    });

    socket.on('driver:removed', ({ driverId, raceId }: { driverId: string; raceId: string }) => {
      setData((prev) => {
        if (!prev) return prev;
        return {
          qualifying: prev.qualifying.map((s) =>
            s.id === raceId
              ? { ...s, drivers: s.drivers.filter((d) => d.id !== driverId), results: s.results.filter((r) => r.driverId !== driverId) }
              : s
          ),
          heatsAndRace1: prev.heatsAndRace1.map((s) =>
            s.id === raceId
              ? { ...s, drivers: s.drivers.filter((d) => d.id !== driverId), results: s.results.filter((r) => r.driverId !== driverId) }
              : s
          ),
          finalAndRace2: prev.finalAndRace2.map((s) =>
            s.id === raceId
              ? { ...s, drivers: s.drivers.filter((d) => d.id !== driverId), results: s.results.filter((r) => r.driverId !== driverId) }
              : s
          ),
        };
      });
    });

    return () => {
      socket.off('data:fullState');
      socket.off('race:saved');
      socket.off('qualifying:saved');
      socket.off('driver:added');
      socket.off('driver:removed');
    };
  }, [socket]);

  const getSession = useCallback(
    (raceId: string): Session | null => {
      if (!data) return null;
      const all = [...data.qualifying, ...data.heatsAndRace1, ...data.finalAndRace2];
      return all.find((s) => s.id === raceId) ?? null;
    },
    [data]
  );

  const saveRaceResults = useCallback(
    (raceId: string, results: RaceResult[], status: SessionStatus) => {
      if (!socket) return;
      socket.emit('race:save', { raceId, results, status });
    },
    [socket]
  );

  const saveQualifyingResults = useCallback(
    (raceId: string, results: QualifyingResult[], status: SessionStatus) => {
      if (!socket) return;
      socket.emit('qualifying:save', { raceId, results, status });
    },
    [socket]
  );

  const addDriver = useCallback(
    (raceId: string, name: string) => {
      if (!socket) return;
      socket.emit('driver:add', { name, raceId });
    },
    [socket]
  );

  const removeDriver = useCallback(
    (raceId: string, driverId: string) => {
      if (!socket) return;
      socket.emit('driver:remove', { driverId, raceId });
    },
    [socket]
  );

  return {
    data,
    getSession,
    saveRaceResults,
    saveQualifyingResults,
    addDriver,
    removeDriver,
  };
}
