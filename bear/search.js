// Bear Blog Search Functionality
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

        setTimeout(() => {
            loadFeed();
        }, 0);
    }

    // Parse Atom feed
    async function loadFeed() {
        const loading = document.getElementById('loading');
        const searchInput = document.getElementById('searchInput');
        const searchStats = document.getElementById('searchStats');

        if (!loading || !searchInput || !searchStats) {
            console.error('DOM elements not found');
            return;
        }

        try {
            const response = await fetch('/feed/');
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const text = await response.text();

            const parser = new DOMParser();
            const xml = parser.parseFromString(text, 'application/xml');
            
            // Check for parse errors
            const parseError = xml.querySelector('parsererror');
            if (parseError) {
                console.error('Parse error:', parseError.textContent);
                throw new Error('XML parsing failed');
            }
            
            // Try to find entries with and without namespace
            let entries = xml.querySelectorAll('entry');
            
            // If no entries found, try with namespace prefix
            if (entries.length === 0) {
                entries = xml.getElementsByTagName('entry');
            }

            if (entries.length === 0) {
                console.error('No entries found. XML structure:', xml.documentElement.tagName);
                throw new Error('No entries found in feed');
            }
            
            posts = Array.from(entries).map((entry, index) => {
                // Helper function to get element text content
                function getElementText(parent, tagName) {
                    // Try direct querySelector first
                    let el = parent.querySelector(tagName);
                    if (el) return el.textContent;
                    
                    // Try getElementsByTagName
                    let els = parent.getElementsByTagName(tagName);
                    if (els.length > 0) return els[0].textContent;
                    
                    return '';
                }
                
                // Get title
                const title = getElementText(entry, 'title') || 'Untitled';

                // Get content - try multiple possible tags
                let rawContent = getElementText(entry, 'content') || 
                                getElementText(entry, 'summary') || 
                                getElementText(entry, 'description') || '';
                
                // Clean HTML from content
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = rawContent;
                const cleanContent = tempDiv.textContent || tempDiv.innerText || '';

                // Get link
                let link = '';
                const linkEls = entry.getElementsByTagName('link');
                if (linkEls.length > 0) {
                    // Try to find alternate link first
                    for (let i = 0; i < linkEls.length; i++) {
                        const rel = linkEls[i].getAttribute('rel');
                        const href = linkEls[i].getAttribute('href');
                        if (rel === 'alternate' && href) {
                            link = href;
                            break;
                        }
                    }
                    // If no alternate link, use first link with href
                    if (!link) {
                        for (let i = 0; i < linkEls.length; i++) {
                            const href = linkEls[i].getAttribute('href');
                            if (href) {
                                link = href;
                                break;
                            }
                        }
                    }
                }

                // Get dates
                const published = getElementText(entry, 'published') ||
                                 getElementText(entry, 'updated') ||
                                 getElementText(entry, 'pubDate') || '';

                return {
                    title: title,
                    link: link,
                    pubDate: published,
                    content: cleanContent
                };
            });
            
            loading.classList.add('hidden');
            searchStats.textContent = `${posts.length} Posts durchsuchbar`;
            searchInput.disabled = false;
            searchInput.focus();

            // Check for query parameter in URL
            const urlParams = new URLSearchParams(window.location.search);
            const queryParam = urlParams.get('q');
            if (queryParam) {
                searchInput.value = queryParam;
                search(queryParam);
            }
            
        } catch (error) {
            console.error('Error loading feed:', error);
            loading.textContent = 'Fehler beim Laden des Feeds: ' + error.message;
            loading.classList.add('error');
        }
    }

    // Search function
    function search(query) {
        const searchResults = document.getElementById('searchResults');
        const searchStats = document.getElementById('searchStats');

        if (!searchResults || !searchStats) return;

        // Update URL with search query
        const url = new URL(window.location);
        if (query && query.trim().length > 0) {
            url.searchParams.set('q', query);
        } else {
            url.searchParams.delete('q');
        }
        window.history.replaceState({}, '', url);

        if (!query || query.trim().length === 0) {
            searchResults.innerHTML = '';
            searchStats.textContent = `${posts.length} Posts durchsuchbar`;
            return;
        }

        const searchTerms = query.toLowerCase().trim().split(/\s+/);

        const results = posts.reduce((acc, post) => {
            const titleLower = post.title.toLowerCase();
            const contentLower = post.content.toLowerCase();
            const searchableText = `${titleLower} ${contentLower}`;

            // Check if all search terms are present
            if (searchTerms.every(term => searchableText.includes(term))) {
                let score = 0;
                searchTerms.forEach(term => {
                    if (titleLower.includes(term)) score += 10;
                    if (contentLower.includes(term)) score += 1;
                });
                acc.push({ ...post, score });
            }

            return acc;
        }, []).sort((a, b) => b.score - a.score);

        displayResults(results, query);
    }

    // Display results
    function displayResults(results, query) {
        const searchResults = document.getElementById('searchResults');
        const searchStats = document.getElementById('searchStats');

        if (!searchResults || !searchStats) return;

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
            const safeLink = escapeHTML(post.link);

            return `
                <li class="search-result">
                    <h2><a href="${safeLink}">${highlightedTitle}</a></h2>
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

    // Highlight search terms
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

    // Escape regex special characters
    function escapeRegex(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    // Escape HTML to prevent XSS
    function escapeHTML(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    // Debounce helper
    function debounce(func, wait) {
        let timeout;
        return function(...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
    }

    // Initialize
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    function init() {
        initSearchUI();
        
        setTimeout(() => {
            const searchInput = document.getElementById('searchInput');
            if (searchInput) {
                searchInput.addEventListener('input', debounce(e => {
                    search(e.target.value);
                }, 300));
            }
        }, 100);
    }
})();
