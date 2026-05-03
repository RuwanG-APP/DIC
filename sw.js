const CACHE_NAME = 'veda-app-v3';

// Essential static assets to cache immediately on install
const STATIC_ASSETS = [
    './',
    './index.html',
    './dictionary.html',
    './manifest.json',
    './head.jpg',
    './history-1.png',
    './history-2.png',
    './nayaka-himi.png',
    './FMEmanee.TTF',
    './info_data.js',
    './data.js',
    './data_79_88.js',
    './data_89_98.js',
    './data_99_108.js',
    './data_109_115.js',
    './data_116_124.js',
    './data_125_134.js',
    './data_135_143.js',
    './data_144_152.js',
    './data_153_161.js',
    './data_162_171.js',
    './data_172_177.js',
    './data_178_185.js',
    './data_186_193.js',
    './data_194_202.js',
    './data_203_210.js',
    './data_211_220.js',
    './data_221_230.js',
    './data_231_240.js',
    './data_241_250.js',
    './data_251_259.js',
    './data_260_269.js',
    './data_270_278.js',
    './data_279_287.js',
    './data_288_296.js',
    './data_297_305.js',
    './data_306_314.js',
    './data_315_324.js',
    './data_325_334.js',
    './data_335_344.js',
    './data_345_354.js',
    './data_355_364.js',
    './data_365_374.js',
    './data_375_384.js',
    './data_385_394.js',
    './data_395_404.js',
    './data_405_417.js',
    './data_418_427.js',
    './data_428_438.js',
    './data_439_449.js',
    './data_450_458.js',
    './data_459_470.js',
    './data_471_481.js',
    './data_482_492.js',
    './data_493_506.js',
    './data_507_513.js',
    './data_514_524.js'
];

// Install event: cache static assets
self.addEventListener('install', event => {
    self.skipWaiting();
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            console.log('Caching essential assets...');
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

// Fetch event: Cache-First strategy for local assets, Network-First for others
self.addEventListener('fetch', event => {
    const url = new URL(event.request.url);

    // Strategy 1: Cache-First for Local Assets & Firebase Scripts
    const isLocal = url.origin === self.location.origin;
    const isFirebaseScript = url.origin === 'https://www.gstatic.com';

    if (isLocal || isFirebaseScript) {
        event.respondWith(
            caches.match(event.request).then(cachedResponse => {
                if (cachedResponse) {
                    // Return cached response immediately, but update it in background
                    fetch(event.request).then(networkResponse => {
                        if (networkResponse && networkResponse.status === 200) {
                            caches.open(CACHE_NAME).then(cache => cache.put(event.request, networkResponse));
                        }
                    }).catch(() => {}); // Ignore network errors in background update
                    return cachedResponse;
                }

                // If not in cache, fetch from network and cache it
                return fetch(event.request).then(networkResponse => {
                    if (networkResponse && networkResponse.status === 200) {
                        const responseToCache = networkResponse.clone();
                        caches.open(CACHE_NAME).then(cache => cache.put(event.request, responseToCache));
                    }
                    return networkResponse;
                });
            })
        );
    } else {
        // Strategy 2: Network-First for dynamic things (like Firebase API calls)
        event.respondWith(
            fetch(event.request).catch(() => caches.match(event.request))
        );
    }
});