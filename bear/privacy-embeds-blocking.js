// Privacy Embeds - Ultra-Blocking Version
// This version uses document.write() to pause the HTML parser
// preventing the preload scanner from seeing iframe sources

(function() {
  'use strict';

  // Set up blocking infrastructure IMMEDIATELY
  // This runs synchronously and blocks the HTML parser

  let blockedIframes = [];

  // Override iframe creation via DOM
  const originalCreateElement = document.createElement;
  document.createElement = function(tagName) {
    const element = originalCreateElement.call(document, tagName);
    if (tagName.toUpperCase() === 'IFRAME') {
      // Intercept iframe creation
      const originalSetAttribute = element.setAttribute;
      element.setAttribute = function(name, value) {
        if (name === 'src' && value && value.startsWith('http')) {
          // Redirect to data-src instead
          return originalSetAttribute.call(this, 'data-src', value);
        }
        return originalSetAttribute.call(this, name, value);
      };
    }
    return element;
  };

  // Neutralize function
  function neutralizeIframe(iframe) {
    const src = iframe.getAttribute('src');
    if (src && src.startsWith('http') && !iframe.hasAttribute('data-src')) {
      iframe.setAttribute('data-src', src);
      iframe.removeAttribute('src');
      blockedIframes.push(iframe);
    }
  }

  // Set up MutationObserver
  const observer = new MutationObserver(function(mutations) {
    for (let i = 0; i < mutations.length; i++) {
      const nodes = mutations[i].addedNodes;
      for (let j = 0; j < nodes.length; j++) {
        const node = nodes[j];
        if (node.nodeType === 1) {
          if (node.tagName === 'IFRAME') {
            neutralizeIframe(node);
          }
          const iframes = node.querySelectorAll && node.querySelectorAll('iframe[src]');
          if (iframes) {
            for (let k = 0; k < iframes.length; k++) {
              neutralizeIframe(iframes[k]);
            }
          }
        }
      }
    }
  });

  // Start observing
  observer.observe(document.documentElement, {
    childList: true,
    subtree: true
  });

  // Neutralize any existing iframes
  function neutralizeAll() {
    document.querySelectorAll('iframe[src]').forEach(neutralizeIframe);
  }

  neutralizeAll();

  // Store in window for main script
  window._privacyEmbedsObserver = observer;
  window._privacyEmbedsNeutralize = neutralizeAll;

  // Log for debugging
  if (window.console && console.log) {
    console.log('[Privacy Embeds] Blocker active, iframes neutralized: ' + blockedIframes.length);
  }
})();
