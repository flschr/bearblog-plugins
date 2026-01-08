# Refactoring Plan: social-comments-simple.js

## 🎯 Analyse & Verbesserungsvorschläge

### 1. **Performance Issues**

#### 1.1 Code-Duplikation in Cache-Funktionen
**Problem:**
- `getCached()`/`setCache()` (Zeile 40-64) vs `getDIDFromCache()`/`cacheDID()` (66-90)
- Fast identischer Code, nur unterschiedliche Storage (sessionStorage vs localStorage)

**Lösung:**
```javascript
// Vereinheitlichte Cache-Funktion mit Storage-Parameter
function getFromCache(key, storage = sessionStorage) {
  try {
    const item = storage.getItem(key);
    if (!item) return null;
    const { data, expires } = JSON.parse(item);
    if (Date.now() > expires) {
      storage.removeItem(key);
      return null;
    }
    return data;
  } catch {
    return null;
  }
}
```

**Impact:** -30 Zeilen, bessere Wartbarkeit

---

#### 1.2 getBoundingClientRect() bei jedem Flying Heart
**Problem:**
- Zeile 392: `btn.getBoundingClientRect()` wird 12.5x/Sekunde aufgerufen
- Unnötig teuer, Button bewegt sich nicht während Hover

**Lösung:**
```javascript
const createHeart = () => {
  // Rect wurde bereits beim ersten Aufruf gecached
  const centerX = cachedRect.left + cachedRect.width / 2;
  // ...
};

const cachedRect = btn.getBoundingClientRect();
heartInterval = setInterval(createHeart, 80);
```

**Impact:** ~90% Performance-Verbesserung für Flying Hearts

---

#### 1.3 Unnötige API-Calls für inaktive Services
**Problem:**
- `findSocialUrls()` wird immer aufgerufen (Zeile 538)
- Auch wenn keine Social-Services aktiv sind

**Lösung:**
```javascript
const needsSocialUrls = activeServices.some(s => ['mastodon', 'bluesky', 'comments'].includes(s));
const urls = needsSocialUrls ? await findSocialUrls() : { bluesky: null, mastodon: null };
```

**Impact:** Vermeidet 1-2 HTTP-Requests wenn nur Mail/Like verwendet wird

---

### 2. **Wartbarkeit**

#### 2.1 Magic Numbers extrahieren
**Problem:**
- Hardcoded Werte verstreut im Code:
  - `50` (viral threshold) - Zeile 326, 377
  - `80` (heart interval ms) - Zeile 416
  - `1500` (heart lifetime) - Zeile 410
  - `640px` (mobile breakpoint) - Zeile 832

**Lösung:**
```javascript
const CONFIG = {
  VIRAL_THRESHOLD: parseInt(scriptTag?.dataset.viralThreshold || '50', 10),
  HEART_INTERVAL_MS: 80,
  HEART_LIFETIME_MS: 1500,
  MOBILE_BREAKPOINT: '640px'
};
```

**Impact:** Leichter konfigurierbar, bessere Lesbarkeit

---

#### 2.2 Repetitiver Button-Code
**Problem:**
- Zeilen 567-617: Viel Copy-Paste für Mastodon/Bluesky/Comments Buttons
- Identische Struktur für Tooltip/AriaLabel-Generierung

**Lösung:**
```javascript
const platformButtons = [
  {
    service: 'mastodon',
    icon: icons.mastodon,
    engagement: mastodonEngagement,
    onClick: () => showMastodonModal(urls.mastodon),
    platformName: 'Mastodon'
  },
  // ...
].filter(p => activeServices.includes(p.service) && urls[p.service]);

platformButtons.forEach(p => {
  const tooltip = p.engagement === null
    ? `${p.platformName} engagement (could not load)`
    : `${p.engagement.likes || 0} likes, ${p.engagement.reposts || 0} reposts, ${p.engagement.replies || 0} replies on ${p.platformName}`;

  buttons.push(createButton(/* ... */));
});
```

**Impact:** -40 Zeilen, DRY-Prinzip

---

#### 2.3 Modal sollte eigene Funktion/Modul sein
**Problem:**
- Zeilen 426-525: 100 Zeilen Modal-Code gemischt mit Hauptlogik
- Schwer zu testen/wiederzuverwenden

