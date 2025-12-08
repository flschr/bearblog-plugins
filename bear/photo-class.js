(function() {
    'use strict';

    /**
     * Macht Foto-Karten vollständig klickbar und fügt notwendige CSS-Klassen hinzu
     * @param {NodeList|Array} items - Die zu verarbeitenden List-Items
     * @param {boolean} addHoverEffect - Ob Hover-Effekte hinzugefügt werden sollen
     */
    function enhancePhotoCards(items, addHoverEffect) {
        if (!items || items.length === 0) return;
        
        items.forEach(item => {
            // Füge photo-card Klasse hinzu für optimiertes CSS
            item.classList.add('photo-card');
            
            // Füge Wrapper-Klasse zum div hinzu
            const imageDiv = item.querySelector('div');
            if (imageDiv) {
                imageDiv.classList.add('photo-card-image-wrapper');
            }
            
            // Finde den Link innerhalb des Items
            const link = item.querySelector('a');
            if (!link) return;
            
            // Mache die gesamte Kachel klickbar
            item.classList.add('photo-card-clickable');
            
            if (addHoverEffect) {
                // Hover-Event: Titel bekommt Accent-Farbe
                item.addEventListener('mouseenter', function() {
                    link.classList.add('photo-card-hover');
                });
                item.addEventListener('mouseleave', function() {
                    link.classList.remove('photo-card-hover');
                });
            }
            
            // Click-Event auf die gesamte Kachel
            item.addEventListener('click', function(e) {
                // Verhindere doppeltes Triggern wenn direkt auf Link geklickt wird
                if (e.target.tagName !== 'A') {
                    e.preventDefault();
                    window.location.href = link.href;
                }
            });
        });
    }

    /**
     * Initialisierung basierend auf der aktuellen Seite
     */
    function init() {
        const pathname = window.location.pathname;
        
        // Fotos-Seite: Alle Foto-Items verbessern
        if (pathname.includes('/fotos') || pathname.includes('/lecker-wars')) {
            document.body.classList.add('fotos-page');
            const fotoItems = document.querySelectorAll('.fotos-page .blog-posts li');
            enhancePhotoCards(fotoItems, true);
            
            // Zeige die Fotos nach der Umwandlung
            const photoList = document.querySelector('.fotos-page .blog-posts');
            if (photoList) {
                photoList.classList.add('photos-loaded');
            }
        }
        
        // Homepage: Letztes Foto-Album verbessern
        if (document.body.classList.contains('home')) {
            const photoLists = document.querySelectorAll('ul.embedded.blog-posts');
            if (photoLists.length > 0) {
                const lastList = photoLists[photoLists.length - 1];
                const photoItems = lastList.querySelectorAll('li');
                enhancePhotoCards(photoItems, false);
            }
        }
    }

    // Starte wenn DOM bereit ist
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();