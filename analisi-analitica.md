# 📊 Analisi Completa dell'Analitica GA4 - Decanter Wine & More

## ✅ COSA FA LA TUA ANALITICA

### 🔹 **Eventi Standard GA4 (Automatici)**
Questi eventi vengono tracciati automaticamente da GA4 su tutte le pagine:

1. **`page_view`**
   - Traccia ogni visualizzazione di pagina
   - Include automaticamente: URL, titolo pagina, referrer
   - **Dove**: Tutte le pagine HTML

2. **`session_start`**
   - Traccia l'inizio di una nuova sessione
   - **Dove**: Automatico su tutte le pagine

3. **`user_engagement`**
   - Traccia il tempo di coinvolgimento dell'utente
   - Include `engagement_time_msec` (tempo in millisecondi)
   - **Dove**: Automatico su tutte le pagine

4. **`scroll`**
   - Traccia lo scroll della pagina
   - Include `percent_scrolled` (percentuale di scroll)
   - **Dove**: Automatico su tutte le pagine

---

### 🔹 **Eventi Custom Implementati**

#### 1. **`product_details_view`** 📦
- **Cosa traccia**: Apertura del banner con i dettagli di un vino
- **Parametri**:
  - `product_name`: Nome del vino (es. "Falanghina IGP Campania 13%")
  - `product_type`: Tono del vino (es. "bianco", "rosso")
  - `product_region`: Regione (es. "campania", "piemonte")
  - `product_price`: Prezzo (es. "18,00")
- **Dove**: `filtro.html` (quando si clicca su un vino per vedere i dettagli)

#### 2. **`favorite_added`** ❤️
- **Cosa traccia**: Aggiunta di un vino ai preferiti (click sul cuore)
- **Parametri**:
  - `product_name`: Nome del vino
  - `product_type`: Tono del vino
  - `product_region`: Regione
  - `product_price`: Prezzo
- **Dove**: `filtro.html`, `preferiti.html`

#### 3. **`favorite_removed`** 💔
- **Cosa traccia**: Rimozione di un vino dai preferiti
- **Parametri**:
  - `product_name`: Nome del vino
  - `product_type`: Tono del vino
  - `product_region`: Regione
  - `product_price`: Prezzo
- **Dove**: `filtro.html`, `preferiti.html`

#### 4. **`social_click`** 📱
- **Cosa traccia**: Click sui bottoni social (WhatsApp, Instagram, Telefono, Mappe)
- **Parametri**:
  - `button_name`: Nome del bottone (es. "WhatsApp", "Instagram", "Telefono", "Mappe")
  - `button_type`: Tipo di bottone (es. "social", "contact")
- **Dove**: Tutte le pagine HTML (home, filtro, preferiti, vini-rossi, vini-bianchi, bollicine, birre, taglieri, al-calice, altre-bevande, cocktails, 404, policy, autore)

#### 5. **`search`** 🔍
- **Cosa traccia**: Ricerca di vini con risultati
- **Parametri**:
  - `search_term`: Termine cercato
  - `search_results`: Numero di risultati trovati
  - `search_type`: Tipo di ricerca (sempre "wine_search")
- **Dove**: `filtro.html`

#### 6. **`search_no_results`** 🔍❌
- **Cosa traccia**: Ricerca di vini senza risultati
- **Parametri**:
  - `search_term`: Termine cercato
  - `search_type`: Tipo di ricerca (sempre "wine_search")
- **Dove**: `filtro.html`
- **Nota**: Le ricerche senza risultati vengono anche salvate in una sezione UI dedicata

#### 7. **`filter_click`** 🎛️
- **Cosa traccia**: Click sui filtri (tono, regione)
- **Parametri**:
  - `filter_type`: Tipo di filtro (es. "tono", "regione")
  - `filter_category`: Categoria del filtro (es. "bianco", "campania")
  - `filter_action`: Azione ("activated" o "deactivated")
- **Dove**: `filtro.html`

#### 8. **`scroll_to_top_click`** ⬆️
- **Cosa traccia**: Click sul bottone "Scroll to Top"
- **Parametri**:
  - `button_name`: Nome del bottone (sempre "scroll_to_top")
  - `page_location`: URL della pagina corrente
- **Dove**: Tutte le pagine HTML (eccetto `index.html`)

