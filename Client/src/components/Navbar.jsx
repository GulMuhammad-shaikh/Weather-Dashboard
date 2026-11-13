import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Search,
  MapPin,
  Bell,
  Download,
  Wifi,
  WifiOff,
  X,
  Loader2,
  CloudSun,
  AlertCircle,
  AlertTriangle,
  RotateCcw,
  SearchX,
  Users,
  Compass,
  Sun,
  Moon,
  Monitor
} from 'lucide-react';
import { searchCities } from '../services/api';

export default function Navbar({
  onSelectCity,
  unit,
  onToggleUnit,
  onOpenNotifications,
  isSubscribed,
  isInstallable,
  onInstallApp,
  isOffline,
  currentCityName,
  themeMode = 'system',
  resolvedTheme = 'dark',
  onCycleTheme
}) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [searching, setSearching] = useState(false);
  const [searchSource, setSearchSource] = useState('GeoDB Cities API');
  const [isOpen, setIsOpen] = useState(false);
  const [locating, setLocating] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  // Client-side validation state: { title: string, description: string } | null
  const [validationError, setValidationError] = useState(null);
  const [touched, setTouched] = useState(false);

  const searchRef = useRef(null);
  const inputRef = useRef(null);

  // Client-side input validation rule engine
  const validateQuery = (text) => {
    if (!text || text.trim().length === 0) {
      return {
        title: 'City name cannot be empty',
        description: 'Please type a city name (e.g. Tokyo, London, Paris) or use the location button.'
      };
    }

    const trimmed = text.trim();

    if (trimmed.length === 1) {
      return {
        title: 'City name is too short (1 character)',
        description: 'Please type at least 2 characters so we can locate your city in the database.'
      };
    }

    // Check if input has letters (avoid purely punctuation or numbers)
    const hasLetters = /[a-zA-Z\u00C0-\u024F\u1E00-\u1EFF]/.test(trimmed);
    if (!hasLetters) {
      return {
        title: 'Invalid city format',
        description: 'City names must contain alphabetic letters. Example: "San Francisco" or "Cairo".'
      };
    }

    if (trimmed.length > 100) {
      return {
        title: 'Query too long',
        description: 'City names cannot exceed 100 characters. Please shorten your query.'
      };
    }

    return null;
  };

  // Execute search function
  const executeSearch = useCallback(async (searchQuery) => {
    const errorCheck = validateQuery(searchQuery);
    if (errorCheck) {
      setValidationError(errorCheck);
      setResults([]);
      setSearching(false);
      return;
    }

    // Check for offline network state
    if (!navigator.onLine) {
      setValidationError({
        title: 'Network connection unavailable',
        description: 'You are currently offline. Check your internet connection or pick from your saved cities.'
      });
      setResults([]);
      setSearching(false);
      return;
    }

    setSearching(true);
    setValidationError(null);
    setSelectedIndex(-1);

    try {
      const response = await searchCities(searchQuery);

      if (response.error) {
        setValidationError({
          title: 'GeoDB Cities API Search Error',
          description: `${response.error}. Check your internet connection or try again in a few moments.`
        });
        setResults([]);
      } else {
        const list = response.results || [];
        setResults(list);
        setSearchSource(response.source || 'GeoDB Cities API');

        if (list.length === 0) {
          setValidationError({
            title: `No cities found matching "${searchQuery}"`,
            description: 'Check for spelling typos, try searching with a country (e.g. "Paris, France"), or verify the name.'
          });
        } else {
          setValidationError(null);
        }
      }
    } catch (err) {
      setValidationError({
        title: 'Network connection failure',
        description: `Failed to contact the weather server (${err.message}). Check your Wi-Fi or data connection and retry.`
      });
      setResults([]);
    } finally {
      setSearching(false);
      setIsOpen(true);
    }
  }, []);

  // Debounced search: Exactly 300ms after user pauses typing
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setIsTyping(false);
      setSearching(false);
      return;
    }

    if (query.trim().length === 1) {
      setIsTyping(false);
      setResults([]);
      if (touched) {
        setValidationError({
          title: 'City name is too short (1 character)',
          description: 'Please type at least 2 characters so we can locate your city.'
        });
      }
      return;
    }

    // User is actively typing
    setIsTyping(true);
    setValidationError(null);

    // 300ms debounce timer
    const debounceTimer = setTimeout(() => {
      setIsTyping(false);
      executeSearch(query.trim());
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [query, touched, executeSearch]);

  // Validate on Blur (when input loses focus)
  const handleBlur = (e) => {
    setTouched(true);
    // Don't validate if clicking into dropdown
    if (searchRef.current && searchRef.current.contains(e.relatedTarget)) {
      return;
    }

    const err = validateQuery(query);
    if (err) {
      setValidationError(err);
    }
  };

  // Validate on Submit (when user hits Enter or submits form)
  const handleFormSubmit = (e) => {
    e.preventDefault();
    setTouched(true);

    const err = validateQuery(query);
    if (err) {
      setValidationError(err);
      inputRef.current?.focus();
      return;
    }

    if (!navigator.onLine) {
      setValidationError({
        title: 'Network connection unavailable',
        description: 'You are currently offline. Check your internet connection or pick from your saved cities.'
      });
      return;
    }

    // If suggestions are available, pick selected or first item
    if (results.length > 0) {
      const chosen = selectedIndex >= 0 ? results[selectedIndex] : results[0];
      handleSelect(chosen);
    } else {
      executeSearch(query.trim());
    }
  };

  // Click outside listener
  useEffect(() => {
    function handleClickOutside(e) {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard navigation
  const handleKeyDown = (e) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        setIsOpen(true);
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : results.length - 1));
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const handleSelect = (city) => {
    const formattedCity = `${city.name}${city.country ? ', ' + city.country : ''}`;
    onSelectCity(city.latitude, city.longitude, formattedCity);
    setQuery('');
    setResults([]);
    setValidationError(null);
    setIsOpen(false);
    setSelectedIndex(-1);
  };

  const handleGeolocation = () => {
    if (!navigator.geolocation) {
      setValidationError({
        title: 'Geolocation not supported',
        description: 'Your browser does not support geolocation. Please search for your city by typing its name.'
      });
      return;
    }

    setLocating(true);
    setValidationError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocating(false);
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        onSelectCity(lat, lon, 'Your Current Location');
      },
      (err) => {
        setLocating(false);
        let errorDesc = 'Could not detect GPS location. Please check browser location permissions or search manually.';
        if (err.code === 1) {
          errorDesc = 'Location access was denied. Click the lock/site settings icon in your address bar to allow location permissions, or search manually.';
        }
        setValidationError({
          title: 'Location detection failed',
          description: errorDesc
        });
      },
      { timeout: 10000 }
    );
  };

  // Substring highlighter helper
  const highlightMatch = (text, matchStr) => {
    if (!matchStr || !text) return text;
    const index = text.toLowerCase().indexOf(matchStr.toLowerCase());
    if (index === -1) return text;
    const before = text.slice(0, index);
    const match = text.slice(index, index + matchStr.length);
    const after = text.slice(index + matchStr.length);
    return (
      <span>
        {before}
        <strong className="text-sky-700 dark:text-sky-300 font-extrabold underline decoration-sky-500/70">{match}</strong>
        {after}
      </span>
    );
  };

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-white/80 dark:bg-slate-950/80 border-b border-slate-200/80 dark:border-white/10 shadow-sm dark:shadow-none transition-colors">
      <div className="max-w-6xl mx-auto px-3.5 sm:px-6 py-2.5 sm:py-0 sm:h-20 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 sm:gap-4">
        
        {/* Top bar on Mobile (<640px) / Left section on Tablet & Desktop */}
        <div className="flex items-center justify-between w-full sm:w-auto shrink-0">
          
          {/* Brand */}
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-tr from-sky-500 via-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-sky-500/25 ring-1 ring-white/20 shrink-0">
              <CloudSun className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg sm:text-xl tracking-tight bg-gradient-to-r from-slate-900 via-slate-800 to-sky-600 dark:from-white dark:via-slate-100 dark:to-sky-200 bg-clip-text text-transparent">
                  WeatherPulse
                </span>
                <span className="px-1.5 py-0.5 text-[9px] uppercase font-bold tracking-wider rounded-full bg-sky-500/20 text-sky-600 dark:text-sky-300 border border-sky-500/30">
                  PWA
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 hidden md:block">Live Forecasts & Daily Morning Alerts</p>
            </div>
          </div>

          {/* Action buttons (Rendered on mobile right side with 44x44px touch targets) */}
          <div className="flex sm:hidden items-center gap-1.5">
            
            {/* Theme Toggle (Mobile) */}
            <button
              onClick={onCycleTheme}
              title={`Theme: ${themeMode} (${resolvedTheme}). Click to cycle.`}
              className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl glass-card text-slate-700 dark:text-slate-200 active:scale-95 transition-all cursor-pointer"
              aria-label={`Current theme: ${themeMode}. Click to switch theme.`}
            >
              {themeMode === 'system' ? (
                <Monitor className="w-4 h-4 text-sky-500 dark:text-sky-400" />
              ) : resolvedTheme === 'dark' ? (
                <Moon className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
              ) : (
                <Sun className="w-4 h-4 text-amber-500" />
              )}
            </button>

            {/* Unit Toggle (Mobile) */}
            <button
              onClick={onToggleUnit}
              title={`Temperature unit: °${unit}. Click to switch to °${unit === 'C' ? 'F' : 'C'}`}
              aria-label={`Switch temperature unit to °${unit === 'C' ? 'F' : 'C'}`}
              className="min-w-[44px] min-h-[44px] px-1 flex items-center justify-center rounded-xl glass-card text-xs font-bold text-slate-700 dark:text-slate-200 active:scale-95 transition-all cursor-pointer select-none"
            >
              <div className="flex items-center gap-0.5 p-0.5 rounded-lg bg-slate-200/50 dark:bg-slate-900/50 border border-slate-300/40 dark:border-white/5">
                <span
                  className={`px-1.5 py-1 rounded-md transition-all ${
                    unit === 'C'
                      ? 'bg-sky-500 text-white font-extrabold shadow-sm'
                      : 'text-slate-500 dark:text-slate-400'
                  }`}
                >
                  °C
                </span>
                <span
                  className={`px-1.5 py-1 rounded-md transition-all ${
                    unit === 'F'
                      ? 'bg-sky-500 text-white font-extrabold shadow-sm'
                      : 'text-slate-500 dark:text-slate-400'
                  }`}
                >
                  °F
                </span>
              </div>
            </button>

            {/* Morning Alerts Button */}
            <button
              onClick={onOpenNotifications}
              title="Configure Daily Morning Weather Push Notifications"
              className="relative min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl glass-card text-slate-600 dark:text-slate-300 active:scale-95 transition-all cursor-pointer"
            >
              <Bell className="w-4 h-4" />
              {isSubscribed && (
                <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-white dark:ring-slate-950 animate-pulse" />
              )}
            </button>

            {/* Install Button on Mobile */}
            {isInstallable && (
              <button
                onClick={onInstallApp}
                title="Install App"
                className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-lg shadow-sky-500/25 active:scale-95 transition-all cursor-pointer"
              >
                <Download className="w-4 h-4" />
              </button>
            )}
          </div>

        </div>

        {/* Submittable City Search Form (Full width on 375px mobile, max-w-md on tablet & desktop) */}
        <div ref={searchRef} className="relative flex-1 w-full sm:max-w-md">
          <form onSubmit={handleFormSubmit} noValidate className="relative flex items-center">
            
            {/* Search Icon / Typing Pulse / Spinner */}
            <div className="absolute left-3.5 flex items-center justify-center pointer-events-none">
              {searching ? (
                <Loader2 className="w-4 h-4 text-sky-400 animate-spin" />
              ) : isTyping ? (
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-sky-500"></span>
                </span>
              ) : validationError ? (
                <AlertCircle className="w-4 h-4 text-rose-400" />
              ) : (
                <Search className="w-4 h-4 text-slate-400" />
              )}
            </div>

            <input
              ref={inputRef}
              type="text"
              name="cityName"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                if (validationError) setValidationError(null);
              }}
              onFocus={() => {
                if (query.trim() || results.length > 0) setIsOpen(true);
              }}
              onBlur={handleBlur}
              onKeyDown={handleKeyDown}
              placeholder="Search city, e.g. Tokyo, Paris..."
              aria-invalid={Boolean(validationError)}
              aria-describedby={validationError ? "search-error-message" : undefined}
              className={`w-full pl-10 pr-24 h-11 rounded-xl glass-input text-sm text-slate-100 placeholder-slate-400 transition-all ${
                validationError
                  ? 'border-rose-500/60 ring-2 ring-rose-500/20 text-rose-100 placeholder-rose-300/40'
                  : 'focus:ring-2 focus:ring-sky-500/50'
              }`}
            />

            {/* Input Action Chips (Touch targets 44x44px) */}
            <div className="absolute right-1 flex items-center">
              
              {/* Live typing / 300ms feedback badge */}
              {isTyping && (
                <span className="hidden sm:inline-flex items-center text-[10px] font-mono px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-500/30 mr-1">
                  300ms
                </span>
              )}

              {query && (
                <button
                  type="button"
                  onClick={() => {
                    setQuery('');
                    setResults([]);
                    setValidationError(null);
                    setIsOpen(false);
                    inputRef.current?.focus();
                  }}
                  className="w-10 h-10 flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-white/10 cursor-pointer"
                  title="Clear input"
                >
                  <X className="w-4 h-4" />
                </button>
              )}

              <button
                type="button"
                onClick={handleGeolocation}
                title="Use Current Location"
                disabled={locating}
                className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg text-slate-400 hover:text-sky-300 hover:bg-sky-500/20 transition-colors cursor-pointer"
              >
                {locating ? <Loader2 className="w-4 h-4 animate-spin text-sky-400" /> : <MapPin className="w-4 h-4" />}
              </button>
            </div>
          </form>

          {/* CLEAR INLINE ERROR MESSAGE (Shown beneath the input) */}
          {validationError && (
            <div
              id="search-error-message"
              role="alert"
              className="absolute top-full left-0 right-0 mt-1.5 p-3 rounded-2xl bg-slate-900/95 border border-rose-500/50 text-rose-200 text-xs shadow-2xl backdrop-blur-xl z-50 flex items-start gap-2.5 animate-in fade-in slide-in-from-top-1 duration-150"
            >
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div className="space-y-0.5 flex-1">
                <div className="font-bold text-rose-300">{validationError.title}</div>
                <div className="text-[11px] text-rose-200/90 leading-relaxed">{validationError.description}</div>
              </div>
              <button
                type="button"
                onClick={() => setValidationError(null)}
                className="text-rose-400 hover:text-white p-1 rounded-md hover:bg-rose-500/10 transition-colors cursor-pointer"
                title="Dismiss warning"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Autocomplete Dropdown with Live States */}
          {isOpen && !validationError && (
            <div className="absolute top-full left-0 right-0 mt-2 py-2 glass-panel rounded-2xl shadow-2xl overflow-hidden z-40 max-h-96 overflow-y-auto border border-slate-200/80 dark:border-white/15">
              
              {/* Header: Source indicator */}
              <div className="px-4 py-1.5 border-b border-slate-200/70 dark:border-white/10 flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-400 bg-slate-50/50 dark:bg-transparent">
                <span className="flex items-center gap-1.5 font-medium">
                  <Compass className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                  GeoDB Cities Live Suggestions
                </span>
                <span className="font-mono text-slate-500 dark:text-slate-400">
                  {searching ? 'Querying...' : isTyping ? 'Waiting 300ms pause...' : searchSource}
                </span>
              </div>

              {/* STATE: Loading State */}
              {searching && (
                <div className="px-4 py-6 flex flex-col items-center justify-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                  <Loader2 className="w-5 h-5 animate-spin text-sky-500 dark:text-sky-400" />
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    Querying GeoDB Cities for "{query.trim()}"...
                  </span>
                </div>
              )}

              {/* STATE: Results List (Touch target height at least 48px) */}
              {!searching && results.length > 0 && (
                <div className="divide-y divide-slate-100 dark:divide-white/5">
                  {results.map((city, idx) => {
                    const isHighlighted = idx === selectedIndex;
                    return (
                      <button
                        key={`${city.latitude}-${city.longitude}-${city.id || city.name}-${idx}`}
                        type="button"
                        onClick={() => handleSelect(city)}
                        onMouseEnter={() => setSelectedIndex(idx)}
                        className={`w-full min-h-[48px] px-4 py-3 text-left flex items-center justify-between transition-colors group cursor-pointer ${
                          isHighlighted
                            ? 'bg-sky-100/90 dark:bg-sky-500/25 text-slate-900 dark:text-white shadow-sm'
                            : 'hover:bg-slate-100/80 dark:hover:bg-white/10 text-slate-800 dark:text-slate-200'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-xl transition-colors ${
                            isHighlighted
                              ? 'bg-sky-500/20 dark:bg-sky-500/30 text-sky-600 dark:text-sky-300'
                              : 'bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 group-hover:text-sky-600 dark:group-hover:text-sky-300'
                          }`}>
                            <MapPin className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-sky-700 dark:group-hover:text-sky-200">
                              {highlightMatch(city.name, query.trim())}
                            </div>
                            <div className="text-xs text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                              <span className="font-medium text-slate-700 dark:text-slate-300">{[city.admin1, city.country].filter(Boolean).join(', ')}</span>
                              {city.population ? (
                                <>
                                  <span>•</span>
                                  <span className="flex items-center text-[11px] text-slate-500 dark:text-slate-400 font-mono font-medium">
                                    <Users className="w-2.5 h-2.5 mr-0.5" />
                                    {Number(city.population).toLocaleString()}
                                  </span>
                                </>
                              ) : null}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {city.countryCode && (
                            <span className={`text-xs font-mono font-extrabold px-2 py-0.5 rounded-lg border transition-colors ${
                              isHighlighted
                                ? 'bg-sky-200/90 dark:bg-sky-500/30 text-sky-900 dark:text-sky-100 border-sky-300 dark:border-sky-400/40'
                                : 'bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-sky-200 border-slate-200 dark:border-white/10'
                            }`}>
                              {city.countryCode}
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

            </div>
          )}
        </div>

        {/* Action Controls (Visible on Tablet & Desktop >= 640px) */}
        <div className="hidden sm:flex items-center gap-2 shrink-0">
          
          {/* Theme Toggle Button (Desktop & Tablet) */}
          <button
            onClick={onCycleTheme}
            title={`Theme mode: ${themeMode.toUpperCase()} (${resolvedTheme} active). Click to cycle: Dark -> Light -> System`}
            className="min-h-[44px] px-3.5 py-2 flex items-center gap-2 rounded-xl glass-card text-xs font-semibold text-slate-700 dark:text-slate-200 hover:border-sky-500/40 transition-all cursor-pointer"
            aria-label={`Theme mode: ${themeMode}`}
          >
            {themeMode === 'system' ? (
              <>
                <Monitor className="w-4 h-4 text-sky-500 dark:text-sky-400" />
                <span className="hidden md:inline font-medium">Auto</span>
              </>
            ) : resolvedTheme === 'dark' ? (
              <>
                <Moon className="w-4 h-4 text-indigo-400" />
                <span className="hidden md:inline font-medium">Dark</span>
              </>
            ) : (
              <>
                <Sun className="w-4 h-4 text-amber-500" />
                <span className="hidden md:inline font-medium">Light</span>
              </>
            )}
          </button>

          {/* Temperature Unit Toggle (Desktop & Tablet) */}
          <button
            onClick={onToggleUnit}
            title={`Currently displaying in °${unit}. Click to switch to °${unit === 'C' ? 'F' : 'C'}`}
            aria-label={`Switch temperature unit to °${unit === 'C' ? 'F' : 'C'}`}
            className="min-h-[44px] px-2 py-1 flex items-center justify-center rounded-xl glass-card text-xs font-bold transition-all cursor-pointer select-none hover:border-sky-500/40"
          >
            <div className="flex items-center gap-1 p-0.5 rounded-lg bg-slate-200/50 dark:bg-slate-900/50 border border-slate-300/40 dark:border-white/5">
              <span
                className={`px-2 py-1 rounded-md transition-all duration-200 ${
                  unit === 'C'
                    ? 'bg-sky-500 text-white font-black shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                }`}
              >
                °C
              </span>
              <span
                className={`px-2 py-1 rounded-md transition-all duration-200 ${
                  unit === 'F'
                    ? 'bg-sky-500 text-white font-black shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                }`}
              >
                °F
              </span>
            </div>
          </button>

          {/* Morning Alerts Button */}
          <button
            onClick={onOpenNotifications}
            title="Configure Daily Morning Weather Push Notifications"
            className="relative min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl glass-card text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:border-sky-500/40 transition-all cursor-pointer"
          >
            <Bell className="w-4 h-4" />
            {isSubscribed && (
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-white dark:ring-slate-950 animate-pulse" />
            )}
          </button>

          {/* Install App Button */}
          {isInstallable && (
            <button
              onClick={onInstallApp}
              title="Install WeatherPulse App on your device"
              className="min-h-[44px] flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 text-white text-xs font-semibold shadow-lg shadow-sky-500/25 hover:from-sky-400 hover:to-blue-500 transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Install App</span>
            </button>
          )}

          {/* Network Status Badge */}
          <div
            title={isOffline ? 'Offline - Showing cached forecast' : 'Connected to live weather stream'}
            className={`min-h-[44px] flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border ${
              isOffline
                ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
            }`}
          >
            {isOffline ? (
              <>
                <WifiOff className="w-3.5 h-3.5" />
                <span>Offline</span>
              </>
            ) : (
              <>
                <Wifi className="w-3.5 h-3.5" />
                <span>Live</span>
              </>
            )}
          </div>

        </div>

      </div>
    </header>
  );
}
