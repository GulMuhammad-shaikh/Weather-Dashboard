import React, { useState } from 'react';
import { useWeather } from './hooks/useWeather';
import { useFavorites } from './hooks/useFavorites';
import { usePushNotifications } from './hooks/usePushNotifications';
import { usePWAInstall } from './hooks/usePWAInstall';
import { useTheme } from './hooks/useTheme';

import WeatherBackground from './components/WeatherBackground';
import Navbar from './components/Navbar';
import OfflineBanner from './components/OfflineBanner';
import FavoritesBar from './components/FavoritesBar';
import WeatherHero from './components/WeatherHero';
import HourlyForecast from './components/HourlyForecast';
import DailyForecast from './components/DailyForecast';
import WeatherMetrics from './components/WeatherMetrics';
import NotificationModal from './components/NotificationModal';
import WeatherSkeleton from './components/WeatherSkeleton';
import WeatherError from './components/WeatherError';

import { Loader2, RefreshCw, AlertTriangle, X } from 'lucide-react';

export default function App() {
  const {
    weatherData,
    loading,
    error,
    isOffline,
    isCached,
    unit,
    toggleUnit,
    loadCity
  } = useWeather();

  const {
    favorites,
    isFavorite,
    toggleFavorite,
    requestRemoveFavorite,
    confirmRemoveFavorite,
    cancelRemoveFavorite,
    cityPendingRemoval,
    favoritesMessage,
    setFavoritesMessage,
    isStorageSupported
  } = useFavorites();

  const {
    isSupported,
    permission,
    isSubscribed,
    notificationTime,
    loading: pushLoading,
    statusMessage,
    subscribeUser,
    triggerTestAlert
  } = usePushNotifications();

  const {
    isInstallable,
    installApp
  } = usePWAInstall();

  const {
    themeMode,
    resolvedTheme,
    cycleTheme,
    setTheme
  } = useTheme();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCityName, setSelectedCityName] = useState('your city');
  const [dismissErrorToast, setDismissErrorToast] = useState(false);

  // Handle city selection
  const handleSelectCity = (lat, lon, cityName) => {
    setSelectedCityName(cityName);
    setDismissErrorToast(false);
    loadCity(lat, lon, cityName);
  };

  const handleRefresh = () => {
    if (weatherData?.location) {
      setDismissErrorToast(false);
      loadCity(weatherData.location.latitude, weatherData.location.longitude, weatherData.location.name);
    }
  };

  const handleUseLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        handleSelectCity(pos.coords.latitude, pos.coords.longitude, 'Current Location');
      },
      () => {
        alert('Could not retrieve current location.');
      }
    );
  };

  const currentCondition = weatherData?.current?.condition || 'clear';
  const isDay = weatherData?.current?.isDay ?? true;

  return (
    <div className={`min-h-screen relative flex flex-col font-sans transition-colors duration-300 ${resolvedTheme === 'dark' ? 'text-slate-100' : 'text-slate-800'}`}>
      
      {/* Top Async Loading Progress Bar */}
      {loading && (
        <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-slate-800 overflow-hidden">
          <div className="h-full bg-gradient-to-r from-sky-400 via-blue-500 to-indigo-500 animate-pulse w-full origin-left" />
        </div>
      )}

      {/* Dynamic atmospheric background */}
      <WeatherBackground condition={currentCondition} isDay={isDay} isDark={resolvedTheme === 'dark'} />

      {/* Navigation header */}
      <Navbar
        onSelectCity={handleSelectCity}
        unit={unit}
        onToggleUnit={toggleUnit}
        onOpenNotifications={() => setIsModalOpen(true)}
        isSubscribed={isSubscribed}
        isInstallable={isInstallable}
        onInstallApp={installApp}
        isOffline={isOffline}
        currentCityName={weatherData?.location?.name}
        themeMode={themeMode}
        resolvedTheme={resolvedTheme}
        onCycleTheme={cycleTheme}
      />

      {/* Offline banner */}
      <OfflineBanner
        isOffline={isOffline}
        isCached={isCached}
        cityName={weatherData?.location?.name}
        lastUpdated={weatherData?.lastUpdated}
        onRefresh={handleRefresh}
      />

      {/* In-app error toast when background refresh fails but stale data exists */}
      {error && weatherData && !dismissErrorToast && (
        <div className="w-full max-w-6xl mx-auto px-4 pt-3">
          <div className="flex items-center justify-between gap-3 px-4 py-2.5 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-200 text-xs shadow-lg">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleRefresh}
                className="px-2.5 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 font-semibold transition-colors"
              >
                Retry
              </button>
              <button
                onClick={() => setDismissErrorToast(true)}
                className="p-1 hover:bg-white/10 rounded-md text-slate-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick-Access Favourites Panel Bar */}
      <FavoritesBar
        favorites={favorites}
        currentCityName={weatherData?.location?.name}
        onSelectCity={handleSelectCity}
        onRequestRemove={requestRemoveFavorite}
        cityPendingRemoval={cityPendingRemoval}
        onConfirmRemove={confirmRemoveFavorite}
        onCancelRemove={cancelRemoveFavorite}
        favoritesMessage={favoritesMessage}
        onDismissMessage={() => setFavoritesMessage(null)}
        isStorageSupported={isStorageSupported}
        unit={unit}
      />

      {/* Main Content Area */}
      <main className="flex-1 pb-16">
        {loading && !weatherData ? (
          /* Loading State: Shimmering skeleton while fetching initial data */
          <WeatherSkeleton cityName={selectedCityName} />
        ) : error && !weatherData ? (
          /* Error State: User-friendly error message with actionable retry buttons */
          <WeatherError
            error={error}
            onRetry={handleRefresh}
            onUseLocation={handleUseLocation}
            onResetDefault={() => handleSelectCity(51.5074, -0.1278, 'London')}
          />
        ) : weatherData ? (
          /* Data Display: Live conditions & 5-day forecast */
          <div className="space-y-6">
            
            {/* Updating indicator when switching cities */}
            {loading && (
              <div className="w-full max-w-6xl mx-auto px-4 pt-2">
                <div className="flex items-center justify-center gap-2 py-1.5 px-3 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-300 text-xs font-semibold w-max mx-auto shadow-md">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Updating weather for {selectedCityName}...</span>
                </div>
              </div>
            )}

            {/* Current Conditions Hero */}
            <WeatherHero
              location={weatherData.location}
              current={weatherData.current}
              daily={weatherData.daily}
              unit={unit}
              isFavorite={isFavorite(weatherData.location?.name)}
              onToggleFavorite={() => toggleFavorite(weatherData.location)}
              source={weatherData.source}
            />

            {/* 24-Hour Forecast & Interactive Temperature Graph */}
            <HourlyForecast
              hourly={weatherData.hourly}
              unit={unit}
            />

            {/* Detailed Weather Metrics */}
            <WeatherMetrics
              current={weatherData.current}
              unit={unit}
            />

            {/* 5-Day Extended Forecast */}
            <DailyForecast
              daily={weatherData.daily}
              unit={unit}
            />

          </div>
        ) : null}
      </main>

      {/* Push Notification Setup Modal */}
      <NotificationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        currentLocation={weatherData?.location}
        isSubscribed={isSubscribed}
        notificationTime={notificationTime}
        onSubscribe={subscribeUser}
        onTestNotification={triggerTestAlert}
        loading={pushLoading}
        statusMessage={statusMessage}
        isSupported={isSupported}
        permission={permission}
      />

      {/* Footer */}
      <footer className="w-full border-t border-slate-200/60 dark:border-white/5 py-8 text-center text-xs text-slate-500 dark:text-slate-400 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-700 dark:text-slate-400">WeatherPulse</span>
            <span>•</span>
            <span>MERN Stack Progressive Web Application</span>
          </div>

          <div className="flex items-center gap-4 text-slate-600 dark:text-slate-400">
            <span>Offline-Ready PWA</span>
            <span>•</span>
            <span>Live Satellite Feeds</span>
            <span>•</span>
            <span>Web Push Scheduler</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
