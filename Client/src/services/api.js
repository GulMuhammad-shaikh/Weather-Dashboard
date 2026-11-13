const API_BASE_URL = 
  import.meta.env.VITE_API_URL || 
  import.meta.env.VITE_API_BASE_URL || 
  (typeof window !== 'undefined' && window.location.hostname.includes('vercel.app')
    ? 'https://weather-dashboard-backend-one.vercel.app'
    : '');

const CACHE_LAST_WEATHER = 'weatherpulse_last_weather';
const CACHE_LAST_CITY = 'weatherpulse_last_city';
const CACHE_FAVORITES = 'weatherpulse_cached_favorites';

export async function fetchWeather(lat, lon, city = '') {
  try {
    const params = new URLSearchParams();
    if (lat !== undefined && lon !== undefined) {
      params.append('lat', lat);
      params.append('lon', lon);
    }
    if (city) {
      params.append('city', city);
    }

    const res = await fetch(`${API_BASE_URL}/api/weather/current?${params.toString()}`);
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.message || `Weather fetch failed: ${res.statusText}`);
    }
    const data = await res.json();

    // Cache successful fetch as last viewed city
    try {
      localStorage.setItem(CACHE_LAST_WEATHER, JSON.stringify(data));
      localStorage.setItem(CACHE_LAST_CITY, JSON.stringify({
        name: data.location.name,
        lat: data.location.latitude,
        lon: data.location.longitude,
        timestamp: Date.now()
      }));
    } catch (e) {
      console.warn('Could not cache weather to localStorage', e);
    }

    return { data, fromCache: false };
  } catch (err) {
    console.warn('Network weather fetch failed, attempting cached fallback...', err.message);
    const cached = getCachedLastWeather();
    if (cached) {
      return { data: cached, fromCache: true };
    }
    throw err;
  }
}

export function getCachedLastWeather() {
  try {
    const cached = localStorage.getItem(CACHE_LAST_WEATHER) || localStorage.getItem('weatherboard_last_weather');
    return cached ? JSON.parse(cached) : null;
  } catch {
    return null;
  }
}

export function getCachedLastCity() {
  try {
    const cached = localStorage.getItem(CACHE_LAST_CITY) || localStorage.getItem('weatherboard_last_city');
    return cached ? JSON.parse(cached) : null;
  } catch {
    return null;
  }
}

/**
 * Validated GeoDB Cities Autocomplete Search
 * Returns { results: Array, source: String, error: String|null }
 */
export async function searchCities(query) {
  if (!query || query.trim().length === 0) {
    return { results: [], source: '', error: null };
  }

  const trimmed = query.trim();
  if (trimmed.length < 2) {
    return {
      results: [],
      source: '',
      error: 'Please enter at least 2 characters to search'
    };
  }

  try {
    const res = await fetch(`${API_BASE_URL}/api/weather/search?q=${encodeURIComponent(trimmed)}`);
    const json = await res.json().catch(() => ({}));

    if (!res.ok) {
      const errMsg = json.message || json.error || `GeoDB Cities API error (${res.status})`;
      return { results: [], source: 'Error', error: errMsg };
    }

    const results = Array.isArray(json.data) ? json.data : (Array.isArray(json) ? json : []);
    const source = json.source || (results[0]?.source) || 'GeoDB Cities API';

    return { results, source, error: null };
  } catch (err) {
    console.error('GeoDB Cities Search error:', err);
    return {
      results: [],
      source: 'Error',
      error: 'Network error connecting to GeoDB search service. Check connection.'
    };
  }
}

export async function getFavorites() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/favorites`);
    if (!res.ok) throw new Error('Favorites request failed');
    const data = await res.json();
    try {
      localStorage.setItem(CACHE_FAVORITES, JSON.stringify(data));
    } catch {}
    return data;
  } catch (err) {
    console.warn('Failed to fetch remote favorites, using local cache:', err.message);
    try {
      const cached = localStorage.getItem(CACHE_FAVORITES);
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  }
}

export async function addFavorite(city) {
  try {
    const res = await fetch(`${API_BASE_URL}/api/favorites`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(city)
    });
    if (!res.ok) throw new Error('Failed to add favorite');
    return await res.json();
  } catch (err) {
    console.error('Error adding favorite:', err);
    throw err;
  }
}

export async function removeFavorite(id) {
  try {
    const res = await fetch(`${API_BASE_URL}/api/favorites/${id}`, {
      method: 'DELETE'
    });
    if (!res.ok) throw new Error('Failed to remove favorite');
    return await res.json();
  } catch (err) {
    console.error('Error removing favorite:', err);
    throw err;
  }
}

export async function getVapidPublicKey() {
  const res = await fetch(`${API_BASE_URL}/api/notifications/vapid-public-key`);
  if (!res.ok) throw new Error('Failed to fetch VAPID key');
  const data = await res.json();
  return data.publicKey;
}

export async function subscribeToPush(subscription, cityName, lat, lon, notificationTime = '08:00') {
  const res = await fetch(`${API_BASE_URL}/api/notifications/subscribe`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      subscription,
      cityName,
      latitude: lat,
      longitude: lon,
      notificationTime
    })
  });
  if (!res.ok) throw new Error('Subscription API failed');
  return await res.json();
}

export async function sendTestPushNotification(subscription, cityName) {
  const res = await fetch(`${API_BASE_URL}/api/notifications/test`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ subscription, cityName })
  });
  if (!res.ok) throw new Error('Test push notification failed');
  return await res.json();
}
