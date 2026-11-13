import React from 'react';
import { Loader2 } from 'lucide-react';

export default function WeatherSkeleton({ cityName = 'your city' }) {
  return (
    <div className="w-full max-w-6xl mx-auto px-4 pt-6 space-y-6 animate-pulse">
      
      {/* Loading banner */}
      <div className="flex items-center justify-center gap-2.5 py-3 px-4 rounded-2xl glass-panel text-sky-700 dark:text-sky-300 text-xs font-semibold shadow-lg">
        <Loader2 className="w-4 h-4 animate-spin text-sky-500 dark:text-sky-400" />
        <span>Fetching real-time atmospheric conditions and 5-day forecast for {cityName}...</span>
      </div>

      {/* Hero Skeleton */}
      <div className="glass-panel rounded-3xl p-6 sm:p-10 space-y-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div className="space-y-4 w-full md:w-1/2">
            <div className="h-10 bg-slate-200/80 dark:bg-white/10 rounded-2xl w-3/4" />
            <div className="h-4 bg-slate-200/50 dark:bg-white/5 rounded-xl w-1/2" />
            <div className="h-24 bg-slate-200/80 dark:bg-white/10 rounded-3xl w-48 mt-4" />
          </div>
          <div className="flex items-center gap-4 w-full md:w-auto justify-end">
            <div className="w-20 h-20 bg-slate-200/80 dark:bg-white/10 rounded-3xl" />
            <div className="space-y-2">
              <div className="h-6 bg-slate-200/80 dark:bg-white/10 rounded-xl w-32" />
              <div className="h-4 bg-slate-200/50 dark:bg-white/5 rounded-lg w-20" />
            </div>
          </div>
        </div>
      </div>

      {/* Hourly Chart Skeleton */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 space-y-4">
        <div className="h-6 bg-slate-200/80 dark:bg-white/10 rounded-xl w-64" />
        <div className="h-32 bg-slate-200/50 dark:bg-white/5 rounded-2xl w-full" />
        <div className="flex gap-3 overflow-hidden">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="h-28 bg-slate-200/50 dark:bg-white/5 rounded-2xl w-24 shrink-0" />
          ))}
        </div>
      </div>

      {/* Metrics Grid Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="glass-card rounded-3xl p-5 space-y-3">
            <div className="h-4 bg-slate-200/80 dark:bg-white/10 rounded-lg w-1/3" />
            <div className="h-8 bg-slate-200/80 dark:bg-white/10 rounded-xl w-1/2" />
            <div className="h-2 bg-slate-200/50 dark:bg-white/5 rounded-full w-full" />
            <div className="h-3 bg-slate-200/50 dark:bg-white/5 rounded-md w-3/4" />
          </div>
        ))}
      </div>

      {/* 5-Day Forecast Skeleton */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 space-y-4">
        <div className="h-6 bg-slate-200/80 dark:bg-white/10 rounded-xl w-52" />
        <div className="space-y-2.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 bg-slate-200/50 dark:bg-white/5 rounded-2xl w-full" />
          ))}
        </div>
      </div>

    </div>
  );
}
