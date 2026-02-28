export type RaceClass = 'women' | 'junior' | 'pro-am' | 'pro';

export type SessionType = 'qualifying' | 'heat' | 'race' | 'final';

export type SessionStatus = 'not-started' | 'in-progress' | 'completed';

export interface Driver {
  id: string;
  name: string;
  isTeam: boolean; // true = our team driver, false = added competitor
}

export interface QualifyingResult {
  driverId: string;
  driverName: string;
  position: number | null;
  bestLap: string; // "0:42.350"
}

export interface RaceResult {
  driverId: string;
  driverName: string;
  position: number | null;
  bestLap: string;
  totalTime: string; // "7:12.500"
  gap: string; // "+5.700" or "--"
  lapCount?: number; // Individual driver lap count for endurance
  teamLapCount?: number; // Team total lap count for endurance
}

export interface QualifyingSession {
  id: string;
  type: 'qualifying';
  raceClass: RaceClass;
  label: string;
  drivers: Driver[];
  results: QualifyingResult[];
  status: SessionStatus;
}

export interface RaceSession {
  id: string;
  type: SessionType;
  raceClass: RaceClass;
  label: string;
  drivers: Driver[];
  results: RaceResult[];
  status: SessionStatus;
  isEndurance: boolean; // Flag for endurance sessions
}

export type Session = QualifyingSession | RaceSession;

export interface KPLData {
  qualifying: QualifyingSession[];
  heatsAndRace1: RaceSession[];
  finalAndRace2: RaceSession[];
}

export interface Round {
  id: string;
  name: string;
  tabLabels: [string, string, string];
  classes: RaceClass[];
}

export interface RoundAddPayload {
  name: string;
  tabLabels?: [string, string, string];
  classes?: RaceClass[];
}

export interface RoundUpdatePayload {
  roundId: string;
  name?: string;
  tabLabels?: [string, string, string];
  classes?: RaceClass[];
}
export interface RoundDeletePayload { roundId: string }

// Socket event payloads
export interface RaceSavePayload {
  raceId: string;
  results: RaceResult[];
  status: SessionStatus;
}

export interface QualifyingSavePayload {
  raceId: string;
  results: QualifyingResult[];
  status: SessionStatus;
}

export interface DriverAddPayload {
  name: string;
  raceId: string;
}

export interface DriverRemovePayload {
  driverId: string;
  raceId: string;
}

export interface SessionUpdateLabelPayload {
  raceId: string;
  label: string;
}

export interface SessionAddPayload {
  category: 'qualifying' | 'heatsAndRace1' | 'finalAndRace2';
  type: SessionType;
  raceClass: RaceClass;
  label: string;
  roundId: string;
}

export interface SessionUpdateClassPayload {
  raceId: string;
  raceClass: RaceClass;
}
