// Change this version number whenever you want to force a massive wipe!
const CACHE_NAME = 'jafe-pwa-v2'; 

const urlsToCache = [
    './',
    './index.html',
    './style.css',
    './script.js',
    './j-logo.png'
];

// 1. INSTALL: Kick out the old version immediately!
self.addEventListener('install', event => {
    self.skipWaiting(); // <-- THE MAGIC LINE: Forces immediate activation
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            console.log('Opened cache');
            return cache.addAll(urlsToCache);
        })
    );
});

// 2. ACTIVATE: Take control of the phone immediately and delete old caches
self.addEventListener('activate', event => {
    event.waitUntil(self.clients.claim()); // <-- THE MAGIC LINE: Take control of all open pages

    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (!cacheWhitelist.includes(cacheName)) {
                        console.log('Deleting old cache:', cacheName);
                        return caches.delete(cacheName); // Wipe old memories!
                    }
                })
            );
        })
    );
});

// 3. FETCH: "Network-First" Strategy (Always get newest code if online)
self.addEventListener('fetch', event => {
    // Do not cache API requests to Vercel/MongoDB
    if (event.request.url.includes('vercel.app')) {
        return; 
    }

    event.respondWith(
        fetch(event.request)
            .then(response => {
                // We got a response from the internet! It's the newest code.
                // Save a copy to the cache so it works offline later.
                const clonedResponse = response.clone();
                caches.open(CACHE_NAME).then(cache => {
                    cache.put(event.request, clonedResponse);
                });
                return response;
            })
            .catch(() => {
                // If the internet fails (user is offline), serve from the cache
                return caches.match(event.request);
            })
    );
});
