document.addEventListener('DOMContentLoaded', () => {
  // Nur auf /blog/ Seite ausführen
  if (!window.location.pathname.startsWith('/blog')) return

  const list = document.querySelector('.blog-posts')
  if (!list) return

  const posts = Array.from(list.querySelectorAll('li'))
  if (!posts.length) return

  // ===== KONFIGURATION =====
  const CONFIG = {
    INITIAL_LOAD: 15,
    LOAD_MORE: 10,
    SEARCH_DEBOUNCE: 300,
    SCROLL_THRESHOLD: 200,
    LOAD_DELAY: 100,
    MAX_SEARCH_LENGTH: 200
  }

  // ===== POST-DATEN =====
  const postData = posts.map(li => {
    const linkEl = li.querySelector('a')
    const timeEl = li.querySelector('time')

    return {
      li,
      title: linkEl?.textContent.trim() || '',
      searchText: `${linkEl?.textContent.trim() || ''} ${timeEl?.textContent || ''}`.toLowerCase()
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

  // ===== END-OF-LIST HINWEIS =====
  const endHint = document.createElement('hr')
  endHint.setAttribute('end', '')
  list.insertAdjacentElement('afterend', endHint)

  // ===== SCROLL SENTINEL FÜR INTERSECTION OBSERVER =====
  const sentinel = document.createElement('div')
  sentinel.className = 'scroll-sentinel'
  sentinel.style.height = '1px'
  sentinel.style.position = 'relative'
  endHint.insertAdjacentElement('beforebegin', sentinel)

  // ===== STATE =====
  let currentlyShown = 0
  let isSearchOpen = false
  let isLoading = false
  let searchTimeout = null

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
      const state = getStateFromURL()
      render(state.shown || currentlyShown, '', true)
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
  function getStateFromURL() {
    const params = new URLSearchParams(window.location.search)
    return {
      shown: parseInt(params.get('shown')) || CONFIG.INITIAL_LOAD,
      search: params.get('search') || ''
    }
  }

  function updateURL(shown, search, replace = false) {
    const params = new URLSearchParams()
    if (shown > CONFIG.INITIAL_LOAD) params.set('shown', shown)
    if (search) params.set('search', search)

    const url = params.toString()
      ? `${window.location.pathname}?${params.toString()}`
      : window.location.pathname

    if (replace) {
      window.history.replaceState({ shown, search }, '', url)
    } else {
      window.history.pushState({ shown, search }, '', url)
    }
  }

  // ===== FILTER & HIGHLIGHTING =====
  function getFilteredPosts(searchQuery) {
    if (!searchQuery) return postData
    const query = searchQuery.toLowerCase().trim()
    if (!query) return postData
    
    return postData.filter(p => p.searchText.includes(query))
  }

  function highlightSearchTerm(text, searchTerm) {
    if (!searchTerm) return text
    
    const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
    return text.replace(regex, '<mark>$1</mark>')
  }

  // ===== RENDER FUNKTION =====
  function render(shown, search, updateHistory = false) {
    const searchTrimmed = search.trim()
    const filtered = getFilteredPosts(searchTrimmed)

    // Anzahl korrigieren falls nötig
    if (shown > filtered.length) {
      shown = filtered.length
    }
    if (shown < CONFIG.INITIAL_LOAD) {
      shown = CONFIG.INITIAL_LOAD
    }

    currentlyShown = shown
    const displayPosts = filtered.slice(0, shown)

    // Suchfeld synchronisieren (ohne Event auszulösen)
    if (searchInput.value !== search) {
      searchInput.value = search
    }

    // Liste leeren
    list.innerHTML = ''

    // Keine Ergebnisse gefunden
    if (filtered.length === 0 && searchTrimmed) {
      noResultsBox.style.display = 'flex'
      list.style.display = 'none'
      endHint.style.display = 'none'
      sentinel.style.display = 'none'
      srFeedback.textContent = 'Keine Ergebnisse gefunden'
      
      if (updateHistory) {
        updateURL(shown, search)
      }
      return
    } else {
      noResultsBox.style.display = 'none'
      list.style.display = ''
      sentinel.style.display = ''
    }

    // Fragment für bessere Performance
    const fragment = document.createDocumentFragment()

    displayPosts.forEach(p => {
      const clone = p.li.cloneNode(true)
      
      // Highlighting anwenden
      if (searchTrimmed) {
        const linkEl = clone.querySelector('a')
        if (linkEl) {
          linkEl.innerHTML = highlightSearchTerm(p.title, searchTrimmed)
        }
      }
      
      fragment.appendChild(clone)
    })

    list.appendChild(fragment)

    // Screenreader-Feedback
    if (searchTrimmed) {
      srFeedback.textContent = `${filtered.length} ${filtered.length === 1 ? 'Ergebnis' : 'Ergebnisse'} gefunden`
    } else {
      srFeedback.textContent = ''
    }

    // End-Hinweis anzeigen wenn alle Artikel geladen
    if (shown >= filtered.length && !searchTrimmed) {
      endHint.style.display = 'block'
    } else {
      endHint.style.display = 'none'
    }

    // URL aktualisieren
    if (updateHistory) {
      updateURL(shown, search)
    }
  }

  // ===== SEARCH INPUT MIT DEBOUNCING =====
  searchInput.addEventListener('input', () => {
    clearTimeout(searchTimeout)
    searchTimeout = setTimeout(() => {
      const search = searchInput.value.trim()
      render(CONFIG.INITIAL_LOAD, search, true)
    }, CONFIG.SEARCH_DEBOUNCE)
  })

  // ===== INFINITE SCROLL MIT INTERSECTION OBSERVER + FALLBACK =====
  function loadMorePosts() {
    if (isLoading) return

    const state = getStateFromURL()
    const filtered = getFilteredPosts(state.search)

    // Alle Artikel bereits geladen?
    if (currentlyShown >= filtered.length) return

    isLoading = true
    const newShown = Math.min(currentlyShown + CONFIG.LOAD_MORE, filtered.length)
    render(newShown, state.search, true)
    
    setTimeout(() => { 
      isLoading = false
    }, CONFIG.LOAD_DELAY)
  }

  // IntersectionObserver
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        loadMorePosts()
      }
    })
  }, { 
    rootMargin: `${CONFIG.SCROLL_THRESHOLD}px`,
    threshold: 0
  })

  // Scroll-Fallback mit requestAnimationFrame
  let ticking = false
  function checkScrollFallback() {
    if (ticking) return
    
    ticking = true
    requestAnimationFrame(() => {
      const state = getStateFromURL()
      const filtered = getFilteredPosts(state.search)
      
      // Alle bereits geladen?
      if (currentlyShown >= filtered.length) {
        ticking = false
        return
      }

      // Scroll-Position prüfen
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop
      const scrollPosition = window.innerHeight + scrollTop
      const documentHeight = Math.max(
        document.body.scrollHeight,
        document.documentElement.scrollHeight
      )
      const threshold = documentHeight - CONFIG.SCROLL_THRESHOLD

      if (scrollPosition >= threshold) {
        loadMorePosts()
      }
      
      ticking = false
    })
  }

  window.addEventListener('scroll', checkScrollFallback, { passive: true })

  // ===== BROWSER BACK/FORWARD =====
  window.addEventListener('popstate', (event) => {
    const state = event.state || getStateFromURL()
    
    // Suche öffnen wenn Search-Parameter in URL (VOR dem Setzen des Werts)
    if (state.search && !isSearchOpen) {
      openSearch()
    }
    
    // Suchfeld mit URL-Suchbegriff synchronisieren (NACH dem Öffnen)
    if (searchInput.value !== state.search) {
      searchInput.value = state.search || ''
    }
    
    render(state.shown || CONFIG.INITIAL_LOAD, state.search || '', false)
  })

  // ===== INITIALISIERUNG =====
  const initialState = getStateFromURL()
  if (initialState.search) {
    openSearch()
  }

  // Initial render mit URL-State
  render(initialState.shown, initialState.search, false)
  // Initialen State in History setzen
  updateURL(initialState.shown, initialState.search, true)
  
  // Observer starten
  observer.observe(sentinel)
})
