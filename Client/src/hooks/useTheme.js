import { useState, useEffect, useCallback } from 'react';

const THEME_STORAGE_KEY = 'weatherpulse_theme';

export function useTheme() {
  // 'dark' | 'light' | 'system'
  const [themeMode, setThemeMode] = useState(() => {
    try {
      const stored = localStorage.getItem(THEME_STORAGE_KEY) || localStorage.getItem('weatherboard_theme');
      if (stored === 'dark' || stored === 'light' || stored === 'system') {
        return stored;
      }
    } catch {}
    return 'system';
  });

  // Returns actual active theme: 'dark' or 'light'
  const getSystemTheme = () => {
    if (typeof window === 'undefined') return 'dark';
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
  };

  const [resolvedTheme, setResolvedTheme] = useState(() => {
    if (themeMode === 'system') return getSystemTheme();
    return themeMode;
  });

  // Apply class to <html> and update <meta name="theme-color">
  const applyTheme = useCallback((theme) => {
    const root = document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);

    // Update meta theme-color for PWA header bar
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', theme === 'dark' ? '#0f172a' : '#f0f9ff');
    }
  }, []);

  // Update theme when themeMode changes or system preference changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const updateResolved = () => {
      let active = themeMode;
      if (themeMode === 'system') {
        active = mediaQuery.matches ? 'dark' : 'light';
      }
      setResolvedTheme(active);
      applyTheme(active);
    };

    updateResolved();

    // Listen to OS system preference changes in real-time
    const handleSystemChange = () => {
      if (themeMode === 'system') {
        updateResolved();
      }
    };

    mediaQuery.addEventListener('change', handleSystemChange);
    return () => mediaQuery.removeEventListener('change', handleSystemChange);
  }, [themeMode, applyTheme]);

  // Set theme mode and persist to localStorage
  const setTheme = (mode) => {
    setThemeMode(mode);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, mode);
    } catch {}
  };

  // Toggle or cycle between themes: dark -> light -> system -> dark
  const cycleTheme = () => {
    if (themeMode === 'dark') setTheme('light');
    else if (themeMode === 'light') setTheme('system');
    else setTheme('dark');
  };

  const toggleDarkLight = () => {
    const next = resolvedTheme === 'dark' ? 'light' : 'dark';
    setTheme(next);
  };

  return {
    themeMode,      // 'dark' | 'light' | 'system'
    resolvedTheme,  // 'dark' | 'light'
    setTheme,
    cycleTheme,
    toggleDarkLight
  };
}
