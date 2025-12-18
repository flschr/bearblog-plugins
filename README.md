# Bear Blog Plugins

A collection of plugins to enhance the [Bear Blog](https://bearblog.dev/) writing and management experience. This repository contains various JavaScript plugins designed to add new features and improve usability on your Bear Blog. To install a plugin, you need to add it to your blog's configuration.

---

## Available Plugins

### Markdown Toolbar

*   **Description**: Adds a powerful Markdown toolbar to the post editor. It includes buttons for text formatting, media uploads, and custom HTML blocks like info/warning boxes.
*   **Installation**: This is a **dashboard script**. Go to **Dashboard** -> **Settings** and add the following URL to the `Custom dashboard Javascript` field:
    ```
    <script src="https://cdn.jsdelivr.net/gh/flschr/bearblog-plugins@main/bear/markdown-toolbar.js"></script>
    ```

### Blog Search & Infinite Scroll

*   **Description**: Implements a client-side search for your `/blog` page with a floating search button and real-time highlighting. It also adds an "infinite scroll" functionality for your post list.
*   **Installation**: Add the following code to your `Custom footer content`:
    ```html
    <script src="https://cdn.jsdelivr.net/gh/flschr/bearblog-plugins@main/bear/search.js" defer></script>
    ```

### Theme Switcher

*   **Description**: A two-part script for a seamless dark/light mode theme switcher that saves the user's choice for future visits.
*   **Installation**: This requires adding an element with `id="theme-toggle"` to your theme and then adding the two scripts below.
    1.  Add this to `Custom <head> content` to prevent theme flashing:
        ```html
        <script src="https://cdn.jsdelivr.net/gh/flschr/bearblog-plugins@main/bear/theme-switch-head.js"></script>
        ```
    2.  Add this to `Custom footer content` to handle the click event:
        ```html
        <script src="https://cdn.jsdelivr.net/gh/flschr/bearblog-plugins@main/bear/theme-switch-footer.js" defer></script>
        ```

### Image Lazy Loading

*   **Description**: Improves page load performance by automatically adding `loading="lazy"` to all images within your blog's main content area, so they only load when they are about to be viewed.
*   **Installation**: Add the following code to your `Custom footer content`:
    ```html
    <script src="https://cdn.jsdelivr.net/gh/flschr/bearblog-plugins@main/bear/lazy-load.js" defer></script>
    ```

### Custom Date Formatting

*   **Description**: Overwrites Bear Blog's default date formatting. You can easily customize the date format (e.g., "18. Dez 2025") by editing the `format_string` variable inside the script. This script adds German month names and date formating.
*   **Installation**: Add the following code to your `Custom footer content`:
    ```html
    <script src="https://cdn.jsdelivr.net/gh/flschr/bearblog-plugins@main/bear/date.js" defer></script>
    ```
