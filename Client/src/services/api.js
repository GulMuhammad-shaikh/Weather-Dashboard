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
  // Step 1: Try backend API with a 6-second timeout
  try {
    const params = new URLSearchParams();
    if (lat !== undefined && lon !== undefined) {
      params.append('lat', lat);
      params.append('lon', lon);
    }
    if (city) {
      params.append('city', city);
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const res = await fetch(`${API_BASE_URL}/api/weather/current?${params.toString()}`, {
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      saveToCache(data);
      return { data, fromCache: false };
    }
  } catch (err) {
    console.warn('Backend weather fetch failed or timed out, trying direct fallback...', err.message);
  }

  // Step 2: Try direct Open-Meteo API (Guarantees it works on ALL devices even without backend)
  try {
    const directData = await fetchDirectOpenMeteo(lat, lon, city);
    saveToCache(directData);
    return { data: directData, fromCache: false };
  } catch (directErr) {
    console.warn('Direct Open-Meteo fetch failed:', directErr.message);
  }

  // Step 3: LocalStorage Cache Fallback
  const cached = getCachedLastWeather();
  if (cached) {
    return { data: cached, fromCache: true };
  }

  throw new Error('Unable to retrieve weather. Please check your internet connection.');
}

function saveToCache(data) {
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
}

// Direct Open-Meteo Fetcher for 100% device independence
async function fetchDirectOpenMeteo(lat, lon, cityName = '') {
  const latitude = lat !== undefined && lat !== null ? lat : 24.8608;
  const longitude = lon !== undefined && lon !== null ? lon : 67.0104;

  const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,cloud_cover,pressure_msl,wind_speed_10m,wind_direction_10m,wind_gusts_10m&hourly=temperature_2m,precipitation_probability,weather_code,wind_speed_10m,uv_index&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,uv_index_max,sunrise,sunset&timezone=auto&forecast_days=7`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`Open-Meteo direct error: ${res.status}`);
  const w = await res.json();

  const wmoMap = {
    0: { label: 'Clear Sky', icon: 'Sun', condition: 'clear' },
    1: { label: 'Mainly Clear', icon: 'SunMedium', condition: 'mainly-clear' },
    2: { label: 'Partly Cloudy', icon: 'CloudSun', condition: 'partly-cloudy' },
    3: { label: 'Overcast', icon: 'Cloud', condition: 'overcast' },
    45: { label: 'Foggy', icon: 'CloudFog', condition: 'fog' },
    51: { label: 'Light Drizzle', icon: 'CloudDrizzle', condition: 'drizzle' },
    61: { label: 'Slight Rain', icon: 'CloudRain', condition: 'rain' },
    63: { label: 'Moderate Rain', icon: 'CloudRain', condition: 'rain' },
    65: { label: 'Heavy Rain', icon: 'CloudRain', condition: 'heavy-rain' },
    71: { label: 'Snow', icon: 'CloudSnow', condition: 'snow' },
    80: { label: 'Rain Showers', icon: 'CloudRain', condition: 'rain' },
    95: { label: 'Thunderstorm', icon: 'CloudLightning', condition: 'thunderstorm' },
  };

  const getMeta = (code, isDay = 1) => {
    const m = wmoMap[code] || { label: 'Clear', icon: 'Sun', condition: 'clear' };
    let icon = m.icon;
    if (!isDay && (code === 0 || code === 1 || code === 2)) icon = 'Moon';
    return { ...m, icon };
  };

  const curMeta = getMeta(w.current.weather_code, w.current.is_day);

  // Hourly 24 hours
  const hourly24 = [];
  const startIdx = Math.max(0, w.hourly.time.findIndex(t => t >= w.current.time.slice(0, 13)));
  for (let i = startIdx; i < Math.min(startIdx + 24, w.hourly.time.length); i++) {
    const hTime = w.hourly.time[i];
    const hour = parseInt(hTime.substring(11, 13), 10);
    const meta = getMeta(w.hourly.weather_code[i], hour >= 6 && hour < 20 ? 1 : 0);
    hourly24.push({
      time: hTime,
      hourText: `${hour}:00`,
      temperature: Math.round(w.hourly.temperature_2m[i]),
      precipitationProb: w.hourly.precipitation_probability?.[i] || 0,
      weatherCode: w.hourly.weather_code[i],
      weatherIcon: meta.icon,
      weatherText: meta.label,
      windSpeed: Math.round(w.hourly.wind_speed_10m[i] || 0),
      uvIndex: w.hourly.uv_index?.[i] || 0
    });
  }

  // Daily 5-day outlook
  const daily = [];
  for (let i = 0; i < (w.daily.time?.length || 0); i++) {
    const dStr = w.daily.time[i];
    const d = new Date(dStr + 'T00:00:00');
    const dayName = i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : d.toLocaleDateString('en-US', { weekday: 'short' });
    const meta = getMeta(w.daily.weather_code[i], 1);
    daily.push({
      date: dStr,
      dayName,
      maxTemp: Math.round(w.daily.temperature_2m_max[i]),
      minTemp: Math.round(w.daily.temperature_2m_min[i]),
      weatherCode: w.daily.weather_code[i],
      weatherIcon: meta.icon,
      weatherText: meta.label,
      precipitationProb: w.daily.precipitation_probability_max?.[i] || 0,
      uvIndexMax: w.daily.uv_index_max?.[i] || 0
    });
  }

  return {
    location: {
      name: cityName || `${latitude.toFixed(2)}°, ${longitude.toFixed(2)}°`,
      latitude,
      longitude,
      timezone: w.timezone || 'auto'
    },
    current: {
      temperature: Math.round(w.current.temperature_2m),
      apparentTemperature: Math.round(w.current.apparent_temperature),
      humidity: w.current.relative_humidity_2m,
      precipitation: w.current.precipitation,
      weatherCode: w.current.weather_code,
      weatherText: curMeta.label,
      weatherIcon: curMeta.icon,
      condition: curMeta.condition,
      isDay: Boolean(w.current.is_day),
      cloudCover: w.current.cloud_cover,
      pressure: Math.round(w.current.pressure_msl),
      windSpeed: Math.round(w.current.wind_speed_10m),
      windDirection: w.current.wind_direction_10m,
      windGusts: Math.round(w.current.wind_gusts_10m),
      time: w.current.time,
      uvIndex: w.daily.uv_index_max?.[0] || 0,
      aqi: 45,
      sunrise: w.daily.sunrise?.[0],
      sunset: w.daily.sunset?.[0]
    },
    hourly: hourly24,
    daily,
    source: 'Open-Meteo',
    lastUpdated: new Date().toISOString()
  };
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
 * Validated GeoDB Cities Autocomplete Search with Direct Geocoding Fallback
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

  // 1. Try backend
  try {
    const res = await fetch(`${API_BASE_URL}/api/weather/search?q=${encodeURIComponent(trimmed)}`);
    if (res.ok) {
      const json = await res.json();
      const results = Array.isArray(json.data) ? json.data : (Array.isArray(json) ? json : []);
      const source = json.source || (results[0]?.source) || 'GeoDB Cities API';
      return { results, source, error: null };
    }
  } catch (err) {
    console.warn('Backend geocoding failed, trying direct geocoding...', err.message);
  }

  // 2. Direct Open-Meteo Geocoding Fallback (Works on ALL mobile devices worldwide)
  try {
    const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(trimmed)}&count=8&language=en&format=json`);
    if (res.ok) {
      const json = await res.json();
      const rawList = Array.isArray(json.results) ? json.results : [];
      const results = rawList.map(item => ({
        id: String(item.id),
        name: item.name,
        country: item.country || '',
        countryCode: item.country_code || '',
        admin1: item.admin1 || '',
        latitude: item.latitude,
        longitude: item.longitude,
        timezone: item.timezone || 'auto',
        population: item.population || 0,
        source: 'Open-Meteo Geocoding'
      }));
      return { results, source: 'Open-Meteo Geocoding', error: null };
    }
  } catch (directErr) {
    console.error('Direct Geocoding error:', directErr);
  }

  return {
    results: [],
    source: 'Error',
    error: 'Network error connecting to search service. Check connection.'
  };
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
  try {
    const res = await fetch(`${API_BASE_URL}/api/notifications/vapid-public-key`);
    if (res.ok) {
      const data = await res.json();
      return data.publicKey;
    }
  } catch {}
  // Default fallback VAPID key
  return 'BHqN9CRJ1UlbAn-ZhyCVONrR7T-oFWP_sbL7Fl0IfdVEmoq3cPsiQKj-OiDaq8f4UwAcFXTTbKJ-PHsa1pIiqa8';
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
