import { useState, useEffect, useCallback, useRef } from 'react';
import { getFavorites, addFavorite, removeFavorite } from '../services/api';

const STORAGE_KEY = 'weatherpulse_favorites';
export const MAX_FAVORITES = 5;

// Check if localStorage is available and writable
function checkLocalStorageAvailable() {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return false;
    const testKey = '__wb_storage_test__';
    window.localStorage.setItem(testKey, testKey);
    window.localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

// In-memory session store fallback when localStorage is disabled or throws
let memoryStoreFallback = [];

export function useFavorites() {
  const isStorageSupported = useRef(checkLocalStorageAvailable()).current;

  // Initial load from localStorage with memory fallback
  const [favorites, setFavorites] = useState(() => {
    if (isStorageSupported) {
      try {
        const stored = window.localStorage.getItem(STORAGE_KEY) || window.localStorage.getItem('weatherboard_favorites');
        if (stored) {
          const parsed = JSON.parse(stored);
          return Array.isArray(parsed) ? parsed.slice(0, MAX_FAVORITES) : [];
        }
      } catch (e) {
        console.warn('Failed to parse localStorage favorites:', e);
      }
    }
    return memoryStoreFallback.slice(0, MAX_FAVORITES);
  });

  const [loadingFavs, setLoadingFavs] = useState(false);
  const [favoritesMessage, setFavoritesMessage] = useState(null);
  const [cityPendingRemoval, setCityPendingRemoval] = useState(null);

  // Sync to localStorage or memory fallback
  const persistFavorites = useCallback((favList) => {
    const trimmed = favList.slice(0, MAX_FAVORITES);
    if (isStorageSupported) {
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
      } catch (err) {
        console.warn('localStorage write failed, degrading to memory fallback:', err);
        memoryStoreFallback = trimmed;
      }
    } else {
      memoryStoreFallback = trimmed;
    }
  }, [isStorageSupported]);

  // Sync with backend API on mount
  useEffect(() => {
    async function syncRemote() {
      try {
        setLoadingFavs(true);
        const remoteList = await getFavorites();
        if (Array.isArray(remoteList) && remoteList.length > 0) {
          setFavorites((prev) => {
            // Merge remote items without exceeding limit
            const mergedMap = new Map();
            prev.forEach((f) => mergedMap.set(f.name.toLowerCase(), f));
            remoteList.forEach((f) => {
              if (!mergedMap.has(f.name.toLowerCase())) {
                mergedMap.set(f.name.toLowerCase(), f);
              }
            });
            const merged = Array.from(mergedMap.values()).slice(0, MAX_FAVORITES);
            persistFavorites(merged);
            return merged;
          });
        }
      } catch (err) {
        console.warn('Remote favorites sync failed, operating with local state:', err);
      } finally {
        setLoadingFavs(false);
      }
    }

    syncRemote();
  }, [persistFavorites]);

  // Check if a city is in favorites
  const isFavorite = useCallback((cityName) => {
    if (!cityName) return false;
    const cleanName = cityName.split(',')[0].trim().toLowerCase();
    return favorites.some((f) => f.name.toLowerCase() === cleanName);
  }, [favorites]);

  // Add a city with max limit validation
  const addCityToFavorites = useCallback(async (location) => {
    if (!location || !location.name) return { success: false, reason: 'invalid_location' };

    const cleanName = location.name.split(',')[0].trim();

    // 1. Validation: Limit of 5 favourite cities
    if (favorites.length >= MAX_FAVORITES) {
      setFavoritesMessage({
        type: 'limit',
        text: `Favorite limit reached (${MAX_FAVORITES}/${MAX_FAVORITES} cities). Please remove a city before saving a new one.`
      });
      return { success: false, reason: 'limit_reached' };
    }

    // 2. Validation: Prevent duplicates
    if (favorites.some((f) => f.name.toLowerCase() === cleanName.toLowerCase())) {
      setFavoritesMessage({
        type: 'info',
        text: `${cleanName} is already in your favorites.`
      });
      return { success: false, reason: 'already_exists' };
    }

    const country = location.name.includes(',') ? location.name.split(',')[1].trim() : (location.country || '');
    const newFavorite = {
      _id: `fav_${Date.now()}`,
      name: cleanName,
      country,
      latitude: location.latitude,
      longitude: location.longitude,
      timezone: location.timezone || 'auto'
    };

    const updatedList = [newFavorite, ...favorites].slice(0, MAX_FAVORITES);
    setFavorites(updatedList);
    persistFavorites(updatedList);

    setFavoritesMessage({
      type: 'success',
      text: `⭐ ${cleanName} saved to favorite cities (${updatedList.length}/${MAX_FAVORITES}).`
    });

    // Remote persistence
    try {
      await addFavorite({
        name: cleanName,
        country,
        latitude: location.latitude,
        longitude: location.longitude,
        timezone: location.timezone || 'auto'
      });
    } catch (e) {
      console.warn('Backend favorite save failed, local persistence preserved:', e);
    }

    return { success: true };
  }, [favorites, persistFavorites]);

  // Trigger confirmation dialog for removal
  const requestRemoveFavorite = useCallback((idOrName, cityName) => {
    const nameToDisplay = cityName || (typeof idOrName === 'string' ? idOrName : 'this city');
    setCityPendingRemoval({
      id: idOrName,
      name: nameToDisplay
    });
  }, []);

  // Confirm removal after dialog confirmation
  const confirmRemoveFavorite = useCallback(async () => {
    if (!cityPendingRemoval) return;

    const { id, name } = cityPendingRemoval;
    const cleanName = name.split(',')[0].trim().toLowerCase();

    const updatedList = favorites.filter(
      (f) => f._id !== id && f.name.toLowerCase() !== cleanName
    );

    setFavorites(updatedList);
    persistFavorites(updatedList);
    setCityPendingRemoval(null);

    setFavoritesMessage({
      type: 'info',
      text: `${name} has been removed from favorites (${updatedList.length}/${MAX_FAVORITES}).`
    });

    try {
      await removeFavorite(id || name);
    } catch (err) {
      console.warn('Backend removal sync failed, local removal preserved:', err);
    }
  }, [cityPendingRemoval, favorites, persistFavorites]);

  // Cancel removal
  const cancelRemoveFavorite = useCallback(() => {
    setCityPendingRemoval(null);
  }, []);

  // Toggle favorite helper
  const toggleFavorite = useCallback(async (location) => {
    if (!location) return;
    const cleanName = location.name.split(',')[0].trim();
    const existing = favorites.find((f) => f.name.toLowerCase() === cleanName.toLowerCase());

    if (existing) {
      // Must ask for confirmation before removing
      requestRemoveFavorite(existing._id || existing.name, existing.name);
    } else {
      // Add with limit validation
      await addCityToFavorites(location);
    }
  }, [favorites, requestRemoveFavorite, addCityToFavorites]);

  return {
    favorites,
    loadingFavs,
    isFavorite,
    toggleFavorite,
    addCityToFavorites,
    requestRemoveFavorite,
    confirmRemoveFavorite,
    cancelRemoveFavorite,
    cityPendingRemoval,
    favoritesMessage,
    setFavoritesMessage,
    isStorageSupported,
    maxLimit: MAX_FAVORITES
  };
}
