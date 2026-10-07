const CACHE_NAME = 'powerlifting-pwa-v1.3.0';

const ASSETS = [
    './',
    './index.html',
    './manifest.json',
    './css/styles.css',
    './js/app.js',
    './data/ejercicios.json',
    './icons/icon.svg'
];

// 1. INSTALACIÓN: Precargar recursos y activar inmediatamente sin esperar
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => cache.addAll(ASSETS))
            .then(() => self.skipWaiting())
    );
});

// 2. ACTIVACIÓN: Purgar cachés antiguas y tomar control inmediato de clientes abiertos
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((name) => {
                    if (name !== CACHE_NAME) {
                        return caches.delete(name);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

// 3. FETCH: Estrategia Network-First, falling back to Cache
// - Intenta siempre obtener la última versión desde la red (GitHub Pages)
// - Si hay respuesta válida, actualiza la caché dinámicamente y la devuelve
// - Si está offline (sin cobertura en el gimnasio), devuelve el recurso de la caché
self.addEventListener('fetch', (event) => {
    // Solo interceptar peticiones GET
    if (event.request.method !== 'GET') return;

    event.respondWith(
        fetch(event.request)
            .then((networkResponse) => {
                // Si la respuesta de red es válida (200), actualizar la caché dinámicamente
                if (networkResponse && networkResponse.status === 200) {
                    const responseClone = networkResponse.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, responseClone);
                    });
                }
                return networkResponse;
            })
            .catch(() => {
                // Sin conexión (offline en el gimnasio): responder desde la caché
                return caches.match(event.request).then((cachedResponse) => {
                    if (cachedResponse) {
                        return cachedResponse;
                    }
                    // Fallback de navegación para la SPA
                    if (event.request.mode === 'navigate') {
                        return caches.match('./index.html');
                    }
                });
            })
    );
});
