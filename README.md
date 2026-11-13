# 🌤️ WeatherPulse — Modern MERN Weather Dashboard (PWA)

**WeatherPulse** is a responsive, installable Progressive Web Application (PWA) built on the **MERN stack** (MongoDB, Express, React, Node.js). It provides real-time atmospheric conditions, interactive 24-hour temperature curves, 5-day extended forecasts, saved favorite cities stored in MongoDB, offline resilience for cached locations, and scheduled morning push notifications.

---

## ✨ Features

- **Global City Search & Autocomplete**: Instant geocoding search with 300ms debounce pause for cities worldwide, including administrative division, country code, and population.
- **Geolocation Support**: One-click "Use My Current Location" GPS button.
- **Current Conditions Hero**:
  - Live temperature & "Feels like" metrics with interactive °C / °F toggle
  - Hardware-accelerated SVG + CSS vector animated weather icons
  - Daily high/low extremes
  - Micro chips for precipitation probability, wind velocity, and EPA Air Quality Index (AQI)
- **Interactive 24-Hour Forecast**:
  - Custom SVG Area & Temperature Trend Chart with smooth cubic bezier spline curves
  - Interactive hover tooltips showing hourly weather description, temp, and rain chance
  - Horizontal carousel cards with smooth scrolling
- **Detailed Weather Metrics**:
  - 💧 Humidity with atmospheric comfort rating
  - 💨 Wind speed, gusts & directional degree compass
  - ☀️ UV Index gauge with category alerts (Low, Moderate, High, Extreme)
  - 🍃 US EPA Air Quality Index (AQI)
  - 🌅 Local Sunrise & Sunset times
  - ⏱️ Barometric Pressure (hPa) & Cloud Cover percentage
- **5-Day Extended Forecast**:
  - Day name, date, condition pill, precipitation probability, and visual relative temperature spectrum range bar.
- **Quick-Access Favourites (MongoDB & Local Sync)**:
  - Bookmark up to 5 cities with quick-switch temperature chips.
  - Confirmation modal required before removing a saved city.
  - Graceful degradation if localStorage is disabled or restricted.
- **Dark / Light Mode Toggle**:
  - Auto-detection of system OS theme (`prefers-color-scheme`).
  - Real-time OS theme change listener without page reload.
  - Cycling mode switch (`Dark` ➔ `Light` ➔ `System (Auto)`).
  - High-contrast accessible design in both dark slate and crisp light frosted glass.
- **Offline Mode & PWA Installability**:
  - Valid web manifest (`manifest.json` with 192px and 512px icons, standalone display mode).
  - Custom Service Worker (`sw.js`) caching core app shell and last-viewed city weather.
  - Radar "Offline Mode" banner when network connection drops.
- **Morning Push Notification Scheduler**:
  - Native Web Push API through background Service Worker.
  - Server-side `node-cron` scheduler checking every minute to dispatch morning alerts.
  - Configurable reminder delivery time (e.g. 08:00 AM) that fires even when tab is closed.

---

## 🏗️ Project Architecture

