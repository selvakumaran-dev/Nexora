// Nexora Service Worker v2.0
// Enhanced with better caching strategies and offline support

const CACHE_VERSION = 'v2.1';
const STATIC_CACHE = `nexora-static-${CACHE_VERSION}`;
const DYNAMIC_CACHE = `nexora-dynamic-${CACHE_VERSION}`;
const API_CACHE = `nexora-api-${CACHE_VERSION}`;
const IMAGE_CACHE = `nexora-images-${CACHE_VERSION}`;

// Static assets to cache immediately
const STATIC_ASSETS = [
    '/',
    '/offline.html',
    '/icon.svg',
    '/icon-192.png',
    '/icon-512.png',
    '/icon-144.png',
    '/manifest.json'
];

// URLs that should always be fetched from network
const NETWORK_ONLY = [
    '/api/',
    '/socket.io/',
    'localhost:5000'
];

// =========================================
// INSTALL - Cache static assets
// =========================================
self.addEventListener('install', (event) => {
    console.log('[SW] Installing Service Worker v' + CACHE_VERSION);

    event.waitUntil(
        caches.open(STATIC_CACHE)
            .then((cache) => {
                console.log('[SW] Caching static assets');
                return cache.addAll(STATIC_ASSETS);
            })
            .then(() => self.skipWaiting())
            .catch((error) => {
                console.error('[SW] Install failed:', error);
            })
    );
});

// =========================================
// ACTIVATE - Clean old caches
// =========================================
self.addEventListener('activate', (event) => {
    console.log('[SW] Activating Service Worker v' + CACHE_VERSION);

    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames
                        .filter((name) => {
                            return name.startsWith('nexora-') &&
                                !name.includes(CACHE_VERSION);
                        })
                        .map((name) => {
                            console.log('[SW] Deleting old cache:', name);
                            return caches.delete(name);
                        })
                );
            })
            .then(() => self.clients.claim())
    );
});

// =========================================
// FETCH - Smart caching strategies
// =========================================
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Skip non-GET requests
    if (request.method !== 'GET') {
        return;
    }

    // Network only for API calls and WebSocket
    if (NETWORK_ONLY.some(pattern => request.url.includes(pattern))) {
        event.respondWith(networkOnly(request));
        return;
    }

    // Cache-first for static assets
    if (isStaticAsset(request.url)) {
        event.respondWith(cacheFirst(request, STATIC_CACHE));
        return;
    }

    // Cache-first for images
    if (isImage(request.url)) {
        event.respondWith(cacheFirst(request, IMAGE_CACHE));
        return;
    }

    // Network-first for navigation (HTML pages) to ensure fresh content
    if (request.mode === 'navigate') {
        event.respondWith(networkFirst(request, DYNAMIC_CACHE));
        return;
    }

    // Network-first with cache fallback for everything else
    event.respondWith(networkFirst(request, DYNAMIC_CACHE));
});

// =========================================
// CACHING STRATEGIES
// =========================================

// Network only - no caching
async function networkOnly(request) {
    try {
        return await fetch(request);
    } catch (error) {
        console.error('[SW] Network request failed:', error);
        throw error;
    }
}

// Cache first - check cache, fallback to network
async function cacheFirst(request, cacheName) {
    const cachedResponse = await caches.match(request);

    if (cachedResponse) {
        return cachedResponse;
    }

    try {
        const networkResponse = await fetch(request);

        if (networkResponse.ok) {
            const cache = await caches.open(cacheName);
            cache.put(request, networkResponse.clone());
        }

        return networkResponse;
    } catch (error) {
        console.error('[SW] Cache-first failed:', error);
        return new Response('Offline', { status: 503 });
    }
}

// Network first - try network, fallback to cache
async function networkFirst(request, cacheName) {
    try {
        const networkResponse = await fetch(request);

        if (networkResponse.ok) {
            const cache = await caches.open(cacheName);
            cache.put(request, networkResponse.clone());
        }

        return networkResponse;
    } catch (error) {
        const cachedResponse = await caches.match(request);

        if (cachedResponse) {
            return cachedResponse;
        }

        // Return offline page for navigation requests
        if (request.mode === 'navigate') {
            return caches.match('/offline.html');
        }

        return new Response('Offline', { status: 503 });
    }
}

