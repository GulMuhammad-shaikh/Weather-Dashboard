import React from 'react';
import {
  Droplets,
  Wind,
  Sun,
  ShieldCheck,
  Sunrise,
  Sunset,
  Gauge,
  Cloud,
  Compass
} from 'lucide-react';
import { formatWindSpeed } from '../utils/helpers';

export default function WeatherMetrics({ current, unit = 'C' }) {
  if (!current) return null;

  // UV Index description helper
  const getUvLevel = (uv) => {
    if (uv <= 2) return { text: 'Low', color: 'text-emerald-400', bar: 'w-1/5 bg-emerald-400' };
    if (uv <= 5) return { text: 'Moderate', color: 'text-amber-400', bar: 'w-2/5 bg-amber-400' };
    if (uv <= 7) return { text: 'High', color: 'text-orange-400', bar: 'w-3/5 bg-orange-400' };
    if (uv <= 10) return { text: 'Very High', color: 'text-rose-400', bar: 'w-4/5 bg-rose-400' };
    return { text: 'Extreme', color: 'text-purple-400', bar: 'w-full bg-purple-400' };
  };

  const uvInfo = getUvLevel(current.uvIndex);

  // Format sunrise/sunset to local time string (e.g. 06:14 AM)
  const formatSunTime = (isoString) => {
    if (!isoString) return '--:--';
    try {
      const d = new Date(isoString);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return isoString.slice(11, 16);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 pt-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        
        {/* Card 1: Humidity */}
        <div className="glass-card rounded-3xl p-5 space-y-3">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">
            <span className="flex items-center gap-1.5">
              <Droplets className="w-4 h-4 text-sky-500 dark:text-sky-400" />
              Humidity
            </span>
            <span className="text-slate-700 dark:text-slate-300">
              {current.humidity < 40 ? 'Dry' : current.humidity > 70 ? 'High' : 'Comfortable'}
            </span>
          </div>

          <div className="text-3xl font-extrabold text-slate-900 dark:text-white font-mono">
            {current.humidity}%
          </div>

          <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-sky-500 to-blue-500 rounded-full transition-all duration-700"
              style={{ width: `${current.humidity}%` }}
            />
          </div>

          <div className="text-xs text-slate-500 dark:text-slate-400">
            The dew point indicates moisture levels in the atmosphere.
          </div>
        </div>

        {/* Card 2: Wind & Direction */}
        <div className="glass-card rounded-3xl p-5 space-y-3">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">
            <span className="flex items-center gap-1.5">
              <Wind className="w-4 h-4 text-teal-500 dark:text-teal-400" />
              Wind Conditions
            </span>
            <span className="flex items-center gap-1 text-slate-700 dark:text-slate-300">
              <Compass className="w-3.5 h-3.5" />
              {current.windDirection}°
            </span>
          </div>

          <div className="text-3xl font-extrabold text-slate-900 dark:text-white font-mono">
            {formatWindSpeed(current.windSpeed, unit)}
          </div>

          <div className="flex items-center justify-between text-xs text-slate-700 dark:text-slate-300">
            <span>Gusts: {formatWindSpeed(current.windGusts, unit)}</span>
            <span className="capitalize text-teal-600 dark:text-teal-300 font-medium">
              {current.windSpeed > 30 ? 'Strong Breeze' : current.windSpeed > 15 ? 'Moderate' : 'Gentle Breeze'}
            </span>
          </div>

          <div className="text-xs text-slate-500 dark:text-slate-400">
            Wind velocity measured at 10 meters above surface.
          </div>
        </div>

        {/* Card 3: UV Index */}
        <div className="glass-card rounded-3xl p-5 space-y-3">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">
            <span className="flex items-center gap-1.5">
              <Sun className="w-4 h-4 text-amber-500 dark:text-amber-400" />
              UV Index
            </span>
            <span className={`font-bold ${uvInfo.color}`}>
              {uvInfo.text}
            </span>
          </div>

          <div className="text-3xl font-extrabold text-slate-900 dark:text-white font-mono">
            {current.uvIndex} <span className="text-base font-normal text-slate-500 dark:text-slate-400">/ 11+</span>
          </div>

          <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
            <div className={`h-full rounded-full transition-all duration-700 ${uvInfo.bar}`} />
          </div>

          <div className="text-xs text-slate-500 dark:text-slate-400">
            {current.uvIndex >= 6 ? 'Sun protection required during midday hours.' : 'Low danger for the average person.'}
          </div>
        </div>

        {/* Card 4: Air Quality */}
        <div className="glass-card rounded-3xl p-5 space-y-3">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
              Air Quality (AQI)
            </span>
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">EPA Standard</span>
          </div>

          <div className="text-3xl font-extrabold text-slate-900 dark:text-white font-mono">
            {current.aqi}
          </div>

          <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-400 via-amber-400 to-rose-500 rounded-full"
              style={{ width: `${Math.min(100, (current.aqi / 200) * 100)}%` }}
            />
          </div>

          <div className="text-xs text-slate-500 dark:text-slate-400">
            Air quality is satisfactory and poses little or no risk to public health.
          </div>
        </div>

        {/* Card 5: Sunrise & Sunset */}
        <div className="glass-card rounded-3xl p-5 space-y-3">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">
            <span className="flex items-center gap-1.5">
              <Sunrise className="w-4 h-4 text-amber-500 dark:text-amber-400" />
              Sun Schedule
            </span>
            <span className="text-slate-700 dark:text-slate-300">Daily Arc</span>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-1">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-medium">
                <Sunrise className="w-3.5 h-3.5 text-amber-400" />
                Sunrise
              </div>
              <div className="text-xl font-bold text-slate-900 dark:text-white font-mono">
                {formatSunTime(current.sunrise)}
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-medium">
                <Sunset className="w-3.5 h-3.5 text-orange-400" />
                Sunset
              </div>
              <div className="text-xl font-bold text-slate-900 dark:text-white font-mono">
                {formatSunTime(current.sunset)}
              </div>
            </div>
          </div>

          <div className="text-xs text-slate-500 dark:text-slate-400 pt-1">
            Calculated for local solar noon and horizon angle.
          </div>
        </div>

        {/* Card 6: Pressure & Cloud Cover */}
        <div className="glass-card rounded-3xl p-5 space-y-3">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">
            <span className="flex items-center gap-1.5">
              <Gauge className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
              Barometer & Sky
            </span>
            <span className="flex items-center gap-1 text-slate-700 dark:text-slate-300">
              <Cloud className="w-3.5 h-3.5" />
              {current.cloudCover}% clouds
            </span>
          </div>

          <div className="text-3xl font-extrabold text-slate-900 dark:text-white font-mono">
            {current.pressure} <span className="text-base font-normal text-slate-500 dark:text-slate-400">hPa</span>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-700 dark:text-slate-300">
            <span>Atmospheric: {current.pressure >= 1013 ? 'High pressure' : 'Low pressure'}</span>
            <span className="text-indigo-600 dark:text-indigo-300 font-semibold">{current.cloudCover > 60 ? 'Overcast' : 'Clear/Scattered'}</span>
          </div>

          <div className="text-xs text-slate-500 dark:text-slate-400">
            Standard atmospheric pressure is 1013 hPa at sea level.
          </div>
        </div>

      </div>
    </div>
  );
}
