import { Server as SocketServer } from 'socket.io';
import * as db from './db';
import {
  RaceSavePayload,
  QualifyingSavePayload,
  DriverAddPayload,
  DriverRemovePayload,
  SessionUpdateLabelPayload,
  SessionAddPayload,
  SessionUpdateClassPayload,
  RoundAddPayload,
  RoundUpdatePayload,
  RoundDeletePayload,
} from './types';

export function initSocketServer(io: SocketServer) {
  io.on('connection', (socket) => {
    console.log(`Client connected: ${socket.id} (${io.engine.clientsCount} total)`);

    io.emit('connection:count', { count: io.engine.clientsCount });

    // --- Round events ---

    socket.on('round:list', () => {
      socket.emit('round:listResult', db.getRounds());
    });

    socket.on('round:add', (payload: RoundAddPayload) => {
      db.addRound(payload.name, payload.tabLabels, payload.classes);
      io.emit('round:listResult', db.getRounds());
    });

    socket.on('round:update', (payload: RoundUpdatePayload) => {
      const { roundId, ...updates } = payload;
      db.updateRound(roundId, updates);
      io.emit('round:listResult', db.getRounds());
    });

    socket.on('round:delete', (payload: RoundDeletePayload) => {
      db.deleteRound(payload.roundId);
      io.emit('round:listResult', db.getRounds());
    });

    // --- Data events ---

    socket.on('data:requestFull', (payload?: { roundId?: string }) => {
      socket.emit('data:fullState', db.getFullState(payload?.roundId));
    });

    socket.on('race:save', (payload: RaceSavePayload) => {
      db.saveRaceResults(payload.raceId, payload.results, payload.status);
      io.emit('race:saved', { raceId: payload.raceId, results: payload.results, status: payload.status });
    });

    socket.on('qualifying:save', (payload: QualifyingSavePayload) => {
      db.saveQualifyingResults(payload.raceId, payload.results, payload.status);
      io.emit('qualifying:saved', { raceId: payload.raceId, results: payload.results, status: payload.status });
    });

    socket.on('driver:add', (payload: DriverAddPayload) => {
      const driver = db.addDriver(payload.raceId, payload.name);
      io.emit('driver:added', { driver, raceId: payload.raceId });
    });

    socket.on('driver:remove', (payload: DriverRemovePayload) => {
      db.removeDriver(payload.raceId, payload.driverId);
      io.emit('driver:removed', { driverId: payload.driverId, raceId: payload.raceId });
    });

    socket.on('session:add', (payload: SessionAddPayload) => {
      db.addSession(payload.category, payload.type, payload.raceClass, payload.label, payload.roundId);
      const roundId = payload.roundId;
      io.emit('data:fullState', db.getFullState(roundId));
    });

    socket.on('session:updateClass', (payload: SessionUpdateClassPayload) => {
      db.updateSessionClass(payload.raceId, payload.raceClass);
      const roundId = db.getRoundIdForSession(payload.raceId);
      io.emit('data:fullState', db.getFullState(roundId ?? undefined));
    });

    socket.on('session:updateLabel', (payload: SessionUpdateLabelPayload) => {
      db.updateSessionLabel(payload.raceId, payload.label);
      io.emit('session:labelUpdated', { raceId: payload.raceId, label: payload.label });
    });

    socket.on('disconnect', () => {
      console.log(`Client disconnected: ${socket.id} (${io.engine.clientsCount} total)`);
      io.emit('connection:count', { count: io.engine.clientsCount });
    });
  });
}