**Lösung:**
```javascript
class MastodonModal {
  constructor() { /* ... */ }
  show(postUrl) { /* ... */ }
  close() { /* ... */ }
  static getInstance() { /* ... */ }
}
```

**Impact:** Bessere Separation of Concerns

---

### 3. **Simplizität**

#### 3.1 Ungenutzter Code
**Problem:**
- `icons.heartOutline` (Zeile 32) wird nie verwendet
- `url` property in engagement objects (Zeilen 223, 251) wird nie gelesen

**Lösung:**
```javascript
// Entfernen:
heartOutline: '...',  // Zeile 32
url: url              // Zeilen 223, 251
```

**Impact:** -5 Zeilen, weniger Verwirrung

---

#### 3.2 Inkonsistente Storage-Nutzung
**Problem:**
- `getCached()` → sessionStorage (5 Min TTL)
- `getDIDFromCache()` → localStorage (24h TTL)
- Inkonsistent, könnte verwirren

**Lösung:**
```javascript
// Explizit machen:
const STORAGE = {
  SESSION: sessionStorage,  // Für temporäre Daten (Engagement)
  LOCAL: localStorage       // Für langlebige Daten (DIDs, Preferences)
};
```

**Impact:** Klarer Intent

---

#### 3.3 Überflüssige findSocialUrls-Aufrufe
**Problem:**
- Wird aufgerufen auch wenn kein Social Service aktiv (nur Mail+Like)

**Lösung:**
```javascript
const needsSocial = activeServices.some(s => ['mastodon', 'bluesky', 'comments'].includes(s));
const urls = needsSocial ? await findSocialUrls() : {};
```

**Impact:** Vermeidet unnötige Mapping-Requests

---

### 4. **Missing Features**

#### 4.1 Accessibility: prefers-reduced-motion
**Problem:**
- Flying Hearts/Viral Animations laufen immer
- Verstößt gegen WCAG 2.1 (Animation Guideline)

**Lösung:**
```javascript
// CSS:
@media (prefers-reduced-motion: reduce) {
  .flying-heart,
  .simple-like-button.viral,
  .simple-reaction-button {
    animation: none !important;
  }
}

// JS: Hearts nicht starten wenn reduced-motion
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if (!prefersReducedMotion) {
  cleanupHeartbeat = startHeartbeat(btn);
}
```

**Impact:** WCAG-Konformität, bessere UX für Nutzer mit Bewegungsempfindlichkeit

---

#### 4.2 Dark Mode für Mastodon Modal
**Problem:**
- Modal ist hardcoded hell (Zeile 441)
- Kein Dark Mode Support

**Lösung:**
```javascript
const isDark = document.documentElement.dataset.theme === 'dark';
dialog.style.cssText = `
  background: ${isDark ? '#1e1e1e' : '#fff'};
  color: ${isDark ? '#e0e0e0' : '#333'};
  // ...
`;
```

**Impact:** Konsistente UX in Dark Mode

---

#### 4.3 Konfigurierbare Viral Threshold
**Problem:**
- 50 Likes hardcoded
- Macht für kleine Blogs keinen Sinn

**Lösung:**
```javascript
// data-viral-threshold="10" im Script Tag
const VIRAL_THRESHOLD = parseInt(scriptTag?.dataset.viralThreshold || '50', 10);

if (totalLikes >= VIRAL_THRESHOLD) {
  btn.classList.add('viral');
}
```

**Impact:** Flexible Konfiguration

---

#### 4.4 Fehlende Retry-Logik für API-Calls
**Problem:**
- Single-Try für API-Requests
- Keine Exponential Backoff bei Fehlern

**Lösung:**
```javascript
async function fetchWithRetry(url, options = {}, retries = 2) {
  for (let i = 0; i <= retries; i++) {
    try {
      return await fetchWithTimeout(url, options);
    } catch (err) {
      if (i === retries) throw err;
      await new Promise(r => setTimeout(r, Math.pow(2, i) * 1000));
    }
  }
}
```

**Impact:** Robustheit bei Netzwerkproblemen

---

### 5. **Breaking Changes (sinnvoll)**

#### 5.1 Bessere Default Services
**Problem:**
```javascript
const activeServices = scriptTag?.dataset.services
  ? scriptTag.dataset.services.split(',').map(s => s.trim())
  : ['mastodon', 'bluesky', 'comments']; // Mail fehlt!
```

