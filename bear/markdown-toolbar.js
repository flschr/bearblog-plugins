/**
 * Bear Blog Markdown Toolbar v3.3 (Autosave Edition)
 * Features: Background Fetch (no focus loss), Change Detection, Silent UI.
 */
(function() {
    'use strict';

    // ... (Icons and Styles remain the same as v3.2)
    // Add this to injectStyles for the save indicator
    const extraStyles = `
        .md-status { font-size: 11px; margin-left: 10px; opacity: 0.6; font-family: sans-serif; }
    `;

    let lastSavedContent = '';

    const Editor = {
        // ... (insert and wrap functions remain same)

        /**
         * Saves the post in the background using Fetch API.
         * This prevents page reloads and focus loss.
         */
        save: async (publish = false, isAutosave = false) => {
            const form = $textarea.closest('form');
            if (!form || $textarea.value === lastSavedContent) return;

            const statusId = isAutosave ? 'md-save-status' : null;
            if (statusId) document.getElementById(statusId).textContent = 'Saving...';

            const formData = new FormData(form);
            if (publish) formData.set('publish', 'true');

            try {
                const res = await fetch(form.action || window.location.href, {
                    method: 'POST',
                    body: formData,
                    headers: { 'X-Requested-With': 'XMLHttpRequest' }
                });

                if (res.ok) {
                    lastSavedContent = $textarea.value;
                    if (statusId) {
                        document.getElementById(statusId).textContent = 'Saved';
                        setTimeout(() => { document.getElementById(statusId).textContent = ''; }, 3000);
                    }
                    if (!isAutosave) alert(publish ? 'Published!' : 'Draft Saved!');
                }
            } catch (e) {
                console.error("Autosave failed", e);
                if (statusId) document.getElementById(statusId).textContent = 'Save failed';
            }
        }
    };

    /**
     * Initializes a timer to check for changes every 60 seconds.
     */
    function initAutosave() {
        lastSavedContent = $textarea.value;
        setInterval(() => {
            Editor.save(false, true);
        }, 60000); // Check every minute
    }

    // ==========================================================================
    // UPDATED INIT
    // ==========================================================================
    function init() {
        $textarea = document.getElementById('body_content');
        if (!$textarea || $textarea.dataset.initialized) return;

        // ... (previous init logic: Styles, Toolbar creation)

        // Add a status indicator to the toolbar
        const status = document.createElement('span');
        status.id = 'md-save-status';
        status.className = 'md-status';
        $toolbar.appendChild(status);

        initAutosave();
        $textarea.dataset.initialized = "true";
    }

    init();
})();
