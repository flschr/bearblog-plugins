(function() {
    'use strict';

    // 1. Setup & State
    let currentMode = 'basic';
    let globalClickListenerAdded = false;
    try {
        currentMode = localStorage.getItem('bear_toolbar_mode') || 'basic';
    } catch(e) {
        // Silent fail - localStorage might be unavailable
    }

    const init = () => {
        const $textarea = document.getElementById('body_content');
        if (!$textarea || $textarea.hasAttribute('data-toolbar-initialized')) return;

        $textarea.setAttribute('data-toolbar-initialized', 'true');

        // Disable browser autocomplete/autocorrect features on mobile
        $textarea.setAttribute('autocomplete', 'off');
        $textarea.setAttribute('autocorrect', 'off');
        $textarea.setAttribute('autocapitalize', 'off');
        $textarea.setAttribute('spellcheck', 'false');

        createMarkdownToolbar($textarea);

        // Bear Blog Standard-Kram ausblenden
        document.querySelectorAll('.helptext.sticky, body > footer').forEach(el => el.style.display = 'none');
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    function createMarkdownToolbar($textarea) {
        const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');
        let isDark = darkModeQuery.matches;
        const wrapper = $textarea.parentElement;
        wrapper.style.position = 'relative';

        // Notice Bar for new version announcement
        const noticeDismissed = localStorage.getItem('bear_notice_v2_dismissed');
        if (!noticeDismissed) {
            const notice = document.createElement('div');
            notice.className = 'markdown-toolbar-notice';
            notice.style.cssText = `
                display: flex; gap: 12px; padding: 12px 16px; align-items: center; justify-content: space-between;
                background: linear-gradient(135deg, ${isDark ? '#1a4a5c' : '#fff3cd'} 0%, ${isDark ? '#0d3a4a' : '#ffeeba'} 100%);
                border-bottom: 2px solid ${isDark ? '#2d6a7a' : '#ffc107'};
                font-family: system-ui, -apple-system, sans-serif; font-size: 14px;
                color: ${isDark ? '#f0f0f0' : '#856404'};
            `;

            const noticeContent = document.createElement('div');
            noticeContent.innerHTML = `
                <strong>🚀 New Version Available!</strong>
                The Markdown Power Editor has been completely rewritten with many new features.
                <a href="https://fischr.org/markdown-power-editor-for-bear-blog/" target="_blank"
                   style="color: ${isDark ? '#7ecfff' : '#0056b3'}; font-weight: 600;">
                   Learn more & upgrade →
                </a>
                <br><small style="opacity: 0.85;">Note: No automatic update – manual installation required.</small>
            `;

            const closeBtn = document.createElement('button');
            closeBtn.type = 'button';
            closeBtn.innerHTML = '✕';
            closeBtn.title = 'Dismiss';
            closeBtn.style.cssText = `
                background: ${isDark ? '#2d6a7a' : '#ffc107'}; border: none; border-radius: 4px;
                width: 28px; height: 28px; cursor: pointer; font-size: 14px; font-weight: bold;
                color: ${isDark ? '#fff' : '#856404'}; flex-shrink: 0;
            `;
            closeBtn.addEventListener('click', () => {
                notice.remove();
                try { localStorage.setItem('bear_notice_v2_dismissed', 'true'); } catch(e) {}
            });

            notice.appendChild(noticeContent);
            notice.appendChild(closeBtn);
            wrapper.insertBefore(notice, wrapper.firstChild);
        }

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

        const allButtons = [
            { label: ICONS.bold, title: 'Bold', syntax: ['**', '**'] },
            { label: ICONS.italic, title: 'Italic', syntax: ['*', '*'] },
            { label: ICONS.h1, title: 'H1', syntax: ['# ', ''], lineStart: true },
            { label: ICONS.h2, title: 'H2', syntax: ['## ', ''], lineStart: true },
            { label: ICONS.h3, title: 'H3', syntax: ['### ', ''], lineStart: true },
            { label: ICONS.link, title: 'Link', syntax: ['[', ']('] },
            { label: ICONS.quote, title: 'Quote', syntax: ['> ', ''], lineStart: true },
            { label: ICONS.cite, title: 'Cite', syntax: ['<cite>', '</cite>'], adv: true },
            { label: ICONS.image, title: 'Insert Media', action: 'upload' },
            { label: ICONS.list, title: 'List', syntax: ['- ', ''], lineStart: true },
            { label: ICONS.hr, title: 'HR', syntax: ['\n---\n', ''] },
            { label: ICONS.table, title: 'Table', syntax: ['\n| Header 1 | Header 2 |\n|----------|----------|\n| Cell 1 | Cell 2 |\n', ''] },
            { label: ICONS.info, title: 'Info Box', syntax: ['<div class="infobox-frame info"><div class="infobox-icon"></div><div class="infobox-text">', '</div></div>'], adv: true },
            { label: ICONS.warning, title: 'Warning Box', syntax: ['<div class="infobox-frame warning"><div class="infobox-icon"></div><div class="infobox-text">', '</div></div>'], adv: true },
            { label: ICONS.star, title: 'Rating', syntax: ['(★★★☆☆)', ''], adv: true }
        ];

        const codeButtons = [
            { label: ICONS.code, title: 'Inline Code', syntax: ['`', '`'] },
            { label: ICONS.codeBlock, title: 'Code Block', action: 'codeBlock' }
        ];

        const menuItems = [
            { label: ICONS.gallery, text: 'Gallery', action: 'gallery' },
            { label: ICONS.preview, text: 'Preview', action: 'preview' },
            { label: ICONS.help, text: 'Markdown Help', action: 'help' }
        ];

        const createBtn = (btnObj) => {
            const b = document.createElement('button');
            b.type = 'button'; b.innerHTML = btnObj.label; b.title = btnObj.title;
            if (btnObj.adv) b.classList.add('adv-btn');
            if (btnObj.adv && currentMode === 'basic') b.style.display = 'none';

            b.style.cssText += `width: 32px; height: 32px; flex-shrink: 0; background: ${isDark ? '#01242e' : 'white'}; color: ${isDark ? '#ddd' : '#444'}; border: 1px solid ${isDark ? '#555' : '#ccc'}; border-radius: 3px; cursor: pointer; display: flex; align-items: center; justify-content: center; font-weight: 800; font-family: system-ui, sans-serif; -webkit-user-select: none; user-select: none; touch-action: manipulation; -webkit-tap-highlight-color: transparent;`;

            b.addEventListener('click', () => btnObj.action ? handleAction(btnObj.action, $textarea) : insertMarkdown($textarea, btnObj.syntax[0], btnObj.syntax[1], btnObj.lineStart));

            // Prevent context menu on mobile devices
            b.addEventListener('contextmenu', (e) => e.preventDefault());

            return b;
        };

        allButtons.forEach(btn => toolbar.appendChild(createBtn(btn)));

        // Code Button Group (nebeneinander im Advanced Mode)
        const codeGroup = document.createElement('div');
        codeGroup.className = 'code-btn-group';
        codeGroup.style.cssText = `display: ${currentMode === 'basic' ? 'none' : 'flex'}; gap: 2px; padding: 2px; background: ${isDark ? '#003545' : '#dfe3e8'}; border-radius: 4px; border: 1px solid ${isDark ? '#004556' : '#cbd0d6'};`;

        codeButtons.forEach(btn => {
            const codeBtn = createBtn(btn);
            codeBtn.style.border = 'none';
            codeGroup.appendChild(codeBtn);
        });

        toolbar.appendChild(codeGroup);

        // Menu (...)
        const menuWrapper = document.createElement('div');
        menuWrapper.style.position = 'relative';
        const menuBtn = createBtn({ label: ICONS.more, title: "More" });
        
        const dropdown = document.createElement('div');
        dropdown.style.cssText = `display: none; position: absolute; top: 34px; right: 0; background: ${isDark ? '#01242e' : 'white'}; border: 1px solid ${isDark ? '#555' : '#ccc'}; border-radius: 4px; z-index: 1000; min-width: 170px; box-shadow: 0 4px 12px rgba(0,0,0,0.3); padding: 4px 0;`;

        const toggleItem = document.createElement('div');
        toggleItem.style.cssText = `padding: 10px 14px; cursor: pointer; font-size: 13px; font-weight: 600; color: ${isDark ? '#ddd' : '#444'}; border-bottom: 1px solid ${isDark ? '#333' : '#eee'};`;
        toggleItem.innerText = currentMode === 'basic' ? 'Switch to Advanced' : 'Switch to Basic';
        
        toggleItem.addEventListener('click', (e) => {
            e.stopPropagation();
            currentMode = currentMode === 'basic' ? 'advanced' : 'basic';
            try {
                localStorage.setItem('bear_toolbar_mode', currentMode);
            } catch(err) {
                // Silent fail - localStorage might be unavailable
            }
            toolbar.querySelectorAll('.adv-btn').forEach(b => b.style.display = currentMode === 'basic' ? 'none' : 'flex');
            toolbar.querySelector('.code-btn-group').style.display = currentMode === 'basic' ? 'none' : 'flex';
            toggleItem.innerText = currentMode === 'basic' ? 'Switch to Advanced' : 'Switch to Basic';
            dropdown.style.display = 'none';
        });
        dropdown.appendChild(toggleItem);

        menuItems.forEach(item => {
            const div = document.createElement('div');
            div.style.cssText = `padding: 10px 14px; cursor: pointer; display: flex; align-items: center; gap: 10px; font-size: 13px; color: ${isDark ? '#ddd' : '#444'};`;
            div.innerHTML = `<span style="display:flex; width:18px;">${item.label}</span> <span>${item.text}</span>`;
            div.addEventListener('click', () => { handleAction(item.action, $textarea); dropdown.style.display = 'none'; });
            div.addEventListener('mouseenter', () => div.style.backgroundColor = isDark ? '#004052' : '#f5f5f5');
            div.addEventListener('mouseleave', () => div.style.backgroundColor = 'transparent');
            dropdown.appendChild(div);
        });

        menuBtn.addEventListener('click', (e) => { e.stopPropagation(); dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none'; });

        // Add global click listener only once to close all dropdowns
        if (!globalClickListenerAdded) {
            globalClickListenerAdded = true;
            document.addEventListener('click', () => {
                document.querySelectorAll('.markdown-toolbar [style*="position: absolute"]').forEach(el => {
                    el.style.display = 'none';
                });
            });
        }

        menuWrapper.append(menuBtn, dropdown);
        toolbar.appendChild(menuWrapper);

        // Character Counter (floating)
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
            case 'gallery': {
                // Extract blog slug from current URL (e.g., /fischr/dashboard/... → fischr)
                const pathParts = window.location.pathname.split('/').filter(Boolean);
                const blogSlug = pathParts[0] || '';
                window.open(`/${blogSlug}/dashboard/media/`, '_blank');
                break;
            }
            case 'preview': document.getElementById('preview').click(); break;
            case 'help': window.open('https://herman.bearblog.dev/markdown-cheatsheet/', '_blank'); break;
            case 'codeBlock': insertMarkdown($textarea, '\n```\n', '\n```\n'); break;
        }
    }

    async function insertMarkdown($textarea, before, after, lineStart = false) {
        const start = $textarea.selectionStart, end = $textarea.selectionEnd;
        const selected = $textarea.value.substring(start, end);
        let newText, newPos;

        // Set readonly at the start to prevent iOS paste menu during any operations
        $textarea.readOnly = true;

        // Smart clipboard integration for links
        if (before === '[' && after === '](') {
            let url = '';
            try {
                const clip = await navigator.clipboard.readText();
                if (clip.trim().startsWith('http')) url = clip.trim();
            } catch(e) {}
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

        // Prevent iOS paste menu by temporarily making textarea readonly during focus
        $textarea.readOnly = true;
        $textarea.focus();
        setTimeout(() => {
            $textarea.readOnly = false;
        }, 10);

        $textarea.dispatchEvent(new Event('input', { bubbles: true }));
    }
})();