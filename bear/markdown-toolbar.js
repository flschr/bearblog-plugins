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

        // Hides the bottom help bar
        const footerHelp = document.querySelector('.helptext.sticky');
        if (footerHelp) {
            footerHelp.style.display = 'none';
        }

        // Hides the page footer
        const siteFooter = document.querySelector('body > footer');
        if (siteFooter) {
            siteFooter.style.display = 'none';
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

        const ICONS = {
            bold: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"></path><path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"></path></svg>',
            italic: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="4" x2="10" y2="4"></line><line x1="14" y1="20" x2="5" y2="20"></line><line x1="15" y1="4" x2="9" y2="20"></line></svg>',
            h1: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12h8"></path><path d="M4 18V6"></path><path d="M12 18V6"></path><path d="M21 18h-2c-1.1 0-2-1.8-2-4s.9-4 2-4h2"></path></svg>',
            h2: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12h8"></path><path d="M4 18V6"></path><path d="M12 18V6"></path><path d="M21 18h-4c0-4 4-3 4-6 0-1.7-1.3-3-3-3s-3 1.3-3 3"></path></svg>',
            h3: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12h8"></path><path d="M4 18V6"></path><path d="M12 18V6"></path><path d="M17.5 10.5c1.7 0 3 1.3 3 3s-1.3 3-3 3h-2V18"></path><path d="M17.5 10.5h-2V12"></path></svg>',
            link: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.72"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.72-1.72"></path></svg>',
            quote: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21c3 0 7-1 7-8V5c0-1.25-.75-2-2-2H4c-1.25 0-2 .75-2 2v6c0 7 4 8 8 8Z"></path><path d="M14 21c3 0 7-1 7-8V5c0-1.25-.75-2-2-2h-4c-1.25 0-2 .75-2 2v6c0 7 4 8 8 8Z"></path></svg>',
            cite: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7v2c0 1.1.9 2 2 2h1"></path><path d="M4 11V5c0-1.1.9-2 2-2h1"></path><path d="M11 11h-1c-1.1 0-2-.9-2-2V7"></path><path d="M10 5v1c0 1.1.9 2 2 2h1"></path><path d="M18 11h1c1.1 0 2-.9 2-2V7"></path><path d="M19 5v1c0 1.1.9 2 2 2h1"></path><path d="M21 7v2c0 1.1-.9 2-2 2h-1"></path><path d="M14 5v1c0 1.1-.9 2-2 2h-1"></path><path d="M3 15h18"></path><path d="M3 19h18"></path></svg>',
            image: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>',
            code: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>',
            codeBlock: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline><line x1="10" y1="20" x2="14" y2="4"></line></svg>',
            list: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>',
            hr: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line></svg>',
            table: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="3"></line></svg>',
            info: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>',
            warning: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.46 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>',
            star: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>',
            gallery: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.3 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10l-3.1-3.1a2 2 0 0 0-2.814.014L6 21Z"></path><path d="m14 19.5 3-3a2 2 0 0 1 2.8 0l2.2 2.2"></path><circle cx="9" cy="9" r="2"></circle></svg>',
            preview: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>',
            help: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>',
        };

        const buttons = [
            { label: ICONS.bold, title: 'Bold (Ctrl+B)', syntax: ['**', '**'], shortcut: 'b' },
            { label: ICONS.italic, title: 'Italic (Ctrl+I)', syntax: ['*', '*'], shortcut: 'i' },
            { label: ICONS.h1, title: 'H1 (Ctrl+1)', syntax: ['# ', ''], lineStart: true, shortcut: '1' },
            { label: ICONS.h2, title: 'H2 (Ctrl+2)', syntax: ['## ', ''], lineStart: true, shortcut: '2' },
            { label: ICONS.h3, title: 'H3 (Ctrl+3)', syntax: ['### ', ''], lineStart: true, shortcut: '3' },
            { label: ICONS.link, title: 'Link (Ctrl+K)', syntax: ['[', ']('], shortcut: 'k' },
            { label: ICONS.quote, title: 'Quote (Ctrl+\')', syntax: ['> ', ''], lineStart: true, shortcut: '\'' },
            { label: ICONS.cite, title: 'Cite', syntax: ['<cite>', '</cite>'] },
            { label: ICONS.image, title: 'Insert Media', action: 'upload' },
            { label: ICONS.code, title: 'Code (Ctrl+E)', syntax: ['`', '`'], shortcut: 'e' },
            { label: ICONS.codeBlock, title: 'Code Block (Ctrl+Shift+C)', action: 'codeBlock', shortcut: 'C' },
            { label: ICONS.list, title: 'List (Ctrl+L)', syntax: ['- ', ''], lineStart: true, shortcut: 'l' },
            { label: ICONS.hr, title: 'HR', syntax: ['\n---\n', ''] },
            { label: ICONS.table, title: 'Table', syntax: ['\n| Header 1 | Header 2 |\n|----------|----------|\n| Cell 1   | Cell 2   |\n', ''] },
            { label: ICONS.info, title: 'Info Box', syntax: ['<div class="infobox-frame info">\n    <div class="infobox-icon"></div>\n    <div class="infobox-text">', '</div>\n</div>'] },
            { label: ICONS.warning, title: 'Warning Box', syntax: ['<div class="infobox-frame warning">\n    <div class="infobox-icon"></div>\n    <div class="infobox-text">', '</div>\n</div>'] },
            { label: ICONS.star, title: 'Rating', syntax: ['(★★★☆☆)', ''] },
            { type: 'separator' },
            { label: ICONS.gallery, title: 'Media Gallery', action: 'gallery' },
            { label: ICONS.preview, title: 'Preview', action: 'preview' },
            { label: ICONS.help, title: 'Markdown Help', action: 'help' }
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
            button.innerHTML = btn.label;
            button.title = btn.title;
            
            // Uniform dimensions: 32x32 pixels
            button.style.cssText = `
                width: 32px; height: 32px; padding: 0;
                background: ${isDark ? '#01242e' : 'white'};
                color: ${isDark ? '#ddd' : '#444'}; border: 1px solid ${isDark ? '#555' : '#ccc'};
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

        // Add keyboard shortcuts
        $textarea.addEventListener('keydown', (e) => {
            if (!e.ctrlKey && !e.metaKey) return;

            const key = e.shiftKey ? e.key.toUpperCase() : e.key.toLowerCase();
            // Fix for quote shortcut
            const targetKey = key === 'dead' ? '\'' : key;
            const buttonDef = buttons.find(b => b.shortcut === targetKey);

            if (buttonDef) {
                e.preventDefault();
                if (buttonDef.action) {
                    handleAction(buttonDef.action, $textarea, buttons);
                } else {
                    insertMarkdown($textarea, buttonDef.syntax[0], buttonDef.syntax[1], buttonDef.lineStart);
                }
            }
        });
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
            case 'codeBlock':
                const lang = prompt('Enter language (e.g., javascript, python) or leave empty:');
                const langIdentifier = lang ? lang.trim() : '';
                const before = `\n\`\`\`${langIdentifier}\n`;
                const after = '\n```\n';
                insertMarkdown(document.getElementById('body_content'), before, after);
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