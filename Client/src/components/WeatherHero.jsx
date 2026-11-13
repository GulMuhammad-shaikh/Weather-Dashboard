import React from 'react';
import { Star, ArrowUp, ArrowDown, Droplets, Wind, ShieldCheck, Sun } from 'lucide-react';
import { formatTemp, formatWindSpeed, getWeatherIconComponent } from '../utils/helpers';

export default function WeatherHero({
  location,
  current,
  daily,
  unit,
  isFavorite,
  onToggleFavorite,
  source
}) {
  if (!current || !location) return null;

  const todayDaily = daily?.[0] || {};

  // AQI Level helper with strong contrast in both light and dark mode
  const getAqiBadge = (aqi) => {
    if (!aqi || aqi <= 50) {
      return { text: 'Good', color: 'bg-emerald-500/15 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border-emerald-500/40' };
    }
    if (aqi <= 100) {
      return { text: 'Moderate', color: 'bg-amber-500/15 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 border-amber-500/40' };
    }
    if (aqi <= 150) {
      return { text: 'Unhealthy for Sensitive', color: 'bg-orange-500/15 dark:bg-orange-500/20 text-orange-800 dark:text-orange-300 border-orange-500/40' };
    }
    return { text: 'Unhealthy', color: 'bg-rose-500/15 dark:bg-rose-500/20 text-rose-800 dark:text-rose-300 border-rose-500/40' };
  };

  const aqiInfo = getAqiBadge(current.aqi);

  // Dynamic date calculation respecting the location's local timezone
  const formattedDate = (() => {
    try {
      return new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'short',
        day: 'numeric',
        timeZone: location.timezone && location.timezone !== 'auto' ? location.timezone : undefined
      });
    } catch {
      return new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'short',
        day: 'numeric'
      });
    }
  })();

  return (
    <div className="w-full max-w-6xl mx-auto px-4 pt-6">
      <div className="glass-panel rounded-3xl p-6 sm:p-10 relative overflow-hidden">
        
        {/* Ambient background decoration */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          
          {/* Left Column: City & Big Temperature */}
          <div className="space-y-4">
            
            {/* City Title & Favorite Toggle */}
            <div className="flex items-center gap-3">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white m-0">
                {location.name}
              </h1>
              
              <button
                onClick={onToggleFavorite}
                title={isFavorite ? 'Remove from favorites' : 'Save to favorites'}
                className={`min-w-[44px] min-h-[44px] flex items-center justify-center p-2.5 rounded-2xl border transition-all cursor-pointer ${
                  isFavorite
                    ? 'bg-amber-500/20 border-amber-400/50 text-amber-500 dark:text-amber-400 shadow-lg shadow-amber-500/20'
                    : 'bg-slate-100 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 hover:text-amber-500 hover:bg-amber-500/10 hover:border-amber-400/30'
                }`}
              >
                <Star className={`w-5 h-5 ${isFavorite ? 'fill-amber-400 text-amber-500' : ''}`} />
              </button>
            </div>

            {/* Date & Coordinates (Dynamic, updates daily) */}
            <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium">
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {formattedDate}
              </span>
              <span>•</span>
              <span className="font-mono text-slate-500">
                {location.latitude?.toFixed(2)}°, {location.longitude?.toFixed(2)}°
              </span>
              <span>•</span>
              <span className="capitalize">{location.timezone}</span>
            </div>

            {/* Temperature and Feels Like */}
            <div className="flex items-baseline gap-4 pt-2">
              <div className="flex items-baseline">
                <span className="text-6xl sm:text-7xl md:text-8xl font-black tracking-tighter text-slate-900 dark:text-white font-mono">
                  {formatTemp(current.temperature, unit)}°
                </span>
                <span className="text-2xl sm:text-3xl font-extrabold text-sky-500 dark:text-sky-400 font-mono ml-1">
                  {unit}
                </span>
              </div>

              <div className="space-y-1">
                <div className="text-sm sm:text-base font-semibold text-slate-700 dark:text-slate-300">
                  Feels like {formatTemp(current.apparentTemperature, unit)}°{unit}
                </div>
                <div className="flex items-center gap-3 text-xs sm:text-sm font-semibold">
                  <span className="flex items-center text-rose-500 dark:text-rose-400" title="Today's high">
                    <ArrowUp className="w-3.5 h-3.5 mr-0.5" />
                    {formatTemp(todayDaily.maxTemp ?? current.temperature, unit)}°
                  </span>
                  <span className="flex items-center text-sky-500 dark:text-sky-400" title="Today's low">
                    <ArrowDown className="w-3.5 h-3.5 mr-0.5" />
                    {formatTemp(todayDaily.minTemp ?? current.temperature, unit)}°
                  </span>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: Weather Icon & Quick Badges */}
          <div className="flex flex-col items-start md:items-end gap-5">
            
            {/* Condition Icon & Text */}
            <div className="flex items-center gap-4">
              <div className="animate-float p-3 rounded-3xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 shadow-xl">
                {getWeatherIconComponent(current.weatherIcon, { className: 'w-16 h-16 sm:w-20 sm:h-20' })}
              </div>
              <div className="md:text-right">
                <div className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                  {current.weatherText}
                </div>
                <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium">
                  {current.isDay ? 'Daytime' : 'Nighttime'} conditions
                </div>
              </div>
            </div>

            {/* Micro badges */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Rain Chance */}
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-500/15 border border-blue-500/35 text-blue-800 dark:text-blue-300 text-xs font-bold shadow-sm">
                <Droplets className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                <span>Rain {todayDaily.precipitationProb ?? 0}%</span>
              </div>

              {/* Wind */}
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-500/15 border border-teal-500/35 text-teal-800 dark:text-teal-300 text-xs font-bold shadow-sm">
                <Wind className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 shrink-0" />
                <span>{formatWindSpeed(current.windSpeed, unit)}</span>
              </div>

              {/* AQI */}
              <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold shadow-sm ${aqiInfo.color}`}>
                <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                <span>AQI {current.aqi} • {aqiInfo.text}</span>
              </div>

              {/* Data Source Badge */}
              {source && (
                <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 text-[11px] font-mono">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  <span>{source}</span>
                </div>
              )}
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
