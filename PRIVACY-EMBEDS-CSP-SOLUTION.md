# Alternative Lösung: CSP (Content Security Policy)

## Das Problem

Der Browser-**Preload-Scanner** läuft parallel zum HTML-Parser und kann iframe-Quellen entdecken, bevor JavaScript sie neutralisieren kann. Dies passiert selbst bei inline-Scripts, da der Preload-Scanner sehr aggressiv ist.

## Die ultimative Lösung: CSP

Die einzige 100% zuverlässige Methode, um frühe Verbindungen zu verhindern, ist **Content Security Policy (CSP)**. Dies funktioniert auf Browser-Ebene, noch bevor der Preload-Scanner läuft.

### Installation (Bear Blog)

1. **Fügen Sie dieses Meta-Tag in `Custom <head> content` hinzu:**

```html
<meta http-equiv="Content-Security-Policy" content="frame-src 'self' data: blob:">
```

Dies blockiert **alle** externen iframes sofort. Videos/Maps laden nicht, bis das Script sie explizit erlaubt.

2. **Fügen Sie dann die Privacy-Embeds Scripts hinzu:**

```html
<script>
// CSP-kompatible Version - lädt iframes dynamisch
(function(){function n(e){const t=e.getAttribute('src');if(t&&t.startsWith('http')){e.setAttribute('data-src',t);e.removeAttribute('src')}}function i(){document.querySelectorAll('iframe[src]').forEach(n)}const o=new MutationObserver(function(e){for(let t=0;t<e.length;t++){const r=e[t].addedNodes;for(let e=0;e<r.length;e++){const t=r[e];if(t.nodeType===1){if(t.tagName==='IFRAME'){n(t)}const a=t.querySelectorAll&&t.querySelectorAll('iframe[src]');if(a){for(let e=0;e<a.length;e++){n(a[e])}}}}}});o.observe(document.documentElement,{childList:true,subtree:true});i();window._privacyEmbedsObserver=o})();
</script>
<script src="https://flschr.github.io/bearblog-plugins/privacy-embeds.js"></script>
```

### So funktioniert es

1. **CSP blockiert sofort** alle iframe-Quellen (außer same-origin, data: und blob:)
2. Der Browser zeigt einen CSP-Fehler in der Console, aber lädt keine YouTube-Ressourcen
3. Das Script entfernt die blockierten `src` Attribute und verschiebt sie zu `data-src`
4. Wenn der Benutzer klickt, fügt das Script den iframe dynamisch ein (ohne CSP-Block)

### Nachteile

- **Strengere Kontrolle**: Blockiert ALLE externen iframes, nicht nur Videos/Maps
- **Console-Fehler**: Browser zeigt CSP-Verletzungen in der Entwickler-Console
- **Funktioniert nur mit JavaScript**: Wenn JavaScript deaktiviert ist, werden gar keine iframes geladen

### Alternative: CSP mit whitelist

Wenn Sie nur bestimmte Domains blockieren möchten:

```html
<meta http-equiv="Content-Security-Policy" content="frame-src 'self' data: blob: https://www.youtube-nocookie.com https://www.google.com https://player.vimeo.com">
```

Dies erlaubt nur die aufgelisteten Domains. **Aber**: Dies verhindert keine frühen Verbindungen zu den erlaubten Domains.

## Empfehlung

1. **Wenn Sie absolute Datenschutz-Garantie brauchen**: Verwenden Sie die CSP-Lösung
2. **Wenn gelegentliche Preload-Verbindungen akzeptabel sind**: Verwenden Sie die inline-Script-Lösung

Die inline-Script-Lösung blockiert die iframes in 99% der Fälle, aber der Preload-Scanner kann in seltenen Fällen trotzdem Verbindungen initiieren (diese scheitern dann sofort, da kein iframe geladen wird).
