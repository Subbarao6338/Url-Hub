const CACHE_NAME = 'url-hub-v9';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './css/style.css',
  './data/url_links.json',
  './data/url_cat.json',
  './data/necs_links.json',
  './data/necs_cat.json',
  './assets/favicon.svg',
  './assets/urlhub.png',
  'https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap',
  'https://fonts.googleapis.com/icon?family=Material+Icons'
];

// Install Event
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    }).catch(err => {
      console.error('Service Worker: Cache addition failed during installation:', err);
    })
  );
  self.skipWaiting();
});

// Activate Event
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('Service Worker: Clearing Old Cache', cache);
            return caches.delete(cache);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch Event - Stale-While-Revalidate Strategy
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);
  const isLocal = url.origin === self.location.origin;
  const isApi = url.pathname.startsWith('/api/');
  const isFont = url.origin.includes('fonts.googleapis.com') || url.origin.includes('fonts.gstatic.com');
  const isCachable = (isLocal && !isApi) || isFont;

  // Cache API GET requests - Network First strategy
  if (isLocal && isApi) {
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse.ok) {
            const cacheCopy = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, cacheCopy);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          return caches.match(event.request);
        })
    );
    return;
  }

  // For non-cachable origins (mostly external favicons)
  if (!isCachable) {
    if (event.request.destination === 'image') {
      event.respondWith(
        caches.match(event.request).then((cached) => {
          return cached || fetch(event.request).then((response) => {
            if (response.ok) {
              const copy = response.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
            }
            return response;
          }).catch(() => caches.match('./assets/favicon.svg'));
        })
      );
    }
    return;
  }

  // Stale-while-revalidate for cachable assets
  event.respondWith(
    caches.open(CACHE_NAME).then((cache) => {
      // ignoreSearch is useful for local assets that might have cache-buster timestamps
      const matchOptions = isLocal ? { ignoreSearch: true } : {};

      return cache.match(event.request, matchOptions).then((cachedResponse) => {
        const fetchPromise = fetch(event.request).then((networkResponse) => {
          if (networkResponse.ok) {
            cache.put(event.request, networkResponse.clone());
          }
          return networkResponse;
        }).catch((err) => {
          if (event.request.destination === 'image') {
            return cachedResponse || caches.match('./assets/favicon.svg');
          }
          return cachedResponse;
        });

        return cachedResponse || fetchPromise;
      });
    })
  );
});