```
Weather-Dashboard/
├── Client/                         # Frontend (React 19 + Vite 8 + Tailwind CSS v4)
│   ├── public/
│   │   ├── manifest.json           # Web App Manifest for PWA installation
│   │   ├── sw.js                   # Service Worker (offline cache & Web Push)
│   │   ├── icon-192.png            # Maskable PWA icon (192x192)
│   │   └── icon-512.png            # High-res PWA icon (512x512)
│   ├── src/
│   │   ├── components/             # Reusable UI Components
│   │   │   ├── AnimatedWeatherIcon.jsx  # SVG+CSS 60fps weather animations
│   │   │   ├── DailyForecast.jsx   # 5-day extended outlook
│   │   │   ├── ErrorBoundary.jsx   # Runtime error protection
│   │   │   ├── FavoritesBar.jsx    # Quick-access favorites bar
│   │   │   ├── HourlyForecast.jsx  # 24-hr SVG spline area chart
│   │   │   ├── Navbar.jsx          # Header with autocomplete & unit toggles
│   │   │   ├── NotificationModal.jsx# Morning alert scheduler modal
│   │   │   ├── OfflineBanner.jsx   # Offline detection radar
│   │   │   ├── WeatherBackground.jsx# Atmospheric particles & glows
│   │   │   ├── WeatherHero.jsx     # Current conditions banner
│   │   │   ├── WeatherMetrics.jsx  # 6 atmospheric detail cards
│   │   │   └── WeatherSkeleton.jsx # Initial loading shimmer
│   │   ├── hooks/                  # Custom React Hooks
│   │   │   ├── useFavorites.js     # 5-city limit & persistence hook
│   │   │   ├── usePushNotifications.js # Web Push subscription hook
│   │   │   ├── usePWAInstall.js    # PWA install banner prompt
│   │   │   ├── useTheme.js         # Dark/Light/System theme hook
│   │   │   └── useWeather.js       # Live API fetch & offline fallback
│   │   ├── services/
│   │   │   └── api.js              # REST API client with local cache
│   │   ├── utils/
│   │   │   └── helpers.jsx         # Conversions (°C/°F, kmh/mph, icons, themes)
│   │   ├── App.jsx                 # Main layout and coordinator
│   │   ├── index.css               # Glassmorphism & keyframe animations
│   │   └── main.jsx                # React root entry point
│   └── vite.config.js              # Vite config (proxies /api to Express)
│
├── Server/                         # Backend (Node.js + Express + MongoDB)
│   ├── models/
│   │   ├── Favorite.js             # Mongoose schema for saved cities
│   │   └── Subscription.js         # Mongoose schema for Web Push subscriptions
│   ├── routes/
│   │   ├── favoritesRoutes.js      # CRUD for user bookmarked cities
│   │   ├── notificationRoutes.js   # VAPID key & push subscriptions
│   │   └── weatherRoutes.js        # Weather search & live current endpoints
│   ├── services/
│   │   ├── pushService.js          # web-push notification dispatcher
│   │   ├── scheduler.js            # node-cron scheduled morning alerts
│   │   └── weatherService.js       # OpenWeatherMap & Open-Meteo fallback
│   ├── .env.example                # Template for environment configuration
│   └── server.js                   # Express application entry point
│
└── package.json                    # Workspace scripts
```

---

## 🚀 Quick Start Guide

### Prerequisites
- [Node.js](https://nodejs.org/) (v18.0.0 or higher)
- [MongoDB](https://www.mongodb.com/) running locally on port 27017 (or MongoDB Atlas connection string)

### 1. Clone Repository
```bash
git clone https://github.com/GulMuhammad-shaikh/Weather-Dashboard.git
cd Weather-Dashboard
```

### 2. Configure Backend Environment
```bash
cd Server
cp .env.example .env
```
*(Optional)* Add your `OPENWEATHERMAP_API_KEY` or RapidAPI `RAPIDAPI_KEY` in `Server/.env`. If omitted, the server automatically uses the built-in zero-downtime **Open-Meteo** data stream.

### 3. Install Dependencies
```bash
# In Server directory:
npm install

# In Client directory:
cd ../Client
npm install
```

### 4. Run Development Servers
```bash
# Terminal 1 - Start Backend API (Port 5000):
cd Server
npm start

# Terminal 2 - Start Frontend App (Port 5173):
cd Client
npm run dev
```

Open your browser and navigate to **`http://localhost:5173`**.

---

## 📱 Progressive Web App (PWA) Installation
- **Desktop (Chrome / Edge)**: Click the **Install App** button in the header bar or the install icon in the browser address bar.
- **Mobile (iOS Safari)**: Tap the Share button ➔ "Add to Home Screen".
- **Mobile (Android Chrome)**: Tap the menu ➔ "Install app".

---

## 📄 License
MIT License. Built with ❤️ for fast, beautiful, and reliable weather tracking.
