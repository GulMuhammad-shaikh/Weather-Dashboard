import React from 'react';
import { WifiOff, RefreshCw, Database } from 'lucide-react';
import { formatTimeAgo } from '../utils/helpers';

export default function OfflineBanner({ isOffline, isCached, cityName, lastUpdated, onRefresh }) {
  if (!isOffline && !isCached) return null;

  return (
    <div className="w-full max-w-6xl mx-auto px-4 pt-4">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 rounded-2xl bg-amber-500/15 border border-amber-500/40 text-amber-900 dark:text-amber-200 backdrop-blur-md shadow-lg shadow-amber-950/20">
        
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-500 dark:text-amber-400 relative">
            {isOffline ? (
              <>
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
                </span>
                <WifiOff className="w-5 h-5" />
              </>
            ) : (
              <Database className="w-5 h-5" />
            )}
          </div>

          <div className="text-xs sm:text-sm">
            <span className="font-extrabold uppercase tracking-wider text-amber-700 dark:text-amber-300 mr-2 px-2 py-0.5 rounded-md bg-amber-500/20 border border-amber-500/30">
              Offline Mode
            </span>
            <span className="text-amber-950 dark:text-amber-200/90 leading-relaxed">
              Displaying cached weather for <strong className="text-slate-900 dark:text-white font-semibold">{cityName || 'last viewed city'}</strong>{' '}
              (cached {lastUpdated ? formatTimeAgo(lastUpdated) : 'earlier'}). Live updates will resume automatically once reconnected.
            </span>
          </div>
        </div>

        {!isOffline && onRefresh && (
          <button
            onClick={onRefresh}
            className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-amber-400/20 hover:bg-amber-400/30 text-amber-900 dark:text-amber-200 transition-colors cursor-pointer border border-amber-400/30"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Sync Latest Data</span>
          </button>
        )}

      </div>
    </div>
  );
}
