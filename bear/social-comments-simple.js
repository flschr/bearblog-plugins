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
  const showMail = scriptTag?.dataset.services?.includes('mail') || email;
  const showLike = scriptTag?.dataset.like !== undefined;

  const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
  const DID_CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours
  const FETCH_TIMEOUT = 8000; // 8 seconds

  // --- Early DOM Setup ---
  const upvoteForm = document.querySelector('#upvote-form');
  const nativeUpvoteBtn = upvoteForm?.querySelector('.upvote-button, button');
  if (upvoteForm) upvoteForm.style.display = 'none';

  // --- Icons (Emoji) ---
  const icons = {
    heart: '❤️',
    mastodon: '🐘',
    bluesky: '🦋',
    comments: '💬',
    mail: '✉️'
  };

  // --- Cache Utilities ---
  function getCached(key) {
    try {
      const item = sessionStorage.getItem(key);
      if (!item) return null;
      const { data, expires } = JSON.parse(item);
      if (Date.now() > expires) {
        sessionStorage.removeItem(key);
        return null;
      }
      return data;
    } catch {
      return null;
    }
  }

  function setCache(key, data, ttl = CACHE_TTL) {
    try {
      sessionStorage.setItem(key, JSON.stringify({
        data,
        expires: Date.now() + ttl
      }));
    } catch {
      // Storage unavailable
    }
  }

  function getDIDFromCache(handle) {
    try {
      const item = localStorage.getItem(`bsky_did_${handle}`);
      if (!item) return null;
      const { did, expires } = JSON.parse(item);
      if (Date.now() > expires) {
        localStorage.removeItem(`bsky_did_${handle}`);
        return null;
      }
      return did;
    } catch {
      return null;
    }
  }

  function cacheDID(handle, did) {
    try {
      localStorage.setItem(`bsky_did_${handle}`, JSON.stringify({
        did,
        expires: Date.now() + DID_CACHE_TTL
      }));
    } catch {
      // Storage unavailable
    }
  }

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
        total: (post.likeCount || 0) + (post.repostCount || 0) + (post.replyCount || 0),
        url: url
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
        total: (data.favourites_count || 0) + (data.reblogs_count || 0) + totalReplies,
        url: url
      };
    } catch {
      return null;
    }
  }

  // --- Create Buttons ---
  function createButton(icon, count, onClick, title) {
    const btn = document.createElement('button');
    btn.className = 'simple-reaction-button';
    btn.title = title;
    btn.innerHTML = `<span class="icon">${icon}</span><span class="count">${count}</span>`;

    if (onClick) {
      btn.onclick = onClick;
    } else {
      btn.disabled = true;
      btn.style.cursor = 'default';
    }

    return btn;
  }

  function createLikeButton(totalLikes, isLiked, nativeButton) {
    const btn = createButton(
      icons.heart,
      totalLikes,
      !isLiked ? () => {
        if (nativeButton) nativeButton.click();
        btn.querySelector('.count').textContent = totalLikes + 1;
        btn.disabled = true;
        btn.classList.add('liked');
        btn.style.cursor = 'default';
      } : null,
      isLiked ? 'You liked this' : 'Like this post'
    );

    if (isLiked) {
      btn.classList.add('liked');
      btn.disabled = true;
    }

    return btn;
  }

  // --- Mastodon Modal ---
  let modal = null;
  let modalInput = null;
  let storedMastoUrl = null;

  function createModal() {
    if (modal) return;

    modal = document.createElement('div');
    modal.id = 'sr-mastodon-modal';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.style.cssText = 'display:none;position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.5);z-index:10000;align-items:center;justify-content:center;';

    const dialog = document.createElement('div');
    dialog.style.cssText = 'background:#fff;color:#333;padding:1.5rem;border-radius:8px;max-width:320px;width:90%;box-shadow:0 4px 20px rgba(0,0,0,0.15);';

    const label = document.createElement('label');
    label.textContent = 'Your Mastodon instance';
    label.style.cssText = 'display:block;margin-bottom:0.5rem;font-weight:bold;';

    modalInput = document.createElement('input');
    modalInput.type = 'text';
    modalInput.placeholder = 'e.g. mastodon.social';
    modalInput.style.cssText = 'width:100%;padding:0.5rem;border:1px solid #ccc;border-radius:4px;font-size:1rem;box-sizing:border-box;margin-bottom:1rem;';

    const buttonContainer = document.createElement('div');
    buttonContainer.style.cssText = 'display:flex;gap:0.5rem;justify-content:flex-end;';

    const cancelBtn = document.createElement('button');
    cancelBtn.textContent = 'Cancel';
    cancelBtn.type = 'button';
    cancelBtn.style.cssText = 'padding:0.5rem 1rem;border:1px solid #ccc;background:transparent;border-radius:4px;cursor:pointer;';
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

    // Fetch all data
    const [urls, bearBlogData] = await Promise.all([
      findSocialUrls(),
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

    // Like button (if enabled)
    if (showLike && totalLikes > 0) {
      buttons.push(createLikeButton(totalLikes, isLiked, nativeUpvoteBtn));
    }

    // Mastodon button
    if (mastodonEngagement && mastodonEngagement.total > 0) {
      buttons.push(createButton(
        icons.mastodon,
        mastodonEngagement.total,
        () => showMastodonModal(urls.mastodon),
        'Discuss on Mastodon'
      ));
    }

    // Bluesky button
    if (blueskyEngagement && blueskyEngagement.total > 0) {
      buttons.push(createButton(
        icons.bluesky,
        blueskyEngagement.total,
        () => window.open(urls.bluesky, '_blank'),
        'Discuss on Bluesky'
      ));
    }

    // Total comments button (non-clickable, just info)
    if (totalComments > 0) {
      buttons.push(createButton(
        icons.comments,
        totalComments,
        null,
        'Total comments across all platforms'
      ));
    }

    // Mail button (if enabled)
    if (showMail && email) {
      buttons.push(createButton(
        icons.mail,
        '',
        () => window.location.href = `mailto:${email}?subject=Re: ${encodeURIComponent(getCleanTitle())}`,
        'Reply by mail'
      ));
    }

    // Add all buttons to container
    buttons.forEach(btn => container.appendChild(btn));

    // If no buttons, show nothing
    if (buttons.length === 0) {
      container.style.display = 'none';
    }
  }

  init();
})();
