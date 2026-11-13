import React from 'react';
import { Calendar, Droplets } from 'lucide-react';
import { formatTemp, getWeatherIconComponent } from '../utils/helpers';

export default function DailyForecast({ daily = [], unit = 'C' }) {
  if (!daily || daily.length === 0) return null;

  // Compute weekly global min and max for the relative spectrum bar
  const allMins = daily.map(d => formatTemp(d.minTemp, unit));
  const allMaxs = daily.map(d => formatTemp(d.maxTemp, unit));
  const weekMin = Math.min(...allMins);
  const weekMax = Math.max(...allMaxs);
  const weekRange = Math.max(weekMax - weekMin, 1);

  return (
    <div className="w-full max-w-6xl mx-auto px-4 pt-6">
      <div className="glass-panel rounded-3xl p-6 sm:p-8 space-y-5">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400">
              <Calendar className="w-4 h-4" />
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white tracking-tight m-0">
              5-Day Extended Forecast
            </h2>
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Daily Outlook</span>
        </div>

        {/* Daily Rows (5-Day Forecast) */}
        <div className="space-y-2.5">
          {daily.slice(0, 5).map((day, idx) => {
            const minT = formatTemp(day.minTemp, unit);
            const maxT = formatTemp(day.maxTemp, unit);

            // Compute percentage range for the spectrum bar
            const leftPercent = Math.max(0, Math.min(100, ((minT - weekMin) / weekRange) * 100));
            const widthPercent = Math.max(8, Math.min(100 - leftPercent, ((maxT - minT) / weekRange) * 100));

            return (
              <div
                key={day.date}
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3.5 sm:p-4 rounded-2xl glass-card gap-3"
              >
                {/* Day Name & Date */}
                <div className="w-28 shrink-0">
                  <div className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
                    {day.dayName}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    {new Date(day.date + 'T00:00:00').toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric'
                    })}
                  </div>
                </div>

                {/* Weather Condition & Icon */}
                <div className="flex items-center gap-3 sm:w-48 shrink-0">
                  <div className="p-1.5 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200/60 dark:border-white/10">
                    {getWeatherIconComponent(day.weatherIcon, { className: 'w-6 h-6' })}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                      {day.weatherText}
                    </div>
                    {day.precipitationProb > 0 ? (
                      <div className="flex items-center text-xs text-blue-600 dark:text-blue-400 font-semibold">
                        <Droplets className="w-3 h-3 mr-1" />
                        {day.precipitationProb}% chance of rain
                      </div>
                    ) : (
                      <div className="text-xs text-slate-500 dark:text-slate-400">Low precipitation</div>
                    )}
                  </div>
                </div>

                {/* Min / Max Temperature & Visual Range Bar */}
                <div className="flex items-center gap-3 w-full sm:w-64 sm:justify-end">
                  <span className="w-8 text-right font-mono text-sm font-semibold text-sky-600 dark:text-sky-400">
                    {minT}°
                  </span>

                  {/* Relative temperature progress bar */}
                  <div className="flex-1 h-2 rounded-full bg-slate-200 dark:bg-slate-800/80 relative overflow-hidden">
                    <div
                      className="absolute top-0 bottom-0 rounded-full bg-gradient-to-r from-sky-400 via-amber-400 to-rose-400"
                      style={{
                        left: `${leftPercent}%`,
                        width: `${widthPercent}%`
                      }}
                    />
                  </div>

                  <span className="w-8 text-left font-mono text-sm font-bold text-slate-900 dark:text-white">
                    {maxT}°
                  </span>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}
