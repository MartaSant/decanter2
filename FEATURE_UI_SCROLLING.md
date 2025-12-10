# Feature: UI a Comprarsa durante lo Scroll

## Panoramica

Questa feature implementa un sistema di nascondimento automatico degli elementi UI fissi durante lo scroll della pagina. Gli elementi vengono nascosti quando l'utente scrolla e riappaiono automaticamente quando lo scroll si ferma, migliorando l'esperienza utente riducendo l'ostruzione visiva durante la navigazione.

## Elementi Coinvolti

La feature gestisce tre elementi UI fissi presenti su tutte le pagine:

1. **Bottom Bar** (`.bottom-bar`)
   - Barra fissa in basso con pulsanti per contatti (WhatsApp, Instagram, Chiama)
   - Posizionata al centro della pagina, in basso

2. **Scroll to Top Button** (`.scroll-top`)
   - Bottone per tornare all'inizio della pagina
   - Posizionato in basso a destra

3. **Cookie Settings Button** (`.cookie-settings-btn`)
   - Bottone per gestire le impostazioni dei cookie
   - Posizionato in basso a sinistra

## Comportamento

### Durante lo Scroll
- Quando l'utente inizia a scrollare, tutti e tre gli elementi UI vengono nascosti immediatamente
- Gli elementi scompaiono con una transizione CSS fluida (opacity + transform)

### Dopo lo Scroll
- Quando l'utente smette di scrollare, gli elementi riappaiono dopo un delay di **300ms**
- Il delay previene il "lampeggiamento" degli elementi durante scroll brevi

### Gestione Touch (Mobile)
- Quando l'utente tocca lo schermo (touchstart), gli elementi vengono nascosti
- Gli elementi rimangono nascosti finché l'utente tiene il dito sullo schermo
- Quando l'utente solleva il dito (touchend), parte il timer di 300ms per la ricomparsa

### Protezione Click
- Se l'utente tocca direttamente uno degli elementi UI, questi **non vengono nascosti**
- Questo garantisce che gli elementi rimangano cliccabili quando l'utente interagisce con essi
- La verifica avviene controllando se il target del touch è l'elemento stesso o un suo figlio

## Implementazione CSS

### Classe `.scrolling`

Quando un elemento ha la classe `.scrolling`, viene applicato il seguente stile:

```css
/* Bottom Bar */
.bottom-bar.scrolling {
    opacity: 0;
    visibility: hidden;
    transform: translateX(-50%) translateY(20px);
    pointer-events: none;
}

/* Scroll Top Button */
.scroll-top.scrolling {
    opacity: 0 !important;
    visibility: hidden !important;
    transform: translateY(20px);
    pointer-events: none !important;
}

/* Cookie Settings Button */
.cookie-settings-btn.scrolling {
    opacity: 0 !important;
    visibility: hidden !important;
    transform: translateY(20px);
    pointer-events: none !important;
}
```

### Transizioni

Tutti gli elementi hanno transizioni CSS per animazioni fluide:

```css
transition: opacity 0.3s ease, transform 0.3s ease, visibility 0.3s ease;
```

## Implementazione JavaScript

### Struttura Base

Il codice JavaScript è implementato in tutte le pagine HTML che contengono gli elementi UI. La logica è racchiusa in una IIFE (Immediately Invoked Function Expression) per evitare conflitti con altre variabili globali.

### Variabili di Stato

```javascript
let scrollTimeout;      // Timer per il delay di ricomparsa
let isScrolling = false; // Flag per tracciare se gli elementi sono nascosti
let isTouching = false;  // Flag per tracciare se l'utente sta toccando lo schermo
```

### Funzione `isUIElement(target)`

Verifica se il target di un evento è uno degli elementi UI o un loro figlio:

```javascript
function isUIElement(target) {
    if (!target) return false;
    return target === bottomBar || 
           target === scrollTopBtn || 
           target === cookieSettingsBtn ||
           (bottomBar && bottomBar.contains(target)) ||
           (scrollTopBtn && scrollTopBtn.contains(target)) ||
           (cookieSettingsBtn && cookieSettingsBtn.contains(target));
}
```

