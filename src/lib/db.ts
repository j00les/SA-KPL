import { Database } from 'bun:sqlite';
import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import {
  KPLData,
  QualifyingSession,
  RaceSession,
  QualifyingResult,
  RaceResult,
  Driver,
  Round,
  SessionType,
  SessionStatus,
  RaceClass,
} from './types';

const DATA_DIR = join(process.cwd(), 'data');
const DB_PATH = join(DATA_DIR, 'kpl.db');

let db: Database;

export function initDB() {
  if (!existsSync(DATA_DIR)) {
    mkdirSync(DATA_DIR, { recursive: true });
  }

  db = new Database(DB_PATH);
  db.exec('PRAGMA journal_mode = WAL');
  db.exec('PRAGMA foreign_keys = ON');

  // Create rounds table
  db.exec(`
    CREATE TABLE IF NOT EXISTS rounds (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL,
      race_class TEXT NOT NULL,
      label TEXT NOT NULL,
      category TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'not-started',
      sort_order INTEGER NOT NULL DEFAULT 0
    )
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS drivers (
      id TEXT PRIMARY KEY,
      session_id TEXT NOT NULL,
      name TEXT NOT NULL,
      sort_order INTEGER NOT NULL DEFAULT 0,
      FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE
    )
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS results (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_id TEXT NOT NULL,
      driver_id TEXT NOT NULL,
      driver_name TEXT NOT NULL,
      position INTEGER,
      best_lap TEXT NOT NULL DEFAULT '',
      total_time TEXT NOT NULL DEFAULT '',
      gap TEXT NOT NULL DEFAULT '',
      FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE,
      UNIQUE(session_id, driver_id)
    )
  `);

  // Migration: add round_id column to sessions if it doesn't exist
  const columns = db.query("PRAGMA table_info(sessions)").all() as { name: string }[];
  const hasRoundId = columns.some((c) => c.name === 'round_id');
  if (!hasRoundId) {
    db.exec('ALTER TABLE sessions ADD COLUMN round_id TEXT REFERENCES rounds(id) ON DELETE CASCADE');
  }

  // Migration: add tab labels and classes to rounds
  const roundCols = db.query("PRAGMA table_info(rounds)").all() as { name: string }[];
  const hasTabLabels = roundCols.some((c) => c.name === 'tab1_label');
  if (!hasTabLabels) {
    // Capture existing round IDs before migration (these are pre-R3 rounds)
    const existingRoundIds = (db.query('SELECT id FROM rounds').all() as { id: string }[]).map((r) => r.id);

    // New rounds default to R3 format
    db.exec("ALTER TABLE rounds ADD COLUMN tab1_label TEXT NOT NULL DEFAULT 'Qualifying'");
    db.exec("ALTER TABLE rounds ADD COLUMN tab2_label TEXT NOT NULL DEFAULT 'Super Sprint'");
    db.exec("ALTER TABLE rounds ADD COLUMN tab3_label TEXT NOT NULL DEFAULT 'Endurance'");
    db.exec(`ALTER TABLE rounds ADD COLUMN classes TEXT NOT NULL DEFAULT '["junior","pro"]'`);

    // Existing rounds keep R2 format
    for (const id of existingRoundIds) {
      db.query("UPDATE rounds SET tab2_label = 'Heats & Race 1', tab3_label = 'Final & Race 2', classes = ? WHERE id = ?")
        .run(JSON.stringify(['women', 'junior', 'pro-am', 'pro']), id);
    }
  }

  // Migration: assign orphan sessions to "Round 2"
  const orphanCount = (db.query('SELECT COUNT(*) as c FROM sessions WHERE round_id IS NULL').get() as { c: number }).c;
  if (orphanCount > 0) {
    const roundId = `round-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    db.query('INSERT INTO rounds (id, name, sort_order) VALUES (?, ?, ?)').run(roundId, 'Round 2', 0);
    db.query('UPDATE sessions SET round_id = ? WHERE round_id IS NULL').run(roundId);
    console.log(`Migrated ${orphanCount} orphan sessions to "Round 2" (${roundId})`);
  }

  // Migration: add lap count columns to results
  const resultsCols = db.query("PRAGMA table_info(results)").all() as { name: string }[];
  const hasLapCount = resultsCols.some((c) => c.name === 'lap_count');
  if (!hasLapCount) {
    db.exec('ALTER TABLE results ADD COLUMN lap_count INTEGER DEFAULT 0');
  }
  const hasTeamLapCount = resultsCols.some((c) => c.name === 'team_lap_count');
  if (!hasTeamLapCount) {
    db.exec('ALTER TABLE results ADD COLUMN team_lap_count INTEGER DEFAULT 0');
  }

  // Migration: add is_endurance flag to sessions
  const sessionsCols = db.query("PRAGMA table_info(sessions)").all() as { name: string }[];
  const hasIsEndurance = sessionsCols.some((c) => c.name === 'is_endurance');
  if (!hasIsEndurance) {
    db.exec('ALTER TABLE sessions ADD COLUMN is_endurance BOOLEAN DEFAULT 0');
  }

  // Migration: mark existing finalAndRace2 sessions as endurance
  db.query('UPDATE sessions SET is_endurance = 1 WHERE category = ?').run('finalAndRace2');

  console.log('SQLite database initialized at', DB_PATH);
}

// --- Round CRUD ---

export function getRounds(): Round[] {
  const rows = db.query('SELECT id, name, tab1_label, tab2_label, tab3_label, classes FROM rounds ORDER BY sort_order, rowid').all() as {
    id: string;
    name: string;
    tab1_label: string;
    tab2_label: string;
    tab3_label: string;
    classes: string;
  }[];
  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    tabLabels: [r.tab1_label, r.tab2_label, r.tab3_label] as [string, string, string],
    classes: JSON.parse(r.classes) as RaceClass[],
  }));
}

export function addRound(
  name: string,
  tabLabels?: [string, string, string],
  classes?: RaceClass[],
): Round {
  const id = `round-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  const maxOrder = (db.query('SELECT MAX(sort_order) as m FROM rounds').get() as { m: number | null })?.m ?? -1;
  const labels = tabLabels ?? ['Qualifying', 'Super Sprint', 'Endurance'];
  const cls = classes ?? ['junior', 'pro'];
  db.query('INSERT INTO rounds (id, name, sort_order, tab1_label, tab2_label, tab3_label, classes) VALUES (?, ?, ?, ?, ?, ?, ?)').run(
    id, name, maxOrder + 1, labels[0], labels[1], labels[2], JSON.stringify(cls),
  );
  return { id, name, tabLabels: labels as [string, string, string], classes: cls };
}

export function updateRound(
  id: string,
  updates: { name?: string; tabLabels?: [string, string, string]; classes?: RaceClass[] },
) {
  const sets: string[] = [];
  const values: (string)[] = [];
  if (updates.name !== undefined) {
    sets.push('name = ?');
    values.push(updates.name);
  }
  if (updates.tabLabels) {
    sets.push('tab1_label = ?', 'tab2_label = ?', 'tab3_label = ?');
    values.push(updates.tabLabels[0], updates.tabLabels[1], updates.tabLabels[2]);
  }
  if (updates.classes) {
    sets.push('classes = ?');
    values.push(JSON.stringify(updates.classes));
  }
  if (sets.length === 0) return;
  values.push(id);
  db.query(`UPDATE rounds SET ${sets.join(', ')} WHERE id = ?`).run(...values);
}

export function deleteRound(id: string) {
  // CASCADE will delete sessions -> drivers/results
  db.query('DELETE FROM rounds WHERE id = ?').run(id);
}

// --- Session / Data ---

export function getFullState(roundId?: string): KPLData {
  const query = roundId
    ? 'SELECT * FROM sessions WHERE round_id = ? ORDER BY sort_order, rowid'
    : 'SELECT * FROM sessions ORDER BY sort_order, rowid';

  const sessions = (roundId
    ? db.query(query).all(roundId)
    : db.query(query).all()) as {
    id: string;
    type: SessionType;
    race_class: RaceClass;
    label: string;
    category: string;
    status: SessionStatus;
    round_id: string | null;
    is_endurance: number;
  }[];

  const qualifying: QualifyingSession[] = [];
  const heatsAndRace1: RaceSession[] = [];
  const finalAndRace2: RaceSession[] = [];

  for (const s of sessions) {
    const drivers = db.query('SELECT id, name FROM drivers WHERE session_id = ? ORDER BY sort_order, rowid').all(s.id) as { id: string; name: string }[];
    const driverList: Driver[] = drivers.map((d) => ({ id: d.id, name: d.name, isTeam: false }));

    if (s.type === 'qualifying') {
      const results = db.query('SELECT driver_id, driver_name, position, best_lap FROM results WHERE session_id = ? ORDER BY position NULLS LAST').all(s.id) as {
        driver_id: string;
        driver_name: string;
        position: number | null;
        best_lap: string;
      }[];

      qualifying.push({
        id: s.id,
        type: 'qualifying',
        raceClass: s.race_class,
        label: s.label,
        drivers: driverList,
        results: results.map((r) => ({
          driverId: r.driver_id,
          driverName: r.driver_name,
          position: r.position,
          bestLap: r.best_lap,
        })),
        status: s.status,
      });
    } else {
      const results = db.query('SELECT driver_id, driver_name, position, best_lap, total_time, gap, lap_count, team_lap_count FROM results WHERE session_id = ? ORDER BY position NULLS LAST').all(s.id) as {
        driver_id: string;
        driver_name: string;
        position: number | null;
        best_lap: string;
        total_time: string;
        gap: string;
        lap_count: number;
        team_lap_count: number;
      }[];

      const session: RaceSession = {
        id: s.id,
        type: s.type,
        raceClass: s.race_class,
        label: s.label,
        drivers: driverList,
        results: results.map((r) => ({
          driverId: r.driver_id,
          driverName: r.driver_name,
          position: r.position,
          bestLap: r.best_lap,
          totalTime: r.total_time,
          gap: r.gap,
          lapCount: r.lap_count,
          teamLapCount: r.team_lap_count,
        })),
        status: s.status,
        isEndurance: Boolean(s.is_endurance),
      };

      if (s.category === 'heatsAndRace1') {
        heatsAndRace1.push(session);
      } else {
        finalAndRace2.push(session);
      }
    }
  }

  return { qualifying, heatsAndRace1, finalAndRace2 };
}

export function addSession(category: string, type: SessionType, raceClass: RaceClass, label: string, roundId?: string): string {
  const id = `session-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  const maxOrder = (db.query('SELECT MAX(sort_order) as m FROM sessions WHERE category = ?').get(category) as { m: number | null })?.m ?? -1;

  // Determine if endurance: category is finalAndRace2 (tab 3 is always endurance)
  const isEndurance = category === 'finalAndRace2';

  db.query('INSERT INTO sessions (id, type, race_class, label, category, status, sort_order, round_id, is_endurance) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)').run(
    id,
    type,
    raceClass,
    label,
    category,
    'not-started',
    maxOrder + 1,
    roundId ?? null,
    isEndurance ? 1 : 0,
  );
  return id;
}

export function getRoundIdForSession(sessionId: string): string | null {
  const row = db.query('SELECT round_id FROM sessions WHERE id = ?').get(sessionId) as { round_id: string | null } | null;
  return row?.round_id ?? null;
}

export function updateSessionLabel(raceId: string, label: string) {
  db.query('UPDATE sessions SET label = ? WHERE id = ?').run(label, raceId);
}

export function updateSessionClass(raceId: string, raceClass: RaceClass) {
  db.query('UPDATE sessions SET race_class = ? WHERE id = ?').run(raceClass, raceId);
}

export function addDriver(raceId: string, name: string): Driver {
  const id = `added-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  const maxOrder = (db.query('SELECT MAX(sort_order) as m FROM drivers WHERE session_id = ?').get(raceId) as { m: number | null })?.m ?? -1;

  db.query('INSERT INTO drivers (id, session_id, name, sort_order) VALUES (?, ?, ?, ?)').run(id, raceId, name, maxOrder + 1);
  return { id, name, isTeam: false };
}

export function removeDriver(raceId: string, driverId: string) {
  db.query('DELETE FROM drivers WHERE id = ? AND session_id = ?').run(driverId, raceId);
  db.query('DELETE FROM results WHERE driver_id = ? AND session_id = ?').run(driverId, raceId);
}

export function saveQualifyingResults(raceId: string, results: QualifyingResult[], status: SessionStatus) {
  const tx = db.transaction(() => {
    db.query('UPDATE sessions SET status = ? WHERE id = ?').run(status, raceId);
    db.query('DELETE FROM results WHERE session_id = ?').run(raceId);

    const insert = db.query('INSERT INTO results (session_id, driver_id, driver_name, position, best_lap) VALUES (?, ?, ?, ?, ?)');
    for (const r of results) {
      insert.run(raceId, r.driverId, r.driverName, r.position, r.bestLap);
    }
  });
  tx();
}

export function saveRaceResults(raceId: string, results: RaceResult[], status: SessionStatus) {
  const tx = db.transaction(() => {
    db.query('UPDATE sessions SET status = ? WHERE id = ?').run(status, raceId);
    db.query('DELETE FROM results WHERE session_id = ?').run(raceId);

    const insert = db.query('INSERT INTO results (session_id, driver_id, driver_name, position, best_lap, total_time, gap, lap_count, team_lap_count) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)');
    for (const r of results) {
      insert.run(raceId, r.driverId, r.driverName, r.position, r.bestLap, r.totalTime, r.gap, r.lapCount ?? 0, r.teamLapCount ?? 0);
    }
  });
  tx();
}

export function getSessionIsEndurance(sessionId: string): boolean {
  const row = db.query('SELECT is_endurance FROM sessions WHERE id = ?').get(sessionId) as { is_endurance: number } | null;
  return Boolean(row?.is_endurance);
}

export function setSessionEndurance(sessionId: string, isEndurance: boolean) {
  db.query('UPDATE sessions SET is_endurance = ? WHERE id = ?').run(isEndurance ? 1 : 0, sessionId);
}
