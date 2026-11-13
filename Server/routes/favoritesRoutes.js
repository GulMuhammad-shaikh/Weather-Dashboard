import express from 'express';
import Favorite from '../models/Favorite.js';
import { fetchWeatherData } from '../services/weatherService.js';

const router = express.Router();

// Get all favorite cities with their current temperature & condition preview
router.get('/', async (req, res) => {
  try {
    const favorites = await Favorite.find().sort({ createdAt: -1 });

    // Attach quick weather snapshot for each favorite
    const enhancedFavorites = await Promise.all(
      favorites.map(async (fav) => {
        try {
          const w = await fetchWeatherData(fav.latitude, fav.longitude, fav.name);
          return {
            _id: fav._id,
            name: fav.name,
            country: fav.country,
            admin1: fav.admin1,
            latitude: fav.latitude,
            longitude: fav.longitude,
            temp: w.current.temperature,
            condition: w.current.weatherText,
            icon: w.current.weatherIcon,
            weatherCode: w.current.weatherCode
          };
        } catch {
          return {
            _id: fav._id,
            name: fav.name,
            country: fav.country,
            admin1: fav.admin1,
            latitude: fav.latitude,
            longitude: fav.longitude
          };
        }
      })
    );

    res.json(enhancedFavorites);
  } catch (error) {
    console.error('Fetch favorites error:', error.message);
    res.status(500).json({ error: 'Failed to fetch favorites' });
  }
});

// Add a new favorite city
router.post('/', async (req, res) => {
  try {
    const { name, country, admin1, latitude, longitude, timezone } = req.body;

    if (!name || latitude === undefined || longitude === undefined) {
      return res.status(400).json({ error: 'City name, latitude, and longitude are required' });
    }

    // Check if already exists
    let existing = await Favorite.findOne({
      $or: [
        { name, country },
        {
          latitude: { $gte: latitude - 0.05, $lte: latitude + 0.05 },
          longitude: { $gte: longitude - 0.05, $lte: longitude + 0.05 }
        }
      ]
    });

    if (existing) {
      return res.json({ message: 'City is already in favorites', favorite: existing });
    }

    const newFav = new Favorite({
      name,
      country: country || '',
      admin1: admin1 || '',
      latitude,
      longitude,
      timezone: timezone || 'auto'
    });

    await newFav.save();
    res.status(201).json(newFav);
  } catch (error) {
    console.error('Add favorite error:', error.message);
    res.status(500).json({ error: 'Failed to save favorite city' });
  }
});

// Remove a favorite city by ID or city name
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    let result;

    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      result = await Favorite.findByIdAndDelete(id);
    } else {
      result = await Favorite.findOneAndDelete({ name: new RegExp(`^${id}$`, 'i') });
    }

    if (!result) {
      return res.status(404).json({ error: 'Favorite not found' });
    }

    res.json({ message: 'Favorite removed successfully', id });
  } catch (error) {
    console.error('Delete favorite error:', error.message);
    res.status(500).json({ error: 'Failed to remove favorite' });
  }
});

export default router;
