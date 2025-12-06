// Bear Blog Search Functionality
// Add this script to your footer
(function() {
    // Only run on the search page
    if (!window.location.pathname.includes('/search')) {
        return;
    }

    let posts = [];

    // Create search interface
    function initSearchUI() {
        const main = document.querySelector('main') || document.querySelector('article') || document.body;
        
        main.innerHTML = `
            <div class="search-container">
                <h1>Suche</h1>
                
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
        `;

        loadFeed();
    }

    // Parse Atom feed
    async function loadFeed() {
        const loading = document.getElementById('loading');
        const searchInput = document.getElementById('searchInput');
        const searchStats = document.getElementById('searchStats');

        try {
            const response = await fetch('/feed/?type=rss');
            const text = await response.text();
            const parser = new DOMParser();
            const xml = parser.parseFromString(text, 'text/xml');
            
            // Check if it's Atom or RSS
            const entries = xml.querySelectorAll('entry');
            const items = xml.querySelectorAll('item');
            const isAtom = entries.length > 0;
            
            const feedItems = isAtom ? entries : items;
            
            posts = Array.from(feedItems).map(item => {
                if (isAtom) {
                    // Atom feed parsing
                    const content = item.querySelector('content')?.textContent || '';
                    const summary = item.querySelector('summary')?.textContent || '';
                    
                    // Clean HTML tags from content
                    const tempDiv = document.createElement('div');
                    tempDiv.innerHTML = content || summary;
                    const cleanContent = tempDiv.textContent || tempDiv.innerText || '';
                    
                    // Get link (Atom uses <link href="...">)
                    const linkElement = item.querySelector('link[rel="alternate"]') || item.querySelector('link');
                    const link = linkElement?.getAttribute('href') || '';
                    
                    return {
                        title: item.querySelector('title')?.textContent || '',
                        link: link,
                        pubDate: item.querySelector('published')?.textContent || item.querySelector('updated')?.textContent || '',
                        content: cleanContent,
                        description: summary
                    };
                } else {
                    // RSS feed parsing
                    const description = item.querySelector('description')?.textContent || '';
                    const contentEncoded = item.querySelector('content\\:encoded, encoded')?.textContent || description;
                    
                    const tempDiv = document.createElement('div');
                    tempDiv.innerHTML = contentEncoded;
                    const cleanContent = tempDiv.textContent || tempDiv.innerText || '';
                    
                    return {
                        title: item.querySelector('title')?.textContent || '',
                        link: item.querySelector('link')?.textContent || '',
                        pubDate: item.querySelector('pubDate')?.textContent || '',
                        content: cleanContent,
                        description: description
                    };
                }
            });
            
            loading.style.display = 'none';
            searchStats.textContent = `${posts.length} Posts durchsuchbar`;
            
            // Enable search input
            searchInput.disabled = false;
            searchInput.focus();

            // Check for query parameter
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

    // Search function
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
            // Calculate relevance score
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

    // Display results
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

    // Create excerpt around search terms
    function createExcerpt(content, query, maxLength) {
        const searchTerms = query.toLowerCase().trim().split(/\s+/);
        const contentLower = content.toLowerCase();
        
        let firstIndex = -1;
        searchTerms.forEach(term => {
            const index = contentLower.indexOf(term);
            if (index !== -1 && (firstIndex === -1 || index < firstIndex)) {
                firstIndex = index;
            }
        });

        if (firstIndex === -1) {
            return highlightText(content.substring(0, maxLength) + '...', query);
        }

        const start = Math.max(0, firstIndex - 100);
        const end = Math.min(content.length, firstIndex + maxLength);
        
        let excerpt = content.substring(start, end);
        
        if (start > 0) excerpt = '...' + excerpt;
        if (end < content.length) excerpt = excerpt + '...';

        return highlightText(excerpt, query);
    }

    // Highlight search terms in text
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

    // Escape special regex characters
    function escapeRegex(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    // Debounce function
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Initialize when DOM is ready
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