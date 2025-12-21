(function() {
  'use strict';

  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('main img').forEach((img, index) => {
      // First image (likely above the fold) gets high priority
      if (index === 0) {
        img.setAttribute('loading', 'eager');
        img.setAttribute('fetchpriority', 'high');
      } else {
        img.setAttribute('loading', 'lazy');
        img.setAttribute('fetchpriority', 'low');
      }
      img.setAttribute('decoding', 'async');
    });
  });
})();