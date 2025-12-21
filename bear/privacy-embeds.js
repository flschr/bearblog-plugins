  document.addEventListener("DOMContentLoaded", function() {
    // detect language (DE, EN are supported)
    const isEn = navigator.language.startsWith('en');
    
    // Define the texts
    const i18n = {
      video: isEn ? 'Video' : 'Video',
      map: isEn ? 'Map' : 'Karte',
      load: isEn ? 'Load' : 'laden',
      note: isEn 
        ? 'Loading this content will transfer data to' 
        : 'Beim Laden werden Daten an'
    };

    const selectors = [
      'iframe[src*="youtube.com"]',
      'iframe[src*="youtube-nocookie.com"]',
      'iframe[src*="googleusercontent.com/maps"]'
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
        ${i18n.note} ${service}.</p>
        <button>${isEn ? 'Load' : ''} ${typeLabel} ${isEn ? '' : i18n.load}</button>
      `;
      
      const btn = wrapper.querySelector('button');
      btn.addEventListener('click', () => {
        iframe.src = src.replace("youtube.com", "youtube-nocookie.com");
        wrapper.replaceWith(iframe);
      });
      
      iframe.replaceWith(wrapper);
    });
  });