#### 9. **`home_link_click`** 🏠
- **Cosa traccia**: Click sul link/bottone "Torna a Home"
- **Parametri**:
  - `button_name`: Nome del bottone (sempre "home_link")
  - `page_location`: URL della pagina corrente
- **Dove**: Tutte le pagine HTML (eccetto `index.html` e `home.html`)

---

### 🔹 **Gestione Consenso Cookie**

- **Banner Cookie**: Implementato con Google Consent Mode v2
- **Consenso salvato in**: `localStorage` (chiave: `ga_consent`)
- **Valori possibili**: `'granted'` o `'denied'`
- **Dove**: `home.html` (banner visibile), `ga-consent.js` (logica)
- **Comportamento**:
  - GA4 viene caricato SOLO se l'utente accetta
  - Se l'utente rifiuta, GA4 non viene caricato
  - Il consenso persiste tra le sessioni
  - Supporta comunicazione tra iframe (index.html ↔ home.html)

---

### 🔹 **Pagine con Tracking**

Tutte le seguenti pagine hanno il tracking GA4 (se il consenso è stato dato):
- ✅ `index.html` (carica GA4 se consenso dato in iframe)
- ✅ `home.html` (banner cookie)
- ✅ `filtro.html` (più eventi custom)
- ✅ `preferiti.html`
- ✅ `vini-rossi.html`
- ✅ `vini-bianchi.html`
- ✅ `bollicine.html`
- ✅ `birre.html`
- ✅ `taglieri.html`
- ✅ `al-calice.html`
- ✅ `altre-bevande.html`
- ✅ `cocktails.html`
- ✅ `404.html`
- ✅ `policy.html`
- ✅ `autore.html`

---

## ❌ COSA NON FA LA TUA ANALITICA

### 🔴 **Custom Dimensions**
- **Stato**: ❌ Non implementate
- **Cosa manca**: Dimensioni personalizzate per segmentare meglio i dati
- **Esempi utili**:
  - Tipo di utente (nuovo vs. ritornante)
  - Categoria di vino più visualizzata
  - Regione più popolare
  - Fonte di traffico personalizzata

### 🔴 **Conversioni**
- **Stato**: ❌ Non configurate
- **Cosa manca**: Eventi marcati come "conversioni" in GA4
- **Eventi candidati a conversioni**:
  - `favorite_added` (interesse per un prodotto)
  - `product_details_view` (interesse per un prodotto)
  - `social_click` con `button_type: "contact"` (contatto diretto)

### 🔴 **Enhanced E-commerce**
- **Stato**: ❌ Non implementato
- **Cosa manca**: Tracking completo del customer journey
- **Eventi mancanti**:
  - `view_item_list` (visualizzazione lista vini)
  - `add_to_cart` (se avessi un carrello)
  - `begin_checkout` (se avessi un checkout)
  - `purchase` (se avessi vendite online)

### 🔴 **Eventi per Navigazione**
- **Stato**: ❌ Non implementati
- **Cosa manca**: Tracking dei click sulle card di navigazione
- **Esempi**:
  - Click su "Taglieri" card
  - Click su "Vini Rossi" card
  - Click su "Vini Bianchi" card
  - Click su "Bollicine" card
  - Click su "Birre" card
  - Click su "Al Calice" card
  - Click su "Cocktails" card
  - Click su "Altre Bevande" card