**Lösung:**
```javascript
: ['mastodon', 'bluesky', 'comments', 'mail']; // Mail inkludiert
```

**Impact:** Intuitiver Default (Breaking: Mail wird jetzt standardmäßig gezeigt)

---

#### 5.2 FETCH_TIMEOUT zu kurz für langsame Verbindungen
**Problem:**
- 8 Sekunden können für 3G/Satellit zu kurz sein

**Lösung:**
```javascript
const FETCH_TIMEOUT = parseInt(scriptTag?.dataset.timeout || '15000', 10);
```

**Impact:** Weniger Timeouts (Breaking: Längeres Warten)

---

#### 5.3 Comments-Button ohne URL sollte fallback haben
**Problem:**
- Comments-Button wird nur gezeigt wenn Social-URLs existieren
- Bei reinem Mail-Setup sinnlos

**Lösung:**
```javascript
// Nur zeigen wenn tatsächlich Comments existieren
if (activeServices.includes('comments') && totalComments > 0) {
  // ...
}
```

**Impact:** Sauberere UI (Breaking: Button verschwindet wenn keine Comments)

---

### 6. **Code-Stil**

#### 6.1 Konsistentere Optional Chaining
**Problem:**
```javascript
const uid = upvoteForm?.querySelector('input[name="uid"]')?.value
  || upvoteForm?.action?.match(/\/upvote\/([^\/]+)/)?.[1];
```

**Lösung:**
```javascript
const uid = upvoteForm?.querySelector('input[name="uid"]')?.value
  ?? upvoteForm?.action?.match(/\/upvote\/([^\/]+)/)?.[1]
  ?? null;
```

**Impact:** Klarer Intent (null coalescing)

---

#### 6.2 Early Returns für bessere Lesbarkeit
**Problem:**
```javascript
async function fetchBearBlog() {
  const uid = /* ... */;

  if (!uid) return null;

  const cacheKey = `bearblog_${uid}`;
  // ... 10 weitere Zeilen
}
```

**Gut so!** Aber mehr davon in init()

---

## 📊 Priorisierung

### **Must Have (Performance/Security)**
1. ✅ **Cache-Duplikation entfernen** (-30 Zeilen)
2. ✅ **getBoundingClientRect cachen** (90% schneller)
3. ✅ **prefers-reduced-motion** (WCAG)
4. ✅ **Ungenutzten Code entfernen**

### **Should Have (Wartbarkeit)**
5. ✅ **Magic Numbers als Konstanten**
6. ✅ **Repetitiven Button-Code reduzieren** (-40 Zeilen)
7. ✅ **Dark Mode für Modal**
8. ✅ **Konfigurierbare viral threshold**

### **Nice to Have (Features)**
9. ⚠️ **Retry-Logik für APIs** (optional, adds complexity)
10. ⚠️ **Modal als Klasse** (optional, größerer Refactor)
11. ⚠️ **Default Services mit Mail** (Breaking Change)

---

## 🚀 Geschätzter Impact

| Verbesserung | LoC Reduzierung | Performance Gain | Breaking? |
|--------------|-----------------|------------------|-----------|
| Cache DRY | -30 | Marginal | ❌ |
| Rect Caching | 0 | 90% (hearts) | ❌ |
| Button DRY | -40 | - | ❌ |
| Remove Unused | -5 | Marginal | ❌ |
| Magic Numbers | +15 | - | ✅ (Konfigurierbar) |
| Reduced Motion | +10 | - | ❌ |
| Dark Modal | +5 | - | ❌ |
| Retry Logic | +20 | Robustheit | ❌ |
| **TOTAL** | **-25 LoC** | **~10% Overall** | **Minimal** |

---

## 🎬 Implementierungs-Reihenfolge

1. Ungenutzten Code entfernen (einfach)
2. Cache-Funktionen vereinheitlichen (mittel)
3. Magic Numbers extrahieren (einfach)
4. getBoundingClientRect cachen (einfach)
5. prefers-reduced-motion (mittel)
6. Dark Mode Modal (mittel)
7. Button-Code DRY (komplex)
8. Optional: Retry-Logik (komplex)

Sollen wir mit der Implementierung starten?
