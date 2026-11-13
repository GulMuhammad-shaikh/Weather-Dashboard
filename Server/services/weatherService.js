import axios from 'axios';

// WMO weather code mapping for Open-Meteo fallback
export const WMO_MAP = {
  0: { label: 'Clear Sky', icon: 'Sun', condition: 'clear' },
  1: { label: 'Mainly Clear', icon: 'SunMedium', condition: 'mainly-clear' },
  2: { label: 'Partly Cloudy', icon: 'CloudSun', condition: 'partly-cloudy' },
  3: { label: 'Overcast', icon: 'Cloud', condition: 'overcast' },
  45: { label: 'Foggy', icon: 'CloudFog', condition: 'fog' },
  48: { label: 'Depositing Rime Fog', icon: 'CloudFog', condition: 'fog' },
  51: { label: 'Light Drizzle', icon: 'CloudDrizzle', condition: 'drizzle' },
  53: { label: 'Moderate Drizzle', icon: 'CloudDrizzle', condition: 'drizzle' },
  55: { label: 'Dense Drizzle', icon: 'CloudDrizzle', condition: 'drizzle' },
  56: { label: 'Light Freezing Drizzle', icon: 'CloudSnow', condition: 'snow' },
  57: { label: 'Dense Freezing Drizzle', icon: 'CloudSnow', condition: 'snow' },
  61: { label: 'Slight Rain', icon: 'CloudRain', condition: 'rain' },
  63: { label: 'Moderate Rain', icon: 'CloudRain', condition: 'rain' },
  65: { label: 'Heavy Rain', icon: 'CloudRain', condition: 'heavy-rain' },
  66: { label: 'Light Freezing Rain', icon: 'CloudSnow', condition: 'snow' },
  67: { label: 'Heavy Freezing Rain', icon: 'CloudSnow', condition: 'snow' },
  71: { label: 'Slight Snow', icon: 'CloudSnow', condition: 'snow' },
  73: { label: 'Moderate Snow', icon: 'CloudSnow', condition: 'snow' },
  75: { label: 'Heavy Snow', icon: 'CloudSnow', condition: 'snow' },
  77: { label: 'Snow Grains', icon: 'CloudSnow', condition: 'snow' },
  80: { label: 'Slight Rain Showers', icon: 'CloudRain', condition: 'rain' },
  81: { label: 'Moderate Rain Showers', icon: 'CloudRain', condition: 'rain' },
  82: { label: 'Violent Rain Showers', icon: 'CloudRain', condition: 'heavy-rain' },
  85: { label: 'Slight Snow Showers', icon: 'CloudSnow', condition: 'snow' },
  86: { label: 'Heavy Snow Showers', icon: 'CloudSnow', condition: 'snow' },
  95: { label: 'Thunderstorm', icon: 'CloudLightning', condition: 'thunderstorm' },
  96: { label: 'Thunderstorm with Hail', icon: 'CloudLightning', condition: 'thunderstorm' },
  99: { label: 'Heavy Hail Thunderstorm', icon: 'CloudLightning', condition: 'thunderstorm' },
};

export const getWeatherMeta = (code, isDay = 1) => {
  const meta = WMO_MAP[code] || { label: 'Variable', icon: 'Cloud', condition: 'cloudy' };
  let iconName = meta.icon;
  if (isDay === 0) {
    if (code === 0) iconName = 'Moon';
    else if (code === 1 || code === 2) iconName = 'CloudMoon';
  }
  return {
    ...meta,
    icon: iconName,
    isDay: Boolean(isDay)
  };
};

// Map OpenWeatherMap icon codes to Lucide icon identifiers
export function mapOwmIconToLucide(iconCode = '01d') {
  const isNight = iconCode.endsWith('n');
  const code = iconCode.slice(0, 2);

  switch (code) {
    case '01':
      return isNight ? 'Moon' : 'Sun';
    case '02':
      return isNight ? 'CloudMoon' : 'CloudSun';
    case '03':
    case '04':
      return 'Cloud';
    case '09':
      return 'CloudDrizzle';
    case '10':
      return 'CloudRain';
    case '11':
      return 'CloudLightning';
    case '13':
      return 'CloudSnow';
    case '50':
      return 'CloudFog';
    default:
      return isNight ? 'Moon' : 'Sun';
  }
}

