'use client';

import { RaceClass } from '@/lib/types';
import { CLASS_COLORS } from '@/lib/constants';

interface DriverBadgeProps {
  name: string;
  isTeam: boolean;
  raceClass: RaceClass;
}

export default function DriverBadge({ name, isTeam, raceClass }: DriverBadgeProps) {
  const classColor = CLASS_COLORS[raceClass];

  if (isTeam) {
    return (
      <span
        className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold text-white uppercase tracking-wide"
        style={{ backgroundColor: classColor }}
      >
        <span
          className="h-1.5 w-1.5 rounded-full bg-white/60"
          aria-hidden="true"
        />
        {name}
      </span>
    );
  }

  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full border border-gray-300 bg-white px-3 py-1 text-xs font-medium text-gray-700 uppercase tracking-wide"
    >
      <span
        className="h-1.5 w-1.5 rounded-full"
        style={{ backgroundColor: classColor }}
        aria-hidden="true"
      />
      {name}
      <span className="text-gray-400 normal-case">(added)</span>
    </span>
  );
}
