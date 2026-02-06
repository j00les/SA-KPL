import { Server as SocketServer } from 'socket.io';
import { loadData, saveData, findSession, findSessionCategory } from './storage';
import {
  KPLRound2Data,
  RaceSavePayload,
  QualifyingSavePayload,
  DriverAddPayload,
  DriverRemovePayload,
  QualifyingSession,
  RaceSession,
  Driver,
} from './types';

let data: KPLRound2Data;

export function initSocketServer(io: SocketServer) {
  data = loadData();

  io.on('connection', (socket) => {
    console.log(`Client connected: ${socket.id} (${io.engine.clientsCount} total)`);

    // Send full state on connect
    socket.emit('data:fullState', data);
    io.emit('connection:count', { count: io.engine.clientsCount });

    // Handle full state request
    socket.on('data:requestFull', () => {
      socket.emit('data:fullState', data);
    });

    // Save race/heat/final results
    socket.on('race:save', (payload: RaceSavePayload) => {
      const category = findSessionCategory(data, payload.raceId);
      if (!category || category === 'qualifying') return;

      const sessions = data[category] as RaceSession[];
      const session = sessions.find((s) => s.id === payload.raceId);
      if (!session) return;

      session.results = payload.results;
      session.status = payload.status;
      saveData(data);

      io.emit('race:saved', { raceId: payload.raceId, results: payload.results, status: payload.status });
    });

    // Save qualifying results
    socket.on('qualifying:save', (payload: QualifyingSavePayload) => {
      const session = data.qualifying.find((s) => s.id === payload.raceId);
      if (!session) return;

      session.results = payload.results;
      session.status = payload.status;
      saveData(data);

      io.emit('qualifying:saved', { raceId: payload.raceId, results: payload.results, status: payload.status });
    });

    // Add driver to a session
    socket.on('driver:add', (payload: DriverAddPayload) => {
      const newDriver: Driver = {
        id: `added-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        name: payload.name,
        isTeam: false,
      };

      const allArrays: (QualifyingSession[] | RaceSession[])[] = [
        data.qualifying,
        data.heatsAndRace1,
        data.finalAndRace2,
      ];

      for (const arr of allArrays) {
        const session = arr.find((s) => s.id === payload.raceId);
        if (session) {
          session.drivers.push(newDriver);
          saveData(data);
          io.emit('driver:added', { driver: newDriver, raceId: payload.raceId });
          return;
        }
      }
    });

    // Remove driver from a session
    socket.on('driver:remove', (payload: DriverRemovePayload) => {
      const allArrays: (QualifyingSession[] | RaceSession[])[] = [
        data.qualifying,
        data.heatsAndRace1,
        data.finalAndRace2,
      ];

      for (const arr of allArrays) {
        const session = arr.find((s) => s.id === payload.raceId);
        if (session) {
          session.drivers = session.drivers.filter((d) => d.id !== payload.driverId);
          // Also remove their results
          session.results = session.results.filter((r) => r.driverId !== payload.driverId);
          saveData(data);
          io.emit('driver:removed', { driverId: payload.driverId, raceId: payload.raceId });
          return;
        }
      }
    });

    socket.on('disconnect', () => {
      console.log(`Client disconnected: ${socket.id} (${io.engine.clientsCount} total)`);
      io.emit('connection:count', { count: io.engine.clientsCount });
    });
  });
}