// Map OpenWeatherMap condition strings
export function mapOwmCondition(mainWeather = 'Clear') {
  const m = mainWeather.toLowerCase();
  if (m.includes('clear')) return 'clear';
  if (m.includes('cloud')) return 'partly-cloudy';
  if (m.includes('rain')) return 'rain';
  if (m.includes('drizzle')) return 'drizzle';
  if (m.includes('snow')) return 'snow';
  if (m.includes('thunder')) return 'thunderstorm';
  if (m.includes('fog') || m.includes('mist') || m.includes('haze')) return 'fog';
  return 'clear';
}

// -------------------------------------------------------------
// 1. CITY AUTOCOMPLETE: GeoDB Cities API (RapidAPI) with Open-Meteo Fallback
// -------------------------------------------------------------
export async function searchCities(query, limit = 8) {
  if (!query || query.trim().length === 0) return { results: [], source: 'None', error: null };
  const trimmed = query.trim();

  const rapidApiKey = process.env.RAPIDAPI_KEY;
  const rapidApiHost = process.env.RAPIDAPI_HOST || 'wft-geo-db.p.rapidapi.com';

  // Try GeoDB Cities API via RapidAPI if key is available
  if (rapidApiKey && rapidApiKey.trim() !== '') {
    try {
      console.log(`[GeoDB API] Searching for '${trimmed}' (limit: ${limit})...`);
      const response = await axios.get('https://wft-geo-db.p.rapidapi.com/v1/geo/cities', {
        params: {
          namePrefix: trimmed,
          limit,
          sort: '-population'
        },
        headers: {
          'X-RapidAPI-Key': rapidApiKey.trim(),
          'X-RapidAPI-Host': rapidApiHost
        },
        timeout: 4000
      });

      if (response.data && response.data.data) {
        const results = response.data.data.map(item => ({
          id: `${item.id}`,
          name: item.city || item.name,
          country: item.country || '',
          countryCode: item.countryCode || '',
          admin1: item.region || '',
          latitude: item.latitude,
          longitude: item.longitude,
          population: item.population,
          source: 'GeoDB Cities API'
        }));
        return { results, source: 'GeoDB Cities API', error: null };
      }
    } catch (rapidErr) {
      console.warn(`[GeoDB API Warning] (${rapidErr.response?.status || rapidErr.message}). Switching to Open-Meteo Geocoding fallback.`);
    }
  }

  // Fallback to Open-Meteo Geocoding API
  try {
    const res = await axios.get('https://geocoding-api.open-meteo.com/v1/search', {
      params: {
        name: trimmed,
        count: limit,
        language: 'en',
        format: 'json'
      },
      timeout: 5000
    });

    if (!res.data || !res.data.results) {
      return { results: [], source: 'Open-Meteo Geocoding', error: null };
    }

    const results = res.data.results.map(city => ({
      id: `${city.id}`,
      name: city.name,
      country: city.country || '',
      countryCode: city.country_code || '',
      admin1: city.admin1 || '',
      latitude: city.latitude,
      longitude: city.longitude,
      timezone: city.timezone || 'auto',
      elevation: city.elevation,
      population: city.population,
      source: 'Open-Meteo Geocoding'
    }));

    return { results, source: 'Open-Meteo Geocoding', error: null };
  } catch (err) {
    console.error('Error in searchCities fallback:', err.message);
    return {
      results: [],
      source: 'Failed',
      error: 'Unable to reach GeoDB Cities or geocoding services. Check internet connection.'
    };
  }
}

