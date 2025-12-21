(function() {
  'use strict';

  const toggle = document.getElementById('theme-toggle');

  // Check if user has explicitly saved a theme preference
  function hasSavedTheme() {
    try {
      return localStorage.getItem('theme') !== null;
    } catch(e) {
      return false;
    }
  }

  // Listen for system theme changes (only applies if user hasn't set a preference)
  const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');
  darkModeQuery.addEventListener('change', (e) => {
    if (!hasSavedTheme()) {
      document.documentElement.setAttribute('data-theme', e.matches ? 'dark' : 'light');
    }
  });

  if (!toggle) return;

  toggle.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';

    document.documentElement.setAttribute('data-theme', next);

    // Safely store in localStorage with error handling
    try {
      localStorage.setItem('theme', next);
    } catch(e) {
      // Silent fail - localStorage might be unavailable in private browsing
    }

    toggle.blur();
  });
})();