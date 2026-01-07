# Bear Blog Plugins

A collection of plugins to enhance [Bear Blog](https://bearblog.dev/). Used on [fischr.org](https://fischr.org/).

## Available Plugins

### Markdown Toolbar
Adds a toolbar to the post editor with formatting buttons and optional AI-powered alt-text generation.

**Installation** (Dashboard → Settings → Custom dashboard Javascript):
```html
<script src="https://flschr.github.io/bearblog-plugins/markdown-toolbar.js"></script>
```

---

### Blog Search
Client-side search with floating search button and infinite scroll for `/blog` page.

**Installation** (Custom footer content):
```html
<script src="https://flschr.github.io/bearblog-plugins/search.js" defer></script>
```

---

### Theme Switcher
Dark/light mode toggle that saves user preference.

**Installation** (requires element with `id="theme-toggle"` in your theme):
```html
<!-- Add to Custom <head> content -->
<script src="https://flschr.github.io/bearblog-plugins/theme-switch-head.js"></script>

<!-- Add to Custom footer content -->
<script src="https://flschr.github.io/bearblog-plugins/theme-switch-footer.js" defer></script>
```

---

### Privacy Embeds
Replaces iframes (YouTube, Maps, etc.) with privacy-friendly consent placeholders. Supports YouTube, Google Maps, Vimeo, Dailymotion, Spotify, SoundCloud, Arte.

**Installation** (Custom <head> content):
```html
<script>
(function(){function n(e){const t=e.getAttribute('src');t&&t.startsWith('http')&&!e.hasAttribute('data-src')&&(e.setAttribute('data-src',t),e.removeAttribute('src'))}function i(){document.querySelectorAll('iframe[src]').forEach(n)}const o=new MutationObserver(function(e){for(let t=0;t<e.length;t++){const r=e[t].addedNodes;for(let e=0;e<r.length;e++){const t=r[e];if(t.nodeType===1){if(t.tagName==='IFRAME'){n(t)}const a=t.querySelectorAll&&t.querySelectorAll('iframe[src]');if(a){for(let e=0;e<a.length;e++){n(a[e])}}}}}});o.observe(document.documentElement,{childList:true,subtree:true});i();window._privacyEmbedsObserver=o})();
</script>
<script src="https://flschr.github.io/bearblog-plugins/privacy-embeds.js"></script>
```

**Note**: Due to browser preload scanner, early connections may still occur. For 100% privacy guarantee, see [PRIVACY-EMBEDS-PRELOAD-SCANNER.md](PRIVACY-EMBEDS-PRELOAD-SCANNER.md).

---

### Image Lazy Loading
Automatically adds `loading="lazy"` to all images in main content.

**Installation** (Custom footer content):
```html
<script src="https://flschr.github.io/bearblog-plugins/lazy-load.js" defer></script>
```

---

### Custom Date Formatting
Customizable date format with German month names. Edit `format_string` variable in script to customize.

**Installation** (Custom footer content):
```html
<script src="https://flschr.github.io/bearblog-plugins/date.js" defer></script>
```

---

### Reply and Like
Reply buttons (Mail/Mastodon) with optional styled like button. Mastodon replies can be threaded under original toot.

**Installation** (Custom footer content):
```html
<script src="https://flschr.github.io/bearblog-plugins/reply-and-like.js"
        data-email="your@email.com"
        data-mastodon="@yourhandle@instance.social"
        data-like
        defer></script>
```

---

### Social Comments
Social engagement buttons showing live reaction counts from Bluesky and Mastodon.

**Installation** (Custom footer content):
```html
<script src="https://flschr.github.io/bearblog-plugins/social-comments.js"
        data-email="your@email.com"
        data-like
        defer></script>
```

---

### Webmention Reactions
Displays aggregated webmentions (likes, reposts, comments, mentions) from Webmention.io and Brid.gy.

**Installation** (Custom footer content):
```html
<script src="https://flschr.github.io/bearblog-plugins/webmention-reactions.js" defer></script>
```

**Setup required**: See [webmention.io](https://webmention.io/) and [brid.gy](https://brid.gy/) setup guides.

---

## License

[WTFPL](https://www.wtfpl.net/) – Do what you want.
