// Highlights active nav menu
(function() {
    const canonicalUrl = document.querySelector('link[rel="canonical"]')?.href;
    if (!canonicalUrl) return;
    
    const navLinks = document.querySelectorAll('header nav p a');
    navLinks.forEach(link => {
        const linkHref = link.getAttribute('href');
        // Prüfe ob die canonical URL mit dem Link-Pfad endet
        if (canonicalUrl.endsWith(linkHref + '/') || canonicalUrl.endsWith(linkHref)) {
            link.classList.add('active-page');
        }
    });
})();