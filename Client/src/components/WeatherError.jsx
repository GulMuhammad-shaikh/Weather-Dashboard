import React from 'react';
import { AlertCircle, RefreshCw, MapPin, Search } from 'lucide-react';

export default function WeatherError({ error, onRetry, onUseLocation, onResetDefault }) {
  // Determine user-friendly advice based on error string
  const isNetwork = error?.toLowerCase().includes('network') || error?.toLowerCase().includes('fetch') || error?.toLowerCase().includes('offline');
  const isNotFound = error?.toLowerCase().includes('not found') || error?.toLowerCase().includes('locate');

  return (
    <div className="w-full max-w-xl mx-auto px-4 py-16">
      <div className="glass-panel rounded-3xl p-8 sm:p-10 text-center space-y-6 shadow-2xl border border-rose-500/20 relative overflow-hidden">
        
        {/* Glow backdrop */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Error Icon */}
        <div className="w-16 h-16 rounded-3xl bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto ring-8 ring-rose-500/10">
          <AlertCircle className="w-8 h-8" />
        </div>

        {/* Error Titles */}
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight m-0">
            {isNotFound ? 'City Not Found' : isNetwork ? 'Network Connection Error' : 'Weather Data Unavailable'}
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-md mx-auto">
            {error || 'An unexpected error occurred while fetching real-time weather conditions.'}
          </p>
        </div>

        {/* Helpful Tips Box */}
        <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-white/5 text-xs text-slate-600 dark:text-slate-400 text-left space-y-1.5">
          <div className="font-semibold text-slate-800 dark:text-slate-300">Suggestions:</div>
          <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-400">
            {isNotFound ? (
              <>
                <li>Double-check the spelling of the city name.</li>
                <li>Try adding the country (e.g. "Paris, France").</li>
                <li>Use the search autocomplete dropdown for verified locations.</li>
              </>
            ) : isNetwork ? (
              <>
                <li>Check your internet connection or Wi-Fi router.</li>
                <li>If you were offline, cached weather for your last city will appear automatically.</li>
                <li>Click Retry once your connection is restored.</li>
              </>
            ) : (
              <>
                <li>The weather satellite feed may be temporarily busy.</li>
                <li>Our zero-downtime Open-Meteo fallback will automatically activate on retry.</li>
              </>
            )}
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          {onRetry && (
            <button
              onClick={onRetry}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-bold text-sm shadow-xl shadow-sky-500/25 transition-all cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Retry Fetch</span>
            </button>
          )}

          {onUseLocation && (
            <button
              onClick={onUseLocation}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl glass-card text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:border-sky-400/30 text-sm font-semibold transition-all cursor-pointer"
            >
              <MapPin className="w-4 h-4 text-sky-500 dark:text-sky-400" />
              <span>Use My Location</span>
            </button>
          )}

          {onResetDefault && (
            <button
              onClick={onResetDefault}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl glass-card text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white text-sm font-medium transition-all cursor-pointer"
            >
              <span>Load Default City</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
