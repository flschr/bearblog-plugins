document.addEventListener("DOMContentLoaded", function() {
  // Detect browser language (fallback to German if not English)
  const lang = navigator.language || navigator.userLanguage || 'de';
  const isEn = lang.startsWith('en');
  
  // Optional: Console log für Debugging
  console.log('Detected language:', lang, 'Using English:', isEn);
  
  // Define translations
  const i18n = {
    external: isEn ? 'External' : 'Externes',
    video: isEn ? 'Video' : 'Video',
    map: isEn ? 'Map' : 'Karte',
    load: isEn ? 'Load' : 'laden',
    noteStart: isEn ? 'Loading this content will transfer data to' : 'Beim Laden dieses Inhalts werden Daten an',
    noteEnd: isEn ? '.' : ' übertragen.'
  };

  // Selectors for YouTube and Google Maps
  const selectors = [
    'iframe[src*="youtube"]',
    'iframe[src*="googleusercontent.com"]',
    'iframe[src*="maps.google"]',
    'iframe[src*="google.com/maps"]'
  ];
  
  const iframes = document.querySelectorAll(selectors.join(','));
  
  iframes.forEach(iframe => {
    const src = iframe.src;
    const isMap = src.includes('maps') || src.includes('googleusercontent');
    const typeLabel = isMap ? i18n.map : i18n.video;
    const service = isMap ? 'Google Maps' : 'YouTube';
    
    // Create the overlay wrapper
    const wrapper = document.createElement('div');
    wrapper.className = 'media-proxy';
    
    wrapper.innerHTML = `
      <p><strong>${i18n.external} ${typeLabel}</strong><br>
      ${i18n.noteStart} ${service}${i18n.noteEnd}</p>
      <button>${typeLabel} ${i18n.load}</button>
    `;
    
    const btn = wrapper.querySelector('button');
    btn.addEventListener('click', () => {
      const newSrc = !isMap ? src.replace("youtube.com", "youtube-nocookie.com") : src;
      iframe.src = newSrc;
      wrapper.replaceWith(iframe);
    });
    
    iframe.replaceWith(wrapper);
  });
});