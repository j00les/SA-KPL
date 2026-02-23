'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useSocketContext } from '@/context/SocketContext';
import {
  KPLData,
  Session,
  RaceResult,
  QualifyingResult,
  Driver,
  Round,
  SessionStatus,
  SessionType,
  RaceClass,
} from '@/lib/types';

export function useRaceData() {
  const { socket } = useSocketContext();
  const [data, setData] = useState<KPLData | null>(null);
  const [rounds, setRounds] = useState<Round[]>([]);
  const [activeRoundId, setActiveRoundId] = useState<string | null>(null);
  const activeRoundIdRef = useRef<string | null>(null);

  // Keep ref in sync
  useEffect(() => {
    activeRoundIdRef.current = activeRoundId;
  }, [activeRoundId]);

  useEffect(() => {
    if (!socket) return;

    // Request rounds list on connect
    socket.emit('round:list');

    socket.on('round:listResult', (roundList: Round[]) => {
      setRounds(roundList);

      // Auto-select last round if no round selected yet
      if (!activeRoundIdRef.current && roundList.length > 0) {
        const lastRound = roundList[roundList.length - 1];
        activeRoundIdRef.current = lastRound.id;
        setActiveRoundId(lastRound.id);
        socket.emit('data:requestFull', { roundId: lastRound.id });
      }
    });

    socket.on('data:fullState', (fullData: KPLData) => {
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

    socket.on('session:labelUpdated', ({ raceId, label }: { raceId: string; label: string }) => {
      setData((prev) => {
        if (!prev) return prev;
        const updateLabel = <T extends { id: string; label: string }>(sessions: T[]) =>
          sessions.map((s) => (s.id === raceId ? { ...s, label } : s));
        return {
          qualifying: updateLabel(prev.qualifying),
          heatsAndRace1: updateLabel(prev.heatsAndRace1),
          finalAndRace2: updateLabel(prev.finalAndRace2),
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
      socket.off('round:listResult');
      socket.off('data:fullState');
      socket.off('race:saved');
      socket.off('qualifying:saved');
      socket.off('driver:added');
      socket.off('driver:removed');
      socket.off('session:labelUpdated');
    };
  }, [socket]);

  const setActiveRound = useCallback(
    (roundId: string) => {
      setActiveRoundId(roundId);
      activeRoundIdRef.current = roundId;
      setData(null); // clear stale data while loading
      if (socket) {
        socket.emit('data:requestFull', { roundId });
      }
    },
    [socket]
  );

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

  const updateSessionLabel = useCallback(
    (raceId: string, label: string) => {
      if (!socket) return;
      socket.emit('session:updateLabel', { raceId, label });
    },
    [socket]
  );

  const addSession = useCallback(
    (category: 'qualifying' | 'heatsAndRace1' | 'finalAndRace2', type: SessionType, raceClass: RaceClass, label: string) => {
      if (!socket || !activeRoundIdRef.current) return;
      socket.emit('session:add', { category, type, raceClass, label, roundId: activeRoundIdRef.current });
    },
    [socket]
  );

  const updateSessionClass = useCallback(
    (raceId: string, raceClass: RaceClass) => {
      if (!socket) return;
      socket.emit('session:updateClass', { raceId, raceClass });
    },
    [socket]
  );

  // Round management
  const addRound = useCallback(
    (name: string, tabLabels?: [string, string, string], classes?: RaceClass[]) => {
      if (!socket) return;
      socket.emit('round:add', { name, tabLabels, classes });
    },
    [socket]
  );

  const updateRound = useCallback(
    (roundId: string, updates: { name?: string; tabLabels?: [string, string, string]; classes?: RaceClass[] }) => {
      if (!socket) return;
      socket.emit('round:update', { roundId, ...updates });
    },
    [socket]
  );

  const deleteRound = useCallback(
    (roundId: string) => {
      if (!socket) return;
      socket.emit('round:delete', { roundId });
    },
    [socket]
  );

  const activeRound = rounds.find((r) => r.id === activeRoundId) ?? null;

  return {
    data,
    rounds,
    activeRoundId,
    activeRound,
    setActiveRound,
    getSession,
    saveRaceResults,
    saveQualifyingResults,
    addDriver,
    removeDriver,
    updateSessionLabel,
    addSession,
    updateSessionClass,
    addRound,
    updateRound,
    deleteRound,
  };
}
