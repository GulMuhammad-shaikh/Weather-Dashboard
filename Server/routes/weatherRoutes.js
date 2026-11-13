import express from 'express';
import { searchCities, fetchWeatherData } from '../services/weatherService.js';

const router = express.Router();

/**
 * GET /api/weather/search
 * Validated endpoint for GeoDB Cities API autocomplete search
 */
router.get('/search', async (req, res) => {
  try {
    const rawQuery = req.query.q;

    // 1. Validation: Query presence
    if (rawQuery === undefined || rawQuery === null) {
      return res.status(400).json({
        status: 'error',
        error: 'Validation Error',
        message: 'Query parameter "q" is required.'
      });
    }

    if (typeof rawQuery !== 'string') {
      return res.status(400).json({
        status: 'error',
        error: 'Validation Error',
        message: 'Query parameter "q" must be a string.'
      });
    }

    const trimmedQuery = rawQuery.trim();

    // 2. Validation: Query length
    if (trimmedQuery.length === 0) {
      return res.status(400).json({
        status: 'error',
        error: 'Validation Error',
        message: 'Search query cannot be empty.'
      });
    }

    if (trimmedQuery.length < 2) {
      return res.status(400).json({
        status: 'error',
        error: 'Validation Error',
        message: 'Search query must be at least 2 characters long for autocomplete.'
      });
    }

    if (trimmedQuery.length > 100) {
      return res.status(400).json({
        status: 'error',
        error: 'Validation Error',
        message: 'Search query cannot exceed 100 characters.'
      });
    }

    // 3. Validation: Optional limit
    let limit = 8;
    if (req.query.limit !== undefined) {
      const parsedLimit = parseInt(req.query.limit, 10);
      if (isNaN(parsedLimit) || parsedLimit < 1 || parsedLimit > 20) {
        return res.status(400).json({
          status: 'error',
          error: 'Validation Error',
          message: 'Limit parameter must be an integer between 1 and 20.'
        });
      }
      limit = parsedLimit;
    }

    // Execute search via GeoDB Cities API (with Open-Meteo fallback)
    const { results, source, error: upstreamError } = await searchCities(trimmedQuery, limit);

    if (upstreamError) {
      return res.status(502).json({
        status: 'error',
        error: 'Upstream API Error',
        message: upstreamError,
        data: []
      });
    }

    res.json({
      status: 'success',
      query: trimmedQuery,
      count: results.length,
      source: source || 'GeoDB Cities API',
      data: results
    });
  } catch (error) {
    console.error('Weather search error:', error.message);
    res.status(500).json({
      status: 'error',
      error: 'Internal Server Error',
      message: 'Failed to process city autocomplete search: ' + error.message,
      data: []
    });
  }
});

/**
 * GET /api/weather/current
 * Validated endpoint for current conditions and 5-day forecast
 */
router.get('/current', async (req, res) => {
  try {
    let { lat, lon, city } = req.query;

    // Validate coordinates if provided
    if (lat !== undefined && lon !== undefined) {
      const parsedLat = parseFloat(lat);
      const parsedLon = parseFloat(lon);

      if (isNaN(parsedLat) || parsedLat < -90 || parsedLat > 90) {
        return res.status(400).json({
          status: 'error',
          error: 'Validation Error',
          message: 'Latitude must be a valid number between -90 and 90.'
        });
      }

      if (isNaN(parsedLon) || parsedLon < -180 || parsedLon > 180) {
        return res.status(400).json({
          status: 'error',
          error: 'Validation Error',
          message: 'Longitude must be a valid number between -180 and 180.'
        });
      }

      lat = parsedLat;
      lon = parsedLon;
    } else if (city) {
      if (typeof city !== 'string' || city.trim().length === 0) {
        return res.status(400).json({
          status: 'error',
          error: 'Validation Error',
          message: 'City name must be a non-empty string.'
        });
      }

      const { results } = await searchCities(city.trim(), 1);
      if (!results || results.length === 0) {
        return res.status(404).json({
          status: 'error',
          error: 'Not Found',
          message: `City '${city}' could not be located. Please check spelling.`
        });
      }

      lat = results[0].latitude;
      lon = results[0].longitude;
      city = `${results[0].name}${results[0].country ? ', ' + results[0].country : ''}`;
    } else {
      // Default to London if nothing specified
      city = 'London';
      lat = 51.5074;
      lon = -0.1278;
    }

    const weatherData = await fetchWeatherData(Number(lat), Number(lon), city);
    res.json(weatherData);
  } catch (error) {
    console.error('Weather forecast error:', error.message);
    res.status(500).json({
      status: 'error',
      error: 'Weather Fetch Failed',
      message: error.message || 'Could not fetch weather data'
    });
  }
});

export default router;
