import React from 'react';
import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div
      id="offline-indicator-banner"
      className="fixed bottom-4 left-4 z-50 flex items-center gap-2 rounded-xl bg-slate-900/95 dark:bg-slate-800/95 text-white px-3.5 py-2 text-xs font-medium shadow-xl border border-slate-700/50 backdrop-blur-md animate-in slide-in-from-bottom-3 duration-300"
    >
      <WifiOff className="w-3.5 h-3.5 text-amber-400 shrink-0" />
      <span>Offline Mode — All image conversion operates 100% locally on your device.</span>
    </div>
  );
};
