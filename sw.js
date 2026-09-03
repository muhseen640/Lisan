const CACHE_NAME = 'lisan-shell-v26-dialogues-school';
const SHELL_FILES = [
  './',
  './index.html',
  './styles.css',
  './app.js',
  './manifest.json',
  './lib/db.js',
  './lib/store.js',
  './lib/unlockCode.js',
  './lib/speech.js',
  './lib/icons.js',
  './lib/i18n.js',
  './content/types.js',
  './content/packs.js',
  './content/arabic-basics.js',
  './content/hotel-english.js',
  './content/dialogues-restaurant.js',
  './content/dialogues-school.js',
  './content/hausa/arabic-basics.ha.js',
  './content/hausa/hotel-english.ha.js',
  './icons/icon-192.png',
  './icons/icon-512.png',
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(SHELL_FILES)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Cache-first for the app shell + content; network-first fallback for
// anything else (e.g. Google Fonts), so the app stays fast and usable
// offline but doesn't pretend to cache the whole internet.
self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;

  event.respondWith(
    caches.match(req).then(cached => {
      if (cached) return cached;
      return fetch(req)
        .then(res => {
          if (res.ok && new URL(req.url).origin === self.location.origin) {
            const copy = res.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(req, copy));
          }
          return res;
        })
        .catch(() => cached);
    })
  );
});
