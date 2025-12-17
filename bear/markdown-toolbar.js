(function() {
    const $textarea = document.getElementById('body_content');
    if (!$textarea) return;
    
    createMarkdownToolbar();
    
    function createMarkdownToolbar() {
        if (document.querySelector('.markdown-toolbar')) return;
        
        const toolbar = document.createElement('div');
        toolbar.className = 'markdown-toolbar';
        toolbar.style.cssText = `
            display: flex;
            gap: 5px;
            padding: 8px;
            background-color: #eceff4;
            border-bottom: 1px solid lightgrey;
            flex-wrap: wrap;
            position: sticky;
            top: 0;
            z-index: 100;
        `;
        
        if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
            toolbar.style.backgroundColor = '#004052';
        }
        
        const buttons = [
            { label: 'B', title: 'Bold', syntax: ['**', '**'] },
            { label: 'I', title: 'Italic', syntax: ['*', '*'] },
            { label: 'H1', title: 'Heading 1', syntax: ['# ', ''] },
            { label: 'H2', title: 'Heading 2', syntax: ['## ', ''] },
            { label: 'H3', title: 'Heading 3', syntax: ['### ', ''] },
            { label: 'Link', title: 'Link', syntax: ['[', '](url)'] },
            { label: 'Quote', title: 'Blockquote', syntax: ['> ', ''] },
            { label: 'Code', title: 'Code', syntax: ['`', '`'] },
            { label: 'List', title: 'List', syntax: ['- ', ''] },
            { label: 'HR', title: 'Horizontal Rule', syntax: ['\n---\n', ''] }
        ];
        
        buttons.forEach(btn => {
            const button = document.createElement('button');
            button.type = 'button';
            button.textContent = btn.label;
            button.title = btn.title;
            button.style.cssText = `
                padding: 5px 10px;
                background: white;
                border: 1px solid #ccc;
                border-radius: 3px;
                cursor: pointer;
                font-size: 12px;
                font-weight: bold;
            `;
            
            if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
                button.style.backgroundColor = '#01242e';
                button.style.color = '#ddd';
                button.style.borderColor = '#555';
            }
            
            button.onclick = (e) => {
                e.preventDefault();
                insertMarkdown(btn.syntax[0], btn.syntax[1]);
            };
            
            toolbar.appendChild(button);
        });
        
        $textarea.parentNode.insertBefore(toolbar, $textarea);
    }
    
    function insertMarkdown(before, after) {
        const start = $textarea.selectionStart;
        const end = $textarea.selectionEnd;
        const selectedText = $textarea.value.substring(start, end);
        const beforeText = $textarea.value.substring(0, start);
        const afterText = $textarea.value.substring(end);
        
        if (selectedText) {
            $textarea.value = beforeText + before + selectedText + after + afterText;
            $textarea.selectionStart = start + before.length;
            $textarea.selectionEnd = end + before.length;
        } else {
            $textarea.value = beforeText + before + after + afterText;
            $textarea.selectionStart = $textarea.selectionEnd = start + before.length;
        }
        
        $textarea.focus();
    }
})();