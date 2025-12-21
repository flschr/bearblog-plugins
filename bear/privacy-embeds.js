(function() {
  'use strict';

  document.addEventListener('DOMContentLoaded', () => {
    // Detect browser language (fallback to German if not English)
    const lang = navigator.language || navigator.userLanguage || 'de';
    const isEn = lang.startsWith('en');

    // Translations
    const i18n = {
      externalMap: isEn ? 'External Map' : 'Externe Karte',
      externalVideo: isEn ? 'External Video' : 'Externes Video',
      load: isEn ? 'Load' : 'laden',
      noteStart: isEn ? 'Loading this content will transfer data to' : 'Beim Laden dieses Inhalts werden Daten an',
      noteEnd: isEn ? '.' : ' übertragen.'
    };

    // Selectors for YouTube and Google Maps (including data-src for lazy-loaded iframes)
    const selectors = [
      'iframe[src*="youtube"]',
      'iframe[data-src*="youtube"]',
      'iframe[src*="googleusercontent.com"]',
      'iframe[data-src*="googleusercontent.com"]',
      'iframe[src*="maps.google"]',
      'iframe[data-src*="maps.google"]',
      'iframe[src*="google.com/maps"]',
      'iframe[data-src*="google.com/maps"]'
    ];

    const iframes = document.querySelectorAll(selectors.join(','));

    iframes.forEach(iframe => {
      // Support both src and data-src attributes
      const originalSrc = iframe.src || iframe.dataset.src;
      if (!originalSrc) return;

      const isMap = originalSrc.includes('maps') || originalSrc.includes('googleusercontent');
      const typeLabel = isMap ? (isEn ? 'Map' : 'Karte') : 'Video';
      const fullTypeLabel = isMap ? i18n.externalMap : i18n.externalVideo;
      const service = isMap ? 'Google Maps' : 'YouTube';

      // Create placeholder wrapper
      const wrapper = document.createElement('div');
      wrapper.className = 'media-proxy';
      wrapper.innerHTML = `
        <p><strong>${fullTypeLabel}</strong><br>
        ${i18n.noteStart} ${service}${i18n.noteEnd}</p>
        <button type="button">${typeLabel} ${i18n.load}</button>
      `;

      const btn = wrapper.querySelector('button');

      // Store values needed for click handler (avoid closure over iframe)
      const handleClick = () => {
        const finalSrc = isMap ? originalSrc : originalSrc.replace('youtube.com', 'youtube-nocookie.com');
        iframe.src = finalSrc;
        wrapper.replaceWith(iframe);
      };

      btn.addEventListener('click', handleClick, { once: true });
      iframe.replaceWith(wrapper);
    });
  });
})();