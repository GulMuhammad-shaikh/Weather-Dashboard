import React, { useMemo } from 'react';
import { getWeatherTheme } from '../utils/helpers';

export default function WeatherBackground({ condition = 'clear', isDay = true, isDark = true }) {
  const theme = useMemo(() => getWeatherTheme(condition, isDay, isDark), [condition, isDay, isDark]);

  // Generate deterministic particles for rain/stars
  const particles = useMemo(() => {
    if (theme.particle === 'rain') {
      return Array.from({ length: 30 }).map((_, i) => ({
        id: i,
        left: `${(i * 3.3 + Math.sin(i) * 2).toFixed(1)}%`,
        delay: `${(i * 0.12).toFixed(2)}s`,
        duration: `${(0.8 + (i % 5) * 0.15).toFixed(2)}s`
      }));
    }
    if (theme.particle === 'stars') {
      return Array.from({ length: 40 }).map((_, i) => ({
        id: i,
        left: `${(i * 2.5 + Math.cos(i) * 2).toFixed(1)}%`,
        top: `${((i * 7) % 85).toFixed(1)}%`,
        size: `${(1.5 + (i % 3)).toFixed(1)}px`,
        delay: `${(i * 0.2).toFixed(2)}s`
      }));
    }
    return [];
  }, [theme.particle]);

  return (
    <div className={`fixed inset-0 pointer-events-none transition-colors duration-1000 -z-10 bg-gradient-to-br ${theme.bg}`}>
      {/* Radial soft glow */}
      <div
        className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] rounded-full blur-[140px] opacity-60 pointer-events-none transition-all duration-1000"
        style={{ background: theme.glow }}
      />

      {/* Rain animation */}
      {theme.particle === 'rain' && (
        <div className="absolute inset-0 overflow-hidden">
          {particles.map((p) => (
            <div
              key={p.id}
              className="rain-drop"
              style={{
                left: p.left,
                animationDelay: p.delay,
                animationDuration: p.duration
              }}
            />
          ))}
        </div>
      )}

      {/* Night stars animation */}
      {theme.particle === 'stars' && (
        <div className="absolute inset-0 overflow-hidden">
          {particles.map((s) => (
            <div
              key={s.id}
              className="absolute bg-white rounded-full animate-pulse"
              style={{
                left: s.left,
                top: s.top,
                width: s.size,
                height: s.size,
                animationDelay: s.delay,
                animationDuration: '3s'
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
