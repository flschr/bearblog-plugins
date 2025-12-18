// @name         Bear Blog Markdown Toolbar
// @version      0.2.1
// @description  Markdown Toolbar with Media upload ntegration
// @author       René Fischer

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

        // Blendet die untere Hilfe-Leiste aus
        const footerHelp = document.querySelector('.helptext.sticky');
        if (footerHelp) {
            footerHelp.style.display = 'none';
        }
    }

    function createMarkdownToolbar($textarea) {
        if (document.querySelector('.markdown-toolbar')) return;

        const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const toolbar = document.createElement('div');
        toolbar.className = 'markdown-toolbar';
        
        toolbar.style.cssText = `
            display: flex; gap: 4px; padding: 8px; align-items: center;
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
            { label: '✎', title: 'Cite', syntax: ['<cite>', '</cite>'] },
            { label: '🖼️', title: 'Insert Media', action: 'upload' },
            { label: '⟨⟩', title: 'Code', syntax: ['`', '`'] },
            { label: '•', title: 'List', syntax: ['- ', ''], lineStart: true },
            { label: '―', title: 'HR', syntax: ['\n---\n', ''] },
            { label: 'ⓘ', title: 'Info Box', syntax: ['<div class="infobox-frame info">\n    <div class="infobox-icon"></div>\n    <div class="infobox-text">', '</div>\n</div>'] },
            { label: '⚠️', title: 'Warning Box', syntax: ['<div class="infobox-frame warning">\n    <div class="infobox-icon"></div>\n    <div class="infobox-text">', '</div>\n</div>'] },
            { type: 'separator' },
            { label: '📁', title: 'Media Gallery', action: 'gallery' },
            { label: '👁️', title: 'Preview', action: 'preview' },
            { label: '?', title: 'Markdown Help', action: 'help' }
        ];

        buttons.forEach(btn => {
            if (btn.type === 'separator') {
                const sep = document.createElement('div');
                sep.style.cssText = `width: 1px; height: 24px; background: ${isDark ? '#555' : '#ccc'}; margin: 0 4px;`;
                toolbar.appendChild(sep);
                return;
            }

            const button = document.createElement('button');
            button.type = 'button';
            button.textContent = btn.label;
            button.title = btn.title;
            
            // Einheitliche Maße: 32x32 Pixel
            button.style.cssText = `
                width: 32px; height: 32px; padding: 0;
                background: ${isDark ? '#01242e' : 'white'};
                color: ${isDark ? '#ddd' : '#222'}; border: 1px solid ${isDark ? '#555' : '#ccc'};
                border-radius: 3px; cursor: pointer; font-size: 14px; font-weight: 600;
                display: flex; align-items: center; justify-content: center;
                line-height: 1; overflow: hidden;
            `;

            button.addEventListener('click', async (e) => {
                e.preventDefault();
                if (btn.action) {
                    handleAction(btn.action);
                } else {
                    await insertMarkdown($textarea, btn.syntax[0], btn.syntax[1], btn.lineStart);
                }
            });
            toolbar.appendChild(button);
        });

        $textarea.parentNode.insertBefore(toolbar, $textarea);
    }

    function handleAction(action) {
        switch(action) {
            case 'upload':
                document.getElementById('upload-image').click();
                break;
            case 'gallery':
                window.open('/fischr/dashboard/media/', '_blank');
                break;
            case 'preview':
                document.getElementById('preview').click();
                break;
            case 'help':
                window.open('https://herman.bearblog.dev/markdown-cheatsheet/', '_blank');
                break;
        }
    }

    async function insertMarkdown($textarea, before, after, lineStart = false) {
        const start = $textarea.selectionStart;
        const end = $textarea.selectionEnd;
        const selectedText = $textarea.value.substring(start, end);
        const beforeText = $textarea.value.substring(0, start);
        const afterText = $textarea.value.substring(end);
        
        let newText, newCursorPos;

        if (before === '[' && after === '](') {
            let url = '';
            try {
                const clipText = (await navigator.clipboard.readText()).trim();
                if (clipText.toLowerCase().startsWith('http')) { url = clipText; }
            } catch (err) {}
            const linkSuffix = `](${url})`;
            newText = beforeText + before + selectedText + linkSuffix + afterText;
            newCursorPos = url === '' ? start + before.length + selectedText.length + 2 : start + before.length + selectedText.length + linkSuffix.length;
        } else if (before.includes('infobox-text')) {
            newText = beforeText + before + selectedText + after + afterText;
            newCursorPos = start + before.length;
        } else if (lineStart) {
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
})();