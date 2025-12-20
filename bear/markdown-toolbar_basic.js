(function() {
    'use strict';

    let currentMode = localStorage.getItem('bear_toolbar_mode') || 'basic';

    const init = () => {
        const $textarea = document.getElementById('body_content');
        if (!$textarea || $textarea.hasAttribute('data-toolbar-initialized')) return;
        
        $textarea.setAttribute('data-toolbar-initialized', 'true');
        renderApp($textarea);

        // Clean UI
        document.querySelectorAll('.helptext.sticky, body > footer').forEach(el => el.style.display = 'none');
    };

    // Robustes Laden
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => setTimeout(init, 150));
    } else {
        setTimeout(init, 150);
    }

    function renderApp($textarea) {
        const oldToolbar = document.querySelector('.markdown-toolbar');
        if (oldToolbar) oldToolbar.remove();
        createMarkdownToolbar($textarea);
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
            help: '<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/></svg>',
            settings: '<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>'
        };

        const allButtons = [
            { label: ICONS.bold, title: 'Bold', syntax: ['**', '**'], advanced: false },
            { label: ICONS.italic, title: 'Italic', syntax: ['*', '*'], advanced: false },
            { label: ICONS.h1, title: 'H1', syntax: ['# ', ''], lineStart: true, advanced: false },
            { label: ICONS.h2, title: 'H2', syntax: ['## ', ''], lineStart: true, advanced: false },
            { label: ICONS.h3, title: 'H3', syntax: ['### ', ''], lineStart: true, advanced: false },
            { label: ICONS.link, title: 'Link', syntax: ['[', ']('], advanced: false },
            { label: ICONS.quote, title: 'Quote', syntax: ['> ', ''], lineStart: true, advanced: false },
            { label: ICONS.cite, title: 'Cite', syntax: ['<cite>', '</cite>'], advanced: true },
            { label: ICONS.image, title: 'Insert Media', action: 'upload', advanced: false },
            { label: ICONS.code, title: 'Code', syntax: ['`', '`'], advanced: false },
            { label: ICONS.codeBlock, title: 'Code Block', action: 'codeBlock', advanced: true },
            { label: ICONS.list, title: 'List', syntax: ['- ', ''], lineStart: true, advanced: false },
            { label: ICONS.hr, title: 'HR', syntax: ['\n---\n', ''], advanced: false },
            { label: ICONS.table, title: 'Table', syntax: ['\n| Header 1 | Header 2 |\n|----------|----------|\n| Cell 1 | Cell 2 |\n', ''], advanced: false },
            { label: ICONS.info, title: 'Info Box', syntax: ['<div class="infobox-frame info">\n    <div class="infobox-icon"></div>\n    <div class="infobox-text">', '</div>\n</div>'], advanced: true },
            { label: ICONS.warning, title: 'Warning Box', syntax: ['<div class="infobox-frame warning">\n    <div class="infobox-icon"></div>\n    <div class="infobox-text">', '</div>\n</div>'], advanced: true },
            { label: ICONS.star, title: 'Rating', syntax: ['(★★★☆☆)', ''], advanced: true }
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

        const visibleButtons = currentMode === 'advanced' ? allButtons : allButtons.filter(btn => !btn.advanced);

        visibleButtons.forEach(btn => {
            const b = createBtn(btn.label, btn.title, isDark);
            b.onclick = () => btn.action ? handleAction(btn.action, $textarea) : insertMarkdown($textarea, btn.syntax[0], btn.syntax[1], btn.lineStart);
            toolbar.appendChild(b);
        });

        const menuWrapper = document.createElement('div');
        menuWrapper.style.position = 'relative';
        const menuBtn = createBtn(ICONS.more, "More Options", isDark);
        const dropdown = document.createElement('div');
        dropdown.style.cssText = `display: none; position: absolute; top: 34px; right: 0; background: ${isDark ? '#01242e' : 'white'}; border: 1px solid ${isDark ? '#555' : '#ccc'}; border-radius: 4px; z-index: 1000; min-width: 180px; box-shadow: 0 4px 12px rgba(0,0,0,0.3); overflow: hidden;`;

        const dashboardPath = window.location.pathname.split('posts/')[0];

        const menuItems = [
            { label: ICONS.gallery, text: 'Gallery', action: () => window.open(`${dashboardPath}media/`, '_blank') },
            { label: ICONS.preview, text: 'Preview', action: () => document.getElementById('preview').click() },
            { label: ICONS.help, text: 'Markdown Help', action: () => window.open('https://herman.bearblog.dev/markdown-cheatsheet/', '_blank') },
            { divider: true },
            { 
                label: ICONS.settings, 
                text: currentMode === 'basic' ? 'Switch to Advanced' : 'Switch to Basic', 
                action: () => {
                    currentMode = currentMode === 'basic' ? 'advanced' : 'basic';
                    localStorage.setItem('bear_toolbar_mode', currentMode);
                    renderApp($textarea);
                } 
            }
        ];

        menuItems.forEach(item => {
            if (item.divider) {
                const d = document.createElement('div');
                d.style.height = '1px'; d.style.background = isDark ? '#555' : '#ccc'; d.style.margin = '4px 0';
                dropdown.appendChild(d);
                return;
            }
            const div = document.createElement('div');
            div.style.cssText = `padding: 10px 14px; cursor: pointer; display: flex; align-items: center; gap: 10px; font-size: 13px; color: ${isDark ? '#ddd' : '#444'};`;
            div.innerHTML = `${item.label} <span>${item.text}</span>`;
            div.onclick = (e) => { e.stopPropagation(); item.action(); dropdown.style.display = 'none'; };
            div.onmouseover = () => div.style.backgroundColor = isDark ? '#004052' : '#f5f5f5';
            div.onmouseout = () => div.style.backgroundColor = 'transparent';
            dropdown.appendChild(div);
        });

        menuBtn.onclick = (e) => { e.stopPropagation(); dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none'; };
        document.addEventListener('click', () => dropdown.style.display = 'none');
        menuWrapper.append(menuBtn, dropdown);
        toolbar.appendChild(menuWrapper);

        wrapper.insertBefore(toolbar, $textarea);
    }

    function handleAction(action, $textarea) {
        if (action === 'upload') document.getElementById('upload-image').click();
        if (action === 'codeBlock') insertMarkdown($textarea, `\n\`\`\`\n`, `\n\`\`\`\n`);
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
            newPos = selected ? start + before.length + selected.length + after.length : start + before.length;
        }

        $textarea.value = newText;
        $textarea.setSelectionRange(newPos, newPos);
        $textarea.focus();
        $textarea.dispatchEvent(new Event('input', { bubbles: true }));
    }
})();