# Bear Blog Plugins

A collection of plugins to enhance the [Bear Blog](https://bearblog.dev/) reader and writer experience. I mainly use them for my own purposes on [my personal website](https://fischr.org/). But of course, you can use them too. To install a plugin, you need to add it to your header, footer or dashboard configuration. Just follow the instructions below.

## Plugin Overview

- **[Markdown Toolbar](#markdown-toolbar)** – Powerful Markdown editor toolbar with formatting buttons and optional AI alt-text generation
- **[Blog Search & Infinite Scroll](#blog-search--infinite-scroll)** – Client-side search with real-time highlighting and infinite scroll
- **[Theme Switcher](#theme-switcher)** – Dark/light mode toggle that remembers user preference
- **[Privacy Embeds](#privacy-embeds)** – GDPR-friendly consent placeholders for external content (YouTube, Maps, etc.)
- **[Image Lazy Loading](#image-lazy-loading)** – Automatic lazy loading for all images
- **[Custom Date Formatting](#custom-date-formatting)** – Customizable date format with German month names
- **[Reply by](#reply-by)** – Adds a "Reply via email / Mastodon" link next to the upvote button

---

## Available Plugins

### Markdown Toolbar

*   **Description**: Adds a powerful Markdown toolbar to the post editor. It includes buttons for text formatting, media uploads, and custom HTML blocks like info/warning boxes.
*   **Installation**: This is a **dashboard script**. Go to **Dashboard** -> **Settings** and add the following URL to the `Custom dashboard Javascript` field:
    ```html
    <script src="https://flschr.github.io/bearblog-plugins/markdown-toolbar.js"></script>
    ```

#### AI Alt-Text Feature (Optional)

The toolbar includes an optional AI-powered alt-text generator for images using the [OpenAI Vision API](https://platform.openai.com/docs/guides/images-vision) (specifically the **gpt-4o-mini** model) to analyze images. It is designed to be fast, privacy-conscious, and extremely cheap.

* **Smart Privacy:** Only the URL of the selected image is sent to OpenAI when you actively click the button. No data is sent in the background.
* **Minimal Costs:** Generating an alt-text costs approximately **$0.0012**. You can describe nearly 1,000 images for about $1.00.
* **No Subscription:** You use your own OpenAI API Key and only pay for what you actually use.

> [!WARNING]
>  **Security Note**
>  Your OpenAI API key is stored in your browser's localStorage. This is convenient but comes with some risks:
> - If Bear Blog or any injected script has a cross-site scripting vulnerability, an attacker could read your API key
> - Anyone with access to your browser can view the key via Developer Tools
> - Browser localStorage cannot be securely encrypted (the decryption key would also need to be accessible to JavaScript)

**Recommendations:**
1. **Set spending limits** in your [OpenAI account settings](https://platform.openai.com/settings/organization/limits) (e.g., $5/month)
2. **Use a dedicated API key** just for this toolbar (you can revoke it anytime)
3. **Don't use this feature** on shared or public computers
4. The risk is limited: an attacker can only make API calls on your behalf – they cannot access your OpenAI account or other data

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

### Reply by

*   **Description**: Adds two customizable reply buttons next to the upvote button: Reply by Mail and Reply on Mastodon. Each button has its own styling, supports custom icons, and includes multilingual support (German/English). The native Bear Blog upvote button serves as the like/favorite functionality. See it in action [on my personal website](https://fischr.org/).
*   **Basic Installation**: Add the following code to your `Custom footer content` and replace `your@email.com` with your email address:
    ```html
    <script src="https://flschr.github.io/bearblog-plugins/reply-by.js" data-email="your@email.com" defer></script>
    ```

#### Configuration Options

**Language Selection** (default: English):
```html
<!-- German -->
<script src="https://flschr.github.io/bearblog-plugins/reply-by.js"
        data-email="your@email.com"
        data-lang="de"
        defer></script>

<!-- English -->
<script src="https://flschr.github.io/bearblog-plugins/reply-by.js"
        data-email="your@email.com"
        data-lang="en"
        defer></script>
```

**Mastodon Reply** (optional):
```html
<script src="https://flschr.github.io/bearblog-plugins/reply-by.js"
        data-email="your@email.com"
        data-mastodon="@yourhandle@instance.social"
        defer></script>
```

**Custom Icons** (optional):
```html
<script src="https://flschr.github.io/bearblog-plugins/reply-by.js"
        data-email="your@email.com"
        data-icon-mail="✉️"
        data-icon-mastodon="🐘"
        defer></script>
```

#### Translations

**German** (`data-lang="de"`):
- Per Mail antworten
- Auf Mastodon antworten

**English** (`data-lang="en"`):
- Reply by mail
- Reply on Mastodon

#### CSS Customization

The plugin includes default styling with hover and pressed states, but you can completely customize the appearance using CSS classes. Add custom styles to your `Custom CSS`:

```css
/* Main container for all three buttons */
.reply-buttons-container {
  display: flex;
  gap: 0.5rem;
  margin-top: 1.5rem;
  flex-wrap: wrap;
}

/* All buttons share this base class */
.reply-button {
  padding: 0.5rem 1rem;
  border: 1px solid currentColor;
  background: transparent;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  font-family: inherit;
  color: inherit;
  transition: background-color 0.2s, color 0.2s, transform 0.1s;
}

/* Hover state */
.reply-button:hover {
  background-color: currentColor;
  color: #fff;
  opacity: 0.9;
}

/* Pressed/Active state */
.reply-button:active {
  transform: scale(0.95);
}

/* Individual button styling */
.reply-button-mail {
  /* Custom mail button styles */
  border-color: #0066cc;
  color: #0066cc;
}

.reply-button-mastodon {
  /* Custom mastodon button styles */
  border-color: #6364ff;
  color: #6364ff;
}
```

**Available CSS classes:**
- `.reply-interaction-wrapper` – Wrapper containing both upvote button and reply buttons
- `.reply-buttons-container` – Container holding the reply buttons
- `.reply-button` – Base class for all reply buttons
- `.reply-button-mail` – Mail/Email button
- `.reply-button-mastodon` – Mastodon button
- `.reply-button:hover` – Hover state
- `.reply-button:active` – Pressed state
- `.reply-button:focus-visible` – Keyboard focus state

**Data attributes:**
- `data-lang` – Language attribute on container (e.g., `data-lang="de"`)

**Example: Styling upvote and reply buttons together**
```css
/* Change the layout of upvote + reply buttons */
.reply-interaction-wrapper {
  display: flex;
  justify-content: space-between; /* Upvote on left, buttons on right */
  align-items: center;
  gap: 2rem;
}

/* Or center everything */
.reply-interaction-wrapper {
  justify-content: center;
}
```

---

## Feedback & Contributions

If you want to report a bug, have ideas for great features, or just want to say thank you, I'd love to hear from you! Feel free to catch me on [Mastodon](https://mastodon.social/@fischr).

## License

This repository is licensed under the [WTFPL](https://www.wtfpl.net/) License. Feel free to fork and customize for your own blog!