**Scopo**: Prevenire il nascondimento quando l'utente interagisce direttamente con gli elementi UI.

### Funzione `hideUI()`

Nasconde tutti gli elementi UI aggiungendo la classe `.scrolling`:

```javascript
function hideUI() {
    if (!isScrolling) {
        isScrolling = true;
        if (bottomBar) bottomBar.classList.add('scrolling');
        if (scrollTopBtn) scrollTopBtn.classList.add('scrolling');
        if (cookieSettingsBtn) cookieSettingsBtn.classList.add('scrolling');
    }
}
```

**Nota**: Il controllo `if (!isScrolling)` evita aggiunte multiple della classe.

### Funzione `showUI()`

Mostra gli elementi UI rimuovendo la classe `.scrolling` dopo un delay:

```javascript
function showUI() {
    clearTimeout(scrollTimeout);
    
    scrollTimeout = setTimeout(function() {
        if (!isTouching) {
            isScrolling = false;
            if (bottomBar) bottomBar.classList.remove('scrolling');
            if (scrollTopBtn) scrollTopBtn.classList.remove('scrolling');
            if (cookieSettingsBtn) cookieSettingsBtn.classList.remove('scrolling');
        }
    }, 300); // 300ms di inattività
}
```

**Logica**:
1. Cancella eventuali timeout precedenti per resettare il timer
2. Imposta un nuovo timeout di 300ms
3. Verifica che l'utente non stia ancora toccando lo schermo (`!isTouching`)
4. Rimuove la classe `.scrolling` da tutti gli elementi

### Event Listeners

#### Scroll Event

```javascript
window.addEventListener('scroll', handleScroll, { passive: true });
```

**Comportamento**:
- Chiama `hideUI()` per nascondere gli elementi
- Chiama `showUI()` per avviare il timer di ricomparsa

**Nota**: `{ passive: true }` migliora le performance permettendo al browser di ottimizzare lo scroll.

#### Touch Events

```javascript
window.addEventListener('touchstart', function(e) {
    // Non nascondere se l'utente sta toccando uno degli elementi UI
    if (isUIElement(e.target)) {
        return;
    }
    isTouching = true;
    hideUI();
}, { passive: true });

window.addEventListener('touchend', function() {
    isTouching = false;
    showUI();
}, { passive: true });
```

**Logica Touch**:
1. **touchstart**: 
   - Verifica se il target è un elemento UI (se sì, esce senza nascondere)
   - Imposta `isTouching = true`
   - Nasconde gli elementi UI
2. **touchend**:
   - Imposta `isTouching = false`
   - Avvia il timer di ricomparsa chiamando `showUI()`

## Flusso di Esecuzione

### Scenario 1: Scroll con Mouse/Trackpad

1. Utente inizia a scrollare → evento `scroll` viene triggerato
2. `handleScroll()` viene chiamato
3. `hideUI()` aggiunge la classe `.scrolling` → elementi scompaiono
4. `showUI()` cancella timeout precedente e ne crea uno nuovo (300ms)
5. Se l'utente continua a scrollare, il timeout viene continuamente resettato
6. Quando lo scroll si ferma per 300ms, il timeout scade
7. Gli elementi riappaiono rimuovendo la classe `.scrolling`

### Scenario 2: Scroll con Touch (Mobile)

1. Utente tocca lo schermo → evento `touchstart` viene triggerato
2. Se il target è un elemento UI → esce (elementi rimangono visibili)
3. Altrimenti, `isTouching = true` e `hideUI()` → elementi scompaiono
4. Utente scrolla → evento `scroll` viene triggerato
5. `handleScroll()` mantiene gli elementi nascosti e resetta il timer
6. Utente solleva il dito → evento `touchend` viene triggerato
7. `isTouching = false` e `showUI()` → timer di 300ms parte
8. Dopo 300ms, gli elementi riappaiono

### Scenario 3: Click su Elemento UI