// Stale while revalidate - return cache immediately, update in background
async function staleWhileRevalidate(request, cacheName) {
    const cache = await caches.open(cacheName);
    const cachedResponse = await cache.match(request);

    // Fetch in background to update cache
    const fetchPromise = fetch(request)
        .then((networkResponse) => {
            if (networkResponse.ok) {
                cache.put(request, networkResponse.clone());
            }
            return networkResponse;
        })
        .catch(() => {
            // Network failed, but we might have cache
            return cachedResponse;
        });

    // Return cached version immediately, or wait for network
    if (cachedResponse) {
        return cachedResponse;
    }

    try {
        return await fetchPromise;
    } catch (error) {
        return caches.match('/offline.html');
    }
}

// =========================================
// HELPERS
// =========================================

function isStaticAsset(url) {
    return url.includes('/static/') ||
        url.endsWith('.js') ||
        url.endsWith('.css') ||
        url.endsWith('.woff2') ||
        url.endsWith('.woff');
}

function isImage(url) {
    return url.endsWith('.png') ||
        url.endsWith('.jpg') ||
        url.endsWith('.jpeg') ||
        url.endsWith('.gif') ||
        url.endsWith('.svg') ||
        url.endsWith('.webp') ||
        url.endsWith('.ico');
}

// =========================================
// PUSH NOTIFICATIONS
// =========================================

self.addEventListener('push', (event) => {
    let data = {
        title: 'Nexora',
        body: 'You have a new notification',
        icon: '/icon-192.png',
        badge: '/icon-192.png',
        data: {}
    };

    if (event.data) {
        try {
            const payload = event.data.json();
            data = { ...data, ...payload };
        } catch (e) {
            data.body = event.data.text();
        }
    }

    const options = {
        body: data.body,
        icon: data.icon || '/icon-192.png',
        badge: '/icon-192.png',
        vibrate: [100, 50, 100],
        data: data.data,
        tag: data.tag || 'nexora-notification',
        renotify: true,
        requireInteraction: data.requireInteraction || false,
        actions: data.actions || [
            { action: 'open', title: 'Open Nexora' },
            { action: 'dismiss', title: 'Dismiss' }
        ]
    };

    event.waitUntil(
        self.registration.showNotification(data.title, options)
    );
});

// =========================================
// NOTIFICATION CLICK
// =========================================

self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    const action = event.action;
    const data = event.notification.data || {};

    if (action === 'dismiss') {
        return;
    }

    const urlToOpen = data.url || '/dashboard';

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true })
            .then((windowClients) => {
                // Check if app is already open
                for (const client of windowClients) {
                    if (client.url.includes(self.location.origin) && 'focus' in client) {
                        client.navigate(urlToOpen);
                        return client.focus();
                    }
                }
                // Open new window
                return clients.openWindow(urlToOpen);
            })
    );
});

// =========================================
// BACKGROUND SYNC
// =========================================

self.addEventListener('sync', (event) => {
    console.log('[SW] Background sync:', event.tag);

    if (event.tag === 'sync-messages') {
        event.waitUntil(syncOfflineMessages());
    }

    if (event.tag === 'sync-data') {
        event.waitUntil(syncOfflineData());
    }
});

async function syncOfflineMessages() {
    try {
        const cache = await caches.open('nexora-offline-messages');
        const requests = await cache.keys();

        for (const request of requests) {
            const response = await cache.match(request);
            const data = await response.json();

            try {
                await fetch('/api/messages', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });
                await cache.delete(request);
                console.log('[SW] Message synced successfully');
            } catch (error) {
                console.error('[SW] Failed to sync message:', error);
            }
        }
    } catch (error) {
        console.error('[SW] Sync messages failed:', error);
    }
}

async function syncOfflineData() {
    // Sync any offline data when back online
    console.log('[SW] Syncing offline data...');
}

// =========================================
// PERIODIC BACKGROUND SYNC (if supported)
// =========================================

self.addEventListener('periodicsync', (event) => {
    if (event.tag === 'fetch-updates') {
        event.waitUntil(fetchUpdates());
    }
});

async function fetchUpdates() {
    // Periodically fetch updates when app is in background
    console.log('[SW] Fetching periodic updates...');
}

// =========================================
// MESSAGE HANDLING
// =========================================

self.addEventListener('message', (event) => {
    if (event.data === 'skipWaiting') {
        self.skipWaiting();
    }

    if (event.data.type === 'CACHE_URLS') {
        caches.open(DYNAMIC_CACHE)
            .then((cache) => cache.addAll(event.data.urls));
    }
});

console.log('[SW] Service Worker script loaded ' + CACHE_VERSION);
