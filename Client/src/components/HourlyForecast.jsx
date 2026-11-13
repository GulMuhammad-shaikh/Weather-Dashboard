import React, { useState } from 'react';
import { Clock, Droplets, Wind } from 'lucide-react';
import { formatTemp, formatWindSpeed, getWeatherIconComponent } from '../utils/helpers';

export default function HourlyForecast({ hourly = [], unit = 'C' }) {
  const [hoverIndex, setHoverIndex] = useState(null);

  if (!hourly || hourly.length === 0) return null;

  // Compute SVG chart coordinates for 24 hours
  const chartHeight = 110;
  const chartWidth = 800;
  const paddingX = 30;
  const paddingY = 25;

  const temps = hourly.map(h => formatTemp(h.temperature, unit));
  const minTemp = Math.min(...temps);
  const maxTemp = Math.max(...temps);
  const tempRange = Math.max(maxTemp - minTemp, 4); // avoid division by zero

  const points = hourly.map((h, i) => {
    const x = paddingX + (i / (hourly.length - 1)) * (chartWidth - paddingX * 2);
    const tempVal = formatTemp(h.temperature, unit);
    const y = chartHeight - paddingY - ((tempVal - minTemp) / tempRange) * (chartHeight - paddingY * 2);
    return { x, y, tempVal, hour: h.hourText, item: h };
  });

  // Generate smooth SVG path with cubic bezier spline
  let pathD = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i === 0 ? 0 : i - 1];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2 < points.length ? i + 2 : i + 1];

    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;

    pathD += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
  }

  const fillD = `${pathD} L ${points[points.length - 1].x} ${chartHeight} L ${points[0].x} ${chartHeight} Z`;

  const activePoint = hoverIndex !== null ? points[hoverIndex] : null;

  return (
    <div className="w-full max-w-6xl mx-auto px-4 pt-6">
      <div className="glass-panel rounded-3xl p-6 sm:p-8 space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-sky-500/20 text-sky-400">
              <Clock className="w-4 h-4" />
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white tracking-tight m-0">
              24-Hour Forecast & Temperature Trend
            </h2>
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Hourly Overview</span>
        </div>

        {/* SVG Interactive Area Chart */}
        <div className="relative w-full overflow-hidden rounded-2xl bg-slate-100/70 dark:bg-slate-900/40 border border-slate-200/80 dark:border-white/5 p-2 sm:p-4">
          <svg
            viewBox={`0 0 ${chartWidth} ${chartHeight}`}
            className="w-full h-32 sm:h-36 overflow-visible"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="tempGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Area Fill */}
            <path d={fillD} fill="url(#tempGradient)" />

            {/* Smooth Curve */}
            <path
              d={pathD}
              fill="none"
              stroke="#38bdf8"
              strokeWidth="3"
              strokeLinecap="round"
            />

            {/* Hover Vertical Guide */}
            {activePoint && (
              <line
                x1={activePoint.x}
                y1={0}
                x2={activePoint.x}
                y2={chartHeight}
                stroke="#94a3b8"
                strokeWidth="1.5"
                strokeDasharray="4 4"
                opacity="0.7"
              />
            )}

            {/* Individual Points */}
            {points.map((pt, idx) => (
              <g key={idx}>
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={hoverIndex === idx ? 6 : 3}
                  className={`transition-all ${
                    hoverIndex === idx
                      ? 'fill-white stroke-sky-400 stroke-[3]'
                      : 'fill-sky-400'
                  }`}
                />
              </g>
            ))}
          </svg>

          {/* Interactive Tooltip on hover */}
          {activePoint && (
            <div
              className="absolute pointer-events-none -top-1 px-3 py-1.5 rounded-xl glass-panel text-xs shadow-xl border border-sky-400/30 transform -translate-x-1/2 flex items-center gap-2"
              style={{
                left: `${(activePoint.x / chartWidth) * 100}%`
              }}
            >
              <span className="font-bold text-slate-900 dark:text-white">{activePoint.hour}</span>
              <span className="text-sky-600 dark:text-sky-300 font-extrabold">{activePoint.tempVal}°</span>
              <span className="text-slate-600 dark:text-slate-300 text-[11px]">{activePoint.item.weatherText}</span>
              {activePoint.item.precipitationProb > 0 && (
                <span className="text-blue-600 dark:text-blue-300 font-semibold flex items-center">
                  <Droplets className="w-2.5 h-2.5 mr-0.5" />
                  {activePoint.item.precipitationProb}%
                </span>
              )}
            </div>
          )}
        </div>

        {/* Horizontal Carousel Cards */}
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
          {hourly.map((hour, idx) => (
            <div
              key={hour.time}
              onMouseEnter={() => setHoverIndex(idx)}
              onMouseLeave={() => setHoverIndex(null)}
              className={`shrink-0 flex flex-col items-center justify-between p-3.5 rounded-2xl border transition-all cursor-pointer min-w-[85px] ${
                hoverIndex === idx
                  ? 'bg-sky-500/20 border-sky-400/50 shadow-lg shadow-sky-500/10 scale-105'
                  : 'bg-slate-100/70 dark:bg-slate-900/40 border-slate-200/70 dark:border-white/5 hover:bg-slate-200/60 dark:hover:bg-slate-850'
              }`}
            >
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                {hour.hourText}
              </span>

              <div className="my-2.5">
                {getWeatherIconComponent(hour.weatherIcon, { className: 'w-7 h-7' })}
              </div>

              <span className="text-sm font-bold text-slate-900 dark:text-white font-mono">
                {formatTemp(hour.temperature, unit)}°
              </span>

              <div className="mt-2 flex flex-col items-center gap-1 text-[11px]">
                {hour.precipitationProb > 0 ? (
                  <span className="flex items-center text-blue-600 dark:text-blue-400 font-semibold">
                    <Droplets className="w-2.5 h-2.5 mr-0.5" />
                    {hour.precipitationProb}%
                  </span>
                ) : (
                  <span className="text-slate-500 dark:text-slate-400 font-mono text-[10px] flex items-center">
                    <Wind className="w-2.5 h-2.5 mr-0.5" />
                    {formatWindSpeed(hour.windSpeed, unit).split(' ')[0]}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
