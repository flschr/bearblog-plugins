(function() {
  'use strict';

  // Immediately neutralize iframe src attributes to prevent loading before JS runs
  // This runs synchronously when the script is parsed
  function neutralizeIframes() {
    const iframes = document.querySelectorAll('iframe[src]');
    iframes.forEach(iframe => {
      const src = iframe.getAttribute('src');
      if (src && src.startsWith('http')) {
        iframe.setAttribute('data-src', src);
        iframe.removeAttribute('src');
      }
    });
  }

  // Run immediately to catch iframes as early as possible
  neutralizeIframes();

  // Also run when DOM is ready in case more iframes were added
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', neutralizeIframes);
  }

  function initPrivacyEmbeds() {
    // Detect browser language (fallback to German if not English)
    const lang = navigator.language || navigator.userLanguage || 'de';
    const isEn = lang.startsWith('en');

    // Translations
    const i18n = {
      externalMap: isEn ? 'External Map' : 'Externe Karte',
      externalVideo: isEn ? 'External Video' : 'Externes Video',
      externalContent: isEn ? 'External Content' : 'Externer Inhalt',
      load: isEn ? 'Load' : 'laden',
      content: isEn ? 'Content' : 'Inhalt',
      noteStart: isEn ? 'Loading this content will transfer data to' : 'Beim Laden dieses Inhalts werden Daten an',
      noteEnd: isEn ? '.' : ' übertragen.',
      noteGeneric: isEn ? 'Loading this content will transfer data to a third-party provider.' : 'Beim Laden dieses Inhalts werden Daten an einen Drittanbieter übertragen.'
    };

    // Provider detection patterns and configuration
    const providers = [
      {
        name: 'YouTube',
        patterns: ['youtube.com', 'youtube-nocookie.com', 'youtu.be'],
        type: 'video',
        transformSrc: (src) => src.replace('youtube.com', 'youtube-nocookie.com')
      },
      {
        name: 'Google Maps',
        patterns: ['maps.google', 'google.com/maps', 'googleusercontent.com'],
        type: 'map',
        transformSrc: (src) => src
      },
      {
        name: 'Arte',
        patterns: ['arte.tv'],
        type: 'video',
        transformSrc: (src) => src
      },
      {
        name: 'Vimeo',
        patterns: ['vimeo.com', 'player.vimeo.com'],
        type: 'video',
        transformSrc: (src) => src
      },
      {
        name: 'Dailymotion',
        patterns: ['dailymotion.com', 'dai.ly'],
        type: 'video',
        transformSrc: (src) => src
      },
      {
        name: 'Spotify',
        patterns: ['spotify.com', 'open.spotify.com'],
        type: 'audio',
        transformSrc: (src) => src
      },
      {
        name: 'SoundCloud',
        patterns: ['soundcloud.com', 'w.soundcloud.com'],
        type: 'audio',
        transformSrc: (src) => src
      }
    ];

    // Get all iframes that haven't been processed yet
    const iframes = document.querySelectorAll('iframe[data-src]:not([data-privacy-processed])');

    iframes.forEach(iframe => {
      const originalSrc = iframe.dataset.src;
      if (!originalSrc) return;

      // Mark as processed to avoid re-processing on bfcache restore
      iframe.setAttribute('data-privacy-processed', 'true');

      // Skip iframes without http(s) protocol (e.g., about:blank)
      if (!originalSrc.startsWith('http')) return;

      // Find matching provider
      const provider = providers.find(p =>
        p.patterns.some(pattern => originalSrc.toLowerCase().includes(pattern))
      );

      let typeLabel, fullTypeLabel, service, transformSrc;

      if (provider) {
        // Known provider
        service = provider.name;
        transformSrc = provider.transformSrc;

        if (provider.type === 'map') {
          typeLabel = isEn ? 'Map' : 'Karte';
          fullTypeLabel = i18n.externalMap;
        } else if (provider.type === 'audio') {
          typeLabel = isEn ? 'Audio' : 'Audio';
          fullTypeLabel = isEn ? 'External Audio' : 'Externes Audio';
        } else {
          typeLabel = 'Video';
          fullTypeLabel = i18n.externalVideo;
        }
      } else {
        // Generic fallback for unknown providers
        service = null;
        transformSrc = (src) => src;
        typeLabel = i18n.content;
        fullTypeLabel = i18n.externalContent;
      }

      // Create placeholder wrapper
      const wrapper = document.createElement('div');
      wrapper.className = 'media-proxy';

      const noteText = service
        ? `${i18n.noteStart} ${service}${i18n.noteEnd}`
        : i18n.noteGeneric;

      wrapper.innerHTML = `
        <p><strong>${fullTypeLabel}</strong><br>
        ${noteText}</p>
        <button type="button">${typeLabel} ${i18n.load}</button>
      `;

      const btn = wrapper.querySelector('button');

      // Click handler to load the iframe
      const handleClick = () => {
        iframe.src = transformSrc(originalSrc);
        wrapper.replaceWith(iframe);
      };

      btn.addEventListener('click', handleClick, { once: true });
      iframe.replaceWith(wrapper);
    });
  }

  // Initialize on DOMContentLoaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPrivacyEmbeds);
  } else {
    initPrivacyEmbeds();
  }

  // Re-initialize on pageshow to handle bfcache (browser back/forward)
  window.addEventListener('pageshow', (event) => {
    if (event.persisted) {
      // Page was restored from bfcache - re-neutralize and re-init
      neutralizeIframes();
      initPrivacyEmbeds();
    }
  });
})();