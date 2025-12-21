document.addEventListener("DOMContentLoaded", function() {
  // detect language (en, de)
  const isEn = navigator.language.startsWith('en');
  
  // Define texts
  const i18n = {
    video: isEn ? 'Video' : 'Video',
    map: isEn ? 'Map' : 'Karte',
    load: isEn ? 'Load' : 'laden',
    noteStart: isEn ? 'Loading this content will transfer data to' : 'Beim Laden dieses Inhalts werden Daten an',
    noteEnd: isEn ? '.' : ' übertragen.'
  };

  const selectors = [
    'iframe[src*="youtube.com"]',
    'iframe[src*="youtube-nocookie.com"]',
    'iframe[src*="googleusercontent.com/maps"]',
    'iframe[src*="maps.google"]'
  ];
  
  const iframes = document.querySelectorAll(selectors.join(','));
  
  iframes.forEach(iframe => {
    const src = iframe.src;
    const isMap = src.includes('maps');
    const typeLabel = isMap ? i18n.map : i18n.video;
    const service = isMap ? 'Google Maps' : 'YouTube';
    
    const wrapper = document.createElement('div');
    wrapper.className = 'media-proxy';
    
    wrapper.innerHTML = `
      <p><strong>External ${typeLabel}</strong><br>
      ${i18n.noteStart} ${service}${i18n.noteEnd}</p>
      <button>${isEn ? i18n.load : ''} ${typeLabel} ${isEn ? '' : i18n.load}</button>
    `;
    
    const btn = wrapper.querySelector('button');
    btn.addEventListener('click', () => {
      // transform YouTube links to nocookie
      const newSrc = src.replace("youtube.com", "youtube-nocookie.com");
      iframe.src = newSrc;
      wrapper.replaceWith(iframe);
    });
    
    iframe.replaceWith(wrapper);
  });
});