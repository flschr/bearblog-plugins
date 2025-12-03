(function() {
    if (!window.location.pathname.includes('/search')) return;

    let posts = [];

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

    // --- der Rest des Scripts bleibt unverändert ---
    // loadFeed(), search(), displayResults(), createExcerpt(), highlightText(), escapeRegex(), debounce()

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
