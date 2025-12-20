(function() {
  const toggle = document.getElementById('theme-toggle');
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