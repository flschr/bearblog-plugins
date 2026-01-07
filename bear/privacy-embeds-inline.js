// Privacy Embeds - Inline Critical Blocker (Readable Version)
// This MUST be inlined in <head> to prevent preload scanner from seeing iframe sources
//
// Minified version for production (save ~300 bytes):
// (function(){function n(e){const t=e.getAttribute('src');t&&t.startsWith('http')&&!e.hasAttribute('data-src')&&(e.setAttribute('data-src',t),e.removeAttribute('src'))}function i(){document.querySelectorAll('iframe[src]').forEach(n)}const o=new MutationObserver(function(e){for(let t=0;t<e.length;t++){const r=e[t].addedNodes;for(let e=0;e<r.length;e++){const t=r[e];if(t.nodeType===1){if(t.tagName==='IFRAME'){n(t)}const a=t.querySelectorAll&&t.querySelectorAll('iframe[src]');if(a){for(let e=0;e<a.length;e++){n(a[e])}}}}}});o.observe(document.documentElement,{childList:true,subtree:true});i();window._privacyEmbedsObserver=o})();

(function() {
  'use strict';

  // Neutralize a single iframe by moving src to data-src
  function neutralizeIframe(iframe) {
    const src = iframe.getAttribute('src');
    if (src && src.startsWith('http') && !iframe.hasAttribute('data-src')) {
      iframe.setAttribute('data-src', src);
      iframe.removeAttribute('src');
      console.log('🚫 Privacy Embeds: Blocked iframe -', src);
    }
  }

  // Neutralize all existing iframes
  function neutralizeAll() {
    document.querySelectorAll('iframe[src]').forEach(neutralizeIframe);
  }

  // Set up MutationObserver to catch iframes as they're added
  const observer = new MutationObserver(function(mutations) {
    for (let i = 0; i < mutations.length; i++) {
      const nodes = mutations[i].addedNodes;
      for (let j = 0; j < nodes.length; j++) {
        const node = nodes[j];
        if (node.nodeType === 1) {
          // Check if node itself is an iframe
          if (node.tagName === 'IFRAME') {
            neutralizeIframe(node);
          }
          // Check for iframes in children
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

  // Start observing before body is parsed
  observer.observe(document.documentElement, {
    childList: true,
    subtree: true
  });

  // Neutralize any iframes that already exist
  neutralizeAll();

  // Store observer in window for main script to reuse
  window._privacyEmbedsObserver = observer;

  console.log('✅ Privacy Embeds: Inline blocker active');
})();
