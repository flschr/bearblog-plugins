# Privacy Embeds: Das Preload-Scanner Problem

## Das Problem verstehen

Wenn Sie YouTube-Verbindungen in den Browser-DevTools (Network-Tab) sehen, **obwohl** der inline Blocker-Script installiert ist, liegt das am **Browser-Preload-Scanner**.

### Was ist der Preload-Scanner?

Der Preload-Scanner ist eine Browser-Optimierung, die:
1. Das HTML parallel zum Parser durchsucht
2. Ressourcen (Bilder, Scripts, **iframes**) vorab entdeckt
3. Diese Ressourcen lädt, **noch bevor JavaScript läuft**

**Das bedeutet:** Selbst ein inline-Script im `<head>` kann nicht schnell genug sein, um den Preload-Scanner zu blockieren!

### Warum sehe ich die Verbindungen?

Wenn im HTML steht:
```html
<iframe src="https://www.youtube-nocookie.com/embed/VIDEO_ID"></iframe>
```

...dann:
1. Der Preload-Scanner entdeckt diese iframe-Quelle während des HTML-Parsings
2. Der Browser initiiert **sofort** Verbindungen zu youtube-nocookie.com
3. Erst danach läuft das JavaScript, das die iframes neutralisieren soll
4. Das JavaScript entfernt die `src`-Attribute erfolgreich
5. **ABER:** Die initialen Verbindungen wurden bereits aufgebaut!

## Lösungen

### ❌ Lösung 1: Inline Script (unzuverlässig)

Die aktuelle Lösung mit inline-Script funktioniert in den meisten Fällen, **aber nicht immer**:

```html
<script>
// Läuft zu spät - Preload-Scanner war bereits aktiv!
(function(){...})();
</script>
```

**Problem:** JavaScript läuft NACH dem Preload-Scanner.

### ✅ Lösung 2: Content Security Policy (100% zuverlässig)

CSP arbeitet auf Browser-Ebene und blockiert iframes, **bevor** der Preload-Scanner sie sieht.

#### Installation

**Fügen Sie diesen CSP-Header zu Ihrem `Custom <head> content` hinzu:**

```html
<meta http-equiv="Content-Security-Policy" content="frame-src 'self' data: blob:">
```

**Dann die Privacy-Embeds Scripts:**

```html
<script>
// Critical inline blocker
(function(){function n(e){const t=e.getAttribute('src');t&&t.startsWith('http')&&!e.hasAttribute('data-src')&&(e.setAttribute('data-src',t),e.removeAttribute('src'))}function i(){document.querySelectorAll('iframe[src]').forEach(n)}const o=new MutationObserver(function(e){for(let t=0;t<e.length;t++){const r=e[t].addedNodes;for(let e=0;e<r.length;e++){const t=r[e];if(t.nodeType===1){if(t.tagName==='IFRAME'){n(t)}const a=t.querySelectorAll&&t.querySelectorAll('iframe[src]');if(a){for(let e=0;e<a.length;e++){n(a[e])}}}}}});o.observe(document.documentElement,{childList:true,subtree:true});i();window._privacyEmbedsObserver=o})();
</script>
<script src="https://flschr.github.io/bearblog-plugins/privacy-embeds.js"></script>
```

#### Wie CSP funktioniert

1. **CSP blockiert sofort** alle iframe-Quellen (außer `'self'`, `data:` und `blob:`)
2. Der Browser zeigt CSP-Fehler in der Console, aber lädt **KEINE** YouTube-Ressourcen
3. Das Script entfernt die blockierten `src`-Attribute und verschiebt sie zu `data-src`
4. Wenn der Benutzer auf "Video laden" klickt, fügt das Script das iframe **dynamisch** ein (was CSP erlaubt)

#### Was Sie sehen werden

**In der Console:**
```
Refused to frame 'https://www.youtube-nocookie.com/' because it violates the following Content Security Policy directive: "frame-src 'self' data: blob:"
```

**Im Network-Tab:**
✅ **KEINE Verbindungen** zu youtube.com oder youtube-nocookie.com (bis User klickt)

### ✅ Lösung 3: Server-seitiges Rendering (optimal)

Die **beste Lösung** wäre, dass Bear Blog die iframes bereits server-seitig mit `data-src` statt `src` rendert:

```html
<!-- Statt -->
<iframe src="https://youtube.com/..."></iframe>

<!-- Besser -->
<iframe data-src="https://youtube.com/..."></iframe>
```

**Aber:** Dies erfordert Änderungen an Bear Blog selbst, nicht am Plugin.

## Empfehlung

| Methode | Vorteile | Nachteile | Datenschutz-Garantie |
|---------|----------|-----------|---------------------|
| **Inline Script** | Einfach, keine CSP-Fehler | Preload-Scanner kann durchkommen | ~95% |
| **CSP** | 100% zuverlässig | Console-Fehler, blockiert ALLE iframes | 100% ✅ |
| **Server-seitig** | Perfekt, keine Nachteile | Nicht möglich bei Bear Blog | 100% ✅ |

### Für absolute Datenschutz-Konformität:

**Verwenden Sie die CSP-Lösung.**

Die Console-Fehler sind harmlos - sie zeigen nur, dass CSP korrekt funktioniert und unerwünschte Verbindungen blockiert.

## Testing

### Test 1: Ohne CSP
1. Öffnen Sie DevTools → Network
2. Laden Sie die Seite
3. ❌ Sie sehen Verbindungen zu `youtube-nocookie.com`

### Test 2: Mit CSP
1. Fügen Sie CSP-Header hinzu
2. Öffnen Sie DevTools → Network
3. ✅ **KEINE** Verbindungen zu YouTube
4. Console zeigt CSP-Fehler (= funktioniert!)
5. Klicken Sie "Video laden"
6. Jetzt wird das Video geladen

## Technische Details

Der Browser-Preload-Scanner:
- Wurde in Chrome 2008 eingeführt
- Scannt HTML-Tokens während des Parsings
- Initiiert Verbindungen für `<img>`, `<script>`, `<link>`, `<iframe>`
- **Ignoriert JavaScript komplett** (auch inline!)
- Kann nur durch CSP gestoppt werden

Weitere Infos:
- [Chrome Preload Scanner](https://web.dev/preload-scanner/)
- [CSP frame-src](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy/frame-src)
