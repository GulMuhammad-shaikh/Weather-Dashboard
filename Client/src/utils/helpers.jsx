import React from 'react';
import AnimatedWeatherIcon from '../components/AnimatedWeatherIcon';
import {
  Sun,
  SunMedium,
  Moon,
  Cloud,
  CloudSun,
  CloudMoon,
  CloudRain,
  CloudDrizzle,
  CloudSnow,
  CloudLightning,
  CloudFog,
  Wind
} from 'lucide-react';

// Convert Celsius to Fahrenheit
export function formatTemp(celsius, unit = 'C') {
  if (celsius === null || celsius === undefined) return '--';
  if (unit === 'F') {
    return Math.round((celsius * 9) / 5 + 32);
  }
  return Math.round(celsius);
}

// Convert wind speed (km/h to mph if unit is F)
export function formatWindSpeed(kmh, unit = 'C') {
  if (kmh === null || kmh === undefined) return '--';
  if (unit === 'F') {
    return `${Math.round(kmh * 0.621371)} mph`;
  }
  return `${Math.round(kmh)} km/h`;
}

// Convert Base64 URL string to Uint8Array for PushManager
export function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

// Weather Icon component mapper - returns hardware-accelerated animated weather icon
export function getWeatherIconComponent(iconName, props = { className: 'w-6 h-6' }) {
  return <AnimatedWeatherIcon name={iconName} {...props} />;
}

// Dynamic atmospheric themes based on current conditions & dark/light mode
export function getWeatherTheme(condition = 'clear', isDay = true, isDark = true) {
  if (!isDark) {
    // Light Mode Themes
    if (!isDay) {
      return {
        bg: 'from-indigo-100 via-slate-100 to-blue-200 text-slate-800',
        accent: 'indigo',
        glow: 'rgba(129, 140, 248, 0.35)',
        particle: 'stars'
      };
    }

    switch (condition) {
      case 'clear':
      case 'mainly-clear':
        return {
          bg: 'from-sky-100 via-blue-50 to-amber-50 text-slate-800',
          accent: 'amber',
          glow: 'rgba(251, 191, 36, 0.35)',
          particle: 'sun'
        };
      case 'partly-cloudy':
      case 'overcast':
      case 'cloudy':
        return {
          bg: 'from-slate-100 via-sky-50 to-cyan-100 text-slate-800',
          accent: 'cyan',
          glow: 'rgba(56, 189, 248, 0.3)',
          particle: 'cloud'
        };
      case 'rain':
      case 'heavy-rain':
      case 'drizzle':
        return {
          bg: 'from-blue-100 via-slate-100 to-sky-150 text-slate-800',
          accent: 'blue',
          glow: 'rgba(96, 165, 250, 0.3)',
          particle: 'rain'
        };
      case 'snow':
        return {
          bg: 'from-teal-50 via-slate-50 to-sky-100 text-slate-800',
          accent: 'teal',
          glow: 'rgba(45, 212, 191, 0.3)',
          particle: 'snow'
        };
      case 'thunderstorm':
        return {
          bg: 'from-purple-100 via-slate-100 to-indigo-100 text-slate-800',
          accent: 'purple',
          glow: 'rgba(192, 132, 252, 0.35)',
          particle: 'storm'
        };
      case 'fog':
        return {
          bg: 'from-stone-100 via-slate-100 to-zinc-200 text-slate-800',
          accent: 'slate',
          glow: 'rgba(148, 163, 184, 0.3)',
          particle: 'fog'
        };
      default:
        return {
          bg: 'from-sky-50 via-slate-100 to-blue-100 text-slate-800',
          accent: 'cyan',
          glow: 'rgba(14, 165, 233, 0.3)',
          particle: 'none'
        };
    }
  }

  // Dark Mode Themes
  if (!isDay) {
    return {
      bg: 'from-slate-950 via-indigo-950 to-slate-900 text-slate-100',
      accent: 'indigo',
      glow: 'rgba(99, 102, 241, 0.25)',
      particle: 'stars'
    };
  }

  switch (condition) {
    case 'clear':
    case 'mainly-clear':
      return {
        bg: 'from-sky-900 via-blue-900 to-indigo-950 text-slate-100',
        accent: 'amber',
        glow: 'rgba(245, 158, 11, 0.25)',
        particle: 'sun'
      };
    case 'partly-cloudy':
    case 'overcast':
    case 'cloudy':
      return {
        bg: 'from-slate-900 via-cyan-950 to-slate-950 text-slate-100',
        accent: 'cyan',
        glow: 'rgba(6, 182, 212, 0.2)',
        particle: 'cloud'
      };
    case 'rain':
    case 'heavy-rain':
    case 'drizzle':
      return {
        bg: 'from-blue-950 via-slate-900 to-slate-950 text-slate-100',
        accent: 'blue',
        glow: 'rgba(59, 130, 246, 0.25)',
        particle: 'rain'
      };
    case 'snow':
      return {
        bg: 'from-slate-900 via-teal-950 to-slate-950 text-slate-100',
        accent: 'teal',
        glow: 'rgba(45, 212, 191, 0.2)',
        particle: 'snow'
      };
    case 'thunderstorm':
      return {
        bg: 'from-purple-950 via-indigo-950 to-slate-950 text-slate-100',
        accent: 'purple',
        glow: 'rgba(168, 85, 247, 0.3)',
        particle: 'storm'
      };
    case 'fog':
      return {
        bg: 'from-stone-900 via-slate-900 to-stone-950 text-slate-100',
        accent: 'slate',
        glow: 'rgba(148, 163, 184, 0.15)',
        particle: 'fog'
      };
    default:
      return {
        bg: 'from-slate-900 via-slate-950 to-black text-slate-100',
        accent: 'cyan',
        glow: 'rgba(14, 165, 233, 0.2)',
        particle: 'none'
      };
  }
}

// Relative timestamp formatter
export function formatTimeAgo(isoString) {
  if (!isoString) return '';
  const now = Date.now();
  const past = new Date(isoString).getTime();
  const diffSec = Math.floor((now - past) / 1000);

  if (diffSec < 60) return 'Just now';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour}h ago`;
  return new Date(isoString).toLocaleDateString();
}
