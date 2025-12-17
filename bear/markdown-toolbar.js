// ==UserScript==
// @name         Bear Blog Markdown Toolbar
// @version      1.0
// @description  Toolbar with Markdown buttons in the Bear Blog editor
// @author       René Fischer
// @match        https://fischr.org
// @grant        none
// ==/UserScript==

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
            { label: '𝐁', title: 'Bold', syntax: ['**', '**'] },
            { label: '𝐼', title: 'Italic', syntax: ['*', '*'] },
            { label: 'H1', title: 'H1', syntax: ['# ', ''], lineStart: true },
            { label: 'H2', title: 'H2', syntax: ['## ', ''], lineStart: true },
            { label: '🔗', title: 'Link (Ctrl+K)', syntax: ['[', ']('], shortcut: 'k' },
            { label: '❝', title: 'Quote', syntax: ['> ', ''], lineStart: true },
            { label: '⟨⟩', title: 'Code', syntax: ['`', '`'] },
            { label: '•', title: 'List', syntax: ['- ', ''], lineStart: true },
            { label: '―', title: 'HR', syntax: ['\n---\n', ''] }
        ];

        buttons.forEach(btn => {
            const button = document.createElement('button');
            button.type = 'button';
            button.textContent = btn.label;
            button.className = 'md-btn';
            button.style.cssText = `
                padding: 5px 10px; background: ${isDark ? '#01242e' : 'white'};
                color: ${isDark ? '#ddd' : '#222'}; border: 1px solid ${isDark ? '#555' : '#ccc'};
                border-radius: 3px; cursor: pointer; font-size: 13px; font-weight: 600;
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

        // Speziallogik für Links
        if (before === '[' && after === '](') {
            let url = '';
            try {
                const clipText = await navigator.clipboard.readText();
                if (clipText.startsWith('http') || clipText.includes('.')) {
                    url = clipText.trim();
                }
            } catch (err) {}

            const linkSuffix = `](${url})`;
            newText = beforeText + before + selectedText + linkSuffix + afterText;
            
            // Cursor-Positionierung: In die Klammern, wenn kein Clipboard-Inhalt
            if (!url) {
                newCursorPos = start + before.length + selectedText.length + 2; 
            } else {
                newCursorPos = start + before.length + selectedText.length + linkSuffix.length;
            }
        } 
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
        } else {
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