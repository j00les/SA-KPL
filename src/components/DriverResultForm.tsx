'use client';

import { Driver, RaceClass } from '@/lib/types';
import { CLASS_COLORS } from '@/lib/constants';
import { formatTime } from '@/lib/time-utils';

interface DriverResultFormProps {
  driver: Driver;
  raceClass: RaceClass;
  isQualifying: boolean;
  isEndurance?: boolean;
  position: number | null;
  result: {
    bestLap: string;
    totalTime: string;
    gap: string;
    lapCount?: number;
    teamLapCount?: number;
  };
  onChange: (field: string, value: string | number) => void;
  onRemove?: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
}

export default function DriverResultForm({
  driver,
  raceClass,
  isQualifying,
  isEndurance,
  position,
  result,
  onChange,
  onRemove,
  onMoveUp,
  onMoveDown,
}: DriverResultFormProps) {
  const classColor = CLASS_COLORS[raceClass];

  const handleTimeChange = (field: string, value: string) => {
    // If formatted (has : or .), allow free editing within the format
    // If raw digits only, cap at 7
    const hasFormatting = /[:.]/.test(value);
    if (!hasFormatting) {
      const digitsOnly = value.replace(/[^\d]/g, '');
      if (digitsOnly.length > 7) return;
    }
    onChange(field, value);
  };

  const handleTimeBlur = (field: string, value: string) => {
    if (!value) return;
    const formatted = formatTime(value);
    if (formatted && formatted !== value) {
      onChange(field, formatted);
    }
  };

  return (
    <div
      className="rounded-lg bg-[#1A1A1A] card-clip overflow-hidden"
      style={{ borderLeft: `4px solid ${classColor}` }}
    >
      {/* Driver header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#2A2A2A] carbon-texture">
        <div className="flex items-center gap-2">
          {position !== null && (
            <span
              className="flex h-7 w-7 items-center justify-center rounded text-xs font-bold text-white"
              style={{ backgroundColor: classColor }}
            >
              P{position}
            </span>
          )}
          <span className="text-sm font-bold uppercase tracking-wide text-gray-100">
            {driver.name}
          </span>
        </div>
        <div className="flex items-center gap-1">
          {/* Move up/down buttons for race sessions */}
          {!isQualifying && (
            <>
              <button
                type="button"
                onClick={onMoveUp}
                disabled={!onMoveUp}
                className="flex h-8 w-8 items-center justify-center rounded-full text-gray-500 hover:bg-[#2A2A2A] hover:text-gray-300 transition-colors disabled:opacity-20 disabled:hover:bg-transparent"
                aria-label="Move up"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                </svg>
              </button>
              <button
                type="button"
                onClick={onMoveDown}
                disabled={!onMoveDown}
                className="flex h-8 w-8 items-center justify-center rounded-full text-gray-500 hover:bg-[#2A2A2A] hover:text-gray-300 transition-colors disabled:opacity-20 disabled:hover:bg-transparent"
                aria-label="Move down"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </>
          )}
          {onRemove && (
            <button
              type="button"
              onClick={onRemove}
              className="flex h-8 w-8 items-center justify-center rounded-full text-gray-500 hover:bg-[#2A2A2A] hover:text-red-400 transition-colors"
              aria-label={`Remove ${driver.name}`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="h-4 w-4"
              >
                <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Result fields */}
      <div className="flex flex-col gap-3 px-4 py-3">
        {/* Best Lap (qualifying only) */}
        {isQualifying && (
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-400 uppercase tracking-wide">
              Best Lap
            </label>
            <input
              type="text"
              inputMode="decimal"
              placeholder="00:00.000"
              value={result.bestLap}
              onChange={(e) => handleTimeChange('bestLap', e.target.value)}
              onBlur={() => handleTimeBlur('bestLap', result.bestLap)}
              className="h-12 w-full rounded-md border border-[#333] bg-[#141414] px-3 font-mono text-base font-medium text-gray-100 placeholder:text-gray-600 focus:border-[#FFE600] focus:ring-1 focus:ring-[#FFE600] focus:outline-none"
            />
          </div>
        )}

        {/* Gap (race only, P2+ only) */}
        {!isQualifying && !isEndurance && position !== null && position > 1 && (
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-400 uppercase tracking-wide">Gap</label>
            <input
              type="text"
              inputMode="decimal"
              placeholder="+0.000"
              value={result.gap}
              onChange={(e) => onChange('gap', e.target.value)}
              className="h-12 w-full rounded-md border border-[#333] bg-[#141414] px-3 font-mono text-base font-medium text-gray-100 placeholder:text-gray-600 focus:border-[#FFE600] focus:ring-1 focus:ring-[#FFE600] focus:outline-none"
            />
          </div>
        )}

        {/* Lap count (endurance only) */}
        {!isQualifying && isEndurance && (
          <>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-400 uppercase tracking-wide">Laps</label>
              <input
                type="number"
                inputMode="numeric"
                placeholder="0"
                min="0"
                value={result.lapCount ?? ''}
                onChange={(e) => {
                  const val = e.target.value;
                  if (/^\d*$/.test(val)) {
                    onChange('lapCount', val ? parseInt(val) : 0);
                  }
                }}
                className="h-12 w-full rounded-md border border-[#333] bg-[#141414] px-3 font-mono text-base font-medium text-gray-100 placeholder:text-gray-600 focus:border-[#FFE600] focus:ring-1 focus:ring-[#FFE600] focus:outline-none"
              />
            </div>

            {/* Team Total display */}
            <div className="flex flex-col gap-1 pt-1 border-t border-[#2A2A2A]">
              <label className="text-xs font-medium text-gray-400 uppercase tracking-wide">Team Total</label>
              <div className="h-12 flex items-center px-3 bg-[#141414] rounded-md border border-[#333] text-gray-400 font-mono">
                {result.teamLapCount ?? 0} laps
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
