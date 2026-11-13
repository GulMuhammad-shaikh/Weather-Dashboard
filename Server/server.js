import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import weatherRoutes from './routes/weatherRoutes.js';
import favoritesRoutes from './routes/favoritesRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import { initScheduler } from './services/scheduler.js';

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/weatherboard';

// Middleware
app.use(cors());
app.use(express.json());

// Serverless-friendly MongoDB connection cache
let cachedDbPromise = null;
export async function connectToDatabase() {
  if (mongoose.connection.readyState >= 1) {
    return mongoose.connection;
  }

  if (!cachedDbPromise) {
    cachedDbPromise = mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      bufferCommands: false
    }).then((conn) => {
      console.log('✅ Connected to MongoDB Atlas/Database');
      return conn;
    }).catch((err) => {
      cachedDbPromise = null;
      console.error('❌ MongoDB Connection Error:', err.message);
      throw err;
    });
  }

  return cachedDbPromise;
}

// Request logging & auto-connect DB
app.use(async (req, res, next) => {
  console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.originalUrl}`);
  if (MONGODB_URI) {
    try {
      await connectToDatabase();
    } catch (e) {
      // Non-blocking: Weather endpoints work even if DB is connecting
    }
  }
  next();
});

// Root welcome & API documentation endpoint
app.get('/', (req, res) => {
  res.json({
    status: 'online',
    appName: 'WeatherPulse Backend API',
    description: 'REST API for WeatherPulse PWA weather dashboard',
    endpoints: {
      health: '/api/health',
      currentWeather: '/api/weather/current?city=Karachi',
      searchCities: '/api/weather/search?q=London',
      favorites: '/api/favorites',
      notifications: '/api/notifications'
    },
    mongoStatus: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString()
  });
});

// Health check
app.get('/api/health', async (req, res) => {
  try {
    await connectToDatabase();
  } catch {}
  res.json({
    status: 'online',
    appName: 'WeatherPulse API',
    mongoStatus: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString()
  });
});

// Mount Routes
app.use('/api/weather', weatherRoutes);
app.use('/api/favorites', favoritesRoutes);
app.use('/api/notifications', notificationRoutes);

// Initial connect & scheduler init
connectToDatabase()
  .then(() => {
    initScheduler();
  })
  .catch((err) => {
    console.warn('⚠️ Server running. Weather endpoints available; favorites & push require MongoDB.');
  });

// Start Express Server
app.listen(PORT, () => {
  console.log(`🌤️ WeatherPulse Backend Server running on http://localhost:${PORT}`);
});

export default app;
