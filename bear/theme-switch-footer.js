(function() {
  const toggle = document.getElementById('theme-toggle');
  if (!toggle) return;
  
  toggle.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
  });
})();