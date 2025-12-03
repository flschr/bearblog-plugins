(function() {
    if (!window.location.pathname.includes('/search')) return;

    // Beispiel-Daten (Posts)
    let posts = [
        { title: "Post 1", content: "Inhalt von Post 1", tags: ["News", "Tech"], date: "2025-12-03" },
        { title: "Post 2", content: "Inhalt von Post 2", tags: ["Blog"], date: "2025-12-02" },
        { title: "Post 3", content: "Noch ein Post", tags: ["Tech"], date: "2025-12-01" },
    ];

    // --- Hilfsfunktionen ---
    function debounce(fn, delay) {
        let timer;
        return function(...args) {
            clearTimeout(timer);
            timer = setTimeout(() => fn.apply(this, args), delay);
        }
    }

    function highlightText(text, query) {
        if (!query) return text;
        const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
        return text.replace(regex, '<span class="search-highlight">$1</span>');
    }

    function createExcerpt(content, query, length = 100) {
        if (!query) return content.slice(0, length) + (content.length > length ? '…' : '');
        const idx = content.toLowerCase().indexOf(query.toLowerCase());
        if (idx === -1) return content.slice(0, length) + (content.length > length ? '…' : '');
        const start = Math.max(0, idx - length / 2);
        const end = Math.min(content.length, idx + length / 2);
        return (start > 0 ? '…' : '') + content.slice(start, end) + (end < content.length ? '…' : '');
    }

    function displayResults(results, query) {
        const container = document.getElementById('searchResults');
        const stats = document.getElementById('searchStats');
        container.innerHTML = '';
        stats.textContent = `Gefundene Beiträge: ${results.length}`;
        results.forEach(post => {
            const li = document.createElement('li');
            li.className = 'search-result';
            li.innerHTML = `
                <h2>${highlightText(post.title, query)}</h2>
                <div class="search-result-date">${post.date}</div>
                <div class="search-result-excerpt">${highlightText(createExcerpt(post.content, query), query)}</div>
            `;
            container.appendChild(li);
        });
    }

    function search(query) {
        const results = posts.filter(p =>
            p.title.toLowerCase().includes(query.toLowerCase()) ||
            p.content.toLowerCase().includes(query.toLowerCase()) ||
            (p.tags && p.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase())))
        );
        displayResults(results, query);
    }

    function loadFeed() {
        const loading = document.getElementById('loading');
        if (loading) loading.style.display = 'none';

        const searchInput = document.getElementById('searchInput');
        if (searchInput) searchInput.disabled = false;

        // Zeige initial alle Beiträge
        displayResults(posts, '');
    }

    function initSearchUI() {
        const main = document.querySelector('main') || document.querySelector('article') || document.body;
        main.innerHTML = `
            <div class="search-container">
                <input 
                    type="search" 
                    class="search-box" 
                    id="searchInput" 
                    placeholder="Suche nach Titeln, Inhalten oder Tags..."
                    autocomplete="off"
                    disabled
                >
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
                .search-box {
                    width: 100%;
                    max-width: 100%;
                    padding: 12px 20px;
                    font-size: 1rem;
                    border-radius: 12px;
                    border: 1px solid #ccc;
                    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                    transition: border-color 0.3s, box-shadow 0.3s;
                }
                .search-box:focus {
                    outline: none;
                    border-color: #0078d4;
                    box-shadow: 0 4px 12px rgba(0, 120, 212, 0.3);
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

    // --- DOM ready ---
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            initSearchUI();
            const searchInput = document.getElementById('searchInput');
            if (searchInput) {
                searchInput.addEventListener('input', debounce(function(e) {
                    search(e.target.value);
                }, 300));
            }
        });
    } else {
        initSearchUI();
        setTimeout(() => {
            const searchInput = document.getElementById('searchInput');
            if (searchInput) {
                searchInput.addEventListener('input', debounce(function(e) {
                    search(e.target.value);
                }, 300));
            }
        }, 100);
    }

})();
