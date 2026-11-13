import React from 'react';
import { Star, X, MapPin, AlertCircle, AlertTriangle, ShieldAlert } from 'lucide-react';
import { formatTemp, getWeatherIconComponent } from '../utils/helpers';
import { MAX_FAVORITES } from '../hooks/useFavorites';

export default function FavoritesBar({
  favorites = [],
  currentCityName,
  onSelectCity,
  onRequestRemove,
  cityPendingRemoval,
  onConfirmRemove,
  onCancelRemove,
  favoritesMessage,
  onDismissMessage,
  isStorageSupported,
  unit = 'C'
}) {
  const cleanCurrent = (currentCityName || '').split(',')[0].trim().toLowerCase();
  const count = favorites.length;
  const isFull = count >= MAX_FAVORITES;

  return (
    <div className="w-full max-w-6xl mx-auto px-4 pt-4 space-y-2">
      
      {/* Toast Notification (Success / Warning / Limit) */}
      {favoritesMessage && (
        <div
          role="status"
          className={`flex items-center justify-between gap-3 px-4 py-2.5 rounded-2xl text-xs font-semibold shadow-lg border backdrop-blur-md animate-in fade-in slide-in-from-top-1 ${
            favoritesMessage.type === 'limit'
              ? 'bg-amber-500/15 border-amber-500/40 text-amber-200 shadow-amber-950/20'
              : favoritesMessage.type === 'success'
              ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-200 shadow-emerald-950/20'
              : 'bg-sky-500/15 border-sky-500/40 text-sky-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {favoritesMessage.type === 'limit' ? (
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            ) : (
              <Star className="w-4 h-4 text-emerald-400 fill-emerald-400 shrink-0" />
            )}
            <span>{favoritesMessage.text}</span>
          </div>

          <button
            onClick={onDismissMessage}
            className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Graceful Degradation Banner if localStorage is disabled */}
      {!isStorageSupported && (
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-amber-500/30 text-amber-300 text-[11px]">
          <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
          <span>Private browsing / localStorage restricted: Favourites will be preserved in memory for this session only.</span>
        </div>
      )}

      {/* Quick-Access Panel Bar */}
      <div className="glass-panel rounded-2xl px-4 py-2.5 flex items-center justify-between gap-3 overflow-x-auto scrollbar-none">
        
        {/* Left: Counter Title */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
            <span>Quick-Access Favourites:</span>
          </div>

          <span
            className={`px-2 py-0.5 rounded-full text-[11px] font-mono font-bold border ${
              isFull
                ? 'bg-amber-500/20 text-amber-600 dark:text-amber-300 border-amber-500/40'
                : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-white/10'
            }`}
          >
            {count}/{MAX_FAVORITES} {isFull ? '(Max)' : ''}
          </span>
        </div>

        {/* Middle: City Chips or Empty State */}
        <div className="flex items-center gap-2 flex-1 overflow-x-auto scrollbar-none py-1">
          {count === 0 ? (
            <div className="text-xs text-slate-500 dark:text-slate-400 italic">
              Click the star icon beside any city to save up to 5 quick-access favourites.
            </div>
          ) : (
            favorites.map((fav) => {
              const isSelected = fav.name.toLowerCase() === cleanCurrent;

              return (
                <div
                  key={fav._id || fav.name}
                  className={`group shrink-0 flex items-center gap-2 pl-3 pr-1.5 py-1.5 rounded-xl border text-xs font-medium transition-all ${
                    isSelected
                      ? 'bg-sky-500/25 border-sky-400/60 text-sky-950 dark:text-white shadow-md shadow-sky-500/25 ring-1 ring-sky-400/30'
                      : 'bg-slate-100 dark:bg-slate-900/60 border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() =>
                      onSelectCity(
                        fav.latitude,
                        fav.longitude,
                        `${fav.name}${fav.country ? ', ' + fav.country : ''}`
                      )
                    }
                    className="min-h-[44px] flex items-center gap-2 text-left cursor-pointer pr-1"
                    title={`View ${fav.name} forecast`}
                  >
                    {fav.icon ? (
                      getWeatherIconComponent(fav.icon, { className: 'w-4 h-4' })
                    ) : (
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    )}
                    <span className="font-semibold">{fav.name}</span>
                    {fav.temp !== undefined && (
                      <span className="font-bold text-sky-600 dark:text-sky-300 font-mono">
                        {formatTemp(fav.temp, unit)}°
                      </span>
                    )}
                  </button>

                  {/* Remove Button with Confirmation Requirement (Touch target at least 44x44px) */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRequestRemove(fav._id || fav.name, fav.name);
                    }}
                    title={`Remove ${fav.name} from favourites`}
                    className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/20 active:scale-95 transition-all cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              );
            })
          )}
        </div>

      </div>

      {/* CONFIRMATION MODAL ON REMOVAL */}
      {cityPendingRemoval && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="glass-panel w-full max-w-sm rounded-3xl p-6 space-y-4 shadow-2xl border border-rose-500/30 text-center animate-in zoom-in-95">
            
            <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Remove "{cityPendingRemoval.name}"?
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Are you sure you want to remove <strong className="text-slate-900 dark:text-white">{cityPendingRemoval.name}</strong> from your quick-access favourites panel?
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={onCancelRemove}
                className="flex-1 min-h-[44px] py-2.5 px-4 rounded-xl glass-card text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 active:scale-95 transition-all cursor-pointer"
              >
                Cancel
              </button>
              
              <button
                type="button"
                onClick={onConfirmRemove}
                className="flex-1 min-h-[44px] py-2.5 px-4 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold shadow-lg shadow-rose-500/25 active:scale-95 transition-all cursor-pointer"
              >
                Yes, Remove
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
