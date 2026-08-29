const CACHE_NAME = 'epic-toolbox-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/assets/favicon.svg'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)).catch((err) => {
      console.warn('SW cache install warning:', err);
    })
  );
});

self.addEventListener('fetch', (e) => {
  // Do not intercept non-GET or API requests
  if (e.request.method !== 'GET' || e.request.url.includes('/api/')) return;
  e.respondWith(
    caches.match(e.request).then((res) => res || fetch(e.request))
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
      )
    )
  );
});
