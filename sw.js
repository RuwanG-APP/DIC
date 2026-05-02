const CACHE_NAME = 'veda-app-v2';

// Essential static assets to cache immediately on install
const STATIC_ASSETS = [
    './',
    './index.html',
    './dictionary.html',
    './manifest.json',
    './head.jpg'
];

// Install event: cache static assets
self.addEventListener('install', event => {
    self.skipWaiting();
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            return cache.addAll(STATIC_ASSETS);
        })
    );
});

// Activate event: cleanup old caches
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cache => {
                    if (cache !== CACHE_NAME) {
                        return caches.delete(cache);
                    }
                })
            );
        })
    );
    self.clients.claim();
});

// Fetch event: Network-First strategy with Fallback to Cache
// This ensures they always get the latest Firebase data or script updates if online,
// but falls back to the fully cached version if offline.
self.addEventListener('fetch', event => {
    // Skip cross-origin requests (like Firebase API calls) from caching
    if (!event.request.url.startsWith(self.location.origin)) {
        return;
    }

    event.respondWith(
        fetch(event.request)
            .then(networkResponse => {
                // If the network fetch is successful, clone the response and store it in cache
                if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
                    const responseToCache = networkResponse.clone();
                    caches.open(CACHE_NAME).then(cache => {
                        cache.put(event.request, responseToCache);
                    });
                }
                return networkResponse;
            })
            .catch(() => {
                // If network fails (Offline), try to return the cached response
                return caches.match(event.request);
            })
    );
});