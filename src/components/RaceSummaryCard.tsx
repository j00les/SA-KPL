'use client';

import Link from 'next/link';
import { RaceSession } from '@/lib/types';
import { CLASS_COLORS } from '@/lib/constants';
import StatusBadge from './StatusBadge';

interface RaceSummaryCardProps {
  session: RaceSession;
}

export default function RaceSummaryCard({ session }: RaceSummaryCardProps) {
  const classColor = CLASS_COLORS[session.raceClass];
  const sorted = [...session.results]
    .filter((r) => r.position !== null)
    .sort((a, b) => (a.position ?? 999) - (b.position ?? 999));

  return (
    <Link
      href={`/race/${session.id}`}
      className="block rounded-lg bg-white shadow-sm overflow-hidden active:bg-gray-50 transition-colors"
      style={{ borderLeft: `4px solid ${classColor}` }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <div>
          <h3 className="text-sm font-bold text-gray-900">{session.label}</h3>
          <p className="text-xs text-gray-500">{session.laps} laps</p>
        </div>
        <StatusBadge status={session.status} />
      </div>

      {/* Results */}
      <div className="px-4 py-3">
        {sorted.length === 0 ? (
          <p className="text-sm text-gray-400 italic">No results yet</p>
        ) : (
          <table className="w-full text-xs">
            <thead>
              <tr className="text-left text-gray-400 uppercase tracking-wide">
                <th className="pb-1.5 pr-2 font-medium">Pos</th>
                <th className="pb-1.5 pr-2 font-medium">Driver</th>
                <th className="pb-1.5 pr-2 font-medium text-right">Best Lap</th>
                <th className="pb-1.5 font-medium text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((r) => (
                <tr key={r.driverId} className="border-t border-gray-50">
                  <td className="py-1.5 pr-2 font-bold text-gray-900">
                    {r.position}
                  </td>
                  <td className="py-1.5 pr-2 font-medium text-gray-700 truncate max-w-[120px]">
                    {r.driverName}
                  </td>
                  <td className="py-1.5 pr-2 text-right tabular-nums text-gray-600">
                    {r.bestLap || '—'}
                  </td>
                  <td className="py-1.5 text-right tabular-nums text-gray-600">
                    {r.totalTime || '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </Link>
  );
}
