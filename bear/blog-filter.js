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

  let currentPage = 1
  const pageSize = 20

  // Filter-Funktion
  function getFilteredPosts() {
    const query = searchInput.value.trim().toLowerCase()
    if (!query) return postData
    return postData.filter(p => p.searchText.includes(query))
  }

  // Render-Funktion
  function render() {
    const filtered = getFilteredPosts()
    const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))

    // Seite korrigieren falls nötig
    if (currentPage > totalPages) {
      currentPage = totalPages
    }

    const start = (currentPage - 1) * pageSize
    const end = start + pageSize
    const pagePosts = filtered.slice(start, end)

    // Liste leeren
    list.innerHTML = ''

    // Keine Ergebnisse gefunden
    if (filtered.length === 0 && searchInput.value.trim()) {
      const noResults = document.createElement('div')
      noResults.className = 'infobox-frame'
      noResults.innerHTML = `
        <div class="infobox-icon"></div>
        <div class="infobox-text">
          <p>Zu der Suche wurden leider keine Ergebnisse gefunden.</p>
        </div>
      `
      list.appendChild(noResults)
      pagination.style.display = 'none'
      return
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
    if (currentPage <= 1) {
      prevBtn.style.visibility = 'hidden'
    } else {
      prevBtn.style.visibility = 'visible'
    }
    
    if (currentPage >= totalPages) {
      nextBtn.style.visibility = 'hidden'
    } else {
      nextBtn.style.visibility = 'visible'
    }
    
    pagination.style.display = filtered.length > pageSize ? 'flex' : 'none'
  }

  // Event-Listener mit Debouncing für Search
  let searchTimeout
  searchInput.addEventListener('input', () => {
    clearTimeout(searchTimeout)
    searchTimeout = setTimeout(() => {
      currentPage = 1
      render()
    }, 300)
  })

  prevBtn.addEventListener('click', event => {
    event.preventDefault()
    if (currentPage > 1) {
      currentPage--
      render()
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  })

  nextBtn.addEventListener('click', event => {
    event.preventDefault()
    const filtered = getFilteredPosts()
    const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
    if (currentPage < totalPages) {
      currentPage++
      render()
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  })

  // Keyboard Navigation
  document.addEventListener('keydown', (e) => {
    if (e.target.matches('input, textarea, select')) return
    
    if (e.key === 'ArrowLeft' && currentPage > 1) {
      e.preventDefault()
      currentPage--
      render()
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else if (e.key === 'ArrowRight') {
      const filtered = getFilteredPosts()
      const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
      if (currentPage < totalPages) {
        e.preventDefault()
        currentPage++
        render()
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }
    }
  })

  // Initial render
  render()
})