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
}

export interface QualifyingSession {
  id: string;
  type: 'qualifying';
  raceClass: RaceClass;
  label: string;
  duration: string; // "7m 30s"
  drivers: Driver[];
  results: QualifyingResult[];
  status: SessionStatus;
}

export interface RaceSession {
  id: string;
  type: SessionType;
  raceClass: RaceClass;
  label: string;
  laps: number;
  drivers: Driver[];
  results: RaceResult[];
  status: SessionStatus;
}

export type Session = QualifyingSession | RaceSession;

export interface KPLRound2Data {
  qualifying: QualifyingSession[];
  heatsAndRace1: RaceSession[];
  finalAndRace2: RaceSession[];
}

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
