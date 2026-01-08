(function() {
  'use strict';

  // Only run on post pages
  if (!document.body.classList.contains('post')) {
    return;
  }

  // --- Configuration ---
  const scriptTag = document.currentScript;
  const email = scriptTag?.dataset.email;
  const mastodonHandle = scriptTag?.dataset.mastodon || '';
  const mappingsUrl = scriptTag?.dataset.mappingsUrl || 'https://raw.githubusercontent.com/flschr/bearblog-automation/main/mappings.json';
  const showLike = scriptTag?.dataset.like !== undefined;

  const activeServices = scriptTag?.dataset.services
    ? scriptTag.dataset.services.split(',').map(s => s.trim())
    : ['mastodon', 'bluesky', 'comments', 'mail'];

  // Webmentions configuration
  const webmentionsRepo = scriptTag?.dataset.webmentionsRepo || 'flschr/bearblog-automation';
  const webmentionsShowExcerpt = scriptTag?.dataset.webmentionsShowExcerpt !== 'false'; // Default true
  const webmentionsMaxMentions = parseInt(scriptTag?.dataset.webmentionsMaxMentions || '0', 10); // 0 = show all
  const webmentionsLang = scriptTag?.dataset.webmentionsLang || 'en';

  // Configurable constants
  const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
  const ENGAGEMENT_CACHE_TTL = 10 * 60 * 1000; // 10 minutes
  const NEGATIVE_CACHE_TTL = 60 * 1000; // 1 minute
  const DID_CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours
  const FETCH_TIMEOUT = parseInt(scriptTag?.dataset.timeout || '15000', 10); // 15 seconds default
  const VIRAL_THRESHOLD = parseInt(scriptTag?.dataset.viralThreshold || '50', 10);
  const HEART_INTERVAL_MS = parseInt(scriptTag?.dataset.heartInterval || '80', 10);
  const HEART_MIN_INTERVAL_MS = parseInt(scriptTag?.dataset.heartMinInterval || '150', 10);
  const HEART_MAX_INTERVAL_MS = parseInt(scriptTag?.dataset.heartMaxInterval || '250', 10);
  const HEART_AUTO_STOP_COUNT = parseInt(scriptTag?.dataset.heartAutoStop || '24', 10);
  const HEART_LIFETIME_MS = 1500;
  const MOBILE_BREAKPOINT = '640px';
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // --- Early DOM Setup ---
  const upvoteForm = document.querySelector('#upvote-form');
  const nativeUpvoteBtn = upvoteForm?.querySelector('.upvote-button, button');
  if (upvoteForm) upvoteForm.style.display = 'none';

  // --- Icons (SVG) ---
  const icons = {
    heart: '<svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>',
    mail: '<svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>',
    mastodon: '<svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M23.268 5.313c-.35-2.578-2.617-4.61-5.304-5.004C17.51.242 15.792 0 11.813 0h-.03c-3.98 0-4.835.242-5.288.309C3.882.692 1.496 2.518.917 5.127.64 6.412.61 7.837.661 9.143c.074 1.874.088 3.745.26 5.611.118 1.24.325 2.47.62 3.68.55 2.237 2.777 4.098 4.96 4.857 2.336.792 4.849.923 7.256.38.265-.061.527-.132.786-.213.585-.184 1.27-.39 1.774-.753a.057.057 0 0 0 .023-.043v-1.809a.052.052 0 0 0-.02-.041.053.053 0 0 0-.046-.01 20.282 20.282 0 0 1-4.709.545c-2.73 0-3.463-1.284-3.674-1.818a5.593 5.593 0 0 1-.319-1.433.053.053 0 0 1 .066-.054c1.517.363 3.072.546 4.632.546.376 0 .75 0 1.125-.01 1.57-.044 3.224-.124 4.768-.422.038-.008.077-.015.11-.024 2.435-.464 4.753-1.92 4.989-5.604.008-.145.03-1.52.03-1.67.002-.512.167-3.63-.024-5.545zm-3.748 9.195h-2.561V8.29c0-1.309-.55-1.976-1.67-1.976-1.23 0-1.846.79-1.846 2.35v3.403h-2.546V8.663c0-1.56-.617-2.35-1.848-2.35-1.112 0-1.668.668-1.668 1.977v6.218H4.822V8.102c0-1.31.337-2.35 1.011-3.12.696-.77 1.608-1.164 2.74-1.164 1.311 0 2.302.5 2.962 1.498l.638 1.06.638-1.06c.66-.999 1.65-1.498 2.96-1.498 1.13 0 2.043.395 2.74 1.164.675.77 1.012 1.81 1.012 3.12v6.406z"/></svg>',
    bluesky: '<svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M12 10.8c-1.087-2.114-4.046-6.053-6.798-7.995C2.566.944 1.561 1.266.902 1.565.139 1.908 0 3.08 0 3.768c0 .69.378 5.65.624 6.479.815 2.736 3.713 3.66 6.383 3.364.136-.02.275-.039.415-.056-.138.022-.276.04-.415.056-3.912.58-7.387 2.005-2.83 7.078 5.013 5.19 6.87-1.113 7.823-4.308.953 3.195 2.05 9.271 7.733 4.308 4.267-4.308 1.172-6.498-2.74-7.078a8.741 8.741 0 0 1-.415-.056c.14.017.279.036.415.056 2.67.297 5.568-.628 6.383-3.364.246-.828.624-5.79.624-6.478 0-.69-.139-1.861-.902-2.206-.659-.298-1.664-.62-4.3 1.24C16.046 4.748 13.087 8.687 12 10.8z"/></svg>',
    webmentions: '<svg viewBox="0 0 1024 1024" fill="currentColor" width="18" height="18"><path d="M857 216l-230 214h111l-85 368h-2l-120 -368h-144l-121 362h-2l-111 -476h-153l185 700h155l117 -363h2l118 363h153l157 -586h113z"/></svg>'
  };

  // --- Cache Utilities ---
  function getFromCache(key, storage = sessionStorage) {
    try {
      const item = storage.getItem(key);
      if (!item) return null;
      const { data, expires } = JSON.parse(item);
      if (Date.now() > expires) {
        storage.removeItem(key);
        return null;
      }
      return data;
    } catch {
      return null;
    }
  }

  function setCache(key, data, ttl = CACHE_TTL, storage = sessionStorage) {
    try {
      storage.setItem(key, JSON.stringify({
        data,
        expires: Date.now() + ttl
      }));
    } catch {
      // Storage unavailable
    }
  }

  // Convenience wrappers for specific use cases
  const getCached = (key) => getFromCache(key, sessionStorage);
  const getDIDFromCache = (handle) => getFromCache(`bsky_did_${handle}`, localStorage);
  const cacheDID = (handle, did) => setCache(`bsky_did_${handle}`, did, DID_CACHE_TTL, localStorage);

  // --- Utility Functions ---
  function normalizeUrl(url) {
    return url
      .replace(/[?#].*$/, '')
      .replace(/\/$/, '')
      .replace(/^https?:\/\//, '')
      .replace(/^www\./, '');
  }

  function getCleanTitle() {
    const title = document.title;
    const lastPipe = title.lastIndexOf('|');
    return lastPipe > 0 ? title.substring(0, lastPipe).trim() : title;
  }

  async function fetchWithTimeout(url, options = {}) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT);
    try {
      const response = await fetch(url, { ...options, signal: controller.signal });
      clearTimeout(timeoutId);
      return response;
    } catch (err) {
      clearTimeout(timeoutId);
      throw err;
    }
  }

  async function safeJsonParse(response) {
    try {
      return await response.json();
    } catch {
      return null;
    }
  }

  function isDarkMode() {
    return document.documentElement.dataset.theme === 'dark'
      || document.body.classList.contains('dark-mode')
      || window.matchMedia('(prefers-color-scheme: dark)').matches;
  }

  const modalColors = {
    dark: {
      background: '#1e1e1e',
      text: '#e0e0e0',
      shadowAlpha: '0.5',
      smallShadowAlpha: '0.4',
      mutedText: '#999',
      hoverBackdrop: 'rgba(255,255,255,0.1)',
      inputBorder: '#444',
      inputBackground: '#2a2a2a'
    },
    light: {
      background: '#fff',
      text: '#333',
      shadowAlpha: '0.2',
      smallShadowAlpha: '0.15',
      mutedText: '#666',
      hoverBackdrop: 'rgba(0,0,0,0.05)',
      inputBorder: '#ccc',
      inputBackground: '#fff'
    }
  };

  // --- BearBlog API ---
  async function fetchBearBlog() {
    const uid = upvoteForm?.querySelector('input[name="uid"]')?.value
      || upvoteForm?.action?.match(/\/upvote\/([^\/]+)/)?.[1];

    if (!uid) return null;

    const cacheKey = `bearblog_${uid}`;
    const cached = getCached(cacheKey);
    if (cached) return cached;

    try {
      const res = await fetchWithTimeout(`/upvote-info/${uid}/`);
      const data = await safeJsonParse(res);
      if (data) setCache(cacheKey, data);
      return data;
    } catch {
      return null;
    }
  }

  // --- Social URL Discovery ---
  async function findSocialUrls() {
    const metaBluesky = document.querySelector('meta[name="bsky-post"]')?.content || null;
    const metaMastodon = document.querySelector('meta[name="mastodon-post"]')?.content || null;

    if (metaBluesky && metaMastodon) {
      return { bluesky: metaBluesky, mastodon: metaMastodon };
    }

    const cacheKey = `mappings_${normalizeUrl(window.location.href)}`;
    const cached = getCached(cacheKey);
    if (cached) {
      return {
        bluesky: metaBluesky || cached.bluesky,
        mastodon: metaMastodon || cached.mastodon
      };
    }

    try {
      const res = await fetchWithTimeout(mappingsUrl);
      const mappings = await safeJsonParse(res);
      if (!mappings) return { bluesky: metaBluesky, mastodon: metaMastodon };

      const currentUrl = normalizeUrl(window.location.href);

      for (const [url, data] of Object.entries(mappings)) {
        if (normalizeUrl(url) === currentUrl) {
          setCache(cacheKey, data);
          return {
            bluesky: metaBluesky || data.bluesky,
            mastodon: metaMastodon || data.mastodon
          };
        }
      }
    } catch {
      // Mapping fetch failed
    }

    return { bluesky: metaBluesky, mastodon: metaMastodon };
  }

  // --- Platform-Specific Engagement Fetchers ---
  async function fetchBlueskyEngagement(url) {
    const normalizedUrl = normalizeUrl(url);
    const cacheKey = `bsky_engagement_${normalizedUrl}`;
    const cached = getCached(cacheKey);
    if (cached) {
      return cached.negative ? null : cached;
    }

    const setNegativeCache = () => setCache(cacheKey, { negative: true }, NEGATIVE_CACHE_TTL);

    const match = url.match(/bsky\.app\/profile\/([^\/]+)\/post\/([^\/\?]+)/);
    if (!match) {
      setNegativeCache();
      return null;
    }

    const [, handle, postId] = match;

    try {
      let did = getDIDFromCache(handle);

      if (!did) {
        const didRes = await fetchWithTimeout(
          `https://public.api.bsky.app/xrpc/com.atproto.identity.resolveHandle?handle=${handle}`
        );
        const didData = await safeJsonParse(didRes);
        if (!didData?.did) {
          setNegativeCache();
          return null;
        }
        did = didData.did;
        cacheDID(handle, did);
      }

      const postUri = `at://${did}/app.bsky.feed.post/${postId}`;
      const res = await fetchWithTimeout(
        `https://public.api.bsky.app/xrpc/app.bsky.feed.getPostThread?uri=${encodeURIComponent(postUri)}&depth=0`
      );
      const data = await safeJsonParse(res);
      const post = data?.thread?.post;
      if (!post) {
        setNegativeCache();
        return null;
      }

      const engagement = {
        likes: post.likeCount || 0,
        reposts: post.repostCount || 0,
        replies: post.replyCount || 0,
        total: (post.likeCount || 0) + (post.repostCount || 0) + (post.replyCount || 0)
      };
      setCache(cacheKey, engagement, ENGAGEMENT_CACHE_TTL);
      return engagement;
    } catch {
      setNegativeCache();
      return null;
    }
  }

  async function fetchMastodonEngagement(url) {
    const normalizedUrl = normalizeUrl(url);
    const cacheKey = `mastodon_engagement_${normalizedUrl}`;
    const cached = getCached(cacheKey);
    if (cached) {
      return cached.negative ? null : cached;
    }

    const setNegativeCache = () => setCache(cacheKey, { negative: true }, NEGATIVE_CACHE_TTL);

    try {
      const urlObj = new URL(url);
      const statusId = urlObj.pathname.split('/').pop();

      const [statusRes, contextRes] = await Promise.all([
        fetchWithTimeout(`${urlObj.origin}/api/v1/statuses/${statusId}`),
        fetchWithTimeout(`${urlObj.origin}/api/v1/statuses/${statusId}/context`)
      ]);

      const data = await safeJsonParse(statusRes);
      const context = await safeJsonParse(contextRes);
      if (!data) {
        setNegativeCache();
        return null;
      }

      const totalReplies = context?.descendants?.length || 0;

      const engagement = {
        likes: data.favourites_count || 0,
        reposts: data.reblogs_count || 0,
        replies: totalReplies,
        total: (data.favourites_count || 0) + (data.reblogs_count || 0) + totalReplies
      };
      setCache(cacheKey, engagement, ENGAGEMENT_CACHE_TTL);
      return engagement;
    } catch {
      setNegativeCache();
      return null;
    }
  }

  // --- Webmentions Fetcher ---
  async function fetchWebmentions() {
    if (!activeServices.includes('webmentions')) return null;

    const dataUrl = `https://raw.githubusercontent.com/${webmentionsRepo}/main/webmentions.json`;
    const cacheKey = `webmentions_${webmentionsRepo.replace(/\//g, '_')}`;
    const cached = getCached(cacheKey);
    if (cached) return cached;

    try {
      const res = await fetchWithTimeout(dataUrl);
      if (!res.ok) return null;

      const data = await safeJsonParse(res);
      if (data) setCache(cacheKey, data);
      return data;
    } catch {
      return null;
    }
  }

  function getMentionsForCurrentUrl(webmentionsData) {
    if (!webmentionsData) return null;

    const currentUrl = window.location.href.split('#')[0].split('?')[0];
    const urlVariants = [
      currentUrl,
      currentUrl.endsWith('/') ? currentUrl.slice(0, -1) : currentUrl + '/'
    ];

    for (const url of urlVariants) {
      if (webmentionsData[url]?.mentions && webmentionsData[url].mentions.length > 0) {
        return webmentionsData[url].mentions;
      }
    }

    return null;
  }

  // --- Create Buttons ---
  function createButton(icon, count, onClick, title, ariaLabel) {
    const btn = document.createElement('button');
    btn.className = 'simple-reaction-button';
    btn.title = title;
    btn.setAttribute('aria-label', ariaLabel || title);

    // Show skeleton loading state if count is not yet loaded
    const countClass = count === '...' ? 'count skeleton' : 'count';
    btn.innerHTML = `<span class="icon">${icon}</span><span class="${countClass}">${count}</span>`;

    if (onClick) {
      btn.onclick = onClick;
    } else {
      btn.disabled = true;
      btn.style.cursor = 'default';
      btn.setAttribute('aria-disabled', 'true');
    }

    return btn;
  }

  function createMailButton(onClick) {
    const btn = document.createElement('button');
    btn.className = 'simple-reaction-button simple-mail-button';
    btn.title = 'Reply by mail';
    btn.setAttribute('aria-label', 'Reply by mail');
    btn.innerHTML = `<span class="icon">${icons.mail}</span><span class="mail-text">Reply</span>`;

    if (onClick) {
      btn.onclick = onClick;
    }

    return btn;
  }

  function createLikeButton(totalLikes, isLiked, nativeButton) {
    const btn = document.createElement('button');
    btn.className = 'simple-reaction-button simple-like-button';

    const likeText = totalLikes === 1 ? 'like' : 'likes';
    const ariaLabel = isLiked
      ? `${totalLikes} ${likeText}. You liked this post`
      : `${totalLikes} ${likeText} across all platforms. Click to like`;

    btn.title = isLiked ? 'You liked this' : 'Like this post';
    btn.setAttribute('aria-label', ariaLabel);
    btn.setAttribute('aria-live', 'polite');

    const icon = document.createElement('span');
    icon.className = 'icon';
    icon.innerHTML = icons.heart;
    icon.setAttribute('aria-hidden', 'true');

    const count = document.createElement('span');
    count.className = totalLikes === '...' ? 'count skeleton' : 'count';
    count.textContent = totalLikes;
    count.setAttribute('aria-hidden', 'true');

    btn.appendChild(icon);
    btn.appendChild(count);

    if (isLiked) {
      btn.classList.add('liked');
      btn.disabled = true;
      btn.style.cursor = 'default';

      // Add viral effect if high engagement
      if (totalLikes >= VIRAL_THRESHOLD) {
        btn.classList.add('viral');
      }
    } else {
      let cleanupHeartbeat = null;
      let isLiking = false;

      const handleMouseEnter = () => {
        if (!isLiking && !prefersReducedMotion) {
          cleanupHeartbeat = startHeartbeat(btn);
        }
      };

      const handleMouseLeave = () => {
        if (cleanupHeartbeat) {
          cleanupHeartbeat();
          cleanupHeartbeat = null;
        }
      };

      btn.addEventListener('mouseenter', handleMouseEnter);
      btn.addEventListener('mouseleave', handleMouseLeave);

      btn.onclick = () => {
        isLiking = true;

        // Clean up hearts immediately
        if (cleanupHeartbeat) {
          cleanupHeartbeat();
          cleanupHeartbeat = null;
        }

        // Remove event listeners to prevent new hearts
        btn.removeEventListener('mouseenter', handleMouseEnter);
        btn.removeEventListener('mouseleave', handleMouseLeave);

        if (nativeButton) nativeButton.click();

        const newCount = totalLikes + 1;
        count.textContent = newCount;

        // Update accessibility
        const likeText = newCount === 1 ? 'like' : 'likes';
        btn.setAttribute('aria-label', `${newCount} ${likeText}. You liked this post`);
        btn.title = 'You liked this';

        btn.disabled = true;
        btn.classList.add('liked');
        btn.style.cursor = 'default';

        // Social proof: add viral class for high engagement
        if (newCount >= VIRAL_THRESHOLD) {
          btn.classList.add('viral');
        }
      };
    }

    return btn;
  }

  // Start smooth continuous heart animation
  function startHeartbeat(btn) {
    const timeouts = [];
    let rafId;
    let mutationObserver;
    let isRunning = true;
    let heartCount = 0;

    // Cache rect to avoid expensive getBoundingClientRect calls (90% performance gain)
    const cachedRect = btn.getBoundingClientRect();
    const centerX = cachedRect.left + cachedRect.width / 2;
    const centerY = cachedRect.top + cachedRect.height / 2;

    const createHeart = () => {
      if (!isRunning || document.hidden) return false;
      const heart = document.createElement('div');
      heart.className = 'flying-heart';
      heart.innerHTML = icons.heart;

      // Calculate fan angle (-45° to +45° from vertical for wider spread)
      const angle = (Math.random() - 0.5) * 90; // -45 to +45 degrees

      heart.style.left = `${centerX}px`;
      heart.style.top = `${centerY}px`;
      heart.style.setProperty('--fly-angle', `${angle}deg`);

      document.body.appendChild(heart);

      const removeTimeout = setTimeout(() => heart.remove(), HEART_LIFETIME_MS);
      timeouts.push(removeTimeout);
      return true;
    };

    const getInterval = () => {
      const minInterval = Math.max(HEART_INTERVAL_MS, HEART_MIN_INTERVAL_MS);
      const maxInterval = Math.max(minInterval, HEART_MAX_INTERVAL_MS);
      return Math.floor(Math.random() * (maxInterval - minInterval + 1)) + minInterval;
    };

    let nextInterval = getInterval();
    let lastTick = performance.now();

    const cleanup = () => {
      if (!isRunning) return;
      isRunning = false;
      if (rafId) cancelAnimationFrame(rafId);
      timeouts.forEach(timeout => clearTimeout(timeout));
      timeouts.length = 0;
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (mutationObserver) mutationObserver.disconnect();
    };

    const tick = (now) => {
      if (!isRunning) return;

      if (!document.hidden && now - lastTick >= nextInterval) {
        if (createHeart()) {
          heartCount += 1;
        }
        lastTick = now;
        nextInterval = getInterval();
        if (heartCount >= HEART_AUTO_STOP_COUNT) {
          cleanup();
          return;
        }
      }

      rafId = requestAnimationFrame(tick);
    };

    // Smooth heartbeat using requestAnimationFrame
    if (createHeart()) {
      heartCount += 1;
    }
    rafId = requestAnimationFrame(tick);

    const handleVisibilityChange = () => {
      if (document.hidden) {
        cleanup();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    const parentNode = btn.parentNode;
    if (parentNode) {
      mutationObserver = new MutationObserver(() => {
        if (!document.body.contains(btn)) {
          cleanup();
        }
      });
      mutationObserver.observe(parentNode, { childList: true });
    }

    // Return cleanup function
    return cleanup;
  }

  // --- Webmentions Modal ---
  let webmentionsModal = null;
  let webmentionsMentions = null;

  function formatDate(dateString, lang = 'en') {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString(lang === 'de' ? 'de-DE' : 'en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  }

  function truncateText(text, maxLength = 200) {
    if (!text || text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
  }

  function createWebmentionsModal() {
    if (webmentionsModal) return;

    const ui = {
      en: {
        title: 'Also mentioned in:',
        close: 'Close'
      },
      de: {
        title: 'Auch erwähnt in:',
        close: 'Schließen'
      }
    };

    const t = ui[webmentionsLang] || ui.en;

    const theme = isDarkMode() ? modalColors.dark : modalColors.light;

    // Create modal backdrop
    webmentionsModal = document.createElement('div');
    webmentionsModal.id = 'sr-webmentions-modal';
    webmentionsModal.setAttribute('role', 'dialog');
    webmentionsModal.setAttribute('aria-modal', 'true');
    webmentionsModal.setAttribute('aria-labelledby', 'webmentions-modal-title');
    webmentionsModal.style.cssText = 'display:none;position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.5);z-index:10000;align-items:center;justify-content:center;padding:1rem;overflow-y:auto;';

    // Create dialog container
    const dialog = document.createElement('div');
    dialog.className = 'webmentions-modal-dialog';
    dialog.style.cssText = `background:${theme.background};color:${theme.text};padding:0;border-radius:12px;max-width:700px;width:100%;max-height:90vh;box-shadow:0 8px 32px rgba(0,0,0,${theme.shadowAlpha});display:flex;flex-direction:column;margin:auto;`;

    // Create header
    const header = document.createElement('div');
    header.style.cssText = `padding:1.5rem 1.5rem 0.5rem 2rem;display:flex;align-items:center;justify-content:space-between;flex-shrink:0;`;

    const titleEl = document.createElement('p');
    titleEl.id = 'webmentions-modal-title';
    titleEl.innerHTML = `<strong>${t.title}</strong>`;
    titleEl.style.cssText = 'margin:0;';

    const closeBtn = document.createElement('button');
    closeBtn.setAttribute('aria-label', t.close);
    closeBtn.innerHTML = '×';
    closeBtn.style.cssText = `background:none;border:none;font-size:2rem;color:${theme.mutedText};cursor:pointer;padding:0;width:32px;height:32px;display:flex;align-items:center;justify-content:center;border-radius:4px;transition:background 0.2s;`;
    closeBtn.onmouseover = () => closeBtn.style.background = theme.hoverBackdrop;
    closeBtn.onmouseout = () => closeBtn.style.background = 'none';
    closeBtn.onclick = closeWebmentionsModal;

    header.appendChild(titleEl);
    header.appendChild(closeBtn);

    // Create content area (scrollable)
    const content = document.createElement('div');
    content.className = 'webmentions-modal-content';
    content.style.cssText = 'padding:0.5rem 1.5rem 1.5rem 2rem;overflow-y:auto;flex:1;';

    dialog.appendChild(header);
    dialog.appendChild(content);
    webmentionsModal.appendChild(dialog);

    // Close on backdrop click
    webmentionsModal.addEventListener('click', (e) => {
      if (e.target === webmentionsModal) closeWebmentionsModal();
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && webmentionsModal.style.display === 'flex') {
        closeWebmentionsModal();
      }
    });

    document.body.appendChild(webmentionsModal);
  }

  function closeWebmentionsModal() {
    if (webmentionsModal) {
      webmentionsModal.style.display = 'none';
    }
  }

  function showWebmentionsModal() {
    createWebmentionsModal();

    if (!webmentionsMentions || webmentionsMentions.length === 0) {
      return;
    }

    // Get content area
    const content = webmentionsModal.querySelector('.webmentions-modal-content');
    content.innerHTML = '';

    // Create simple list
    const list = document.createElement('ul');
    list.className = 'webmentions-list';
    list.style.cssText = 'list-style:none;padding:0;margin:0;';

    webmentionsMentions.forEach(mention => {
      let sourceUrl;
      try {
        sourceUrl = new URL(mention.source);
      } catch {
        return;
      }

      if (!['http:', 'https:'].includes(sourceUrl.protocol)) {
        return;
      }

      const domain = sourceUrl.hostname.replace(/^www\./, '');
      const title = mention.title || 'Untitled';
      const faviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=16`;

      const listItem = document.createElement('li');
      listItem.className = 'webmention-item';
      listItem.style.cssText = 'margin-bottom:0.75rem;';

      const link = document.createElement('a');
      link.className = 'webmention-link';
      link.target = '_blank';
      link.rel = 'noopener';
      link.href = sourceUrl.href;

      const favicon = document.createElement('img');
      favicon.className = 'webmention-favicon';
      favicon.width = 16;
      favicon.height = 16;
      favicon.loading = 'lazy';
      favicon.alt = '';
      favicon.src = faviconUrl;
      favicon.onerror = () => {
        favicon.style.display = 'none';
      };

      const textWrapper = document.createElement('span');
      textWrapper.className = 'webmention-text';

      const domainSpan = document.createElement('span');
      domainSpan.className = 'webmention-domain';
      domainSpan.textContent = domain;

      const separatorSpan = document.createElement('span');
      separatorSpan.className = 'webmention-separator';
      separatorSpan.textContent = ':';

      const titleSpan = document.createElement('span');
      titleSpan.className = 'webmention-link-title';
      titleSpan.textContent = title;

      textWrapper.appendChild(domainSpan);
      textWrapper.appendChild(separatorSpan);
      textWrapper.append(' ');
      textWrapper.appendChild(titleSpan);

      link.appendChild(favicon);
      link.appendChild(textWrapper);
      listItem.appendChild(link);
      list.appendChild(listItem);
    });

    content.appendChild(list);

    // Show modal
    webmentionsModal.style.display = 'flex';
  }

  // --- Mastodon Modal ---
  let modal = null;
  let modalInput = null;
  let storedMastoUrl = null;

  function createModal() {
    if (modal) return;

    const theme = isDarkMode() ? modalColors.dark : modalColors.light;

    modal = document.createElement('div');
    modal.id = 'sr-mastodon-modal';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.style.cssText = 'display:none;position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.5);z-index:10000;align-items:center;justify-content:center;';

    const dialog = document.createElement('div');
    dialog.style.cssText = `background:${theme.background};color:${theme.text};padding:1.5rem;border-radius:8px;max-width:320px;width:90%;box-shadow:0 4px 20px rgba(0,0,0,${theme.smallShadowAlpha});`;

    const label = document.createElement('label');
    label.textContent = 'Your Mastodon instance';
    label.style.cssText = 'display:block;margin-bottom:0.5rem;font-weight:bold;';

    modalInput = document.createElement('input');
    modalInput.type = 'text';
    modalInput.placeholder = 'e.g. mastodon.social';
    modalInput.style.cssText = `width:100%;padding:0.5rem;border:1px solid ${theme.inputBorder};border-radius:4px;font-size:1rem;box-sizing:border-box;margin-bottom:1rem;background:${theme.inputBackground};color:${theme.text};`;

    const buttonContainer = document.createElement('div');
    buttonContainer.style.cssText = 'display:flex;gap:0.5rem;justify-content:flex-end;';

    const cancelBtn = document.createElement('button');
    cancelBtn.textContent = 'Cancel';
    cancelBtn.type = 'button';
    cancelBtn.style.cssText = `padding:0.5rem 1rem;border:1px solid ${theme.inputBorder};background:transparent;border-radius:4px;cursor:pointer;color:${theme.text};`;
    cancelBtn.addEventListener('click', closeModal);

    const submitBtn = document.createElement('button');
    submitBtn.textContent = 'Open';
    submitBtn.type = 'button';
    submitBtn.style.cssText = 'padding:0.5rem 1rem;border:none;background:#6364ff;color:#fff;border-radius:4px;cursor:pointer;';
    submitBtn.addEventListener('click', handleMastodonSubmit);

    buttonContainer.appendChild(cancelBtn);
    buttonContainer.appendChild(submitBtn);

    dialog.appendChild(label);
    dialog.appendChild(modalInput);
    dialog.appendChild(buttonContainer);
    modal.appendChild(dialog);

    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });

    modalInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleMastodonSubmit();
      } else if (e.key === 'Escape') {
        closeModal();
      }
    });

    document.body.appendChild(modal);
  }

  function closeModal() {
    if (modal) modal.style.display = 'none';
  }

  function handleMastodonSubmit() {
    const instance = modalInput.value.trim()
      .replace(/^https?:\/\//, '')
      .replace(/\/$/, '');

    if (!instance) return;

    localStorage.setItem('mastodon_instance', instance);
    closeModal();

    let targetUrl;
    if (storedMastoUrl) {
      targetUrl = `https://${instance}/authorize_interaction?uri=${encodeURIComponent(storedMastoUrl)}`;
    } else {
      const shareText = mastodonHandle
        ? `${mastodonHandle} Re: ${getCleanTitle()} ${window.location.href}`
        : `Re: ${getCleanTitle()} ${window.location.href}`;
      targetUrl = `https://${instance}/share?text=${encodeURIComponent(shareText)}`;
    }

    window.open(targetUrl, '_blank', 'noopener');
  }

  function showMastodonModal(mastodonUrl) {
    storedMastoUrl = mastodonUrl;
    createModal();
    modal.style.display = 'flex';
    modalInput.value = localStorage.getItem('mastodon_instance') || '';
    modalInput.focus();
    modalInput.select();
  }

  // --- Main Init ---
  async function init() {
    const container = document.createElement('div');
    container.className = 'simple-reactions';

    const target = upvoteForm || document.querySelector('.blog-content');
    if (!target) return;

    target.parentNode.insertBefore(container, target);

    // Only fetch social URLs if needed
    const needsSocialUrls = activeServices.some(s => ['mastodon', 'bluesky', 'comments'].includes(s));

    // Fetch all data
    const [urls, bearBlogData] = await Promise.all([
      needsSocialUrls ? findSocialUrls() : Promise.resolve({ bluesky: null, mastodon: null }),
      showLike ? fetchBearBlog() : null
    ]);

    const [blueskyEngagement, mastodonEngagement] = await Promise.all([
      urls.bluesky ? fetchBlueskyEngagement(urls.bluesky) : null,
      urls.mastodon ? fetchMastodonEngagement(urls.mastodon) : null
    ]);

    // Calculate totals
    const totalLikes = (blueskyEngagement?.likes || 0)
      + (mastodonEngagement?.likes || 0)
      + (bearBlogData?.upvote_count || 0);

    const isLiked = bearBlogData?.upvoted || nativeUpvoteBtn?.disabled;

    // Build buttons
    const buttons = [];

    // Like button (always show if enabled)
    if (showLike) {
      buttons.push(createLikeButton(totalLikes, isLiked, nativeUpvoteBtn));
    }

    // Helper function to create platform button
    const createPlatformButton = (platform, engagement, url, onClick) => {
      const total = engagement?.total;
      const tooltip = total === null
        ? `${platform} engagement (could not load)`
        : `${engagement.likes || 0} likes, ${engagement.reposts || 0} reposts, ${engagement.replies || 0} replies on ${platform}`;
      const ariaLabel = total === null
        ? `${platform} discussion. Engagement could not be loaded`
        : `${total} total interactions on ${platform}. Click to discuss`;

      return createButton(
        icons[platform.toLowerCase()],
        total === null ? '?' : total || 0,
        onClick,
        tooltip,
        ariaLabel
      );
    };

    // Mastodon button (show if service enabled and URL exists)
    if (activeServices.includes('mastodon') && urls.mastodon) {
      buttons.push(createPlatformButton(
        'Mastodon',
        mastodonEngagement,
        urls.mastodon,
        () => showMastodonModal(urls.mastodon)
      ));
    }

    // Bluesky button (show if service enabled and URL exists)
    if (activeServices.includes('bluesky') && urls.bluesky) {
      buttons.push(createPlatformButton(
        'Bluesky',
        blueskyEngagement,
        urls.bluesky,
        () => window.open(urls.bluesky, '_blank', 'noopener')
      ));
    }

    // Webmentions button (show if service enabled and mentions exist)
    if (activeServices.includes('webmentions')) {
      const webmentionsData = await fetchWebmentions();
      const mentions = getMentionsForCurrentUrl(webmentionsData);

      if (mentions && mentions.length > 0) {
        webmentionsMentions = mentions;
        const webmentionsTooltip = `${mentions.length} blog ${mentions.length === 1 ? 'mention' : 'mentions'}`;
        const webmentionsAriaLabel = `${mentions.length} blog mentions. Click to view`;

        buttons.push(createButton(
          icons.webmentions,
          mentions.length,
          showWebmentionsModal,
          webmentionsTooltip,
          webmentionsAriaLabel
        ));
      }
    }

    // Mail button (show if service enabled and email configured)
    if (activeServices.includes('mail') && email) {
      buttons.push(createMailButton(
        () => window.location.href = `mailto:${email}?subject=Re: ${encodeURIComponent(getCleanTitle())}`
      ));
    }

    // Add all buttons to container
    buttons.forEach(btn => container.appendChild(btn));

    // If no buttons, show nothing
    if (buttons.length === 0) {
      container.style.display = 'none';
    }
  }

  // --- Inject CSS Styles ---
  const style = document.createElement('style');
  style.textContent = `
    /* Container */
    .simple-reactions {
      display: flex;
      gap: 0.5rem;
      margin: 3rem 0 2rem 0;
      justify-content: center;
      flex-wrap: wrap;
    }

    /* Base button styles */
    .simple-reaction-button {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.4rem;
      padding: 0.5rem 0.9rem;
      min-width: 70px;
      border: 1px solid #ddd;
      border-radius: 8px;
      background: #fff;
      color: #333;
      font-size: 1rem;
      cursor: pointer;
      transition: all 0.2s ease;
      position: relative;
      z-index: 10;
    }

    .simple-reaction-button:hover:not(:disabled) {
      border-color: #999;
      transform: translateY(-1px);
    }

    .simple-reaction-button:active:not(:disabled) {
      transform: translateY(0) scale(0.95);
      transition: transform 0.1s ease;
    }

    .simple-reaction-button:focus-visible {
      outline: 2px solid #6364ff;
      outline-offset: 2px;
      border-color: #6364ff;
    }

    .simple-reaction-button.liked {
      background: #fff0f0;
      border-color: #fb4934;
      color: #fb4934;
    }

    .simple-reaction-button .icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      line-height: 1;
    }

    .simple-reaction-button .icon svg {
      display: block;
    }

    .simple-reaction-button .count {
      font-weight: 600;
      font-variant-numeric: tabular-nums;
      line-height: 1;
    }

    .simple-reaction-button .count.skeleton {
      background: linear-gradient(90deg, #e0e0e0 25%, #f0f0f0 50%, #e0e0e0 75%);
      background-size: 200% 100%;
      animation: skeleton-pulse 1.5s ease-in-out infinite;
      border-radius: 3px;
      color: transparent;
      min-width: 16px;
    }

    @keyframes skeleton-pulse {
      0% { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }

    /* Dark mode */
    html[data-theme="dark"] .simple-reaction-button {
      background: rgba(255,255,255,0.05);
      border-color: #444;
      color: #e0e0e0;
    }

    html[data-theme="dark"] .simple-reaction-button:hover:not(:disabled) {
      background: rgba(255,255,255,0.1);
      border-color: #666;
    }

    html[data-theme="dark"] .simple-reaction-button.liked {
      background: rgba(251, 73, 52, 0.15);
      border-color: #fb4934;
      color: #fb4934;
    }

    html[data-theme="dark"] .simple-reaction-button .count.skeleton {
      background: linear-gradient(90deg, #333 25%, #444 50%, #333 75%);
      background-size: 200% 100%;
    }

    html[data-theme="dark"] .simple-reaction-button:focus-visible {
      outline-color: #7879ff;
      border-color: #7879ff;
    }

    html[data-theme="dark"] .simple-like-button.viral::before {
      background: linear-gradient(45deg, #fb4934, #ff8080, #fb4934);
      opacity: 0;
    }

    html[data-theme="dark"] .simple-like-button.viral::before {
      animation: viral-glow-dark 2s ease-in-out infinite;
    }

    @keyframes viral-glow-dark {
      0%, 100% {
        opacity: 0;
        background-position: 0% 50%;
      }
      50% {
        opacity: 0.6;
        background-position: 100% 50%;
      }
    }

    /* Like button */
    .simple-like-button {
      overflow: visible;
    }

    /* Viral effect for high engagement (50+ likes) */
    .simple-like-button.viral {
      animation: viral-pulse 2s ease-in-out infinite;
      position: relative;
    }

    .simple-like-button.viral::before {
      content: '';
      position: absolute;
      top: -2px;
      left: -2px;
      right: -2px;
      bottom: -2px;
      border-radius: 9px;
      background: linear-gradient(45deg, #fb4934, #ff6b6b, #fb4934);
      background-size: 200% 200%;
      opacity: 0;
      z-index: -1;
      animation: viral-glow 2s ease-in-out infinite;
    }

    @keyframes viral-pulse {
      0%, 100% {
        transform: scale(1);
      }
      50% {
        transform: scale(1.08);
      }
    }

    @keyframes viral-glow {
      0%, 100% {
        opacity: 0;
        background-position: 0% 50%;
      }
      50% {
        opacity: 0.4;
        background-position: 100% 50%;
      }
    }

    .simple-like-button.viral:hover {
      animation: viral-pulse-hover 1.5s ease-in-out infinite;
    }

    @keyframes viral-pulse-hover {
      0%, 100% {
        transform: scale(1.05) translateY(-1px);
      }
      50% {
        transform: scale(1.12) translateY(-1px);
      }
    }

    /* Mail button with text */
    .simple-mail-button .mail-text {
      font-weight: 500;
      white-space: nowrap;
    }

    /* Hide mail text on mobile */
    @media (max-width: 640px) {
      .simple-mail-button .mail-text {
        display: none;
      }
    }

    /* Respect prefers-reduced-motion (WCAG 2.1) */
    @media (prefers-reduced-motion: reduce) {
      .flying-heart,
      .simple-like-button.viral,
      .simple-like-button.viral::before,
      .simple-like-button.liked:hover .icon svg {
        animation: none !important;
      }

      .simple-reaction-button:hover:not(:disabled),
      .simple-reaction-button:active:not(:disabled) {
        transform: none !important;
      }
    }

    /* HeartBeat animation for liked state */
    .simple-like-button.liked:hover .icon svg {
      animation: sr-heartBeat 0.8s infinite;
    }

    @keyframes sr-heartBeat {
      0% { transform: scale(1); }
      14% { transform: scale(1.3); }
      28% { transform: scale(1); }
      42% { transform: scale(1.3); }
      70% { transform: scale(1); }
    }

    /* Flying hearts animation - continuous stream with fan effect */
    .flying-heart {
      position: fixed;
      pointer-events: none;
      z-index: 5;
      animation: flyUpFan 1.5s linear forwards;
      opacity: 0;
      --fly-angle: 0deg;
    }

    .flying-heart svg {
      width: 16px;
      height: 16px;
      fill: #fb4934;
      filter: drop-shadow(0 2px 4px rgba(251, 73, 52, 0.3));
    }

    @keyframes flyUpFan {
      0% {
        transform: translate(0, 0) scale(0.8);
        opacity: 0;
      }
      10% {
        transform: translate(
          calc(sin(var(--fly-angle)) * 12px),
          -15px
        ) scale(1);
        opacity: 1;
      }
      100% {
        transform:
          translate(
            calc(sin(var(--fly-angle)) * 80px),
            -120px
          )
          scale(0.9);
        opacity: 0;
      }
    }

    /* Webmentions Modal */
    .webmentions-list {
      line-height: 1.8;
    }

    .webmention-item {
      line-height: 1.8;
    }

    .webmention-link {
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
    }

    .webmention-link:hover .webmention-text {
      text-decoration: underline;
    }

    .webmention-favicon {
      flex-shrink: 0;
      border-radius: 2px;
    }

    .webmention-text {
      display: inline;
    }

    /* Responsive design for webmentions modal */
    @media (max-width: 640px) {
      .webmentions-modal-dialog {
        max-height: 95vh !important;
      }

      .webmentions-modal-content {
        padding: 1rem !important;
      }
    }
  `;
  document.head.appendChild(style);

  init();
})();
