document.addEventListener("DOMContentLoaded", function() {
  // Detect browser language (fallback to German if not English)
  const lang = navigator.language || navigator.userLanguage || 'de';
  const isEn = lang.startsWith('en');
  
  // Define translations
  const i18n = {
    external: isEn ? 'External' : 'Externes',
    video: isEn ? 'Video' : 'Video',
    map: isEn ? 'Map' : 'Karte',
    load: isEn ? 'Load' : 'laden',
    noteStart: isEn ? 'Loading this content will transfer data to' : 'Beim Laden dieses Inhalts werden Daten an',
    noteEnd: isEn ? '.' : ' übertragen.'
  };

  // Selectors for YouTube and Google Maps (including Bear Blog proxy domains)
  const selectors = [
    'iframe[src*="youtube"]',
    'iframe[src*="googleusercontent.com"]',
    'iframe[src*="maps.google"]'
  ];
  
  const iframes = document.querySelectorAll(selectors.join(','));
  
  iframes.forEach(iframe => {
    const src = iframe.src;
    // Check if it's a map based on URL patterns
    const isMap = src.includes('maps') || src.includes('googleusercontent');
    const typeLabel = isMap ? i18n.map : i18n.video;
    const service = isMap ? 'Google Maps' : 'YouTube';
    
    // Create the overlay wrapper
    const wrapper = document.createElement('div');
    wrapper.className = 'media-proxy';
    
    wrapper.innerHTML = `
      <p><strong>${i18n.external} ${typeLabel}</strong><br>
      ${i18n.noteStart} ${service}${i18n.noteEnd}</p>
      <button>${isEn ? i18n.load : ''} ${typeLabel} ${isEn ? '' : i18n.load}</button>
    `;
    
    const btn = wrapper.querySelector('button');
    btn.addEventListener('click', () => {
      // Use privacy-enhanced domain for YouTube if applicable
      const newSrc = src.replace("youtube.com", "youtube-nocookie.com");
      iframe.src = newSrc;
      wrapper.replaceWith(iframe);
    });
    
    iframe.replaceWith(wrapper);
  });
});