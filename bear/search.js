document.addEventListener('DOMContentLoaded', () => {
  // Nur auf /blog/ Seite ausführen
  if (!window.location.pathname.startsWith('/blog')) return

  const list = document.querySelector('.blog-posts')
  if (!list) return

  const posts = Array.from(list.querySelectorAll('li'))
  if (!posts.length) return

  // ===== KONFIGURATION =====
  const CONFIG = {
    SEARCH_DEBOUNCE: 300,
    MAX_SEARCH_LENGTH: 200
  }

  // ===== POST-DATEN =====
  const postData = posts.map(li => {
    const linkEl = li.querySelector('a')
    const timeEl = li.querySelector('time')
    const title = linkEl?.textContent.trim() || ''

    return {
      li,
      linkEl,
      title,
      searchText: `${title} ${timeEl?.textContent || ''}`.toLowerCase()
    }
  })

  // ===== FLOATING SEARCH UI =====
  const searchContainer = document.createElement('div')
  searchContainer.className = 'floating-search'
  searchContainer.innerHTML = `
    <button class="search-toggle" aria-label="Suche öffnen">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="11" cy="11" r="8"></circle>
        <path d="m21 21-4.35-4.35"></path>
      </svg>
    </button>
    <div class="search-input-wrapper" style="display: none;">
      <input type="search" id="blog-search" placeholder="Suche..." autocomplete="off" maxlength="${CONFIG.MAX_SEARCH_LENGTH}">
      <button class="search-close" aria-label="Suche schließen">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
    </div>
  `
  document.body.appendChild(searchContainer)

  const searchToggle = searchContainer.querySelector('.search-toggle')
  const searchInputWrapper = searchContainer.querySelector('.search-input-wrapper')
  const searchInput = searchContainer.querySelector('#blog-search')
  const searchClose = searchContainer.querySelector('.search-close')

  // ===== INFOBOX FÜR "KEINE ERGEBNISSE" =====
  const noResultsBox = document.createElement('div')
  noResultsBox.className = 'infobox-frame'
  noResultsBox.style.display = 'none'
  noResultsBox.setAttribute('aria-live', 'polite')
  noResultsBox.innerHTML = `
    <div class="infobox-icon"></div>
    <div class="infobox-text">
      <p>Zu der Suche wurden leider keine Ergebnisse gefunden.</p>
    </div>
  `
  list.parentNode.insertBefore(noResultsBox, list)

  // ===== SCREENREADER-FEEDBACK =====
  const srFeedback = document.createElement('div')
  srFeedback.className = 'sr-only'
  srFeedback.setAttribute('aria-live', 'polite')
  srFeedback.setAttribute('aria-atomic', 'true')
  srFeedback.style.position = 'absolute'
  srFeedback.style.left = '-10000px'
  srFeedback.style.width = '1px'
  srFeedback.style.height = '1px'
  srFeedback.style.overflow = 'hidden'
  document.body.appendChild(srFeedback)

  // ===== STATE =====
  let isSearchOpen = false
  let searchTimeout = null
  let lastSearch = ''

  // ===== SEARCH TOGGLE FUNKTIONEN =====
  function openSearch() {
    isSearchOpen = true
    searchToggle.style.display = 'none'
    searchInputWrapper.style.display = 'flex'
    searchContainer.classList.add('expanded')
    setTimeout(() => searchInput.focus(), 100)
  }

  function closeSearch() {
    isSearchOpen = false
    searchInputWrapper.style.display = 'none'
    searchToggle.style.display = 'flex'
    searchContainer.classList.remove('expanded')

    // Focus zurück auf Toggle-Button
    searchToggle.focus()

    // Nur Suchfeld leeren und re-rendern, wenn wirklich gesucht wurde
    if (searchInput.value.trim()) {
      searchInput.value = ''
      render('', true)
    }
  }

  // ===== EVENT LISTENERS FÜR SEARCH TOGGLE =====
  searchToggle.addEventListener('click', openSearch)
  searchClose.addEventListener('click', closeSearch)

  // ESC zum Schließen
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isSearchOpen) {
      closeSearch()
    }
  })

  // Außerhalb klicken zum Schließen - NUR wenn kein Suchbegriff eingegeben
  document.addEventListener('click', (e) => {
    if (!isSearchOpen) return

    if (!searchContainer.contains(e.target)) {
      if (!searchInput.value.trim()) {
        closeSearch()
      }
    }
  }, { passive: true })

  // ===== URL MANAGEMENT =====
  function getSearchFromURL() {
    const params = new URLSearchParams(window.location.search)
    return params.get('search') || ''
  }

  function updateURL(search, replace = false) {
    const params = new URLSearchParams()
    if (search) params.set('search', search)

    const url = params.toString()
      ? `${window.location.pathname}?${params.toString()}`
      : window.location.pathname

    if (replace) {
      window.history.replaceState({ search }, '', url)
    } else {
      window.history.pushState({ search }, '', url)
    }
  }

  // ===== UTILITIES =====
  const HTML_ENTITIES = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  };

  function escapeHtml(str) {
    return str.replace(/[&<>"']/g, char => HTML_ENTITIES[char]);
  }

  // ===== FILTER & HIGHLIGHTING =====
  function highlightSearchTerm(text, searchTerm) {
    if (!searchTerm) return escapeHtml(text)

    // Escape HTML entities in both text and search term for safe innerHTML use
    const safeText = escapeHtml(text)
    const safeSearchTerm = escapeHtml(searchTerm)
    const regex = new RegExp(`(${safeSearchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
    return safeText.replace(regex, '<mark>$1</mark>')
  }

  // ===== RENDER FUNKTION =====
  function render(search, updateHistory = false) {
    const searchTrimmed = search.trim()
    const normalizedSearch = searchTrimmed.toLowerCase()
    let matches = 0

    // Suchfeld synchronisieren (ohne Event auszulösen)
    if (searchInput.value !== search) {
      searchInput.value = search
    }

    postData.forEach(p => {
      const isMatch = !normalizedSearch || p.searchText.includes(normalizedSearch)
      if (isMatch) {
        matches += 1
        p.li.style.display = ''
        if (p.linkEl) {
          if (normalizedSearch && lastSearch !== normalizedSearch) {
            p.linkEl.innerHTML = highlightSearchTerm(p.title, searchTrimmed)
          } else if (!normalizedSearch && lastSearch) {
            p.linkEl.textContent = p.title
          }
        }
      } else {
        p.li.style.display = 'none'
      }
    })

    // Keine Ergebnisse gefunden
    if (matches === 0 && searchTrimmed) {
      noResultsBox.style.display = 'flex'
      list.style.display = 'none'
      srFeedback.textContent = 'Keine Ergebnisse gefunden'

      if (updateHistory) {
        updateURL(search, true)
      }
      lastSearch = normalizedSearch
      return
    } else {
      noResultsBox.style.display = 'none'
      list.style.display = ''
    }

    // Screenreader-Feedback
    if (searchTrimmed) {
      srFeedback.textContent = `${matches} ${matches === 1 ? 'Ergebnis' : 'Ergebnisse'} gefunden`
    } else {
      srFeedback.textContent = ''
    }

    // URL aktualisieren
    if (updateHistory) {
      updateURL(search, true)
    }
    lastSearch = normalizedSearch
  }

  // ===== SEARCH INPUT MIT DEBOUNCING =====
  searchInput.addEventListener('input', () => {
    clearTimeout(searchTimeout)
    searchTimeout = setTimeout(() => {
      const search = searchInput.value.trim()
      render(search, true)
    }, CONFIG.SEARCH_DEBOUNCE)
  })

  // ===== BROWSER BACK/FORWARD =====
  window.addEventListener('popstate', (event) => {
    const search = event.state?.search || getSearchFromURL()

    // Suche öffnen wenn Search-Parameter in URL (VOR dem Setzen des Werts)
    if (search && !isSearchOpen) {
      openSearch()
    }

    // Suchfeld mit URL-Suchbegriff synchronisieren (NACH dem Öffnen)
    if (searchInput.value !== search) {
      searchInput.value = search || ''
    }

    render(search || '', false)
  })

  // ===== INITIALISIERUNG =====
  const initialSearch = getSearchFromURL()
  if (initialSearch) {
    openSearch()
  }

  // Initial render mit URL-State
  render(initialSearch, false)
  // Initialen State in History setzen
  updateURL(initialSearch, true)
})
