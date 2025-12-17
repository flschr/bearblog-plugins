(function() {
    'use strict';

    function initAutoSave() {
        const saveButton = document.getElementById('save-button');
        const textarea = document.getElementById('body_content');

        // Falls der Editor noch nicht geladen ist, kurz warten und neu versuchen
        if (!saveButton || !textarea) {
            setTimeout(initAutoSave, 200);
            return;
        }

        // Verhindern, dass der Button doppelt erstellt wird
        if (document.querySelector('.rdb_autosave_toggle')) return;

        let autoSaveEnabled = localStorage.getItem('rdb_autosave_enabled') !== 'false';
        let lastCharCount = textarea.value.length;
        let saveTimeout = null;

        // Button erstellen
        const toggle_btn = document.createElement('button');
        toggle_btn.type = 'button';
        toggle_btn.className = 'rdb_autosave_toggle';
        toggle_btn.style.marginLeft = '10px';
        
        function updateButtonState() {
            toggle_btn.innerText = autoSaveEnabled ? '⏸ Auto-Save AN' : '▶ Auto-Save AUS';
            toggle_btn.style.cssText = `
                margin-left: 10px;
                padding: 5px 10px;
                border-radius: 3px;
                border: none;
                color: white;
                background-color: ${autoSaveEnabled ? '#28a745' : '#dc3545'};
                cursor: pointer;
            `;
        }

        toggle_btn.onclick = function(e) {
            e.preventDefault();
            autoSaveEnabled = !autoSaveEnabled;
            localStorage.setItem('rdb_autosave_enabled', autoSaveEnabled);
            updateButtonState();
            if (autoSaveEnabled) scheduleNextSave();
            else clearTimeout(saveTimeout);
        };

        // Button einfügen
        saveButton.parentNode.insertBefore(toggle_btn, saveButton.nextSibling);
        updateButtonState();
        console.log('✅ Auto-Save Button erfolgreich hinzugefügt');

        function saveToDraft() {
            if (autoSaveEnabled && saveButton) {
                // Bear Blog Logik: "publish" auf false setzen, damit es ein Draft bleibt
                const publishInput = document.getElementById('publish');
                if (publishInput) publishInput.value = 'false';
                
                console.log('💾 Auto-Save ausgeführt...');
                saveButton.click(); 
            }
        }

        function checkAndSave() {
            if (!autoSaveEnabled) return scheduleNextSave();
            
            const currentCharCount = textarea.value.length;
            // Speichern bei Differenz von 100 Zeichen
            if (Math.abs(currentCharCount - lastCharCount) >= 100) {
                lastCharCount = currentCharCount;
                saveToDraft();
            }
            scheduleNextSave();
        }

        function scheduleNextSave() {
            clearTimeout(saveTimeout);
            saveTimeout = setTimeout(checkAndSave, 10000); // Alle 10 Sek. prüfen
        }

        if (autoSaveEnabled) scheduleNextSave();
    }

    // Startet die Suche nach den Elementen
    initAutoSave();
})();