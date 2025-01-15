const CACHE_NAME = "appV1";

// Installation event
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll([
        '/manifest.json',
        '/static/js/bundle.js',
        '/index.html',
        '/',
        // Add other static assets you want to cache
      ]).catch(error => {
        console.error('Cache addAll error:', error);
      });
    })
  );
});

// Fetch event
self.addEventListener("fetch", (event) => {
  event.respondWith(
    // Try network first, then fallback to cache
    fetch(event.request)
      .then(response => {
        // Clone the response because it can only be consumed once
        const responseClone = response.clone();
        
        // Update the cache with the new response
        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, responseClone);
        });

        return response;
      })
      .catch(() => {
        // If network fails, try to get from cache
        return caches.match(event.request).then(cachedResponse => {
          if (cachedResponse) {
            return cachedResponse;
          }
          // If not in cache and offline, return a custom offline page or error
          return new Response("You are offline and this content is not cached.");
        });
      })
  );
});

// Activate event - cleanup old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Handle push notifications if needed
self.addEventListener('push', (event) => {
  const options = {
    body: event.data.text(),
    icon: 'icon.png',
    badge: 'badge.png'
  };

  event.waitUntil(
    self.registration.showNotification('POS System', options)
  );
});