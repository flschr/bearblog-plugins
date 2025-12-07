document.addEventListener('DOMContentLoaded', () => {
  // Nur auf /blog/ Seite ausführen
  if (!window.location.pathname.startsWith('/blog')) return

  const list = document.querySelector('.blog-posts')
  if (!list) return

  const posts = Array.from(list.querySelectorAll('li'))
  if (!posts.length) return

  const months = [
    'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
    'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'
  ]

  // Post-Daten
  const postData = posts.map(li => {
    const timeEl = li.querySelector('time')
    const linkEl = li.querySelector('a')
    const dateStr = timeEl?.getAttribute('datetime') || ''
    const date = dateStr ? new Date(dateStr) : new Date()
    
    return {
      li,
      year: date.getFullYear(),
      monthKey: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`,
      monthLabel: `${months[date.getMonth()]} ${date.getFullYear()}`,
      searchText: `${linkEl?.textContent.trim() || ''} ${timeEl?.textContent || ''}`.toLowerCase()
    }
  })

  // Search Control erstellen
  const controls = document.createElement('div')
  controls.className = 'blog-controls'
  controls.innerHTML = `
    <div class="blog-controls-row">
      <label class="sr-only" for="blog-search">Suche</label>
      <input 
        id="blog-search" 
        type="search" 
        placeholder="Artikel durchsuchen…"
        aria-label="Artikel durchsuchen">
    </div>
  `
  list.parentNode.insertBefore(controls, list)

  const searchInput = controls.querySelector('#blog-search')

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

  // Pagination UI
  const pagination = document.createElement('nav')
  pagination.className = 'pagination'
  pagination.setAttribute('aria-label', 'Seitennavigation')
  pagination.innerHTML = `
    <a href="#" class="pagination-prev" aria-label="Neuere Artikel">← Neuere Artikel</a>
    <a href="#" class="pagination-next" aria-label="Ältere Artikel">Ältere Artikel →</a>
  `
  list.insertAdjacentElement('afterend', pagination)

  const prevBtn = pagination.querySelector('.pagination-prev')
  const nextBtn = pagination.querySelector('.pagination-next')

  const pageSize = 20

  // URL-Parameter auslesen
  function getStateFromURL() {
    const params = new URLSearchParams(window.location.search)
    return {
      page: parseInt(params.get('page')) || 1,
      search: params.get('search') || ''
    }
  }

  // URL aktualisieren
  function updateURL(page, search, replace = false) {
    const params = new URLSearchParams()
    if (page > 1) params.set('page', page)
    if (search) params.set('search', search)
    
    const url = params.toString() 
      ? `${window.location.pathname}?${params.toString()}`
      : window.location.pathname
    
    if (replace) {
      window.history.replaceState({ page, search }, '', url)
    } else {
      window.history.pushState({ page, search }, '', url)
    }
  }

  // Filter-Funktion
  function getFilteredPosts(searchQuery) {
    if (!searchQuery) return postData
    const query = searchQuery.toLowerCase()
    return postData.filter(p => p.searchText.includes(query))
  }

  // Render-Funktion
  function render(page, search, updateHistory = false) {
    const filtered = getFilteredPosts(search)
    const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))

    // Seite korrigieren falls nötig
    if (page > totalPages) {
      page = totalPages
    }

    const start = (page - 1) * pageSize
    const end = start + pageSize
    const pagePosts = filtered.slice(start, end)

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
      pagination.style.display = 'none'
      if (updateHistory) {
        updateURL(page, search)
      }
      return
    } else {
      noResultsBox.style.display = 'none'
      list.style.display = ''
    }

    // Fragment für bessere Performance
    const fragment = document.createDocumentFragment()
    let lastMonthKey = null

    pagePosts.forEach(p => {
      // Monatsüberschrift einfügen
      if (p.monthKey !== lastMonthKey) {
        const headingLi = document.createElement('li')
        headingLi.className = 'blog-month-heading'
        headingLi.textContent = p.monthLabel
        headingLi.setAttribute('aria-hidden', 'true')
        fragment.appendChild(headingLi)
        lastMonthKey = p.monthKey
      }
      fragment.appendChild(p.li)
    })

    list.appendChild(fragment)

    // Buttons anzeigen/verstecken
    if (page <= 1) {
      prevBtn.style.visibility = 'hidden'
    } else {
      prevBtn.style.visibility = 'visible'
    }
    
    if (page >= totalPages) {
      nextBtn.style.visibility = 'hidden'
    } else {
      nextBtn.style.visibility = 'visible'
    }
    
    pagination.style.display = filtered.length > pageSize ? 'flex' : 'none'

    // URL aktualisieren
    if (updateHistory) {
      updateURL(page, search)
    }

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Event-Listener mit Debouncing für Search
  let searchTimeout
  searchInput.addEventListener('input', () => {
    clearTimeout(searchTimeout)
    searchTimeout = setTimeout(() => {
      const search = searchInput.value.trim()
      render(1, search, true)
    }, 300)
  })

  prevBtn.addEventListener('click', event => {
    event.preventDefault()
    const state = getStateFromURL()
    if (state.page > 1) {
      render(state.page - 1, state.search, true)
    }
  })

  nextBtn.addEventListener('click', event => {
    event.preventDefault()
    const state = getStateFromURL()
    const filtered = getFilteredPosts(state.search)
    const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
    if (state.page < totalPages) {
      render(state.page + 1, state.search, true)
    }
  })

  // Browser Back/Forward Buttons
  window.addEventListener('popstate', (event) => {
    const state = event.state || getStateFromURL()
    render(state.page || 1, state.search || '', false)
  })

  // Keyboard Navigation
  document.addEventListener('keydown', (e) => {
    if (e.target.matches('input, textarea, select')) return
    
    const state = getStateFromURL()
    
    if (e.key === 'ArrowLeft' && state.page > 1) {
      e.preventDefault()
      render(state.page - 1, state.search, true)
    } else if (e.key === 'ArrowRight') {
      const filtered = getFilteredPosts(state.search)
      const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
      if (state.page < totalPages) {
        e.preventDefault()
        render(state.page + 1, state.search, true)
      }
    }
  })

  // Initial render mit URL-State
  const initialState = getStateFromURL()
  render(initialState.page, initialState.search, false)
  // Initialen State in History setzen
  updateURL(initialState.page, initialState.search, true)
})