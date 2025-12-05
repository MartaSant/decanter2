// Google Analytics 4 Consent Management
// Questo file gestisce il consenso per GA4 e carica GA4 solo se l'utente accetta

console.log('ga-consent.js caricato');

const GA_MEASUREMENT_ID = 'G-2KB68FNNQ8';
const CONSENT_KEY = 'ga_consent';

// Verifica se l'utente ha già dato il consenso
function hasAnalyticsConsent() {
    const consent = localStorage.getItem(CONSENT_KEY);
    return consent === 'granted';
}

// Flag per tracciare se GA4 è in fase di caricamento
let ga4Loading = false;
let ga4Ready = false;

// Esponi i flag globalmente per verifiche tra pagine
window.ga4Ready = false;
window.ga4Loading = false;

// Carica Google Analytics 4 solo se il consenso è stato dato
function loadGA4() {
    console.log('loadGA4 chiamato');
    
    // Se GA è già caricato e pronto, esci
    // Controlla sia la variabile locale che quella globale (per pagine diverse)
    if ((ga4Ready || window.ga4Ready) && window.gtag && window.dataLayer && typeof window.gtag === 'function') {
        console.log('GA4 già caricato e pronto');
        ga4Ready = true;
        window.ga4Ready = true;
        return;
    }
    
    // Se GA4 è in fase di caricamento, esci
    if (ga4Loading || window.ga4Loading) {
        console.log('GA4 già in fase di caricamento');
        return;
    }
    
    // Se il consenso non è stato dato, esci
    if (!hasAnalyticsConsent()) {
        console.log('Consenso non dato, GA4 non caricato');
        return;
    }
    
    console.log('Caricamento GA4...');
    ga4Loading = true;
    window.ga4Loading = true;
    
    // Inizializza dataLayer PRIMA di qualsiasi chiamata gtag
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    window.gtag = gtag;
    
    // Imposta Google Consent Mode v2 con tutti i storage negati di default
    // Questo deve essere fatto PRIMA di caricare lo script GA4
    gtag('consent', 'default', {
        'ad_storage': 'denied',
        'analytics_storage': 'denied',
        'ad_user_data': 'denied',
        'ad_personalization': 'denied'
    });
    
    // Carica lo script GA4
    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_MEASUREMENT_ID;
    
    // Inizializza GA4 quando lo script è caricato
    script.onload = function() {
        console.log('Script GA4 caricato, inizializzo...');
        gtag('js', new Date());
        gtag('config', GA_MEASUREMENT_ID, {
            'send_page_view': true  // Assicura che page_view venga inviato
        });
        ga4Loading = false;
        ga4Ready = true;
        window.ga4Loading = false;
        window.ga4Ready = true;
        console.log('GA4 inizializzato e pronto');
        
        // Aggiorna il consenso dopo che GA4 è caricato
        gtag('consent', 'update', {
            'ad_storage': 'granted',
            'analytics_storage': 'granted',
            'ad_user_data': 'granted',
            'ad_personalization': 'granted'
        });
        
        // Forza l'invio di page_view se non è stato ancora inviato automaticamente
        // Questo è importante per le pagine caricate dopo l'accettazione dei cookie
        setTimeout(function() {
            if (window.gtag && typeof window.gtag === 'function') {
                // Invia page_view manualmente per assicurarsi che venga tracciato
                gtag('event', 'page_view', {
                    'page_title': document.title,
                    'page_location': window.location.href,
                    'page_path': window.location.pathname
                });
                console.log('Page view inviato manualmente');
            }
        }, 200);
    };
    
    script.onerror = function() {
        console.error('Errore nel caricamento dello script GA4');
        ga4Loading = false;
        window.ga4Loading = false;
    };
    
    document.head.appendChild(script);
}

// Funzione helper per inviare eventi GA4 (aspetta che GA4 sia pronto)
function sendGA4Event(eventName, eventParams) {
    // Se GA4 è pronto, invia subito
    // Controlla sia la variabile locale che quella globale
    if ((ga4Ready || window.ga4Ready) && window.gtag && typeof window.gtag === 'function') {
        try {
            window.gtag('event', eventName, eventParams);
            if (window.dataLayer) {
                window.dataLayer.push({
                    'event': eventName,
                    ...eventParams
                });
            }
            return true;
        } catch (e) {
            console.error('Errore invio evento GA4:', e);
            return false;
        }
    }
    
    // Se dataLayer esiste ma GA4 non è ancora pronto, salva l'evento
    if (window.dataLayer) {
        try {
            window.dataLayer.push({
                'event': eventName,
                ...eventParams
            });
            
            // Se GA4 è in fase di caricamento, aspetta che sia pronto e reinvia
            if (ga4Loading || window.ga4Loading || hasAnalyticsConsent()) {
                const checkReady = setInterval(function() {
                    if ((ga4Ready || window.ga4Ready) && window.gtag && typeof window.gtag === 'function') {
                        try {
                            window.gtag('event', eventName, eventParams);
                        } catch (e) {
                            console.error('Errore reinvio evento GA4:', e);
                        }
                        clearInterval(checkReady);
                    }
                }, 100);
                
                // Timeout dopo 5 secondi
                setTimeout(function() {
                    clearInterval(checkReady);
                }, 5000);
            }
            return true;
        } catch (e) {
            console.error('Errore salvataggio evento in dataLayer:', e);
            return false;
        }
    }
    
    return false;
}

