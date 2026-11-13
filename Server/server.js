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
const MONGODB_URI = process.env.MONGODB_URI || (process.env.NODE_ENV === 'production' ? '' : 'mongodb://127.0.0.1:27017/weatherboard');

// Middleware
app.use(cors());
app.use(express.json());

// Serverless-friendly MongoDB connection cache
let cachedDbPromise = null;
let lastMongoError = null;

export async function connectToDatabase() {
  if (mongoose.connection.readyState >= 1) {
    return mongoose.connection;
  }

  if (!MONGODB_URI) {
    lastMongoError = new Error('MONGODB_URI environment variable is NOT set in Vercel. Please add MONGODB_URI in Vercel Settings > Environment Variables, then Redeploy.');
    return null;
  }

  if (!cachedDbPromise) {
    cachedDbPromise = mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      bufferCommands: false
    }).then((conn) => {
      lastMongoError = null;
      console.log('✅ Connected to MongoDB Atlas/Database');
      return conn;
    }).catch((err) => {
      cachedDbPromise = null;
      lastMongoError = err;
      console.error('❌ MongoDB Connection Error:', err.message);
      throw err;
    });
  }

  return cachedDbPromise;
}

// Helper to provide clear diagnostic message in health/root endpoint
function getMongoDiagnostics() {
  const readyState = mongoose.connection.readyState;
  const isEnvConfigured = Boolean(process.env.MONGODB_URI);

  let explanation = '';
  if (readyState === 1) {
    explanation = 'Connected to MongoDB Atlas successfully';
  } else if (!isEnvConfigured) {
    explanation = 'MONGODB_URI is missing in Vercel Environment Variables. Add MONGODB_URI in Vercel Settings > Environment Variables, then click Redeploy.';
  } else if (lastMongoError) {
    explanation = lastMongoError.message;
  } else {
    explanation = 'Connecting or network access blocked in Atlas (Ensure 0.0.0.0/0 is in Atlas Network Access)';
  }

  return {
    status: readyState === 1 ? 'connected' : 'disconnected',
    isEnvConfigured,
    diagnostic: explanation
  };
}

// Request logging & auto-connect DB
app.use(async (req, res, next) => {
  console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.originalUrl}`);
  if (MONGODB_URI) {
    try {
      await connectToDatabase();
    } catch (e) {
      // Non-blocking
    }
  }
  next();
});

// Root welcome & API documentation endpoint
app.get('/', async (req, res) => {
  try {
    await connectToDatabase();
  } catch {}

  const mongoInfo = getMongoDiagnostics();

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
    mongoStatus: mongoInfo.status,
    mongoDiagnostics: mongoInfo.diagnostic,
    timestamp: new Date().toISOString()
  });
});

// Health check
app.get('/api/health', async (req, res) => {
  try {
    await connectToDatabase();
  } catch {}

  const mongoInfo = getMongoDiagnostics();

  res.json({
    status: 'online',
    appName: 'WeatherPulse API',
    mongoStatus: mongoInfo.status,
    mongoDiagnostics: mongoInfo.diagnostic,
    timestamp: new Date().toISOString()
  });
});

// Mount Routes
app.use('/api/weather', weatherRoutes);
app.use('/api/favorites', favoritesRoutes);
app.use('/api/notifications', notificationRoutes);

// Initial connect & scheduler init
if (MONGODB_URI) {
  connectToDatabase()
    .then(() => {
      initScheduler();
    })
    .catch((err) => {
      console.warn('⚠️ Server running. Weather endpoints available; favorites & push require MongoDB.');
    });
}

// Start Express Server
app.listen(PORT, () => {
  console.log(`🌤️ WeatherPulse Backend Server running on http://localhost:${PORT}`);
});

export default app;
