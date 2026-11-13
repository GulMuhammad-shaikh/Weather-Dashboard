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

// Request logging
app.use((req, res, next) => {
  console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// Health check
app.get('/api/health', (req, res) => {
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

// MongoDB connection
mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB at', MONGODB_URI);
    // Initialize notification scheduler after DB connection
    initScheduler();
  })
  .catch((err) => {
    console.error('❌ MongoDB Connection Error:', err.message);
    console.warn('⚠️ WeatherPulse server will continue running. Favorites & push subscriptions require MongoDB.');
  });

// Start Express Server
app.listen(PORT, () => {
  console.log(`🌤️ WeatherPulse Backend Server running on http://localhost:${PORT}`);
});