// Esponi la funzione globalmente per uso in altre pagine
window.sendGA4Event = sendGA4Event;

// Gestisce il banner dei cookie
function initCookieBanner() {
    console.log('initCookieBanner chiamato');
    
    // Aspetta un po' per assicurarsi che il DOM sia completamente caricato
    setTimeout(function() {
        const banner = document.getElementById('cookie-banner');
        const acceptBtn = document.getElementById('cookie-accept');
        const rejectBtn = document.getElementById('cookie-reject');
        
        // Leggi il consenso esistente
        const consent = localStorage.getItem(CONSENT_KEY);
        
        console.log('Cookie Banner Init:', {
            banner: !!banner,
            acceptBtn: !!acceptBtn,
            rejectBtn: !!rejectBtn,
            consent: consent,
            bannerElement: banner
        });
        
        // Se il banner non esiste (es. index.html senza banner), 
        // carica comunque GA4 se il consenso è già stato dato
        if (!banner || !acceptBtn || !rejectBtn) {
            console.log('Banner o pulsanti non trovati, controllo consenso esistente');
            if (consent === 'granted') {
                console.log('Consenso già dato, carico GA4');
                loadGA4();
            }
            return;
        }
        
        // Se il consenso è già stato dato o negato, nascondi il banner
        if (consent === 'granted' || consent === 'denied') {
            console.log('Consenso già presente:', consent);
            banner.style.display = 'none';
            
            // Se il consenso è stato dato, carica GA4
            if (consent === 'granted') {
                console.log('Consenso granted, carico GA4');
                loadGA4();
            }
            return;
        }
        
        // Mostra il banner se non c'è consenso
        console.log('Nessun consenso salvato, mostro il banner');
        banner.style.display = 'block';
        console.log('Banner display impostato a block, valore attuale:', banner.style.display);
        
        // Gestisci click su "Accetta"
        acceptBtn.addEventListener('click', function() {
            console.log('Click su Accetta');
            // Salva il consenso
            localStorage.setItem(CONSENT_KEY, 'granted');
            
            // Carica GA4
            loadGA4();
            
            // Il consenso verrà aggiornato automaticamente quando GA4 è caricato
            // (vedi script.onload in loadGA4())
            
            // Nascondi il banner
            banner.style.display = 'none';
        });
        
        // Gestisci click su "Rifiuta"
        rejectBtn.addEventListener('click', function() {
            console.log('Click su Rifiuta');
            // Salva il rifiuto
            localStorage.setItem(CONSENT_KEY, 'denied');
            
            // Nascondi il banner
            banner.style.display = 'none';
            
            // NON caricare GA4
        });
    }, 100);
}

// Inizializza quando il DOM è pronto
console.log('Stato DOM:', document.readyState);
if (document.readyState === 'loading') {
    console.log('DOM in caricamento, aspetto DOMContentLoaded');
    document.addEventListener('DOMContentLoaded', function() {
        console.log('DOMContentLoaded evento, inizializzo banner');
        initCookieBanner();
    });
} else {
    console.log('DOM già pronto, inizializzo banner immediatamente');
    initCookieBanner();
}

// Ascolta i cambiamenti di localStorage per rilevare quando il consenso viene dato in altre pagine/iframe
// Questo è utile per index.html che contiene un iframe con home.html
window.addEventListener('storage', function(e) {
    if (e.key === CONSENT_KEY && e.newValue === 'granted') {
        // Il consenso è stato dato in un'altra pagina/iframe, carica GA4
        if (!window.gtag || !window.dataLayer || typeof window.gtag !== 'function') {
            loadGA4();
        } else {
            // GA4 è già caricato, aggiorna solo i flag
            ga4Ready = true;
            window.ga4Ready = true;
        }
    }
});

// Per iframe same-origin, l'evento storage potrebbe non funzionare
// Quindi controlliamo periodicamente se il consenso è stato dato
// Questo è importante per index.html che contiene un iframe con home.html
if (document.getElementById('cookie-banner') === null) {
    // Se non c'è banner in questa pagina, controlla periodicamente il consenso
    let lastConsent = localStorage.getItem(CONSENT_KEY);
    const checkConsent = setInterval(function() {
        const currentConsent = localStorage.getItem(CONSENT_KEY);
        // Se il consenso è cambiato da "non dato" a "granted", carica GA4
        if (currentConsent === 'granted' && lastConsent !== 'granted') {
            if (!window.gtag || !window.dataLayer || typeof window.gtag !== 'function') {
                loadGA4();
            } else {
                // GA4 è già caricato, aggiorna solo i flag
                ga4Ready = true;
                window.ga4Ready = true;
            }
            clearInterval(checkConsent);
        }
        lastConsent = currentConsent;
        
        // Se GA4 è già caricato, ferma il controllo
        if (window.gtag && window.dataLayer && typeof window.gtag === 'function') {
            ga4Ready = true;
            window.ga4Ready = true;
            clearInterval(checkConsent);
        }
    }, 300);
    
    // Ferma il controllo dopo 15 secondi (dopo quel tempo, l'utente avrà già accettato o rifiutato)
    setTimeout(function() {
        clearInterval(checkConsent);
    }, 15000);
}

