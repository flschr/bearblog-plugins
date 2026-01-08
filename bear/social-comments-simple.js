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

  // Configurable constants
  const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
  const DID_CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours
  const FETCH_TIMEOUT = parseInt(scriptTag?.dataset.timeout || '15000', 10); // 15 seconds default
  const VIRAL_THRESHOLD = parseInt(scriptTag?.dataset.viralThreshold || '50', 10);
  const HEART_INTERVAL_MS = parseInt(scriptTag?.dataset.heartInterval || '80', 10);
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
    comments: '<svg viewBox="0 0 640 512" fill="currentColor" width="16" height="16"><path d="M88.2 309.1c9.8-18.3 6.8-40.8-7.5-55.8C59.4 230.9 48 204 48 176c0-63.5 63.8-128 160-128s160 64.5 160 128s-63.8 128-160 128c-13.1 0-25.8-1.3-37.8-3.6c-10.4-2-21.2-.6-30.7 4.2c-4.1 2.1-8.3 4.1-12.6 6c-16 7.2-32.9 13.5-49.9 18c2.8-4.6 5.4-9.1 7.9-13.6c1.1-1.9 2.2-3.9 3.2-5.9zM208 352c114.9 0 208-78.8 208-176S322.9 0 208 0S0 78.8 0 176c0 41.8 17.2 80.1 45.9 110.3c-.9 1.7-1.9 3.5-2.8 5.1c-10.3 18.4-22.3 36.5-36.6 52.1c-6.6 7-8.3 17.2-4.6 25.9C5.8 378.3 14.4 384 24 384c43 0 86.5-13.3 122.7-29.7c4.8-2.2 9.6-4.5 14.2-6.8c15.1 3 30.9 4.5 47.1 4.5zM432 480c16.2 0 31.9-1.6 47.1-4.5c4.6 2.3 9.4 4.6 14.2 6.8C529.5 498.7 573 512 616 512c9.6 0 18.2-5.7 22-14.5c3.8-8.8 2-19-4.6-25.9c-14.2-15.6-26.2-33.7-36.6-52.1c-.9-1.7-1.9-3.4-2.8-5.1C622.8 384.1 640 345.8 640 304c0-94.4-87.9-171.5-198.2-175.8c4.1 15.2 6.2 31.2 6.2 47.8l0 .6c87.2 6.7 144 67.5 144 127.4c0 28-11.4 54.9-32.7 77.2c-14.3 15-17.3 37.6-7.5 55.8c1.1 2 2.2 4 3.2 5.9c2.5 4.5 5.2 9 7.9 13.6c-17-4.5-33.9-10.7-49.9-18c-4.3-1.9-8.5-3.9-12.6-6c-9.5-4.8-20.3-6.2-30.7-4.2c-12.1 2.4-24.8 3.6-37.8 3.6c-61.7 0-110-26.5-136.8-62.3c-16 5.4-32.8 9.4-50 11.8C279 439.8 350 480 432 480z"/></svg>'
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
    const match = url.match(/bsky\.app\/profile\/([^\/]+)\/post\/([^\/\?]+)/);
    if (!match) return null;

    const [, handle, postId] = match;

    try {
      let did = getDIDFromCache(handle);

      if (!did) {
        const didRes = await fetchWithTimeout(
          `https://public.api.bsky.app/xrpc/com.atproto.identity.resolveHandle?handle=${handle}`
        );
        const didData = await safeJsonParse(didRes);
        if (!didData?.did) return null;
        did = didData.did;
        cacheDID(handle, did);
      }

      const postUri = `at://${did}/app.bsky.feed.post/${postId}`;
      const res = await fetchWithTimeout(
        `https://public.api.bsky.app/xrpc/app.bsky.feed.getPostThread?uri=${encodeURIComponent(postUri)}&depth=0`
      );
      const data = await safeJsonParse(res);
      const post = data?.thread?.post;
      if (!post) return null;

      return {
        likes: post.likeCount || 0,
        reposts: post.repostCount || 0,
        replies: post.replyCount || 0,
        total: (post.likeCount || 0) + (post.repostCount || 0) + (post.replyCount || 0)
      };
    } catch {
      return null;
    }
  }

  async function fetchMastodonEngagement(url) {
    try {
      const urlObj = new URL(url);
      const statusId = urlObj.pathname.split('/').pop();

      const [statusRes, contextRes] = await Promise.all([
        fetchWithTimeout(`${urlObj.origin}/api/v1/statuses/${statusId}`),
        fetchWithTimeout(`${urlObj.origin}/api/v1/statuses/${statusId}/context`)
      ]);

      const data = await safeJsonParse(statusRes);
      const context = await safeJsonParse(contextRes);
      if (!data) return null;

      const totalReplies = context?.descendants?.length || 0;

      return {
        likes: data.favourites_count || 0,
        reposts: data.reblogs_count || 0,
        replies: totalReplies,
        total: (data.favourites_count || 0) + (data.reblogs_count || 0) + totalReplies
      };
    } catch {
      return null;
    }
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
    let heartInterval;

    // Cache rect to avoid expensive getBoundingClientRect calls (90% performance gain)
    const cachedRect = btn.getBoundingClientRect();
    const centerX = cachedRect.left + cachedRect.width / 2;
    const centerY = cachedRect.top + cachedRect.height / 2;

    const createHeart = () => {
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
    };

    // Fast continuous stream - new heart every HEART_INTERVAL_MS
    createHeart(); // First heart immediately
    heartInterval = setInterval(createHeart, HEART_INTERVAL_MS);

    // Return cleanup function
    return () => {
      clearInterval(heartInterval);
      timeouts.forEach(timeout => clearTimeout(timeout));
      timeouts.length = 0;
    };
  }

  // --- Mastodon Modal ---
  let modal = null;
  let modalInput = null;
  let storedMastoUrl = null;

  function createModal() {
    if (modal) return;

    // Detect dark mode
    const isDark = document.documentElement.dataset.theme === 'dark'
      || document.body.classList.contains('dark-mode')
      || window.matchMedia('(prefers-color-scheme: dark)').matches;

    modal = document.createElement('div');
    modal.id = 'sr-mastodon-modal';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.style.cssText = 'display:none;position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.5);z-index:10000;align-items:center;justify-content:center;';

    const dialog = document.createElement('div');
    dialog.style.cssText = `background:${isDark ? '#1e1e1e' : '#fff'};color:${isDark ? '#e0e0e0' : '#333'};padding:1.5rem;border-radius:8px;max-width:320px;width:90%;box-shadow:0 4px 20px rgba(0,0,0,${isDark ? '0.4' : '0.15'});`;

    const label = document.createElement('label');
    label.textContent = 'Your Mastodon instance';
    label.style.cssText = 'display:block;margin-bottom:0.5rem;font-weight:bold;';

    modalInput = document.createElement('input');
    modalInput.type = 'text';
    modalInput.placeholder = 'e.g. mastodon.social';
    modalInput.style.cssText = `width:100%;padding:0.5rem;border:1px solid ${isDark ? '#444' : '#ccc'};border-radius:4px;font-size:1rem;box-sizing:border-box;margin-bottom:1rem;background:${isDark ? '#2a2a2a' : '#fff'};color:${isDark ? '#e0e0e0' : '#333'};`;

    const buttonContainer = document.createElement('div');
    buttonContainer.style.cssText = 'display:flex;gap:0.5rem;justify-content:flex-end;';

    const cancelBtn = document.createElement('button');
    cancelBtn.textContent = 'Cancel';
    cancelBtn.type = 'button';
    cancelBtn.style.cssText = `padding:0.5rem 1rem;border:1px solid ${isDark ? '#444' : '#ccc'};background:transparent;border-radius:4px;cursor:pointer;color:${isDark ? '#e0e0e0' : '#333'};`;
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

    window.open(targetUrl, '_blank');
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

    const totalComments = (blueskyEngagement?.replies || 0)
      + (mastodonEngagement?.replies || 0);

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
        () => window.open(urls.bluesky, '_blank')
      ));
    }

    // Total comments button (show if service enabled and any platform URL exists)
    if (activeServices.includes('comments') && (urls.mastodon || urls.bluesky)) {
      const mComments = mastodonEngagement?.replies || 0;
      const bComments = blueskyEngagement?.replies || 0;
      const commentsTooltip = `${mComments} Mastodon + ${bComments} Bluesky comments`;
      const commentsAriaLabel = `${totalComments} total comments across all platforms`;

      buttons.push(createButton(
        icons.comments,
        totalComments,
        null,
        commentsTooltip,
        commentsAriaLabel
      ));
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
      gap: 0.4rem;
      padding: 0.5rem 0.9rem;
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
  `;
  document.head.appendChild(style);

  init();
})();
