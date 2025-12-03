// Automatisch die Klasse "fotos-page" hinzufügen wenn URL /fotos/ enthält
if (window.location.pathname.includes('/fotos')) {
    document.body.classList.add('fotos-page');
    
    // Warte bis DOM geladen ist
    document.addEventListener('DOMContentLoaded', function() {
        // Finde alle List-Items in der Foto-Galerie
        const fotoItems = document.querySelectorAll('.fotos-page ul.blog-posts li');
        
        fotoItems.forEach(item => {
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
                    link.style.color = 'var(--color-primary)';
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
    const lastPhotoList = document.querySelectorAll('ul.embedded.blog-posts');
    if (lastPhotoList.length > 0) {
        const lastList = lastPhotoList[lastPhotoList.length - 1];
        const photoItems = lastList.querySelectorAll('li');
        
        photoItems.forEach(item => {
            const link = item.querySelector('a');
            if (link) {
                item.addEventListener('click', function(e) {
                    window.location.href = link.href;
                });
            }
        });
    }
}