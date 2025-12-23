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

    const CONFIG = {
        // Buttons to show (comment out or remove to hide)
        // Order here = order in toolbar
        enabledButtons: [
            'bold',
            'italic',
            'h2',
            'h3',
            'link',
            'quote',
            'list',
            'image',
            'hr',
            'table',
            'code',
            'codeBlock',
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
        bold: '<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2.5" fill="none"><path d="M6 12h9a4 4 0 0 1 0 8H6v-8Z"/><path d="M6 4h7a4 4 0 0 1 0 8H6V4Z"/></svg>',
        italic: '<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2.5" fill="none"><line x1="19" y1="4" x2="10" y2="4"/><line x1="14" y1="20" x2="5" y2="20"/><line x1="15" y1="4" x2="9" y2="20"/></svg>',
        link: '<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.72"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.72-1.72"/></svg>',
        quote: '<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2.5" fill="none"><path d="M3 21c3 0 7-1 7-8V5c0-1.25-.75-2-2-2H4c-1.25 0-2 .75-2 2v6c0 1.25.75 2 2 2h4"/><path d="M17 21c3 0 7-1 7-8V5c0-1.25-.75-2-2-2h-4c-1.25 0-2 .75-2 2v6c0 1.25.75 2 2 2h4"/></svg>',
        image: '<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>',
        code: '<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>',
        codeBlock: '<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="m10 10-2 2 2 2"/><path d="m14 14 2-2-2-2"/></svg>',
        list: '<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2.5" fill="none"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><path d="M3 6h.01M3 12h.01M3 18h.01"/></svg>',
        hr: '<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2.5" fill="none"><line x1="5" y1="12" x2="19" y2="12"/></svg>',
        table: '<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 3v18"/></svg>',
        info: '<svg viewBox="0 0 16 16" width="18" height="18" fill="currentColor"><path d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8Zm8-6.5a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13ZM6.5 7.75A.75.75 0 0 1 7.25 7h1a.75.75 0 0 1 .75.75v2.75h.25a.75.75 0 0 1 0 1.5h-2a.75.75 0 0 1 0-1.5h.25v-2h-.25a.75.75 0 0 1-.75-.75ZM8 6a1 1 0 1 1 0-2 1 1 0 0 1 0 2Z"/></svg>',
        warning: '<svg viewBox="0 0 16 16" width="18" height="18" fill="currentColor"><path d="M6.457 1.047c.659-1.234 2.427-1.234 3.086 0l6.082 11.378A1.75 1.75 0 0 1 14.082 15H1.918a1.75 1.75 0 0 1-1.543-2.575Zm1.763.707a.25.25 0 0 0-.44 0L1.698 13.132a.25.25 0 0 0 .22.368h12.164a.25.25 0 0 0 .22-.368Zm.53 3.996v2.5a.75.75 0 0 1-1.5 0v-2.5a.75.75 0 0 1 1.5 0ZM9 11a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z"/></svg>',
        caution: '<svg viewBox="0 0 16 16" width="18" height="18" fill="currentColor"><path d="M4.47.22A.749.749 0 0 1 5 0h6c.199 0 .389.079.53.22l4.25 4.25c.141.14.22.331.22.53v6a.749.749 0 0 1-.22.53l-4.25 4.25A.749.749 0 0 1 11 16H5a.749.749 0 0 1-.53-.22L.22 11.53A.749.749 0 0 1 0 11V5c0-.199.079-.389.22-.53Zm.84 1.28L1.5 5.31v5.38l3.81 3.81h5.38l3.81-3.81V5.31L10.69 1.5ZM8 4a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-1.5 0v-3.5A.75.75 0 0 1 8 4Zm0 8a1 1 0 1 1 0-2 1 1 0 0 1 0 2Z"/></svg>',
        more: '<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2.5" fill="none"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>',
        gallery: '<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>',
        preview: '<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>',
        help: '<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/></svg>',
    };

    // ==========================================================================
    // BUTTON REGISTRY
    // ==========================================================================

    const BUTTONS = {
        // --- Formatting ---
        bold: {
            icon: ICONS.bold,
            title: 'Fett (Ctrl+B)',
            syntax: ['**', '**'],
            shortcut: { key: 'b', ctrl: true }
        },
        italic: {
            icon: ICONS.italic,
            title: 'Kursiv (Ctrl+I)',
            syntax: ['*', '*'],
            shortcut: { key: 'i', ctrl: true }
        },

        // --- Headings ---
        h2: {
            icon: 'H2',
            title: 'Überschrift 2',
            syntax: ['## ', ''],
            lineStart: true
        },
        h3: {
            icon: 'H3',
            title: 'Überschrift 3',
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
            title: 'Bild einfügen',
            action: 'upload'
        },

        // --- Blocks ---
        quote: {
            icon: ICONS.quote,
            title: 'Zitat',
            syntax: ['> ', ''],
            lineStart: true
        },
        list: {
            icon: ICONS.list,
            title: 'Liste',
            syntax: ['- ', ''],
            lineStart: true
        },
        hr: {
            icon: ICONS.hr,
            title: 'Trennlinie',
            syntax: ['\n---\n', '']
        },
        table: {
            icon: ICONS.table,
            title: 'Tabelle',
            syntax: ['\n| Spalte 1 | Spalte 2 |\n|----------|----------|\n| Zelle 1  | Zelle 2  |\n', '']
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
            syntax: ['\n```\n', '\n```\n']
        },

        // --- Admonitions (GitHub Style) ---
        admonitionInfo: {
            icon: ICONS.info,
            title: 'Info Box',
            syntax: ['\n> #### INFO\n> ', '\n'],
            color: '#0969da'
        },
        admonitionWarning: {
            icon: ICONS.warning,
            title: 'Warning Box',
            syntax: ['\n> ##### WARNUNG\n> ', '\n'],
            color: '#9a6700'
        },
        admonitionCaution: {
            icon: ICONS.caution,
            title: 'Caution Box',
            syntax: ['\n> ###### ACHTUNG\n> ', '\n'],
            color: '#cf222e'
        },
    };

    // Menu items (always in dropdown)
    const MENU_ITEMS = [
        { icon: ICONS.gallery, text: 'Media Galerie', action: 'gallery' },
        { icon: ICONS.preview, text: 'Vorschau', action: 'preview' },
        { icon: ICONS.help, text: 'Markdown Hilfe', action: 'help' },
    ];

    // ==========================================================================
    // STATE
    // ==========================================================================

    let isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    let autosaveTimer = null;
    let $textarea = null;

    // ==========================================================================
    // INITIALIZATION
    // ==========================================================================

    function init() {
        $textarea = document.getElementById('body_content');
        if (!$textarea || $textarea.hasAttribute('data-toolbar-initialized')) return;

        $textarea.setAttribute('data-toolbar-initialized', 'true');

        // Listen for dark mode changes
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
            isDark = e.matches;
            // Could refresh toolbar colors here if needed
        });

        createToolbar();
        createCharCounter();
        setupAutosave();
        setupKeyboardShortcuts();
        checkForDraft();

        // Hide Bear Blog default elements
        document.querySelectorAll('.helptext.sticky, body > footer').forEach(el => {
            el.style.display = 'none';
        });
    }

    // ==========================================================================
    // TOOLBAR CREATION
    // ==========================================================================

    function createToolbar() {
        const wrapper = $textarea.parentElement;
        wrapper.style.position = 'relative';

        const toolbar = document.createElement('div');
        toolbar.className = 'md-toolbar';
        toolbar.style.cssText = `
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

        // Create enabled buttons
        CONFIG.enabledButtons.forEach(buttonId => {
            const buttonDef = BUTTONS[buttonId];
            if (!buttonDef) return;

            const btn = createButton(buttonId, buttonDef);
            toolbar.appendChild(btn);
        });

        // Spacer
        const spacer = document.createElement('div');
        spacer.style.flex = '1';
        toolbar.appendChild(spacer);

        // Menu button
        toolbar.appendChild(createMenuButton());

        wrapper.insertBefore(toolbar, $textarea);
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

        // Styling
        btn.style.cssText += `
            width: 32px;
            height: 32px;
            flex-shrink: 0;
            background: ${def.color || (isDark ? '#01242e' : 'white')};
            color: ${def.color ? 'white' : (isDark ? '#ddd' : '#444')};
            border: 1px solid ${isDark ? '#555' : '#ccc'};
            border-radius: 3px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
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
        btn.title = 'Mehr...';
        btn.style.cssText = `
            width: 32px;
            height: 32px;
            background: ${isDark ? '#01242e' : 'white'};
            color: ${isDark ? '#ddd' : '#444'};
            border: 1px solid ${isDark ? '#555' : '#ccc'};
            border-radius: 3px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
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
        // Extract post ID from URL: /blog/dashboard/posts/123/edit/
        const match = window.location.pathname.match(/\/posts\/(\d+)\//);
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
        if (!CONFIG.autosave.enabled) return;

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
        if (!CONFIG.autosave.enabled) return;

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
            ageText = `vor ${ageMinutes} Minute${ageMinutes !== 1 ? 'n' : ''}`;
        } else {
            const hours = Math.round(ageMinutes / 60);
            ageText = `vor ${hours} Stunde${hours !== 1 ? 'n' : ''}`;
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
            z-index: 10000;
            font-family: system-ui, sans-serif;
            max-width: 400px;
        `;

        dialog.innerHTML = `
            <div style="display:flex;align-items:flex-start;gap:12px;">
                <span style="color:#0969da;flex-shrink:0;">${ICONS.info}</span>
                <div>
                    <div style="font-weight:600;color:${isDark ? '#fff' : '#333'};margin-bottom:8px;">
                        Ungespeicherter Entwurf gefunden
                    </div>
                    <div style="font-size:13px;color:${isDark ? '#aaa' : '#666'};margin-bottom:12px;">
                        Zuletzt gespeichert ${ageText}
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
                        ">Wiederherstellen</button>
                        <button class="md-discard-btn" style="
                            padding: 6px 14px;
                            background: transparent;
                            color: ${isDark ? '#aaa' : '#666'};
                            border: 1px solid ${isDark ? '#555' : '#ccc'};
                            border-radius: 4px;
                            cursor: pointer;
                            font-size: 13px;
                        ">Verwerfen</button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(dialog);

        dialog.querySelector('.md-restore-btn').addEventListener('click', () => {
            $textarea.value = draft.content;
            $textarea.dispatchEvent(new Event('input', { bubbles: true }));
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

        indicator.textContent = 'Entwurf gespeichert';
        indicator.style.opacity = '1';

        setTimeout(() => {
            indicator.style.opacity = '0';
        }, 2000);
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
        }
    }

    // ==========================================================================
    // KEYBOARD SHORTCUTS
    // ==========================================================================

    function setupKeyboardShortcuts() {
        $textarea.addEventListener('keydown', (e) => {
            const ctrl = e.ctrlKey || e.metaKey;

            if (!ctrl) return;

            // Find button with matching shortcut
            for (const [id, def] of Object.entries(BUTTONS)) {
                if (!def.shortcut) continue;
                if (!CONFIG.enabledButtons.includes(id)) continue;

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
