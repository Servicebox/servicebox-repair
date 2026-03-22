// src/sw-template.js
const CACHE_NAME = 'servicebox-v1774101153854';
const VAPID_PUBLIC_KEY = 'BLHmiI7sFh2-aNhDN_nuK9wSJUfoJyXkAto7AqQRUQ1LvPcdq1OKiBbpd3ri0dD9Qn185VNtDs_wIa1np7_bUBk';
const API_URL = 'https://servicebox35.ru';

const STATIC_CACHE = 'static-v1';
const DYNAMIC_CACHE = 'dynamic-v1';

const STATIC_ASSETS = [
    '/',
    '/chat',
    '/chat-admin',
    '/offline.html',
    '/icons/icon-192.png',
    '/icons/icon-512.png',
    '/manifest.json',
];

// Install
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
    );
    self.skipWaiting();
});

// Activate
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) =>
            Promise.all(
                keys
                    .filter((k) => k !== CACHE_NAME && k !== STATIC_CACHE && k !== DYNAMIC_CACHE)
                    .map((k) => caches.delete(k))
            )
        ).then(() => self.clients.claim())
    );
});

// Fetch – исправленный
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // API и сокеты – только сеть
    if (url.pathname.startsWith('/api/') || url.pathname.startsWith('/api/socketio')) {
        event.respondWith(fetch(request));
        return;
    }

    // Статика (изображения, стили, скрипты) – cache first
    if (request.destination === 'image' || request.destination === 'style' || request.destination === 'script') {
        event.respondWith(
            caches.match(request).then((cached) =>
                cached ||
                fetch(request).then((res) => {
                    // Кэшируем только GET и успешные ответы (200)
                    if (request.method === 'GET' && res.status === 200) {
                        const copy = res.clone();
                        caches.open(STATIC_CACHE).then((cache) => cache.put(request, copy));
                    }
                    return res;
                })
            )
        );
        return;
    }

    // Динамические страницы – network first, fallback to cache
    event.respondWith(
        fetch(request)
            .then((res) => {
                // Кэшируем только GET-запросы с ответом 200
                if (request.method === 'GET' && res.status === 200) {
                    const copy = res.clone();
                    caches.open(DYNAMIC_CACHE).then((cache) => cache.put(request, copy));
                }
                return res;
            })
            .catch(() => caches.match(request).then((c) => c || caches.match('/offline.html')))
    );
});

// Push – без изменений
self.addEventListener('push', (event) => {
    if (!event.data) return;
    try {
        const payload = event.data.json();
        const { title, body, url, icon, badge, tag } = payload;
        event.waitUntil(
            self.registration.showNotification(title, {
                body: body || '',
                icon: icon || '/icons/icon-192.png',
                badge: badge || '/icons/icon-192.png',
                tag: tag || 'general',
                data: { url: url || '/chat-admin' },
                vibrate: [200, 100, 200],
                actions: [
                    { action: 'open', title: 'Открыть чат' },
                    { action: 'close', title: 'Закрыть' }
                ]
            })
        );
    } catch (err) {
        console.error('❌ Push error:', err);
    }
});

// Notification Click – без изменений
self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    const url = event.notification.data?.url || '/chat-admin';
    if (event.action === 'close') return;
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
            for (const client of windowClients) {
                if (client.url.includes(url) && 'focus' in client) {
                    return client.focus();
                }
            }
            if (clients.openWindow) {
                return clients.openWindow(url);
            }
        })
    );
});

// Background Sync (optional)
self.addEventListener('sync', (event) => {
    if (event.tag === 'sync-messages') {
        event.waitUntil(
            console.log('🔄 Background sync: sync-messages')
        );
    }
});

// Message from client
self.addEventListener('message', (event) => {
    if (event.data?.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});

console.log('✅ Service Worker loaded:', CACHE_NAME);