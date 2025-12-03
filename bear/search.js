(function() {
    if (!window.location.pathname.includes('/search')) return;

    let posts = [];

    function initSearchUI() {
        const main = document.querySelector('main') || document.querySelector('article') || document.body;
        main.innerHTML = `
            <div class="search-container">
                <div class="search-box-wrapper">
                    <span class="search-icon">&#128269;</span>
                    <input 
                        type="search" 
                        class="search-box" 
                        id="searchInput" 
                        placeholder="Suche nach Titeln, Inhalten oder Tags..."
                        autocomplete="off"
                        disabled
                    >
                </div>
                <div class="search-stats" id="searchStats"></div>
                <div class="search-loading" id="loading">Feed wird geladen...</div>
                <ul class="search-results" id="searchResults"></ul>
            </div>
            <style>
                .search-container {
                    max-width: 900px;
                    margin: 2rem auto;
                    padding: 1rem;
                }
                .search-box-wrapper {
                    position: relative;
                }
                .search-box {
                    width: 100%;
                    padding: 12px 40px 12px 40px;
                    font-size: 1rem;
                    border-radius: 30px;
                    border: 1px solid #ccc;
                    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                    transition: border-color 0.3s, box-shadow 0.3s;
                }
                .search-box:focus {
                    outline: none;
                    border-color: #0078d4;
                    box-shadow: 0 4px 12px rgba(0, 120, 212, 0.3);
                }
                .search-icon {
                    position: absolute;
                    left: 12px;
                    top: 50%;
                    transform: translateY(-50%);
                    font-size: 1.2rem;
                    color: #888;
                    pointer-events: none;
                }
                .search-stats {
                    margin-top: 10px;
                    font-size: 0.9rem;
                    color: #555;
                }
                .search-results {
                    list-style: none;
                    padding: 0;
                    margin-top: 20px;
                }
                .search-result {
                    margin-bottom: 1.5rem;
                    padding-bottom: 1rem;
                    border-bottom: 1px solid #eee;
                }
                .search-result h2 {
                    margin: 0 0 5px;
                    font-size: 1.2rem;
                }
                .search-result a {
                    text-decoration: none;
                    color: #0078d4;
                }
                .search-result a:hover {
                    text-decoration: underline;
                }
                .search-result-date {
                    font-size: 0.85rem;
                    color: #888;
                    margin-bottom: 5px;
                }
                .search-result-excerpt {
                    font-size: 0.95rem;
                    color: #333;
                }
                .search-highlight {
                    background-color: #ffeb3b;
                    border-radius: 4px;
                    padding: 0 2px;
                }
            </style>
        `;

        loadFeed();
    }

    async function loadFeed() {
        const loading = document.getElementById('loading');
        const searchInput = document.getElementById('searchInput');
        const searchStats = document.getElementById('searchStats');

        try {
            const response = await fetch('/feed/');
            const text = await response.text();
            const parser = new DOMParser();
            const xml = parser.parseFromString(text, 'text/xml');

            const entries = xml.querySelectorAll('entry');
            const items = xml.querySelectorAll('item');
            const isAtom = entries.length > 0;
            const feedItems = isAtom ? entries : items;

            posts = Array.from(feedItems).map(item => {
                if (isAtom) {
                    const content = item.querySelector('content')?.textContent || item.querySelector('summary')?.textContent || '';
                    const tempDiv = document.createElement('div');
                    tempDiv.innerHTML = content;
                    const cleanContent = tempDiv.textContent || tempDiv.innerText || '';

                    const linkElement = item.querySelector('link[rel="alternate"]') || item.querySelector('link');
                    const link = linkElement?.getAttribute('href') || '';

                    return {
                        title: item.querySelector('title')?.textContent || '',
                        link: link,
                        pubDate: item.querySelector('published')?.textContent || item.querySelector('updated')?.textContent || '',
                        content: cleanContent
                    };
                } else {
                    const description = item.querySelector('description')?.textContent || '';
                    const contentEncoded = item.querySelector('content\\:encoded, encoded')?.textContent || description;
                    const tempDiv = document.createElement('div');
                    tempDiv.innerHTML = contentEncoded;
                    const cleanContent = tempDiv.textContent || tempDiv.innerText || '';

                    return {
                        title: item.querySelector('title')?.textContent || '',
                        link: item.querySelector('link')?.textContent || '',
                        pubDate: item.querySelector('pubDate')?.textContent || '',
                        content: cleanContent
                    };
                }
            });

            loading.style.display = 'none';
            searchStats.textContent = `${posts.length} Posts durchsuchbar`;
            searchInput.disabled = false;
            searchInput.focus();

            const urlParams = new URLSearchParams(window.location.search);
            const queryParam = urlParams.get('q');
            if (queryParam) {
                searchInput.value = queryParam;
                search(queryParam);
            }

        } catch (error) {
            console.error('Fehler beim Laden des Feeds:', error);
            loading.textContent = 'Fehler beim Laden des Feeds. Bitte versuche es später erneut.';
        }
    }

    function search(query) {
        const searchResults = document.getElementById('searchResults');
        const searchStats = document.getElementById('searchStats');

        if (!query || query.trim().length === 0) {
            searchResults.innerHTML = '';
            searchStats.textContent = `${posts.length} Posts durchsuchbar`;
            return;
        }

        const searchTerms = query.toLowerCase().trim().split(/\s+/);

        const results = posts.filter(post => {
            const searchableText = `${post.title} ${post.content}`.toLowerCase();
            return searchTerms.every(term => searchableText.includes(term));
        }).map(post => {
            let score = 0;
            const titleLower = post.title.toLowerCase();
            searchTerms.forEach(term => {
                if (titleLower.includes(term)) score += 10;
                if (post.content.toLowerCase().includes(term)) score += 1;
            });
            return { ...post, score };
        }).sort((a, b) => b.score - a.score);

        displayResults(results, query);
    }

    function displayResults(results, query) {
        const searchResults = document.getElementById('searchResults');
        const searchStats = document.getElementById('searchStats');

        if (results.length === 0) {
            searchResults.innerHTML = '<li class="search-no-results">Keine Ergebnisse gefunden.</li>';
            searchStats.textContent = '0 Ergebnisse';
            return;
        }

        searchStats.textContent = `${results.length} Ergebnis${results.length !== 1 ? 'se' : ''}`;

        searchResults.innerHTML = results.map(post => {
            const date = new Date(post.pubDate).toLocaleDateString('de-DE', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });

            const excerpt = createExcerpt(post.content, query, 200);
            const highlightedTitle = highlightText(post.title, query);

            return `
                <li class="search-result">
                    <h2><a href="${post.link}">${highlightedTitle}</a></h2>
                    <div class="search-result-date">${date}</div>
                    <div class="search-result-excerpt">${excerpt}</div>
                </li>
            `;
        }).join('');
    }

    function createExcerpt(content, query, maxLength) {
        const searchTerms = query.toLowerCase().trim().split(/\s+/);
        const contentLower = content.toLowerCase();
        let firstIndex = -1;
        searchTerms.forEach(term => {
            const index = contentLower.indexOf(term);
            if (index !== -1 && (firstIndex === -1 || index < firstIndex)) firstIndex = index;
        });

        if (firstIndex === -1) return highlightText(content.substring(0, maxLength) + '...', query);

        const start = Math.max(0, firstIndex - 100);
        const end = Math.min(content.length, firstIndex + maxLength);
        let excerpt = content.substring(start, end);
        if (start > 0) excerpt = '...' + excerpt;
        if (end < content.length) excerpt = excerpt + '...';
        return highlightText(excerpt, query);
    }

    function highlightText(text, query) {
        if (!query) return text;
        const searchTerms = query.trim().split(/\s+/);
        let result = text;
        searchTerms.forEach(term => {
            const regex = new RegExp(`(${escapeRegex(term)})`, 'gi');
            result = result.replace(regex, '<span class="search-highlight">$1</span>');
        });
        return result;
    }

    function escapeRegex(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    function debounce(func, wait) {
        let timeout;
        return function(...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            initSearchUI();
            const searchInput = document.getElementById('searchInput');
            if (searchInput) searchInput.addEventListener('input', debounce(e => search(e.target.value), 300));
        });
    } else {
        initSearchUI();
        setTimeout(() => {
            const searchInput = document.getElementById('searchInput');
            if (searchInput) searchInput.addEventListener('input', debounce(e => search(e.target.value), 300));
        }, 100);
    }

})();
