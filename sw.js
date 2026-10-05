const CACHE_NAME = 'powerlifting-pwa-v2';

const ASSETS = [
    './',
    './index.html',
    './manifest.json',
    './css/styles.css',
    './js/app.js',
    './data/ejercicios.json',
    './icons/icon.svg'
];

// 1. INSTALACIÓN: Precargar recursos esenciales y tomar control inmediato
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                return cache.addAll(ASSETS);
            })
            .then(() => {
                return self.skipWaiting();
            })
    );
});

// 2. ACTIVACIÓN: Purgar versiones antiguas de la caché y tomar control de clientes
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((name) => {
                        if (name !== CACHE_NAME) {
                            return caches.delete(name);
                        }
                    })
                );
            })
            .then(() => {
                return self.clients.claim();
            })
    );
});

// 3. FETCH: Estrategia Network-First con fallback a Caché (100% Offline)
// Permite actualizar código al instante cuando hay red y funcionar sin conexión en sótanos/gimnasios
self.addEventListener('fetch', (event) => {
    if (event.request.method !== 'GET') return;

    event.respondWith(
        fetch(event.request)
            .then((networkResponse) => {
                // Si la respuesta de red es válida y de nuestro origen, refrescar caché
                if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
                    const responseClone = networkResponse.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, responseClone);
                    });
                }
                return networkResponse;
            })
            .catch(() => {
                // Sin conexión a red: responder desde caché
                return caches.match(event.request).then((cachedResponse) => {
                    if (cachedResponse) {
                        return cachedResponse;
                    }
                    // Si es navegación a la SPA, responder con index.html precacheado
                    if (event.request.mode === 'navigate') {
                        return caches.match('./index.html');
                    }
                });
            })
    );
});
