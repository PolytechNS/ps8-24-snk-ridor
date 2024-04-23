let cacheName = 'v1';
let cacheBlacklist = ['/api', '/chat', '/friend', '/login', '/msg_friends', '/msg_rooms', '/online', '/online-game', '/profile', '/signup', '/socket.io'];

self.addEventListener('fetch', (e) => {
    e.respondWith(
        (async () => {
            console.log(`[Service Worker] Fetching resource: ${e.request.url}`);

            const cache = await caches.open(cacheName);
            let cachedResponse = await cache.match(e.request);

            if (cachedResponse) {
                console.log(`[Service Worker] Returning cached resource: ${e.request.url}`);
                return cachedResponse;
            } else {
                const response = await fetch(e.request);

                if (response && response.status === 200) {
                    if (cacheBlacklist.some((url) => e.request.url.includes(url))) {
                        console.log(`[Service Worker] Not caching blacklisted resource: ${e.request.url}`);
                    } else {
                        console.log(`[Service Worker] Caching new resource: ${e.request.url}`);
                        cache.put(e.request, response.clone());
                    }
                }
                return response;
            }
        })()
    );
});
