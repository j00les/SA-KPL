'use client';

import { Driver, RaceClass } from '@/lib/types';
import { CLASS_COLORS } from '@/lib/constants';
import { formatTime } from '@/lib/time-utils';

interface DriverResultFormProps {
  driver: Driver;
  raceClass: RaceClass;
  isQualifying: boolean;
  result: {
    position: number | null;
    bestLap: string;
    totalTime: string;
    gap: string;
  };
  onChange: (field: string, value: string | number | null) => void;
  onRemove?: () => void;
}

export default function DriverResultForm({
  driver,
  raceClass,
  isQualifying,
  result,
  onChange,
  onRemove,
}: DriverResultFormProps) {
  const classColor = CLASS_COLORS[raceClass];

  const handleTimeBlur = (field: string, value: string) => {
    if (!value) return;
    const formatted = formatTime(value);
    if (formatted && formatted !== value) {
      onChange(field, formatted);
    }
  };

  return (
    <div
      className="rounded-lg bg-white shadow-sm overflow-hidden"
      style={{ borderLeft: `4px solid ${classColor}` }}
    >
      {/* Driver header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <span className="text-sm font-bold uppercase tracking-wide text-gray-900">
          {driver.name}
        </span>
        {!driver.isTeam && onRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="flex h-8 w-8 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-red-500 transition-colors"
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

      {/* Result fields */}
      <div className="flex flex-col gap-3 px-4 py-3">
        {/* Position */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
            Position
          </label>
          <input
            type="number"
            inputMode="numeric"
            min={1}
            placeholder="—"
            value={result.position ?? ''}
            onChange={(e) => {
              const val = e.target.value;
              onChange('position', val === '' ? null : parseInt(val, 10));
            }}
            className="h-12 w-full rounded-md border border-gray-200 bg-gray-50 px-3 text-base font-medium text-gray-900 placeholder:text-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        {/* Best Lap */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
            Best Lap
          </label>
          <input
            type="text"
            inputMode="decimal"
            placeholder="00:00.000"
            value={result.bestLap}
            onChange={(e) => onChange('bestLap', e.target.value)}
            onBlur={() => handleTimeBlur('bestLap', result.bestLap)}
            className="h-12 w-full rounded-md border border-gray-200 bg-gray-50 px-3 font-mono text-base font-medium text-gray-900 placeholder:text-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        {/* Total Time (race only) */}
        {!isQualifying && (
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              Total Time
            </label>
            <input
              type="text"
              inputMode="decimal"
              placeholder="00:00.000"
              value={result.totalTime}
              onChange={(e) => onChange('totalTime', e.target.value)}
              onBlur={() => handleTimeBlur('totalTime', result.totalTime)}
              className="h-12 w-full rounded-md border border-gray-200 bg-gray-50 px-3 font-mono text-base font-medium text-gray-900 placeholder:text-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
            />
          </div>
        )}

        {/* Gap (race only) */}
        {!isQualifying && (
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              Gap
            </label>
            <input
              type="text"
              inputMode="decimal"
              placeholder="--"
              value={result.gap}
              onChange={(e) => onChange('gap', e.target.value)}
              className="h-12 w-full rounded-md border border-gray-200 bg-gray-50 px-3 font-mono text-base font-medium text-gray-900 placeholder:text-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
            />
          </div>
        )}
      </div>
    </div>
  );
}
