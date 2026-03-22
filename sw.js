const CACHE_NAME = 'jafe-pwa-v1';

// The files we want to save to the user's phone for fast loading
const urlsToCache = [
    './',
    './index.html',
    './style.css',
    './script.js',
    './j-logo.png'
];

// 1. Install the Service Worker and Cache the files
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            console.log('Opened cache');
            return cache.addAll(urlsToCache);
        })
    );
});

// 2. Intercept network requests and serve from Cache if possible
self.addEventListener('fetch', event => {
    // IMPORTANT: Do NOT cache our API requests to Vercel/MongoDB!
    if (event.request.url.includes('vercel.app')) {
        return; 
    }

    event.respondWith(
        caches.match(event.request).then(response => {
            // Return the cached file if found, otherwise fetch from the internet
            return response || fetch(event.request);
        })
    );
});

// 3. Update the Cache when we make changes to the app
self.addEventListener('activate', event => {
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});
