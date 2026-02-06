'use client';

import { SessionStatus } from '@/lib/types';

interface StatusBadgeProps {
  status: SessionStatus;
}

const STATUS_CONFIG: Record<SessionStatus, { dotClass: string; label: string }> = {
  'not-started': {
    dotClass: 'bg-gray-400',
    label: 'Not started',
  },
  'in-progress': {
    dotClass: 'bg-amber-400',
    label: 'In progress',
  },
  completed: {
    dotClass: 'bg-green-500',
    label: 'Completed',
  },
};

export default function StatusBadge({ status }: StatusBadgeProps) {
  const { dotClass, label } = STATUS_CONFIG[status];

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-2.5 py-0.5 text-xs font-medium text-gray-700 ring-1 ring-gray-200 ring-inset">
      <span
        className={`h-1.5 w-1.5 rounded-full ${dotClass}`}
        aria-hidden="true"
      />
      {label}
    </span>
  );
}
