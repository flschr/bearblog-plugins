// @name         Bear Blog Markdown Toolbar
// @version      1.0
// @description  Toolbar with Markdown buttons in the Bear Blog editor
// @author       René Fischer
// @website      https://fischr.org

(function() {
    'use strict';

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    function init() {
        const $textarea = document.getElementById('body_content');
        if (!$textarea || $textarea.hasAttribute('data-toolbar-initialized')) return;
        
        $textarea.setAttribute('data-toolbar-initialized', 'true');
        createMarkdownToolbar($textarea);
    }

    function createMarkdownToolbar($textarea) {
        if (document.querySelector('.markdown-toolbar')) return;

        const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const toolbar = document.createElement('div');
        toolbar.className = 'markdown-toolbar';
        
        toolbar.style.cssText = `
            display: flex; gap: 5px; padding: 8px;
            background-color: ${isDark ? '#004052' : '#eceff4'};
            border-bottom: 1px solid ${isDark ? '#005566' : 'lightgrey'};
            flex-wrap: wrap; position: sticky; top: 0; z-index: 100; box-sizing: border-box;
        `;

        const buttons = [
            { label: '𝐁', title: 'Bold', syntax: ['**', '**'], shortcut: 'b' },
            { label: '𝐼', title: 'Italic', syntax: ['*', '*'], shortcut: 'i' },
            { label: 'H1', title: 'H1', syntax: ['# ', ''], lineStart: true },
            { label: 'H2', title: 'H2', syntax: ['## ', ''], lineStart: true },
            { label: '🔗', title: 'Link (Ctrl+K)', syntax: ['[', ']('], shortcut: 'k' },
            { label: '❝', title: 'Quote', syntax: ['> ', ''], lineStart: true },
            { label: '⟨⟩', title: 'Code', syntax: ['`', '`'] },
            { label: '✎', title: 'Cite', syntax: ['<cite>', '</cite>'] },
            { label: '•', title: 'List', syntax: ['- ', ''], lineStart: true },
            { label: '―', title: 'HR', syntax: ['\n---\n', ''] },
            // Neue Buttons am Ende
            { label: 'ⓘ', title: 'Info Box', syntax: ['<div class="infobox-frame info">\n    <div class="infobox-icon"></div>\n    <div class="infobox-text">', '</div>\n</div>'], customCursor: true },
            { label: '⚠️', title: 'Warning Box', syntax: ['<div class="infobox-frame warning">\n    <div class="infobox-icon"></div>\n    <div class="infobox-text">', '</div>\n</div>'], customCursor: true }
        ];

        buttons.forEach(btn => {
            const button = document.createElement('button');
            button.type = 'button';
            button.textContent = btn.label;
            button.title = btn.title;
            button.style.cssText = `
                padding: 5px 10px; background: ${isDark ? '#01242e' : 'white'};
                color: ${isDark ? '#ddd' : '#222'}; border: 1px solid ${isDark ? '#555' : '#ccc'};
                border-radius: 3px; cursor: pointer; font-size: 13px; font-weight: 600;
                min-width: 32px; display: flex; align-items: center; justify-content: center;
            `;

            button.addEventListener('click', async (e) => {
                e.preventDefault();
                await insertMarkdown($textarea, btn.syntax[0], btn.syntax[1], btn.lineStart);
            });
            toolbar.appendChild(button);
        });

        $textarea.parentNode.insertBefore(toolbar, $textarea);
        addKeyboardShortcuts($textarea, buttons);
    }

    async function insertMarkdown($textarea, before, after, lineStart = false) {
        const start = $textarea.selectionStart;
        const end = $textarea.selectionEnd;
        const selectedText = $textarea.value.substring(start, end);
        const beforeText = $textarea.value.substring(0, start);
        const afterText = $textarea.value.substring(end);
        
        let newText, newCursorPos;

        // 1. Link-Speziallogik
        if (before === '[' && after === '](') {
            let url = '';
            try {
                const clipText = (await navigator.clipboard.readText()).trim();
                if (clipText.toLowerCase().startsWith('http')) {
                    url = clipText;
                }
            } catch (err) {}
            const linkSuffix = `](${url})`;
            newText = beforeText + before + selectedText + linkSuffix + afterText;
            newCursorPos = url === '' ? start + before.length + selectedText.length + 2 : start + before.length + selectedText.length + linkSuffix.length;
        } 
        // 2. Infobox-Speziallogik (Cursor in die Mitte setzen)
        else if (before.includes('infobox-text')) {
            newText = beforeText + before + selectedText + after + afterText;
            newCursorPos = start + before.length;
        }
        // 3. Zeilenanfang (H1, Liste, etc.)
        else if (lineStart) {
            const lineStartPos = beforeText.lastIndexOf('\n') + 1;
            const linePrefix = beforeText.substring(lineStartPos);
            if (linePrefix.trim().startsWith(before.trim())) {
                newText = beforeText.substring(0, lineStartPos) + beforeText.substring(lineStartPos + before.length) + selectedText + afterText;
                newCursorPos = start - before.length;
            } else {
                newText = beforeText.substring(0, lineStartPos) + before + beforeText.substring(lineStartPos) + selectedText + afterText;
                newCursorPos = start + before.length;
            }
        } 
        // 4. Standard (Fett, Kursiv, etc.)
        else {
            newText = beforeText + before + selectedText + after + afterText;
            newCursorPos = selectedText ? end + before.length + after.length : start + before.length;
        }

        $textarea.value = newText;
        $textarea.setSelectionRange(newCursorPos, newCursorPos);
        $textarea.focus();
        $textarea.dispatchEvent(new Event('input', { bubbles: true }));
    }

    function addKeyboardShortcuts($textarea, buttons) {
        $textarea.addEventListener('keydown', async (e) => {
            if ((e.ctrlKey || e.metaKey) && !e.shiftKey) {
                const btn = buttons.find(b => b.shortcut === e.key.toLowerCase());
                if (btn) {
                    e.preventDefault();
                    await insertMarkdown($textarea, btn.syntax[0], btn.syntax[1], btn.lineStart);
                }
            }
        });
    }
})();