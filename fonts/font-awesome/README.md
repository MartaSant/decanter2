# Font Awesome - Fallback Locale

Questa cartella contiene Font Awesome come fallback locale nel caso il CDN non sia disponibile.

## 📥 Come Scaricare Font Awesome

### Opzione 1: Download da Font Awesome (Consigliato)
1. Vai su: https://fontawesome.com/download
2. Clicca su "Download Free" (versione gratuita)
3. Inserisci la tua email e scarica
4. Estrai il file ZIP
5. Copia la cartella `css` e `webfonts` dalla cartella estratta qui:
   ```
   fonts/font-awesome/css/
   fonts/font-awesome/webfonts/
   ```

### Opzione 2: Download da CDN (Alternativa)
1. Vai su: https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/
2. Scarica `css/all.min.css`
3. Scarica anche i file nella cartella `webfonts/`
4. Metti tutto qui:
   ```
   fonts/font-awesome/css/all.min.css
   fonts/font-awesome/webfonts/
   ```

## 📁 Struttura Finale

Dopo il download, dovresti avere:
```
fonts/
  font-awesome/
    css/
      all.min.css
    webfonts/
      fa-brands-400.woff2
      fa-brands-400.woff
      fa-regular-400.woff2
      fa-regular-400.woff
      fa-solid-900.woff2
      fa-solid-900.woff
      (e altri file .woff/.woff2)
    README.md (questo file)
```

## ⚠️ Nota

- **Versione attuale usata**: Font Awesome 6.5.0
- **Dimensione approssimativa**: ~2-3 MB (con tutti i file)
- **Aggiornamento**: Non necessario se il CDN funziona. Aggiorna solo se:
  - Il CDN fallisce spesso
  - Vuoi essere completamente indipendente dal CDN
  - Ogni 6-12 mesi per sicurezza

## ✅ Verifica

Dopo aver scaricato i file, verifica che:
1. Il file `css/all.min.css` esista
2. La cartella `webfonts/` contenga i file .woff2
3. Il fallback funzioni disconnettendo internet e ricaricando la pagina

