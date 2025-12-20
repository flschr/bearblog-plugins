(function() {
    'use strict';

    // 1. Setup & State
    let currentMode = localStorage.getItem('bear_toolbar_mode') || 'basic';

    const init = () => {
        const $textarea = document.getElementById('body_content');
        if (!$textarea || $textarea.hasAttribute('data-toolbar-initialized')) return;
        
        $textarea.setAttribute('data-toolbar-initialized', 'true');
        createMarkdownToolbar($textarea);

        // Bear Blog Standard-Kram ausblenden
        document.querySelectorAll('.helptext.sticky, body > footer').forEach(el => el.style.display = 'none');
    };

    // Warten bis alles bereit ist
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => setTimeout(init, 200));
    } else {
        setTimeout(init, 200);
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
            info: 'i',
            warning: '!',
            star: '★',
            more: '<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2.5" fill="none"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>'
        };

        const allButtons = [
            { label: ICONS.bold, title: 'Bold', syntax: ['**', '**'] },
            { label: ICONS.italic, title: 'Italic', syntax: ['*', '*'] },
            { label: ICONS.h1, title: 'H1', syntax: ['# ', ''], lineStart: true },
            { label: ICONS.h2, title: 'H2', syntax: ['## ', ''], lineStart: true },
            { label: ICONS.h3, title: 'H3', syntax: ['### ', ''], lineStart: true },
            { label: ICONS.link, title: 'Link', syntax: ['[', ']('] },
            { label: ICONS.quote, title: 'Quote', syntax: ['> ', ''], lineStart: true },
            { label: ICONS.image, title: 'Insert Media', action: 'upload' },
            { label: ICONS.code, title: 'Code', syntax: ['`', '`'] },
            { label: ICONS.list, title: 'List', syntax: ['- ', ''], lineStart: true },
            { label: ICONS.hr, title: 'HR', syntax: ['\n---\n', ''] },
            { label: ICONS.table, title: 'Table', syntax: ['\n| Header 1 | Header 2 |\n|----------|----------|\n| Cell 1 | Cell 2 |\n', ''] },
            // Advanced Buttons (markiert durch Klasse)
            { label: ICONS.cite, title: 'Cite', syntax: ['<cite>', '</cite>'], adv: true },
            { label: ICONS.codeBlock, title: 'Code Block', action: 'codeBlock', adv: true },
            { label: ICONS.info, title: 'Info Box', syntax: ['<div class="infobox-frame info"><div class="infobox-icon"></div><div class="infobox-text">', '</div></div>'], adv: true },
            { label: ICONS.warning, title: 'Warning Box', syntax: ['<div class="infobox-frame warning"><div class="infobox-icon"></div><div class="infobox-text">', '</div></div>'], adv: true },
            { label: ICONS.star, title: 'Rating', syntax: ['(★★★☆☆)', ''], adv: true }
        ];

        const createBtn = (btnObj) => {
            const b = document.createElement('button');
            b.type = 'button'; b.innerHTML = btnObj.label; b.title = btnObj.title;
            if (btnObj.adv) b.classList.add('adv-btn');
            
            // Sichtbarkeit initial einstellen
            if (btnObj.adv && currentMode === 'basic') b.style.display = 'none';

            b.style.cssText += `width: 32px; height: 32px; flex-shrink: 0; background: ${isDark ? '#01242e' : 'white'}; color: ${isDark ? '#ddd' : '#444'}; border: 1px solid ${isDark ? '#555' : '#ccc'}; border-radius: 3px; cursor: pointer; display: flex; align-items: center; justify-content: center; font-weight: 800;`;
            
            b.onclick = () => btnObj.action ? handleAction(btnObj.action, $textarea) : insertMarkdown($textarea, btnObj.syntax[0], btnObj.syntax[1], btnObj.lineStart);
            return b;
        };

        allButtons.forEach(btn => toolbar.appendChild(createBtn(btn)));

        // Menu (...)
        const menuWrapper = document.createElement('div');
        menuWrapper.style.position = 'relative';
        const menuBtn = createBtn({ label: ICONS.more, title: "More" });
        
        const dropdown = document.createElement('div');
        dropdown.style.cssText = `display: none; position: absolute; top: 34px; right: 0; background: ${isDark ? '#01242e' : 'white'}; border: 1px solid ${isDark ? '#555' : '#ccc'}; border-radius: 4px; z-index: 1000; min-width: 160px; box-shadow: 0 4px 12px rgba(0,0,0,0.3);`;

        const toggleItem = document.createElement('div');
        toggleItem.style.cssText = `padding: 10px; cursor: pointer; font-size: 13px; color: ${isDark ? '#ddd' : '#444'};`;
        toggleItem.innerText = currentMode === 'basic' ? '🚀 Switch to Advanced' : '🌱 Switch to Basic';
        
        toggleItem.onclick = (e) => {
            e.stopPropagation();
            currentMode = currentMode === 'basic' ? 'advanced' : 'basic';
            localStorage.setItem('bear_toolbar_mode', currentMode);
            
            // Buttons umschalten ohne Refresh
            const advButtons = toolbar.querySelectorAll('.adv-btn');
            advButtons.forEach(b => b.style.display = currentMode === 'basic' ? 'none' : 'flex');
            toggleItem.innerText = currentMode === 'basic' ? '🚀 Switch to Advanced' : '🌱 Switch to Basic';
            dropdown.style.display = 'none';
        };

        dropdown.appendChild(toggleItem);
        menuBtn.onclick = (e) => { e.stopPropagation(); dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none'; };
        document.addEventListener('click', () => dropdown.style.display = 'none');

        menuWrapper.append(menuBtn, dropdown);
        toolbar.appendChild(menuWrapper);
        wrapper.insertBefore(toolbar, $textarea);
    }

    function handleAction(action, $textarea) {
        if (action === 'upload') document.getElementById('upload-image').click();
        if (action === 'codeBlock') insertMarkdown($textarea, '\n```\n', '\n```\n');
    }

    function insertMarkdown($textarea, before, after, lineStart = false) {
        const start = $textarea.selectionStart, end = $textarea.selectionEnd;
        const selected = $textarea.value.substring(start, end);
        let newText, newPos;

        if (lineStart) {
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