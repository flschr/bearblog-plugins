// Optimierte Markdown-Toolbar für Bear Blog Editor
(function() {
    'use strict';
    
    // Warte bis DOM vollständig geladen ist
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
    function init() {
        const $textarea = document.getElementById('body_content');
        if (!$textarea) {
            console.warn('Textarea #body_content nicht gefunden');
            return;
        }
        
        // Verhindere doppelte Initialisierung
        if ($textarea.hasAttribute('data-toolbar-initialized')) {
            return;
        }
        $textarea.setAttribute('data-toolbar-initialized', 'true');
        
        createMarkdownToolbar($textarea);
    }
    
    function createMarkdownToolbar($textarea) {
        // Prüfe ob bereits eine Toolbar existiert
        if (document.querySelector('.markdown-toolbar')) {
            return;
        }
        
        const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        
        const toolbar = document.createElement('div');
        toolbar.className = 'markdown-toolbar';
        toolbar.setAttribute('role', 'toolbar');
        toolbar.setAttribute('aria-label', 'Markdown formatting toolbar');
        
        // Optimierte Styles mit CSS Variables
        toolbar.style.cssText = `
            display: flex;
            gap: 5px;
            padding: 8px;
            background-color: ${isDark ? '#004052' : '#eceff4'};
            border-bottom: 1px solid ${isDark ? '#005566' : 'lightgrey'};
            flex-wrap: wrap;
            position: sticky;
            top: 0;
            z-index: 100;
            box-sizing: border-box;
        `;
        
        const buttons = [
            { label: '𝐁', title: 'Bold (Ctrl+B)', syntax: ['**', '**'], shortcut: 'b' },
            { label: '𝐼', title: 'Italic (Ctrl+I)', syntax: ['*', '*'], shortcut: 'i' },
            { label: 'H1', title: 'Heading 1', syntax: ['# ', ''], lineStart: true },
            { label: 'H2', title: 'Heading 2', syntax: ['## ', ''], lineStart: true },
            { label: 'H3', title: 'Heading 3', syntax: ['### ', ''], lineStart: true },
            { label: '🔗', title: 'Link (Ctrl+K)', syntax: ['[', '](url)'], shortcut: 'k' },
            { label: '❝', title: 'Blockquote', syntax: ['> ', ''], lineStart: true },
            { label: '⟨⟩', title: 'Code', syntax: ['`', '`'] },
            { label: '✎', title: 'Cite', syntax: ['<cite>', '</cite>'] },
            { label: '•', title: 'List', syntax: ['- ', ''], lineStart: true },
            { label: '―', title: 'Horizontal Rule', syntax: ['\n---\n', ''] }
        ];
        
        const fragment = document.createDocumentFragment();
        
        buttons.forEach(btn => {
            const button = document.createElement('button');
            button.type = 'button';
            button.textContent = btn.label;
            button.title = btn.title;
            button.setAttribute('aria-label', btn.title);
            button.className = 'md-btn';
            
            button.style.cssText = `
                padding: 5px 10px;
                background: ${isDark ? '#01242e' : 'white'};
                color: ${isDark ? '#ddd' : '#222'};
                border: 1px solid ${isDark ? '#555' : '#ccc'};
                border-radius: 3px;
                cursor: pointer;
                font-size: 13px;
                font-weight: 600;
                transition: background-color 0.15s ease;
                user-select: none;
                min-width: 32px;
            `;
            
            // Event Listener mit passive flag für bessere Performance
            button.addEventListener('mouseenter', () => {
                button.style.backgroundColor = isDark ? '#003040' : '#f0f0f0';
            }, { passive: true });
            
            button.addEventListener('mouseleave', () => {
                button.style.backgroundColor = isDark ? '#01242e' : 'white';
            }, { passive: true });
            
            button.addEventListener('click', (e) => {
                e.preventDefault();
                insertMarkdown($textarea, btn.syntax[0], btn.syntax[1], btn.lineStart);
            });
            
            fragment.appendChild(button);
        });
        
        toolbar.appendChild(fragment);
        
        // Füge Toolbar vor dem Textarea ein
        $textarea.parentNode.insertBefore(toolbar, $textarea);
        
        // Keyboard Shortcuts
        addKeyboardShortcuts($textarea, buttons);
        
        // Dark Mode Observer
        observeDarkMode(toolbar, isDark);
    }
    
    function insertMarkdown($textarea, before, after, lineStart = false) {
        const start = $textarea.selectionStart;
        const end = $textarea.selectionEnd;
        const selectedText = $textarea.value.substring(start, end);
        const beforeText = $textarea.value.substring(0, start);
        const afterText = $textarea.value.substring(end);
        
        let newText, newCursorPos;
        
        if (lineStart) {
            // Für Zeilenanfangs-Syntax (H1, H2, Liste, etc.)
            const lineStartPos = beforeText.lastIndexOf('\n') + 1;
            const linePrefix = beforeText.substring(lineStartPos);
            
            // Prüfe ob Syntax bereits am Zeilenanfang existiert
            if (linePrefix.trim().startsWith(before.trim())) {
                // Entferne existierende Syntax
                const textBeforeLine = beforeText.substring(0, lineStartPos);
                const textAfterPrefix = beforeText.substring(lineStartPos + before.length);
                newText = textBeforeLine + textAfterPrefix + selectedText + after + afterText;
                newCursorPos = start - before.length;
            } else {
                // Füge Syntax am Zeilenanfang hinzu
                const textBeforeLine = beforeText.substring(0, lineStartPos);
                const restOfLine = beforeText.substring(lineStartPos);
                newText = textBeforeLine + before + restOfLine + selectedText + after + afterText;
                newCursorPos = start + before.length;
            }
        } else if (selectedText) {
            // Wenn Text markiert ist, umschließe ihn
            newText = beforeText + before + selectedText + after + afterText;
            newCursorPos = end + before.length + after.length;
        } else {
            // Sonst füge die Syntax ein und setze Cursor zwischen die Marker
            newText = beforeText + before + after + afterText;
            newCursorPos = start + before.length;
        }
        
        // Optimierte Textarea-Aktualisierung
        $textarea.value = newText;
        $textarea.setSelectionRange(newCursorPos, newCursorPos);
        $textarea.focus();
        
        // Trigger input event für Autosave
        $textarea.dispatchEvent(new Event('input', { bubbles: true }));
    }
    
    function addKeyboardShortcuts($textarea, buttons) {
        const shortcutMap = {};
        buttons.forEach(btn => {
            if (btn.shortcut) {
                shortcutMap[btn.shortcut] = btn;
            }
        });
        
        $textarea.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && !e.shiftKey && !e.altKey) {
                const key = e.key.toLowerCase();
                if (shortcutMap[key]) {
                    e.preventDefault();
                    const btn = shortcutMap[key];
                    insertMarkdown($textarea, btn.syntax[0], btn.syntax[1], btn.lineStart);
                }
            }
        });
    }
    
    function observeDarkMode(toolbar, initialDark) {
        // Beobachte Dark Mode Änderungen
        const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');
        
        const updateColors = (isDark) => {
            toolbar.style.backgroundColor = isDark ? '#004052' : '#eceff4';
            toolbar.style.borderBottomColor = isDark ? '#005566' : 'lightgrey';
            
            const buttons = toolbar.querySelectorAll('.md-btn');
            buttons.forEach(btn => {
                btn.style.backgroundColor = isDark ? '#01242e' : 'white';
                btn.style.color = isDark ? '#ddd' : '#222';
                btn.style.borderColor = isDark ? '#555' : '#ccc';
            });
        };
        
        // Modern Browser
        if (darkModeQuery.addEventListener) {
            darkModeQuery.addEventListener('change', (e) => updateColors(e.matches));
        } 
        // Fallback für ältere Browser
        else if (darkModeQuery.addListener) {
            darkModeQuery.addListener((e) => updateColors(e.matches));
        }
    }
})();