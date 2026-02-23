'use client';

import Link from 'next/link';
import { RaceSession } from '@/lib/types';
import { CLASS_COLORS } from '@/lib/constants';
import StatusBadge from './StatusBadge';

interface RaceSummaryCardProps {
  session: RaceSession;
  editable?: boolean;
}

export default function RaceSummaryCard({ session, editable = false }: RaceSummaryCardProps) {
  const classColor = CLASS_COLORS[session.raceClass];
  const sorted = [...session.results]
    .sort((a, b) => (a.position ?? 999) - (b.position ?? 999));

  const content = (
    <>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#2A2A2A] carbon-texture">
        <h3 className="text-sm font-bold text-gray-100">{session.label}</h3>
        <StatusBadge status={session.status} />
      </div>

      {/* Results */}
      <div className="px-4 py-3">
        {sorted.length === 0 ? (
          <p className="text-sm text-gray-500 italic">No results yet</p>
        ) : (
          <table className="w-full text-xs">
            <thead>
              <tr className="text-left text-gray-500 uppercase tracking-wide">
                <th className="pb-1.5 pr-3 font-medium w-10">Pos</th>
                <th className="pb-1.5 pr-2 font-medium">Driver</th>
                <th className="pb-1.5 font-medium text-right w-20">Gap</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((r) => (
                <tr key={r.driverId} className="border-t border-[#2A2A2A]">
                  <td className="py-1.5 pr-3 font-bold text-gray-100 w-10">
                    {r.position ?? '—'}
                  </td>
                  <td className="py-1.5 pr-2 font-medium text-gray-300">
                    {r.driverName}
                  </td>
                  <td className="py-1.5 text-right tabular-nums text-gray-400 w-20">
                    {r.gap || '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );

  if (editable) {
    return (
      <Link
        href={`/race/${session.id}`}
        className="block rounded-lg bg-[#1A1A1A] card-clip overflow-hidden active:bg-[#222] transition-colors"
        style={{ borderLeft: `4px solid ${classColor}` }}
      >
        {content}
      </Link>
    );
  }

  return (
    <div
      className="rounded-lg bg-[#1A1A1A] card-clip overflow-hidden"
      style={{ borderLeft: `4px solid ${classColor}` }}
    >
      {content}
    </div>
  );
}
