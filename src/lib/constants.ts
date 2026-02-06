import { Driver, KPLRound2Data, RaceClass } from './types';

// Class colors
export const CLASS_COLORS: Record<RaceClass, string> = {
  women: '#E91E8C',
  junior: '#00B74A',
  'pro-am': '#2196F3',
  pro: '#E10600',
};

export const CLASS_LABELS: Record<RaceClass, string> = {
  women: 'Women',
  junior: 'Junior',
  'pro-am': 'Pro-Am',
  pro: 'Pro',
};

// Team drivers
function makeDriver(name: string): Driver {
  return { id: name.toLowerCase().replace(/\s+/g, '-'), name, isTeam: true };
}

const ANGGIA = makeDriver('Anggia');
const RAYDEN = makeDriver('Rayden');
const TEMMY = makeDriver('Temmy');
const EDMUND = makeDriver('Edmund');
const DEMAS = makeDriver('Demas');
const RAPHAEL = makeDriver('Raphael');

export const TEAM_DRIVERS: Record<RaceClass, Driver[]> = {
  women: [ANGGIA],
  junior: [RAYDEN],
  'pro-am': [TEMMY, EDMUND],
  pro: [DEMAS, RAPHAEL],
};

// Initial data structure
export function createInitialData(): KPLRound2Data {
  return {
    qualifying: [
      {
        id: 'qual-women',
        type: 'qualifying',
        raceClass: 'women',
        label: 'Qualifying — Women',
        drivers: [...TEAM_DRIVERS.women],
        results: [],
        status: 'not-started',
      },
      {
        id: 'qual-junior',
        type: 'qualifying',
        raceClass: 'junior',
        label: 'Qualifying — Junior',
        drivers: [...TEAM_DRIVERS.junior],
        results: [],
        status: 'not-started',
      },
      {
        id: 'qual-proam',
        type: 'qualifying',
        raceClass: 'pro-am',
        label: 'Qualifying — Pro-Am',
        drivers: [...TEAM_DRIVERS['pro-am']],
        results: [],
        status: 'not-started',
      },
      {
        id: 'qual-pro',
        type: 'qualifying',
        raceClass: 'pro',
        label: 'Qualifying — Pro',
        drivers: [...TEAM_DRIVERS.pro],
        results: [],
        status: 'not-started',
      },
    ],
    heatsAndRace1: [
      {
        id: 'race1-women',
        type: 'race',
        raceClass: 'women',
        label: 'Race 1 Women',
        drivers: [...TEAM_DRIVERS.women],
        results: [],
        status: 'not-started',
      },
      {
        id: 'pro-heat1',
        type: 'heat',
        raceClass: 'pro',
        label: 'Pro Heat 1',
        drivers: [...TEAM_DRIVERS.pro],
        results: [],
        status: 'not-started',
      },
      {
        id: 'pro-heat2',
        type: 'heat',
        raceClass: 'pro',
        label: 'Pro Heat 2',
        drivers: [...TEAM_DRIVERS.pro],
        results: [],
        status: 'not-started',
      },
      {
        id: 'pro-heat3',
        type: 'heat',
        raceClass: 'pro',
        label: 'Pro Heat 3',
        drivers: [...TEAM_DRIVERS.pro],
        results: [],
        status: 'not-started',
      },
      {
        id: 'race1-junior',
        type: 'race',
        raceClass: 'junior',
        label: 'Race 1 Junior',
        drivers: [...TEAM_DRIVERS.junior],
        results: [],
        status: 'not-started',
      },
      {
        id: 'race1-proam',
        type: 'race',
        raceClass: 'pro-am',
        label: 'Race 1 Pro-Am',
        drivers: [...TEAM_DRIVERS['pro-am']],
        results: [],
        status: 'not-started',
      },
    ],
    finalAndRace2: [
      {
        id: 'race2-women',
        type: 'race',
        raceClass: 'women',
        label: 'Race 2 Women',
        drivers: [...TEAM_DRIVERS.women],
        results: [],
        status: 'not-started',
      },
      {
        id: 'race2-junior',
        type: 'race',
        raceClass: 'junior',
        label: 'Race 2 Junior',
        drivers: [...TEAM_DRIVERS.junior],
        results: [],
        status: 'not-started',
      },
      {
        id: 'final-pro',
        type: 'final',
        raceClass: 'pro',
        label: 'Final Pro',
        drivers: [...TEAM_DRIVERS.pro],
        results: [],
        status: 'not-started',
      },
      {
        id: 'race2-proam',
        type: 'race',
        raceClass: 'pro-am',
        label: 'Race 2 Pro-Am',
        drivers: [...TEAM_DRIVERS['pro-am']],
        results: [],
        status: 'not-started',
      },
    ],
  };
}
