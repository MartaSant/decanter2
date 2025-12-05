// Google Analytics 4 Consent Management
// Questo file gestisce il consenso per GA4 e carica GA4 solo se l'utente accetta

const GA_MEASUREMENT_ID = 'G-2KB68FNNQ8';
const CONSENT_KEY = 'ga_consent';

// Verifica se l'utente ha già dato il consenso
function hasAnalyticsConsent() {
    const consent = localStorage.getItem(CONSENT_KEY);
    return consent === 'granted';
}

// Carica Google Analytics 4 solo se il consenso è stato dato
function loadGA4() {
    console.log('loadGA4 chiamato');
    
    // Se GA è già caricato, esci
    if (window.gtag && window.dataLayer) {
        console.log('GA4 già caricato');
        return;
    }
    
    // Se il consenso non è stato dato, esci
    if (!hasAnalyticsConsent()) {
        console.log('Consenso non dato, GA4 non caricato');
        return;
    }
    
    console.log('Caricamento GA4...');
    
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
        gtag('config', GA_MEASUREMENT_ID);
        console.log('GA4 inizializzato');
    };
    
    script.onerror = function() {
        console.error('Errore nel caricamento dello script GA4');
    };
    
    document.head.appendChild(script);
}

// Gestisce il banner dei cookie
function initCookieBanner() {
    const banner = document.getElementById('cookie-banner');
    const acceptBtn = document.getElementById('cookie-accept');
    const rejectBtn = document.getElementById('cookie-reject');
    
    // Leggi il consenso esistente
    const consent = localStorage.getItem(CONSENT_KEY);
    
    console.log('Cookie Banner Init:', {
        banner: !!banner,
        acceptBtn: !!acceptBtn,
        rejectBtn: !!rejectBtn,
        consent: consent
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
    
    // Gestisci click su "Accetta"
    acceptBtn.addEventListener('click', function() {
        // Salva il consenso
        localStorage.setItem(CONSENT_KEY, 'granted');
        
        // Carica GA4
        loadGA4();
        
        // Aggiorna il consenso (funziona sia se gtag è già caricato che se si caricherà dopo)
        // Se gtag è già disponibile, aggiorna immediatamente
        if (window.gtag && typeof window.gtag === 'function') {
            window.gtag('consent', 'update', {
                'ad_storage': 'granted',
                'analytics_storage': 'granted',
                'ad_user_data': 'granted',
                'ad_personalization': 'granted'
            });
        } else {
            // Se gtag non è ancora disponibile, aspetta che si carichi
            // e poi aggiorna il consenso
            const checkGtag = setInterval(function() {
                if (window.gtag && typeof window.gtag === 'function') {
                    window.gtag('consent', 'update', {
                        'ad_storage': 'granted',
                        'analytics_storage': 'granted',
                        'ad_user_data': 'granted',
                        'ad_personalization': 'granted'
                    });
                    clearInterval(checkGtag);
                }
            }, 100);
            
            // Timeout di sicurezza dopo 5 secondi
            setTimeout(function() {
                clearInterval(checkGtag);
            }, 5000);
        }
        
        // Nascondi il banner
        banner.style.display = 'none';
    });
    
    // Gestisci click su "Rifiuta"
    rejectBtn.addEventListener('click', function() {
        // Salva il rifiuto
        localStorage.setItem(CONSENT_KEY, 'denied');
        
        // Nascondi il banner
        banner.style.display = 'none';
        
        // NON caricare GA4
    });
}

// Inizializza quando il DOM è pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCookieBanner);
} else {
    initCookieBanner();
}

// Ascolta i cambiamenti di localStorage per rilevare quando il consenso viene dato in altre pagine/iframe
// Questo è utile per index.html che contiene un iframe con home.html
window.addEventListener('storage', function(e) {
    if (e.key === CONSENT_KEY && e.newValue === 'granted') {
        // Il consenso è stato dato in un'altra pagina/iframe, carica GA4
        if (!window.gtag || !window.dataLayer) {
            loadGA4();
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
            if (!window.gtag || !window.dataLayer) {
                loadGA4();
            }
            clearInterval(checkConsent);
        }
        lastConsent = currentConsent;
        
        // Se GA4 è già caricato, ferma il controllo
        if (window.gtag && window.dataLayer) {
            clearInterval(checkConsent);
        }
    }, 300);
    
    // Ferma il controllo dopo 15 secondi (dopo quel tempo, l'utente avrà già accettato o rifiutato)
    setTimeout(function() {
        clearInterval(checkConsent);
    }, 15000);
}

