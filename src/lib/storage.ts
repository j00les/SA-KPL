import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { KPLRound2Data } from './types';
import { createInitialData } from './constants';

const DATA_DIR = join(process.cwd(), 'data');
const DATA_FILE = join(DATA_DIR, 'kpl-round2.json');

export function loadData(): KPLRound2Data {
  try {
    if (existsSync(DATA_FILE)) {
      const raw = readFileSync(DATA_FILE, 'utf-8');
      return JSON.parse(raw) as KPLRound2Data;
    }
  } catch (e) {
    console.error('Error loading data, initializing fresh:', e);
  }

  const initial = createInitialData();
  saveData(initial);
  return initial;
}

export function saveData(data: KPLRound2Data): void {
  if (!existsSync(DATA_DIR)) {
    mkdirSync(DATA_DIR, { recursive: true });
  }
  writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

export function findSession(data: KPLRound2Data, raceId: string) {
  const allSessions = [
    ...data.qualifying,
    ...data.heatsAndRace1,
    ...data.finalAndRace2,
  ];
  return allSessions.find((s) => s.id === raceId) ?? null;
}

export function findSessionCategory(data: KPLRound2Data, raceId: string): 'qualifying' | 'heatsAndRace1' | 'finalAndRace2' | null {
  if (data.qualifying.some((s) => s.id === raceId)) return 'qualifying';
  if (data.heatsAndRace1.some((s) => s.id === raceId)) return 'heatsAndRace1';
  if (data.finalAndRace2.some((s) => s.id === raceId)) return 'finalAndRace2';
  return null;
}
