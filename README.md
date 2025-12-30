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

---

## Available Plugins

### Markdown Toolbar

*   **Description**: Adds a Markdown toolbar to the post editor with buttons for text formatting, media uploads, and custom HTML blocks. Includes an optional AI-powered alt-text generator using OpenAI's Vision API.
*   **Installation**: This is a **dashboard script**. Go to **Dashboard** -> **Settings** and add the following URL to the `Custom dashboard Javascript` field:
    ```html
    <script src="https://flschr.github.io/bearblog-plugins/markdown-toolbar.js"></script>
    ```

#### AI Alt-Text (Optional)

Uses OpenAI's gpt-4o-mini model to generate image descriptions. Costs ~$0.001 per image. Your API key is stored in localStorage – use a dedicated key with [spending limits](https://platform.openai.com/settings/organization/limits) for safety.

#### Mobile Note

On iOS, the "Smart Clipboard" feature triggers a paste permission popup. You can disable it in the toolbar settings if this becomes annoying.

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
*   **Installation**: Add this to `Custom <head> content` (not footer!) to block iframes before the browser's preload scanner can see them:
    ```html
    <script src="https://flschr.github.io/bearblog-plugins/privacy-embeds.js"></script>
    ```

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

*   **Description**: Adds reply buttons (Mail/Mastodon) and an optional styled like button that replaces Bear Blog's native upvote. Supports German/English. See it in action [on my personal website](https://fischr.org/).
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

## Feedback & Contributions

If you want to report a bug, have ideas for great features, or just want to say thank you, I'd love to hear from you! Feel free to catch me on [Mastodon](https://mastodon.social/@fischr).

## License

This repository is licensed under the [WTFPL](https://www.wtfpl.net/) License. Feel free to fork and customize for your own blog!
