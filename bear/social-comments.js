/**
 * Social Reactions Plugin for Bear Blog
 *
 * Displays combined engagement (likes, reposts) from Bluesky, Mastodon, and BearBlog.
 * Provides simple reply buttons - no comment display (keep it clean!).
 *
 * Usage:
 * <script src="https://flschr.github.io/bearblog-plugins/social-comments.js"
 *         data-email="you@email.com"
 *         data-mastodon="@you@mastodon.social"
 *         data-lang="de"
 *         defer></script>
 *
 * Options:
 *   data-email           - Email for mail replies (required)
 *   data-mastodon        - Mastodon handle for replies, e.g. "@user@instance.social"
 *   data-lang            - Language: "en" or "de" (default: "en")
 *   data-mappings-url    - Custom URL for mappings.json
 *   data-like="Text|LikedText" - Custom like button texts
 *
 * License: WTFPL v2
 */
(function() {
  'use strict';

  const scriptTag = document.currentScript;
  const email = scriptTag?.dataset.email;
  const mastodonHandle = scriptTag?.dataset.mastodon;
  const lang = scriptTag?.dataset.lang || 'en';
  const mappingsUrl = scriptTag?.dataset.mappingsUrl ||
    'https://raw.githubusercontent.com/flschr/bearblog-automation/main/mappings.json';

  const showLikeButton = scriptTag?.dataset.like !== undefined;
  const likeTexts = scriptTag?.dataset.like?.split('|') || [];

  // Translations
  const translations = {
    de: {
      mail: 'Per Mail antworten',
      mastodon: 'Auf Mastodon antworten',
      bluesky: 'Auf Bluesky antworten',
      like: 'Gefällt mir',
      liked: 'Gefällt mir',
      reactions: 'Reaktionen',
      modalTitle: 'Deine Mastodon-Instanz',
      modalPlaceholder: 'z.B. mastodon.social',
      modalCancel: 'Abbrechen',
      modalOpen: 'Öffnen'
    },
    en: {
      mail: 'Reply by Mail',
      mastodon: 'Reply on Mastodon',
      bluesky: 'Reply on Bluesky',
      like: 'Like this post',
      liked: 'Liked',
      reactions: 'reactions',
      modalTitle: 'Your Mastodon instance',
      modalPlaceholder: 'e.g., mastodon.social',
      modalCancel: 'Cancel',
      modalOpen: 'Open'
    }
  };

  const t = translations[lang] || translations.en;

  // Override like texts if custom values provided
  if (likeTexts[0]) t.like = likeTexts[0].trim();
  if (likeTexts[1]) t.liked = likeTexts[1].trim();

  // State
  let socialMappingsCache = null;
  let modal = null;
  let modalInput = null;

  // ─── Social Mappings ─────────────────────────────────────────────────────────

  async function fetchSocialMappings() {
    if (socialMappingsCache) return socialMappingsCache;

    try {
      const response = await fetch(mappingsUrl);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      socialMappingsCache = await response.json();
      return socialMappingsCache;
    } catch (e) {
      console.warn('Failed to fetch social mappings:', e);
      return {};
    }
  }

  function normalizeUrl(url) {
    return url
      .replace(/[?#].*$/, '')
      .replace(/\/$/, '')
      .replace(/^https?:\/\//, '')
      .replace(/^www\./, '');
  }

  async function findSocialUrls() {
    // 1. Check meta tags first
    const blueskyMeta = document.querySelector('meta[name="bsky-post"]');
    const mastodonMeta = document.querySelector('meta[name="mastodon-post"]');

    let blueskyUrl = blueskyMeta?.content || null;
    let mastodonUrl = mastodonMeta?.content || null;

    if (blueskyUrl && mastodonUrl) {
      return { bluesky: blueskyUrl, mastodon: mastodonUrl };
    }

    // 2. Check HTML comments
    const articleContent = document.querySelector('.blog-content, article, .post-content, main');
    if (articleContent) {
      const htmlContent = articleContent.innerHTML;
      if (!mastodonUrl) {
        const mastodonMatch = htmlContent.match(/<!--\s*mastodon:\s*([^\s]+)\s*-->/i);
        if (mastodonMatch) mastodonUrl = mastodonMatch[1].trim();
      }
      if (!blueskyUrl) {
        const blueskyMatch = htmlContent.match(/<!--\s*bluesky:\s*([^\s]+)\s*-->/i);
        if (blueskyMatch) blueskyUrl = blueskyMatch[1].trim();
      }
    }

    // 3. Check mappings.json
    try {
      const mappings = await fetchSocialMappings();
      const currentUrl = normalizeUrl(window.location.href);

      for (const [articleUrl, data] of Object.entries(mappings)) {
        if (normalizeUrl(articleUrl) === currentUrl) {
          if (!blueskyUrl && data.bluesky) blueskyUrl = data.bluesky;
          if (!mastodonUrl && data.mastodon) mastodonUrl = data.mastodon;
          break;
        }
      }
    } catch (e) {
      console.warn('Error checking social mappings:', e);
    }

    return { bluesky: blueskyUrl, mastodon: mastodonUrl };
  }

  // ─── API Functions ───────────────────────────────────────────────────────────

  function parseBlueskyUrl(url) {
    const match = url.match(/bsky\.app\/profile\/([^\/]+)\/post\/([^\/\?]+)/);
    if (!match) return null;
    return { handle: match[1], postId: match[2] };
  }

  async function resolveBlueskyDid(handle) {
    if (handle.startsWith('did:')) return handle;
    try {
      const response = await fetch(
        `https://public.api.bsky.app/xrpc/com.atproto.identity.resolveHandle?handle=${encodeURIComponent(handle)}`
      );
      if (!response.ok) throw new Error('Failed to resolve handle');
      const data = await response.json();
      return data.did;
    } catch (e) {
      return null;
    }
  }

  async function fetchBlueskyEngagement(url) {
    const parsed = parseBlueskyUrl(url);
    if (!parsed) return null;

    const did = await resolveBlueskyDid(parsed.handle);
    if (!did) return null;

    const atUri = `at://${did}/app.bsky.feed.post/${parsed.postId}`;

    try {
      const response = await fetch(
        `https://public.api.bsky.app/xrpc/app.bsky.feed.getPostThread?uri=${encodeURIComponent(atUri)}&depth=0`
      );
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      const post = data.thread?.post;
      return post ? {
        likes: post.likeCount || 0,
        reposts: post.repostCount || 0,
        replies: post.replyCount || 0
      } : null;
    } catch (e) {
      console.warn('Failed to fetch Bluesky engagement:', e);
      return null;
    }
  }

  function parseMastodonUrl(url) {
    try {
      const urlObj = new URL(url);
      const instance = urlObj.origin;
      let match = urlObj.pathname.match(/^\/@[^\/]+\/(\d+)$/);
      if (match) return { instance, statusId: match[1] };
      match = urlObj.pathname.match(/^\/users\/[^\/]+\/statuses\/(\d+)$/);
      if (match) return { instance, statusId: match[1] };
      return null;
    } catch (e) {
      return null;
    }
  }

  async function fetchMastodonEngagement(url) {
    const parsed = parseMastodonUrl(url);
    if (!parsed) return null;

    try {
      const response = await fetch(`${parsed.instance}/api/v1/statuses/${parsed.statusId}`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      return {
        likes: data.favourites_count || 0,
        reposts: data.reblogs_count || 0,
        replies: data.replies_count || 0
      };
    } catch (e) {
      console.warn('Failed to fetch Mastodon engagement:', e);
      return null;
    }
  }

  // ─── BearBlog Integration ────────────────────────────────────────────────────

  async function fetchBearBlogUpvote() {
    const uidInput = document.querySelector('#upvote-form input[name="uid"]') ||
                     document.querySelector('#upvote-form input[type="hidden"]');
    let uid = uidInput?.value;

    if (!uid) {
      const upvoteForm = document.querySelector('#upvote-form');
      if (upvoteForm?.action) {
        const match = upvoteForm.action.match(/\/upvote\/([^\/]+)/);
        if (match) uid = match[1];
      }
    }

    if (!uid) {
      const canonical = document.querySelector('link[rel="canonical"]');
      const pageUrl = canonical?.href || window.location.href;
      const match = pageUrl.match(/\/([^\/]+)\/?$/);
      if (match && match[1] && !match[1].includes('.')) uid = match[1];
    }

    if (!uid) return null;

    try {
      const response = await fetch(`/upvote-info/${uid}/`);
      if (!response.ok) return null;
      const data = await response.json();
      return {
        count: data.upvote_count || 0,
        isUpvoted: data.upvoted || false
      };
    } catch (e) {
      return null;
    }
  }

  function getUpvoteButton() {
    const container = document.querySelector('#upvote-form, .upvote-container, .upvote');
    return container?.querySelector('.upvote-button, button, [type="submit"]') || container;
  }

  // ─── UI Helpers ──────────────────────────────────────────────────────────────

  function isDarkMode() {
    const bgColor = getComputedStyle(document.body).backgroundColor;
    const match = bgColor.match(/\d+/g);
    if (match) {
      const [r, g, b] = match.map(Number);
      return (r * 299 + g * 587 + b * 114) / 1000 < 128;
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }

  function stripBlogName(title) {
    const idx = title.lastIndexOf('|');
    return idx === -1 ? title : title.substring(0, idx).trim();
  }

  // ─── Modal for Mastodon Instance ─────────────────────────────────────────────

  function createModal() {
    const dark = isDarkMode();
    modal = document.createElement('div');
    modal.id = 'mastodon-modal';
    modal.style.cssText = 'display:none;position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.5);z-index:10000;align-items:center;justify-content:center;';

    const dialog = document.createElement('div');
    dialog.style.cssText = `background:${dark ? '#1e1e1e' : '#fff'};color:${dark ? '#e0e0e0' : '#333'};padding:1.5rem;border-radius:8px;max-width:320px;width:90%;box-shadow:0 4px 20px rgba(0,0,0,${dark ? '0.4' : '0.15'});`;

    const label = document.createElement('label');
    label.textContent = t.modalTitle;
    label.style.cssText = 'display:block;margin-bottom:0.5rem;font-weight:bold;';

    modalInput = document.createElement('input');
    modalInput.type = 'text';
    modalInput.placeholder = t.modalPlaceholder;
    modalInput.style.cssText = `width:100%;padding:0.5rem;border:1px solid ${dark ? '#444' : '#ccc'};border-radius:4px;font-size:1rem;box-sizing:border-box;margin-bottom:1rem;background:${dark ? '#2a2a2a' : '#fff'};color:${dark ? '#e0e0e0' : '#333'};`;

    const buttons = document.createElement('div');
    buttons.style.cssText = 'display:flex;gap:0.5rem;justify-content:flex-end;';

    const cancelBtn = document.createElement('button');
    cancelBtn.textContent = t.modalCancel;
    cancelBtn.type = 'button';
    cancelBtn.style.cssText = `padding:0.5rem 1rem;border:1px solid ${dark ? '#444' : '#ccc'};background:transparent;border-radius:4px;cursor:pointer;color:${dark ? '#e0e0e0' : '#333'};`;
    cancelBtn.addEventListener('click', closeModal);

    const submitBtn = document.createElement('button');
    submitBtn.textContent = t.modalOpen;
    submitBtn.type = 'button';
    submitBtn.style.cssText = 'padding:0.5rem 1rem;border:none;background:#6364ff;color:#fff;border-radius:4px;cursor:pointer;';
    submitBtn.addEventListener('click', handleModalSubmit);

    buttons.appendChild(cancelBtn);
    buttons.appendChild(submitBtn);
    dialog.appendChild(label);
    dialog.appendChild(modalInput);
    dialog.appendChild(buttons);
    modal.appendChild(dialog);

    modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });
    modalInput.addEventListener('keydown', e => {
      if (e.key === 'Enter') { e.preventDefault(); handleModalSubmit(); }
      else if (e.key === 'Escape') closeModal();
    });

    document.body.appendChild(modal);
  }

  function openModal() {
    if (!modal) createModal();
    modalInput.value = localStorage.getItem('mastodon_instance') || '';
    modal.style.display = 'flex';
    modalInput.focus();
    modalInput.select();
  }

  function closeModal() {
    if (modal) modal.style.display = 'none';
  }

  let storedMastodonUrl = null;

  async function handleModalSubmit() {
    let instance = modalInput.value.trim();
    if (!instance) return;

    instance = instance.replace(/^https?:\/\//, '').replace(/\/$/, '');
    localStorage.setItem('mastodon_instance', instance);
    closeModal();

    let shareUrl;
    if (storedMastodonUrl) {
      shareUrl = `https://${instance}/authorize_interaction?uri=${encodeURIComponent(storedMastodonUrl)}`;
    } else {
      const url = window.location.href;
      const title = stripBlogName(document.title);
      const text = `${mastodonHandle} Re: ${title} ${url}`;
      shareUrl = `https://${instance}/share?text=${encodeURIComponent(text)}`;
    }
    window.open(shareUrl, '_blank');
  }

  // ─── Styles ──────────────────────────────────────────────────────────────────

  function injectStyles() {
    if (document.getElementById('social-reactions-styles')) return;

    const dark = isDarkMode();
    const style = document.createElement('style');
    style.id = 'social-reactions-styles';
    style.textContent = `
      .social-reactions-wrapper {
        margin: 1.5rem 0;
      }

      .social-reactions-stats {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        margin-bottom: 0.75rem;
        font-size: 0.9rem;
        color: ${dark ? '#a89984' : '#666'};
      }

      .social-reactions-count {
        display: flex;
        align-items: center;
        gap: 0.35rem;
        font-weight: 500;
      }

      .social-reactions-platforms {
        display: flex;
        align-items: center;
        gap: 0.25rem;
        font-size: 0.8rem;
        opacity: 0.7;
      }

      .social-reactions-buttons {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
      }

      .social-reactions-button {
        display: inline-flex;
        align-items: center;
        gap: 0.35rem;
        padding: 0.5rem 1rem;
        font-size: 0.9rem;
        font-family: inherit;
        font-weight: 500;
        border: 1px solid ${dark ? '#504945' : '#ddd'};
        border-radius: 6px;
        background: ${dark ? '#282828' : '#fafafa'};
        color: ${dark ? '#ebdbb2' : '#333'};
        cursor: pointer;
        transition: all 0.15s ease;
      }

      .social-reactions-button:hover:not(:disabled) {
        background: ${dark ? '#3c3836' : '#f0f0f0'};
        border-color: ${dark ? '#665c54' : '#bbb'};
      }

      .social-reactions-button:disabled {
        cursor: default;
        opacity: 0.7;
      }

      .social-reactions-button.liked {
        background: ${dark ? 'rgba(251, 73, 52, 0.15)' : '#fff0f0'};
        border-color: ${dark ? '#fb4934' : '#ffcdd2'};
        color: ${dark ? '#fb4934' : '#c62828'};
      }

      .social-reactions-button-like:hover:not(:disabled):not(.liked) {
        color: ${dark ? '#fb4934' : '#c62828'};
      }

      .social-reactions-button-mail:hover {
        color: ${dark ? '#83a598' : '#1565c0'};
      }

      .social-reactions-button-mastodon:hover {
        color: ${dark ? '#b39ddb' : '#6a1b9a'};
      }

      .social-reactions-button-bluesky:hover {
        color: ${dark ? '#64b5f6' : '#1565c0'};
      }
    `;
    document.head.appendChild(style);
  }

  // ─── Main ────────────────────────────────────────────────────────────────────

  async function init() {
    if (!document.body.classList.contains('post')) return;

    if (!email) {
      console.warn('Social Reactions: No email configured. Add data-email="your@email.com"');
      return;
    }

    injectStyles();

    // Fetch all data in parallel
    const [socialUrls, bearBlogData] = await Promise.all([
      findSocialUrls(),
      fetchBearBlogUpvote()
    ]);

    const { bluesky: blueskyUrl, mastodon: mastodonUrl } = socialUrls;
    storedMastodonUrl = mastodonUrl;

    // Fetch engagement from social platforms
    const [blueskyEngagement, mastodonEngagement] = await Promise.all([
      blueskyUrl ? fetchBlueskyEngagement(blueskyUrl) : null,
      mastodonUrl ? fetchMastodonEngagement(mastodonUrl) : null
    ]);

    // Calculate totals
    const totalLikes = (blueskyEngagement?.likes || 0) +
                       (mastodonEngagement?.likes || 0) +
                       (bearBlogData?.count || 0);
    const totalReposts = (blueskyEngagement?.reposts || 0) +
                         (mastodonEngagement?.reposts || 0);

    // Find where to insert
    const upvoteContainer = document.querySelector('#upvote-form, .upvote-container, .upvote');
    const upvoteButton = getUpvoteButton();

    // Create wrapper
    const wrapper = document.createElement('div');
    wrapper.className = 'social-reactions-wrapper';

    // Stats line (only if we have social platform data)
    if (blueskyEngagement || mastodonEngagement || totalLikes > 0) {
      const stats = document.createElement('div');
      stats.className = 'social-reactions-stats';

      const count = document.createElement('span');
      count.className = 'social-reactions-count';
      count.innerHTML = `❤️ <span class="social-reactions-total">${totalLikes}</span> ${t.reactions}`;
      if (totalReposts > 0) {
        count.innerHTML += ` · 🔁 ${totalReposts}`;
      }
      stats.appendChild(count);

      // Platform indicators
      const platforms = document.createElement('span');
      platforms.className = 'social-reactions-platforms';
      const icons = [];
      if (blueskyEngagement) icons.push('🦋');
      if (mastodonEngagement) icons.push('🐘');
      if (bearBlogData) icons.push('🐻');
      platforms.textContent = icons.join(' ');
      stats.appendChild(platforms);

      wrapper.appendChild(stats);
    }

    // Buttons container
    const buttons = document.createElement('div');
    buttons.className = 'social-reactions-buttons';

    // Like button
    if (showLikeButton && upvoteButton) {
      const likeBtn = document.createElement('button');
      likeBtn.className = 'social-reactions-button social-reactions-button-like';
      likeBtn.type = 'button';

      const isLiked = bearBlogData?.isUpvoted ||
                      upvoteButton.classList.contains('upvoted') ||
                      upvoteButton.disabled;

      if (isLiked) {
        likeBtn.classList.add('liked');
        likeBtn.textContent = `❤️ ${t.liked}`;
        likeBtn.disabled = true;
      } else {
        likeBtn.textContent = `🤍 ${t.like}`;
      }

      likeBtn.addEventListener('click', async function() {
        upvoteButton.click();

        // Optimistic update
        likeBtn.classList.add('liked');
        likeBtn.textContent = `❤️ ${t.liked}`;
        likeBtn.disabled = true;

        // Update total count
        const totalEl = wrapper.querySelector('.social-reactions-total');
        if (totalEl) {
          totalEl.textContent = parseInt(totalEl.textContent) + 1;
        }
      });

      buttons.appendChild(likeBtn);
    }

    // Mail button
    const mailBtn = document.createElement('button');
    mailBtn.className = 'social-reactions-button social-reactions-button-mail';
    mailBtn.type = 'button';
    mailBtn.textContent = `✉️ ${t.mail}`;
    mailBtn.addEventListener('click', () => {
      const title = stripBlogName(document.title);
      window.location.href = `mailto:${email}?subject=Re: ${encodeURIComponent(title)}`;
    });
    buttons.appendChild(mailBtn);

    // Mastodon button
    if (mastodonHandle) {
      const mastoBtn = document.createElement('button');
      mastoBtn.className = 'social-reactions-button social-reactions-button-mastodon';
      mastoBtn.type = 'button';
      mastoBtn.textContent = `🐘 ${t.mastodon}`;
      mastoBtn.addEventListener('click', e => {
        e.preventDefault();
        openModal();
      });
      buttons.appendChild(mastoBtn);
    }

    // Bluesky button (direct link if available)
    if (blueskyUrl) {
      const bskyBtn = document.createElement('button');
      bskyBtn.className = 'social-reactions-button social-reactions-button-bluesky';
      bskyBtn.type = 'button';
      bskyBtn.textContent = `🦋 ${t.bluesky}`;
      bskyBtn.addEventListener('click', () => {
        window.open(blueskyUrl, '_blank');
      });
      buttons.appendChild(bskyBtn);
    }

    wrapper.appendChild(buttons);

    // Insert into page
    if (upvoteContainer) {
      upvoteContainer.parentNode.insertBefore(wrapper, upvoteContainer);
      if (showLikeButton) {
        upvoteContainer.style.display = 'none';
      }
    } else {
      const content = document.querySelector('.blog-content, article, .post-content, main');
      if (content) {
        content.appendChild(wrapper);
      }
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
