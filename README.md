# Bear Blog Plugins

A collection of plugins to enhance the [Bear Blog](https://bearblog.dev/) reader and writer experience. I mainly use them for my own purposes on [my personal website](https://fischr.org/). But of course, you can use them too. To install a plugin, you need to add it to your header, footer or dashboard configuration. Just follow the instructions below.

## Plugin Overview

- **[Markdown Toolbar](#markdown-toolbar)** – Powerful editor toolbar with formatting buttons and optional AI alt-text generation
- **[Blog Search & Infinite Scroll](#blog-search--infinite-scroll)** – Client-side search with real-time highlighting and infinite scroll
- **[Theme Switcher](#theme-switcher)** – Dark/light mode toggle that remembers user preference
- **[Privacy Embeds](#privacy-embeds)** – GDPR-friendly consent placeholders for external content (YouTube, Maps, etc.)
- **[Image Lazy Loading](#image-lazy-loading)** – Automatic lazy loading for all images
- **[Custom Date Formatting](#custom-date-formatting)** – Customizable date format with German month names
- **[Reply by Mail](#reply-by-mail)** – Adds a "Reply via email" link next to the upvote button

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
*   **Installation**: Add the following code to your `Custom footer content`:
    ```html
    <script src="https://flschr.github.io/bearblog-plugins/privacy-embeds.js" defer></script>
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

### Reply by Mail

*   **Description**: Adds a "Reply via email" link next to the upvote button on post pages. When clicked, it opens the user's mail client with a pre-filled subject line containing the post title. See it in action [on my personal website](https://fischr.org/).
*   **Installation**: Add the following code to your `Custom footer content` and replace `your@email.com` with your email address:
    ```html
    <script src="https://flschr.github.io/bearblog-plugins/reply-by-mail.js" data-email="your@email.com" defer></script>
    ```

---

## 🌐 CDN URLs

All plugins are available via GitHub Pages CDN:

```
https://flschr.github.io/bearblog-plugins/[filename].js
```

The CDN automatically deploys from the `stable` tag and updates within 10-15 minutes after a new release. The `unstable` tag is the development branch with potentially untested and breaking changes. Please do only use it on advice and your own risk. 

---

## Feedback & Contributions

If you want to report a bug, have ideas for great features, or just want to say thank you, I'd love to hear from you! Feel free to catch me on [Mastodon](https://mastodon.social/@fischr).

## License

This repository is licensed under the [WTFPL](https://www.wtfpl.net/) License. Feel free to fork and customize for your own blog!
