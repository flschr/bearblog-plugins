// @name         Bear Blog Markdown Toolbar (V2)
// @version      0.3.5
// @description  Extended Markdown Toolbar for Bear Blog
// @author       René Fischer

(function() {
    'use strict';

    const init = () => {
        const $textarea = document.getElementById('body_content');
        if (!$textarea || $textarea.hasAttribute('data-toolbar-initialized')) return;
        
        $textarea.setAttribute('data-toolbar-initialized', 'true');
        createMarkdownToolbar($textarea);

        // Footer ausblenden
        document.querySelectorAll('.helptext.sticky, body > footer').forEach(el => el.style.display = 'none');
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    function createMarkdownToolbar($textarea) {
        const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        
        // Container Setup
        const wrapper = $textarea.parentElement;
        wrapper.style.position = 'relative';

        const toolbar = document.createElement('div');
        toolbar.className = 'markdown-toolbar';
        toolbar.style.cssText = `
            display: flex; gap: 4px; padding: 8px; align-items: center;
            background-color: ${isDark ? '#004052' : '#eceff4'};
            border-bottom: 1px solid ${isDark ? '#005566' : 'lightgrey'};
            position: sticky; top: 0; z-index: 100; box-sizing: border-box;
        `;

        const ICONS = {
            bold: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"></path><path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"></path></svg>',
            italic: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="4" x2="10" y2="4"></line><line x1="14" y1="20" x2="5" y2="20"></line><line x1="15" y1="4" x2="9" y2="20"></line></svg>',
            h1: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12h8"></path><path d="M4 18V6"></path><path d="M12 18V6"></path><path d="M21 18h-2c-1.1 0-2-1.8-2-4s.9-4 2-4h2"></path></svg>',
            link: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.72"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.72-1.72"></path></svg>',
            image: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>',
            more: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="1"></circle><circle cx="19" cy="12" r="1"></circle><circle cx="5" cy="12" r="1"></circle></svg>',
            gallery: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.3 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10l-3.1-3.1a2 2 0 0 0-2.814.014L6 21Z"></path><circle cx="9" cy="9" r="2"></circle></svg>',
            preview: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>',
            help: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>'
        };

        const buttons = [
            { label: ICONS.bold, title: 'Bold', syntax: ['**', '**'] },
            { label: ICONS.italic, title: 'Italic', syntax: ['*', '*'] },
            { label: ICONS.h1, title: 'H1', syntax: ['# ', ''], lineStart: true },
            { label: ICONS.link, title: 'Link', syntax: ['[', ']('] },
            { label: ICONS.image, title: 'Insert Media', action: 'upload' }
        ];

        const menuItems = [
            { label: ICONS.gallery, text: 'Gallery', action: 'gallery' },
            { label: ICONS.preview, text: 'Preview', action: 'preview' },
            { label: ICONS.help, text: 'Markdown Help', action: 'help' }
        ];

        const createBtn = (html, isDark) => {
            const b = document.createElement('button');
            b.type = 'button'; b.innerHTML = html;
            b.style.cssText = `width: 32px; height: 32px; background: ${isDark ? '#01242e' : 'white'}; color: ${isDark ? '#ddd' : '#444'}; border: 1px solid ${isDark ? '#555' : '#ccc'}; border-radius: 3px; cursor: pointer; display: flex; align-items: center; justify-content: center;`;
            return b;
        };

        buttons.forEach(btn => {
            const b = createBtn(btn.label, isDark);
            b.onclick = () => btn.action ? handleAction(btn.action) : insertMarkdown($textarea, btn.syntax[0], btn.syntax[1], btn.lineStart);
            toolbar.appendChild(b);
        });

        // Dropdown Menu
        const menuWrapper = document.createElement('div');
        menuWrapper.style.position = 'relative';
        const menuBtn = createBtn(ICONS.more, isDark);
        const dropdown = document.createElement('div');
        dropdown.style.cssText = `display: none; position: absolute; top: 34px; left: 0; background: ${isDark ? '#01242e' : 'white'}; border: 1px solid ${isDark ? '#555' : '#ccc'}; border-radius: 4px; z-index: 1000; min-width: 120px; box-shadow: 0 4px 10px rgba(0,0,0,0.2);`;

        menuItems.forEach(item => {
            const div = document.createElement('div');
            div.style.cssText = `padding: 8px 12px; cursor: pointer; display: flex; align-items: center; gap: 10px; font-size: 13px; color: ${isDark ? '#ddd' : '#444'};`;
            div.innerHTML = `${item.label} ${item.text}`;
            div.onclick = () => { handleAction(item.action); dropdown.style.display = 'none'; };
            div.onmouseover = () => div.style.backgroundColor = isDark ? '#004052' : '#f5f5f5';
            div.onmouseout = () => div.style.backgroundColor = 'transparent';
            dropdown.appendChild(div);
        });

        menuBtn.onclick = (e) => { e.stopPropagation(); dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none'; };
        document.addEventListener('click', () => dropdown.style.display = 'none');
        menuWrapper.append(menuBtn, dropdown);
        toolbar.appendChild(menuWrapper);

        // Character Counter Overlay
        const counter = document.createElement('div');
        counter.style.cssText = `position: absolute; bottom: 15px; right: 25px; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold; pointer-events: none; z-index: 5; opacity: 0.9; font-family: sans-serif; border: 1px solid ${isDark ? '#555' : '#ccc'}; background: ${isDark ? '#01242e' : '#eee'}; color: ${isDark ? '#aaa' : '#666'};`;
        
        const updateCounter = () => {
            const len = $textarea.value.length;
            counter.innerText = len;
            if (len >= 300) {
                counter.style.background = '#d32f2f'; counter.style.color = 'white';
            } else if (len >= 250) {
                counter.style.background = '#fbc02d'; counter.style.color = 'black';
            } else {
                counter.style.background = isDark ? '#01242e' : '#eee';
                counter.style.color = isDark ? '#aaa' : '#666';
            }
        };

        $textarea.addEventListener('input', updateCounter);
        updateCounter();

        wrapper.insertBefore(toolbar, $textarea);
        wrapper.appendChild(counter);
    }

    function handleAction(action) {
        if (action === 'upload') document.getElementById('upload-image').click();
        if (action === 'gallery') window.open('/fischr/dashboard/media/', '_blank');
        if (action === 'preview') document.getElementById('preview').click();
        if (action === 'help') window.open('https://herman.bearblog.dev/markdown-cheatsheet/', '_blank');
    }

    async function insertMarkdown($textarea, before, after, lineStart = false) {
        const start = $textarea.selectionStart, end = $textarea.selectionEnd;
        const selected = $textarea.value.substring(start, end);
        let newText, newPos;

        if (before === '[' && after === '](') {
            let url = ''; try { const clip = await navigator.clipboard.readText(); if (clip.startsWith('http')) url = clip.trim(); } catch(e){}
            newText = $textarea.value.substring(0, start) + '[' + selected + '](' + url + ')' + $textarea.value.substring(end);
            newPos = url ? start + selected.length + url.length + 3 : start + selected.length + 3;
        } else {
            newText = $textarea.value.substring(0, start) + before + selected + after + $textarea.value.substring(end);
            newPos = start + before.length + selected.length + after.length;
        }

        $textarea.value = newText;
        $textarea.setSelectionRange(newPos, newPos);
        $textarea.focus();
        $textarea.dispatchEvent(new Event('input', { bubbles: true }));
    }
})();