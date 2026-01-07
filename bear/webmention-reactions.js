(function() {
  'use strict';

  // Only run on post pages
  if (!document.body.classList.contains('post')) {
    return;
  }

  const scriptTag = document.currentScript;
  const showDetails = scriptTag?.dataset.details !== undefined;
  const groupByType = scriptTag?.dataset.groupByType !== undefined;
  const lang = scriptTag?.dataset.lang || 'en';
  const debug = scriptTag?.dataset.debug !== undefined;

  // UI text configuration
  const ui = {
    en: {
      reactions: 'Reactions',
      likes: 'Likes',
      reposts: 'Reposts',
      comments: 'Comments',
      mentions: 'Mentions',
      loading: 'Loading reactions…',
      noReactions: 'No reactions yet',
      setupRequired: 'No webmentions received. Make sure webmention.io and Brid.gy are configured.',
      liked: 'liked this',
      reposted: 'reposted this',
      commented: 'commented',
      mentioned: 'mentioned this'
    },
    de: {
      reactions: 'Reaktionen',
      likes: 'Likes',
      reposts: 'Reposts',
      comments: 'Kommentare',
      mentions: 'Erwähnungen',
      loading: 'Lade Reaktionen…',
      noReactions: 'Noch keine Reaktionen',
      setupRequired: 'Keine Webmentions empfangen. Stelle sicher, dass webmention.io und Brid.gy konfiguriert sind.',
      liked: 'gefällt das',
      reposted: 'geteilt',
      commented: 'kommentiert',
      mentioned: 'erwähnt dies'
    }
  };

  const t = ui[lang] || ui.en;

  // Simple icons (using Unicode/Emoji for minimal footprint)
  const icons = {
    like: '❤️',
    repost: '🔄',
    comment: '💬',
    mention: '🔗',
    mastodon: '🐘',
    bluesky: '🦋',
    web: '🌐'
  };

  // Cache for API response (session storage)
  const CACHE_KEY = 'webmentions_' + window.location.pathname;
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

  // Detect platform from URL
  function getPlatformIcon(url) {
    if (!url) return icons.web;
    if (url.includes('mastodon') || url.includes('mstdn')) return icons.mastodon;
    if (url.includes('bsky.app')) return icons.bluesky;
    return icons.web;
  }

  // Format date
  function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString(lang === 'de' ? 'de-DE' : 'en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }

  // Group webmentions by type
  function groupWebmentions(mentions) {
    const groups = {
      'like-of': [],
      'repost-of': [],
      'in-reply-to': [],
      'mention-of': []
    };

    mentions.forEach(mention => {
      const type = mention['wm-property'];
      if (groups[type]) {
        groups[type].push(mention);
      }
    });

    return groups;
  }

  // Create compact reaction summary (like Felix's style)
  function createReactionSummary(groups) {
    const container = document.createElement('div');
    container.className = 'webmention-reactions';
    container.style.cssText = 'display: flex; gap: 1rem; align-items: center; margin: 1rem 0; font-size: 0.95rem;';

    const items = [
      { type: 'like-of', icon: icons.like, label: t.likes },
      { type: 'repost-of', icon: icons.repost, label: t.reposts },
      { type: 'in-reply-to', icon: icons.comment, label: t.comments },
      { type: 'mention-of', icon: icons.mention, label: t.mentions }
    ];

    let hasReactions = false;

    items.forEach(({ type, icon, label }) => {
      const count = groups[type].length;
      if (count === 0) return;

      hasReactions = true;

      const item = document.createElement('span');
      item.className = `webmention-${type}`;
      item.style.cssText = 'display: inline-flex; align-items: center; gap: 0.25rem;';
      item.innerHTML = `
        <span style="font-size: 1.1em;">${icon}</span>
        <span style="font-weight: 600;">${count}</span>
        <span style="opacity: 0.7;">${label}</span>
      `;

      if (showDetails) {
        item.style.cursor = 'pointer';
        item.title = `Show ${label.toLowerCase()}`;
        item.onclick = () => toggleDetails(type);
      }

      container.appendChild(item);
    });

    if (!hasReactions) {
      container.innerHTML = `<span style="opacity: 0.5;">${t.noReactions}</span>`;
    }

    return container;
  }

  // Create detailed view of all webmentions
  function createDetailedView(groups) {
    const container = document.createElement('div');
    container.className = 'webmention-details';
    container.style.cssText = 'margin-top: 2rem; border-top: 1px solid rgba(0,0,0,0.1); padding-top: 1rem;';

    const items = [
      { type: 'in-reply-to', label: t.comments, verb: t.commented },
      { type: 'mention-of', label: t.mentions, verb: t.mentioned },
      { type: 'like-of', label: t.likes, verb: t.liked },
      { type: 'repost-of', label: t.reposts, verb: t.reposted }
    ];

    items.forEach(({ type, label, verb }) => {
      const mentions = groups[type];
      if (mentions.length === 0) return;

      const section = document.createElement('div');
      section.className = `webmention-section webmention-section-${type}`;
      section.style.cssText = 'margin-bottom: 1.5rem;';

      const heading = document.createElement('h3');
      heading.textContent = `${label} (${mentions.length})`;
      heading.style.cssText = 'font-size: 1.1rem; margin-bottom: 0.75rem;';
      section.appendChild(heading);

      mentions.forEach(mention => {
        const item = document.createElement('div');
        item.className = 'webmention-item';
        item.style.cssText = 'margin-bottom: 1rem; padding: 0.75rem; background: rgba(0,0,0,0.02); border-radius: 4px;';

        const author = mention.author || {};
        const platformIcon = getPlatformIcon(mention.url);

        const authorName = author.name || 'Anonymous';
        const authorUrl = author.url || mention.url;
        const date = formatDate(mention['wm-received']);

        let content = '';
        if (type === 'in-reply-to' && mention.content?.text) {
          content = `<blockquote style="margin: 0.5rem 0; padding-left: 1rem; border-left: 3px solid rgba(0,0,0,0.2); font-style: italic;">${mention.content.text}</blockquote>`;
        }

        item.innerHTML = `
          <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">
            <span style="font-size: 1.2em;">${platformIcon}</span>
            <strong><a href="${authorUrl}" target="_blank" rel="noopener">${authorName}</a></strong>
            <span style="opacity: 0.6;">${verb}</span>
            ${mention.url ? `<a href="${mention.url}" target="_blank" rel="noopener" style="opacity: 0.6; text-decoration: none;">↗</a>` : ''}
            <span style="margin-left: auto; opacity: 0.5; font-size: 0.9em;">${date}</span>
          </div>
          ${content}
        `;

        section.appendChild(item);
      });

      container.appendChild(section);
    });

    return container;
  }

  // Toggle detail view for specific type
  let detailsContainer = null;
  function toggleDetails(type) {
    if (!detailsContainer) return;

    const sections = detailsContainer.querySelectorAll('.webmention-section');
    sections.forEach(section => {
      if (section.classList.contains(`webmention-section-${type}`)) {
        section.style.display = section.style.display === 'none' ? 'block' : 'none';
      }
    });
  }

  // Fetch webmentions from webmention.io API
  async function fetchWebmentions() {
    // Check cache first
    const cached = getCache();
    if (cached) {
      if (debug) console.log('[Webmentions] Using cached data:', cached);
      return cached;
    }

    // Try multiple URL variants to handle different configurations
    const targetUrl = document.URL;
    const urls = [
      targetUrl,  // Original URL
      targetUrl.replace(/\/$/, ''),  // Without trailing slash
      targetUrl + (targetUrl.endsWith('/') ? '' : '/'),  // With trailing slash
    ];

    if (debug) {
      console.log('[Webmentions] Trying URLs:', urls);
    }

    for (const url of urls) {
      try {
        const apiUrl = `https://webmention.io/api/mentions.jf2?target=${encodeURIComponent(url)}`;
        if (debug) console.log('[Webmentions] Fetching:', apiUrl);

        const response = await fetch(apiUrl);

        if (!response.ok) {
          if (debug) console.log('[Webmentions] Response not OK:', response.status);
          continue;
        }

        const data = await response.json();
        if (debug) console.log('[Webmentions] API Response:', data);

        // If we got data with children, cache and return it
        if (data && data.children && data.children.length > 0) {
          setCache(data);
          return data;
        }

        // If this is the first URL and it returned empty, try the next variant
        if (debug) console.log('[Webmentions] No children in response, trying next URL variant');

      } catch (error) {
        if (debug) console.error('[Webmentions] Fetch error:', error);
        continue;
      }
    }

    // Return empty result if no URL variant worked
    if (debug) console.log('[Webmentions] No webmentions found for any URL variant');
    return { type: 'feed', name: 'Webmentions', children: [] };
  }

  // Initialize plugin
  async function init() {
    // Create loading indicator
    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'webmention-loading';
    loadingDiv.style.cssText = 'margin: 1rem 0; opacity: 0.6;';
    loadingDiv.textContent = t.loading;

    // Insert after upvote form or at end of post
    const upvoteForm = document.getElementById('upvote-form');
    const insertTarget = upvoteForm || document.querySelector('.blog-content');

    if (!insertTarget) return;

    if (upvoteForm) {
      upvoteForm.parentNode.insertBefore(loadingDiv, upvoteForm.nextSibling);
    } else {
      insertTarget.appendChild(loadingDiv);
    }

    // Fetch webmentions
    const data = await fetchWebmentions();

    // Remove loading indicator
    loadingDiv.remove();

    if (!data || !data.children || data.children.length === 0) {
      // Show "no reactions" message
      const noReactions = document.createElement('div');
      noReactions.className = 'webmention-reactions webmention-empty';
      noReactions.style.cssText = 'margin: 1rem 0; opacity: 0.5; font-size: 0.95rem;';

      // In debug mode, show setup hint
      if (debug) {
        noReactions.innerHTML = `
          <div>${t.setupRequired}</div>
          <details style="margin-top: 0.5rem; opacity: 0.7;">
            <summary style="cursor: pointer;">Debug info</summary>
            <pre style="font-size: 0.85rem; margin-top: 0.5rem;">Checked URLs:
${document.URL}
${document.URL.replace(/\/$/, '')}
${document.URL + (document.URL.endsWith('/') ? '' : '/')}

See console for more details.</pre>
          </details>
        `;
      } else {
        noReactions.textContent = t.noReactions;
      }

      if (upvoteForm) {
        upvoteForm.parentNode.insertBefore(noReactions, upvoteForm.nextSibling);
      } else {
        insertTarget.appendChild(noReactions);
      }
      return;
    }

    // Group webmentions by type
    const groups = groupWebmentions(data.children);

    // Create summary view
    const summary = createReactionSummary(groups);
    if (upvoteForm) {
      upvoteForm.parentNode.insertBefore(summary, upvoteForm.nextSibling);
    } else {
      insertTarget.appendChild(summary);
    }

    // Create detailed view if enabled
    if (showDetails) {
      detailsContainer = createDetailedView(groups);
      if (upvoteForm) {
        upvoteForm.parentNode.insertBefore(detailsContainer, upvoteForm.nextSibling);
      } else {
        insertTarget.appendChild(detailsContainer);
      }
    }
  }

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