### 🔴 **Eventi per Errori**
- **Stato**: ❌ Non implementati
- **Cosa manca**: Tracking degli errori
- **Esempi**:
  - `exception` (errori JavaScript)
  - `404_error` (pagina non trovata - hai la pagina 404.html ma non traccia l'accesso)

### 🔴 **Eventi per Performance**
- **Stato**: ❌ Non implementati
- **Cosa manca**: Metriche di performance
- **Esempi**:
  - Tempo di caricamento pagina
  - Tempo di caricamento immagini
  - Errori di caricamento risorse

### 🔴 **Eventi per Condivisioni Social**
- **Stato**: ❌ Non implementati
- **Cosa manca**: Tracking delle condivisioni
- **Esempi**:
  - Condivisione su WhatsApp
  - Condivisione su Facebook
  - Condivisione su Twitter
  - Copia link

### 🔴 **Funnel di Conversione**
- **Stato**: ❌ Non configurato
- **Cosa manca**: Percorso utente definito
- **Esempio funnel**:
  1. `page_view` (home)
  2. `navigation_click` (click su "Vini")
  3. `product_details_view` (visualizza dettagli)
  4. `favorite_added` (aggiunge ai preferiti)
  5. `social_click` (contatta)

### 🔴 **Cross-Domain Tracking**
- **Stato**: ❌ Non configurato
- **Cosa manca**: Se hai più domini, non traccia gli utenti tra di essi

### 🔴 **User Properties**
- **Stato**: ❌ Non implementati
- **Cosa manca**: Proprietà utente personalizzate
- **Esempi**:
  - `user_type`: "wine_lover", "casual_browser"
  - `preferred_wine_type`: "rosso", "bianco"
  - `favorite_count`: numero di preferiti salvati

### 🔴 **Eventi per Tempo di Permanenza**
- **Stato**: ⚠️ Parzialmente implementato
- **Cosa c'è**: `user_engagement` (automatico di GA4)
- **Cosa manca**: Eventi custom per tempo di permanenza su sezioni specifiche
  - Tempo su pagina `filtro.html`
  - Tempo su pagina `preferiti.html`
  - Tempo su dettagli prodotto

### 🔴 **Eventi per Scroll Avanzato**
- **Stato**: ⚠️ Parzialmente implementato
- **Cosa c'è**: `scroll` automatico con `percent_scrolled`
- **Cosa manca**: Eventi custom per milestone di scroll
  - Scroll al 25%, 50%, 75%, 100%
  - Scroll fino alla sezione filtri
  - Scroll fino alla lista vini

### 🔴 **Eventi per Interazioni Video/Audio**
- **Stato**: ❌ Non implementati
- **Cosa manca**: Se aggiungi video o audio, non vengono tracciati

### 🔴 **Eventi per Download**
- **Stato**: ❌ Non implementati
- **Cosa manca**: Se aggiungi PDF o file scaricabili, non vengono tracciati

---

## 📈 **Metriche Disponibili in GA4**

Con la tua implementazione attuale, puoi vedere in GA4:

### **Metriche Standard**
- ✅ Visualizzazioni di pagina
- ✅ Sessioni
- ✅ Utenti (nuovi vs. ritornanti)
- ✅ Durata media sessione
- ✅ Rimbalzo (bounce rate)
- ✅ Pagine per sessione
- ✅ Percentuale di scroll
- ✅ Tempo di coinvolgimento

### **Metriche Custom (dai tuoi eventi)**
- ✅ Numero di visualizzazioni dettagli prodotto
- ✅ Vini più visualizzati (da `product_details_view`)
- ✅ Vini più aggiunti ai preferiti (da `favorite_added`)
- ✅ Vini più rimossi dai preferiti (da `favorite_removed`)
- ✅ Termini di ricerca più usati (da `search` e `search_no_results`)
- ✅ Filtri più usati (da `filter_click`)
- ✅ Bottoni social più cliccati (da `social_click`)
- ✅ Pagine da cui si clicca "Scroll to Top" (da `scroll_to_top_click`)
- ✅ Pagine da cui si torna a Home (da `home_link_click`)

---

## 🎯 **Raccomandazioni per Migliorare**

### **Priorità Alta**
1. ✅ **Aggiungere Custom Dimensions** (vedi `guidacustomdim.txt`)
2. ✅ **Configurare Conversioni** (vedi `guidaconversioni.txt`)
3. ✅ **Tracciare click su card di navigazione** (home.html)

### **Priorità Media**
4. ⚠️ **Tracciare errori 404** (404.html)
5. ⚠️ **Tracciare milestone di scroll** (tutte le pagine)
6. ⚠️ **Aggiungere User Properties** (per segmentazione avanzata)

### **Priorità Bassa**
7. 📋 **Enhanced E-commerce** (se aggiungi vendite online)
8. 📋 **Eventi per condivisioni social** (se aggiungi bottoni share)
9. 📋 **Eventi per performance** (se vuoi monitorare velocità)

---

## 📝 **Note Tecniche**

- **Measurement ID**: `G-2KB68FNNQ8`
- **Consent Mode**: v2 (implementato)
- **Caricamento**: Dinamico solo con consenso
- **Storage**: `localStorage` per consenso
- **Fallback**: Doppio invio eventi (`gtag` + `dataLayer.push`)

---

**Data Analisi**: Gennaio 2025
**Versione GA4**: Ultima implementazione con Google Consent Mode v2

