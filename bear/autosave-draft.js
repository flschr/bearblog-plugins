// Bear Blog Auto-Save zu Drafts (warten bis Seite geladen ist)
(function() {
    'use strict';
    
    // Warte bis die Seite komplett geladen ist
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
    function init() {
        let autoSaveEnabled = localStorage.getItem('rdb_autosave_enabled') !== 'false';
        let lastCharCount = 0;
        let saveTimeout = null;
        
        // Toggle-Button erstellen
        const toggle_btn = document.createElement('button');
        toggle_btn.type = 'button'; // Wichtig: kein Submit!
        toggle_btn.classList.add('rdb_autosave_toggle');
        toggle_btn.style.marginLeft = '10px';
        toggle_btn.onclick = function(e) {
            e.preventDefault();
            toggleAutoSave();
        };
        updateButtonState();
        
        // Button nach "Save as draft" einfügen
        const saveButton = document.getElementById('save-button');
        if (saveButton && saveButton.parentNode) {
            saveButton.parentNode.insertBefore(toggle_btn, saveButton.nextSibling);
            console.log('✅ Auto-Save Button hinzugefügt');
        } else {
            console.error('❌ Save-Button nicht gefunden');
            return;
        }

        function updateButtonState() {
            if (autoSaveEnabled) {
                toggle_btn.innerText = '⏸ Auto-Save AN';
                toggle_btn.style.backgroundColor = '#28a745';
                toggle_btn.style.color = 'white';
                toggle_btn.style.padding = '5px 10px';
                toggle_btn.style.borderRadius = '3px';
                toggle_btn.style.border = 'none';
            } else {
                toggle_btn.innerText = '▶ Auto-Save AUS';
                toggle_btn.style.backgroundColor = '#dc3545';
                toggle_btn.style.color = 'white';
                toggle_btn.style.padding = '5px 10px';
                toggle_btn.style.borderRadius = '3px';
                toggle_btn.style.border = 'none';
            }
        }

        function toggleAutoSave() {
            autoSaveEnabled = !autoSaveEnabled;
            localStorage.setItem('rdb_autosave_enabled', autoSaveEnabled);
            updateButtonState();
            
            if (autoSaveEnabled) {
                console.log('✅ Auto-Save aktiviert');
                scheduleNextSave();
            } else {
                console.log('⏸ Auto-Save deaktiviert');
                if (saveTimeout) {
                    clearTimeout(saveTimeout);
                }
            }
        }

        function saveToDraft(){
            if (!autoSaveEnabled) return;
            
            const saveButton = document.getElementById('save-button');
            
            if (saveButton) {
                console.log('💾 Auto-saving draft...', new Date().toLocaleTimeString());
                saveButton.click();
            }
        }
        
        function checkAndSave(){
            if (!autoSaveEnabled) {
                scheduleNextSave();
                return;
            }
            
            const textarea = document.getElementById('body_content');
            if (!textarea) {
                scheduleNextSave();
                return;
            }
            
            const currentCharCount = textarea.value.length;
            const charDifference = currentCharCount - lastCharCount;
            
            if (charDifference >= 100) {
                console.log(`📝 +${charDifference} Zeichen → Auto-Save`);
                saveToDraft();
                lastCharCount = currentCharCount;
            }
            
            scheduleNextSave();
        }
        
        function scheduleNextSave() {
            if (saveTimeout) {
                clearTimeout(saveTimeout);
            }
            saveTimeout = setTimeout(checkAndSave, 10000);
        }
        
        function regularSave() {
            if (autoSaveEnabled) {
                const textarea = document.getElementById('body_content');
                if (textarea && textarea.value.length > 50) {
                    console.log('⏰ 2-Minuten Auto-Save');
                    saveToDraft();
                    lastCharCount = textarea.value.length;
                }
            }
            setTimeout(regularSave, 120000);
        }

        // Start
        const textarea = document.getElementById('body_content');
        if (textarea) {
            lastCharCount = textarea.value.length;
            
            if (autoSaveEnabled) {
                scheduleNextSave();
                setTimeout(regularSave, 120000);
                console.log('🚀 Auto-Save aktiviert: alle 2 Min. oder bei +100 Zeichen');
            } else {
                console.log('⏸ Auto-Save ist deaktiviert');
            }
        }
    }
})();