// -------------------------------------------------------------
// 2. PRIMARY WEATHER: OpenWeatherMap API
// -------------------------------------------------------------
async function fetchFromOpenWeatherMap(lat, lon, cityName = '', apiKey) {
  console.log(`[OpenWeatherMap] Fetching weather for ${cityName || `${lat},${lon}`}...`);

  // Current weather
  const currentPromise = axios.get('https://api.openweathermap.org/data/2.5/weather', {
    params: {
      lat,
      lon,
      units: 'metric',
      appid: apiKey
    },
    timeout: 5000
  });

  // 5-day / 3-hour forecast
  const forecastPromise = axios.get('https://api.openweathermap.org/data/2.5/forecast', {
    params: {
      lat,
      lon,
      units: 'metric',
      appid: apiKey
    },
    timeout: 5000
  });

  // Air Pollution API (OpenWeatherMap free tier)
  const aqiPromise = axios.get('https://api.openweathermap.org/data/2.5/air_pollution', {
    params: { lat, lon, appid: apiKey },
    timeout: 4000
  }).catch(() => ({ data: null }));

  const [currentRes, forecastRes, aqiRes] = await Promise.all([currentPromise, forecastPromise, aqiPromise]);

  const curr = currentRes.data;
  const fcast = forecastRes.data;
  const aqiData = aqiRes.data;

  const isDay = curr.weather[0]?.icon?.endsWith('d') ?? true;
  const weatherIcon = mapOwmIconToLucide(curr.weather[0]?.icon);
  const condition = mapOwmCondition(curr.weather[0]?.main);

  // Convert OpenWeatherMap AQI (1: Good, 2: Fair, 3: Moderate, 4: Poor, 5: Very Poor) to standard AQI scale
  const rawAqi = aqiData?.list?.[0]?.main?.aqi || 2;
  const aqiScore = rawAqi === 1 ? 35 : rawAqi === 2 ? 65 : rawAqi === 3 ? 110 : rawAqi === 4 ? 160 : 210;

  // Format 24-hour forecast from first 8 entries of 3-hour forecast
  const hourly24 = (fcast.list || []).slice(0, 8).map(item => {
    const d = new Date(item.dt * 1000);
    const hours = d.getHours();
    const hourText = `${hours}:00`;
    const hIcon = mapOwmIconToLucide(item.weather[0]?.icon);

    return {
      time: item.dt_txt,
      hourText,
      temperature: Math.round(item.main.temp),
      precipitationProb: Math.round((item.pop || 0) * 100),
      weatherIcon: hIcon,
      weatherText: item.weather[0]?.main || 'Clear',
      windSpeed: Math.round((item.wind?.speed || 0) * 3.6), // convert m/s to km/h
      uvIndex: 3
    };
  });

  // Group forecast by day (for 5 days)
  const dayGroups = {};
  for (const item of fcast.list || []) {
    const dayKey = item.dt_txt.slice(0, 10);
    if (!dayGroups[dayKey]) {
      dayGroups[dayKey] = [];
    }
    dayGroups[dayKey].push(item);
  }

  const dailyForecast = Object.keys(dayGroups).slice(0, 5).map((dateKey, index) => {
    const entries = dayGroups[dateKey];
    const temps = entries.map(e => e.main.temp);
    const minTemp = Math.round(Math.min(...temps));
    const maxTemp = Math.round(Math.max(...temps));

    // Midday entry (around 12:00) or first entry
    const midEntry = entries.find(e => e.dt_txt.includes('12:00')) || entries[Math.floor(entries.length / 2)];
    const d = new Date(dateKey + 'T00:00:00');
    const dayName = index === 0 ? 'Today' : index === 1 ? 'Tomorrow' : d.toLocaleDateString('en-US', { weekday: 'short' });

    const maxPop = Math.max(...entries.map(e => e.pop || 0));

    return {
      date: dateKey,
      dayName,
      maxTemp,
      minTemp,
      weatherIcon: mapOwmIconToLucide(midEntry?.weather[0]?.icon),
      weatherText: midEntry?.weather[0]?.main || 'Clear',
      precipitationProb: Math.round(maxPop * 100),
      precipitationSum: 0,
      uvIndexMax: 4,
      windSpeedMax: Math.round(Math.max(...entries.map(e => (e.wind?.speed || 0) * 3.6))),
      sunrise: new Date(curr.sys.sunrise * 1000).toISOString(),
      sunset: new Date(curr.sys.sunset * 1000).toISOString()
    };
  });

  return {
    location: {
      name: cityName || `${curr.name}${curr.sys?.country ? ', ' + curr.sys.country : ''}`,
      latitude: Number(lat),
      longitude: Number(lon),
      timezone: 'auto',
      country: curr.sys?.country || ''
    },
    current: {
      temperature: Math.round(curr.main.temp),
      apparentTemperature: Math.round(curr.main.feels_like),
      humidity: curr.main.humidity,
      precipitation: curr.rain ? curr.rain['1h'] || 0 : 0,
      weatherCode: curr.weather[0]?.id || 800,
      weatherText: curr.weather[0]?.description ? curr.weather[0].description.charAt(0).toUpperCase() + curr.weather[0].description.slice(1) : curr.weather[0]?.main,
      weatherIcon,
      condition,
      isDay,
      cloudCover: curr.clouds?.all || 0,
      pressure: curr.main.pressure,
      windSpeed: Math.round((curr.wind?.speed || 0) * 3.6), // m/s to km/h
      windDirection: curr.wind?.deg || 0,
      windGusts: Math.round((curr.wind?.gust || curr.wind?.speed || 0) * 3.6),
      time: new Date(curr.dt * 1000).toISOString(),
      uvIndex: 4,
      aqi: aqiScore,
      sunrise: new Date(curr.sys.sunrise * 1000).toISOString(),
      sunset: new Date(curr.sys.sunset * 1000).toISOString()
    },
    hourly: hourly24,
    daily: dailyForecast,
    source: 'OpenWeatherMap',
    lastUpdated: new Date().toISOString()
  };
}

