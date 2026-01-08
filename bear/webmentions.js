(function() {
  'use strict';

  // Only run on post pages
  if (!document.body.classList.contains('post')) {
    return;
  }

  const scriptTag = document.currentScript;
  const githubRepo = scriptTag?.dataset.repo || 'flschr/bearblog-automation';
  const showExcerpt = scriptTag?.dataset.showExcerpt !== 'false'; // Default true
  const maxMentions = parseInt(scriptTag?.dataset.maxMentions || '0', 10); // 0 = show all
  const showNoMentions = scriptTag?.dataset.showNoMentions !== undefined;
  const lang = scriptTag?.dataset.lang || 'en';
  const debug = scriptTag?.dataset.debug !== undefined;

  // UI text configuration
  const ui = {
    en: {
      title: 'Blog Mentions',
      loading: 'Loading mentions…',
      noMentions: 'No mentions yet',
      readMore: 'Read full post',
      by: 'by',
      showMore: 'Show more mentions',
      showLess: 'Show less'
    },
    de: {
      title: 'Blog-Erwähnungen',
      loading: 'Lade Erwähnungen…',
      noMentions: 'Noch keine Erwähnungen',
      readMore: 'Vollständigen Beitrag lesen',
      by: 'von',
      showMore: 'Mehr Erwähnungen anzeigen',
      showLess: 'Weniger anzeigen'
    }
  };

  const t = ui[lang] || ui.en;

  // Cache for GitHub response (session storage)
  const CACHE_KEY = 'webmentions_data_' + githubRepo.replace(/\//g, '_');
  const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  function getCache() {
    try {
      const cached = sessionStorage.getItem(CACHE_KEY);
      if (!cached) return null;
      const { data, expires } = JSON.parse(cached);
      if (Date.now() > expires) {
        sessionStorage.removeItem(CACHE_KEY);
        return null;
      }
      return data;
    } catch {
      return null;
    }
  }

  function setCache(data) {
    try {
      sessionStorage.setItem(CACHE_KEY, JSON.stringify({
        data,
        expires: Date.now() + CACHE_TTL
      }));
    } catch {
      // Storage unavailable
    }
  }

  // Format date
  function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString(lang === 'de' ? 'de-DE' : 'en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  }

  // Truncate text to reasonable length
  function truncateText(text, maxLength = 200) {
    if (!text || text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
  }

  // Get current page URL (clean, without query params or hash)
  function getCurrentUrl() {
    return window.location.href.split('#')[0].split('?')[0];
  }

  // Try multiple URL variants (with/without trailing slash)
  function getUrlVariants(url) {
    const variants = [url];

    // Add variant without trailing slash
    if (url.endsWith('/')) {
      variants.push(url.slice(0, -1));
    } else {
      // Add variant with trailing slash
      variants.push(url + '/');
    }

    return variants;
  }

  // Fetch webmentions from GitHub repository
  async function fetchWebmentions() {
    // Check cache first
    const cached = getCache();
    if (cached) {
      if (debug) console.log('[Webmentions] Using cached data');
      return cached;
    }

    const dataUrl = `https://raw.githubusercontent.com/${githubRepo}/main/webmentions.json`;

    if (debug) console.log('[Webmentions] Fetching:', dataUrl);

    try {
      const response = await fetch(dataUrl);

      if (!response.ok) {
        if (debug) console.log('[Webmentions] Response not OK:', response.status);
        return null;
      }

      const data = await response.json();
      if (debug) console.log('[Webmentions] Data fetched:', data);

      // Cache the full data
      setCache(data);
      return data;

    } catch (error) {
      if (debug) console.error('[Webmentions] Fetch error:', error);
      return null;
    }
  }

  // Get mentions for current URL
  function getMentionsForCurrentUrl(data) {
    if (!data) return null;

    const currentUrl = getCurrentUrl();
    const urlVariants = getUrlVariants(currentUrl);

    if (debug) console.log('[Webmentions] Looking for URL variants:', urlVariants);

    // Try each URL variant
    for (const url of urlVariants) {
      if (data[url] && data[url].mentions && data[url].mentions.length > 0) {
        if (debug) console.log('[Webmentions] Found mentions for:', url);
        return data[url].mentions;
      }
    }

    if (debug) console.log('[Webmentions] No mentions found for current URL');
    return null;
  }

  // Create mention card element
  function createMentionCard(mention) {
    const card = document.createElement('div');
    card.className = 'webmention-card';

    const author = mention.author || {};
    const authorName = author.name || 'Anonymous';
    const authorUrl = author.url || mention.source;
    const title = mention.title || 'Untitled';
    const publishedDate = formatDate(mention.published);

    let cardContent = `
      <div class="webmention-header">
        <div class="webmention-title">
          <a href="${mention.source}" target="_blank" rel="noopener" class="webmention-title-link">
            📝 ${title}
          </a>
        </div>
        <div class="webmention-meta">
          <span class="webmention-author">
            ${t.by}
            ${authorUrl ? `<a href="${authorUrl}" target="_blank" rel="noopener">${authorName}</a>` : authorName}
          </span>
          ${publishedDate ? `<span class="webmention-separator">·</span><span class="webmention-date">${publishedDate}</span>` : ''}
        </div>
      </div>
    `;

    // Add content excerpt if enabled and available
    if (showExcerpt && mention.content) {
      const excerpt = truncateText(mention.content);
      cardContent += `
        <div class="webmention-content">
          "${excerpt}"
        </div>
      `;
    }

    // Add read more link
    cardContent += `
      <div class="webmention-footer">
        <a href="${mention.source}" target="_blank" rel="noopener" class="webmention-read-more">
          → ${t.readMore}
        </a>
      </div>
    `;

    card.innerHTML = cardContent;
    return card;
  }

  // Create the webmentions section
  function createWebmentionsSection(mentions) {
    const container = document.createElement('div');
    container.className = 'webmentions-container';

    // Add section title
    const title = document.createElement('h2');
    title.className = 'webmentions-title';
    title.textContent = t.title;
    container.appendChild(title);

    // Add separator
    const separator = document.createElement('hr');
    separator.className = 'webmentions-separator';
    container.appendChild(separator);

    // Sort mentions by published date (newest first)
    const sortedMentions = [...mentions].sort((a, b) => {
      const dateA = new Date(a.published || 0);
      const dateB = new Date(b.published || 0);
      return dateB - dateA;
    });

    // Determine how many to show initially
    const mentionsToShow = maxMentions > 0 && maxMentions < sortedMentions.length
      ? sortedMentions.slice(0, maxMentions)
      : sortedMentions;
    const remainingMentions = maxMentions > 0
      ? sortedMentions.slice(maxMentions)
      : [];

    // Create cards container
    const cardsContainer = document.createElement('div');
    cardsContainer.className = 'webmentions-cards';

    // Add visible cards
    mentionsToShow.forEach(mention => {
      cardsContainer.appendChild(createMentionCard(mention));
    });

    container.appendChild(cardsContainer);

    // Add "Show more" functionality if there are remaining mentions
    if (remainingMentions.length > 0) {
      const hiddenCardsContainer = document.createElement('div');
      hiddenCardsContainer.className = 'webmentions-cards webmentions-hidden';
      hiddenCardsContainer.style.display = 'none';

      remainingMentions.forEach(mention => {
        hiddenCardsContainer.appendChild(createMentionCard(mention));
      });

      container.appendChild(hiddenCardsContainer);

      const showMoreBtn = document.createElement('button');
      showMoreBtn.className = 'webmentions-show-more';
      showMoreBtn.textContent = `${t.showMore} (${remainingMentions.length})`;
      showMoreBtn.onclick = () => {
        const isHidden = hiddenCardsContainer.style.display === 'none';
        hiddenCardsContainer.style.display = isHidden ? 'block' : 'none';
        showMoreBtn.textContent = isHidden
          ? t.showLess
          : `${t.showMore} (${remainingMentions.length})`;
      };

      container.appendChild(showMoreBtn);
    }

    return container;
  }

  // Inject styles
  function injectStyles() {
    const isDark = document.documentElement.dataset.theme === 'dark'
      || document.body.classList.contains('dark-mode')
      || window.matchMedia('(prefers-color-scheme: dark)').matches;

    const style = document.createElement('style');
    style.textContent = `
      .webmentions-container {
        margin: 3rem 0 2rem 0;
      }

      .webmentions-title {
        font-size: 1.5rem;
        font-weight: 600;
        margin-bottom: 0.5rem;
      }

      .webmentions-separator {
        border: none;
        border-top: 2px solid ${isDark ? '#444' : '#ddd'};
        margin: 1rem 0 1.5rem 0;
      }

      .webmentions-cards {
        display: flex;
        flex-direction: column;
        gap: 1.25rem;
      }

      .webmention-card {
        padding: 1.25rem;
        border: 1px solid ${isDark ? '#444' : '#e0e0e0'};
        border-radius: 8px;
        background: ${isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.01)'};
        transition: all 0.2s ease;
      }

      .webmention-card:hover {
        border-color: ${isDark ? '#666' : '#ccc'};
        background: ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)'};
        transform: translateY(-2px);
        box-shadow: 0 4px 12px ${isDark ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.08)'};
      }

      .webmention-header {
        margin-bottom: 0.75rem;
      }

      .webmention-title {
        margin-bottom: 0.5rem;
      }

      .webmention-title-link {
        font-size: 1.1rem;
        font-weight: 600;
        text-decoration: none;
        color: ${isDark ? '#e0e0e0' : '#333'};
        transition: color 0.2s ease;
      }

      .webmention-title-link:hover {
        color: ${isDark ? '#fff' : '#000'};
        text-decoration: underline;
      }

      .webmention-meta {
        font-size: 0.9rem;
        color: ${isDark ? '#999' : '#666'};
        display: flex;
        align-items: center;
        gap: 0.5rem;
        flex-wrap: wrap;
      }

      .webmention-meta a {
        color: ${isDark ? '#aaa' : '#555'};
        text-decoration: none;
      }

      .webmention-meta a:hover {
        color: ${isDark ? '#fff' : '#000'};
        text-decoration: underline;
      }

      .webmention-separator {
        color: ${isDark ? '#666' : '#ccc'};
      }

      .webmention-content {
        font-style: italic;
        color: ${isDark ? '#bbb' : '#555'};
        margin: 0.75rem 0;
        line-height: 1.6;
        padding-left: 1rem;
        border-left: 3px solid ${isDark ? '#444' : '#ddd'};
      }

      .webmention-footer {
        margin-top: 0.75rem;
      }

      .webmention-read-more {
        font-size: 0.9rem;
        color: ${isDark ? '#888' : '#666'};
        text-decoration: none;
        transition: color 0.2s ease;
      }

      .webmention-read-more:hover {
        color: ${isDark ? '#fff' : '#000'};
        text-decoration: underline;
      }

      .webmentions-show-more {
        display: block;
        margin: 1.5rem auto 0;
        padding: 0.75rem 1.5rem;
        background: ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'};
        border: 1px solid ${isDark ? '#444' : '#ddd'};
        border-radius: 8px;
        color: ${isDark ? '#e0e0e0' : '#333'};
        font-size: 0.95rem;
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .webmentions-show-more:hover {
        background: ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'};
        border-color: ${isDark ? '#666' : '#bbb'};
      }

      .webmentions-loading,
      .webmentions-empty {
        margin: 1rem 0;
        opacity: 0.6;
        font-size: 0.95rem;
      }

      /* Dark mode overrides */
      html[data-theme="dark"] .webmention-card,
      .dark-mode .webmention-card {
        background: rgba(255,255,255,0.03);
        border-color: #444;
      }

      html[data-theme="dark"] .webmention-card:hover,
      .dark-mode .webmention-card:hover {
        background: rgba(255,255,255,0.05);
        border-color: #666;
      }

      /* Responsive design */
      @media (max-width: 600px) {
        .webmentions-container {
          margin: 2rem 0 1.5rem 0;
        }

        .webmention-card {
          padding: 1rem;
        }

        .webmention-title-link {
          font-size: 1rem;
        }

        .webmention-meta {
          font-size: 0.85rem;
        }
      }
    `;

    document.head.appendChild(style);
  }

  // Initialize plugin
  async function init() {
    // Inject styles first
    injectStyles();

    // Create loading indicator
    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'webmentions-loading';
    loadingDiv.textContent = t.loading;

    // Insert after upvote form or at end of post
    const upvoteForm = document.getElementById('upvote-form');
    const insertTarget = upvoteForm || document.querySelector('.blog-content');

    if (!insertTarget) {
      if (debug) console.log('[Webmentions] No insertion target found');
      return;
    }

    if (upvoteForm) {
      upvoteForm.parentNode.insertBefore(loadingDiv, upvoteForm.nextSibling);
    } else {
      insertTarget.appendChild(loadingDiv);
    }

    // Fetch webmentions data
    const data = await fetchWebmentions();

    // Remove loading indicator
    loadingDiv.remove();

    if (!data) {
      if (debug) console.log('[Webmentions] No data available');
      return; // Silent fail if data unavailable
    }

    // Get mentions for current URL
    const mentions = getMentionsForCurrentUrl(data);

    if (!mentions || mentions.length === 0) {
      if (debug) console.log('[Webmentions] No mentions for this article');

      // Optionally show "no mentions" message
      if (showNoMentions) {
        const noMentions = document.createElement('div');
        noMentions.className = 'webmentions-empty';
        noMentions.textContent = t.noMentions;

        if (upvoteForm) {
          upvoteForm.parentNode.insertBefore(noMentions, upvoteForm.nextSibling);
        } else {
          insertTarget.appendChild(noMentions);
        }
      }
      return;
    }

    // Create and insert webmentions section
    const section = createWebmentionsSection(mentions);

    if (upvoteForm) {
      upvoteForm.parentNode.insertBefore(section, upvoteForm.nextSibling);
    } else {
      insertTarget.appendChild(section);
    }

    if (debug) console.log('[Webmentions] Rendered', mentions.length, 'mentions');
  }

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
