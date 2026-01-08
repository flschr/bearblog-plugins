# Bear Blog Plugins

A collection of plugins to enhance [Bear Blog](https://bearblog.dev/). Used on [fischr.org](https://fischr.org/).

## Available Plugins

### Markdown Toolbar
Adds a formatting toolbar to the Bear Blog post editor with buttons for bold, italic, links, lists, code blocks, and more. Includes optional AI-powered alt-text generation for images via OpenAI API.

**Installation** (Dashboard → Settings → Custom dashboard):
```html
<script src="https://flschr.github.io/bearblog-plugins/markdown-toolbar.js"></script>
```

#### AI Alt-Text Feature (Optional)

- The toolbar includes an **optional** AI-powered alt-text generator for images using OpenAI's Vision API.
- Your OpenAI API key is stored in your browser's localStorage. Do not use this on shared computers and set spending limits in your OpenAI account settings](https://platform.openai.com/settings/organization/limits).

#### How the AI Integration Works

The AI integration uses the [OpenAI Vision API](https://platform.openai.com/docs/guides/images-vision) (specifically the **gpt-4o-mini** model) to analyze images. It is designed to be fast, privacy-conscious, and extremely cheap.

* **Smart privacy**: Only the URL of the selected image is sent to OpenAI when you actively click the button. No data is sent in the background.
* **Minimal costs**: Generating an alt-text costs approximately **$0.0012**. You can describe nearly 1,000 images for about $1.00.
* **No subscription**: You use your own OpenAI API key and only pay for what you actually use.

---

### LEGACY: Markdown Toolbar (Basic)
Lightweight toolbar for the Bear Blog post editor with core formatting buttons only. Useful if you want a minimal toolbar without AI features or additional UI. This toolbar is not maintaned any more.

**Installation** (Dashboard → Settings → Custom dashboard):
```html
<script src="https://flschr.github.io/bearblog-plugins/markdown-toolbar_basic.js"></script>
```

---

### Blog Search
Adds a client-side search functionality to your blog with a floating search button. Features instant search results, keyword highlighting, and automatic infinite scroll on the `/blog` page for easy browsing.

**Installation** (Custom footer content):
```html
<script src="https://flschr.github.io/bearblog-plugins/search.js" defer></script>
```

---

### Theme Switcher
Implements a dark/light mode toggle that remembers the user's preference in localStorage. The theme is applied instantly to prevent flash of unstyled content.

**Installation** (requires element with `id="theme-toggle"` in your theme):
```html
<!-- Add to Custom <head> content -->
<script src="https://flschr.github.io/bearblog-plugins/theme-switch-head.js"></script>

<!-- Add to Custom footer content -->
<script src="https://flschr.github.io/bearblog-plugins/theme-switch-footer.js" defer></script>
```

---

### Privacy Embeds
Replaces external iframes (YouTube, Google Maps, Vimeo, Dailymotion, Spotify, SoundCloud, Arte) with privacy-friendly consent placeholders. Videos and maps only load after user consent, preventing tracking before interaction.

**Standard Installation** (Custom <head> content):
```html
<script>
(function(){function n(e){const t=e.getAttribute('src');t&&t.startsWith('http')&&!e.hasAttribute('data-src')&&(e.setAttribute('data-src',t),e.removeAttribute('src'))}function i(){document.querySelectorAll('iframe[src]').forEach(n)}const o=new MutationObserver(function(e){for(let t=0;t<e.length;t++){const r=e[t].addedNodes;for(let e=0;e<r.length;e++){const t=r[e];if(t.nodeType===1){if(t.tagName==='IFRAME'){n(t)}const a=t.querySelectorAll&&t.querySelectorAll('iframe[src]');if(a){for(let e=0;e<a.length;e++){n(a[e])}}}}}});o.observe(document.documentElement,{childList:true,subtree:true});i();window._privacyEmbedsObserver=o})();
</script>
<script src="https://flschr.github.io/bearblog-plugins/privacy-embeds.js"></script>
```

**Perfect Privacy Installation** (100% guarantee via CSP):
```html
<meta http-equiv="Content-Security-Policy" content="frame-src 'self' data: blob:">
<script>
(function(){function n(e){const t=e.getAttribute('src');t&&t.startsWith('http')&&!e.hasAttribute('data-src')&&(e.setAttribute('data-src',t),e.removeAttribute('src'))}function i(){document.querySelectorAll('iframe[src]').forEach(n)}const o=new MutationObserver(function(e){for(let t=0;t<e.length;t++){const r=e[t].addedNodes;for(let e=0;e<r.length;e++){const t=r[e];if(t.nodeType===1){if(t.tagName==='IFRAME'){n(t)}const a=t.querySelectorAll&&t.querySelectorAll('iframe[src]');if(a){for(let e=0;e<a.length;e++){n(a[e])}}}}}});o.observe(document.documentElement,{childList:true,subtree:true});i();window._privacyEmbedsObserver=o})();
</script>
<script src="https://flschr.github.io/bearblog-plugins/privacy-embeds.js"></script>
```

The CSP meta tag blocks all external iframe connections at browser level, preventing even the preload scanner from initiating connections before user consent. Console warnings are normal and indicate successful blocking.

---

### Image Lazy Loading
Automatically adds native `loading="lazy"` attribute to all images in your blog posts. Images load only when they're about to enter the viewport, improving page load performance and reducing bandwidth usage.

**Installation** (Custom footer content):
```html
<script src="https://flschr.github.io/bearblog-plugins/lazy-load.js" defer></script>
```

---

### Custom Date Formatting
Replaces default date formats throughout your blog with customizable formatting. Comes with German month names by default, but can be adapted to any language or format by editing the `format_string` variable in the script.

**Installation** (Custom footer content):
```html
<script src="https://flschr.github.io/bearblog-plugins/date.js" defer></script>
```

---

### Social Comments (Simple)
Unified engagement plugin displaying social reactions and blog webmentions. Shows live counts from Bluesky and Mastodon with an animated like button. Includes support for displaying traditional blog webmentions collected via webmention.io.

**Installation** (Custom footer content):
```html
<script src="https://flschr.github.io/bearblog-plugins/social-comments-simple.js"
        data-email="your@email.com"
        data-like
        defer></script>
```

**Configuration options**:
- `data-email` - Your email for reply functionality
- `data-mastodon` - Your Mastodon handle (e.g., "@user@instance.social")
- `data-mappings-url` - URL to mappings.json (default: flschr/bearblog-automation)
- `data-like` - Show like button (omit to hide)
- `data-services` - Active services, comma-separated (default: "mastodon,bluesky,mail")
  - Available: `mastodon`, `bluesky`, `mail`, `webmentions`

**Webmentions configuration** (add to enable blog mentions):
- `data-services` - Add `webmentions` to the services list
- `data-webmentions-repo` - GitHub repository (default: "flschr/bearblog-automation")
- `data-webmentions-show-excerpt` - Show content excerpt (default: "true", set to "false" to hide)
- `data-webmentions-max-mentions` - Maximum mentions to show initially (default: 0 = show all)
- `data-webmentions-lang` - Language for UI text: "en" or "de" (default: "en")

**Example with webmentions enabled**:
```html
<script src="https://flschr.github.io/bearblog-plugins/social-comments-simple.js"
        data-email="your@email.com"
        data-like
        data-services="mastodon,bluesky,mail,webmentions"
        data-webmentions-repo="flschr/bearblog-automation"
        data-webmentions-show-excerpt="true"
        defer></script>
```

**Features**:
- Live engagement counts from Bluesky and Mastodon
- Animated like button with viral effects
- Blog webmentions display with cards
- Dark mode support
- Mobile responsive
- Session caching (5 minutes)
- Graceful error handling

---

## License

[WTFPL](https://www.wtfpl.net/) – Do what you want.
