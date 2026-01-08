# Bear Blog Plugins

A collection of plugins to enhance [Bear Blog](https://bearblog.dev/). Used on [fischr.org](https://fischr.org/).

## Available Plugins

### Markdown Toolbar
Adds a formatting toolbar to the Bear Blog post editor with buttons for bold, italic, links, lists, code blocks, and more. Includes optional AI-powered alt-text generation for images via OpenAI API.

**Installation** (Dashboard → Settings → Custom dashboard):
```html
<script src="https://flschr.github.io/bearblog-plugins/markdown-toolbar.js"></script>
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

### Reply and Like
Adds reply buttons for email and Mastodon at the end of each post, with an optional animated like button. Mastodon replies can be threaded directly under your original toot, making it easy for readers to join the conversation.

**Installation** (Custom footer content):
```html
<script src="https://flschr.github.io/bearblog-plugins/reply-and-like.js"
        data-email="your@email.com"
        data-mastodon="@yourhandle@instance.social"
        data-like
        defer></script>
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
- `data-services` - Active services, comma-separated (default: "mastodon,bluesky,comments,mail")
  - Available: `mastodon`, `bluesky`, `comments`, `mail`, `webmentions`

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
        data-services="mastodon,bluesky,comments,mail,webmentions"
        data-webmentions-repo="flschr/bearblog-automation"
        data-webmentions-show-excerpt="true"
        data-webmentions-max-mentions="5"
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

### Social Comments (Classic)
Original social comments plugin with modal interactions and detailed engagement metrics.

**Installation** (Custom footer content):
```html
<script src="https://flschr.github.io/bearblog-plugins/social-comments.js"
        data-email="your@email.com"
        data-like
        defer></script>
```

---

### Webmention Reactions
Displays aggregated webmentions from across the web, including likes, reposts, comments, and mentions. Integrates with Webmention.io and Brid.gy to collect reactions from various social platforms and websites that support the Webmention standard.

**Installation** (Custom footer content):
```html
<script src="https://flschr.github.io/bearblog-plugins/webmention-reactions.js" defer></script>
```

**Setup required**: Configure [webmention.io](https://webmention.io/) and [brid.gy](https://brid.gy/) to collect webmentions for your domain.

---

## License

[WTFPL](https://www.wtfpl.net/) – Do what you want.
