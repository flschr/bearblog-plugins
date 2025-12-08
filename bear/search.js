document.addEventListener('DOMContentLoaded', () => {
  // Nur auf /blog/ Seite ausführen
  if (!window.location.pathname.startsWith('/blog')) return

  const list = document.querySelector('.blog-posts')
  if (!list) return

  const posts = Array.from(list.querySelectorAll('li'))
  if (!posts.length) return

  // Post-Daten
  const postData = posts.map(li => {
    const linkEl = li.querySelector('a')
    const timeEl = li.querySelector('time')

    return {
      li,
      searchText: `${linkEl?.textContent.trim() || ''} ${timeEl?.textContent || ''}`.toLowerCase()
    }
  })

  // Floating Search UI erstellen
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
      <input type="search" id="blog-search" placeholder="Suche..." autocomplete="off">
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

  // Toggle Search
  let isSearchOpen = false
  
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
    searchInput.value = ''
    render(initialLoad, '', true)
  }

  searchToggle.addEventListener('click', openSearch)
  searchClose.addEventListener('click', closeSearch)

  // ESC zum Schließen
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isSearchOpen) {
      closeSearch()
    }
  })

  // Außerhalb klicken zum Schließen
  document.addEventListener('click', (e) => {
    if (!isSearchOpen) return
    
    // Prüfen ob Klick außerhalb des searchContainer war
    if (!searchContainer.contains(e.target)) {
      closeSearch()
    }
  })

  // Infobox für "Keine Ergebnisse" erstellen
  const noResultsBox = document.createElement('div')
  noResultsBox.className = 'infobox-frame'
  noResultsBox.style.display = 'none'
  noResultsBox.innerHTML = `
    <div class="infobox-icon"></div>
    <div class="infobox-text">
      <p>Zu der Suche wurden leider keine Ergebnisse gefunden.</p>
    </div>
  `
  list.parentNode.insertBefore(noResultsBox, list)

  // End-of-list Hinweis
  const endHint = document.createElement('div')
  endHint.className = 'blog-end-hint'
  endHint.style.cssText = 'text-align: center; padding: 2rem 0; color: var(--text-muted, #666); display: none;'
  endHint.innerHTML = `<p>That's all! Try <a href="#" id="open-search-link">searching</a> if you didn't find it.</p>`
  list.insertAdjacentElement('afterend', endHint)

  // "Nutze die Suche" Link - mit Event Delegation
  endHint.addEventListener('click', (e) => {
    if (e.target.id === 'open-search-link') {
      e.preventDefault()
      openSearch()
    }
  })

  const initialLoad = 15
  const loadMore = 10
  let currentlyShown = 0

  // URL-Parameter auslesen
  function getStateFromURL() {
    const params = new URLSearchParams(window.location.search)
    return {
      shown: parseInt(params.get('shown')) || initialLoad,
      search: params.get('search') || ''
    }
  }

  // URL aktualisieren
  function updateURL(shown, search, replace = false) {
    const params = new URLSearchParams()
    if (shown > initialLoad) params.set('shown', shown)
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

  // Filter-Funktion
  function getFilteredPosts(searchQuery) {
    if (!searchQuery) return postData
    const query = searchQuery.toLowerCase()
    return postData.filter(p => p.searchText.includes(query))
  }

  // Render-Funktion
  function render(shown, search, updateHistory = false) {
    const filtered = getFilteredPosts(search)

    // Anzahl korrigieren falls nötig
    if (shown > filtered.length) {
      shown = filtered.length
    }
    if (shown < initialLoad) {
      shown = initialLoad
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
    if (filtered.length === 0 && search) {
      noResultsBox.style.display = 'flex'
      list.style.display = 'none'
      endHint.style.display = 'none'
      if (updateHistory) {
        updateURL(shown, search)
      }
      return
    } else {
      noResultsBox.style.display = 'none'
      list.style.display = ''
    }

    // Fragment für bessere Performance
    const fragment = document.createDocumentFragment()

    displayPosts.forEach(p => {
      fragment.appendChild(p.li)
    })

    list.appendChild(fragment)

    // End-Hinweis anzeigen wenn alle Artikel geladen
    if (shown >= filtered.length && !search) {
      endHint.style.display = 'block'
    } else {
      endHint.style.display = 'none'
    }

    // URL aktualisieren
    if (updateHistory) {
      updateURL(shown, search)
    }
  }

  // Event-Listener mit Debouncing für Search
  let searchTimeout
  searchInput.addEventListener('input', () => {
    clearTimeout(searchTimeout)
    searchTimeout = setTimeout(() => {
      const search = searchInput.value.trim()
      render(initialLoad, search, true)
    }, 300)
  })

  // Infinite Scroll
  let isLoading = false
  function checkScroll() {
    if (isLoading) return

    const state = getStateFromURL()
    const filtered = getFilteredPosts(state.search)

    // Alle Artikel bereits geladen?
    if (currentlyShown >= filtered.length) return

    // 200px vor Ende des Dokuments?
    const scrollPosition = window.innerHeight + window.scrollY
    const threshold = document.documentElement.scrollHeight - 200

    if (scrollPosition >= threshold) {
      isLoading = true
      const newShown = Math.min(currentlyShown + loadMore, filtered.length)
      render(newShown, state.search, true)
      // Kurze Verzögerung vor nächstem Load
      setTimeout(() => { isLoading = false }, 100)
    }
  }

  window.addEventListener('scroll', checkScroll)
  window.addEventListener('resize', checkScroll)

  // Browser Back/Forward Buttons
  window.addEventListener('popstate', (event) => {
    const state = event.state || getStateFromURL()
    render(state.shown || initialLoad, state.search || '', false)
    
    // Suche öffnen wenn Search-Parameter in URL
    if (state.search && !isSearchOpen) {
      openSearch()
    }
  })

  // Bei Suchparameter in URL automatisch öffnen
  const initialState = getStateFromURL()
  if (initialState.search) {
    openSearch()
  }

  // Initial render mit URL-State
  render(initialState.shown, initialState.search, false)
  // Initialen State in History setzen
  updateURL(initialState.shown, initialState.search, true)
})