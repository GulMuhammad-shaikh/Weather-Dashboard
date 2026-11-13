import React from 'react';

/**
 * AnimatedWeatherIcon
 * Hardware-accelerated SVG + CSS vector animated weather icons.
 * Smooth 60fps animations with full light/dark mode and responsive scaling support.
 */
export default function AnimatedWeatherIcon({ name = 'Sun', className = 'w-6 h-6', ...props }) {
  const normName = (name || '').trim();

  switch (normName) {
    case 'Sun':
    case 'SunMedium':
      return (
        <svg
          viewBox="0 0 64 64"
          className={`shrink-0 overflow-visible ${className}`}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          {...props}
        >
          <defs>
            <radialGradient id="sunGlowGrad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#FDE047" />
              <stop offset="60%" stopColor="#F59E0B" />
              <stop offset="100%" stopColor="#D97706" />
            </radialGradient>
            <filter id="sunCoreBlur" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="2.5" result="glow" />
              <feComposite in="SourceGraphic" in2="glow" operator="over" />
            </filter>
          </defs>
          {/* Continuously rotating rays */}
          <g className="origin-center animate-spin-sun" style={{ transformOrigin: '32px 32px' }}>
            <line x1="32" y1="5" x2="32" y2="13" stroke="#F59E0B" strokeWidth="3" strokeLinecap="round" />
            <line x1="32" y1="51" x2="32" y2="59" stroke="#F59E0B" strokeWidth="3" strokeLinecap="round" />
            <line x1="5" y1="32" x2="13" y2="32" stroke="#F59E0B" strokeWidth="3" strokeLinecap="round" />
            <line x1="51" y1="32" x2="59" y2="32" stroke="#F59E0B" strokeWidth="3" strokeLinecap="round" />
            <line x1="12.9" y1="12.9" x2="18.6" y2="18.6" stroke="#FBBF24" strokeWidth="3" strokeLinecap="round" />
            <line x1="45.4" y1="45.4" x2="51.1" y2="51.1" stroke="#FBBF24" strokeWidth="3" strokeLinecap="round" />
            <line x1="51.1" y1="12.9" x2="45.4" y2="18.6" stroke="#FBBF24" strokeWidth="3" strokeLinecap="round" />
            <line x1="18.6" y1="45.4" x2="12.9" y2="51.1" stroke="#FBBF24" strokeWidth="3" strokeLinecap="round" />
          </g>
          {/* Breathing pulsing solar core */}
          <circle
            cx="32"
            cy="32"
            r="14"
            fill="url(#sunGlowGrad)"
            filter="url(#sunCoreBlur)"
            className="origin-center animate-pulse-sun"
            style={{ transformOrigin: '32px 32px' }}
          />
        </svg>
      );

    case 'Moon':
      return (
        <svg
          viewBox="0 0 64 64"
          className={`shrink-0 overflow-visible ${className}`}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          {...props}
        >
          <defs>
            <linearGradient id="moonGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#E0E7FF" />
              <stop offset="60%" stopColor="#A5B4FC" />
              <stop offset="100%" stopColor="#6366F1" />
            </linearGradient>
            <filter id="moonGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>
          {/* Gently floating crescent moon */}
          <g className="origin-center animate-float-moon" style={{ transformOrigin: '32px 34px' }}>
            <path
              d="M37 12C26.5 13 18 21.8 18 32.5C18 44.4 27.6 54 39.5 54C44.4 54 48.9 52.3 52.5 49.5C41.5 49 33 40.5 33 30C33 21 38.5 14.5 46.5 12C43.5 12 40.2 12 37 12Z"
              fill="url(#moonGrad)"
              stroke="#C7D2FE"
              strokeWidth="1.5"
              filter="url(#moonGlow)"
            />
          </g>
          {/* Twinkling ambient micro-stars */}
          <path d="M48 18L49 20.5L51.5 21.5L49 22.5L48 25L47 22.5L44.5 21.5L47 20.5Z" fill="#FDE047" className="animate-twinkle-1" />
          <path d="M54 34L55 35.5L56.5 36.5L55 37.5L54 39L53 37.5L51.5 36.5L53 35.5Z" fill="#FDE047" className="animate-twinkle-2" />
          <path d="M21 17L21.8 18.2L23 19L21.8 19.8L21 21L20.2 19.8L19 19L20.2 18.2Z" fill="#FDE047" className="animate-twinkle-3" />
        </svg>
      );

    case 'CloudSun':
      return (
        <svg
          viewBox="0 0 64 64"
          className={`shrink-0 overflow-visible ${className}`}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          {...props}
        >
          <defs>
            <linearGradient id="cloudSunCloudGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="100%" stopColor="#CBD5E1" />
            </linearGradient>
            <radialGradient id="cloudSunSunGrad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#FDE047" />
              <stop offset="100%" stopColor="#F59E0B" />
            </radialGradient>
          </defs>
          {/* Peeking Sun with spinning rays */}
          <g className="animate-spin-sun" style={{ transformOrigin: '42px 21px' }}>
            <circle cx="42" cy="21" r="9" fill="url(#cloudSunSunGrad)" />
            <line x1="42" y1="7" x2="42" y2="10" stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="56" y1="21" x2="53" y2="21" stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="52" y1="11" x2="49.8" y2="13.2" stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="32" y1="11" x2="34.2" y2="13.2" stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="52" y1="31" x2="49.8" y2="28.8" stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round" />
          </g>
          {/* Drifting Foreground Cloud */}
          <path
            d="M45 48H19C13.5 48 9 43.5 9 38C9 33 12.8 28.8 17.8 28.1C19.2 20.8 25.5 15.5 33 15.5C41.3 15.5 48 22.2 48 30.5C51.5 31.2 54 34.4 54 38.5C54 43.7 49.9 48 45 48Z"
            fill="url(#cloudSunCloudGrad)"
            stroke="#94A3B8"
            strokeWidth="1.5"
            className="animate-cloud-drift"
          />
        </svg>
      );

    case 'CloudMoon':
      return (
        <svg
          viewBox="0 0 64 64"
          className={`shrink-0 overflow-visible ${className}`}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          {...props}
        >
          <defs>
            <linearGradient id="cloudMoonGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="100%" stopColor="#CBD5E1" />
            </linearGradient>
            <linearGradient id="moonPeekingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#E0E7FF" />
              <stop offset="100%" stopColor="#818CF8" />
            </linearGradient>
          </defs>
          {/* Floating Peeking Crescent */}
          <g className="animate-float-moon" style={{ transformOrigin: '42px 22px' }}>
            <path
              d="M40 10C35 10.5 30 15 30 22C30 29 35 34.5 42 35C44.5 35 47 34 49 32.5C43 32 38.5 27 38.5 21C38.5 15.5 42 11.5 46.5 10C44.5 10 42.2 10 40 10Z"
              fill="url(#moonPeekingGrad)"
              stroke="#A5B4FC"
              strokeWidth="1.2"
            />
          </g>
          {/* Foreground Cloud */}
          <path
            d="M45 48H19C13.5 48 9 43.5 9 38C9 33 12.8 28.8 17.8 28.1C19.2 20.8 25.5 15.5 33 15.5C41.3 15.5 48 22.2 48 30.5C51.5 31.2 54 34.4 54 38.5C54 43.7 49.9 48 45 48Z"
            fill="url(#cloudMoonGrad)"
            stroke="#94A3B8"
            strokeWidth="1.5"
            className="animate-cloud-drift"
          />
        </svg>
      );

    case 'CloudRain':
      return (
        <svg
          viewBox="0 0 64 64"
          className={`shrink-0 overflow-visible ${className}`}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          {...props}
        >
          <defs>
            <linearGradient id="rainCloudGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#94A3B8" />
              <stop offset="100%" stopColor="#475569" />
            </linearGradient>
            <linearGradient id="rainDropGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#38BDF8" />
              <stop offset="100%" stopColor="#0284C7" />
            </linearGradient>
          </defs>
          {/* Rain Cloud */}
          <path
            d="M44 38H19C14 38 10 34 10 29C10 24.5 13.2 20.8 17.8 20.1C19 13.8 24.4 9 31 9C38.7 9 45 15.3 45 23C48.3 23.8 51 26.8 51 30.5C51 34.6 47.9 38 44 38Z"
            fill="url(#rainCloudGrad)"
            stroke="#64748B"
            strokeWidth="1.5"
            className="animate-cloud-subtle"
          />
          {/* Staggered Animated Falling Rain Streaks */}
          <line x1="22" y1="42" x2="19" y2="52" stroke="url(#rainDropGrad)" strokeWidth="2.5" strokeLinecap="round" className="animate-rain-1" />
          <line x1="32" y1="42" x2="29" y2="54" stroke="url(#rainDropGrad)" strokeWidth="2.5" strokeLinecap="round" className="animate-rain-2" />
          <line x1="42" y1="42" x2="39" y2="52" stroke="url(#rainDropGrad)" strokeWidth="2.5" strokeLinecap="round" className="animate-rain-3" />
        </svg>
      );

    case 'CloudDrizzle':
      return (
        <svg
          viewBox="0 0 64 64"
          className={`shrink-0 overflow-visible ${className}`}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          {...props}
        >
          <defs>
            <linearGradient id="drizzleCloudGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#CBD5E1" />
              <stop offset="100%" stopColor="#64748B" />
            </linearGradient>
          </defs>
          <path
            d="M44 38H19C14 38 10 34 10 29C10 24.5 13.2 20.8 17.8 20.1C19 13.8 24.4 9 31 9C38.7 9 45 15.3 45 23C48.3 23.8 51 26.8 51 30.5C51 34.6 47.9 38 44 38Z"
            fill="url(#drizzleCloudGrad)"
            stroke="#94A3B8"
            strokeWidth="1.5"
            className="animate-cloud-subtle"
          />
          {/* Gentle Drizzle Droplets */}
          <line x1="24" y1="43" x2="22" y2="49" stroke="#38BDF8" strokeWidth="2" strokeLinecap="round" className="animate-rain-1" />
          <line x1="34" y1="43" x2="32" y2="50" stroke="#38BDF8" strokeWidth="2" strokeLinecap="round" className="animate-rain-2" />
          <line x1="42" y1="43" x2="40" y2="49" stroke="#38BDF8" strokeWidth="2" strokeLinecap="round" className="animate-rain-3" />
        </svg>
      );

    case 'CloudSnow':
      return (
        <svg
          viewBox="0 0 64 64"
          className={`shrink-0 overflow-visible ${className}`}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          {...props}
        >
          <defs>
            <linearGradient id="snowCloudGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#F1F5F9" />
              <stop offset="100%" stopColor="#94A3B8" />
            </linearGradient>
          </defs>
          <path
            d="M44 36H19C14 36 10 32 10 27C10 22.5 13.2 18.8 17.8 18.1C19 11.8 24.4 7 31 7C38.7 7 45 13.3 45 21C48.3 21.8 51 24.8 51 28.5C51 32.6 47.9 36 44 36Z"
            fill="url(#snowCloudGrad)"
            stroke="#CBD5E1"
            strokeWidth="1.5"
            className="animate-cloud-subtle"
          />
          {/* Animated Fluttering Snowflakes */}
          <g className="animate-snow-1">
            <circle cx="21" cy="46" r="2.8" fill="#38BDF8" />
            <path d="M21 42V50M17 46H25" stroke="#BAE6FD" strokeWidth="1" strokeLinecap="round" />
          </g>
          <g className="animate-snow-2">
            <circle cx="32" cy="50" r="3" fill="#BAE6FD" />
            <path d="M32 46V54M28 50H36" stroke="#E0F2FE" strokeWidth="1.2" strokeLinecap="round" />
          </g>
          <g className="animate-snow-3">
            <circle cx="43" cy="46" r="2.8" fill="#38BDF8" />
            <path d="M43 42V50M39 46H47" stroke="#BAE6FD" strokeWidth="1" strokeLinecap="round" />
          </g>
        </svg>
      );

    case 'CloudLightning':
      return (
        <svg
          viewBox="0 0 64 64"
          className={`shrink-0 overflow-visible ${className}`}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          {...props}
        >
          <defs>
            <linearGradient id="stormCloudGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#475569" />
              <stop offset="100%" stopColor="#1E293B" />
            </linearGradient>
            <filter id="lightningGlow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="3" result="glow" />
              <feComposite in="SourceGraphic" in2="glow" operator="over" />
            </filter>
          </defs>
          {/* Pulsing Storm Cloud */}
          <path
            d="M44 36H19C14 36 10 32 10 27C10 22.5 13.2 18.8 17.8 18.1C19 11.8 24.4 7 31 7C38.7 7 45 13.3 45 21C48.3 21.8 51 24.8 51 28.5C51 32.6 47.9 36 44 36Z"
            fill="url(#stormCloudGrad)"
            stroke="#334155"
            strokeWidth="1.5"
            className="animate-storm-cloud"
          />
          {/* Crackling High-Voltage Lightning Bolt */}
          <path
            d="M33 30L26 42H32L28 57L40 40H34L37 30H33Z"
            fill="#FBBF24"
            stroke="#F59E0B"
            strokeWidth="1"
            filter="url(#lightningGlow)"
            className="animate-lightning-flash"
          />
        </svg>
      );

    case 'CloudFog':
      return (
        <svg
          viewBox="0 0 64 64"
          className={`shrink-0 overflow-visible ${className}`}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          {...props}
        >
          <defs>
            <linearGradient id="fogGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#94A3B8" stopOpacity="0.3" />
              <stop offset="50%" stopColor="#CBD5E1" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#94A3B8" stopOpacity="0.3" />
            </linearGradient>
          </defs>
          {/* 4 Oscillating Vapor Layers */}
          <line x1="14" y1="18" x2="50" y2="18" stroke="url(#fogGrad)" strokeWidth="3.5" strokeLinecap="round" className="animate-fog-1" />
          <line x1="8" y1="27" x2="56" y2="27" stroke="url(#fogGrad)" strokeWidth="4" strokeLinecap="round" className="animate-fog-2" />
          <line x1="12" y1="36" x2="52" y2="36" stroke="url(#fogGrad)" strokeWidth="3.5" strokeLinecap="round" className="animate-fog-3" />
          <line x1="10" y1="45" x2="54" y2="45" stroke="url(#fogGrad)" strokeWidth="3.5" strokeLinecap="round" className="animate-fog-4" />
        </svg>
      );

    case 'Wind':
      return (
        <svg
          viewBox="0 0 64 64"
          className={`shrink-0 overflow-visible ${className}`}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          {...props}
        >
          <defs>
            <linearGradient id="windStreamGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#0EA5E9" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#38BDF8" stopOpacity="1" />
            </linearGradient>
          </defs>
          {/* Animated streaming aerodynamic curves */}
          <path
            d="M8 22H42C46.4 22 50 18.4 50 14C50 9.6 46.4 6 42 6C37.6 6 34 9.6 34 14"
            stroke="url(#windStreamGrad)"
            strokeWidth="3.2"
            strokeLinecap="round"
            className="animate-wind-stream-1"
          />
          <path
            d="M6 32H48C52.4 32 56 35.6 56 40C56 44.4 52.4 48 48 48C43.6 48 40 44.4 40 40"
            stroke="url(#windStreamGrad)"
            strokeWidth="3.2"
            strokeLinecap="round"
            className="animate-wind-stream-2"
          />
          <path
            d="M10 42H30C33.3 42 36 44.7 36 48C36 51.3 33.3 54 30 54C26.7 54 24 51.3 24 48"
            stroke="url(#windStreamGrad)"
            strokeWidth="3.2"
            strokeLinecap="round"
            className="animate-wind-stream-3"
          />
        </svg>
      );

    case 'Cloud':
    default:
      return (
        <svg
          viewBox="0 0 64 64"
          className={`shrink-0 overflow-visible ${className}`}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          {...props}
        >
          <defs>
            <linearGradient id="overcastBackGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#CBD5E1" />
              <stop offset="100%" stopColor="#94A3B8" />
            </linearGradient>
            <linearGradient id="overcastFrontGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="100%" stopColor="#E2E8F0" />
            </linearGradient>
          </defs>
          {/* Back parallax cloud */}
          <path
            d="M50 34H26C21.6 34 18 30.4 18 26C18 22 20.8 18.7 24.8 18.1C25.8 12.8 30.4 9 36 9C42.6 9 48 14.4 48 21C50.8 21.6 53 24 53 27C53 30.9 50 34 50 34Z"
            fill="url(#overcastBackGrad)"
            className="animate-cloud-drift-reverse"
          />
          {/* Front floating cloud */}
          <path
            d="M44 48H19C14 48 10 44 10 39C10 34.5 13.2 30.8 17.8 30.1C19 23.8 24.4 19 31 19C38.7 19 45 25.3 45 33C48.3 33.8 51 36.8 51 40.5C51 44.6 47.9 48 44 48Z"
            fill="url(#overcastFrontGrad)"
            stroke="#94A3B8"
            strokeWidth="1.5"
            className="animate-cloud-drift"
          />
        </svg>
      );
  }
}
