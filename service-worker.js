// Service Worker per Decanter Wine & More - Strategia Network First
// Cache name con versione per facilitare aggiornamenti
const CACHE_NAME = 'decanterwinemore-v2';
const RUNTIME_CACHE = 'decanterwinemore-runtime-v2';

// File da mettere in cache all'installazione
const PRECACHE_FILES = [
  '/',
  '/index.html',
  '/home.html',
  '/style.css',
  '/manifest.json',
  '/logo.png',
  '/taglieri.html',
  '/vini-rossi.html',
  '/vini-bianchi.html',
  '/bollicine.html',
  '/al-calice.html',
  '/birre.html',
  '/altre-bevande.html',
  '/filtro.html',
  '/preferiti.html',
  '/autore.html',
  '/policy.html',
  '/404.html'
];

// Installazione: precache dei file principali
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        // Usa addAll con gestione errori - se un file fallisce, continua con gli altri
        return Promise.allSettled(
          PRECACHE_FILES.map(url => {
            return fetch(url, { cache: 'reload' })
              .then(response => {
                if (response.ok) {
                  return cache.put(url, response);
                } else {
                  return Promise.resolve(); // Continua anche se il file non esiste
                }
              })
              .catch(() => {
                return Promise.resolve(); // Continua anche se c'è un errore
              });
          })
        );
      })
      .then(() => {
        return self.skipWaiting(); // Attiva immediatamente il nuovo service worker
      })
      .catch(() => {
        // Anche in caso di errore, attiva il service worker
        return self.skipWaiting();
      })
  );
});

// Attivazione: pulizia cache vecchie
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim()) // Prendi controllo di tutte le pagine
  );
});

// Fetch: STRATEGIA NETWORK FIRST
self.addEventListener('fetch', (event) => {
  // Ignora richieste non GET
  if (event.request.method !== 'GET') {
    return;
  }

  // Ignora richieste a domini esterni (CDN, API, ecc.)
  try {
    const url = new URL(event.request.url);
    const origin = self.location ? self.location.origin : url.origin;
    
    if (url.origin !== origin && 
        !url.href.includes('fonts.googleapis.com') &&
        !url.href.includes('fonts.gstatic.com') &&
        !url.href.includes('cdnjs.cloudflare.com')) {
      return;
    }
  } catch (e) {
    // Se c'è un errore nel parsing dell'URL, ignora la richiesta
    return;
  }

  event.respondWith(
    // Prova prima la rete
    fetch(event.request)
      .then((response) => {
        // Se la rete funziona, clona e salva in cache
        const responseToCache = response.clone();
        
        // Salva solo risposte valide (status 200)
        if (response.status === 200) {
          caches.open(RUNTIME_CACHE).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        
        return response;
      })
      .catch(() => {
        // Se la rete fallisce, prova la cache
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          
          // Se non c'è in cache, prova con la cache di precache
          return caches.match(event.request.url);
        });
      })
  );
});

