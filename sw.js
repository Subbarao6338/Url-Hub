const CACHE_NAME = 'url-hub-v2';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './style.css',
  './hub.js',
  './links.json',
  './urlhub.png',
  'https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap',
  'https://fonts.googleapis.com/icon?family=Material+Icons'
];

// Install Event
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // Use cache.addAll to ensure all critical assets are cached
      // If one fails, the installation will fail, which is correct for PWAs
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

// Fetch Event - Stale-While-Revalidate Strategy with error handling
self.addEventListener('fetch', (event) => {
  // Only handle GET requests
  if (event.request.method !== 'GET') return;

  // Skip cross-origin requests unless they are fonts/icons we specifically care about
  // This avoids errors with analytics or other external tracking if they exist
  const url = new URL(event.request.url);
  const isCachableOrigin = url.origin === self.location.origin ||
                          url.origin.includes('fonts.googleapis.com') ||
                          url.origin.includes('fonts.gstatic.com');

  if (!isCachableOrigin) return;

  event.respondWith(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.match(event.request).then((cachedResponse) => {
        const fetchedResponse = fetch(event.request).then((networkResponse) => {
          // If the network response is valid, update the cache
          if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
            cache.put(event.request, networkResponse.clone());
          }
          return networkResponse;
        }).catch((err) => {
          console.warn('Service Worker: Network fetch failed for', event.request.url, err);
          // If network fails and there's no cached version, we could return a fallback here
          // but for now we just return the undefined cachedResponse which leads to normal browser fail
          return cachedResponse;
        });

        // Return the cached response immediately if it exists, or wait for the network response
        return cachedResponse || fetchedResponse;
      });
    })
  );
});
