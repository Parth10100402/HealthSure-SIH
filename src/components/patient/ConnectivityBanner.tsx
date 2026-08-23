// HealthSure — Low-Connectivity Status Banner
// frontend/src/components/patient/ConnectivityBanner.tsx

import React, { useState } from 'react';
import { Wifi, RefreshCw, X } from 'lucide-react';

export const ConnectivityBanner: React.FC = () => {
  const [isDismissed, setIsDismissed] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState('10:32 AM');

  const handleSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      const now = new Date();
      setLastSyncTime(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      );
    }, 800);
  };

  if (isDismissed) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="bg-[#EAF7F2] dark:bg-[#073B3A]/40 border-b border-[#087F6D]/20 px-4 py-2 text-xs text-[#17324D] dark:text-[#D1E8E2] transition-colors"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 overflow-hidden">
          <span className="flex h-2 w-2 relative shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#087F6D] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#087F6D]"></span>
          </span>
          <Wifi className="w-3.5 h-3.5 text-[#087F6D] dark:text-[#4FD1C5] shrink-0" aria-hidden="true" />
          <span className="truncate">
            <strong className="font-semibold text-[#073B3A] dark:text-[#4FD1C5]">Rural Care Offline-Ready:</strong>{' '}
            Showing information cached on this device (Last synced: <strong>{lastSyncTime}</strong>).
          </span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleSync}
            disabled={isSyncing}
            className="inline-flex items-center gap-1 font-semibold text-[#087F6D] dark:text-[#4FD1C5] hover:underline px-2 py-0.5 rounded focus-visible:outline-2 focus-visible:outline-[#087F6D]"
            aria-label="Refresh latest healthcare records"
          >
            <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} aria-hidden="true" />
            <span>{isSyncing ? 'Syncing…' : 'Sync Now'}</span>
          </button>
          <button
            type="button"
            onClick={() => setIsDismissed(true)}
            className="text-[#64748B] hover:text-[#17324D] dark:text-[#7B9EA8] dark:hover:text-white p-1 rounded focus-visible:outline-2 focus-visible:outline-[#087F6D]"
            aria-label="Dismiss connectivity notification"
          >
            <X className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
};
