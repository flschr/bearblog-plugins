/**
 * Bear Blog Markdown Toolbar v3.0
 *
 * Features:
 * - Modular button registry (easily extensible)
 * - Configurable buttons (show/hide individual buttons)
 * - Undo-compatible text insertion (execCommand)
 * - Fullscreen editing mode
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
            'gallery',
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
        image: '<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"><path d="M10.3 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10l-3.1-3.1a2 2 0 0 0-2.814.014L6 21"/><path d="m14 19.5 3-3 3 3"/><path d="M17 22v-5.5"/><circle cx="9" cy="9" r="2"/></svg>',
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
        gallery: '<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"><rect width="8" height="18" x="3" y="3" rx="1"/><path d="M7 3v18"/><path d="M20.4 18.9c.2.5-.1 1.1-.6 1.3l-1.9.7c-.5.2-1.1-.1-1.3-.6L11.1 5.1c-.2-.5.1-1.1.6-1.3l1.9-.7c.5-.2 1.1.1 1.3.6Z"/></svg>',
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
        checkmark: '<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"><path d="M20 6 9 17l-5-5"/></svg>',
        trash: '<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>',
    };

    // Button categories for settings panel
    const BUTTON_CATEGORIES = {
        'Formatting': ['bold', 'italic', 'strikethrough', 'mark'],
        'Headings': ['h1', 'h2', 'h3'],
        'Links & Media': ['link', 'image', 'gallery'],
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
        gallery: {
            icon: ICONS.gallery,
            title: 'Media Gallery',
            action: 'gallery'
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
        { icon: ICONS.settings, text: 'Toolbar Settings', action: 'settings' },
    ];

    // ==========================================================================
    // STATE
    // ==========================================================================

    let isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
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

    function isAiAltTextEnabled() {
        const userSettings = loadUserSettings();
        if (userSettings && typeof userSettings.enableAiAltText === 'boolean') {
            return userSettings.enableAiAltText;
        }
        return false; // Default: disabled
    }

    function getOpenAiApiKey() {
        const userSettings = loadUserSettings();
        if (userSettings && typeof userSettings.openAiApiKey === 'string') {
            return userSettings.openAiApiKey;
        }
        return ''; // Default: empty
    }

    function getAltTextLanguage() {
        const userSettings = loadUserSettings();
        if (userSettings && typeof userSettings.altTextLanguage === 'string') {
            return userSettings.altTextLanguage;
        }
        return ''; // Default: empty (English)
    }

    // ==========================================================================
    // AI ALT-TEXT GENERATION (OpenAI Vision)
    // ==========================================================================

    // Debug logging helper
    function debugLog(stage, data) {
        const timestamp = new Date().toISOString().substr(11, 12);
        console.log(`[ALT-TEXT ${timestamp}] ${stage}:`, data);
    }

    async function generateAltTextWithOpenAI(imageData, isBase64 = false) {
        const apiKey = getOpenAiApiKey();
        const language = getAltTextLanguage();
        debugLog('API Check', { hasKey: !!apiKey, keyLength: apiKey?.length, language });

        if (!apiKey) {
            console.warn('OpenAI API key not configured');
            return null;
        }

        const imageUrl = isBase64 ? imageData : imageData;
        debugLog('Image URL', { isBase64, urlPreview: imageUrl.substring(0, 100) + '...' });

        // Build language instruction
        const languageInstruction = language
            ? `Write the alt-text in ${language.toUpperCase()} language.`
            : '';
        const systemPrompt = `You are an accessibility expert. Generate concise, descriptive alt-text for images. The alt-text should be 1-2 sentences, describing the key visual elements and context. Do not start with "Image of" or "Picture of". Just describe what is shown. ${languageInstruction} Respond with only the alt-text, no quotes or extra formatting.`;

        try {
            debugLog('Sending request', { model: 'gpt-4o-mini' });

            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    model: 'gpt-4o-mini',
                    messages: [
                        {
                            role: 'system',
                            content: systemPrompt
                        },
                        {
                            role: 'user',
                            content: [
                                {
                                    type: 'image_url',
                                    image_url: {
                                        url: imageUrl,
                                        detail: 'low'
                                    }
                                },
                                {
                                    type: 'text',
                                    text: 'Generate alt-text for this image.'
                                }
                            ]
                        }
                    ],
                    max_tokens: 150
                })
            });

            debugLog('Response status', { ok: response.ok, status: response.status });

            if (!response.ok) {
                const error = await response.json();
                debugLog('API Error', error);
                console.error('OpenAI API error:', error);
                return null;
            }

            const data = await response.json();
            const altText = data.choices?.[0]?.message?.content?.trim();
            debugLog('Generated alt-text', { altText, length: altText?.length });
            return altText || null;
        } catch (error) {
            debugLog('Exception', { message: error.message, stack: error.stack });
            console.error('Failed to generate alt-text:', error);
            return null;
        }
    }

    function showAltTextNotification(message, isError = false, altText = null) {
        // Remove existing notification if any
        const existing = document.getElementById('md-alttext-notification');
        if (existing) existing.remove();

        const notification = document.createElement('div');
        notification.id = 'md-alttext-notification';

        const isClickable = altText !== null;
        const bgColor = isError ? '#d32f2f' : (isClickable ? '#2e7d32' : (isDark ? '#004052' : '#0969da'));

        notification.style.cssText = `
            position: fixed;
            bottom: 60px;
            right: 20px;
            padding: 12px 16px;
            border-radius: 8px;
            font-size: 13px;
            font-family: system-ui, sans-serif;
            z-index: 999999;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            gap: 8px;
            transition: opacity 0.3s;
            background: ${bgColor};
            color: white;
            ${isClickable ? 'cursor: pointer;' : ''}
        `;

        const icon = isError ? ICONS.caution : (isClickable ? ICONS.checkmark : ICONS.info);
        notification.innerHTML = `
            <span style="display:flex;">${icon}</span>
            <span>${message}</span>
            ${isClickable ? '<span style="opacity:0.7;font-size:11px;margin-left:8px;">(click to copy again)</span>' : ''}
        `;

        // If clickable, add click handler to copy alt-text again
        if (isClickable && altText) {
            notification.addEventListener('click', async () => {
                try {
                    await navigator.clipboard.writeText(altText);
                    notification.querySelector('span:last-child').textContent = '✓ Copied!';
                    setTimeout(() => {
                        notification.querySelector('span:last-child').textContent = '(click to copy again)';
                    }, 1000);
                } catch (e) {
                    debugLog('Clipboard error on click', e);
                }
            });
        }

        document.body.appendChild(notification);

        // Auto-remove after longer time if clickable (user might want to use it)
        const timeout = isClickable ? 10000 : 4000;
        setTimeout(() => {
            notification.style.opacity = '0';
            setTimeout(() => notification.remove(), 300);
        }, timeout);
    }

    // Lock editor during alt-text generation to prevent user input interference
    let editorLocked = false;

    function lockEditor() {
        if (editorLocked) return;

        const textarea = document.getElementById('body_content');
        if (!textarea) return;

        editorLocked = true;
        debugLog('Editor locked', 'preventing user input during alt-text generation');

        // Store cursor position before locking
        textarea.dataset.lockedSelectionStart = textarea.selectionStart;
        textarea.dataset.lockedSelectionEnd = textarea.selectionEnd;

        // Create overlay
        const overlay = document.createElement('div');
        overlay.id = 'md-editor-lock-overlay';
        overlay.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.15);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 999998;
            pointer-events: all;
            cursor: wait;
        `;

        // Create spinner and message
        const message = document.createElement('div');
        message.style.cssText = `
            background: ${isDark ? '#1a1a1a' : 'white'};
            color: ${isDark ? '#e0e0e0' : '#333'};
            padding: 16px 24px;
            border-radius: 8px;
            font-size: 14px;
            font-family: system-ui, sans-serif;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            gap: 12px;
        `;
        message.innerHTML = `
            <svg width="20" height="20" viewBox="0 0 24 24" style="animation: md-spin 1s linear infinite;">
                <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" fill="none" stroke-dasharray="31.4 31.4" stroke-linecap="round"/>
            </svg>
            <span>Generating alt-text...</span>
        `;

        // Add spin animation if not already present
        if (!document.getElementById('md-spin-style')) {
            const style = document.createElement('style');
            style.id = 'md-spin-style';
            style.textContent = `@keyframes md-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`;
            document.head.appendChild(style);
        }

        overlay.appendChild(message);

        // Position overlay relative to textarea
        const wrapper = textarea.parentElement;
        if (wrapper) {
            const originalPosition = window.getComputedStyle(wrapper).position;
            if (originalPosition === 'static') {
                wrapper.style.position = 'relative';
                wrapper.dataset.originalPosition = originalPosition;
            }
            wrapper.appendChild(overlay);
        }

        // Make textarea readonly and prevent focus
        textarea.readOnly = true;
        textarea.style.pointerEvents = 'none';
    }

    function unlockEditor() {
        if (!editorLocked) return;

        const textarea = document.getElementById('body_content');
        const overlay = document.getElementById('md-editor-lock-overlay');

        if (overlay) {
            overlay.remove();
        }

        if (textarea) {
            textarea.readOnly = false;
            textarea.style.pointerEvents = '';

            // Restore original wrapper position if changed
            const wrapper = textarea.parentElement;
            if (wrapper && wrapper.dataset.originalPosition) {
                wrapper.style.position = wrapper.dataset.originalPosition;
                delete wrapper.dataset.originalPosition;
            }

            // Restore cursor position
            const start = parseInt(textarea.dataset.lockedSelectionStart || '0', 10);
            const end = parseInt(textarea.dataset.lockedSelectionEnd || '0', 10);
            textarea.setSelectionRange(start, end);
            delete textarea.dataset.lockedSelectionStart;
            delete textarea.dataset.lockedSelectionEnd;
        }

        editorLocked = false;
        debugLog('Editor unlocked', 'user input restored');
    }

    // Convert File to base64 data URL
    function fileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    // Store pending alt-text for auto-replacement
    let pendingAltText = null;
    let lastTextareaValue = '';

    // Watch textarea for BearBlog's image insertion and replace alt-text
    function setupAltTextReplacement() {
        const textarea = document.getElementById('body_content');
        if (!textarea) return;

        // Store initial value
        lastTextareaValue = textarea.value;

        // Listen for input events to detect when BearBlog inserts image markdown
        textarea.addEventListener('input', () => {
            if (!pendingAltText) return;

            const newValue = textarea.value;
            const oldValue = lastTextareaValue;

            // Check if new content was added (BearBlog inserted something)
            if (newValue.length > oldValue.length) {
                // Look for newly inserted image markdown: ![something](url)
                // The "something" is typically the filename that we want to replace
                const imageMarkdownRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;

                // Find all image markdowns in new value
                const newMatches = [...newValue.matchAll(imageMarkdownRegex)];
                const oldMatches = [...oldValue.matchAll(imageMarkdownRegex)];

                // If there's a new image markdown that wasn't in old value
                if (newMatches.length > oldMatches.length) {
                    // Find the new one (last one is usually the newly inserted)
                    const newMatch = newMatches[newMatches.length - 1];
                    const fullMatch = newMatch[0];
                    const currentAlt = newMatch[1];
                    const url = newMatch[2];

                    debugLog('New image detected', { currentAlt, url, pendingAltText });

                    // Replace the alt-text with the generated one
                    const newImageMarkdown = `![${pendingAltText}](${url})`;
                    const updatedValue = newValue.replace(fullMatch, newImageMarkdown);

                    if (updatedValue !== newValue) {
                        // Store alt-text before clearing
                        const insertedAltText = pendingAltText;

                        // Clear pending alt-text BEFORE dispatching event to prevent re-triggering
                        pendingAltText = null;

                        textarea.value = updatedValue;
                        lastTextareaValue = updatedValue; // Update before dispatch
                        debugLog('Alt-text replaced', { from: currentAlt, to: insertedAltText });
                        showAltTextNotification('✓ Alt-text inserted automatically', false, insertedAltText);

                        // Also update fullscreen textarea if it exists
                        const fsTextarea = document.getElementById('md-fullscreen-textarea');
                        if (fsTextarea) {
                            fsTextarea.value = updatedValue;
                        }

                        // Trigger input event for BearBlog to detect change
                        textarea.dispatchEvent(new Event('input', { bubbles: true }));
                        return; // Exit early since we already updated lastTextareaValue
                    }

                    // Clear pending alt-text if replacement didn't happen
                    pendingAltText = null;
                }
            }

            lastTextareaValue = textarea.value;
        });

        debugLog('Alt-text replacement watcher setup', 'success');
    }

    // Process an image file for alt-text generation
    async function processImageForAltText(file, source = 'unknown') {
        debugLog('Processing image', {
            source,
            name: file?.name,
            type: file?.type,
            size: file?.size
        });

        if (!file || !file.type.startsWith('image/')) {
            debugLog('Not an image file', file?.type);
            return;
        }

        // Lock editor to prevent user input during generation
        lockEditor();

        try {
            // Convert file to base64 (parallel to BearBlog's upload)
            debugLog('Converting to base64', 'started');
            const base64Data = await fileToBase64(file);
            debugLog('Base64 ready', { length: base64Data.length });

            // Send to OpenAI
            const altText = await generateAltTextWithOpenAI(base64Data, true);

            if (altText) {
                // Store for auto-replacement when BearBlog inserts the image
                pendingAltText = altText;
                debugLog('Pending alt-text set', altText);

                // Unlock editor immediately after alt-text is generated
                // (user can continue working while BearBlog uploads the image)
                unlockEditor();

                // Also copy to clipboard as fallback
                try {
                    await navigator.clipboard.writeText(altText);
                    debugLog('Copied to clipboard', altText);
                } catch (clipboardError) {
                    debugLog('Clipboard error', clipboardError);
                }

                // Clear pending alt-text after timeout (in case BearBlog upload fails)
                setTimeout(() => {
                    if (pendingAltText === altText) {
                        debugLog('Pending alt-text cleared (timeout)', altText);
                        pendingAltText = null;
                    }
                }, 30000); // 30 second timeout
            } else {
                showAltTextNotification('Failed to generate alt-text', true);
                unlockEditor();
            }
        } catch (error) {
            debugLog('Processing error', { message: error.message, stack: error.stack });
            showAltTextNotification('Error processing image', true);
            unlockEditor();
        }
    }

    function setupImageUploadObserver() {
        debugLog('Setup', {
            aiEnabled: isAiAltTextEnabled(),
            hasApiKey: !!getOpenAiApiKey()
        });

        if (!isAiAltTextEnabled() || !getOpenAiApiKey()) {
            debugLog('Setup skipped', 'AI alt-text disabled or no API key');
            return;
        }

        // Find the BearBlog file input (note: "upload-image" is just an <a> link, the actual input has id="file")
        const uploadInput = document.getElementById('file');
        debugLog('Upload input found', !!uploadInput);

        if (uploadInput) {
            // Listen for file selection - this fires when user selects files via the file dialog
            uploadInput.addEventListener('change', async (e) => {
                const file = e.target.files?.[0];
                debugLog('File input change', { hasFile: !!file, fileName: file?.name });
                if (file && file.type.startsWith('image/')) {
                    await processImageForAltText(file, 'file-input');
                }
            });

            debugLog('Upload listener attached', 'success');
        } else {
            debugLog('Upload input not found', 'will retry on mutation');

            // If upload input doesn't exist yet, watch for it
            const observer = new MutationObserver((mutations, obs) => {
                const input = document.getElementById('file');
                if (input) {
                    debugLog('Upload input found via observer', 'attaching listener');
                    obs.disconnect();
                    setupImageUploadObserver(); // Re-run setup
                }
            });
            observer.observe(document.body, { childList: true, subtree: true });
        }

        // Listen for drag & drop on window (BearBlog uses window-level drop handler)
        debugLog('Setting up window drop listener', true);
        window.addEventListener('drop', async (e) => {
            debugLog('Window drop event', {
                hasFiles: e.dataTransfer?.files?.length > 0,
                fileCount: e.dataTransfer?.files?.length,
                types: Array.from(e.dataTransfer?.types || [])
            });

            const file = e.dataTransfer?.files?.[0];
            if (file && file.type.startsWith('image/')) {
                await processImageForAltText(file, 'drag-drop');
            }
        });
        debugLog('Window drop listener attached', 'success');

        // Also listen for paste events on the textarea
        const textarea = document.getElementById('body_content');
        if (textarea) {
            textarea.addEventListener('paste', async (e) => {
                debugLog('Paste event', {
                    hasItems: e.clipboardData?.items?.length > 0,
                    types: Array.from(e.clipboardData?.types || [])
                });

                const items = e.clipboardData?.items;
                if (items) {
                    for (const item of items) {
                        if (item.type.startsWith('image/')) {
                            const file = item.getAsFile();
                            if (file) {
                                await processImageForAltText(file, 'paste');
                                break;
                            }
                        }
                    }
                }
            });

            debugLog('Paste listener attached', 'success');
        }
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
        setupKeyboardShortcuts();
        setupImageUploadObserver();
        setupAltTextReplacement();

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

        const showFullscreenButton = isFullscreenButtonEnabled();
        const showActionButtons = isActionButtonsEnabled();

        // Back button first (leftmost position)
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

        // Add action buttons (Publish, Save, Preview, Delete) if enabled
        if (showActionButtons) {
            const actionButtons = [
                { id: 'actionPublish', icon: ICONS.publish, title: 'Publish', action: 'publishPost', color: '#0969da' },
                { id: 'actionSave', icon: ICONS.save, title: 'Save as Draft', action: 'savePost', color: '#2e7d32' },
                { id: 'actionPreview', icon: ICONS.eye, title: 'Preview', action: 'previewPost', color: '#f57c00' },
                { id: 'actionDelete', icon: ICONS.trash, title: 'Delete', action: 'deletePost', color: '#d32f2f' },
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

        // Custom snippet button - before spacer
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

        // Spacer (pushes following buttons to the right)
        const spacer = document.createElement('div');
        spacer.style.flex = '1';
        $toolbar.appendChild(spacer);

        // Fullscreen button (right side, before settings)
        if (showFullscreenButton) {
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

        // Menu button (rightmost)
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
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'md-btn md-menu-btn';
        btn.innerHTML = ICONS.settings;
        btn.title = 'Toolbar Settings';
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

        btn.addEventListener('click', () => handleAction('settings'));

        return btn;
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

        // AI Alt-Text Section
        const aiSection = document.createElement('div');
        aiSection.style.cssText = 'margin-bottom: 16px;';

        const aiHeader = document.createElement('div');
        aiHeader.style.cssText = `
            font-weight: 600;
            font-size: 13px;
            color: ${isDark ? '#aaa' : '#666'};
            margin-bottom: 8px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        `;
        aiHeader.textContent = 'AI Alt-Text (OpenAI)';
        aiSection.appendChild(aiHeader);

        const aiWrapper = document.createElement('div');
        aiWrapper.style.cssText = `
            background: ${isDark ? '#002530' : '#f8f9fa'};
            border-radius: 6px;
            padding: 12px;
        `;

        // Enable toggle for AI alt-text
        const aiToggleLabel = document.createElement('label');
        aiToggleLabel.style.cssText = `
            display: flex;
            align-items: center;
            gap: 8px;
            cursor: pointer;
            font-size: 13px;
            color: ${isDark ? '#ddd' : '#444'};
            margin-bottom: 10px;
        `;

        const aiCheckbox = document.createElement('input');
        aiCheckbox.type = 'checkbox';
        aiCheckbox.checked = isAiAltTextEnabled();
        aiCheckbox.style.cssText = 'width: 16px; height: 16px; cursor: pointer;';

        const aiToggleText = document.createElement('span');
        aiToggleText.textContent = 'Auto-generate alt-text for uploaded images';

        aiToggleLabel.appendChild(aiCheckbox);
        aiToggleLabel.appendChild(aiToggleText);
        aiWrapper.appendChild(aiToggleLabel);

        // API Key input
        const apiKeyLabel = document.createElement('div');
        apiKeyLabel.style.cssText = `
            font-size: 12px;
            color: ${isDark ? '#888' : '#666'};
            margin-bottom: 6px;
        `;
        apiKeyLabel.textContent = 'OpenAI API Key:';
        aiWrapper.appendChild(apiKeyLabel);

        const apiKeyInput = document.createElement('input');
        apiKeyInput.type = 'password';
        apiKeyInput.value = getOpenAiApiKey();
        apiKeyInput.placeholder = 'sk-...';
        apiKeyInput.style.cssText = `
            width: 100%;
            padding: 8px;
            border: 1px solid ${isDark ? '#444' : '#ccc'};
            border-radius: 4px;
            background: ${isDark ? '#01242e' : 'white'};
            color: ${isDark ? '#ddd' : '#333'};
            font-family: ui-monospace, monospace;
            font-size: 12px;
            box-sizing: border-box;
        `;
        aiWrapper.appendChild(apiKeyInput);

        // Language input
        const langLabel = document.createElement('div');
        langLabel.style.cssText = `
            font-size: 12px;
            color: ${isDark ? '#888' : '#666'};
            margin-top: 10px;
            margin-bottom: 6px;
        `;
        langLabel.textContent = 'Alt-Text Language (optional):';
        aiWrapper.appendChild(langLabel);

        const langInput = document.createElement('input');
        langInput.type = 'text';
        langInput.value = getAltTextLanguage();
        langInput.placeholder = 'e.g. de, en, fr, it';
        langInput.style.cssText = `
            width: 100%;
            padding: 8px;
            border: 1px solid ${isDark ? '#444' : '#ccc'};
            border-radius: 4px;
            background: ${isDark ? '#01242e' : 'white'};
            color: ${isDark ? '#ddd' : '#333'};
            font-family: ui-monospace, monospace;
            font-size: 12px;
            box-sizing: border-box;
        `;
        aiWrapper.appendChild(langInput);

        // Info text
        const aiInfo = document.createElement('div');
        aiInfo.style.cssText = `
            font-size: 11px;
            color: ${isDark ? '#666' : '#999'};
            margin-top: 8px;
            line-height: 1.4;
        `;
        aiInfo.innerHTML = 'Uses OpenAI GPT-4o to generate descriptive alt-text for accessibility. ' +
            'Your API key is stored locally in your browser. ' +
            'Leave language empty for English. ' +
            '<a href="https://platform.openai.com/api-keys" target="_blank" style="color: #0969da;">Get an API key</a>';
        aiWrapper.appendChild(aiInfo);

        aiSection.appendChild(aiWrapper);
        panel.appendChild(aiSection);

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
            snippetCheckbox.checked = false; // Default: custom snippet disabled
            snippetTextarea.value = ''; // Default: empty snippet
            aiCheckbox.checked = false; // Default: AI alt-text disabled
            apiKeyInput.value = ''; // Default: no API key
            langInput.value = ''; // Default: no language (English)
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
                showCustomSnippet: snippetCheckbox.checked,
                customSnippetText: snippetTextarea.value,
                enableAiAltText: aiCheckbox.checked,
                openAiApiKey: apiKeyInput.value,
                altTextLanguage: langInput.value.trim().toLowerCase()
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
    // LOADING OVERLAY (prevents flash during form submit)
    // ==========================================================================

    function showLoadingOverlay() {
        // Only show if in fullscreen mode to prevent the flash
        const fsOverlay = document.getElementById('md-fullscreen-overlay');
        if (!fsOverlay) return;

        const loadingOverlay = document.createElement('div');
        loadingOverlay.id = 'md-loading-overlay';
        loadingOverlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: ${isDark ? '#01242e' : '#ffffff'};
            z-index: 10004;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-direction: column;
            gap: 16px;
        `;

        loadingOverlay.innerHTML = `
            <svg width="40" height="40" viewBox="0 0 24 24" style="animation: md-spin 1s linear infinite; color: ${isDark ? '#ddd' : '#444'};">
                <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" fill="none" stroke-dasharray="31.4 31.4" stroke-linecap="round"/>
            </svg>
            <span style="color: ${isDark ? '#ddd' : '#444'}; font-family: system-ui, sans-serif; font-size: 14px;">Saving...</span>
        `;

        document.body.appendChild(loadingOverlay);
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

        // Back button first (leftmost position - consistent with normal toolbar)
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

        // Action buttons (Publish, Save, Preview, Delete) - always visible in fullscreen
        const actionButtons = [
            { icon: ICONS.publish, title: 'Publish', action: 'publishPost', color: '#0969da' },
            { icon: ICONS.save, title: 'Save as Draft', action: 'savePost', color: '#2e7d32' },
            { icon: ICONS.eye, title: 'Preview', action: 'previewPost', color: '#f57c00' },
            { icon: ICONS.trash, title: 'Delete', action: 'deletePost', color: '#d32f2f' },
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

        // Custom snippet button (after formatting buttons, like normal toolbar)
        if (isCustomSnippetEnabled()) {
            const snippetBtn = document.createElement('button');
            snippetBtn.type = 'button';
            snippetBtn.title = 'Insert Custom Snippet';
            snippetBtn.innerHTML = ICONS.heart;
            snippetBtn.style.cssText = buttonStyle();
            snippetBtn.style.color = '#e91e63';
            snippetBtn.addEventListener('click', () => {
                const snippet = getCustomSnippetText();
                if (snippet) {
                    // Temporarily switch textarea reference
                    const originalTextarea = $textarea;
                    $textarea = fsTextarea;
                    insertText(snippet);
                    $textarea = originalTextarea;
                    // Sync back
                    originalTextarea.value = fsTextarea.value;
                    originalTextarea.dispatchEvent(new Event('input', { bubbles: true }));
                }
            });
            header.appendChild(snippetBtn);
        }

        // Spacer (pushes remaining items to right)
        const spacer = document.createElement('div');
        spacer.style.flex = '1';
        header.appendChild(spacer);

        // Exit button (right side, before settings - consistent with fullscreen button position in normal toolbar)
        const exitBtn = document.createElement('button');
        exitBtn.type = 'button';
        exitBtn.title = 'Exit Fullscreen (Escape)';
        exitBtn.innerHTML = ICONS.exitFullscreen;
        exitBtn.style.cssText = buttonStyle();
        // Event listener added after exitFullscreen is defined
        header.appendChild(exitBtn);

        // Settings button (rightmost - consistent with normal toolbar)
        const settingsBtn = document.createElement('button');
        settingsBtn.type = 'button';
        settingsBtn.title = 'Toolbar Settings';
        settingsBtn.innerHTML = ICONS.settings;
        settingsBtn.style.cssText = buttonStyle();
        settingsBtn.addEventListener('click', () => handleAction('settings'));
        header.appendChild(settingsBtn);

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
            // If there's a pending alt-text (image being uploaded), merge instead of overwrite
            // to avoid losing BearBlog's image insertion
            if (pendingAltText) {
                // Check if original textarea has new image that fullscreen doesn't have
                const imageMarkdownRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;
                const originalImages = [...$textarea.value.matchAll(imageMarkdownRegex)];
                const fsImages = [...fsTextarea.value.matchAll(imageMarkdownRegex)];

                // If original has more images, it means BearBlog inserted one - don't overwrite
                if (originalImages.length > fsImages.length) {
                    debugLog('Skipping fullscreen sync - waiting for image insertion',
                        { originalImages: originalImages.length, fsImages: fsImages.length });
                    return;
                }
            }

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
        const language = prompt('Language (e.g., javascript, python, css):');
        // Cancel if user pressed Cancel button
        if (language === null) return;

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
                    // Show loading overlay to prevent flash when in fullscreen
                    showLoadingOverlay();
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
                    // Show loading overlay to prevent flash when in fullscreen
                    showLoadingOverlay();
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
                            // Mark content as saved so back button doesn't show warning
                            updateOriginalContent();
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

            case 'deletePost': {
                // Call BearBlog's deletePost function if it exists
                if (typeof window.deletePost === 'function') {
                    window.deletePost();
                } else {
                    // Fallback: click the delete button if it exists
                    const deleteBtn = document.getElementById('delete-button');
                    if (deleteBtn) {
                        deleteBtn.click();
                    } else {
                        // Last resort: confirm and submit delete form
                        if (confirm('Are you sure you want to delete this post?')) {
                            const form = $textarea.closest('form');
                            if (form) {
                                // Look for delete URL pattern in existing delete button onclick
                                const existingDeleteBtn = document.querySelector('[id="delete-button"]');
                                if (existingDeleteBtn) {
                                    const onclick = existingDeleteBtn.getAttribute('onclick');
                                    const match = onclick?.match(/action\s*=\s*['"]([^'"]+)['"]/);
                                    if (match) {
                                        form.action = match[1];
                                        form.submit();
                                    }
                                }
                            }
                        }
                    }
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
