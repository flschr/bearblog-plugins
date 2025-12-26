/**
 * Bear Blog Markdown Toolbar v3.4
 * Final Version with Adjustable Autosave & Settings UI
 */
(function() {
    'use strict';

    // ==========================================================================
    // 1. GLOBAL STATE & PERSISTENT SETTINGS
    // ==========================================================================
    const SETTINGS_KEY = 'bear_toolbar_v3_settings';
    
    // Load settings from localStorage or use defaults
    const getSettings = () => {
        const saved = localStorage.getItem(SETTINGS_KEY);
        return saved ? JSON.parse(saved) : {
            enabledButtons: ['bold', 'italic', 'h1', 'h2', 'link', 'image', 'quote', 'code'],
            autosaveMinutes: 5 // Default: 5 minutes
        };
    };

    let CONFIG = getSettings();
    let $textarea = null;
    let $toolbar = null;
    let isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    let lastSavedContent = '';
    let autosaveTimer = null;

    // ... (Icons stay the same as in v3.2/3.3)
    const ICONS = {
        bold: '<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none"><path d="M6 12h9a4 4 0 0 1 0 8H7a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h7a4 4 0 0 1 0 8"/></svg>',
        italic: '<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none"><line x1="19" x2="10" y1="4" y2="4"/><line x1="14" x2="5" y1="20" y2="20"/><line x1="15" x2="9" y1="4" y2="20"/></svg>',
        link: '<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>',
        image: '<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none"><rect width="18" height="18" x="3" y="3" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>',
        settings: '<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>',
        save: '<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>'
    };

    // ==========================================================================
    // 2. STYLES (Includes Settings UI classes)
    // ==========================================================================
    function injectStyles() {
        if (document.getElementById('md-toolbar-styles')) return;
        const style = document.createElement('style');
        style.id = 'md-toolbar-styles';
        style.textContent = `
            .md-toolbar { display: flex; gap: 4px; padding: 8px; align-items: center; background: ${isDark ? '#004052' : '#eceff4'}; border-bottom: 1px solid ${isDark ? '#005566' : '#ccc'}; position: sticky; top: 0; z-index: 100; }
            .md-btn { width: 32px; height: 32px; border-radius: 4px; cursor: pointer; display: flex; align-items: center; justify-content: center; border: 1px solid transparent; background: transparent; color: ${isDark ? '#ddd' : '#444'}; transition: all 0.2s; }
            .md-btn:hover { background: rgba(0,0,0,0.1); border-color: ${isDark ? '#555' : '#ccc'}; }
            .md-status { font-size: 11px; margin-left: 10px; opacity: 0.6; font-family: sans-serif; color: ${isDark ? '#aaa' : '#666'}; }
            
            .md-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.7); z-index: 10003; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(3px); }
            .md-panel { background: ${isDark ? '#01242e' : 'white'}; color: ${isDark ? 'white' : '#333'}; padding: 24px; border-radius: 12px; width: 320px; box-shadow: 0 10px 30px rgba(0,0,0,0.5); font-family: system-ui, sans-serif; }
            .md-input { width: 100%; padding: 8px; margin: 10px 0; border: 1px solid ${isDark ? '#444' : '#ccc'}; background: ${isDark ? '#001a21' : '#fff'}; color: inherit; border-radius: 4px; }
            .md-actions { display: flex; justify-content: flex-end; gap: 8px; margin-top: 16px; }
            .md-save-btn { background: #0969da; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; }
        `;
        document.head.appendChild(style);
    }

    // ==========================================================================
    // 3. EDITOR & BACKGROUND SAVE LOGIC
    // ==========================================================================
    const Editor = {
        save: async (isAutosave = false) => {
            const form = $textarea.closest('form');
            // Only save if content has changed to avoid unnecessary requests
            if (!form || $textarea.value === lastSavedContent) return;

            const statusLabel = document.getElementById('md-save-status');
            if (statusLabel) statusLabel.textContent = isAutosave ? 'Autosaving...' : 'Saving...';

            const formData = new FormData(form);
            // Ensure Bear Blog handles this as a normal save, not a new page load
            formData.set('publish', 'false'); 

            try {
                const res = await fetch(form.action || window.location.href, {
                    method: 'POST',
                    body: formData,
                    headers: { 'X-Requested-With': 'XMLHttpRequest' }
                });

                if (res.ok) {
                    lastSavedContent = $textarea.value;
                    if (statusLabel) {
                        statusLabel.textContent = 'Saved';
                        setTimeout(() => statusLabel.textContent = '', 2000);
                    }
                }
            } catch (e) {
                if (statusLabel) statusLabel.textContent = 'Save failed';
            }
        }
    };

    // ==========================================================================
    // 4. AUTOSAVE TIMER MANAGEMENT
    // ==========================================================================
    function setupAutosave() {
        // Clear existing timer if it exists (for settings updates)
        if (autosaveTimer) clearInterval(autosaveTimer);

        const mins = parseInt(CONFIG.autosaveMinutes);
        if (mins > 0) {
            console.log(`[Toolbar] Autosave initialized: every ${mins} minute(s).`);
            autosaveTimer = setInterval(() => {
                Editor.save(true);
            }, mins * 60 * 1000);
        } else {
            console.log(`[Toolbar] Autosave disabled.`);
        }
    }

    // ==========================================================================
    // 5. SETTINGS PANEL
    // ==========================================================================
    function openSettings() {
        const overlay = document.createElement('div');
        overlay.className = 'md-overlay';
        overlay.innerHTML = `
            <div class="md-panel">
                <h3 style="margin-top:0">Settings</h3>
                <label style="font-size:13px">Autosave Interval (Minutes)</label>
                <input type="number" id="md-autosave-input" class="md-input" value="${CONFIG.autosaveMinutes}" min="0" max="60">
                <p style="font-size:11px; opacity:0.7">Set to 0 to disable background autosave.</p>
                <div class="md-actions">
                    <button class="md-save-btn" id="md-settings-save">Save & Apply</button>
                </div>
            </div>
        `;
        document.body.appendChild(overlay);

        overlay.querySelector('#md-settings-save').onclick = () => {
            const newMins = document.getElementById('md-autosave-input').value;
            CONFIG.autosaveMinutes = newMins;
            localStorage.setItem(SETTINGS_KEY, JSON.stringify(CONFIG));
            
            setupAutosave();
            overlay.remove();
        };

        overlay.onclick = (e) => { if(e.target === overlay) overlay.remove(); };
    }

    // ==========================================================================
    // 6. INITIALIZATION
    // ==========================================================================
    function init() {
        $textarea = document.getElementById('body_content');
        if (!$textarea || $textarea.dataset.initialized) return;

        injectStyles();
        lastSavedContent = $textarea.value;

        // Toolbar creation
        const wrapper = $textarea.parentElement;
        $toolbar = document.createElement('div');
        $toolbar.className = 'md-toolbar';
        
        // Settings Button (Left)
        const settingsBtn = document.createElement('button');
        settingsBtn.className = 'md-btn';
        settingsBtn.innerHTML = ICONS.settings;
        settingsBtn.onclick = openSettings;
        $toolbar.appendChild(settingsBtn);

        // Save Button
        const saveBtn = document.createElement('button');
        saveBtn.className = 'md-btn';
        saveBtn.style.marginLeft = '10px';
        saveBtn.innerHTML = ICONS.save;
        saveBtn.onclick = () => Editor.save(false);
        $toolbar.appendChild(saveBtn);

        // Status Label
        const status = document.createElement('span');
        status.id = 'md-save-status';
        status.className = 'md-status';
        $toolbar.appendChild(status);

        wrapper.insertBefore($toolbar, $textarea);
        
        setupAutosave();
        $textarea.dataset.initialized = "true";
    }

    init();
})();
