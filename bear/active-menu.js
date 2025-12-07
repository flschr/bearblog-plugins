// Highlights active nav menu
(function() {
    const canonicalUrl = document.querySelector('link[rel="canonical"]')?.href;
    if (!canonicalUrl) return;
    
    const navLinks = document.querySelectorAll('header nav p a');
    navLinks.forEach(link => {
        const linkHref = link.getAttribute('href');
        
        const normalizedCanonical = canonicalUrl.replace(/\/$/, ''); // Entferne trailing slash
        const normalizedLink = linkHref.replace(/^\//, '').replace(/\/$/, ''); // Entferne leading/trailing slashes
        
        if (normalizedCanonical.endsWith(normalizedLink)) {
            link.classList.add('active-page');
        }
    });
})();