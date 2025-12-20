(function() {
  let savedTheme = null;

  // Safely read from localStorage with error handling
  try {
    savedTheme = localStorage.getItem('theme');
  } catch(e) {
    // Silent fail - localStorage might be unavailable in private browsing
  }

  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const theme = savedTheme || (prefersDark ? 'dark' : 'light');
  document.documentElement.setAttribute('data-theme', theme);
})();