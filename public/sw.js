const CACHE_NAME = 'currentdao-v1';
const STATIC_CACHE = 'currentdao-static-v1';
const API_CACHE = 'currentdao-api-v1';
const IMAGE_CACHE = 'currentdao-images-v1';
const RUNTIME_CACHE = 'currentdao-runtime-v1';

// Cache URLs - Critical assets for offline functionality
const STATIC_URLS = [
  '/',
  '/_next/static/css/',
  '/_next/static/chunks/',
  '/_next/static/media/',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
];

// API endpoints to cache
const API_URLS = [
  '/api/portfolio/',
  '/api/metrics/',
  '/api/user/profile',
  '/api/dashboard/stats',
  '/api/energy/rates',
  '/api/energy/history',
];

// Performance monitoring
const performanceMetrics = {
  cacheHits: 0,
  cacheMisses: 0,
  networkRequests: 0,
  offlineResponses: 0,
};

// Advanced cache strategies with performance optimization
const cacheStrategies = {
  // Cache first with network fallback for static assets
  static: async (request) => {
    const cache = await caches.open(STATIC_CACHE);
    const cached = await cache.match(request);
    
    if (cached) {
      performanceMetrics.cacheHits++;
      // Background refresh for stale content
      refreshInBackground(request, cache);
      return cached;
    }
    
    performanceMetrics.cacheMisses++;
    try {
      const response = await fetch(request);
      if (response.ok) {
        cache.put(request, response.clone());
      }
      return response;
    } catch (error) {
      // Return offline fallback
      return getOfflineFallback(request);
    }
  },

  // Network first with cache fallback for API calls
  api: async (request) => {
    const cache = await caches.open(API_CACHE);
    const cached = await cache.match(request);
    
    try {
      performanceMetrics.networkRequests++;
      const response = await fetch(request);
      if (response.ok) {
        // Cache successful responses
        cache.put(request, response.clone());
      }
      return response;
    } catch (error) {
      performanceMetrics.offlineResponses++;
      // Return cached version if network fails
      if (cached) {
        return cached;
      }
      return new Response(JSON.stringify({ 
        error: 'Offline',
        message: 'No network connection and no cached data available',
        timestamp: Date.now()
      }), {
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  },

  // Stale while revalidate for images and media
  image: async (request) => {
    const cache = await caches.open(IMAGE_CACHE);
    const cached = await cache.match(request);
    
    // Return cached immediately if available
    if (cached) {
      performanceMetrics.cacheHits++;
      // Update in background
      updateImageCache(request, cache);
      return cached;
    }
    
    // Fetch and cache
    try {
      performanceMetrics.networkRequests++;
      const response = await fetch(request);
      if (response.ok) {
        cache.put(request, response.clone());
      }
      return response;
    } catch (error) {
      performanceMetrics.offlineResponses++;
      return getOfflineFallback(request);
    }
  },

  // Runtime cache for dynamic content
  runtime: async (request) => {
    const cache = await caches.open(RUNTIME_CACHE);
    const cached = await cache.match(request);
    
    if (cached && !isExpired(cached)) {
      performanceMetrics.cacheHits++;
      return cached;
    }
    
    try {
      performanceMetrics.networkRequests++;
      const response = await fetch(request);
      if (response.ok) {
        cache.put(request, response.clone());
      }
      return response;
    } catch (error) {
      return cached || getOfflineFallback(request);
    }
  },

  // Network only for sensitive requests
  network: async (request) => {
    performanceMetrics.networkRequests++;
    return fetch(request);
  }
};

// Background refresh for cached content
async function refreshInBackground(request, cache) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      cache.put(request, response);
    }
  } catch (error) {
    console.warn('Background refresh failed:', error);
  }
}

// Update image cache with WebP/AVIF optimization
async function updateImageCache(request, cache) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      cache.put(request, response.clone());
    }
  } catch (error) {
    console.warn('Image cache update failed:', error);
  }
}

// Check if cached response is expired
function isExpired(response) {
  const cacheControl = response.headers.get('cache-control');
  if (cacheControl) {
    const maxAge = cacheControl.match(/max-age=(\d+)/);
    if (maxAge) {
      const dateHeader = response.headers.get('date');
      if (dateHeader) {
        const responseTime = new Date(dateHeader).getTime();
        const currentTime = Date.now();
        return currentTime - responseTime > parseInt(maxAge[1]) * 1000;
      }
    }
  }
  return false;
}

