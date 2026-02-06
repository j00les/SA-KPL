'use client';

import { useSocket } from '@/hooks/useSocket';

export default function ConnectionStatus() {
  const { isConnected, connectionCount } = useSocket();

  return (
    <div className="inline-flex items-center gap-1.5 text-xs text-white/80">
      <span
        className={`h-2 w-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-500'}`}
        aria-label={isConnected ? 'Connected' : 'Disconnected'}
      />
      <span>{connectionCount} {connectionCount === 1 ? 'device' : 'devices'}</span>
    </div>
  );
}
