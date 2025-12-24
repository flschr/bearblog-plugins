/**
 * Bear Blog Markdown Toolbar v3.0
 *
 * Features:
 * - Modular button registry (easily extensible)
 * - Configurable buttons (show/hide individual buttons)
 * - Undo-compatible text insertion (execCommand)
 * - Autosave with draft recovery
 * - GitHub-style admonitions (Info/Warning/Caution)
 * - Dark mode support
 */
(function() {
    'use strict';

    // ==========================================================================
    // CONFIGURATION
    // ==========================================================================
    //
    // Customize your toolbar by editing the enabledButtons array below.
    // - Comment out or remove buttons you don't want
    // - Reorder buttons by changing their position in the array
    //
    // Available buttons:
    //   Formatting:   'bold', 'italic', 'strikethrough', 'mark'
    //   Headings:     'h1', 'h2', 'h3'
    //   Links/Media:  'link', 'image'
    //   Blocks:       'quote', 'list', 'numberedList', 'hr', 'table'
    //   Code:         'code', 'codeBlock'
    //   References:   'footnote'
    //   Admonitions:  'admonitionInfo', 'admonitionWarning', 'admonitionCaution'
    //
    // ==========================================================================

    const CONFIG = {
        // Buttons to show (comment out or remove to hide)
        // Order here = order in toolbar
        enabledButtons: [
            'bold',
            'italic',
            'strikethrough',
            'mark',
            'h1',
            'h2',
            'h3',
            'link',
            'image',
            'quote',
            'list',
            'numberedList',
            'hr',
            'table',
            'code',
            'codeBlock',
            'footnote',
            // Admonitions
            'admonitionInfo',
            'admonitionWarning',
            'admonitionCaution',
        ],

        // Autosave settings
        autosave: {
            enabled: true,
            intervalMs: 3000,  // Save 3 seconds after last edit
            maxAgeHours: 48,   // Delete drafts older than 48 hours
        },

        // Character counter thresholds (for meta description)
        charCounter: {
            warning: 250,
            danger: 300,
        }
    };

    // ==========================================================================
    // ICONS (SVG)
    // ==========================================================================

    const ICONS = {
        // Lucide Icons (https://lucide.dev)
        bold: '<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"><path d="M6 12h9a4 4 0 0 1 0 8H7a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h7a4 4 0 0 1 0 8"/></svg>',
        italic: '<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"><line x1="19" x2="10" y1="4" y2="4"/><line x1="14" x2="5" y1="20" y2="20"/><line x1="15" x2="9" y1="4" y2="20"/></svg>',
        strikethrough: '<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"><path d="M16 4H9a3 3 0 0 0-2.83 4"/><path d="M14 12a4 4 0 0 1 0 8H6"/><line x1="4" x2="20" y1="12" y2="12"/></svg>',
        mark: '<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"><path d="m9 11-6 6v3h9l3-3"/><path d="m22 12-4.6 4.6a2 2 0 0 1-2.8 0l-5.2-5.2a2 2 0 0 1 0-2.8L14 4"/></svg>',
        link: '<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>',
        quote: '<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/><path d="M8 12a2 2 0 0 0 2-2V8H8"/><path d="M14 12a2 2 0 0 0 2-2V8h-2"/></svg>',
        image: '<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>',
        code: '<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>',
        codeBlock: '<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"><path d="M10 9.5 8 12l2 2.5"/><path d="m14 9.5 2 2.5-2 2.5"/><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M4 21h16"/><path d="M9 21h1"/><path d="M14 21h1"/></svg>',
        list: '<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"><line x1="8" x2="21" y1="6" y2="6"/><line x1="8" x2="21" y1="12" y2="12"/><line x1="8" x2="21" y1="18" y2="18"/><line x1="3" x2="3.01" y1="6" y2="6"/><line x1="3" x2="3.01" y1="12" y2="12"/><line x1="3" x2="3.01" y1="18" y2="18"/></svg>',
        numberedList: '<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"><line x1="10" x2="21" y1="6" y2="6"/><line x1="10" x2="21" y1="12" y2="12"/><line x1="10" x2="21" y1="18" y2="18"/><path d="M4 6h1v4"/><path d="M4 10h2"/><path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1"/></svg>',
        footnote: '<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"><path d="M4 16v-2.38C4 11.5 2.97 10.5 3 8c.03-2.72 1.49-6 4.5-6C9.37 2 10 3.8 10 5.5c0 3.11-2 5.66-2 8.68V16a2 2 0 1 1-4 0Z"/><path d="M20 20v-2.38c0-2.12 1.03-3.12 1-5.62-.03-2.72-1.49-6-4.5-6-1.87 0-2.5 1.8-2.5 3.5 0 3.11 2 5.66 2 8.68V20a2 2 0 1 0 4 0Z"/><path d="M16 17h4"/><path d="M4 13h4"/></svg>',
        hr: '<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"><path d="M5 12h14"/></svg>',
        table: '<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"><path d="M12 3v18"/><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18"/><path d="M3 15h18"/></svg>',
        info: '<svg viewBox="0 0 16 16" width="18" height="18" fill="currentColor"><path d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8Zm8-6.5a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13ZM6.5 7.75A.75.75 0 0 1 7.25 7h1a.75.75 0 0 1 .75.75v2.75h.25a.75.75 0 0 1 0 1.5h-2a.75.75 0 0 1 0-1.5h.25v-2h-.25a.75.75 0 0 1-.75-.75ZM8 6a1 1 0 1 1 0-2 1 1 0 0 1 0 2Z"/></svg>',
        warning: '<svg viewBox="0 0 16 16" width="18" height="18" fill="currentColor"><path d="M6.457 1.047c.659-1.234 2.427-1.234 3.086 0l6.082 11.378A1.75 1.75 0 0 1 14.082 15H1.918a1.75 1.75 0 0 1-1.543-2.575Zm1.763.707a.25.25 0 0 0-.44 0L1.698 13.132a.25.25 0 0 0 .22.368h12.164a.25.25 0 0 0 .22-.368Zm.53 3.996v2.5a.75.75 0 0 1-1.5 0v-2.5a.75.75 0 0 1 1.5 0ZM9 11a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z"/></svg>',
        caution: '<svg viewBox="0 0 16 16" width="18" height="18" fill="currentColor"><path d="M4.47.22A.749.749 0 0 1 5 0h6c.199 0 .389.079.53.22l4.25 4.25c.141.14.22.331.22.53v6a.749.749 0 0 1-.22.53l-4.25 4.25A.749.749 0 0 1 11 16H5a.749.749 0 0 1-.53-.22L.22 11.53A.749.749 0 0 1 0 11V5c0-.199.079-.389.22-.53Zm.84 1.28L1.5 5.31v5.38l3.81 3.81h5.38l3.81-3.81V5.31L10.69 1.5ZM8 4a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-1.5 0v-3.5A.75.75 0 0 1 8 4Zm0 8a1 1 0 1 1 0-2 1 1 0 0 1 0 2Z"/></svg>',
        more: '<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>',
        gallery: '<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>',
        preview: '<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"><path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"/><circle cx="12" cy="12" r="3"/></svg>',
        help: '<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/></svg>',
        settings: '<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>',
        fullscreen: '<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"><polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" x2="14" y1="3" y2="10"/><line x1="3" x2="10" y1="21" y2="14"/></svg>',
        exitFullscreen: '<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"><polyline points="4 14 10 14 10 20"/><polyline points="20 10 14 10 14 4"/><line x1="14" x2="21" y1="10" y2="3"/><line x1="3" x2="10" y1="21" y2="14"/></svg>',
        // Custom snippet button
        heart: '<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>',
        // Action buttons
        publish: '<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"><path d="M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z"/><path d="m21.854 2.147-10.94 10.939"/></svg>',
        save: '<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"><path d="M15.2 3a2 2 0 0 1 1.4.6l3.8 3.8a2 2 0 0 1 .6 1.4V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z"/><path d="M17 21v-7a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1v7"/><path d="M7 3v4a1 1 0 0 0 1 1h7"/></svg>',
        eye: '<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"><path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"/><circle cx="12" cy="12" r="3"/></svg>',
        back: '<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>',
    };

    // Button categories for settings panel
    const BUTTON_CATEGORIES = {
        'Formatting': ['bold', 'italic', 'strikethrough', 'mark'],
        'Headings': ['h1', 'h2', 'h3'],
        'Links & Media': ['link', 'image'],
        'Blocks': ['quote', 'list', 'numberedList', 'hr', 'table'],
        'Code': ['code', 'codeBlock'],
        'References': ['footnote'],
        'Admonitions': ['admonitionInfo', 'admonitionWarning', 'admonitionCaution'],
    };

    // ==========================================================================
    // BUTTON REGISTRY
    // ==========================================================================

    const BUTTONS = {
        // --- Formatting ---
        bold: {
            icon: ICONS.bold,
            title: 'Bold (Ctrl+B)',
            syntax: ['**', '**'],
            shortcut: { key: 'b', ctrl: true }
        },
        italic: {
            icon: ICONS.italic,
            title: 'Italic (Ctrl+I)',
            syntax: ['*', '*'],
            shortcut: { key: 'i', ctrl: true }
        },
        strikethrough: {
            icon: ICONS.strikethrough,
            title: 'Strikethrough',
            syntax: ['~~', '~~']
        },
        mark: {
            icon: ICONS.mark,
            title: 'Highlight',
            syntax: ['==', '==']
        },

        // --- Headings ---
        h1: {
            icon: 'H1',
            title: 'Heading 1',
            syntax: ['# ', ''],
            lineStart: true
        },
        h2: {
            icon: 'H2',
            title: 'Heading 2',
            syntax: ['## ', ''],
            lineStart: true
        },
        h3: {
            icon: 'H3',
            title: 'Heading 3',
            syntax: ['### ', ''],
            lineStart: true
        },

        // --- Links & Media ---
        link: {
            icon: ICONS.link,
            title: 'Link (Ctrl+K)',
            action: 'insertLink',
            shortcut: { key: 'k', ctrl: true }
        },
        image: {
            icon: ICONS.image,
            title: 'Insert Image',
            action: 'upload'
        },

        // --- Blocks ---
        quote: {
            icon: ICONS.quote,
            title: 'Quote',
            syntax: ['> ', ''],
            lineStart: true
        },
        list: {
            icon: ICONS.list,
            title: 'Bullet List',
            syntax: ['- ', ''],
            lineStart: true
        },
        numberedList: {
            icon: ICONS.numberedList,
            title: 'Numbered List',
            syntax: ['1. ', ''],
            lineStart: true
        },
        hr: {
            icon: ICONS.hr,
            title: 'Horizontal Rule',
            syntax: ['\n---\n', '']
        },
        table: {
            icon: ICONS.table,
            title: 'Table',
            syntax: ['\n| Column 1 | Column 2 |\n|----------|----------|\n| Cell 1   | Cell 2   |\n', '']
        },

        // --- Code ---
        code: {
            icon: ICONS.code,
            title: 'Inline Code',
            syntax: ['`', '`']
        },
        codeBlock: {
            icon: ICONS.codeBlock,
            title: 'Code Block',
            action: 'insertCodeBlock'
        },

        // --- References ---
        footnote: {
            icon: ICONS.footnote,
            title: 'Footnote',
            action: 'insertFootnote'
        },

        // --- Admonitions (GitHub Style) ---
        admonitionInfo: {
            icon: ICONS.info,
            title: 'Info Box',
            syntax: ['\n> #### INFO\n> ', '\n']
        },
        admonitionWarning: {
            icon: ICONS.warning,
            title: 'Warning Box',
            syntax: ['\n> ##### WARNING\n> ', '\n']
        },
        admonitionCaution: {
            icon: ICONS.caution,
            title: 'Caution Box',
            syntax: ['\n> ###### CAUTION\n> ', '\n']
        },
    };

    // Menu items (always in dropdown)
    const MENU_ITEMS = [
        { icon: ICONS.gallery, text: 'Media Gallery', action: 'gallery' },
        { icon: ICONS.settings, text: 'Toolbar Settings', action: 'settings', separator: true },
    ];

    // ==========================================================================
    // STATE
    // ==========================================================================

    let isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    let autosaveTimer = null;
    let $textarea = null;
    let $toolbar = null;

    // ==========================================================================
    // USER SETTINGS (localStorage)
    // ==========================================================================

    const SETTINGS_KEY = 'bear_toolbar_settings';
    const PENDING_BACK_NAV_KEY = 'bear_pending_back_nav';

    function loadUserSettings() {
        try {
            const saved = localStorage.getItem(SETTINGS_KEY);
            if (saved) {
                return JSON.parse(saved);
            }
        } catch (e) {}
        return null;
    }

    function saveUserSettings(settings) {
        try {
            localStorage.setItem(SETTINGS_KEY, JSON.stringify({
                ...settings,
                savedAt: Date.now()
            }));
        } catch (e) {}
    }

    function getEnabledButtons() {
        const userSettings = loadUserSettings();
        if (userSettings && userSettings.enabledButtons) {
            return userSettings.enabledButtons;
        }
        return CONFIG.enabledButtons;
    }

    function isCharCounterEnabled() {
        const userSettings = loadUserSettings();
        if (userSettings && typeof userSettings.showCharCounter === 'boolean') {
            return userSettings.showCharCounter;
        }
        return true; // Default: enabled
    }

    function isFullscreenButtonEnabled() {
        const userSettings = loadUserSettings();
        if (userSettings && typeof userSettings.showFullscreenButton === 'boolean') {
            return userSettings.showFullscreenButton;
        }
        return true; // Default: enabled
    }

    function isActionButtonsEnabled() {
        const userSettings = loadUserSettings();
        if (userSettings && typeof userSettings.showActionButtons === 'boolean') {
            return userSettings.showActionButtons;
        }
        return false; // Default: disabled (use original Bear Blog controls)
    }

    function isAutosaveEnabled() {
        const userSettings = loadUserSettings();
        if (userSettings && typeof userSettings.enableAutosave === 'boolean') {
            return userSettings.enableAutosave;
        }
        return CONFIG.autosave.enabled; // Default from config
    }

    function isCustomSnippetEnabled() {
        const userSettings = loadUserSettings();
        if (userSettings && typeof userSettings.showCustomSnippet === 'boolean') {
            return userSettings.showCustomSnippet;
        }
        return false; // Default: disabled
    }

    function getCustomSnippetText() {
        const userSettings = loadUserSettings();
        if (userSettings && typeof userSettings.customSnippetText === 'string') {
            return userSettings.customSnippetText;
        }
        return ''; // Default: empty
    }

    // Track original content for unsaved changes detection
    let originalContent = '';

    function hasUnsavedChanges() {
        if (!$textarea) return false;
        return $textarea.value !== originalContent;
    }

    function updateOriginalContent() {
        if ($textarea) {
            originalContent = $textarea.value;
        }
    }

    // ==========================================================================
    // INITIALIZATION
    // ==========================================================================

    function init() {
        // Check for pending back navigation (from save & go back)
        try {
            const pendingBackUrl = sessionStorage.getItem(PENDING_BACK_NAV_KEY);
            if (pendingBackUrl) {
                sessionStorage.removeItem(PENDING_BACK_NAV_KEY);
                window.location.href = pendingBackUrl;
                return;
            }
        } catch (e) {}

        $textarea = document.getElementById('body_content');
        if (!$textarea || $textarea.hasAttribute('data-toolbar-initialized')) return;

        $textarea.setAttribute('data-toolbar-initialized', 'true');

        // Store original content for unsaved changes detection
        originalContent = $textarea.value;

        // Listen for dark mode changes
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
            isDark = e.matches;
            // Could refresh toolbar colors here if needed
        });

        createToolbar();
        createCharCounter();
        if (isAutosaveEnabled()) {
            setupAutosave();
            checkForDraft();
        }
        setupKeyboardShortcuts();

        // Hide Bear Blog default elements
        document.querySelectorAll('.helptext.sticky, body > footer').forEach(el => {
            el.style.display = 'none';
        });

        // Hide sticky controls if action buttons are shown in toolbar
        if (isActionButtonsEnabled()) {
            const stickyControls = document.querySelector('.sticky-controls');
            if (stickyControls) {
                stickyControls.style.display = 'none';
            }
        }

        // Restore fullscreen mode if it was active before page reload
        checkFullscreenRestore();
    }

    // ==========================================================================
    // TOOLBAR CREATION
    // ==========================================================================

    function createToolbar() {
        const wrapper = $textarea.parentElement;
        wrapper.style.position = 'relative';

        $toolbar = document.createElement('div');
        $toolbar.className = 'md-toolbar';
        $toolbar.style.cssText = `
            display: flex;
            gap: 4px;
            padding: 8px;
            align-items: center;
            flex-wrap: wrap;
            background: ${isDark ? '#004052' : '#eceff4'};
            border-bottom: 1px solid ${isDark ? '#005566' : 'lightgrey'};
            position: sticky;
            top: 0;
            z-index: 100;
        `;

        renderToolbarButtons();

        wrapper.insertBefore($toolbar, $textarea);
    }

    function renderToolbarButtons() {
        // Clear existing buttons (except keep the structure)
        $toolbar.innerHTML = '';

        // Add action buttons (Publish, Save, Preview) if enabled
        if (isActionButtonsEnabled()) {
            const actionButtons = [
                { id: 'actionPublish', icon: ICONS.publish, title: 'Publish', action: 'publishPost', color: '#0969da' },
                { id: 'actionSave', icon: ICONS.save, title: 'Save as Draft', action: 'savePost', color: '#2e7d32' },
                { id: 'actionPreview', icon: ICONS.eye, title: 'Preview', action: 'previewPost', color: '#f57c00' },
            ];

            actionButtons.forEach(actionDef => {
                const btn = document.createElement('button');
                btn.type = 'button';
                btn.className = 'md-btn md-action-btn';
                btn.dataset.buttonId = actionDef.id;
                btn.title = actionDef.title;
                btn.innerHTML = actionDef.icon;
                btn.style.cssText = `
                    width: 32px;
                    height: 32px;
                    min-width: 32px;
                    min-height: 32px;
                    flex-shrink: 0;
                    background: ${actionDef.color || (isDark ? '#01242e' : 'white')};
                    color: ${actionDef.color ? 'white' : (isDark ? '#ddd' : '#444')};
                    border: 1px solid ${isDark ? '#555' : '#ccc'};
                    border-radius: 3px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 0;
                `;
                btn.addEventListener('click', () => handleAction(actionDef.action));
                $toolbar.appendChild(btn);
            });

            // Separator after action buttons
            const separator = document.createElement('div');
            separator.style.cssText = `
                width: 1px;
                height: 24px;
                background: ${isDark ? '#555' : '#ccc'};
                margin: 0 8px;
            `;
            $toolbar.appendChild(separator);
        }

        const enabledButtons = getEnabledButtons();

        // Create enabled buttons
        enabledButtons.forEach(buttonId => {
            const buttonDef = BUTTONS[buttonId];
            if (!buttonDef) return;

            const btn = createButton(buttonId, buttonDef);
            $toolbar.appendChild(btn);
        });

        // Fullscreen button (always at consistent position after formatting buttons)
        const showFullscreenButton = isFullscreenButtonEnabled();
        const showActionButtons = isActionButtonsEnabled();

        if (showFullscreenButton) {
            // Separator before fullscreen button
            const fsSeparator = document.createElement('div');
            fsSeparator.style.cssText = `
                width: 1px;
                height: 24px;
                background: ${isDark ? '#555' : '#ccc'};
                margin: 0 8px;
            `;
            $toolbar.appendChild(fsSeparator);

            // Fullscreen button
            const fsBtn = document.createElement('button');
            fsBtn.type = 'button';
            fsBtn.className = 'md-btn md-fullscreen-btn';
            fsBtn.title = 'Fullscreen Editor';
            fsBtn.innerHTML = ICONS.fullscreen;
            fsBtn.style.cssText = `
                width: 32px;
                height: 32px;
                min-width: 32px;
                min-height: 32px;
                flex-shrink: 0;
                background: ${isDark ? '#01242e' : 'white'};
                color: ${isDark ? '#ddd' : '#444'};
                border: 1px solid ${isDark ? '#555' : '#ccc'};
                border-radius: 3px;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 0;
            `;
            fsBtn.addEventListener('click', () => handleAction('fullscreen'));
            $toolbar.appendChild(fsBtn);
        }

        // Custom snippet button - directly before spacer
        if (isCustomSnippetEnabled()) {
            const snippetBtn = document.createElement('button');
            snippetBtn.type = 'button';
            snippetBtn.className = 'md-btn md-snippet-btn';
            snippetBtn.title = 'Insert Custom Snippet';
            snippetBtn.innerHTML = ICONS.heart;
            snippetBtn.style.cssText = `
                width: 32px;
                height: 32px;
                min-width: 32px;
                min-height: 32px;
                flex-shrink: 0;
                background: ${isDark ? '#01242e' : 'white'};
                color: #e91e63;
                border: 1px solid ${isDark ? '#555' : '#ccc'};
                border-radius: 3px;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 0;
            `;
            snippetBtn.addEventListener('click', () => {
                const snippet = getCustomSnippetText();
                if (snippet) {
                    insertText(snippet);
                }
            });
            $toolbar.appendChild(snippetBtn);
        }

        // Spacer
        const spacer = document.createElement('div');
        spacer.style.flex = '1';
        $toolbar.appendChild(spacer);

        // Back button - show when action buttons are enabled (after spacer, on right side)
        if (showActionButtons) {
            const backBtn = document.createElement('button');
            backBtn.type = 'button';
            backBtn.className = 'md-btn md-back-btn';
            backBtn.title = 'Back';
            backBtn.innerHTML = ICONS.back;
            backBtn.style.cssText = `
                width: 32px;
                height: 32px;
                min-width: 32px;
                min-height: 32px;
                flex-shrink: 0;
                background: ${isDark ? '#01242e' : 'white'};
                color: ${isDark ? '#ddd' : '#444'};
                border: 1px solid ${isDark ? '#555' : '#ccc'};
                border-radius: 3px;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 0;
            `;
            backBtn.addEventListener('click', () => handleBackNavigation());
            $toolbar.appendChild(backBtn);
        }

        // Menu button
        $toolbar.appendChild(createMenuButton());
    }

    function createButton(id, def) {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'md-btn';
        btn.dataset.buttonId = id;
        btn.title = def.title;

        // Icon or text
        if (def.icon.startsWith('<svg') || def.icon.startsWith('<')) {
            btn.innerHTML = def.icon;
        } else {
            btn.textContent = def.icon;
            btn.style.fontWeight = '800';
            btn.style.fontFamily = 'system-ui, sans-serif';
        }

        // Styling - consistent button dimensions
        btn.style.cssText += `
            width: 32px;
            height: 32px;
            min-width: 32px;
            min-height: 32px;
            flex-shrink: 0;
            background: ${def.color || (isDark ? '#01242e' : 'white')};
            color: ${def.color ? 'white' : (isDark ? '#ddd' : '#444')};
            border: 1px solid ${isDark ? '#555' : '#ccc'};
            border-radius: 3px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 0;
        `;

        btn.addEventListener('click', () => handleButtonClick(id, def));

        return btn;
    }

    function createMenuButton() {
        const wrapper = document.createElement('div');
        wrapper.style.position = 'relative';

        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'md-btn md-menu-btn';
        btn.innerHTML = ICONS.more;
        btn.title = 'More...';
        btn.style.cssText = `
            width: 32px;
            height: 32px;
            min-width: 32px;
            min-height: 32px;
            flex-shrink: 0;
            background: ${isDark ? '#01242e' : 'white'};
            color: ${isDark ? '#ddd' : '#444'};
            border: 1px solid ${isDark ? '#555' : '#ccc'};
            border-radius: 3px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 0;
        `;

        const dropdown = document.createElement('div');
        dropdown.className = 'md-dropdown';
        dropdown.style.cssText = `
            display: none;
            position: absolute;
            top: 36px;
            right: 0;
            background: ${isDark ? '#01242e' : 'white'};
            border: 1px solid ${isDark ? '#555' : '#ccc'};
            border-radius: 4px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            min-width: 180px;
            z-index: 1000;
            padding: 4px 0;
        `;

        MENU_ITEMS.forEach(item => {
            // Add separator before item if specified
            if (item.separator) {
                const sep = document.createElement('div');
                sep.style.cssText = `height: 1px; background: ${isDark ? '#333' : '#eee'}; margin: 4px 0;`;
                dropdown.appendChild(sep);
            }

            const menuItem = document.createElement('div');
            menuItem.style.cssText = `
                padding: 10px 14px;
                cursor: pointer;
                display: flex;
                align-items: center;
                gap: 10px;
                font-size: 13px;
                color: ${isDark ? '#ddd' : '#444'};
            `;
            menuItem.innerHTML = `<span style="display:flex;width:18px;">${item.icon}</span><span>${item.text}</span>`;

            menuItem.addEventListener('click', () => {
                handleAction(item.action);
                dropdown.style.display = 'none';
            });

            menuItem.addEventListener('mouseover', () => {
                menuItem.style.background = isDark ? '#004052' : '#f5f5f5';
            });
            menuItem.addEventListener('mouseout', () => {
                menuItem.style.background = 'transparent';
            });

            dropdown.appendChild(menuItem);
        });

        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none';
        });

        document.addEventListener('click', () => {
            dropdown.style.display = 'none';
        });

        wrapper.appendChild(btn);
        wrapper.appendChild(dropdown);

        return wrapper;
    }

    // ==========================================================================
    // CHARACTER COUNTER
    // ==========================================================================

    function createCharCounter() {
        if (!isCharCounterEnabled()) return;

        const counter = document.createElement('div');
        counter.id = 'md-char-counter';
        counter.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            padding: 4px 12px;
            border-radius: 6px;
            font-size: 16px;
            font-weight: 700;
            font-family: ui-sans-serif, sans-serif;
            pointer-events: none;
            z-index: 999999;
            opacity: 0.95;
            border: 1.5px solid ${isDark ? '#555' : '#ccc'};
            box-shadow: 0 2px 8px rgba(0,0,0,0.2);
            transition: all 0.2s;
        `;

        const updateCounter = () => {
            const len = $textarea.value.length;
            counter.textContent = len;

            if (len >= CONFIG.charCounter.danger) {
                counter.style.background = '#d32f2f';
                counter.style.color = '#fff';
                counter.style.borderColor = '#b71c1c';
            } else if (len >= CONFIG.charCounter.warning) {
                counter.style.background = '#fbc02d';
                counter.style.color = '#000';
                counter.style.borderColor = '#f9a825';
            } else {
                counter.style.background = isDark ? '#01242e' : '#fff';
                counter.style.color = isDark ? '#aaa' : '#666';
                counter.style.borderColor = isDark ? '#555' : '#ccc';
            }
        };

        $textarea.addEventListener('input', updateCounter);
        updateCounter();

        document.body.appendChild(counter);
    }

    // ==========================================================================
    // AUTOSAVE
    // ==========================================================================

    function getPostId() {
        // Extract post ID from URL: /dashboard/posts/ABC123/
        const match = window.location.pathname.match(/\/posts\/([a-zA-Z0-9]+)/);
        if (match) return `post_${match[1]}`;

        // For new posts, use a generic key
        if (window.location.pathname.includes('/new/')) {
            return 'new_post';
        }

        return null;
    }

    function getDraftKey() {
        const postId = getPostId();
        return postId ? `bear_draft_${postId}` : null;
    }

    function setupAutosave() {
        // This function is only called if autosave is enabled (checked in init)
        const draftKey = getDraftKey();
        if (!draftKey) return;

        $textarea.addEventListener('input', () => {
            clearTimeout(autosaveTimer);
            autosaveTimer = setTimeout(() => {
                saveDraft();
            }, CONFIG.autosave.intervalMs);
        });

        // Clear draft on successful form submit
        const form = $textarea.closest('form');
        if (form) {
            form.addEventListener('submit', () => {
                clearDraft();
                // Update original content on save
                updateOriginalContent();
            });
        }
    }

    function saveDraft() {
        const draftKey = getDraftKey();
        if (!draftKey) return;

        const content = $textarea.value;
        if (!content.trim()) {
            clearDraft();
            return;
        }

        try {
            localStorage.setItem(draftKey, JSON.stringify({
                content: content,
                timestamp: Date.now(),
                url: window.location.pathname
            }));
            showAutosaveIndicator();
        } catch (e) {
            // localStorage might be full or unavailable
        }
    }

    function clearDraft() {
        const draftKey = getDraftKey();
        if (draftKey) {
            try {
                localStorage.removeItem(draftKey);
            } catch (e) {}
        }
    }

    function checkForDraft() {
        // This function is only called if autosave is enabled (checked in init)
        const draftKey = getDraftKey();
        if (!draftKey) return;

        try {
            const saved = localStorage.getItem(draftKey);
            if (!saved) return;

            const draft = JSON.parse(saved);
            const ageHours = (Date.now() - draft.timestamp) / (1000 * 60 * 60);

            // Delete old drafts
            if (ageHours > CONFIG.autosave.maxAgeHours) {
                clearDraft();
                return;
            }

            // Check if current content differs from draft
            const currentContent = $textarea.value;
            if (draft.content === currentContent) {
                return; // No need to restore
            }

            // Show restore dialog
            showRestoreDialog(draft);

        } catch (e) {}
    }

    function showRestoreDialog(draft) {
        const ageMinutes = Math.round((Date.now() - draft.timestamp) / (1000 * 60));
        let ageText;

        if (ageMinutes < 60) {
            ageText = `${ageMinutes} minute${ageMinutes !== 1 ? 's' : ''} ago`;
        } else {
            const hours = Math.round(ageMinutes / 60);
            ageText = `${hours} hour${hours !== 1 ? 's' : ''} ago`;
        }

        const dialog = document.createElement('div');
        dialog.className = 'md-restore-dialog';
        dialog.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: ${isDark ? '#01242e' : 'white'};
            border: 2px solid ${isDark ? '#0969da' : '#0969da'};
            border-radius: 8px;
            padding: 16px 20px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.3);
            z-index: 10004;
            font-family: system-ui, sans-serif;
            max-width: 400px;
        `;

        dialog.innerHTML = `
            <div style="display:flex;align-items:flex-start;gap:12px;">
                <span style="color:#0969da;flex-shrink:0;">${ICONS.info}</span>
                <div>
                    <div style="font-weight:600;color:${isDark ? '#fff' : '#333'};margin-bottom:8px;">
                        Unsaved draft found
                    </div>
                    <div style="font-size:13px;color:${isDark ? '#aaa' : '#666'};margin-bottom:12px;">
                        Last saved ${ageText}
                    </div>
                    <div style="display:flex;gap:8px;">
                        <button class="md-restore-btn" style="
                            padding: 6px 14px;
                            background: #0969da;
                            color: white;
                            border: none;
                            border-radius: 4px;
                            cursor: pointer;
                            font-size: 13px;
                            font-weight: 500;
                        ">Restore</button>
                        <button class="md-discard-btn" style="
                            padding: 6px 14px;
                            background: transparent;
                            color: ${isDark ? '#aaa' : '#666'};
                            border: 1px solid ${isDark ? '#555' : '#ccc'};
                            border-radius: 4px;
                            cursor: pointer;
                            font-size: 13px;
                        ">Discard</button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(dialog);

        dialog.querySelector('.md-restore-btn').addEventListener('click', () => {
            $textarea.value = draft.content;
            $textarea.dispatchEvent(new Event('input', { bubbles: true }));
            // Also update fullscreen textarea if it exists
            const fsTextarea = document.getElementById('md-fullscreen-textarea');
            if (fsTextarea) {
                fsTextarea.value = draft.content;
            }
            // Update original content to match restored draft
            updateOriginalContent();
            dialog.remove();
        });

        dialog.querySelector('.md-discard-btn').addEventListener('click', () => {
            clearDraft();
            dialog.remove();
        });
    }

    function showAutosaveIndicator() {
        let indicator = document.getElementById('md-autosave-indicator');

        if (!indicator) {
            indicator = document.createElement('div');
            indicator.id = 'md-autosave-indicator';
            indicator.style.cssText = `
                position: fixed;
                bottom: 60px;
                right: 20px;
                padding: 4px 10px;
                background: ${isDark ? '#004052' : '#e8f5e9'};
                color: ${isDark ? '#8bc34a' : '#2e7d32'};
                border-radius: 4px;
                font-size: 12px;
                font-family: system-ui, sans-serif;
                opacity: 0;
                transition: opacity 0.3s;
                z-index: 999998;
            `;
            document.body.appendChild(indicator);
        }

        indicator.textContent = 'Draft saved';
        indicator.style.opacity = '1';

        setTimeout(() => {
            indicator.style.opacity = '0';
        }, 2000);
    }

    // ==========================================================================
    // SETTINGS PANEL
    // ==========================================================================

    function showSettingsPanel() {
        // Remove existing panel if any
        const existing = document.getElementById('md-settings-panel');
        if (existing) existing.remove();

        const currentEnabled = getEnabledButtons();

        const overlay = document.createElement('div');
        overlay.id = 'md-settings-panel';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0,0,0,0.5);
            z-index: 10001;
            display: flex;
            align-items: center;
            justify-content: center;
        `;

        const panel = document.createElement('div');
        panel.style.cssText = `
            background: ${isDark ? '#01242e' : 'white'};
            border-radius: 12px;
            padding: 24px;
            max-width: 500px;
            width: 90%;
            max-height: 80vh;
            overflow-y: auto;
            box-shadow: 0 8px 32px rgba(0,0,0,0.4);
            font-family: system-ui, sans-serif;
        `;

        // Header
        const header = document.createElement('div');
        header.style.cssText = `
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
            padding-bottom: 12px;
            border-bottom: 1px solid ${isDark ? '#333' : '#eee'};
        `;
        header.innerHTML = `
            <div>
                <h2 style="margin:0;font-size:18px;color:${isDark ? '#fff' : '#333'};">Toolbar Settings</h2>
                <p style="margin:4px 0 0;font-size:12px;color:${isDark ? '#888' : '#666'};">
                    Choose which buttons to show. Saved per browser.
                </p>
            </div>
        `;

        const closeBtn = document.createElement('button');
        closeBtn.innerHTML = '&times;';
        closeBtn.style.cssText = `
            background: none;
            border: none;
            font-size: 24px;
            cursor: pointer;
            color: ${isDark ? '#888' : '#666'};
            padding: 0;
            line-height: 1;
        `;
        closeBtn.onclick = () => overlay.remove();
        header.appendChild(closeBtn);
        panel.appendChild(header);

        // Categories
        const checkboxes = {};

        Object.entries(BUTTON_CATEGORIES).forEach(([category, buttonIds]) => {
            const section = document.createElement('div');
            section.style.cssText = 'margin-bottom: 16px;';

            const catHeader = document.createElement('div');
            catHeader.style.cssText = `
                font-weight: 600;
                font-size: 13px;
                color: ${isDark ? '#aaa' : '#666'};
                margin-bottom: 8px;
                text-transform: uppercase;
                letter-spacing: 0.5px;
            `;
            catHeader.textContent = category;
            section.appendChild(catHeader);

            const grid = document.createElement('div');
            grid.style.cssText = `
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
                gap: 8px;
            `;

            buttonIds.forEach(buttonId => {
                const buttonDef = BUTTONS[buttonId];
                if (!buttonDef) return;

                const label = document.createElement('label');
                label.style.cssText = `
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 8px 10px;
                    background: ${isDark ? '#002530' : '#f8f9fa'};
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 13px;
                    color: ${isDark ? '#ddd' : '#444'};
                    transition: background 0.15s;
                `;
                label.onmouseover = () => label.style.background = isDark ? '#003545' : '#eef0f2';
                label.onmouseout = () => label.style.background = isDark ? '#002530' : '#f8f9fa';

                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.checked = currentEnabled.includes(buttonId);
                checkbox.style.cssText = 'width: 16px; height: 16px; cursor: pointer;';
                checkboxes[buttonId] = checkbox;

                const iconSpan = document.createElement('span');
                iconSpan.style.cssText = 'display: flex; width: 18px; flex-shrink: 0;';
                if (buttonDef.icon.startsWith('<')) {
                    iconSpan.innerHTML = buttonDef.icon;
                } else {
                    iconSpan.textContent = buttonDef.icon;
                    iconSpan.style.fontWeight = '800';
                }

                const textSpan = document.createElement('span');
                textSpan.textContent = buttonDef.title.replace(/ \(.*\)/, ''); // Remove shortcuts from label

                label.appendChild(checkbox);
                label.appendChild(iconSpan);
                label.appendChild(textSpan);
                grid.appendChild(label);
            });

            section.appendChild(grid);
            panel.appendChild(section);
        });

        // Options Section
        const optionsSection = document.createElement('div');
        optionsSection.style.cssText = 'margin-bottom: 16px;';

        const optionsHeader = document.createElement('div');
        optionsHeader.style.cssText = `
            font-weight: 600;
            font-size: 13px;
            color: ${isDark ? '#aaa' : '#666'};
            margin-bottom: 8px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        `;
        optionsHeader.textContent = 'Options';
        optionsSection.appendChild(optionsHeader);

        const optionsGrid = document.createElement('div');
        optionsGrid.style.cssText = `
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
            gap: 8px;
        `;

        // Character Counter Toggle
        const counterLabel = document.createElement('label');
        counterLabel.style.cssText = `
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 8px 10px;
            background: ${isDark ? '#002530' : '#f8f9fa'};
            border-radius: 6px;
            cursor: pointer;
            font-size: 13px;
            color: ${isDark ? '#ddd' : '#444'};
            transition: background 0.15s;
        `;
        counterLabel.onmouseover = () => counterLabel.style.background = isDark ? '#003545' : '#eef0f2';
        counterLabel.onmouseout = () => counterLabel.style.background = isDark ? '#002530' : '#f8f9fa';

        const counterCheckbox = document.createElement('input');
        counterCheckbox.type = 'checkbox';
        counterCheckbox.checked = isCharCounterEnabled();
        counterCheckbox.style.cssText = 'width: 16px; height: 16px; cursor: pointer;';

        const counterText = document.createElement('span');
        counterText.textContent = 'Show Character Counter';

        counterLabel.appendChild(counterCheckbox);
        counterLabel.appendChild(counterText);
        optionsGrid.appendChild(counterLabel);

        // Fullscreen Button Toggle
        const fullscreenLabel = document.createElement('label');
        fullscreenLabel.style.cssText = `
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 8px 10px;
            background: ${isDark ? '#002530' : '#f8f9fa'};
            border-radius: 6px;
            cursor: pointer;
            font-size: 13px;
            color: ${isDark ? '#ddd' : '#444'};
            transition: background 0.15s;
        `;
        fullscreenLabel.onmouseover = () => fullscreenLabel.style.background = isDark ? '#003545' : '#eef0f2';
        fullscreenLabel.onmouseout = () => fullscreenLabel.style.background = isDark ? '#002530' : '#f8f9fa';

        const fullscreenCheckbox = document.createElement('input');
        fullscreenCheckbox.type = 'checkbox';
        fullscreenCheckbox.checked = isFullscreenButtonEnabled();
        fullscreenCheckbox.style.cssText = 'width: 16px; height: 16px; cursor: pointer;';

        const fullscreenText = document.createElement('span');
        fullscreenText.textContent = 'Show Fullscreen Button';

        fullscreenLabel.appendChild(fullscreenCheckbox);
        fullscreenLabel.appendChild(fullscreenText);
        optionsGrid.appendChild(fullscreenLabel);

        // Action Buttons Toggle (Publish, Save, Preview)
        const actionLabel = document.createElement('label');
        actionLabel.style.cssText = `
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 8px 10px;
            background: ${isDark ? '#002530' : '#f8f9fa'};
            border-radius: 6px;
            cursor: pointer;
            font-size: 13px;
            color: ${isDark ? '#ddd' : '#444'};
            transition: background 0.15s;
        `;
        actionLabel.onmouseover = () => actionLabel.style.background = isDark ? '#003545' : '#eef0f2';
        actionLabel.onmouseout = () => actionLabel.style.background = isDark ? '#002530' : '#f8f9fa';

        const actionCheckbox = document.createElement('input');
        actionCheckbox.type = 'checkbox';
        actionCheckbox.checked = isActionButtonsEnabled();
        actionCheckbox.style.cssText = 'width: 16px; height: 16px; cursor: pointer;';

        const actionText = document.createElement('span');
        actionText.textContent = 'Show Action Buttons';

        actionLabel.appendChild(actionCheckbox);
        actionLabel.appendChild(actionText);
        optionsGrid.appendChild(actionLabel);

        // Autosave Toggle
        const autosaveLabel = document.createElement('label');
        autosaveLabel.style.cssText = `
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 8px 10px;
            background: ${isDark ? '#002530' : '#f8f9fa'};
            border-radius: 6px;
            cursor: pointer;
            font-size: 13px;
            color: ${isDark ? '#ddd' : '#444'};
            transition: background 0.15s;
        `;
        autosaveLabel.onmouseover = () => autosaveLabel.style.background = isDark ? '#003545' : '#eef0f2';
        autosaveLabel.onmouseout = () => autosaveLabel.style.background = isDark ? '#002530' : '#f8f9fa';

        const autosaveCheckbox = document.createElement('input');
        autosaveCheckbox.type = 'checkbox';
        autosaveCheckbox.checked = isAutosaveEnabled();
        autosaveCheckbox.style.cssText = 'width: 16px; height: 16px; cursor: pointer;';

        const autosaveText = document.createElement('span');
        autosaveText.textContent = 'Enable Auto-Save';

        autosaveLabel.appendChild(autosaveCheckbox);
        autosaveLabel.appendChild(autosaveText);
        optionsGrid.appendChild(autosaveLabel);

        optionsSection.appendChild(optionsGrid);
        panel.appendChild(optionsSection);

        // Custom Snippet Section
        const snippetSection = document.createElement('div');
        snippetSection.style.cssText = 'margin-bottom: 16px;';

        const snippetHeader = document.createElement('div');
        snippetHeader.style.cssText = `
            font-weight: 600;
            font-size: 13px;
            color: ${isDark ? '#aaa' : '#666'};
            margin-bottom: 8px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        `;
        snippetHeader.textContent = 'Custom Snippet';
        snippetSection.appendChild(snippetHeader);

        const snippetWrapper = document.createElement('div');
        snippetWrapper.style.cssText = `
            background: ${isDark ? '#002530' : '#f8f9fa'};
            border-radius: 6px;
            padding: 12px;
        `;

        // Enable toggle for custom snippet
        const snippetToggleLabel = document.createElement('label');
        snippetToggleLabel.style.cssText = `
            display: flex;
            align-items: center;
            gap: 8px;
            cursor: pointer;
            font-size: 13px;
            color: ${isDark ? '#ddd' : '#444'};
            margin-bottom: 10px;
        `;

        const snippetCheckbox = document.createElement('input');
        snippetCheckbox.type = 'checkbox';
        snippetCheckbox.checked = isCustomSnippetEnabled();
        snippetCheckbox.style.cssText = 'width: 16px; height: 16px; cursor: pointer;';

        const snippetToggleText = document.createElement('span');
        snippetToggleText.innerHTML = `Show Custom Snippet Button <span style="color:#e91e63;">${ICONS.heart}</span>`;

        snippetToggleLabel.appendChild(snippetCheckbox);
        snippetToggleLabel.appendChild(snippetToggleText);
        snippetWrapper.appendChild(snippetToggleLabel);

        // Text area for custom snippet
        const snippetTextareaLabel = document.createElement('div');
        snippetTextareaLabel.style.cssText = `
            font-size: 12px;
            color: ${isDark ? '#888' : '#666'};
            margin-bottom: 6px;
        `;
        snippetTextareaLabel.textContent = 'Custom text or HTML to insert:';
        snippetWrapper.appendChild(snippetTextareaLabel);

        const snippetTextarea = document.createElement('textarea');
        snippetTextarea.value = getCustomSnippetText();
        snippetTextarea.placeholder = 'Enter your custom text or HTML here...';
        snippetTextarea.style.cssText = `
            width: 100%;
            min-height: 80px;
            padding: 8px;
            border: 1px solid ${isDark ? '#444' : '#ccc'};
            border-radius: 4px;
            background: ${isDark ? '#01242e' : 'white'};
            color: ${isDark ? '#ddd' : '#333'};
            font-family: ui-monospace, monospace;
            font-size: 12px;
            resize: vertical;
            box-sizing: border-box;
        `;
        snippetWrapper.appendChild(snippetTextarea);

        snippetSection.appendChild(snippetWrapper);
        panel.appendChild(snippetSection);

        // Buttons
        const actions = document.createElement('div');
        actions.style.cssText = `
            display: flex;
            gap: 10px;
            justify-content: flex-end;
            margin-top: 20px;
            padding-top: 16px;
            border-top: 1px solid ${isDark ? '#333' : '#eee'};
        `;

        const resetBtn = document.createElement('button');
        resetBtn.textContent = 'Reset to Default';
        resetBtn.style.cssText = `
            padding: 8px 16px;
            background: transparent;
            color: ${isDark ? '#888' : '#666'};
            border: 1px solid ${isDark ? '#444' : '#ccc'};
            border-radius: 6px;
            cursor: pointer;
            font-size: 13px;
        `;
        resetBtn.onclick = () => {
            // Show confirmation dialog
            const confirmReset = confirm('Are you sure you want to reset all toolbar settings to default?');
            if (!confirmReset) return;

            CONFIG.enabledButtons.forEach(id => {
                if (checkboxes[id]) checkboxes[id].checked = true;
            });
            Object.keys(checkboxes).forEach(id => {
                if (!CONFIG.enabledButtons.includes(id)) {
                    checkboxes[id].checked = false;
                }
            });
            counterCheckbox.checked = true; // Default: counter enabled
            fullscreenCheckbox.checked = true; // Default: fullscreen enabled
            actionCheckbox.checked = false; // Default: action buttons disabled
            autosaveCheckbox.checked = CONFIG.autosave.enabled; // Default from config
            snippetCheckbox.checked = false; // Default: custom snippet disabled
            snippetTextarea.value = ''; // Default: empty snippet
        };

        const saveBtn = document.createElement('button');
        saveBtn.textContent = 'Save & Apply';
        saveBtn.style.cssText = `
            padding: 8px 20px;
            background: #0969da;
            color: white;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            font-size: 13px;
            font-weight: 500;
        `;
        saveBtn.onclick = () => {
            // Collect enabled buttons in category order
            const newEnabled = [];
            Object.values(BUTTON_CATEGORIES).flat().forEach(id => {
                if (checkboxes[id] && checkboxes[id].checked) {
                    newEnabled.push(id);
                }
            });

            saveUserSettings({
                enabledButtons: newEnabled,
                showCharCounter: counterCheckbox.checked,
                showFullscreenButton: fullscreenCheckbox.checked,
                showActionButtons: actionCheckbox.checked,
                enableAutosave: autosaveCheckbox.checked,
                showCustomSnippet: snippetCheckbox.checked,
                customSnippetText: snippetTextarea.value
            });
            renderToolbarButtons();

            // Update counter visibility
            const counter = document.getElementById('md-char-counter');
            if (counterCheckbox.checked && !counter) {
                createCharCounter();
            } else if (!counterCheckbox.checked && counter) {
                counter.remove();
            }

            // Update sticky controls visibility
            const stickyControls = document.querySelector('.sticky-controls');
            if (stickyControls) {
                stickyControls.style.display = actionCheckbox.checked ? 'none' : '';
            }

            overlay.remove();

            // Notify user about autosave changes (requires page reload)
            if (autosaveCheckbox.checked !== isAutosaveEnabled()) {
                // Note: Autosave change takes effect on page reload
            }
        };

        actions.appendChild(resetBtn);
        actions.appendChild(saveBtn);
        panel.appendChild(actions);

        overlay.appendChild(panel);
        document.body.appendChild(overlay);

        // Close on overlay click
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) overlay.remove();
        });

        // Close on Escape
        const escHandler = (e) => {
            if (e.key === 'Escape') {
                overlay.remove();
                document.removeEventListener('keydown', escHandler);
            }
        };
        document.addEventListener('keydown', escHandler);
    }

    // ==========================================================================
    // BACK NAVIGATION WITH UNSAVED CHANGES CHECK
    // ==========================================================================

    function handleBackNavigation() {
        if (!hasUnsavedChanges()) {
            navigateBack();
            return;
        }

        // Show unsaved changes dialog
        showUnsavedChangesDialog();
    }

    function showUnsavedChangesDialog() {
        const dialog = document.createElement('div');
        dialog.className = 'md-unsaved-dialog';
        dialog.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0,0,0,0.5);
            z-index: 10003;
            display: flex;
            align-items: center;
            justify-content: center;
        `;

        const panel = document.createElement('div');
        panel.style.cssText = `
            background: ${isDark ? '#01242e' : 'white'};
            border-radius: 12px;
            padding: 24px;
            max-width: 400px;
            width: 90%;
            box-shadow: 0 8px 32px rgba(0,0,0,0.4);
            font-family: system-ui, sans-serif;
        `;

        panel.innerHTML = `
            <div style="display:flex;align-items:flex-start;gap:12px;margin-bottom:20px;">
                <span style="color:#f57c00;flex-shrink:0;">${ICONS.warning}</span>
                <div>
                    <div style="font-weight:600;font-size:16px;color:${isDark ? '#fff' : '#333'};margin-bottom:8px;">
                        Unsaved Changes
                    </div>
                    <div style="font-size:14px;color:${isDark ? '#aaa' : '#666'};">
                        You have unsaved changes. Would you like to save before leaving?
                    </div>
                </div>
            </div>
            <div style="display:flex;gap:10px;justify-content:flex-end;">
                <button class="md-dialog-cancel" style="
                    padding: 8px 16px;
                    background: transparent;
                    color: ${isDark ? '#888' : '#666'};
                    border: 1px solid ${isDark ? '#444' : '#ccc'};
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 13px;
                ">Cancel</button>
                <button class="md-dialog-discard" style="
                    padding: 8px 16px;
                    background: #d32f2f;
                    color: white;
                    border: none;
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 13px;
                ">Discard</button>
                <button class="md-dialog-save" style="
                    padding: 8px 16px;
                    background: #2e7d32;
                    color: white;
                    border: none;
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 13px;
                    font-weight: 500;
                ">Save & Leave</button>
            </div>
        `;

        dialog.appendChild(panel);
        document.body.appendChild(dialog);

        // Cancel - close dialog
        panel.querySelector('.md-dialog-cancel').addEventListener('click', () => {
            dialog.remove();
        });

        // Discard - navigate without saving
        panel.querySelector('.md-dialog-discard').addEventListener('click', () => {
            dialog.remove();
            clearDraft();
            navigateBack();
        });

        // Save & Leave - save then navigate
        panel.querySelector('.md-dialog-save').addEventListener('click', () => {
            dialog.remove();
            saveAndNavigateBack();
        });

        // Close on overlay click
        dialog.addEventListener('click', (e) => {
            if (e.target === dialog) dialog.remove();
        });

        // Close on Escape
        const escHandler = (e) => {
            if (e.key === 'Escape') {
                dialog.remove();
                document.removeEventListener('keydown', escHandler);
            }
        };
        document.addEventListener('keydown', escHandler);
    }

    function navigateBack() {
        if (document.referrer && document.referrer !== window.location.href) {
            window.location.href = document.referrer;
        } else {
            window.history.back();
        }
    }

    function saveAndNavigateBack() {
        const publishInput = document.getElementById('publish');
        if (publishInput) publishInput.value = 'false';

        const form = $textarea.closest('form');
        if (form) {
            // Sync header content
            const headerContent = document.getElementById('header_content');
            const hiddenHeaderContent = document.getElementById('hidden_header_content');
            if (headerContent && hiddenHeaderContent) {
                hiddenHeaderContent.value = headerContent.innerText;
            }

            // Clear draft before saving (programmatic submit doesn't trigger 'submit' event)
            clearDraft();
            updateOriginalContent();

            // Store back navigation URL for after page reload
            try {
                const backUrl = document.referrer && document.referrer !== window.location.href
                    ? document.referrer
                    : null;
                if (backUrl) {
                    sessionStorage.setItem(PENDING_BACK_NAV_KEY, backUrl);
                }
            } catch (e) {}

            // Submit form (which will navigate away)
            form.submit();
        } else {
            navigateBack();
        }
    }

    // ==========================================================================
    // FULLSCREEN EDITOR
    // ==========================================================================

    const FULLSCREEN_KEY = 'bear_fullscreen_mode';

    function setFullscreenFlag(value) {
        try {
            if (value) {
                sessionStorage.setItem(FULLSCREEN_KEY, 'true');
            } else {
                sessionStorage.removeItem(FULLSCREEN_KEY);
            }
        } catch (e) {}
    }

    function getFullscreenFlag() {
        try {
            return sessionStorage.getItem(FULLSCREEN_KEY) === 'true';
        } catch (e) {
            return false;
        }
    }

    function showFullscreenEditor() {
        // Remove existing fullscreen overlay if any
        const existing = document.getElementById('md-fullscreen-overlay');
        if (existing) {
            setFullscreenFlag(false);
            existing.remove();
            return;
        }

        // Set fullscreen flag for persistence across page reloads
        setFullscreenFlag(true);

        // Save current scroll position
        const originalScrollTop = $textarea.scrollTop;
        const originalSelectionStart = $textarea.selectionStart;
        const originalSelectionEnd = $textarea.selectionEnd;

        // Create fullscreen overlay
        const overlay = document.createElement('div');
        overlay.id = 'md-fullscreen-overlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: ${isDark ? '#01242e' : '#ffffff'};
            z-index: 10002;
            display: flex;
            flex-direction: column;
        `;

        // Create fullscreen textarea first (needed for button handlers)
        const fsTextarea = document.createElement('textarea');
        fsTextarea.id = 'md-fullscreen-textarea';
        fsTextarea.value = $textarea.value;
        fsTextarea.style.cssText = `
            flex: 1;
            width: 100%;
            max-width: 900px;
            margin: 0 auto;
            padding: 40px 60px;
            background: ${isDark ? '#01242e' : '#ffffff'};
            color: ${isDark ? '#e0e0e0' : '#333'};
            border: none;
            outline: none;
            resize: none;
            font-family: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace;
            font-size: 16px;
            line-height: 1.7;
            box-sizing: border-box;
        `;

        // Create toolbar header
        const header = document.createElement('div');
        header.style.cssText = `
            display: flex;
            gap: 4px;
            padding: 8px;
            align-items: center;
            flex-wrap: wrap;
            background: ${isDark ? '#004052' : '#eceff4'};
            border-bottom: 1px solid ${isDark ? '#005566' : 'lightgrey'};
            flex-shrink: 0;
        `;

        // Common button style for consistency
        const buttonSize = '32px';
        const buttonStyle = (color) => `
            width: ${buttonSize};
            height: ${buttonSize};
            min-width: ${buttonSize};
            min-height: ${buttonSize};
            flex-shrink: 0;
            background: ${color || (isDark ? '#01242e' : 'white')};
            color: ${color ? 'white' : (isDark ? '#ddd' : '#444')};
            border: 1px solid ${isDark ? '#555' : '#ccc'};
            border-radius: 3px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 0;
        `;

        // Action buttons (Publish, Save, Preview) - always visible in fullscreen
        const actionButtons = [
            { icon: ICONS.publish, title: 'Publish', action: 'publishPost', color: '#0969da' },
            { icon: ICONS.save, title: 'Save as Draft', action: 'savePost', color: '#2e7d32' },
            { icon: ICONS.eye, title: 'Preview', action: 'previewPost', color: '#f57c00' },
        ];

        actionButtons.forEach(actionDef => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.title = actionDef.title;
            btn.innerHTML = actionDef.icon;
            btn.style.cssText = buttonStyle(actionDef.color);
            btn.addEventListener('click', () => {
                // Sync content before action
                $textarea.value = fsTextarea.value;
                $textarea.dispatchEvent(new Event('input', { bubbles: true }));
                handleAction(actionDef.action);
            });
            header.appendChild(btn);
        });

        // Separator after action buttons
        const separator1 = document.createElement('div');
        separator1.style.cssText = `
            width: 1px;
            height: 24px;
            background: ${isDark ? '#555' : '#ccc'};
            margin: 0 8px;
        `;
        header.appendChild(separator1);

        // Add all enabled formatting buttons
        const enabledButtons = getEnabledButtons();
        enabledButtons.forEach(buttonId => {
            const buttonDef = BUTTONS[buttonId];
            if (!buttonDef) return;

            const btn = document.createElement('button');
            btn.type = 'button';
            btn.title = buttonDef.title;

            // Icon or text
            if (buttonDef.icon.startsWith('<svg') || buttonDef.icon.startsWith('<')) {
                btn.innerHTML = buttonDef.icon;
            } else {
                btn.textContent = buttonDef.icon;
                btn.style.fontWeight = '800';
                btn.style.fontFamily = 'system-ui, sans-serif';
            }

            btn.style.cssText = buttonStyle(buttonDef.color);

            btn.addEventListener('click', () => {
                // Temporarily switch the global textarea reference to fullscreen textarea
                const originalTextarea = $textarea;
                $textarea = fsTextarea;
                handleButtonClick(buttonId, buttonDef);
                $textarea = originalTextarea;
                // Sync back to original
                originalTextarea.value = fsTextarea.value;
                originalTextarea.dispatchEvent(new Event('input', { bubbles: true }));
            });

            header.appendChild(btn);
        });

        // Separator before exit button (same position as fullscreen button in normal mode)
        const exitSeparator = document.createElement('div');
        exitSeparator.style.cssText = `
            width: 1px;
            height: 24px;
            background: ${isDark ? '#555' : '#ccc'};
            margin: 0 8px;
        `;
        header.appendChild(exitSeparator);

        // Exit button (at same position as fullscreen button in normal toolbar)
        const exitBtn = document.createElement('button');
        exitBtn.type = 'button';
        exitBtn.title = 'Exit Fullscreen (Escape)';
        exitBtn.innerHTML = ICONS.exitFullscreen;
        exitBtn.style.cssText = buttonStyle();
        // Event listener added after exitFullscreen is defined
        header.appendChild(exitBtn);

        // Back button in fullscreen (after exit button, consistent with normal toolbar)
        const backBtn = document.createElement('button');
        backBtn.type = 'button';
        backBtn.title = 'Back';
        backBtn.innerHTML = ICONS.back;
        backBtn.style.cssText = buttonStyle();
        backBtn.addEventListener('click', () => {
            // Sync content first
            $textarea.value = fsTextarea.value;
            $textarea.dispatchEvent(new Event('input', { bubbles: true }));
            // Exit fullscreen
            setFullscreenFlag(false);
            overlay.remove();
            document.body.style.overflow = '';
            // Then handle navigation with unsaved changes check
            handleBackNavigation();
        });
        header.appendChild(backBtn);

        // Spacer (pushes remaining items to right)
        const spacer = document.createElement('div');
        spacer.style.flex = '1';
        header.appendChild(spacer);
        overlay.appendChild(header);

        // Append textarea to overlay
        overlay.appendChild(fsTextarea);
        document.body.appendChild(overlay);

        // Focus the fullscreen textarea and restore selection
        fsTextarea.focus();
        fsTextarea.setSelectionRange(originalSelectionStart, originalSelectionEnd);
        fsTextarea.scrollTop = originalScrollTop;

        // Sync content back to original textarea
        fsTextarea.addEventListener('input', () => {
            $textarea.value = fsTextarea.value;
            $textarea.dispatchEvent(new Event('input', { bubbles: true }));
        });

        // Exit function
        const exitFullscreen = () => {
            setFullscreenFlag(false);

            // Sync final content
            $textarea.value = fsTextarea.value;
            $textarea.dispatchEvent(new Event('input', { bubbles: true }));

            // Restore selection
            $textarea.setSelectionRange(fsTextarea.selectionStart, fsTextarea.selectionEnd);

            overlay.remove();
            $textarea.focus();
        };

        // Exit button click
        exitBtn.addEventListener('click', exitFullscreen);

        // Escape key to exit
        const escHandler = (e) => {
            if (e.key === 'Escape') {
                e.preventDefault();
                exitFullscreen();
                document.removeEventListener('keydown', escHandler);
            }
        };
        document.addEventListener('keydown', escHandler);

        // Prevent body scroll
        document.body.style.overflow = 'hidden';
        overlay.addEventListener('remove', () => {
            document.body.style.overflow = '';
        });

        // Clean up on overlay remove
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.removedNodes.forEach((node) => {
                    if (node === overlay) {
                        document.body.style.overflow = '';
                        document.removeEventListener('keydown', escHandler);
                        observer.disconnect();
                    }
                });
            });
        });
        observer.observe(document.body, { childList: true });

        // Setup keyboard shortcuts for fullscreen textarea
        fsTextarea.addEventListener('keydown', (e) => {
            const ctrl = e.ctrlKey || e.metaKey;
            if (!ctrl) return;

            for (const [id, def] of Object.entries(BUTTONS)) {
                if (!def.shortcut) continue;
                if (!enabledButtons.includes(id)) continue;

                if (def.shortcut.key === e.key.toLowerCase() && def.shortcut.ctrl === ctrl) {
                    e.preventDefault();
                    // Temporarily switch textarea reference
                    const originalTextarea = $textarea;
                    $textarea = fsTextarea;
                    handleButtonClick(id, def);
                    $textarea = originalTextarea;
                    // Sync back
                    originalTextarea.value = fsTextarea.value;
                    originalTextarea.dispatchEvent(new Event('input', { bubbles: true }));
                    return;
                }
            }
        });
    }

    // Check if we should restore fullscreen mode on page load
    function checkFullscreenRestore() {
        if (getFullscreenFlag()) {
            // Small delay to ensure DOM is ready
            setTimeout(() => {
                showFullscreenEditor();
            }, 100);
        }
    }

    // ==========================================================================
    // TEXT INSERTION (Undo-compatible)
    // ==========================================================================

    function insertText(text) {
        $textarea.focus();

        // Use execCommand to preserve undo history
        // This is deprecated but still works and is the only way to preserve undo
        if (!document.execCommand('insertText', false, text)) {
            // Fallback for browsers where execCommand doesn't work
            const start = $textarea.selectionStart;
            const end = $textarea.selectionEnd;
            const before = $textarea.value.substring(0, start);
            const after = $textarea.value.substring(end);
            $textarea.value = before + text + after;
            $textarea.selectionStart = $textarea.selectionEnd = start + text.length;
        }

        $textarea.dispatchEvent(new Event('input', { bubbles: true }));
    }

    function insertMarkdown(before, after, lineStart = false) {
        const start = $textarea.selectionStart;
        const end = $textarea.selectionEnd;
        const selected = $textarea.value.substring(start, end);

        $textarea.focus();

        if (lineStart) {
            // For line-start syntax, we need to go to the beginning of the line
            const textBefore = $textarea.value.substring(0, start);
            const lineStartPos = textBefore.lastIndexOf('\n') + 1;
            const textBeforeCursor = $textarea.value.substring(lineStartPos, start);

            // Select from line start to end of selection
            $textarea.setSelectionRange(lineStartPos, end);

            // Insert the new text
            const newText = before + textBeforeCursor + selected + after;
            insertText(newText);

            // Position cursor
            const newPos = lineStartPos + before.length + textBeforeCursor.length + selected.length + after.length;
            $textarea.setSelectionRange(newPos, newPos);
        } else {
            // Regular wrap
            const newText = before + selected + after;
            insertText(newText);

            // Position cursor
            if (selected) {
                const newPos = start + newText.length;
                $textarea.setSelectionRange(newPos, newPos);
            } else {
                const newPos = start + before.length;
                $textarea.setSelectionRange(newPos, newPos);
            }
        }
    }

    async function insertLink() {
        const start = $textarea.selectionStart;
        const end = $textarea.selectionEnd;
        const selected = $textarea.value.substring(start, end);

        // Try to get URL from clipboard
        let url = '';
        try {
            const clip = await navigator.clipboard.readText();
            if (clip.trim().match(/^https?:\/\//)) {
                url = clip.trim();
            }
        } catch (e) {}

        $textarea.focus();

        const linkText = selected || 'Link Text';
        const newText = `[${linkText}](${url})`;
        insertText(newText);

        // Position cursor appropriately
        if (!selected && !url) {
            // Select "Link Text" so user can type
            $textarea.setSelectionRange(start + 1, start + 1 + linkText.length);
        } else if (!url) {
            // Position cursor in URL area
            $textarea.setSelectionRange(start + selected.length + 3, start + selected.length + 3);
        }
    }

    function insertCodeBlock() {
        const language = prompt('Language (e.g., javascript, python, css):') || '';
        const start = $textarea.selectionStart;
        const end = $textarea.selectionEnd;
        const selected = $textarea.value.substring(start, end);

        $textarea.focus();

        const before = '\n```' + language + '\n';
        const after = '\n```\n';
        const newText = before + selected + after;
        insertText(newText);

        // Position cursor inside the code block
        if (!selected) {
            const newPos = start + before.length;
            $textarea.setSelectionRange(newPos, newPos);
        }
    }

    function insertFootnote() {
        // Count existing footnotes to suggest next number
        const content = $textarea.value;
        const footnoteMatches = content.match(/\[\^\d+\]/g) || [];
        const usedNumbers = footnoteMatches.map(m => parseInt(m.match(/\d+/)[0]));
        const nextNumber = usedNumbers.length > 0 ? Math.max(...usedNumbers) + 1 : 1;

        const footnoteId = prompt('Footnote ID (number or name):', nextNumber.toString());
        if (!footnoteId) return;

        const start = $textarea.selectionStart;
        const selected = $textarea.value.substring(start, $textarea.selectionEnd);

        $textarea.focus();

        // Insert footnote reference at cursor
        const ref = `[^${footnoteId}]`;
        insertText(ref);

        // Add footnote definition at the end if it doesn't exist
        const defPattern = new RegExp(`\\[\\^${footnoteId}\\]:`);
        if (!defPattern.test(content)) {
            const definition = `\n\n[^${footnoteId}]: ${selected || 'Footnote text here'}`;
            const currentPos = $textarea.selectionStart;

            // Move to end and add definition
            $textarea.setSelectionRange($textarea.value.length, $textarea.value.length);
            insertText(definition);

            // Return cursor to original position (after the reference)
            $textarea.setSelectionRange(currentPos, currentPos);
        }
    }

    // ==========================================================================
    // BUTTON & ACTION HANDLERS
    // ==========================================================================

    function handleButtonClick(id, def) {
        if (def.action) {
            handleAction(def.action);
        } else if (def.syntax) {
            insertMarkdown(def.syntax[0], def.syntax[1], def.lineStart);
        }
    }

    function handleAction(action) {
        switch (action) {
            case 'upload':
                document.getElementById('upload-image')?.click();
                break;

            case 'gallery': {
                const pathParts = window.location.pathname.split('/').filter(Boolean);
                const blogSlug = pathParts[0] || '';
                window.open(`/${blogSlug}/dashboard/media/`, '_blank');
                break;
            }

            case 'preview':
                document.getElementById('preview')?.click();
                break;

            case 'help':
                window.open('https://herman.bearblog.dev/markdown-cheatsheet/', '_blank');
                break;

            case 'insertLink':
                insertLink();
                break;

            case 'insertCodeBlock':
                insertCodeBlock();
                break;

            case 'insertFootnote':
                insertFootnote();
                break;

            case 'settings':
                showSettingsPanel();
                break;

            case 'fullscreen':
                showFullscreenEditor();
                break;

            case 'publishPost': {
                const publishInput = document.getElementById('publish');
                if (publishInput) publishInput.value = 'true';
                const form = $textarea.closest('form');
                if (form) {
                    // Trigger the hidden header content update
                    const headerContent = document.getElementById('header_content');
                    const hiddenHeaderContent = document.getElementById('hidden_header_content');
                    if (headerContent && hiddenHeaderContent) {
                        hiddenHeaderContent.value = headerContent.innerText;
                    }
                    // Clear draft before submitting since content is being saved
                    clearDraft();
                    form.submit();
                }
                break;
            }

            case 'savePost': {
                const publishInput = document.getElementById('publish');
                if (publishInput) publishInput.value = 'false';
                const form = $textarea.closest('form');
                if (form) {
                    // Trigger the hidden header content update
                    const headerContent = document.getElementById('header_content');
                    const hiddenHeaderContent = document.getElementById('hidden_header_content');
                    if (headerContent && hiddenHeaderContent) {
                        hiddenHeaderContent.value = headerContent.innerText;
                    }
                    // Clear draft before submitting since content is being saved
                    clearDraft();
                    form.submit();
                }
                break;
            }

            case 'previewPost': {
                // Save first via AJAX, then open preview
                const publishInput = document.getElementById('publish');
                if (publishInput) publishInput.value = 'false';
                const form = $textarea.closest('form');
                if (form) {
                    // Sync header content
                    const headerContent = document.getElementById('header_content');
                    const hiddenHeaderContent = document.getElementById('hidden_header_content');
                    if (headerContent && hiddenHeaderContent) {
                        hiddenHeaderContent.value = headerContent.innerText;
                    }

                    // Save via AJAX without page reload
                    const formData = new FormData(form);
                    fetch(form.action || window.location.href, {
                        method: 'POST',
                        body: formData
                    }).then(response => {
                        if (response.ok) {
                            // Clear local draft after successful save
                            clearDraft();
                            // Open preview after save completes
                            document.getElementById('preview')?.click();
                        } else {
                            // Fallback: just open preview without save
                            document.getElementById('preview')?.click();
                        }
                    }).catch(() => {
                        // On network error, still try to preview
                        document.getElementById('preview')?.click();
                    });
                } else {
                    // No form found, just open preview
                    document.getElementById('preview')?.click();
                }
                break;
            }
        }
    }

    // ==========================================================================
    // KEYBOARD SHORTCUTS
    // ==========================================================================

    function setupKeyboardShortcuts() {
        $textarea.addEventListener('keydown', (e) => {
            const ctrl = e.ctrlKey || e.metaKey;

            if (!ctrl) return;

            const enabledButtons = getEnabledButtons();

            // Find button with matching shortcut
            for (const [id, def] of Object.entries(BUTTONS)) {
                if (!def.shortcut) continue;
                if (!enabledButtons.includes(id)) continue;

                if (def.shortcut.key === e.key.toLowerCase() && def.shortcut.ctrl === ctrl) {
                    e.preventDefault();
                    handleButtonClick(id, def);
                    return;
                }
            }
        });
    }

    // ==========================================================================
    // INIT ON LOAD
    // ==========================================================================

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