// -------------------------------------------------------------
// 3. FALLBACK WEATHER: Open-Meteo API
// -------------------------------------------------------------
async function fetchFromOpenMeteo(lat, lon, cityName = '') {
  console.log(`[Open-Meteo Fallback] Fetching weather for ${cityName || `${lat},${lon}`}...`);

  const weatherPromise = axios.get('https://api.open-meteo.com/v1/forecast', {
    params: {
      latitude: lat,
      longitude: lon,
      current: [
        'temperature_2m',
        'relative_humidity_2m',
        'apparent_temperature',
        'is_day',
        'precipitation',
        'weather_code',
        'cloud_cover',
        'pressure_msl',
        'surface_pressure',
        'wind_speed_10m',
        'wind_direction_10m',
        'wind_gusts_10m'
      ].join(','),
      hourly: [
        'temperature_2m',
        'relative_humidity_2m',
        'apparent_temperature',
        'precipitation_probability',
        'precipitation',
        'weather_code',
        'wind_speed_10m',
        'uv_index'
      ].join(','),
      daily: [
        'weather_code',
        'temperature_2m_max',
        'temperature_2m_min',
        'apparent_temperature_max',
        'apparent_temperature_min',
        'sunrise',
        'sunset',
        'uv_index_max',
        'precipitation_sum',
        'precipitation_probability_max',
        'wind_speed_10m_max'
      ].join(','),
      timezone: 'auto',
      forecast_days: 7
    },
    timeout: 8000
  });

  const aqiPromise = axios.get('https://air-quality-api.open-meteo.com/v1/air-quality', {
    params: {
      latitude: lat,
      longitude: lon,
      current: ['us_aqi', 'pm2_5', 'pm10', 'ozone'].join(',')
    },
    timeout: 4000
  }).catch(() => ({ data: null }));

  const [weatherRes, aqiRes] = await Promise.all([weatherPromise, aqiPromise]);
  const wData = weatherRes.data;
  const aqiData = aqiRes.data;

  const currentMeta = getWeatherMeta(wData.current.weather_code, wData.current.is_day);

  const current = {
    temperature: Math.round(wData.current.temperature_2m),
    apparentTemperature: Math.round(wData.current.apparent_temperature),
    humidity: wData.current.relative_humidity_2m,
    precipitation: wData.current.precipitation,
    weatherCode: wData.current.weather_code,
    weatherText: currentMeta.label,
    weatherIcon: currentMeta.icon,
    condition: currentMeta.condition,
    isDay: currentMeta.isDay,
    cloudCover: wData.current.cloud_cover,
    pressure: Math.round(wData.current.pressure_msl),
    windSpeed: Math.round(wData.current.wind_speed_10m),
    windDirection: wData.current.wind_direction_10m,
    windGusts: Math.round(wData.current.wind_gusts_10m),
    time: wData.current.time,
    uvIndex: wData.daily.uv_index_max[0] || 0,
    aqi: aqiData?.current?.us_aqi ?? 42,
    sunrise: wData.daily.sunrise[0],
    sunset: wData.daily.sunset[0]
  };

  const currentTimeIso = wData.current.time;
  let startIndex = wData.hourly.time.findIndex(t => t >= currentTimeIso.slice(0, 13));
  if (startIndex === -1) startIndex = 0;
  const hourly24 = [];
  for (let i = startIndex; i < Math.min(startIndex + 24, wData.hourly.time.length); i++) {
    const hCode = wData.hourly.weather_code[i];
    const hTime = wData.hourly.time[i];
    const hour = parseInt(hTime.substring(11, 13), 10);
    const isDayHour = hour >= 6 && hour < 20 ? 1 : 0;
    const hMeta = getWeatherMeta(hCode, isDayHour);
    hourly24.push({
      time: hTime,
      hourText: `${hour}:00`,
      temperature: Math.round(wData.hourly.temperature_2m[i]),
      precipitationProb: wData.hourly.precipitation_probability[i] || 0,
      weatherCode: hCode,
      weatherIcon: hMeta.icon,
      weatherText: hMeta.label,
      windSpeed: Math.round(wData.hourly.wind_speed_10m[i]),
      uvIndex: wData.hourly.uv_index ? wData.hourly.uv_index[i] : 0
    });
  }

  const dailyForecast = [];
  for (let i = 0; i < wData.daily.time.length; i++) {
    const dCode = wData.daily.weather_code[i];
    const dMeta = getWeatherMeta(dCode, 1);
    const dateStr = wData.daily.time[i];
    const d = new Date(dateStr + 'T00:00:00');
    const dayName = i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : d.toLocaleDateString('en-US', { weekday: 'short' });

    dailyForecast.push({
      date: dateStr,
      dayName,
      maxTemp: Math.round(wData.daily.temperature_2m_max[i]),
      minTemp: Math.round(wData.daily.temperature_2m_min[i]),
      weatherCode: dCode,
      weatherIcon: dMeta.icon,
      weatherText: dMeta.label,
      precipitationProb: wData.daily.precipitation_probability_max[i] || 0,
      precipitationSum: wData.daily.precipitation_sum[i] || 0,
      uvIndexMax: wData.daily.uv_index_max[i] || 0,
      windSpeedMax: Math.round(wData.daily.wind_speed_10m_max[i] || 0),
      sunrise: wData.daily.sunrise[i],
      sunset: wData.daily.sunset[i]
    });
  }

  return {
    location: {
      name: cityName || 'Selected Location',
      latitude: Number(lat),
      longitude: Number(lon),
      timezone: wData.timezone,
      elevation: wData.elevation
    },
    current,
    hourly: hourly24,
    daily: dailyForecast,
    source: 'Open-Meteo (Fallback)',
    lastUpdated: new Date().toISOString()
  };
}

// -------------------------------------------------------------
// Unified Weather Fetch: OpenWeatherMap (Primary) -> Open-Meteo (Fallback)
// -------------------------------------------------------------
export async function fetchWeatherData(lat, lon, cityName = '') {
  const owmKey = process.env.OPENWEATHERMAP_API_KEY;

  if (owmKey && owmKey.trim() !== '') {
    try {
      return await fetchFromOpenWeatherMap(lat, lon, cityName, owmKey.trim());
    } catch (owmErr) {
      console.warn(`[OpenWeatherMap Error] (${owmErr.response?.status || owmErr.message}). Switching to Open-Meteo fallback.`);
    }
  }

  // Fallback to Open-Meteo
  return await fetchFromOpenMeteo(lat, lon, cityName);
}
