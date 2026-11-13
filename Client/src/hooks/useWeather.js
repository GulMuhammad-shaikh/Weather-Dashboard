import { useState, useEffect, useCallback, useRef } from 'react';
import { fetchWeather, getCachedLastWeather, getCachedLastCity } from '../services/api';

const STORAGE_UNIT_KEY = 'weatherpulse_unit';
const AUTO_REFRESH_INTERVAL_MS = 15 * 60 * 1000; // 15 minutes auto-refresh

export function useWeather() {
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [isCached, setIsCached] = useState(false);

  // Keep references to active location and timestamp for auto-sync & day rollover
  const activeCityRef = useRef(null);
  const lastFetchTimeRef = useRef(Date.now());
  const lastCalendarDayRef = useRef(new Date().toDateString());

  // Initial unit from localStorage (persisted across sessions), defaulting to Celsius
  const [unit, setUnit] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_UNIT_KEY) || localStorage.getItem('weatherboard_unit');
      return stored === 'F' ? 'F' : 'C';
    } catch {
      return 'C';
    }
  });

  // Cross-tab synchronization via storage event listener
  useEffect(() => {
    const handleStorageChange = (e) => {
      if ((e.key === STORAGE_UNIT_KEY || e.key === 'weatherboard_unit') && (e.newValue === 'C' || e.newValue === 'F')) {
        setUnit(e.newValue);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Persist temperature unit preference across sessions & update reactively without reload
  const toggleUnit = useCallback(() => {
    setUnit((prevUnit) => {
      const nextUnit = prevUnit === 'C' ? 'F' : 'C';
      try {
        localStorage.setItem(STORAGE_UNIT_KEY, nextUnit);
      } catch (e) {
        console.warn('Could not persist unit to localStorage:', e);
      }
      return nextUnit;
    });
  }, []);

  const setTemperatureUnit = useCallback((newUnit) => {
    if (newUnit !== 'C' && newUnit !== 'F') return;
    setUnit(newUnit);
    try {
      localStorage.setItem(STORAGE_UNIT_KEY, newUnit);
    } catch (e) {
      console.warn('Could not persist unit to localStorage:', e);
    }
  }, []);

  // Load weather for city
  const loadCity = useCallback(async (lat, lon, cityName = '', showSpinner = true) => {
    if (showSpinner) setLoading(true);
    setError(null);

    // Track active coordinates for periodic background refresh
    activeCityRef.current = { lat, lon, name: cityName };

    // If offline, try immediate cache
    if (!navigator.onLine) {
      const cached = getCachedLastWeather();
      if (cached) {
        setWeatherData(cached);
        setIsCached(true);
        setLoading(false);
        return;
      }
    }

    try {
      const { data, fromCache } = await fetchWeather(lat, lon, cityName);
      setWeatherData(data);
      setIsCached(fromCache);
      lastFetchTimeRef.current = Date.now();
      lastCalendarDayRef.current = new Date().toDateString();
    } catch (err) {
      console.error('Failed to load city:', err);
      // Fallback to cache if available
      const cached = getCachedLastWeather();
      if (cached) {
        setWeatherData(cached);
        setIsCached(true);
        setError('Working offline. Showing last cached forecast.');
      } else {
        setError(err.message || 'Unable to retrieve weather. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // 1. Initial Load on Mount
  useEffect(() => {
    const cachedCity = getCachedLastCity();
    const cachedWeather = getCachedLastWeather();

    if (cachedWeather) {
      // Show cached weather immediately for instantaneous first paint
      setWeatherData(cachedWeather);
      setIsCached(true);
      setLoading(false);
    }

    if (navigator.onLine) {
      if (cachedCity && cachedCity.lat && cachedCity.lon) {
        loadCity(cachedCity.lat, cachedCity.lon, cachedCity.name, !cachedWeather);
      } else {
        // Default to London, Karachi, or Tokyo
        loadCity(24.8608, 67.0104, 'Karachi', !cachedWeather);
      }
    } else {
      setIsOffline(true);
      setLoading(false);
    }
  }, [loadCity]);

  // 2. Continuous 15-Minute Background Auto-Refresh
  useEffect(() => {
    const timer = setInterval(() => {
      if (activeCityRef.current && navigator.onLine) {
        const { lat, lon, name } = activeCityRef.current;
        console.log(`[Auto-Refresh] Updating live forecast for ${name || 'current city'}...`);
        loadCity(lat, lon, name, false);
      }
    }, AUTO_REFRESH_INTERVAL_MS);

    return () => clearInterval(timer);
  }, [loadCity]);

  // 3. Tab Visibility, Screen Unlock, and Midnight Day-Rollover Auto-Sync
  useEffect(() => {
    const handleVisibilityOrFocus = () => {
      if (document.visibilityState === 'visible' && navigator.onLine && activeCityRef.current) {
        const now = Date.now();
        const currentCalendarDay = new Date().toDateString();
        const isNewDay = currentCalendarDay !== lastCalendarDayRef.current;
        const isStale = (now - lastFetchTimeRef.current) > (10 * 60 * 1000); // 10 mins

        if (isNewDay || isStale) {
          console.log(`[Day/Wakeup Auto-Sync] Refreshing weather (New Day: ${isNewDay}, Stale: ${isStale})...`);
          const { lat, lon, name } = activeCityRef.current;
          loadCity(lat, lon, name, false);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityOrFocus);
    window.addEventListener('focus', handleVisibilityOrFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityOrFocus);
      window.removeEventListener('focus', handleVisibilityOrFocus);
    };
  }, [loadCity]);

  // 4. Online/Offline Network Status Listeners
  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      if (activeCityRef.current) {
        const { lat, lon, name } = activeCityRef.current;
        loadCity(lat, lon, name, false);
      }
    };

    const handleOffline = () => {
      setIsOffline(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [loadCity]);

  return {
    weatherData,
    loading,
    error,
    isOffline,
    isCached,
    unit,
    toggleUnit,
    setTemperatureUnit,
    loadCity
  };
}