// Get offline fallback response
function getOfflineFallback(request) {
  const url = new URL(request.url);
  
  // HTML fallback for navigation requests
  if (request.mode === 'navigate') {
    return caches.match('/').then(cached => {
      return cached || new Response(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>CurrentDAO - Offline</title>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <style>
              body { font-family: system-ui, sans-serif; text-align: center; padding: 2rem; }
              .offline { color: #666; }
              .retry { background: #0070f3; color: white; padding: 1rem 2rem; border: none; border-radius: 4px; cursor: pointer; }
            </style>
          </head>
          <body>
            <h1>You're offline</h1>
            <p class="offline">Please check your internet connection and try again.</p>
            <button class="retry" onclick="window.location.reload()">Retry</button>
          </body>
        </html>
      `, {
        status: 200,
        headers: { 'Content-Type': 'text/html' }
      });
    });
  }
  
  // Image fallback
  if (url.pathname.match(/\.(jpg|jpeg|png|gif|webp|avif|svg)$/i)) {
    return new Response('', { status: 404 });
  }
  
  // Default offline response
  return new Response('Offline', { status: 503 });
}

// Determine cache strategy based on request
function getStrategy(request) {
  const url = new URL(request.url);
  
  // Static assets and navigation
  if (STATIC_URLS.some(pattern => url.pathname.startsWith(pattern)) || 
      request.mode === 'navigate') {
    return 'static';
  }
  
  // API calls
  if (API_URLS.some(pattern => url.pathname.startsWith(pattern))) {
    return 'api';
  }
  
  // Images and media
  if (url.pathname.match(/\.(jpg|jpeg|png|gif|webp|avif|svg|ico)$/i)) {
    return 'image';
  }
  
  // Runtime cache for dynamic content
  if (url.pathname.includes('/_next/data/')) {
    return 'runtime';
  }
  
  // Network only for authentication and sensitive data
  if (url.pathname.includes('/auth/') || url.pathname.includes('/api/auth/')) {
    return 'network';
  }
  
  return 'static';
}

// Install event - cache critical assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    Promise.all([
      // Cache critical static assets
      caches.open(STATIC_CACHE).then(cache => cache.addAll(STATIC_URLS)),
      // Pre-cache critical API endpoints
      caches.open(API_CACHE).then(cache => {
        return Promise.all(API_URLS.map(url => 
          fetch(url).then(response => {
            if (response.ok) cache.put(url, response);
          }).catch(() => {})
        ));
      })
    ]).then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      const currentCaches = [CACHE_NAME, STATIC_CACHE, API_CACHE, IMAGE_CACHE, RUNTIME_CACHE];
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (!currentCaches.includes(cacheName)) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      // Claim all clients to start controlling them immediately
      return self.clients.claim();
    })
  );
});

// Fetch event - handle requests with appropriate strategy
self.addEventListener('fetch', (event) => {
  const strategy = getStrategy(event.request);
  
  if (strategy && cacheStrategies[strategy]) {
    event.respondWith(cacheStrategies[strategy](event.request));
  }
});

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
  if (event.tag === 'performance-metrics') {
    event.waitUntil(reportPerformanceMetrics());
  }
});

// Handle background sync
async function doBackgroundSync() {
  try {
    const pendingRequests = await getPendingRequests();
    
    for (const request of pendingRequests) {
      try {
        await fetch(request.url, request.options);
        await removePendingRequest(request.id);
      } catch (error) {
        console.error('Failed to sync request:', error);
      }
    }
  } catch (error) {
    console.error('Background sync failed:', error);
  }
}

// Report performance metrics
async function reportPerformanceMetrics() {
  const allClients = await self.clients.matchAll();
  
  allClients.forEach(client => {
    client.postMessage({
      type: 'PERFORMANCE_METRICS',
      data: performanceMetrics
    });
  });
}

// Push notifications with performance insights
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : 'New portfolio update available',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'View Portfolio',
        icon: '/icons/checkmark.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/icons/xmark.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('CurrentDAO', options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/portfolio')
    );
  }
});

// IndexedDB helpers for offline storage
function getPendingRequests() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('offline-requests', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction(['requests'], 'readonly');
      const store = transaction.objectStore('requests');
      const getAll = store.getAll();
      
      getAll.onsuccess = () => resolve(getAll.result);
      getAll.onerror = () => reject(getAll.error);
    };
    
    request.onupgradeneeded = () => {
      const db = request.result;
      db.createObjectStore('requests', { keyPath: 'id' });
    };
  });
}

function removePendingRequest(id) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('offline-requests', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction(['requests'], 'readwrite');
      const store = transaction.objectStore('requests');
      const deleteRequest = store.delete(id);
      
      deleteRequest.onsuccess = () => resolve();
      deleteRequest.onerror = () => reject(deleteRequest.error);
    };
  });
}

// Message handling for cache management
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'CACHE_CLEANUP') {
    event.waitUntil(cleanupCaches());
  }
  
  if (event.data && event.data.type === 'PRELOAD_CACHE') {
    event.waitUntil(preloadCache(event.data.urls));
  }
  
  if (event.data && event.data.type === 'GET_METRICS') {
    event.ports[0].postMessage(performanceMetrics);
  }
});

// Preload cache for critical resources
async function preloadCache(urls) {
  const cache = await caches.open(STATIC_CACHE);
  
  for (const url of urls) {
    try {
      const response = await fetch(url);
      if (response.ok) {
        cache.put(url, response);
      }
    } catch (error) {
      console.warn('Failed to preload:', url);
    }
  }
}

// Intelligent cache cleanup
async function cleanupCaches() {
  const cacheNames = await caches.keys();
  const currentTime = Date.now();
  
  for (const cacheName of cacheNames) {
    const cache = await caches.open(cacheName);
    const requests = await cache.keys();
    
    for (const request of requests) {
      const response = await cache.match(request);
      if (response) {
        const dateHeader = response.headers.get('date');
        if (dateHeader) {
          const responseTime = new Date(dateHeader).getTime();
          // Remove entries older than 30 days for images, 7 days for API
          const maxAge = cacheName.includes('images') ? 30 * 24 * 60 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000;
          if (currentTime - responseTime > maxAge) {
            await cache.delete(request);
          }
        }
      }
    }
  }
}
