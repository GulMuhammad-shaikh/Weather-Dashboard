import React, { useState, useEffect } from 'react';
import {
  Bell,
  BellOff,
  Clock,
  MapPin,
  Check,
  AlertTriangle,
  AlertCircle,
  X,
  Send,
  Loader2,
  Sparkles,
  Info,
  ShieldCheck,
  ShieldAlert,
  HelpCircle
} from 'lucide-react';

export default function NotificationModal({
  isOpen,
  onClose,
  currentLocation,
  isSubscribed,
  notificationTime,
  onSubscribe,
  onTestNotification,
  loading,
  statusMessage,
  isSupported = true,
  permission = 'default'
}) {
  const [selectedTime, setSelectedTime] = useState(notificationTime || '08:00');
  const [timeError, setTimeError] = useState(null);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const cityName = currentLocation?.name || 'Selected City';
  const isPermissionDenied = permission === 'denied';
  const isPermissionGranted = permission === 'granted';

  const timeOptions = [
    { value: '06:00', label: '6:00 AM (Early Riser)' },
    { value: '06:30', label: '6:30 AM' },
    { value: '07:00', label: '7:00 AM' },
    { value: '07:30', label: '7:30 AM' },
    { value: '08:00', label: '8:00 AM (Recommended)' },
    { value: '08:30', label: '8:30 AM' },
    { value: '09:00', label: '9:00 AM' },
    { value: '09:30', label: '9:30 AM' },
    { value: '10:00', label: '10:00 AM' }
  ];

  const validateTimeSelection = (timeVal) => {
    if (!timeVal) {
      return {
        title: 'Delivery time is required',
        description: 'Please select a preferred morning hour (e.g. 8:00 AM) to receive your daily alert.'
      };
    }

    if (!isSupported) {
      return {
        title: 'Push notifications unsupported',
        description: 'Your browser environment does not support background Web Push. The rest of WeatherPulse will continue working normally.'
      };
    }

    if (isPermissionDenied) {
      return {
        title: 'Browser notifications are blocked',
        description: 'Notifications are blocked in your browser settings. The rest of WeatherPulse remains fully functional. To enable alerts: click the lock/settings icon in your browser address bar, set Notifications to "Allow", and reload.'
      };
    }

    if (!currentLocation || !currentLocation.name) {
      return {
        title: 'City location required',
        description: 'Please search for a city on the dashboard first so WeatherPulse knows which location to report.'
      };
    }

    return null;
  };

  const handleBlur = () => {
    const err = validateTimeSelection(selectedTime);
    setTimeError(err);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const err = validateTimeSelection(selectedTime);
    if (err) {
      setTimeError(err);
      return;
    }
    setTimeError(null);
    onSubscribe(currentLocation, selectedTime);
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex justify-center items-start sm:items-center p-3 sm:p-6"
    >
      <div className="glass-panel w-full max-w-lg rounded-3xl shadow-2xl border border-white/20 relative animate-in fade-in zoom-in-95 duration-200 my-4 sm:my-8 overflow-hidden bg-white/95 dark:bg-slate-900/95 text-slate-900 dark:text-slate-100">
        
        {/* Sticky Header with Prominent Close Button */}
        <div className="sticky top-0 z-20 px-6 py-4 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-b border-slate-200 dark:border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-sky-500 via-blue-600 to-indigo-600 text-white shadow-lg shadow-sky-500/30">
              <Bell className="w-5 h-5 animate-bounce" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight m-0">
                Morning Weather Alerts
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 m-0">
                Scheduled daily morning Web Push notification
              </p>
            </div>
          </div>

          {/* Prominent High-Contrast Close Button (44x44px touch target) */}
          <button
            type="button"
            onClick={onClose}
            className="w-11 h-11 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-2xl bg-slate-100 hover:bg-rose-500 hover:text-white dark:bg-white/10 dark:hover:bg-rose-500 text-slate-600 dark:text-slate-200 border border-slate-200 dark:border-white/10 shadow-sm active:scale-95 transition-all cursor-pointer"
            title="Close (Esc)"
            aria-label="Close modal"
          >
            <X className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>

        {/* Modal Scrollable Content Body */}
        <div className="p-6 sm:p-8 space-y-6 max-h-[calc(90vh-80px)] overflow-y-auto">

          {/* 1. CLEAR FALLBACK IF UNSUPPORTED */}
          {!isSupported && (
            <div className="p-4 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-900 dark:text-amber-200 text-xs space-y-2">
              <div className="flex items-center gap-2 font-bold text-amber-700 dark:text-amber-300">
                <BellOff className="w-4 h-4 text-amber-500 shrink-0" />
                <span>Web Push Notifications Unavailable in This Browser</span>
              </div>
              <p className="text-amber-950 dark:text-amber-200/90 leading-relaxed">
                Your current browser environment does not support the Web Push API (common in Private / Incognito windows or older browsers).
              </p>
              <p className="text-amber-950 dark:text-amber-200/80 font-medium">
                👉 <strong>Good news:</strong> The rest of WeatherPulse (live conditions, 5-day forecasts, favourites, offline mode) will continue working completely normally.
              </p>
            </div>
          )}

          {/* 2. DENIED PERMISSION NOTICE (Does not break anything else) */}
          {isSupported && isPermissionDenied && (
            <div className="p-4 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-900 dark:text-rose-200 text-xs space-y-2">
              <div className="flex items-center gap-2 font-bold text-rose-700 dark:text-rose-300">
                <ShieldAlert className="w-4 h-4 text-rose-500 shrink-0" />
                <span>Notifications are Blocked in Browser Settings</span>
              </div>
              <p className="text-rose-950 dark:text-rose-200/90 leading-relaxed">
                Your browser has blocked notifications for this site. <strong>The rest of WeatherPulse remains 100% functional without alerts.</strong>
              </p>
              <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-white/5 text-[11px] text-slate-700 dark:text-slate-300 space-y-1">
                <div className="font-semibold text-rose-600 dark:text-rose-300">To enable morning alerts later:</div>
                <ol className="list-decimal list-inside space-y-0.5 text-slate-600 dark:text-slate-400">
                  <li>Click the padlock or site settings icon beside the URL in your browser bar.</li>
                  <li>Find <strong>Notifications</strong> and change it to <strong>Allow</strong>.</li>
                  <li>Re-open this modal and select your wake-up time.</li>
                </ol>
              </div>
            </div>
          )}

          {/* 3. EXPLAIN WHY BEFORE PERMISSION PROMPT APPEARS */}
          {isSupported && !isPermissionDenied && !isSubscribed && (
            <div className="p-4 rounded-2xl bg-sky-500/10 border border-sky-500/25 text-xs space-y-3">
              <div className="flex items-center gap-2 font-bold text-sky-700 dark:text-sky-300 text-sm">
                <Sparkles className="w-4 h-4 text-sky-500 shrink-0" />
                <span>Why Enable Morning Weather Alerts?</span>
              </div>
              <ul className="space-y-2 text-slate-700 dark:text-slate-300 text-xs leading-relaxed">
                <li className="flex items-start gap-2">
                  <span className="text-sky-500 font-bold">•</span>
                  <span><strong>Plan Your Morning:</strong> Receive a concise daily summary of today's temperature, rain probability, and wind so you can dress comfortably and never forget an umbrella.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-sky-500 font-bold">•</span>
                  <span><strong>Fires Even When Tab is Closed:</strong> Powered by our background Service Worker and server scheduler. You don't need to keep the tab open.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-sky-500 font-bold">•</span>
                  <span><strong>Zero Spam & Privacy First:</strong> Exactly 1 notification per morning at your chosen hour. No advertisements, no marketing, and you can disable or adjust anytime.</span>
                </li>
              </ul>
              <div className="pt-1 text-[11px] text-sky-800 dark:text-sky-300/80 italic">
                When you click the button below, your browser will display its permission prompt. Click <strong>Allow</strong> to confirm.
              </div>
            </div>
          )}

          {/* 4. CURRENT LOCATION TARGET */}
          <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-white/10 space-y-1">
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-sky-500" />
              <span>Notification Location</span>
            </div>
            <div className="text-sm font-bold text-slate-900 dark:text-white">
              {cityName}
            </div>
            <div className="text-[11px] text-slate-600 dark:text-slate-400">
              The morning push notification will summarize today's temperature, condition text, rain chances, and high/lows for this city.
            </div>
          </div>

          {/* 5. FORM: TIME PICKER & SUBSCRIBE */}
          <form onSubmit={handleSubmit} className="space-y-4">
            
            <div className="space-y-1.5">
              <label htmlFor="morning-reminder-time" className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-amber-500" />
                  <span>Choose Your Reminder Time</span>
                </span>
              </label>

              <select
                id="morning-reminder-time"
                value={selectedTime}
                onChange={(e) => {
                  setSelectedTime(e.target.value);
                  if (timeError) setTimeError(null);
                }}
                onBlur={handleBlur}
                disabled={loading || !isSupported || isPermissionDenied}
                aria-invalid={Boolean(timeError)}
                aria-describedby={timeError ? "notification-time-error" : undefined}
                className={`w-full min-h-[44px] px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-white/15 text-sm text-slate-900 dark:text-white outline-none transition-all ${
                  timeError ? 'border-rose-500 ring-2 ring-rose-500/30 text-rose-600 dark:text-rose-100' : 'focus:ring-2 focus:ring-sky-500'
                } ${(!isSupported || isPermissionDenied) ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {timeOptions.map(opt => (
                  <option key={opt.value} value={opt.value} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                    {opt.label}
                  </option>
                ))}
              </select>

              {/* Inline Error Message */}
              {timeError && (
                <div id="notification-time-error" className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-900 dark:text-rose-200 text-xs flex items-start gap-2 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <div className="font-bold text-rose-700 dark:text-rose-300">{timeError.title}</div>
                    <div className="text-[11px] text-rose-900 dark:text-rose-200/90 leading-relaxed">{timeError.description}</div>
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons (Touch targets at least 44px) */}
            <div className="space-y-2.5 pt-2">
              <button
                type="submit"
                disabled={loading || !isSupported || isPermissionDenied}
                className="w-full min-h-[44px] flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-bold text-sm shadow-xl shadow-sky-500/25 active:scale-98 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : isSubscribed ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <Bell className="w-4 h-4" />
                )}
                <span>
                  {isSubscribed
                    ? `Update Schedule to ${selectedTime}`
                    : `Enable Daily Morning Alerts at ${selectedTime}`}
                </span>
              </button>

              {/* Test Alert Button (44px touch target) */}
              <button
                type="button"
                onClick={() => onTestNotification(currentLocation)}
                disabled={loading || !isSupported || isPermissionDenied}
                className="w-full min-h-[44px] flex items-center justify-center gap-2 py-2.5 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-xs font-semibold text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-white/10 active:scale-98 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Send className="w-3.5 h-3.5 text-sky-500" />
                <span>Send Test Alert to My Device Now</span>
              </button>

              {/* Close Button at bottom */}
              <button
                type="button"
                onClick={onClose}
                className="w-full min-h-[44px] flex items-center justify-center py-2 px-4 rounded-xl text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-all cursor-pointer"
              >
                Close Window
              </button>
            </div>
          </form>

          {/* Footnote */}
          <div className="text-[11px] text-center text-slate-500 flex items-center justify-center gap-1.5 pb-2">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>Fires in background via Service Worker even when browser tab is closed.</span>
          </div>

        </div>

      </div>
    </div>
  );
}