1. Utente tocca un elemento UI → evento `touchstart` viene triggerato
2. `isUIElement(e.target)` ritorna `true`
3. La funzione esce immediatamente con `return`
4. Gli elementi UI **non vengono nascosti**
5. L'utente può cliccare normalmente sull'elemento

## File Modificati

La feature è implementata in tutte le seguenti pagine HTML:

- `home.html`
- `filtro.html`
- `vini-rossi.html`
- `vini-bianchi.html`
- `birre.html`
- `bollicine.html`
- `taglieri.html`
- `cocktails.html`
- `altre-bevande.html`
- `al-calice.html`
- `preferiti.html`
- `autore.html`
- `policy.html`
- `404.html`

### CSS

Gli stili CSS sono definiti in `style.css`:

- `.bottom-bar.scrolling` (linea ~627)
- `.scroll-top.scrolling` (linea ~1045)
- `.cookie-settings-btn.scrolling` (linea ~1081)

## Parametri Configurabili

### Delay di Ricomparsa

Il delay di ricomparsa è attualmente impostato a **300ms** (0.3 secondi).

**Posizione**: Nella funzione `showUI()`, parametro del `setTimeout()`.

**Come modificare**: Cercare `300` nel codice JavaScript e sostituire con il valore desiderato (in millisecondi).

**Esempio**:
```javascript
}, 300); // Cambiare questo valore per modificare il delay
```

### Durata Transizioni CSS

Le transizioni CSS hanno una durata di **0.3s** (300ms).

**Posizione**: Nella proprietà `transition` degli elementi UI in `style.css`.

**Come modificare**: Modificare il valore `0.3s` nella proprietà `transition`.

## Considerazioni Tecniche

### Performance

- Utilizzo di `{ passive: true }` negli event listeners per migliorare le performance dello scroll
- Debouncing del timer per evitare troppi aggiornamenti DOM
- Controllo `if (!isScrolling)` per evitare aggiunte multiple della classe CSS

### Compatibilità

- Funziona su tutti i browser moderni che supportano:
  - `classList` API
  - `addEventListener`
  - CSS transitions
  - Touch events (mobile)

### Accessibilità

- Gli elementi mantengono la loro funzionalità anche quando nascosti (per screen reader)
- `pointer-events: none` previene interazioni accidentali quando gli elementi sono nascosti
- La visibilità viene ripristinata rapidamente per garantire accessibilità

## Troubleshooting

### Problema: Gli elementi non si nascondono durante lo scroll

**Possibili cause**:
1. Gli elementi non hanno la classe CSS corretta
2. Il JavaScript non è stato caricato correttamente
3. Gli elementi non esistono nel DOM quando lo script viene eseguito

**Soluzione**: Verificare che:
- Gli elementi esistano nel DOM
- Il JavaScript sia incluso dopo gli elementi nel HTML
- Non ci siano errori JavaScript nella console

### Problema: Gli elementi non riappaiono

**Possibili cause**:
1. Il timeout viene continuamente resettato (utente scrolla continuamente)
2. `isTouching` rimane `true` (evento touchend non viene triggerato)

**Soluzione**: Verificare che:
- L'utente abbia smesso di scrollare per almeno 300ms
- Su mobile, l'utente abbia sollevato il dito dallo schermo

### Problema: Gli elementi scompaiono quando si clicca su di essi

**Possibili cause**:
1. La funzione `isUIElement()` non riconosce correttamente il target
2. Il target dell'evento è un elemento figlio non previsto

**Soluzione**: Verificare che:
- La funzione `isUIElement()` controlli correttamente anche gli elementi figli
- Il target dell'evento sia effettivamente uno degli elementi UI o un loro discendente

## Versioni

- **v1.0** (Iniziale): Implementazione base con delay di 150ms
- **v1.1**: Aumentato delay a 500ms e aggiunta gestione touch
- **v1.2**: Fix per impedire nascondimento quando si clicca sugli elementi UI
- **v1.3** (Attuale): Ridotto delay a 300ms

## Autore

Feature implementata come parte del progetto Decanter2.

## Data

Ultima modifica: 2024

