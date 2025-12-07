document.addEventListener('DOMContentLoaded', () => {
  const list = document.querySelector('.blog-posts')
  if (!list) return

  const posts = Array.from(list.querySelectorAll('li'))
  if (!posts.length) return

  const months = [
    'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
    'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'
  ]

  // Base post data
  const postData = posts.map(li => {
    const timeEl = li.querySelector('time')
    const linkEl = li.querySelector('a')

    const dateStr = timeEl?.getAttribute('datetime') || timeEl?.textContent || ''
    const date = dateStr ? new Date(dateStr) : new Date()
    const year = date.getFullYear()
    const monthIndex = date.getMonth()
    const monthKey = `${year}-${String(monthIndex + 1).padStart(2, '0')}`
    const monthLabel = `${months[monthIndex]} ${year}`

    const title = linkEl ? linkEl.textContent.trim() : ''
    const searchText = `${title} ${timeEl ? timeEl.textContent : ''}`.toLowerCase()

    return {
      li,
      year,
      monthKey,
      monthLabel,
      searchText
    }
  })

  // Year counts
  const totalPosts = postData.length
  const postsPerYear = postData.reduce((acc, p) => {
    acc[p.year] = (acc[p.year] || 0) + 1
    return acc
  }, {})

  // Controls (year + search)
  const controls = document.createElement('div')
  controls.className = 'blog-controls'
  controls.innerHTML = `
    <div class="blog-controls-row">
      <label class="small" for="blog-year-filter">Year</label>
      <select id="blog-year-filter">
        <option value="">All years</option>
      </select>
    </div>
    <div class="blog-controls-row">
      <label class="small" for="blog-search">Search</label>
      <input id="blog-search" type="search" placeholder="Search posts…">
    </div>
  `
  list.parentNode.insertBefore(controls, list)

  const yearSelect = controls.querySelector('#blog-year-filter')
  const searchInput = controls.querySelector('#blog-search')

  // Year dropdown
  const allYearsOption = yearSelect.querySelector('option[value=""]')
  if (allYearsOption) {
    allYearsOption.textContent = `All years (${totalPosts})`
  }

  const years = Array.from(new Set(postData.map(p => p.year))).sort((a, b) => b - a)
  years.forEach(y => {
    const opt = document.createElement('option')
    opt.value = String(y)
    opt.textContent = `${y} (${postsPerYear[y] || 0})`
    yearSelect.appendChild(opt)
  })

  // Pagination UI
  const pagination = document.createElement('nav')
  pagination.className = 'pagination'
  pagination.innerHTML = `
    <a href="#" id="prevPage">Previous</a>
    <span id="pageInfo"></span>
    <a href="#" id="nextPage">Next</a>
  `
  list.insertAdjacentElement('afterend', pagination)

  const prevBtn = pagination.querySelector('#prevPage')
  const nextBtn = pagination.querySelector('#nextPage')
  const pageInfo = pagination.querySelector('#pageInfo')

  let currentPage = 1
  const pageSize = 20

  // Filtering + render
  function getFilteredPosts() {
    const yearFilter = yearSelect.value
    const query = searchInput.value.trim().toLowerCase()

    return postData.filter(p => {
      if (yearFilter && String(p.year) !== yearFilter) return false
      if (query && !p.searchText.includes(query)) return false
      return true
    })
  }

  function render() {
    const filtered = getFilteredPosts()
    const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))

    if (currentPage > totalPages) {
      currentPage = totalPages
    }

    const start = (currentPage - 1) * pageSize
    const end = start + pageSize
    const pagePosts = filtered.slice(start, end)

    list.innerHTML = ''

    let lastMonthKey = null

    pagePosts.forEach(p => {
      if (p.monthKey !== lastMonthKey) {
        const headingLi = document.createElement('li')
        headingLi.className = 'blog-month-heading'
        headingLi.textContent = p.monthLabel
        list.appendChild(headingLi)
        lastMonthKey = p.monthKey
      }
      list.appendChild(p.li)
    })

    pageInfo.textContent = filtered.length ? `Page ${currentPage} of ${totalPages}` : ''
    prevBtn.toggleAttribute('disabled', currentPage <= 1)
    nextBtn.toggleAttribute('disabled', currentPage >= totalPages)
    pagination.style.display = filtered.length > pageSize ? 'flex' : 'none'
  }

  // Events
  yearSelect.addEventListener('change', () => {
    currentPage = 1
    render()
  })

  searchInput.addEventListener('input', () => {
    currentPage = 1
    render()
  })

  prevBtn.addEventListener('click', event => {
    event.preventDefault()
    if (currentPage > 1) {
      currentPage -= 1
      render()
    }
  })

  nextBtn.addEventListener('click', event => {
    event.preventDefault()
    const filtered = getFilteredPosts()
    const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
    if (currentPage < totalPages) {
      currentPage += 1
      render()
    }
  })

  // Initial render
  render()
})