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
        image: '<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>',
        altText: '<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"><path d="m21.64 3.64-1.28-1.28a1.21 1.21 0 0 0-1.72 0L2.36 18.64a1.21 1.21 0 0 0 0 1.72l1.28 1.28a1.2 1.2 0 0 0 1.72 0L21.64 5.36a1.2 1.2 0 0 0 0-1.72"/><path d="m14 7 3 3"/><path d="M5 6v4"/><path d="M19 14v4"/><path d="M10 2v2"/><path d="M7 8H3"/><path d="M21 16h-4"/><path d="M11 3H9"/></svg>',
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
        close: '<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>',
    };

    // Button categories for settings panel
    const BUTTON_CATEGORIES = {
        'Text': ['bold', 'italic', 'strikethrough', 'mark', 'code'],
        'Headings': ['h1', 'h2', 'h3'],
        'Links & Media': ['link', 'image', 'gallery'],
        'Lists': ['list', 'numberedList', 'quote'],
        'Structure': ['hr', 'table', 'codeBlock', 'footnote'],
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
    // CSS INJECTION (instead of repetitive inline styles)
    // ==========================================================================

    function injectStyles() {
        if (document.getElementById('md-toolbar-styles')) return;
        const style = document.createElement('style');
        style.id = 'md-toolbar-styles';
        style.textContent = `
            .md-btn {
                width: 32px;
                height: 32px;
                min-width: 32px;
                min-height: 32px;
                flex-shrink: 0;
                box-sizing: border-box;
                border-radius: 3px;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 0;
                transition: opacity 0.15s;
            }
            .md-btn:hover { opacity: 0.8; }
            .md-btn-light {
                background: white;
                color: #444;
                border: 1px solid #ccc;
            }
            .md-btn-dark {
                background: #01242e;
                color: #ddd;
                border: 1px solid #555;
            }
            .md-toolbar {
                display: flex;
                gap: 4px;
                padding: 8px;
                align-items: center;
                flex-wrap: wrap;
                position: sticky;
                top: 0;
                z-index: 100;
            }
            .md-toolbar-light {
                background: #eceff4;
                border-bottom: 1px solid lightgrey;
            }
            .md-toolbar-dark {
                background: #004052;
                border-bottom: 1px solid #005566;
            }
            .md-separator {
                width: 1px;
                height: 24px;
                margin: 0 8px;
            }
            .md-separator-light { background: #ccc; }
            .md-separator-dark { background: #555; }
            @keyframes md-spin {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
            }
        `;
        document.head.appendChild(style);
    }

    // Helper to get button theme class
    function getBtnClass() {
        return isDark ? 'md-btn md-btn-dark' : 'md-btn md-btn-light';
    }

    // Helper to get toolbar theme class
    function getToolbarClass() {
        return isDark ? 'md-toolbar md-toolbar-dark' : 'md-toolbar md-toolbar-light';
    }

    // Helper to get separator theme class
    function getSeparatorClass() {
        return isDark ? 'md-separator md-separator-dark' : 'md-separator md-separator-light';
    }

    // ==========================================================================
    // DIALOG MANAGER (centralized Escape key handling)
    // ==========================================================================

    const dialogStack = [];

    function pushDialog(overlay, closeHandler) {
        dialogStack.push({ overlay, closeHandler });
    }

    function popDialog() {
        return dialogStack.pop();
    }

    function removeDialogFromStack(overlay) {
        const index = dialogStack.findIndex(d => d.overlay === overlay);
        if (index !== -1) {
            dialogStack.splice(index, 1);
        }
    }

    // Global Escape key handler (one listener for all dialogs)
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && dialogStack.length > 0) {
            e.preventDefault();
            // Clean up stale entries (dialogs no longer in DOM)
            while (dialogStack.length > 0) {
                const top = dialogStack[dialogStack.length - 1];
                if (!top || !top.overlay || !document.body.contains(top.overlay)) {
                    // Stale entry - remove it
                    dialogStack.pop();
                    continue;
                }
                // Valid dialog found - close it
                if (top.closeHandler) {
                    top.closeHandler();
                }
                break;
            }
        }
    });

    // ==========================================================================
    // USER SETTINGS (localStorage)
    // ==========================================================================

    const SETTINGS_KEY = 'bear_toolbar_settings';
    const PENDING_BACK_NAV_KEY = 'bear_pending_back_nav';

    // Settings cache for performance (avoid repeated JSON.parse)
    let _settingsCache = null;
    let _settingsCacheTime = 0;
    const SETTINGS_CACHE_TTL = 1000; // 1 second TTL

    // Shortcut map for O(1) keyboard shortcut lookup
    let _shortcutMap = null;

    function loadUserSettings() {
        const now = Date.now();
        // Return cached settings if still valid
        if (_settingsCache !== null && (now - _settingsCacheTime) < SETTINGS_CACHE_TTL) {
            return _settingsCache;
        }
        try {
            const saved = localStorage.getItem(SETTINGS_KEY);
            _settingsCache = saved ? JSON.parse(saved) : null;
            _settingsCacheTime = now;
            return _settingsCache;
        } catch (e) {
            _settingsCache = null;
            return null;
        }
    }

    function invalidateSettingsCache() {
        _settingsCache = null;
        _settingsCacheTime = 0;
        _shortcutMap = null; // Also invalidate shortcut map
    }

    function saveUserSettings(settings) {
        try {
            localStorage.setItem(SETTINGS_KEY, JSON.stringify({
                ...settings,
                savedAt: Date.now()
            }));
            invalidateSettingsCache(); // Clear cache on save
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

    // Pre-compiled regex for isNewPost (performance optimization)
    const NEW_POST_URL_PATTERN = /\/new\/?$/;
    const LINK_FIELD_PATTERN = /^link:\s*([^\n]*)/im;

    // Check if we're on a new (unsaved) post - preview is not available until first save
    function isNewPost() {
        // Method 1: Check if URL path ends with '/new' or '/new/'
        // Using a stricter pattern to avoid matching paths like '/new-draft'
        const currentPath = window.location.pathname;
        if (NEW_POST_URL_PATTERN.test(currentPath)) {
            return true;
        }

        // Method 2: Check if the link field in header is empty (no slug yet)
        // This is the definitive check - if there's no link/slug, it's a new post
        const headerContent = document.getElementById('header_content');
        if (headerContent) {
            const headerText = headerContent.innerText || headerContent.textContent || '';
            // Look for "link:" at start of a line, followed by nothing or just whitespace
            const linkMatch = headerText.match(LINK_FIELD_PATTERN);
            if (linkMatch && linkMatch[1].trim() === '') {
                return true;
            }
        }

        return false;
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

    function showAltTextNotification(message, isError = false, isLoading = false) {
        // Remove existing notification if any
        const existing = document.getElementById('md-alttext-notification');
        if (existing) existing.remove();

        const notification = document.createElement('div');
        notification.id = 'md-alttext-notification';

        // Add spin animation if not already present
        if (!document.getElementById('md-spin-style')) {
            const style = document.createElement('style');
            style.id = 'md-spin-style';
            style.textContent = `@keyframes md-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`;
            document.head.appendChild(style);
        }

        const bgColor = isError ? '#d32f2f' : (isLoading ? '#1976d2' : '#2e7d32');

        notification.style.cssText = `
            position: fixed;
            bottom: 60px;
            right: 20px;
            padding: 12px 20px;
            border-radius: 8px;
            background: ${bgColor};
            color: white;
            font-family: system-ui, sans-serif;
            font-size: 14px;
            font-weight: 500;
            z-index: 10005;
            display: flex;
            align-items: center;
            gap: 10px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            transition: opacity 0.3s;
        `;

        if (isLoading) {
            notification.innerHTML = `
                <svg width="18" height="18" viewBox="0 0 24 24" style="animation: md-spin 1s linear infinite;">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" fill="none" stroke-dasharray="31.4 31.4" stroke-linecap="round"/>
                </svg>
                ${message}
            `;
        } else {
            notification.innerHTML = `
                <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none">
                    ${isError ? '<circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>' : '<path d="M20 6 9 17l-5-5"/>'}
                </svg>
                ${message}
            `;
        }

        document.body.appendChild(notification);

        // Auto-remove success/error after delay (loading will be replaced by next notification)
        if (!isLoading) {
            setTimeout(() => {
                notification.style.opacity = '0';
                setTimeout(() => notification.remove(), 300);
            }, 2000);
        }
    }

    // ==========================================================================
    // ALT-TEXT GENERATION (Manual via ALT button)
    // ==========================================================================

    // Get selected image markdown from textarea
    function getSelectedImageMarkdown(textarea) {
        const rawSelection = textarea.value.substring(textarea.selectionStart, textarea.selectionEnd);
        // Trim whitespace and calculate offset adjustments
        const leadingWhitespace = rawSelection.match(/^[\s]*/)[0].length;
        const trailingWhitespace = rawSelection.match(/[\s]*$/)[0].length;
        const selection = rawSelection.trim();

        const imageMarkdownRegex = /^!\[([^\]]*)\]\(([^)]+)\)$/;
        const match = selection.match(imageMarkdownRegex);
        if (match) {
            return {
                fullMatch: match[0],
                altText: match[1],
                imageUrl: match[2],
                start: textarea.selectionStart + leadingWhitespace,
                end: textarea.selectionEnd - trailingWhitespace
            };
        }
        return null;
    }

    // Generate alt-text for selected image
    async function generateAltTextForSelection() {
        const textarea = document.getElementById('md-fullscreen-textarea') || $textarea;
        if (!textarea) return;

        const imageData = getSelectedImageMarkdown(textarea);
        if (!imageData) {
            showAltTextNotification('Please select an image markdown first (e.g., ![](url))', true);
            return;
        }

        // Lock editor during generation
        const otherTextarea = textarea.id === 'md-fullscreen-textarea'
            ? $textarea
            : document.getElementById('md-fullscreen-textarea');
        textarea.readOnly = true;
        textarea.style.opacity = '0.7';
        textarea.style.cursor = 'wait';
        if (otherTextarea) {
            otherTextarea.readOnly = true;
        }

        // Show loading notification
        showAltTextNotification('Generating alt-text...', false, true);

        try {
            const altText = await generateAltTextWithOpenAI(imageData.imageUrl, false);

            if (altText) {
                // Replace the alt-text in the image markdown
                const newImageMarkdown = `![${altText}](${imageData.imageUrl})`;
                const before = textarea.value.substring(0, imageData.start);
                const after = textarea.value.substring(imageData.end);
                textarea.value = before + newImageMarkdown + after;

                // Also update the other textarea (main or fullscreen)
                if (otherTextarea) {
                    otherTextarea.value = textarea.value;
                }

                // Trigger input event for BearBlog to detect change
                textarea.dispatchEvent(new Event('input', { bubbles: true }));

                // Position cursor after the inserted markdown (no selection)
                const cursorPos = imageData.start + newImageMarkdown.length;
                textarea.setSelectionRange(cursorPos, cursorPos);
                textarea.focus();

                showAltTextNotification('Alt-text inserted!', false);
            } else {
                showAltTextNotification('Failed to generate alt-text', true);
            }
        } catch (error) {
            debugLog('Alt-text generation error', error);
            showAltTextNotification('Error generating alt-text', true);
        } finally {
            // Unlock editor
            textarea.readOnly = false;
            textarea.style.opacity = '';
            textarea.style.cursor = '';
            if (otherTextarea) {
                otherTextarea.readOnly = false;
            }
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
    // AJAX SAVE (prevents extra history entry)
    // ==========================================================================

    function savePostViaAjax(publish) {
        const publishInput = document.getElementById('publish');
        if (publishInput) publishInput.value = publish ? 'true' : 'false';

        const form = $textarea.closest('form');
        if (!form) return;

        // Sync header content
        const headerContent = document.getElementById('header_content');
        const hiddenHeaderContent = document.getElementById('hidden_header_content');
        if (headerContent && hiddenHeaderContent) {
            hiddenHeaderContent.value = headerContent.innerText;
        }

        // Show saving toast
        showSaveToast('Saving...', true);

        const formData = new FormData(form);

        // Create abort controller for timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

        fetch(form.action || window.location.href, {
            method: 'POST',
            body: formData,
            signal: controller.signal
        }).then(response => {
            clearTimeout(timeoutId);
            if (response.ok) {
                // Mark content as saved
                updateOriginalContent();
                showSaveToast(publish ? 'Published!' : 'Saved!', false);

                // If the response redirects to a new URL (new post), navigate there
                if (response.redirected && response.url !== window.location.href) {
                    // Use replaceState to avoid extra history entry
                    window.history.replaceState(null, '', response.url);
                    // Update the page content by reloading without adding history
                    window.location.replace(response.url);
                }
            } else {
                // Server returned an error status
                console.error('Save failed with status:', response.status);
                showSaveToast(`Error saving (${response.status})`, false, true);
            }
        }).catch((error) => {
            clearTimeout(timeoutId);
            if (error.name === 'AbortError') {
                showSaveToast('Save timed out', false, true);
            } else {
                console.error('Save failed:', error);
                showSaveToast('Network error', false, true);
            }
        });
    }

    function showSaveToast(message, isLoading, isError = false) {
        // Remove existing save toast
        const existing = document.getElementById('md-save-toast');
        if (existing) existing.remove();

        const toast = document.createElement('div');
        toast.id = 'md-save-toast';
        toast.style.cssText = `
            position: fixed;
            bottom: 60px;
            right: 20px;
            padding: 12px 20px;
            border-radius: 8px;
            background: ${isError ? '#d32f2f' : (isLoading ? '#1976d2' : '#2e7d32')};
            color: white;
            font-family: system-ui, sans-serif;
            font-size: 14px;
            font-weight: 500;
            z-index: 10005;
            display: flex;
            align-items: center;
            gap: 10px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            transition: opacity 0.3s;
        `;

        if (isLoading) {
            toast.innerHTML = `
                <svg width="18" height="18" viewBox="0 0 24 24" style="animation: md-spin 1s linear infinite;">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" fill="none" stroke-dasharray="31.4 31.4" stroke-linecap="round"/>
                </svg>
                ${message}
            `;
        } else {
            toast.innerHTML = `
                <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none">
                    ${isError ? '<circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>' : '<path d="M20 6 9 17l-5-5"/>'}
                </svg>
                ${message}
            `;
        }

        document.body.appendChild(toast);

        // Auto-remove success/error toast after delay
        if (!isLoading) {
            setTimeout(() => {
                toast.style.opacity = '0';
                setTimeout(() => toast.remove(), 300);
            }, 2000);
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

        // Inject CSS styles once
        injectStyles();

        // Store original content for unsaved changes detection
        originalContent = $textarea.value;

        // Listen for dark mode changes
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
            isDark = e.matches;
            // Refresh toolbar classes on theme change
            if ($toolbar) {
                $toolbar.className = getToolbarClass();
            }
        });

        createToolbar();
        createCharCounter();
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
        $toolbar.className = getToolbarClass();

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
            backBtn.className = getBtnClass();
            backBtn.title = 'Back';
            backBtn.innerHTML = ICONS.back;
            backBtn.addEventListener('click', () => handleBackNavigation());
            $toolbar.appendChild(backBtn);
        }

        // Add action buttons (Publish, Save, Preview, Delete) if enabled
        if (showActionButtons) {
            const newPost = isNewPost();
            const actionButtons = [
                { id: 'actionPublish', icon: ICONS.publish, title: 'Publish', action: 'publishPost', color: '#0969da' },
                { id: 'actionSave', icon: ICONS.save, title: 'Save as Draft', action: 'savePost', color: '#2e7d32' },
                // Preview only available after first save
                !newPost && { id: 'actionPreview', icon: ICONS.eye, title: 'Preview', action: 'previewPost', color: '#f57c00' },
                { id: 'actionDelete', icon: ICONS.trash, title: 'Delete', action: 'deletePost', color: '#d32f2f' },
            ].filter(Boolean);

            actionButtons.forEach(actionDef => {
                const btn = document.createElement('button');
                btn.type = 'button';
                btn.className = 'md-btn';
                btn.dataset.buttonId = actionDef.id;
                btn.title = actionDef.title;
                btn.innerHTML = actionDef.icon;
                // Colored action buttons need custom background
                btn.style.background = actionDef.color;
                btn.style.color = 'white';
                btn.style.border = `1px solid ${isDark ? '#555' : '#ccc'}`;
                btn.addEventListener('click', () => handleAction(actionDef.action));
                $toolbar.appendChild(btn);
            });

            // Separator after action buttons
            const separator = document.createElement('div');
            separator.className = getSeparatorClass();
            $toolbar.appendChild(separator);
        }

        const enabledButtons = getEnabledButtons();
        const showAltButton = isAiAltTextEnabled() && getOpenAiApiKey();

        // Create enabled buttons
        enabledButtons.forEach(buttonId => {
            const buttonDef = BUTTONS[buttonId];
            if (!buttonDef) return;

            const btn = createButton(buttonId, buttonDef);
            $toolbar.appendChild(btn);

            // Add ALT button right after the image button (if OpenAI is configured)
            if (buttonId === 'image' && showAltButton) {
                const altBtn = document.createElement('button');
                altBtn.type = 'button';
                altBtn.className = getBtnClass();
                altBtn.title = 'Generate Alt-Text (select image markdown first)';
                altBtn.innerHTML = ICONS.altText;
                altBtn.addEventListener('click', () => generateAltTextForSelection());
                $toolbar.appendChild(altBtn);
            }
        });

        // Custom snippet button - before spacer
        if (isCustomSnippetEnabled()) {
            const snippetBtn = document.createElement('button');
            snippetBtn.type = 'button';
            snippetBtn.className = getBtnClass();
            snippetBtn.title = 'Insert Custom Snippet';
            snippetBtn.innerHTML = ICONS.heart;
            snippetBtn.style.color = '#e91e63'; // Custom color for heart icon
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
            fsBtn.className = getBtnClass();
            fsBtn.title = 'Fullscreen Editor';
            fsBtn.innerHTML = ICONS.fullscreen;
            fsBtn.addEventListener('click', () => handleAction('fullscreen'));
            $toolbar.appendChild(fsBtn);
        }

        // Menu button (rightmost)
        $toolbar.appendChild(createMenuButton());
    }

    function createButton(id, def) {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = getBtnClass();
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

        // Custom color override if defined
        if (def.color) {
            btn.style.background = def.color;
            btn.style.color = 'white';
        }

        btn.addEventListener('click', () => handleButtonClick(id, def));

        return btn;
    }

    function createMenuButton() {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = getBtnClass();
        btn.innerHTML = ICONS.settings;
        btn.title = 'Toolbar Settings';
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
        aiHeader.textContent = 'Alt-Text Generation (optional)';
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
        aiToggleText.textContent = 'Show ALT button in toolbar';

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

        // Info text with "Get an API key" link
        const aiInfo = document.createElement('div');
        aiInfo.style.cssText = `
            font-size: 11px;
            color: ${isDark ? '#666' : '#999'};
            margin-top: 8px;
            line-height: 1.4;
        `;
        aiInfo.innerHTML = 'Adds an ALT button to generate alt-text for selected image markdown using OpenAI GPT-4o. ' +
            'Select an image in your text, then click ALT. ' +
            '<a href="https://platform.openai.com/api-keys" target="_blank" style="color: #0969da;">Get an API key</a>';
        aiWrapper.appendChild(aiInfo);

        // Security warning (below "Get an API key")
        const securityWarning = document.createElement('div');
        securityWarning.style.cssText = `
            margin-top: 8px;
            padding: 8px 10px;
            background: ${isDark ? '#3d2a1a' : '#fff3cd'};
            border: 1px solid ${isDark ? '#664d03' : '#ffc107'};
            border-radius: 4px;
            font-size: 11px;
            line-height: 1.4;
            color: ${isDark ? '#ffc107' : '#664d03'};
        `;
        securityWarning.innerHTML = `
            <strong>Note:</strong> API key is stored in localStorage (unencrypted).
            <a href="https://github.com/flschr/bearblog-plugins#ai-alt-text-feature-optional" target="_blank" rel="noopener" style="color: inherit; text-decoration: underline;">More info</a>
        `;
        aiWrapper.appendChild(securityWarning);

        aiSection.appendChild(aiWrapper);
        panel.appendChild(aiSection);

        // About Section
        const aboutSection = document.createElement('div');
        aboutSection.style.cssText = `
            margin-top: 16px;
            padding-top: 16px;
            border-top: 1px solid ${isDark ? '#333' : '#eee'};
            text-align: center;
            font-size: 12px;
            color: ${isDark ? '#888' : '#666'};
        `;
        aboutSection.innerHTML = `
            Created by <a href="https://fischr.org" target="_blank" style="color: ${isDark ? '#58a6ff' : '#0969da'}; text-decoration: none;">René Fischer</a><br>
            <a href="https://github.com/flschr/bearblog-plugins" target="_blank" style="color: ${isDark ? '#58a6ff' : '#0969da'}; text-decoration: none;">GitHub Repository</a> · Licensed under WTFPL
        `;
        panel.appendChild(aboutSection);

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
            showResetConfirmDialog(() => {
                // Reset all checkboxes to default
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
            });
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

            // If in fullscreen mode, refresh it to apply new settings
            const fsOverlay = document.getElementById('md-fullscreen-overlay');
            if (fsOverlay) {
                // Save current state before removing
                const fsTextarea = document.getElementById('md-fullscreen-textarea');
                const savedContent = fsTextarea ? fsTextarea.value : $textarea.value;
                const savedSelectionStart = fsTextarea ? fsTextarea.selectionStart : 0;
                const savedSelectionEnd = fsTextarea ? fsTextarea.selectionEnd : 0;
                const savedScrollTop = fsTextarea ? fsTextarea.scrollTop : 0;

                // Sync content to main textarea before closing
                if (fsTextarea) {
                    $textarea.value = fsTextarea.value;
                }

                // Click the exit button to trigger proper cleanup instead of direct removal
                const exitBtn = fsOverlay.querySelector('button[title="Exit Fullscreen (Escape)"]');
                if (exitBtn) {
                    exitBtn.click();
                } else {
                    // Fallback: direct removal (MutationObserver will handle cleanup)
                    fsOverlay.remove();
                    document.body.style.overflow = '';
                }

                // Reopen fullscreen with new settings (after delay for cleanup)
                setTimeout(() => {
                    showFullscreenEditor();
                    // Restore state
                    const newFsTextarea = document.getElementById('md-fullscreen-textarea');
                    if (newFsTextarea) {
                        newFsTextarea.value = savedContent;
                        newFsTextarea.setSelectionRange(savedSelectionStart, savedSelectionEnd);
                        newFsTextarea.scrollTop = savedScrollTop;
                    }
                }, 50);
            }

            overlay.remove();
        };

        actions.appendChild(resetBtn);
        actions.appendChild(saveBtn);
        panel.appendChild(actions);

        overlay.appendChild(panel);
        document.body.appendChild(overlay);

        // Close handler (used by both overlay click and Escape key)
        const closeOverlay = () => {
            removeDialogFromStack(overlay);
            overlay.remove();
        };

        // Close on overlay click
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) closeOverlay();
        });

        // Register with dialog manager for Escape key handling
        pushDialog(overlay, closeOverlay);
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

        // Close handler
        const closeDialog = () => {
            removeDialogFromStack(dialog);
            dialog.remove();
        };

        // Cancel - close dialog
        panel.querySelector('.md-dialog-cancel').addEventListener('click', closeDialog);

        // Discard - navigate without saving
        panel.querySelector('.md-dialog-discard').addEventListener('click', () => {
            closeDialog();
            navigateBack();
        });

        // Save & Leave - save then navigate
        panel.querySelector('.md-dialog-save').addEventListener('click', () => {
            closeDialog();
            saveAndNavigateBack();
        });

        // Close on overlay click
        dialog.addEventListener('click', (e) => {
            if (e.target === dialog) closeDialog();
        });

        // Register with dialog manager for Escape key handling
        pushDialog(dialog, closeDialog);
    }

    function showDeleteConfirmDialog() {
        const dialog = document.createElement('div');
        dialog.className = 'md-delete-dialog';
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
            max-width: 420px;
            width: 90%;
            box-shadow: 0 8px 32px rgba(0,0,0,0.4);
            font-family: system-ui, sans-serif;
        `;

        panel.innerHTML = `
            <div style="display:flex;align-items:flex-start;gap:12px;margin-bottom:20px;">
                <span style="color:#d32f2f;flex-shrink:0;">${ICONS.caution}</span>
                <div>
                    <div style="font-weight:600;font-size:16px;color:${isDark ? '#fff' : '#333'};margin-bottom:8px;">
                        Delete Article!
                    </div>
                    <div style="font-size:14px;color:${isDark ? '#aaa' : '#666'};line-height:1.5;">
                        Do you really want to delete this article? <strong style="color:${isDark ? '#ff6b6b' : '#d32f2f'};">This action cannot be undone!</strong>
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
                <button class="md-dialog-delete" style="
                    padding: 8px 16px;
                    background: #d32f2f;
                    color: white;
                    border: none;
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 13px;
                    font-weight: 500;
                ">Delete Permanently</button>
            </div>
        `;

        dialog.appendChild(panel);
        document.body.appendChild(dialog);

        // Close handler
        const closeDialog = () => {
            removeDialogFromStack(dialog);
            dialog.remove();
        };

        // Cancel - close dialog
        panel.querySelector('.md-dialog-cancel').addEventListener('click', closeDialog);

        // Delete - execute deletion
        panel.querySelector('.md-dialog-delete').addEventListener('click', () => {
            closeDialog();
            executeDelete();
        });

        // Close on overlay click
        dialog.addEventListener('click', (e) => {
            if (e.target === dialog) closeDialog();
        });

        // Register with dialog manager for Escape key handling
        pushDialog(dialog, closeDialog);
    }

    function executeDelete() {
        // Submit the delete form directly, bypassing BearBlog's confirm dialog
        // since we already showed our own confirmation
        const form = $textarea.closest('form');
        const deleteBtn = document.getElementById('delete-button');

        if (deleteBtn && form) {
            // Extract the delete action URL from the button's onclick handler
            const onclick = deleteBtn.getAttribute('onclick');
            const match = onclick?.match(/action\s*=\s*['"]([^'"]+)['"]/);
            if (match) {
                form.action = match[1];
                form.submit();
                return;
            }
        }

        // Fallback: temporarily override confirm to bypass the native dialog
        if (deleteBtn) {
            const originalConfirm = window.confirm;
            try {
                window.confirm = () => true;
                deleteBtn.click();
            } finally {
                window.confirm = originalConfirm;
            }
        }
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
        header.id = 'md-fullscreen-header';
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
            box-sizing: border-box;
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
        const newPost = isNewPost();
        const actionButtons = [
            { icon: ICONS.publish, title: 'Publish', action: 'publishPost', color: '#0969da' },
            { icon: ICONS.save, title: 'Save as Draft', action: 'savePost', color: '#2e7d32' },
            // Preview only available after first save
            !newPost && { icon: ICONS.eye, title: 'Preview', action: 'previewPost', color: '#f57c00' },
            { icon: ICONS.trash, title: 'Delete', action: 'deletePost', color: '#d32f2f' },
        ].filter(Boolean);

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

        // Container for formatting buttons (for easy re-rendering when settings change)
        const formattingContainer = document.createElement('div');
        formattingContainer.id = 'md-fullscreen-formatting-buttons';
        formattingContainer.style.cssText = 'display: flex; gap: 4px; align-items: center; flex-wrap: wrap;';
        header.appendChild(formattingContainer);

        // Function to render formatting buttons into container
        const renderFormattingButtons = (container) => {
            container.innerHTML = '';

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
                    try {
                        $textarea = fsTextarea;
                        handleButtonClick(buttonId, buttonDef);
                    } finally {
                        $textarea = originalTextarea;
                    }
                    // Sync back to original
                    originalTextarea.value = fsTextarea.value;
                    originalTextarea.dispatchEvent(new Event('input', { bubbles: true }));
                });

                container.appendChild(btn);
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
                        try {
                            $textarea = fsTextarea;
                            insertText(snippet);
                        } finally {
                            $textarea = originalTextarea;
                        }
                        // Sync back
                        originalTextarea.value = fsTextarea.value;
                        originalTextarea.dispatchEvent(new Event('input', { bubbles: true }));
                    }
                });
                container.appendChild(snippetBtn);
            }
        };

        // Initial render
        renderFormattingButtons(formattingContainer);

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
            $textarea.value = fsTextarea.value;
            $textarea.dispatchEvent(new Event('input', { bubbles: true }));
        });

        // Track cleanup state to prevent double-cleanup
        let isCleanedUp = false;

        // Escape key handler (defined early so cleanup can reference it)
        const escHandler = (e) => {
            if (e.key === 'Escape') {
                e.preventDefault();
                exitFullscreen();
            }
        };

        // MutationObserver for cleanup safety net
        const observer = new MutationObserver((mutations) => {
            for (const mutation of mutations) {
                for (const node of mutation.removedNodes) {
                    if (node === overlay) {
                        cleanup();
                        return;
                    }
                }
            }
        });

        // Centralized cleanup function
        const cleanup = () => {
            if (isCleanedUp) return;
            isCleanedUp = true;
            document.body.style.overflow = '';
            document.removeEventListener('keydown', escHandler);
            observer.disconnect();
        };

        // Exit function
        const exitFullscreen = () => {
            if (isCleanedUp) return;
            setFullscreenFlag(false);

            // Sync final content
            $textarea.value = fsTextarea.value;
            $textarea.dispatchEvent(new Event('input', { bubbles: true }));

            // Restore selection
            $textarea.setSelectionRange(fsTextarea.selectionStart, fsTextarea.selectionEnd);

            // Cleanup before removing overlay
            cleanup();
            overlay.remove();
            $textarea.focus();
        };

        // Exit button click
        exitBtn.addEventListener('click', exitFullscreen);

        // Register escape handler
        document.addEventListener('keydown', escHandler);

        // Prevent body scroll
        document.body.style.overflow = 'hidden';

        // Start observing for cleanup safety net
        observer.observe(document.body, { childList: true });

        // Setup keyboard shortcuts for fullscreen textarea
        fsTextarea.addEventListener('keydown', (e) => {
            const ctrl = e.ctrlKey || e.metaKey;
            if (!ctrl) return;

            // O(1) lookup using shortcut map
            const shortcutKey = `ctrl+${e.key.toLowerCase()}`;
            const shortcut = getShortcutMap().get(shortcutKey);

            if (shortcut) {
                e.preventDefault();
                // Temporarily switch textarea reference
                const originalTextarea = $textarea;
                try {
                    $textarea = fsTextarea;
                    handleButtonClick(shortcut.id, shortcut.def);
                } finally {
                    $textarea = originalTextarea;
                }
                // Sync back
                originalTextarea.value = fsTextarea.value;
                originalTextarea.dispatchEvent(new Event('input', { bubbles: true }));
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
    // INLINE PREVIEW
    // ==========================================================================

    function showInlinePreview() {
        // Toggle off if already showing
        const existing = document.getElementById('md-inline-preview-overlay');
        if (existing) {
            closeInlinePreview();
            return;
        }

        // Bear Blog uses POST for preview - we need to get the current content and submit it
        const headerContent = document.getElementById('header_content');
        const bodyContent = document.getElementById('body_content');
        if (!headerContent || !bodyContent) {
            console.warn('Could not find header_content or body_content elements');
            return;
        }

        // Build preview URL - Bear Blog uses /username/dashboard/preview/?type=post
        // Extract username from current URL path
        const pathMatch = window.location.pathname.match(/^\/([^\/]+)\/dashboard/);
        if (!pathMatch) {
            console.warn('Could not determine dashboard path for preview');
            return;
        }
        const previewUrl = `/${pathMatch[1]}/dashboard/preview/?type=post`;

        // Create overlay container
        const overlay = document.createElement('div');
        overlay.id = 'md-inline-preview-overlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: ${isDark ? '#01242e' : '#ffffff'};
            z-index: 10001;
            display: flex;
            flex-direction: column;
        `;

        // Create header with exit button
        const header = document.createElement('div');
        header.style.cssText = `
            display: flex;
            gap: 8px;
            padding: 8px 16px;
            align-items: center;
            justify-content: space-between;
            background: ${isDark ? '#004052' : '#eceff4'};
            border-bottom: 1px solid ${isDark ? '#005566' : 'lightgrey'};
            flex-shrink: 0;
        `;

        // Preview label
        const label = document.createElement('span');
        label.textContent = 'Preview';
        label.style.cssText = `
            font-family: system-ui, sans-serif;
            font-size: 14px;
            font-weight: 600;
            color: ${isDark ? '#e0e0e0' : '#333'};
        `;
        header.appendChild(label);

        // Exit button
        const exitBtn = document.createElement('button');
        exitBtn.type = 'button';
        exitBtn.title = 'Exit Preview (Escape)';
        exitBtn.innerHTML = ICONS.close;
        exitBtn.style.cssText = `
            width: 32px;
            height: 32px;
            min-width: 32px;
            min-height: 32px;
            flex-shrink: 0;
            box-sizing: border-box;
            background: #d32f2f;
            color: white;
            border: 1px solid ${isDark ? '#555' : '#ccc'};
            border-radius: 3px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 0;
        `;
        exitBtn.addEventListener('click', closeInlinePreview);
        header.appendChild(exitBtn);

        overlay.appendChild(header);

        // Create content container for preview (using div instead of iframe to avoid X-Frame-Options issues)
        const contentContainer = document.createElement('div');
        contentContainer.id = 'md-inline-preview-content';
        contentContainer.style.cssText = `
            flex: 1;
            width: 100%;
            overflow: auto;
            background: ${isDark ? '#01242e' : '#ffffff'};
        `;

        // Show loading indicator
        contentContainer.innerHTML = `
            <div style="display: flex; justify-content: center; align-items: center; height: 100%; color: ${isDark ? '#aaa' : '#666'};">
                <span>Loading preview...</span>
            </div>
        `;
        overlay.appendChild(contentContainer);

        // Prevent body scroll
        document.body.style.overflow = 'hidden';

        // Add overlay to page
        document.body.appendChild(overlay);

        // Fetch preview content via POST (avoids X-Frame-Options restrictions)
        const formData = new FormData();
        formData.append('header_content', headerContent.innerText);
        formData.append('body_content', bodyContent.value);

        fetch(previewUrl, {
            method: 'POST',
            body: formData,
            credentials: 'same-origin'
        })
        .then(response => response.text())
        .then(html => {
            // Extract the body content from the response HTML
            // Create a temporary element to parse the HTML
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');

            // Get styles from the response
            const styles = doc.querySelectorAll('style, link[rel="stylesheet"]');
            const styleContent = Array.from(styles).map(s => s.outerHTML).join('\n');

            // Get the main content - try to find the article/main content
            let bodyHtml = doc.body ? doc.body.innerHTML : html;

            // Create a shadow DOM for style isolation
            const shadowHost = document.createElement('div');
            shadowHost.style.cssText = 'height: 100%; width: 100%;';
            contentContainer.innerHTML = '';
            contentContainer.appendChild(shadowHost);

            const shadow = shadowHost.attachShadow({ mode: 'open' });
            shadow.innerHTML = `
                ${styleContent}
                <style>
                    :host {
                        display: block;
                        height: 100%;
                        overflow: auto;
                    }
                    body, html {
                        margin: 0;
                        padding: 0;
                    }
                </style>
                <div style="padding: 20px; max-width: 800px; margin: 0 auto;">
                    ${bodyHtml}
                </div>
            `;
        })
        .catch(error => {
            console.error('Preview fetch error:', error);
            contentContainer.innerHTML = `
                <div style="display: flex; justify-content: center; align-items: center; height: 100%; color: #d32f2f;">
                    <span>Failed to load preview</span>
                </div>
            `;
        });

        // Register with dialog stack for ESC key handling
        pushDialog(overlay, closeInlinePreview);
    }

    function closeInlinePreview() {
        const overlay = document.getElementById('md-inline-preview-overlay');
        if (overlay) {
            removeDialogFromStack(overlay);
            overlay.remove();
            document.body.style.overflow = '';
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

        // Try to get URL from clipboard (with validation)
        let url = '';
        try {
            const clip = await navigator.clipboard.readText();
            if (isValidUrl(clip)) {
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

    // Validate and sanitize URL from clipboard
    function isValidUrl(str) {
        if (!str || typeof str !== 'string') return false;
        const trimmed = str.trim();
        // Max URL length to prevent abuse
        if (trimmed.length > 2048) return false;
        // Block dangerous protocols
        if (/^(javascript|data|vbscript|file):/i.test(trimmed)) return false;
        // Must start with http:// or https://
        return /^https?:\/\//i.test(trimmed);
    }

    // Check if a string looks like an image URL
    function isImageUrl(str) {
        if (!isValidUrl(str)) return false;
        const trimmed = str.trim();
        // Check for common image extensions or known image hosts
        const imageExtensions = /\.(jpg|jpeg|png|gif|webp|svg|bmp|ico|avif)(\?.*)?$/i;
        const imageHosts = /\b(cdn\.digitaloceanspaces\.com|imgur\.com|i\.imgur\.com|cloudinary\.com|unsplash\.com|images\.unsplash\.com|pexels\.com|images\.pexels\.com|flickr\.com|staticflickr\.com|giphy\.com|media\.giphy\.com)\b/i;
        return imageExtensions.test(trimmed) || imageHosts.test(trimmed);
    }

    // Handle smart image button with clipboard detection
    async function handleSmartImageUpload() {
        try {
            const clipboardText = await navigator.clipboard.readText();
            if (isImageUrl(clipboardText)) {
                showImageUrlDialog(clipboardText.trim());
                return;
            }
        } catch (e) {
            // Clipboard access denied or empty - just proceed with upload
        }
        // No image URL in clipboard, trigger normal upload
        document.getElementById('upload-image')?.click();
    }

    // Show dialog asking whether to use clipboard URL or upload
    function showImageUrlDialog(imageUrl) {
        // Create overlay
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0,0,0,0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10003;
        `;

        // Create dialog panel
        const dialog = document.createElement('div');
        dialog.style.cssText = `
            background: ${isDark ? '#01242e' : 'white'};
            border-radius: 12px;
            padding: 24px;
            max-width: 420px;
            width: 90%;
            box-shadow: 0 8px 32px rgba(0,0,0,0.4);
            font-family: system-ui, sans-serif;
        `;

        // Build dialog content safely (no innerHTML with user content)
        const headerDiv = document.createElement('div');
        headerDiv.style.cssText = 'display:flex;align-items:flex-start;gap:12px;margin-bottom:20px;';

        const iconSpan = document.createElement('span');
        iconSpan.style.cssText = 'color:#0969da;flex-shrink:0;';
        iconSpan.innerHTML = ICONS.info;

        const contentDiv = document.createElement('div');

        const titleDiv = document.createElement('div');
        titleDiv.style.cssText = `font-weight:600;font-size:16px;color:${isDark ? '#fff' : '#333'};margin-bottom:8px;`;
        titleDiv.textContent = 'Image URL detected';

        const descDiv = document.createElement('div');
        descDiv.style.cssText = `font-size:14px;color:${isDark ? '#aaa' : '#666'};margin-bottom:12px;`;
        descDiv.textContent = 'An image URL was found in your clipboard.';

        const urlDiv = document.createElement('div');
        urlDiv.style.cssText = `font-size:12px;word-break:break-all;padding:8px;background:${isDark ? '#002530' : '#f5f5f5'};border-radius:6px;font-family:ui-monospace,monospace;color:${isDark ? '#888' : '#666'};`;
        urlDiv.textContent = imageUrl.length > 60 ? imageUrl.substring(0, 57) + '...' : imageUrl;

        contentDiv.appendChild(titleDiv);
        contentDiv.appendChild(descDiv);
        contentDiv.appendChild(urlDiv);
        headerDiv.appendChild(iconSpan);
        headerDiv.appendChild(contentDiv);

        const buttonDiv = document.createElement('div');
        buttonDiv.style.cssText = 'display:flex;gap:10px;justify-content:flex-end;';

        const uploadBtn = document.createElement('button');
        uploadBtn.textContent = 'Upload new image';
        uploadBtn.style.cssText = `
            padding: 8px 16px;
            background: transparent;
            color: ${isDark ? '#888' : '#666'};
            border: 1px solid ${isDark ? '#444' : '#ccc'};
            border-radius: 6px;
            cursor: pointer;
            font-size: 13px;
        `;

        const useBtn = document.createElement('button');
        useBtn.textContent = 'Use this URL';
        useBtn.style.cssText = `
            padding: 8px 16px;
            background: #2e7d32;
            color: white;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            font-size: 13px;
            font-weight: 500;
        `;

        buttonDiv.appendChild(uploadBtn);
        buttonDiv.appendChild(useBtn);
        dialog.appendChild(headerDiv);
        dialog.appendChild(buttonDiv);
        overlay.appendChild(dialog);
        document.body.appendChild(overlay);

        // Close handler
        const closeOverlay = () => {
            removeDialogFromStack(overlay);
            overlay.remove();
        };

        // Close on overlay click
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) closeOverlay();
        });

        // Handle "Use this URL" button
        useBtn.addEventListener('click', () => {
            closeOverlay();
            insertText(`![](${imageUrl})`);
        });

        // Handle "Upload new image" button
        uploadBtn.addEventListener('click', () => {
            closeOverlay();
            document.getElementById('upload-image')?.click();
        });

        // Register with dialog manager for Escape key handling
        pushDialog(overlay, closeOverlay);

        // Focus the "Use this URL" button
        useBtn.focus();
    }

    // Show confirmation dialog for reset with clear warning
    function showResetConfirmDialog(onConfirm) {
        // Create overlay
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0,0,0,0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10003;
        `;

        // Create dialog panel
        const dialog = document.createElement('div');
        dialog.style.cssText = `
            background: ${isDark ? '#01242e' : 'white'};
            border-radius: 12px;
            padding: 24px;
            max-width: 420px;
            width: 90%;
            box-shadow: 0 8px 32px rgba(0,0,0,0.4);
            font-family: system-ui, sans-serif;
        `;

        dialog.innerHTML = `
            <div style="display:flex;align-items:flex-start;gap:12px;margin-bottom:20px;">
                <span style="color:#d32f2f;flex-shrink:0;">${ICONS.caution}</span>
                <div>
                    <div style="font-weight:600;font-size:16px;color:${isDark ? '#fff' : '#333'};margin-bottom:8px;">
                        Reset all settings?
                    </div>
                    <div style="font-size:14px;color:${isDark ? '#aaa' : '#666'};line-height:1.5;">
                        This will delete all your toolbar customizations:<br>
                        <ul style="margin: 10px 0; padding-left: 20px;">
                            <li>Button selection and order</li>
                            <li>OpenAI API key</li>
                            <li>Custom snippets</li>
                            <li>All other preferences</li>
                        </ul>
                        <strong style="color:${isDark ? '#ff6b6b' : '#d32f2f'};">This action cannot be undone!</strong>
                    </div>
                </div>
            </div>
            <div style="display:flex;gap:10px;justify-content:flex-end;">
                <button id="reset-dialog-cancel" style="
                    padding: 8px 16px;
                    background: transparent;
                    color: ${isDark ? '#888' : '#666'};
                    border: 1px solid ${isDark ? '#444' : '#ccc'};
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 13px;
                ">Cancel</button>
                <button id="reset-dialog-confirm" style="
                    padding: 8px 16px;
                    background: #d32f2f;
                    color: white;
                    border: none;
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 13px;
                    font-weight: 500;
                ">Reset Everything</button>
            </div>
        `;

        overlay.appendChild(dialog);
        document.body.appendChild(overlay);

        // Close handler
        const closeOverlay = () => {
            removeDialogFromStack(overlay);
            overlay.remove();
        };

        // Close on overlay click
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) closeOverlay();
        });

        // Handle Cancel button
        dialog.querySelector('#reset-dialog-cancel').addEventListener('click', closeOverlay);

        // Handle Confirm button
        dialog.querySelector('#reset-dialog-confirm').addEventListener('click', () => {
            closeOverlay();
            onConfirm();
        });

        // Register with dialog manager for Escape key handling
        pushDialog(overlay, closeOverlay);

        // Focus the Cancel button (safer default)
        dialog.querySelector('#reset-dialog-cancel').focus();
    }

    function handleAction(action) {
        switch (action) {
            case 'upload':
                handleSmartImageUpload();
                break;

            case 'gallery': {
                const pathParts = window.location.pathname.split('/').filter(Boolean);
                const blogSlug = pathParts[0] || '';
                window.open(`/${blogSlug}/dashboard/media/`, '_blank');
                break;
            }

            case 'preview':
                showInlinePreview();
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
                savePostViaAjax(true);
                break;
            }

            case 'savePost': {
                savePostViaAjax(false);
                break;
            }

            case 'previewPost': {
                // If preview is already open, close it (toggle behavior)
                if (document.getElementById('md-inline-preview-overlay')) {
                    closeInlinePreview();
                    break;
                }

                // Save first via AJAX, then open inline preview
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
                    const controller = new AbortController();
                    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

                    fetch(form.action || window.location.href, {
                        method: 'POST',
                        body: formData,
                        signal: controller.signal
                    }).then(response => {
                        clearTimeout(timeoutId);
                        if (response.ok) {
                            // Mark content as saved so back button doesn't show warning
                            updateOriginalContent();
                        }
                        // Open inline preview regardless of save success
                        showInlinePreview();
                    }).catch(() => {
                        clearTimeout(timeoutId);
                        // On network error or timeout, still try to preview
                        showInlinePreview();
                    });
                } else {
                    // No form found, just open inline preview
                    showInlinePreview();
                }
                break;
            }

            case 'deletePost': {
                showDeleteConfirmDialog();
                break;
            }
        }
    }

    // ==========================================================================
    // KEYBOARD SHORTCUTS
    // ==========================================================================

    // Build shortcut map for O(1) lookup (cached, invalidated on settings change)
    function getShortcutMap() {
        if (_shortcutMap) return _shortcutMap;
        _shortcutMap = new Map();
        const enabled = getEnabledButtons();
        for (const [id, def] of Object.entries(BUTTONS)) {
            if (def.shortcut && enabled.includes(id)) {
                const key = `ctrl+${def.shortcut.key}`;
                _shortcutMap.set(key, { id, def });
            }
        }
        return _shortcutMap;
    }

    function setupKeyboardShortcuts() {
        $textarea.addEventListener('keydown', (e) => {
            const ctrl = e.ctrlKey || e.metaKey;
            if (!ctrl) return;

            // O(1) lookup using shortcut map
            const shortcutKey = `ctrl+${e.key.toLowerCase()}`;
            const shortcut = getShortcutMap().get(shortcutKey);

            if (shortcut) {
                e.preventDefault();
                handleButtonClick(shortcut.id, shortcut.def);
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
