import { useState, useEffect, useCallback } from 'react';
import { fetchWeather, getCachedLastWeather, getCachedLastCity } from '../services/api';

const STORAGE_UNIT_KEY = 'weatherpulse_unit';

export function useWeather() {
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [isCached, setIsCached] = useState(false);

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

  // Initial load
  useEffect(() => {
    const cachedCity = getCachedLastCity();
    const cachedWeather = getCachedLastWeather();

    if (cachedWeather) {
      // Show cached weather immediately for instant load
      setWeatherData(cachedWeather);
      setIsCached(true);
      setLoading(false);
    }

    if (navigator.onLine) {
      if (cachedCity && cachedCity.lat && cachedCity.lon) {
        loadCity(cachedCity.lat, cachedCity.lon, cachedCity.name, !cachedWeather);
      } else {
        // Default to London or Tokyo
        loadCity(51.5074, -0.1278, 'London', !cachedWeather);
      }
    } else {
      setIsOffline(true);
      setLoading(false);
    }
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
