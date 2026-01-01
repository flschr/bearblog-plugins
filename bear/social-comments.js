(function() {
  'use strict';

  // --- Early DOM Setup (prevent FOUC) ---
  const upvoteForm = document.querySelector('#upvote-form');
  if (upvoteForm) upvoteForm.style.display = 'none';

  const scriptTag = document.currentScript;
  const email = scriptTag?.dataset.email;
  const mastodonHandle = scriptTag?.dataset.mastodon || '';
  const mappingsUrl = scriptTag?.dataset.mappingsUrl || 'https://raw.githubusercontent.com/flschr/bearblog-automation/main/mappings.json';
  const likeEnabled = scriptTag?.dataset.like !== undefined;

  const customLike = scriptTag?.dataset.like?.split('|') || [];
  const customConv = scriptTag?.dataset.conv?.split('|') || [];
  const activeServices = scriptTag?.dataset.services
    ? scriptTag.dataset.services.split(',').map(s => s.trim())
    : ['bluesky', 'mastodon', 'mail'];

  const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
  const DID_CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

  const ui = {
    like: customLike[0] || 'Like this post',
    likedCount: customLike[1] || 'liked this post',
    likedCountYou: customLike[2] || 'and you liked this post',
    startConv: customConv[0] || 'Start the conversation',
    joinConvPlural: customConv[1] || 'comments, join the conversation',
    reactions: customConv[2] || 'reactions, join in',
    unmapped: customConv[3] || 'Share & Discuss',
    joinConvSingular: customConv[4] || 'comment, join the conversation',
    loading: '…',
    modalTitle: 'Your Mastodon instance',
    modalPlaceholder: 'e.g. mastodon.social',
    modalCancel: 'Cancel',
    modalOpen: 'Open',
    mail: scriptTag?.dataset.mail || 'Reply by mail'
  };

  const icons = {
    heart: '<svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>',
    heartOutline: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>',
    mail: '<svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>',
    mastodon: '<svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M23.268 5.313c-.35-2.578-2.617-4.61-5.304-5.004C17.51.242 15.792 0 11.813 0h-.03c-3.98 0-4.835.242-5.288.309C3.882.692 1.496 2.518.917 5.127.64 6.412.61 7.837.661 9.143c.074 1.874.088 3.745.26 5.611.118 1.24.325 2.47.62 3.68.55 2.237 2.777 4.098 4.96 4.857 2.336.792 4.849.923 7.256.38.265-.061.527-.132.786-.213.585-.184 1.27-.39 1.774-.753a.057.057 0 0 0 .023-.043v-1.809a.052.052 0 0 0-.02-.041.053.053 0 0 0-.046-.01 20.282 20.282 0 0 1-4.709.545c-2.73 0-3.463-1.284-3.674-1.818a5.593 5.593 0 0 1-.319-1.433.053.053 0 0 1 .066-.054c1.517.363 3.072.546 4.632.546.376 0 .75 0 1.125-.01 1.57-.044 3.224-.124 4.768-.422.038-.008.077-.015.11-.024 2.435-.464 4.753-1.92 4.989-5.604.008-.145.03-1.52.03-1.67.002-.512.167-3.63-.024-5.545zm-3.748 9.195h-2.561V8.29c0-1.309-.55-1.976-1.67-1.976-1.23 0-1.846.79-1.846 2.35v3.403h-2.546V8.663c0-1.56-.617-2.35-1.848-2.35-1.112 0-1.668.668-1.668 1.977v6.218H4.822V8.102c0-1.31.337-2.35 1.011-3.12.696-.77 1.608-1.164 2.74-1.164 1.311 0 2.302.5 2.962 1.498l.638 1.06.638-1.06c.66-.999 1.65-1.498 2.96-1.498 1.13 0 2.043.395 2.74 1.164.675.77 1.012 1.81 1.012 3.12v6.406z"/></svg>',
    bluesky: '<svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M12 10.8c-1.087-2.114-4.046-6.053-6.798-7.995C2.566.944 1.561 1.266.902 1.565.139 1.908 0 3.08 0 3.768c0 .69.378 5.65.624 6.479.815 2.736 3.713 3.66 6.383 3.364.136-.02.275-.039.415-.056-.138.022-.276.04-.415.056-3.912.58-7.387 2.005-2.83 7.078 5.013 5.19 6.87-1.113 7.823-4.308.953 3.195 2.05 9.271 7.733 4.308 4.267-4.308 1.172-6.498-2.74-7.078a8.741 8.741 0 0 1-.415-.056c.14.017.279.036.415.056 2.67.297 5.568-.628 6.383-3.364.246-.828.624-5.79.624-6.478 0-.69-.139-1.861-.902-2.206-.659-.298-1.664-.62-4.3 1.24C16.046 4.748 13.087 8.687 12 10.8z"/></svg>'
  };

  let modal = null;
  let modalInput = null;
  let storedMastoUrl = null;

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
      // Storage full or unavailable
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
      // Storage full or unavailable
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

  // --- BearBlog API ---

  async function fetchBearBlog() {
    const form = document.querySelector('#upvote-form');
    const uid = form?.querySelector('input[name="uid"]')?.value
      || form?.action?.match(/\/upvote\/([^\/]+)/)?.[1];

    if (!uid) return null;

    const cacheKey = `bearblog_${uid}`;
    const cached = getCached(cacheKey);
    if (cached) return cached;

    try {
      const res = await fetch(`/upvote-info/${uid}/`);
      const data = await res.json();
      setCache(cacheKey, data);
      return data;
    } catch {
      return null;
    }
  }

  // --- Social URL Discovery ---

  async function findSocialUrls() {
    const metaBluesky = document.querySelector('meta[name="bsky-post"]')?.content || null;
    const metaMastodon = document.querySelector('meta[name="mastodon-post"]')?.content || null;

    // If both meta tags exist, skip mappings fetch entirely
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
      const res = await fetch(mappingsUrl);
      const mappings = await res.json();
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
      // Try to get DID from cache first
      let did = getDIDFromCache(handle);

      if (!did) {
        const didRes = await fetch(
          `https://public.api.bsky.app/xrpc/com.atproto.identity.resolveHandle?handle=${handle}`
        );
        const didData = await didRes.json();
        did = didData.did;
        cacheDID(handle, did);
      }

      const postUri = `at://${did}/app.bsky.feed.post/${postId}`;
      const res = await fetch(
        `https://public.api.bsky.app/xrpc/app.bsky.feed.getPostThread?uri=${encodeURIComponent(postUri)}&depth=0`
      );
      const { thread } = await res.json();
      const post = thread.post;

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

      const res = await fetch(`${urlObj.origin}/api/v1/statuses/${statusId}`);
      const data = await res.json();

      return {
        likes: data.favourites_count || 0,
        reposts: data.reblogs_count || 0,
        replies: data.replies_count || 0,
        total: (data.favourites_count || 0) + (data.reblogs_count || 0) + (data.replies_count || 0)
      };
    } catch {
      return null;
    }
  }

  // --- UI Helper Functions ---

  function buildButtonInner(icon, count, text) {
    const countHtml = count > 0 ? `<span class="sr-count">${count}</span>` : '';
    return `<span class="sr-icon">${icon}</span>${countHtml}<span class="sr-text">${text}</span>`;
  }

  function getButtonText(engagement, hasUrl) {
    if (!hasUrl) return ui.unmapped;
    if (!engagement) return ui.startConv;

    const total = (engagement.likes || 0) + (engagement.reposts || 0) + (engagement.replies || 0);
    if (total === 0) return ui.startConv;

    if (engagement.replies > 0) {
      return engagement.replies === 1 ? ui.joinConvSingular : ui.joinConvPlural;
    }
    return ui.reactions;
  }

  function getButtonCount(engagement, hasUrl) {
    if (!hasUrl || !engagement || engagement.total <= 0) return 0;
    return engagement.replies > 0 ? engagement.replies : engagement.total;
  }

  // --- Modal ---

  function createModal() {
    if (modal) return;

    modal = document.createElement('div');
    modal.className = 'sr-modal-overlay';
    modal.innerHTML = `
      <div class="sr-modal-content">
        <label class="sr-modal-label">${ui.modalTitle}</label>
        <input type="text" class="sr-modal-input" placeholder="${ui.modalPlaceholder}">
        <div class="sr-modal-buttons">
          <button class="sr-modal-cancel">${ui.modalCancel}</button>
          <button class="sr-modal-submit">${ui.modalOpen}</button>
        </div>
      </div>`;

    document.body.appendChild(modal);
    modalInput = modal.querySelector('.sr-modal-input');

    modal.querySelector('.sr-modal-cancel').onclick = () => {
      modal.classList.remove('sr-modal-visible');
    };

    modal.querySelector('.sr-modal-submit').onclick = handleMastodonSubmit;

    modalInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') handleMastodonSubmit();
      if (e.key === 'Escape') modal.classList.remove('sr-modal-visible');
    });

    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.classList.remove('sr-modal-visible');
    });
  }

  function handleMastodonSubmit() {
    const instance = modalInput.value.trim()
      .replace(/^https?:\/\//, '')
      .replace(/\/$/, '');

    if (!instance) return;

    localStorage.setItem('mastodon_instance', instance);
    modal.classList.remove('sr-modal-visible');

    let targetUrl;
    if (storedMastoUrl) {
      targetUrl = `https://${instance}/authorize_interaction?uri=${encodeURIComponent(storedMastoUrl)}`;
    } else {
      const shareText = mastodonHandle
        ? `${mastodonHandle} Re: ${document.title} ${window.location.href}`
        : `Re: ${document.title} ${window.location.href}`;
      targetUrl = `https://${instance}/share?text=${encodeURIComponent(shareText)}`;
    }

    window.open(targetUrl, '_blank');
  }

  function showMastodonModal(mastodonUrl) {
    storedMastoUrl = mastodonUrl;
    createModal();
    modal.classList.add('sr-modal-visible');
    modalInput.value = localStorage.getItem('mastodon_instance') || '';
    modalInput.focus();
  }

  // --- Button State Management ---

  const buttonRefs = {
    like: null,
    bluesky: null,
    mastodon: null
  };

  function updateLikeButton(engagement, bearBlogData, nativeButton) {
    const btn = buttonRefs.like;
    if (!btn) return;

    const totalLikes = (engagement?.bluesky?.likes || 0)
      + (engagement?.mastodon?.likes || 0)
      + (bearBlogData?.upvote_count || 0);

    const isLiked = bearBlogData?.upvoted || nativeButton?.disabled;

    // Store total likes for onclick handler
    btn.dataset.totalLikes = totalLikes;

    btn.classList.toggle('liked', isLiked);
    btn.disabled = isLiked;

    const icon = isLiked ? icons.heart : icons.heartOutline;

    // Show count-based text: "X liked this post" or "X and you liked this post"
    if (totalLikes > 0) {
      const label = isLiked ? ui.likedCountYou : ui.likedCount;
      btn.innerHTML = buildButtonInner(icon, totalLikes, label);
    } else {
      // No likes yet - show "Like this post" without count
      btn.innerHTML = buildButtonInner(icon, 0, ui.like);
    }
  }

  function updateBlueskyButton(engagement, url) {
    const btn = buttonRefs.bluesky;
    if (!btn) return;

    btn.innerHTML = buildButtonInner(
      icons.bluesky,
      getButtonCount(engagement, url),
      getButtonText(engagement, url)
    );
  }

  function updateMastodonButton(engagement, url) {
    const btn = buttonRefs.mastodon;
    if (!btn) return;

    btn.innerHTML = buildButtonInner(
      icons.mastodon,
      getButtonCount(engagement, url),
      getButtonText(engagement, url)
    );
  }

  // --- Button Creators (instant, no data) ---

  function createLikeButton(nativeButton) {
    const btn = document.createElement('button');
    btn.className = 'social-reactions-button sr-button-like';
    btn.innerHTML = buildButtonInner(icons.heartOutline, 0, ui.loading);

    btn.onclick = () => {
      if (nativeButton) nativeButton.click();
      // Get current count and increment by 1
      const currentLikes = parseInt(btn.dataset.totalLikes || '0', 10);
      const newLikes = currentLikes + 1;
      btn.dataset.totalLikes = newLikes;
      // Update to "X and you liked this post"
      btn.innerHTML = buildButtonInner(icons.heart, newLikes, ui.likedCountYou);
      btn.classList.add('liked');
      btn.disabled = true;
    };

    buttonRefs.like = btn;
    return btn;
  }

  function createBlueskyButton() {
    const btn = document.createElement('button');
    btn.className = 'social-reactions-button sr-button-bluesky';
    btn.innerHTML = buildButtonInner(icons.bluesky, 0, ui.loading);

    btn.onclick = () => {
      const url = btn.dataset.url;
      if (url) {
        window.open(url, '_blank');
      } else {
        const shareText = `Re: ${document.title} ${window.location.href}`;
        window.open(`https://bsky.app/intent/compose?text=${encodeURIComponent(shareText)}`, '_blank');
      }
    };

    buttonRefs.bluesky = btn;
    return btn;
  }

  function createMastodonButton() {
    const btn = document.createElement('button');
    btn.className = 'social-reactions-button sr-button-mastodon';
    btn.innerHTML = buildButtonInner(icons.mastodon, 0, ui.loading);

    btn.onclick = () => showMastodonModal(btn.dataset.url || null);

    buttonRefs.mastodon = btn;
    return btn;
  }

  function createMailButton() {
    const btn = document.createElement('button');
    btn.className = 'social-reactions-button sr-button-mail';
    btn.innerHTML = buildButtonInner(icons.mail, 0, ui.mail);

    btn.onclick = () => {
      window.location.href = `mailto:${email}?subject=Re: ${encodeURIComponent(document.title)}`;
    };

    return btn;
  }

  // --- Main Init ---

  async function init() {
    if (!document.body.classList.contains('post') || !email) {
      // Show native button again if we're not on a post page
      if (upvoteForm) upvoteForm.style.display = '';
      return;
    }

    // Phase 1: Instant UI (no network calls yet)
    const btnContainer = document.createElement('div');
    btnContainer.className = 'social-reactions-buttons';

    const nativeUpvoteBtn = document.querySelector('#upvote-form .upvote-button, #upvote-form button');

    if (likeEnabled && nativeUpvoteBtn) {
      btnContainer.appendChild(createLikeButton(nativeUpvoteBtn));
    }

    if (activeServices.includes('bluesky')) {
      btnContainer.appendChild(createBlueskyButton());
    }

    if (activeServices.includes('mastodon')) {
      btnContainer.appendChild(createMastodonButton());
    }

    if (activeServices.includes('mail')) {
      btnContainer.appendChild(createMailButton());
    }

    const wrapper = document.createElement('div');
    wrapper.className = 'social-reactions-wrapper';
    wrapper.appendChild(btnContainer);

    const target = upvoteForm || document.querySelector('.blog-content');
    if (target) {
      target.parentNode.insertBefore(wrapper, target);
    }

    // Phase 2: Load data and update buttons
    const needsBluesky = activeServices.includes('bluesky') || likeEnabled;
    const needsMastodon = activeServices.includes('mastodon') || likeEnabled;
    const needsBearBlog = likeEnabled;

    const [urls, bearBlogData] = await Promise.all([
      (needsBluesky || needsMastodon) ? findSocialUrls() : { bluesky: null, mastodon: null },
      needsBearBlog ? fetchBearBlog() : null
    ]);

    // Store URLs in button data attributes for click handlers
    if (buttonRefs.bluesky && urls.bluesky) {
      buttonRefs.bluesky.dataset.url = urls.bluesky;
    }
    if (buttonRefs.mastodon && urls.mastodon) {
      buttonRefs.mastodon.dataset.url = urls.mastodon;
    }

    // Fetch engagement data only for services that need it
    const [blueskyEngagement, mastodonEngagement] = await Promise.all([
      (needsBluesky && urls.bluesky) ? fetchBlueskyEngagement(urls.bluesky) : null,
      (needsMastodon && urls.mastodon) ? fetchMastodonEngagement(urls.mastodon) : null
    ]);

    const engagement = {
      bluesky: blueskyEngagement,
      mastodon: mastodonEngagement
    };

    // Phase 3: Update buttons with real data
    if (likeEnabled) {
      updateLikeButton(engagement, bearBlogData, nativeUpvoteBtn);
    }

    if (activeServices.includes('bluesky')) {
      updateBlueskyButton(blueskyEngagement, urls.bluesky);
    }

    if (activeServices.includes('mastodon')) {
      updateMastodonButton(mastodonEngagement, urls.mastodon);
    }
  }

  init();
})();
