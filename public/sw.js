const CACHE_NAME = 'semihalgan-cache-v1';
const STATIC_ASSETS = [
  '/',
  '/favicon.ico',
  '/favicon.svg',
  '/favicon-192x192.png',
  '/og-image.png'
];

// Service Worker kurulumu ve temel dosyaların önbelleğe alınması
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

// Eski önbellekleri temizleme
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// Ağ isteklerini yakalama
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // API istekleri (/api/community/*) ve POST/PUT/DELETE işlemleri Service Worker önbelleğine girmez
  if (event.request.method !== 'GET' || url.pathname.startsWith('/api/')) {
    return;
  }

  // Önce internetten çekmeye çalış, internet yoksa önbellekten sun (Network-first fallback)
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});
