# Bear Blog Plugins

A collection of plugins to enhance the [Bear Blog](https://bearblog.dev/) reader and writer experience. I mainly use them for my own purposes on [my personal website](https://fischr.org/). But of course, you can use them too. To install a plugin, you need to add it to your header, footer or dashboard configuration. Just follow the instructions below.

## Plugin Overview

- **[Markdown Toolbar](#markdown-toolbar)** – Powerful Markdown editor toolbar with some smart functions buttons
- **[Blog Search & Infinite Scroll](#blog-search--infinite-scroll)** – Client-side search with real-time highlighting and infinite scroll
- **[Theme Switcher](#theme-switcher)** – Dark/light mode toggle that remembers user preference
- **[Privacy Embeds](#privacy-embeds)** – GDPR-friendly consent placeholders for external content (YouTube, Maps, etc.)
- **[Image Lazy Loading](#image-lazy-loading)** – Automatic lazy loading for all images
- **[Custom Date Formatting](#custom-date-formatting)** – Customizable date format with German month names
- **[Reply and Like](#reply-and-like)** – Adds customizable reply buttons (Mail/Mastodon) and optional styled like button
- **[Social Comments](#social-comments)** – Social engagement buttons with live Bluesky/Mastodon reaction counts
- **[Webmention Reactions](#webmention-reactions)** – Lightweight webmention display showing aggregated likes, reposts, comments, and backlinks

---

## Available Plugins

### Markdown Toolbar

*   **Description**: Adds a Markdown toolbar to the post editor with buttons for text formatting, media uploads, and custom HTML blocks. Includes an optional AI-powered alt-text generator using OpenAI's Vision API.
*   **Installation**: This is a **dashboard script**. Go to **Dashboard** -> **Settings** and add the following URL to the `Custom dashboard Javascript` field:
    ```html
    <script src="https://flschr.github.io/bearblog-plugins/markdown-toolbar.js"></script>
    ```

#### AI Alt-Text (Optional)

Uses OpenAI's gpt-4o-mini model to generate image descriptions. Costs ~$0.001 per image. Your API key is stored in localStorage,  use a dedicated key with [spending limits](https://platform.openai.com/settings/organization/limits) for safety and do not use this feature on shared computers.

#### Mobile Note

On iOS, the "Smart Clipboard" feature triggers a paste permission popup. You can disable this feature in the toolbar settings if this becomes annoying.

---

### Blog Search & Infinite Scroll

*   **Description**: Implements a client-side search for your `/blog` page with a floating search button and real-time highlighting. It also adds an "infinite scroll" functionality for your post list. See it in action [on my personal website](https://fischr.org/blog).
*   **Installation**: Add the following code to your `Custom footer content`:
    ```html
    <script src="https://flschr.github.io/bearblog-plugins/search.js" defer></script>
    ```

---

### Theme Switcher

*   **Description**: A two-part script for a seamless dark/light mode theme switcher that saves the user's choice for future visits.
*   **Installation**: This requires adding an element with `id="theme-toggle"` to your theme and then adding the two scripts below. See it in action [on my personal website](https://fischr.org/).
    1.  Add this to `Custom <head> content` to prevent theme flashing:
        ```html
        <script src="https://flschr.github.io/bearblog-plugins/theme-switch-head.js"></script>
        ```
    2.  Add this to `Custom footer content` to handle the click event:
        ```html
        <script src="https://flschr.github.io/bearblog-plugins/theme-switch-footer.js" defer></script>
        ```

---

### Privacy Embeds

*   **Description**: Replaces external iframes (videos, maps, etc.) with privacy-friendly placeholders. Users must click to load content, preventing automatic data transfer to third-party providers. Supports YouTube (auto-switches to youtube-nocookie.com), Google Maps, Vimeo, Dailymotion, Spotify, SoundCloud, and Arte. Automatically detects browser language (German/English). See it in [on this page](https://fischr.org/oben-links-am-lago-di-benaco/).

#### ⚠️ Important: Preload Scanner Issue

Due to the browser's preload scanner, the basic installation may still make **early connections** to video/map providers before JavaScript can block them. This is a known browser behavior that cannot be fully prevented with JavaScript alone.

**For 100% privacy guarantee**, use the [CSP (Content Security Policy) method](#csp-method-recommended) below.

#### Basic Installation (95% effective)

Add this to `Custom <head> content` (not footer!):
```html
<script>
// Critical inline blocker - prevents early connections
(function(){function n(e){const t=e.getAttribute('src');t&&t.startsWith('http')&&!e.hasAttribute('data-src')&&(e.setAttribute('data-src',t),e.removeAttribute('src'))}function i(){document.querySelectorAll('iframe[src]').forEach(n)}const o=new MutationObserver(function(e){for(let t=0;t<e.length;t++){const r=e[t].addedNodes;for(let e=0;e<r.length;e++){const t=r[e];if(t.nodeType===1){if(t.tagName==='IFRAME'){n(t)}const a=t.querySelectorAll&&t.querySelectorAll('iframe[src]');if(a){for(let e=0;e<a.length;e++){n(a[e])}}}}}});o.observe(document.documentElement,{childList:true,subtree:true});i();window._privacyEmbedsObserver=o})();
</script>
<script src="https://flschr.github.io/bearblog-plugins/privacy-embeds.js"></script>
```

**Note**: The inline `<script>` block MUST come first and be embedded directly (not loaded from external URL).

#### CSP Method (Recommended)

For **absolute privacy guarantee**, add a Content Security Policy header that blocks iframes at the browser level, **before** the preload scanner runs:

```html
<!-- Add this FIRST in Custom <head> content -->
<meta http-equiv="Content-Security-Policy" content="frame-src 'self' data: blob:">

<!-- Then add the privacy-embeds scripts -->
<script>
// Critical inline blocker
(function(){function n(e){const t=e.getAttribute('src');t&&t.startsWith('http')&&!e.hasAttribute('data-src')&&(e.setAttribute('data-src',t),e.removeAttribute('src'))}function i(){document.querySelectorAll('iframe[src]').forEach(n)}const o=new MutationObserver(function(e){for(let t=0;t<e.length;t++){const r=e[t].addedNodes;for(let e=0;e<r.length;e++){const t=r[e];if(t.nodeType===1){if(t.tagName==='IFRAME'){n(t)}const a=t.querySelectorAll&&t.querySelectorAll('iframe[src]');if(a){for(let e=0;e<a.length;e++){n(a[e])}}}}}});o.observe(document.documentElement,{childList:true,subtree:true});i();window._privacyEmbedsObserver=o})();
</script>
<script src="https://flschr.github.io/bearblog-plugins/privacy-embeds.js"></script>
```

**What happens with CSP:**
- ✅ **Zero** connections to YouTube/Maps until user clicks
- ⚠️ Browser console shows CSP errors (harmless - this means it's working!)
- ✅ Embeds still work perfectly when user clicks to load

**For detailed explanation**, see [PRIVACY-EMBEDS-PRELOAD-SCANNER.md](PRIVACY-EMBEDS-PRELOAD-SCANNER.md)

---

### Image Lazy Loading

*   **Description**: Improves page load performance by automatically adding `loading="lazy"` to all images within your blog's main content area, so they only load when they are about to be viewed.
*   **Installation**: Add the following code to your `Custom footer content`:
    ```html
    <script src="https://flschr.github.io/bearblog-plugins/lazy-load.js" defer></script>
    ```

---


### Custom Date Formatting

*   **Description**: Overwrites Bear Blog's default date formatting. You can easily customize the date format (e.g., "18. Dez 2025") by editing the `format_string` variable inside the script. This script adds German month names and date formating.
*   **Installation**: Add the following code to your `Custom footer content`:
    ```html
    <script src="https://flschr.github.io/bearblog-plugins/date.js" defer></script>
    ```

---

### Reply and Like

*   **Description**: Adds reply buttons (Mail/Mastodon) and an optional styled like button that replaces Bear Blog's native upvote. Mastodon replies can be automatically threaded under the original toot where you shared the article. Supports German/English. See it in action [on my personal website](https://fischr.org/).
*   **Installation**: Add to `Custom footer content`:
    ```html
    <script src="https://flschr.github.io/bearblog-plugins/reply-and-like.js"
            data-email="your@email.com"
            data-mastodon="@yourhandle@instance.social"
            data-like
            data-lang="de"
            defer></script>
    ```

#### Options

| Attribute | Required | Description |
|-----------|----------|-------------|
| `data-email` | Yes | Your email address for the reply button |
| `data-mastodon` | No | Your Mastodon handle (e.g., `@user@instance.social`) |
| `data-like` | No | Show styled like button instead of native upvote |
| `data-lang` | No | Language: `de` or `en` (default) |

To customize the like button text use: `data-like="Like|Liked!"` (= text before|after click).

#### Mastodon Reply Threading

To enable readers to reply directly to the Mastodon toot where you shared an article (instead of creating a new mention), the plugin automatically checks multiple sources for the toot URL (in this order):

**Method 1: Automated via bearblog-automation (Recommended)**
If you use the [bearblog-automation](https://github.com/flschr/bearblog-automation) social bot, it can automatically maintain a mapping file. The plugin will fetch this file from GitHub and automatically find the correct toot URL for each article.

The social bot should create/update a `mastodon-mappings.json` file in the automation repository with this structure:
```json
{
  "https://fischr.org/article-slug/": "https://mastodon.social/@fischr/123456789",
  "https://fischr.org/another-article/": "https://mastodon.social/@fischr/987654321"
}
```

The mappings are cached in localStorage for 1 hour to minimize HTTP requests. To use a different mappings URL, add `data-mastodon-mappings-url="https://your-url/mappings.json"` to the script tag.

**Method 2: HTML Comment**
Add this comment anywhere in your article content:
```html
<!-- mastodon: https://mastodon.social/@yourhandle/123456789 -->
```

**Method 3: Link Element**
Add this in your article's HTML:
```html
<link rel="mastodon-reply" href="https://mastodon.social/@yourhandle/123456789">
```

**Method 4: Script Attribute (Manual Override)**
Set it directly on the script tag (useful for testing):
```html
<script src="..." data-mastodon-url="https://mastodon.social/@yourhandle/123456789" ...></script>
```

When a Mastodon toot URL is found, the reply button uses Mastodon's `/interact` endpoint to create a proper threaded reply. Without it, the button falls back to creating a new toot with a mention.

#### CSS Classes

``` CSS
.reply-interaction-wrapper
.reply-buttons-container
.reply-button
.reply-button-like
.reply-button-like.liked
.reply-button-mail.
.reply-button-mastodon
```

---

### Social Comments

*   **Description**: Social engagement buttons that show live reaction counts from Bluesky and Mastodon. Includes an optional like button that enhances Bear Blog's native upvote. See it in action [on my personal website](https://fischr.org/).
*   **Installation**: Add to `Custom footer content`:
    ```html
    <script src="https://flschr.github.io/bearblog-plugins/social-comments.js"
            data-email="your@email.com"
            data-like
            defer></script>
    ```
    Or without the mail button (only Bluesky/Mastodon):
    ```html
    <script src="https://flschr.github.io/bearblog-plugins/social-comments.js"
            data-services="bluesky,mastodon"
            data-like
            defer></script>
    ```

#### Options

| Attribute | Required | Description |
|-----------|----------|-------------|
| `data-email` | No | Your email for the mail button (only needed if mail service is enabled) |
| `data-like` | No | Show like button (uses Bear Blog's native upvote) |
| `data-mastodon` | No | Your Mastodon handle for reply threading |
| `data-services` | No | Comma-separated list: `bluesky,mastodon,mail` (default: all) |
| `data-mappings-url` | No | Custom URL for mappings.json |

Custom button texts: `data-like="Like|liked|and you liked"` and `data-conv="Start|X comments|X reactions|Share|1 comment"`.

#### Post URL Mapping

The plugin finds your social posts via meta tags or [bearblog-automation](https://github.com/flschr/bearblog-automation)'s `mappings.json`:

```html
<meta name="bsky-post" content="https://bsky.app/profile/you.bsky.social/post/abc123">
<meta name="mastodon-post" content="https://mastodon.social/@you/123456789">
```

#### CSS Classes

`.social-reactions-wrapper`, `.social-reactions-buttons`, `.social-reactions-button`, `.sr-button-like`, `.sr-button-bluesky`, `.sr-button-mastodon`, `.sr-button-mail`

---

### Webmention Reactions

*   **Description**: A lightweight plugin that displays aggregated reactions from Webmention.io in a clean, minimalist style (similar to Felix Schwenzel's [wirres.net](https://wirres.net/)). Shows counts for likes, reposts, comments, and backlinks from other blogs. Works with [Brid.gy](https://brid.gy/) to collect interactions from Mastodon, Bluesky, and other platforms as webmentions.
*   **Installation**: First, set up Webmention.io and Brid.gy (see setup guide below), then add this to `Custom footer content`:
    ```html
    <script src="https://flschr.github.io/bearblog-plugins/webmention-reactions.js" defer></script>
    ```
    Or with detailed view and German language:
    ```html
    <script src="https://flschr.github.io/bearblog-plugins/webmention-reactions.js"
            data-details
            data-lang="de"
            defer></script>
    ```

#### Options

| Attribute | Required | Description |
|-----------|----------|-------------|
| `data-details` | No | Show detailed view with all individual reactions |
| `data-lang` | No | Language: `de` or `en` (default) |

#### Setup Guide

Before using this plugin, you need to set up Webmention.io and Brid.gy:

1. **Add rel="me" link** to your Bear Blog footer for IndieAuth:
   ```html
   <a style="display: none;" href="https://github.com/yourusername" rel="me">GitHub</a>
   ```

2. **Link back from GitHub**: Add your Bear Blog URL to your GitHub profile.

3. **Sign in to [Webmention.io](https://webmention.io/)** using your Bear Blog URL (it will authenticate via GitHub).

4. **Add webmention endpoint** to your Bear Blog header (`Custom <head> content`):
   ```html
   <link rel="webmention" href="https://webmention.io/yourblog.com/webmention" />
   <link rel="pingback" href="https://webmention.io/yourblog.com/xmlrpc">
   ```

5. **Connect social accounts via [Brid.gy](https://brid.gy/)**:
   - Sign in with Mastodon (grant read access)
   - Sign in with Bluesky (using app password)
   - Brid.gy will automatically send interactions as webmentions to webmention.io

6. **Add the plugin script** to your footer (see installation above).

For more detailed instructions, see:
- [Yordi's guide on displaying webmentions](https://yordi.me/step-by-step-guide-to-show-webmention-interactions-on-bear-blog/)
- [Gobino's setup tutorial](https://gobino.be/adding-webmentions-to-my-blog-tutorial/)

#### What This Shows

The plugin displays four types of interactions:

- **Likes** ❤️ — from Mastodon favorites, Bluesky likes, etc.
- **Reposts** 🔄 — shares, boosts, retweets
- **Comments** 💬 — replies from social media (via Brid.gy)
- **Mentions** 🔗 — backlinks from other blogs

#### CSS Classes

```css
.webmention-reactions
.webmention-like-of
.webmention-repost-of
.webmention-in-reply-to
.webmention-mention-of
.webmention-details
.webmention-section
.webmention-item
```

---

## Feedback & Contributions

If you want to report a bug, have ideas for great features, or just want to say thank you, I'd love to hear from you! Feel free to catch me on [Mastodon](https://mastodon.social/@fischr).

## License

This repository is licensed under the [WTFPL](https://www.wtfpl.net/) License. Feel free to fork and customize for your own blog!
