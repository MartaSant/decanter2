// Service Worker per Decanter Wine & More - Strategia Network First
// Cache name con versione per facilitare aggiornamenti
const CACHE_NAME = 'decanterwinemore-v3';
const RUNTIME_CACHE = 'decanterwinemore-runtime-v3';

// Determina il percorso base dal percorso del Service Worker stesso
// Funziona sia per root (/) che per sottocartelle (/decanter2/)
const getBasePath = () => {
  try {
    // Il percorso del Service Worker stesso (es. /decanter2/service-worker.js)
    const swPath = self.location.pathname;
    // Rimuovi il nome del file e ottieni la directory
    const basePath = swPath.substring(0, swPath.lastIndexOf('/') + 1);
    return basePath || '/';
  } catch (e) {
    // Fallback: assume root se non può determinare
    return '/';
  }
};

// File da mettere in cache all'installazione
// I percorsi vengono risolti relativamente al base path durante l'installazione
const PRECACHE_FILES_RELATIVE = [
  'index.html',
  'home.html',
  'style.css',
  'manifest.json',
  'logo.png',
  'taglieri.html',
  'vini-rossi.html',
  'vini-bianchi.html',
  'bollicine.html',
  'al-calice.html',
  'birre.html',
  'altre-bevande.html',
  'filtro.html',
  'preferiti.html',
  'autore.html',
  'policy.html',
  '404.html'
];

// Installazione: precache dei file principali
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        // Determina il percorso base
        const basePath = getBasePath();
        
        // Costruisci i percorsi completi
        const precacheFiles = [
          basePath, // Root
          ...PRECACHE_FILES_RELATIVE.map(file => basePath + file)
        ];
        
        // Usa addAll con gestione errori - se un file fallisce, continua con gli altri
        return Promise.allSettled(
          precacheFiles.map(url => {
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
    
    // Font Awesome: NON cachare, sempre dalla rete per evitare problemi
    if (url.href.includes('font-awesome') || url.href.includes('fontawesome')) {
      return fetch(event.request).catch(() => {
        // Se la rete fallisce, non servire dalla cache
        return new Response('', { status: 404 });
      });
    }
    
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
        // NON cachare Font Awesome per evitare problemi
        if (response.status === 200 && !event.request.url.includes('font-awesome') && !event.request.url.includes('fontawesome')) {
          caches.open(RUNTIME_CACHE).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        
        return response;
      })
      .catch(() => {
        // Se la rete fallisce, prova la cache
        // MA NON per Font Awesome
        if (event.request.url.includes('font-awesome') || event.request.url.includes('fontawesome')) {
          return fetch(event.request);
        }
        
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

