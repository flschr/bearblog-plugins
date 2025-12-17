// Bear Blog Auto-Save zu Drafts (ohne localStorage)
(function() {
    'use strict';
    
    let autoSaveEnabled = localStorage.getItem('rdb_autosave_enabled') !== 'false';
    let lastCharCount = 0;
    let saveTimeout = null;
    
    // Toggle-Button erstellen
    const toggle_btn = document.createElement('button');
    toggle_btn.classList.add('rdb_autosave_toggle');
    toggle_btn.style.marginLeft = '10px';
    toggle_btn.onclick = function(e) {
        e.preventDefault();
        toggleAutoSave();
    };
    updateButtonState();
    
    // Button neben "Save as draft" einfügen
    const buttons = document.querySelectorAll('button');
    const saveDraftBtn = Array.from(buttons).find(btn => btn.textContent.includes('Save as draft'));
    if (saveDraftBtn && saveDraftBtn.parentNode) {
        saveDraftBtn.parentNode.insertBefore(toggle_btn, saveDraftBtn.nextSibling);
    }

    function updateButtonState() {
        if (autoSaveEnabled) {
            toggle_btn.innerText = '⏸ Auto-Save AN';
            toggle_btn.style.backgroundColor = '#28a745';
            toggle_btn.style.color = 'white';
        } else {
            toggle_btn.innerText = '▶ Auto-Save AUS';
            toggle_btn.style.backgroundColor = '#dc3545';
            toggle_btn.style.color = 'white';
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
        
        const buttons = Array.from(document.querySelectorAll('button'));
        const saveDraftBtn = buttons.find(btn => btn.textContent.includes('Save as draft'));
        
        if (saveDraftBtn) {
            console.log('💾 Auto-saving draft...', new Date().toLocaleTimeString());
            saveDraftBtn.click();
        }
    }
    
    function checkAndSave(){
        if (!autoSaveEnabled) {
            scheduleNextSave();
            return;
        }
        
        const textarea = document.querySelector('textarea');
        if (!textarea) {
            scheduleNextSave();
            return;
        }
        
        const currentCharCount = textarea.value.length;
        
        // Speichern wenn:
        // 1. +100 Zeichen seit letztem Save
        // 2. Oder 2 Minuten vergangen
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
        // Prüfe alle 10 Sekunden, aber speichere nur nach Regeln
        saveTimeout = setTimeout(checkAndSave, 10000);
    }
    
    // Separater Timer für 2-Minuten-Save
    function regularSave() {
        if (autoSaveEnabled) {
            const textarea = document.querySelector('textarea');
            if (textarea && textarea.value.length > 50) {
                console.log('⏰ 2-Minuten Auto-Save');
                saveToDraft();
                lastCharCount = textarea.value.length;
            }
        }
        setTimeout(regularSave, 120000); // 2 Minuten
    }

    // Start
    if (document.querySelector('textarea')) {
        const textarea = document.querySelector('textarea');
        lastCharCount = textarea.value.length;
        
        if (autoSaveEnabled) {
            scheduleNextSave();
            setTimeout(regularSave, 120000);
            console.log('🚀 Auto-Save aktiviert: alle 2 Min. oder bei +100 Zeichen');
        } else {
            console.log('⏸ Auto-Save ist deaktiviert');
        }
    }
})();