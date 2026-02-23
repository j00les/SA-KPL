'use client';

import { SessionStatus } from '@/lib/types';

interface StatusBadgeProps {
  status: SessionStatus;
}

const STATUS_CONFIG: Record<SessionStatus, { dotClass: string; label: string; badgeClass: string }> = {
  'not-started': {
    dotClass: 'bg-gray-500',
    label: 'Not started',
    badgeClass: 'bg-[#222] text-gray-400 ring-[#333]',
  },
  'in-progress': {
    dotClass: 'bg-amber-400 pulse-dot',
    label: 'In progress',
    badgeClass: 'bg-[#222] text-amber-300 ring-amber-500/30',
  },
  completed: {
    dotClass: 'bg-green-400',
    label: 'Completed',
    badgeClass: 'bg-[#222] text-green-300 ring-green-500/30 checkered-accent',
  },
};

export default function StatusBadge({ status }: StatusBadgeProps) {
  const { dotClass, label, badgeClass } = STATUS_CONFIG[status];

  return (
    <span className={`inline-flex items-center gap-1.5 rounded px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${badgeClass}`}>
      <span
        className={`h-1.5 w-1.5 rounded-full ${dotClass}`}
        aria-hidden="true"
      />
      {label}
    </span>
  );
}
