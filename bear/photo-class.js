// Automatisch die Klasse "fotos-page" hinzufügen wenn URL /fotos/ enthält
if (window.location.pathname.includes('/fotos')) {
    document.body.classList.add('fotos-page');
    
    // Warte bis DOM geladen ist
    document.addEventListener('DOMContentLoaded', function() {
        // Finde alle List-Items in der Foto-Galerie und füge .photo-card Klasse hinzu
        const fotoItems = document.querySelectorAll('.fotos-page .blog-posts li');
        
        fotoItems.forEach(item => {
            // Füge photo-card Klasse hinzu für optimiertes CSS
            item.classList.add('photo-card');
            
            // Füge Wrapper-Klasse zum div hinzu
            const imageDiv = item.querySelector('div');
            if (imageDiv) {
                imageDiv.classList.add('photo-card-image-wrapper');
            }
            
            // Finde den Link innerhalb des Items
            const link = item.querySelector('a');
            
            if (link) {
                // Mache die gesamte Kachel klickbar
                item.style.cursor = 'pointer';
                
                // Hover-Event: Titel bekommt rote Farbe
                item.addEventListener('mouseenter', function() {
                    link.style.color = 'var(--color-accent)';
                });
                
                item.addEventListener('mouseleave', function() {
                    link.style.color = '';
                });
                
                // Click-Event auf die gesamte Kachel
                item.addEventListener('click', function(e) {
                    // Verhindere doppeltes Triggern wenn direkt auf Link geklickt wird
                    if (e.target.tagName !== 'A') {
                        window.location.href = link.href;
                    }
                });
            }
        });
    });
}

// Mache das letzte Foto auf der Homepage komplett klickbar
if (document.body.classList.contains('home')) {
    document.addEventListener('DOMContentLoaded', function() {
        const lastPhotoList = document.querySelectorAll('ul.embedded.blog-posts');
        if (lastPhotoList.length > 0) {
            const lastList = lastPhotoList[lastPhotoList.length - 1];
            const photoItems = lastList.querySelectorAll('li');
            
            photoItems.forEach(item => {
                // Füge photo-card Klasse hinzu
                item.classList.add('photo-card');
                
                // Füge Wrapper-Klasse zum div hinzu
                const imageDiv = item.querySelector('div');
                if (imageDiv) {
                    imageDiv.classList.add('photo-card-image-wrapper');
                }
                
                const link = item.querySelector('a');
                if (link) {
                    item.addEventListener('click', function(e) {
                        window.location.href = link.href;
                    });
                }
            });
        }
    });
}
