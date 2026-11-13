const CACHE_NAME = 'weatherpulse-v1';
const STATIC_APP_SHELL = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
  '/favicon.svg'
];

// Normalized key for last viewed city offline fallback
const LAST_VIEWED_KEY = '/api/weather/last_viewed';

// Install: Pre-cache core app shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Pre-caching static app shell');
      return cache.addAll(STATIC_APP_SHELL);
    })
  );
  self.skipWaiting();
});

// Activate: Purge old cache versions
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[SW] Purging old cache version:', key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch: Network-First with Cache Fallback for Weather API & Stale-While-Revalidate for Assets
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // 1. Weather API Calls (/api/weather/current)
  if (url.pathname.includes('/api/weather/current')) {
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone1 = networkResponse.clone();
            const responseClone2 = networkResponse.clone();

            caches.open(CACHE_NAME).then((cache) => {
              // Cache under exact URL
              cache.put(event.request, responseClone1);
              // Also cache as normalized last viewed city fallback
              cache.put(LAST_VIEWED_KEY, responseClone2);
            });
          }
          return networkResponse;
        })
        .catch(async () => {
          // OFFLINE: Try exact URL cache first
          const cache = await caches.open(CACHE_NAME);
          const cachedMatch = await cache.match(event.request);
          if (cachedMatch) return cachedMatch;

          // Fallback to normalized last viewed city forecast
          const lastViewed = await cache.match(LAST_VIEWED_KEY);
          if (lastViewed) return lastViewed;

          // Ultimate offline response
          return new Response(
            JSON.stringify({
              error: 'offline',
              message: 'You are currently offline. Showing cached forecast.'
            }),
            { headers: { 'Content-Type': 'application/json' } }
          );
        })
    );
    return;
  }

  // 2. Static App Shell & Assets (HTML, CSS, JS, Images, Fonts)
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request)
        .then((networkResponse) => {
          if (
            networkResponse &&
            networkResponse.status === 200 &&
            event.request.method === 'GET'
          ) {
            const toCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, toCache);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          // If offline and requesting navigation (HTML page), return root cached app shell
          if (event.request.mode === 'navigate') {
            return caches.match('/index.html') || caches.match('/');
          }
          return cachedResponse;
        });

      return cachedResponse || fetchPromise;
    })
  );
});

// Push Notification Event: Displays weather alert even when app tab is closed
self.addEventListener('push', (event) => {
  console.log('[SW] Push Received:', event);
  let data = {
    title: '🌤️ WeatherPulse Morning Alert',
    body: 'Check today’s weather conditions before heading out!',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    data: { url: '/' }
  };

  if (event.data) {
    try {
      data = event.data.json();
    } catch {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body,
    icon: data.icon || '/icon-192.png',
    badge: data.badge || '/icon-192.png',
    vibrate: [100, 50, 100],
    data: data.data || { url: '/' },
    actions: [
      { action: 'open', title: 'Open Dashboard' },
      { action: 'dismiss', title: 'Dismiss' }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Notification Click Event: Focus or open application window
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const urlToOpen = event.notification.data?.url || '/';

  if (event.action === 'dismiss') return;

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (const client of windowClients) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});
