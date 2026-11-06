/**
 * CyberQuest — Offline-First Service Worker
 * Pre-caches the full application shell and local datasets for 100% offline gameplay.
 * Zero external dependencies, zero CDN calls.
 */

const CACHE_NAME = 'cyberquest-v3';

const PRECACHE_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './assets/city.svg',

  // Stylesheets
  './css/variables.css',
  './css/style.css',
  './css/city.css',
  './css/animations.css',
  './css/print.css',
  './css/components/hud.css',
  './css/components/cybot.css',
  './css/components/modal.css',
  './css/components/district.css',

  // JSON Datasets
  './data/config.json',
  './data/districts.json',
  './data/passwords.json',
  './data/bonus.json',
  './data/emails.json',
  './data/flaws.json',
  './data/scenarios.json',
  './data/quiz.json',
  './data/myths.json',
  './data/ai-messages.json',
  './data/guide-messages.json',

  // Core Scripts
  './js/app.js',
  './js/state.js',
  './js/router.js',
  './js/city.js',
  './js/guide.js',
  './js/audio.js',
  './js/idle.js',
  './js/demo.js',
  './js/utils.js',
  './js/ui.js',

  // District Modules
  './js/modules/phishing.js',
  './js/modules/password.js',
  './js/modules/ethical.js',
  './js/modules/flaws.js',
  './js/modules/quiz.js',
  './js/modules/myths.js',
  './js/modules/ai.js',
  './js/modules/bonus.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  // Only handle GET requests
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request).then((networkResponse) => {
        // Cache dynamic local requests if valid
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      });
    }).catch(() => {
      // Offline fallback for navigation requests
      if (event.request.mode === 'navigate') {
        return caches.match('./index.html');
      }
    })
  );
});

