// @name         Bear Blog Markdown Toolbar (Extended)
// @version      0.3.1
// @author       René Fischer

(function() {
    'use strict';

    const init = () => {
        const $textarea = document.getElementById('body_content');
        if (!$textarea || $textarea.hasAttribute('data-toolbar-initialized')) return;
        
        $textarea.setAttribute('data-toolbar-initialized', 'true');
        createMarkdownToolbar($textarea);

        document.querySelectorAll('.helptext.sticky, body > footer').forEach(el => el.style.display = 'none');
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    function createMarkdownToolbar($textarea) {
        const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const wrapper = $textarea.parentElement;
        wrapper.style.position = 'relative';

        const toolbar = document.createElement('div');
        toolbar.className = 'markdown-toolbar';
        toolbar.style.cssText = `
            display: flex; gap: 4px; padding: 8px; align-items: center;
            background-color: ${isDark ? '#004052' : '#eceff4'};
            border-bottom: 1px solid ${isDark ? '#005566' : 'lightgrey'};
            position: sticky; top: 0; z-index: 100; box-sizing: border-box; flex-wrap: wrap;
        `;

        const ICONS = {
            bold: '<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2.5" fill="none"><path d="M6 12h9a4 4 0 0 1 0 8H6v-8Z"/><path d="M6 4h7a4 4 0 0 1 0 8H6V4Z"/></svg>',
            italic: '<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2.5" fill="none"><line x1="19" y1="4" x2="10" y2="4"/><line x1="14" y1="20" x2="5" y2="20"/><line x1="15" y1="4" x2="9" y2="20"/></svg>',
            h1: 'H1', h2: 'H2', h3: 'H3',
            link: '<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.72"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.72-1.72"/></svg>',
            quote: '<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2.5" fill="none"><path d="M3 21c3 0 7-1 7-8V5c0-1.25-.75-2-2-2H4c-1.25 0-2 .75-2 2v6c0 7 4 8 8 8Z"/><path d="M14 21c3 0 7-1 7-8V5c0-1.25-.75-2-2-2h-4c-1.25 0-2 .75-2 2v6c0 7 4 8 8 8Z"/></svg>',
            cite: '<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none"><path d="m16 3 4 4L8 19H4v-4L16 3z"/><path d="M2 21h20"/></svg>',
            image: '<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>',
            code: '<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>',
            codeBlock: '<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="m10 10-2 2 2 2"/><path d="m14 14 2-2-2-2"/></svg>',
            list: '<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2.5" fill="none"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><path d="M3 6h.01M3 12h.01M3 18h.01"/></svg>',
            hr: '<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2.5" fill="none"><line x1="5" y1="12" x2="19" y2="12"/></svg>',
            table: '<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 3v18"/></svg>',
            info: '<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2.5" fill="none"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>',
            warning: '<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2.5" fill="none"><path d="m21.73 18-8-14a2 2 0 0 0-3.46 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4M12 17h.01"/></svg>',
            star: '<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>',
            more: '<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2.5" fill="none"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>',
            gallery: '<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>',
            preview: '<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>',
            help: '<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/></svg>'
        };

        const buttons = [
            { label: ICONS.bold, title: 'Bold', syntax: ['**', '**'] },
            { label: ICONS.italic, title: 'Italic', syntax: ['*', '*'] },
            { label: ICONS.h1, title: 'H1', syntax: ['# ', ''], lineStart: true },
            { label: ICONS.h2, title: 'H2', syntax: ['## ', ''], lineStart: true },
            { label: ICONS.h3, title: 'H3', syntax: ['### ', ''], lineStart: true },
            { label: ICONS.link, title: 'Link', syntax: ['[', ']('] },
            { label: ICONS.quote, title: 'Quote', syntax: ['> ', ''], lineStart: true },
            { label: ICONS.cite, title: 'Cite', syntax: ['<cite>', '</cite>'] },
            { label: ICONS.image, title: 'Insert Media', action: 'upload' },
            { label: ICONS.code, title: 'Code', syntax: ['`', '`'] },
            { label: ICONS.codeBlock, title: 'Code Block', action: 'codeBlock' },
            { label: ICONS.list, title: 'List', syntax: ['- ', ''], lineStart: true },
            { label: ICONS.hr, title: 'HR', syntax: ['\n---\n', ''] },
            { label: ICONS.table, title: 'Table', syntax: ['\n| Header 1 | Header 2 |\n|----------|----------|\n| Cell 1 | Cell 2 |\n', ''] },
            { label: ICONS.info, title: 'Info Box', syntax: ['<div class="infobox-frame info">\n    <div class="infobox-icon"></div>\n    <div class="infobox-text">', '</div>\n</div>'] },
            { label: ICONS.warning, title: 'Warning Box', syntax: ['<div class="infobox-frame warning">\n    <div class="infobox-icon"></div>\n    <div class="infobox-text">', '</div>\n</div>'] },
            { label: ICONS.star, title: 'Rating', syntax: ['(★★★☆☆)', ''] }
        ];

        const menuItems = [
            { label: ICONS.gallery, text: 'Gallery', action: 'gallery' },
            { label: ICONS.preview, text: 'Preview', action: 'preview' },
            { label: ICONS.help, text: 'Markdown Help', action: 'help' }
        ];

        const createBtn = (html, title, isDark) => {
            const b = document.createElement('button');
            b.type = 'button'; b.innerHTML = html; b.title = title;
            if (html.length <= 2) {
                b.style.fontWeight = '800'; b.style.fontSize = '13px'; b.style.fontFamily = 'system-ui, sans-serif';
            }
            b.style.cssText += `width: 32px; height: 32px; flex-shrink: 0; background: ${isDark ? '#01242e' : 'white'}; color: ${isDark ? '#ddd' : '#444'}; border: 1px solid ${isDark ? '#555' : '#ccc'}; border-radius: 3px; cursor: pointer; display: flex; align-items: center; justify-content: center;`;
            return b;
        };

        buttons.forEach(btn => {
            const b = createBtn(btn.label, btn.title, isDark);
            b.onclick = () => btn.action ? handleAction(btn.action, $textarea) : insertMarkdown($textarea, btn.syntax[0], btn.syntax[1], btn.lineStart);
            toolbar.appendChild(b);
        });

        const menuWrapper = document.createElement('div');
        menuWrapper.style.position = 'relative';
        const menuBtn = createBtn(ICONS.more, "More Options", isDark);
        const dropdown = document.createElement('div');
        dropdown.style.cssText = `display: none; position: absolute; top: 34px; right: 0; background: ${isDark ? '#01242e' : 'white'}; border: 1px solid ${isDark ? '#555' : '#ccc'}; border-radius: 4px; z-index: 1000; min-width: 140px; box-shadow: 0 4px 12px rgba(0,0,0,0.3);`;

        menuItems.forEach(item => {
            const div = document.createElement('div');
            div.style.cssText = `padding: 10px 14px; cursor: pointer; display: flex; align-items: center; gap: 10px; font-size: 13px; color: ${isDark ? '#ddd' : '#444'};`;
            div.innerHTML = `${item.label} <span>${item.text}</span>`;
            div.onclick = () => { handleAction(item.action, $textarea); dropdown.style.display = 'none'; };
            div.onmouseover = () => div.style.backgroundColor = isDark ? '#004052' : '#f5f5f5';
            div.onmouseout = () => div.style.backgroundColor = 'transparent';
            dropdown.appendChild(div);
        });

        menuBtn.onclick = (e) => { e.stopPropagation(); dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none'; };
        document.addEventListener('click', () => dropdown.style.display = 'none');
        menuWrapper.append(menuBtn, dropdown);
        toolbar.appendChild(menuWrapper);

        const counter = document.createElement('div');
        counter.id = 'char-counter-floating';
        counter.style.cssText = `position: fixed; bottom: 20px; right: 20px; padding: 4px 12px; border-radius: 6px; font-size: 16px; font-weight: 700; font-family: ui-sans-serif, sans-serif; pointer-events: none; z-index: 999999; opacity: 0.95; border: 1.5px solid ${isDark ? '#555' : '#ccc'}; box-shadow: 0 2px 8px rgba(0,0,0,0.2); transition: all 0.2s;`;
        
        const updateCounter = () => {
            const len = $textarea.value.length;
            counter.innerText = len;
            if (len >= 300) { counter.style.background = '#d32f2f'; counter.style.color = '#fff'; counter.style.borderColor = '#b71c1c'; }
            else if (len >= 250) { counter.style.background = '#fbc02d'; counter.style.color = '#000'; counter.style.borderColor = '#f9a825'; }
            else { counter.style.background = isDark ? '#01242e' : '#fff'; counter.style.color = isDark ? '#aaa' : '#666'; counter.style.borderColor = isDark ? '#555' : '#ccc'; }
        };

        $textarea.addEventListener('input', updateCounter);
        updateCounter();

        wrapper.insertBefore(toolbar, $textarea);
        document.body.appendChild(counter);
    }

    function handleAction(action, $textarea) {
        switch(action) {
            case 'upload': document.getElementById('upload-image').click(); break;
            case 'gallery': window.open('/fischr/dashboard/media/', '_blank'); break;
            case 'preview': document.getElementById('preview').click(); break;
            case 'help': window.open('https://herman.bearblog.dev/markdown-cheatsheet/', '_blank'); break;
            case 'codeBlock':
                insertMarkdown($textarea, `\n\`\`\`\n`, `\n\`\`\`\n`);
                break;
        }
    }

    async function insertMarkdown($textarea, before, after, lineStart = false) {
        const start = $textarea.selectionStart, end = $textarea.selectionEnd;
        const selected = $textarea.value.substring(start, end);
        let newText, newPos;

        if (before === '[' && after === '](') {
            let url = ''; try { const clip = await navigator.clipboard.readText(); if (clip.trim().startsWith('http')) url = clip.trim(); } catch(e){}
            newText = $textarea.value.substring(0, start) + '[' + selected + '](' + url + ')' + $textarea.value.substring(end);
            newPos = url ? start + selected.length + url.length + 3 : start + selected.length + 3;
        } else if (lineStart) {
            const lineStartPos = $textarea.value.substring(0, start).lastIndexOf('\n') + 1;
            newText = $textarea.value.substring(0, lineStartPos) + before + $textarea.value.substring(lineStartPos, start) + selected + after + $textarea.value.substring(end);
            newPos = start + before.length;
        } else {
            newText = $textarea.value.substring(0, start) + before + selected + after + $textarea.value.substring(end);
            // Cursor-Logik: Falls kein Text markiert ist, in die Mitte springen. Falls markiert, ans Ende des Blocks.
            newPos = selected ? start + before.length + selected.length + after.length : start + before.length;
        }

        $textarea.value = newText;
        $textarea.setSelectionRange(newPos, newPos);
        $textarea.focus();
        $textarea.dispatchEvent(new Event('input', { bubbles: true }));
    }
})();