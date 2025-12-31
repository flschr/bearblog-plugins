/**
 * Social Comments Plugin for Bear Blog
 *
 * Displays comments from Bluesky and/or Mastodon on your blog posts.
 * No React dependency - pure vanilla JavaScript!
 *
 * Usage:
 * 1. Add meta tags to your blog post (optional if using mappings.json):
 *    <meta name="bsky-post" content="https://bsky.app/profile/you.bsky.social/post/abc123">
 *    <meta name="mastodon-post" content="https://mastodon.social/@you/123456789">
 *
 * 2. Or use automatic lookup via mappings.json from bearblog-automation
 *
 * 3. Include the script in your footer:
 *    <script src="https://flschr.github.io/bearblog-plugins/social-comments.js" defer></script>
 *    <div id="social-comments"></div>
 *
 * Options (via data attributes on script tag):
 *   data-container="custom-id"     - Custom container ID (default: "social-comments")
 *   data-lang="de"                 - Language: "en" or "de" (default: "en")
 *   data-bluesky-only              - Only show Bluesky comments
 *   data-mastodon-only             - Only show Mastodon comments
 *   data-no-styles                 - Disable built-in styles
 *   data-theme="dark"              - Force dark/light theme (default: auto-detect)
 *   data-mappings-url="..."        - Custom mappings.json URL
 *
 * License: WTFPL v2
 */
(function() {
  'use strict';

  const scriptTag = document.currentScript;
  const containerId = scriptTag?.dataset.container || 'social-comments';
  const lang = scriptTag?.dataset.lang || 'en';
  const blueskyOnly = scriptTag?.dataset.blueskyOnly !== undefined;
  const mastodonOnly = scriptTag?.dataset.mastodonOnly !== undefined;
  const noStyles = scriptTag?.dataset.noStyles !== undefined;
  const forcedTheme = scriptTag?.dataset.theme;
  const mappingsUrl = scriptTag?.dataset.mappingsUrl ||
    'https://raw.githubusercontent.com/flschr/bearblog-automation/main/mappings.json';

  // Cache for social media mappings
  let socialMappingsCache = null;
  let socialMappingsPromise = null;

  // Translations
  const translations = {
    en: {
      comments: 'Comments',
      noComments: 'No comments yet.',
      disabled: 'Comments are disabled for this post.',
      failed: 'Failed to load comments.',
      joinBluesky: 'Reply on Bluesky',
      joinMastodon: 'Reply on Mastodon',
      via: 'via',
      loading: 'Loading comments...',
      showMore: 'Show more replies',
      likes: 'likes',
      reposts: 'reposts',
      replies: 'replies',
      likePost: 'Click to like this post'
    },
    de: {
      comments: 'Kommentare',
      noComments: 'Noch keine Kommentare.',
      disabled: 'Kommentare sind für diesen Beitrag deaktiviert.',
      failed: 'Kommentare konnten nicht geladen werden.',
      joinBluesky: 'Auf Bluesky antworten',
      joinMastodon: 'Auf Mastodon antworten',
      via: 'via',
      loading: 'Lade Kommentare...',
      showMore: 'Weitere Antworten anzeigen',
      likes: 'Likes',
      reposts: 'Reposts',
      replies: 'Antworten',
      likePost: 'Klicken um diesen Beitrag zu liken'
    }
  };

  const t = translations[lang] || translations.en;

  // ─── Social Mappings ─────────────────────────────────────────────────────────

  async function fetchSocialMappings() {
    // Return cached data if available
    if (socialMappingsCache) {
      return socialMappingsCache;
    }

    // Return existing promise if already fetching
    if (socialMappingsPromise) {
      return socialMappingsPromise;
    }

    socialMappingsPromise = fetch(mappingsUrl)
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        socialMappingsCache = data;
        return data;
      })
      .catch(error => {
        console.warn('Failed to fetch social mappings:', error);
        return {};
      })
      .finally(() => {
        socialMappingsPromise = null;
      });

    return socialMappingsPromise;
  }

  function normalizeUrl(url) {
    // Remove query string and hash, normalize trailing slash, http/https, and www
    return url
      .replace(/[?#].*$/, '')      // Remove query string and hash
      .replace(/\/$/, '')          // Remove trailing slash
      .replace(/^https?:\/\//, '') // Remove protocol
      .replace(/^www\./, '');      // Remove www prefix
  }

  async function findSocialUrls() {
    // 1. Check for meta tags first (highest priority)
    const blueskyMeta = document.querySelector('meta[name="bsky-post"]');
    const mastodonMeta = document.querySelector('meta[name="mastodon-post"]');

    let blueskyUrl = blueskyMeta?.content || null;
    let mastodonUrl = mastodonMeta?.content || null;

    // If both are found via meta tags, return immediately
    if (blueskyUrl && mastodonUrl) {
      return { bluesky: blueskyUrl, mastodon: mastodonUrl };
    }

    // 2. Check mappings.json for missing URLs
    try {
      const mappings = await fetchSocialMappings();
      const currentUrl = normalizeUrl(window.location.href);

      // Try to find mapping for current URL
      let mapping = null;

      // Try exact match (normalized)
      for (const [articleUrl, data] of Object.entries(mappings)) {
        if (normalizeUrl(articleUrl) === currentUrl) {
          mapping = data;
          break;
        }
      }

      if (mapping) {
        // Fill in missing URLs from mapping
        if (!blueskyUrl && mapping.bluesky) {
          blueskyUrl = mapping.bluesky;
        }
        if (!mastodonUrl && mapping.mastodon) {
          mastodonUrl = mapping.mastodon;
        }
      }
    } catch (e) {
      console.warn('Error checking social mappings:', e);
    }

    return { bluesky: blueskyUrl, mastodon: mastodonUrl };
  }

  // ─── BearBlog Upvote Integration ──────────────────────────────────────────────

  function getBearBlogUpvote() {
    // Find the upvote form/button (various selectors for Bear Blog)
    const upvoteContainer = document.querySelector('#upvote-form, .upvote-button, .upvote-container, .upvote');
    if (!upvoteContainer) return null;

    // Find the actual clickable button
    const upvoteButton = upvoteContainer.querySelector('button, [type="submit"], a') || upvoteContainer;

    // Try to extract the count from the button text or nearby elements
    let count = 0;
    const buttonText = upvoteButton?.textContent || '';
    const countMatch = buttonText.match(/(\d+)/);
    if (countMatch) {
      count = parseInt(countMatch[1], 10);
    }

    // Check if already upvoted
    const isUpvoted = upvoteButton?.classList.contains('upvoted') ||
                      upvoteButton?.disabled ||
                      upvoteButton?.hasAttribute('disabled');

    return {
      count,
      isUpvoted,
      button: upvoteButton,
      container: upvoteContainer
    };
  }

  // ─── Utility Functions ───────────────────────────────────────────────────────

  function isDarkMode() {
    if (forcedTheme === 'dark') return true;
    if (forcedTheme === 'light') return false;

    const bgColor = getComputedStyle(document.body).backgroundColor;
    const match = bgColor.match(/\d+/g);
    if (match) {
      const [r, g, b] = match.map(Number);
      const luminance = (r * 299 + g * 587 + b * 114) / 1000;
      return luminance < 128;
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      const hours = Math.floor(diff / (1000 * 60 * 60));
      if (hours === 0) {
        const minutes = Math.floor(diff / (1000 * 60));
        return minutes <= 1 ? '1m' : `${minutes}m`;
      }
      return `${hours}h`;
    }
    if (days < 7) return `${days}d`;
    if (days < 365) {
      return date.toLocaleDateString(lang === 'de' ? 'de-DE' : 'en-US', {
        month: 'short',
        day: 'numeric'
      });
    }
    return date.toLocaleDateString(lang === 'de' ? 'de-DE' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  // ─── Bluesky API ─────────────────────────────────────────────────────────────

  function parseBlueskyUrl(url) {
    // Extract DID/handle and post ID from bsky.app URL
    // Format: https://bsky.app/profile/{handle}/post/{postId}
    const match = url.match(/bsky\.app\/profile\/([^\/]+)\/post\/([^\/\?]+)/);
    if (!match) return null;
    return { handle: match[1], postId: match[2] };
  }

  async function resolveBlueskyDid(handle) {
    // If already a DID, return as-is
    if (handle.startsWith('did:')) return handle;

    try {
      const response = await fetch(
        `https://public.api.bsky.app/xrpc/com.atproto.identity.resolveHandle?handle=${encodeURIComponent(handle)}`
      );
      if (!response.ok) throw new Error('Failed to resolve handle');
      const data = await response.json();
      return data.did;
    } catch (e) {
      console.warn('Failed to resolve Bluesky handle:', e);
      return null;
    }
  }

  async function fetchBlueskyComments(url) {
    const parsed = parseBlueskyUrl(url);
    if (!parsed) {
      console.warn('Invalid Bluesky URL:', url);
      return { comments: [], engagement: null };
    }

    const did = await resolveBlueskyDid(parsed.handle);
    if (!did) return { comments: [], engagement: null };

    const atUri = `at://${did}/app.bsky.feed.post/${parsed.postId}`;

    try {
      const response = await fetch(
        `https://public.api.bsky.app/xrpc/app.bsky.feed.getPostThread?uri=${encodeURIComponent(atUri)}&depth=10`
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      const comments = extractBlueskyReplies(data.thread, url);

      // Extract engagement metrics from root post
      const rootPost = data.thread?.post;
      const engagement = rootPost ? {
        likes: rootPost.likeCount || 0,
        reposts: rootPost.repostCount || 0,
        replies: rootPost.replyCount || 0
      } : null;

      return { comments, engagement };
    } catch (e) {
      console.error('Failed to fetch Bluesky comments:', e);
      return { comments: [], engagement: null };
    }
  }

  function extractBlueskyReplies(thread, originalUrl, depth = 0) {
    const comments = [];

    if (!thread?.replies) return comments;

    for (const reply of thread.replies) {
      if (reply.$type === 'app.bsky.feed.defs#blockedPost') continue;
      if (reply.$type === 'app.bsky.feed.defs#notFoundPost') continue;

      const post = reply.post;
      if (!post) continue;

      // Filter out pins and empty comments
      const text = post.record?.text || '';
      if (text === '📌' || text.trim() === '') continue;

      const author = post.author;
      const comment = {
        platform: 'bluesky',
        id: post.uri,
        author: {
          name: author.displayName || author.handle,
          handle: `@${author.handle}`,
          avatar: author.avatar,
          url: `https://bsky.app/profile/${author.handle}`
        },
        content: text,
        html: formatBlueskyText(text, post.record?.facets),
        createdAt: post.record?.createdAt || post.indexedAt,
        likes: post.likeCount || 0,
        reposts: post.repostCount || 0,
        replyCount: post.replyCount || 0,
        url: `https://bsky.app/profile/${author.handle}/post/${post.uri.split('/').pop()}`,
        depth: depth,
        replies: extractBlueskyReplies(reply, originalUrl, depth + 1)
      };

      comments.push(comment);
    }

    // Sort by likes (most liked first)
    comments.sort((a, b) => b.likes - a.likes);

    return comments;
  }

  function formatBlueskyText(text, facets) {
    if (!facets || facets.length === 0) {
      return escapeHtml(text);
    }

    // Convert text to array of chars for proper UTF-8 byte handling
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();
    const bytes = encoder.encode(text);

    // Sort facets by start position (descending) to process from end
    const sortedFacets = [...facets].sort((a, b) => b.index.byteStart - a.index.byteStart);

    let result = bytes;

    for (const facet of sortedFacets) {
      const start = facet.index.byteStart;
      const end = facet.index.byteEnd;
      const segment = decoder.decode(bytes.slice(start, end));

      let replacement = escapeHtml(segment);

      for (const feature of facet.features) {
        if (feature.$type === 'app.bsky.richtext.facet#link') {
          replacement = `<a href="${escapeHtml(feature.uri)}" target="_blank" rel="noopener">${replacement}</a>`;
        } else if (feature.$type === 'app.bsky.richtext.facet#mention') {
          replacement = `<a href="https://bsky.app/profile/${escapeHtml(feature.did)}" target="_blank" rel="noopener">${replacement}</a>`;
        } else if (feature.$type === 'app.bsky.richtext.facet#tag') {
          replacement = `<a href="https://bsky.app/hashtag/${escapeHtml(feature.tag)}" target="_blank" rel="noopener">${replacement}</a>`;
        }
      }

      const before = decoder.decode(result.slice(0, start));
      const after = decoder.decode(result.slice(end));
      result = encoder.encode(before + replacement + after);
    }

    return decoder.decode(result);
  }

  // ─── Mastodon API ────────────────────────────────────────────────────────────

  function parseMastodonUrl(url) {
    // Formats:
    // https://mastodon.social/@user/123456789
    // https://mastodon.social/users/user/statuses/123456789
    // https://instance.tld/@user@other.tld/123456789

    try {
      const urlObj = new URL(url);
      const instance = urlObj.origin;

      // Try /@user/id format
      let match = urlObj.pathname.match(/^\/@[^\/]+\/(\d+)$/);
      if (match) {
        return { instance, statusId: match[1] };
      }

      // Try /users/user/statuses/id format
      match = urlObj.pathname.match(/^\/users\/[^\/]+\/statuses\/(\d+)$/);
      if (match) {
        return { instance, statusId: match[1] };
      }

      return null;
    } catch (e) {
      return null;
    }
  }

  async function fetchMastodonComments(url) {
    const parsed = parseMastodonUrl(url);
    if (!parsed) {
      console.warn('Invalid Mastodon URL:', url);
      return { comments: [], engagement: null };
    }

    try {
      // Fetch both the original status and context in parallel
      const [statusResponse, contextResponse] = await Promise.all([
        fetch(`${parsed.instance}/api/v1/statuses/${parsed.statusId}`),
        fetch(`${parsed.instance}/api/v1/statuses/${parsed.statusId}/context`)
      ]);

      if (!contextResponse.ok) {
        throw new Error(`HTTP ${contextResponse.status}`);
      }

      const contextData = await contextResponse.json();
      const comments = buildMastodonTree(contextData.descendants, parsed.statusId, url);

      // Extract engagement metrics from original post
      let engagement = null;
      if (statusResponse.ok) {
        const statusData = await statusResponse.json();
        engagement = {
          likes: statusData.favourites_count || 0,
          reposts: statusData.reblogs_count || 0,
          replies: statusData.replies_count || 0
        };
      } else {
        console.warn('Failed to fetch Mastodon status for engagement:', statusResponse.status);
      }

      return { comments, engagement };
    } catch (e) {
      console.error('Failed to fetch Mastodon comments:', e);
      return { comments: [], engagement: null };
    }
  }

  function buildMastodonTree(statuses, rootId, originalUrl) {
    if (!statuses || statuses.length === 0) return [];

    // Build a map of status ID to status
    const statusMap = new Map();
    for (const status of statuses) {
      statusMap.set(status.id, status);
    }

    // Build parent-child relationships
    const childrenMap = new Map();
    for (const status of statuses) {
      const parentId = status.in_reply_to_id;
      if (!childrenMap.has(parentId)) {
        childrenMap.set(parentId, []);
      }
      childrenMap.get(parentId).push(status);
    }

    // Recursive function to build tree
    function buildTree(parentId, depth) {
      const children = childrenMap.get(parentId) || [];
      const comments = [];

      for (const status of children) {
        // Skip empty posts
        const textContent = status.content.replace(/<[^>]*>/g, '').trim();
        if (textContent === '') continue;

        const comment = {
          platform: 'mastodon',
          id: status.id,
          author: {
            name: status.account.display_name || status.account.username,
            handle: `@${status.account.acct}`,
            avatar: status.account.avatar,
            url: status.account.url
          },
          content: textContent,
          html: status.content,
          createdAt: status.created_at,
          likes: status.favourites_count || 0,
          reposts: status.reblogs_count || 0,
          replyCount: status.replies_count || 0,
          url: status.url,
          depth: depth,
          replies: buildTree(status.id, depth + 1)
        };

        comments.push(comment);
      }

      // Sort by likes
      comments.sort((a, b) => b.likes - a.likes);

      return comments;
    }

    return buildTree(rootId, 0);
  }

  // ─── Rendering ───────────────────────────────────────────────────────────────

  function createStyles() {
    if (noStyles) return;
    if (document.getElementById('social-comments-styles')) return;

    const dark = isDarkMode();

    const styles = document.createElement('style');
    styles.id = 'social-comments-styles';
    styles.textContent = `
      .social-comments {
        font-family: system-ui, -apple-system, sans-serif;
        font-size: 0.95rem;
        line-height: 1.5;
        margin: 2rem 0;
      }

      .social-comments-header {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        margin-bottom: 1rem;
        padding-bottom: 0.75rem;
        border-bottom: 1px solid ${dark ? '#3c3836' : '#e5e5e5'};
        gap: 1rem;
      }

      .social-comments-header-left {
        display: flex;
        flex-direction: column;
        gap: 0.35rem;
      }

      .social-comments-title {
        font-size: 1.25rem;
        font-weight: 600;
        margin: 0;
        color: ${dark ? '#ebdbb2' : '#1a1a1a'};
      }

      .social-engagement {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 0.85rem;
        color: ${dark ? '#a89984' : '#666'};
      }

      .social-engagement-stat {
        display: inline-flex;
        align-items: center;
        gap: 0.25rem;
      }

      .social-engagement-separator {
        color: ${dark ? '#665c54' : '#ccc'};
      }

      .social-comments-join {
        display: flex;
        gap: 0.5rem;
      }

      .social-comments-join a {
        display: inline-flex;
        align-items: center;
        gap: 0.35rem;
        padding: 0.4rem 0.75rem;
        font-size: 0.8rem;
        font-weight: 500;
        text-decoration: none;
        border-radius: 6px;
        transition: all 0.15s ease;
      }

      .social-comments-join-bluesky {
        background: ${dark ? '#1a4a6e' : '#e3f2fd'};
        color: ${dark ? '#90caf9' : '#1565c0'};
      }

      .social-comments-join-bluesky:hover {
        background: ${dark ? '#1565c0' : '#bbdefb'};
        color: ${dark ? '#fff' : '#0d47a1'};
      }

      .social-comments-join-mastodon {
        background: ${dark ? '#4a3a6e' : '#f3e5f5'};
        color: ${dark ? '#ce93d8' : '#7b1fa2'};
      }

      .social-comments-join-mastodon:hover {
        background: ${dark ? '#7b1fa2' : '#e1bee7'};
        color: ${dark ? '#fff' : '#4a148c'};
      }

      .social-comments-loading,
      .social-comments-empty,
      .social-comments-error {
        padding: 1.5rem;
        text-align: center;
        color: ${dark ? '#a89984' : '#666'};
        font-style: italic;
      }

      .social-comments-list {
        list-style: none;
        margin: 0;
        padding: 0;
      }

      .social-comment {
        padding: 1rem 0;
        border-bottom: 1px solid ${dark ? '#3c3836' : '#f0f0f0'};
      }

      .social-comment:last-child {
        border-bottom: none;
      }

      .social-comment-header {
        display: flex;
        align-items: flex-start;
        gap: 0.75rem;
        margin-bottom: 0.5rem;
      }

      .social-comment-avatar {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        object-fit: cover;
        flex-shrink: 0;
        background: ${dark ? '#3c3836' : '#e5e5e5'};
      }

      .social-comment-author {
        flex: 1;
        min-width: 0;
      }

      .social-comment-name {
        font-weight: 600;
        color: ${dark ? '#ebdbb2' : '#1a1a1a'};
        text-decoration: none;
        display: block;
      }

      .social-comment-name:hover {
        text-decoration: underline;
      }

      .social-comment-handle {
        font-size: 0.85rem;
        color: ${dark ? '#928374' : '#888'};
      }

      .social-comment-meta {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 0.8rem;
        color: ${dark ? '#928374' : '#888'};
      }

      .social-comment-platform {
        display: inline-flex;
        align-items: center;
        gap: 0.25rem;
        padding: 0.1rem 0.4rem;
        border-radius: 4px;
        font-size: 0.7rem;
        font-weight: 500;
        text-transform: uppercase;
      }

      .social-comment-platform-bluesky {
        background: ${dark ? '#1a4a6e' : '#e3f2fd'};
        color: ${dark ? '#90caf9' : '#1565c0'};
      }

      .social-comment-platform-mastodon {
        background: ${dark ? '#4a3a6e' : '#f3e5f5'};
        color: ${dark ? '#ce93d8' : '#7b1fa2'};
      }

      .social-comment-content {
        color: ${dark ? '#ebdbb2' : '#333'};
        word-wrap: break-word;
        overflow-wrap: break-word;
      }

      .social-comment-content a {
        color: ${dark ? '#83a598' : '#1565c0'};
        text-decoration: none;
      }

      .social-comment-content a:hover {
        text-decoration: underline;
      }

      .social-comment-content p {
        margin: 0 0 0.5rem 0;
      }

      .social-comment-content p:last-child {
        margin-bottom: 0;
      }

      .social-comment-footer {
        display: flex;
        gap: 1rem;
        margin-top: 0.5rem;
        font-size: 0.8rem;
        color: ${dark ? '#928374' : '#888'};
      }

      .social-comment-stat {
        display: flex;
        align-items: center;
        gap: 0.25rem;
      }

      .social-comment-replies {
        list-style: none;
        margin: 0;
        padding: 0 0 0 1rem;
        border-left: 3px solid ${dark ? '#504945' : '#d5d5d5'};
        margin-left: 1.25rem;
        margin-top: 0.5rem;
      }

      .social-comment-replies .social-comment {
        padding: 0.75rem 0;
      }

      .social-comment-replies .social-comment-avatar {
        width: 32px;
        height: 32px;
      }

      .social-comment-replies.collapsed {
        display: none;
      }

      .social-comment-toggle {
        display: inline-flex;
        align-items: center;
        gap: 0.35rem;
        padding: 0.35rem 0.65rem;
        margin-top: 0.5rem;
        background: ${dark ? '#282828' : '#f7f7f7'};
        border: 1px solid ${dark ? '#3c3836' : '#e5e5e5'};
        border-radius: 4px;
        color: ${dark ? '#83a598' : '#1565c0'};
        font-size: 0.8rem;
        cursor: pointer;
        transition: all 0.15s ease;
      }

      .social-comment-toggle:hover {
        background: ${dark ? '#3c3836' : '#ebebeb'};
      }

      .social-comment-toggle-icon {
        transition: transform 0.2s ease;
      }

      .social-comment-toggle.expanded .social-comment-toggle-icon {
        transform: rotate(90deg);
      }

      .social-comments-more {
        display: block;
        width: 100%;
        padding: 0.75rem;
        margin-top: 1rem;
        background: ${dark ? '#282828' : '#f5f5f5'};
        border: 1px solid ${dark ? '#3c3836' : '#e5e5e5'};
        border-radius: 6px;
        color: ${dark ? '#83a598' : '#1565c0'};
        font-size: 0.9rem;
        cursor: pointer;
        transition: all 0.15s ease;
      }

      .social-comments-more:hover {
        background: ${dark ? '#3c3836' : '#e8e8e8'};
      }

      /* Platform icons (simple SVG) */
      .social-icon-bluesky::before {
        content: '🦋';
        font-size: 0.9em;
      }

      .social-icon-mastodon::before {
        content: '🐘';
        font-size: 0.9em;
      }
    `;

    document.head.appendChild(styles);
  }

  function renderComment(comment, maxDepth = 3) {
    const li = document.createElement('li');
    li.className = 'social-comment';

    // Default avatar if none provided
    const avatarUrl = comment.author.avatar ||
      `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect fill="#888" width="100" height="100"/><text x="50" y="60" text-anchor="middle" fill="#fff" font-size="40">' + (comment.author.name?.[0] || '?') + '</text></svg>')}`;

    li.innerHTML = `
      <div class="social-comment-header">
        <img class="social-comment-avatar" src="${escapeHtml(avatarUrl)}" alt="" loading="lazy">
        <div class="social-comment-author">
          <a class="social-comment-name" href="${escapeHtml(comment.author.url)}" target="_blank" rel="noopener">
            ${escapeHtml(comment.author.name)}
          </a>
          <span class="social-comment-handle">${escapeHtml(comment.author.handle)}</span>
        </div>
        <div class="social-comment-meta">
          <span class="social-comment-platform social-comment-platform-${comment.platform}">
            <span class="social-icon-${comment.platform}"></span>
          </span>
          <a href="${escapeHtml(comment.url)}" target="_blank" rel="noopener" title="${new Date(comment.createdAt).toLocaleString()}">
            ${formatDate(comment.createdAt)}
          </a>
        </div>
      </div>
      <div class="social-comment-content">
        ${comment.html}
      </div>
      <div class="social-comment-footer">
        ${comment.likes > 0 ? `<span class="social-comment-stat">❤️ ${comment.likes}</span>` : ''}
        ${comment.reposts > 0 ? `<span class="social-comment-stat">🔁 ${comment.reposts}</span>` : ''}
      </div>
    `;

    // Add nested replies (up to maxDepth) with toggle button
    if (comment.replies && comment.replies.length > 0 && comment.depth < maxDepth) {
      const replyCount = countAllComments(comment.replies);
      const toggleId = `replies-${comment.id.replace(/[^a-zA-Z0-9]/g, '-')}`;

      // Create toggle button
      const toggleBtn = document.createElement('button');
      toggleBtn.className = 'social-comment-toggle';
      toggleBtn.setAttribute('aria-expanded', 'false');
      toggleBtn.setAttribute('aria-controls', toggleId);
      toggleBtn.innerHTML = `<span class="social-comment-toggle-icon">▶</span> ${replyCount} ${replyCount === 1 ? (lang === 'de' ? 'Antwort' : 'reply') : (lang === 'de' ? 'Antworten' : 'replies')}`;

      // Create replies container (initially collapsed)
      const repliesList = document.createElement('ul');
      repliesList.id = toggleId;
      repliesList.className = 'social-comment-replies collapsed';

      for (const reply of comment.replies) {
        repliesList.appendChild(renderComment(reply, maxDepth));
      }

      // Toggle functionality
      toggleBtn.addEventListener('click', () => {
        const isExpanded = toggleBtn.getAttribute('aria-expanded') === 'true';
        toggleBtn.setAttribute('aria-expanded', !isExpanded);
        toggleBtn.classList.toggle('expanded');
        repliesList.classList.toggle('collapsed');
      });

      li.appendChild(toggleBtn);
      li.appendChild(repliesList);
    }

    return li;
  }

  function countAllComments(comments) {
    let count = 0;
    for (const comment of comments) {
      count++;
      if (comment.replies && comment.replies.length > 0) {
        count += countAllComments(comment.replies);
      }
    }
    return count;
  }

  function renderEngagementStats(totalEngagement) {
    // Only show if there's any engagement
    if (totalEngagement.likes === 0 && totalEngagement.reposts === 0 && totalEngagement.replies === 0) {
      return '';
    }

    const stats = [];
    if (totalEngagement.likes > 0) stats.push(`<span class="social-engagement-stat">❤️ ${totalEngagement.likes} ${t.likes}</span>`);
    if (totalEngagement.reposts > 0) stats.push(`<span class="social-engagement-stat">🔁 ${totalEngagement.reposts} ${t.reposts}</span>`);

    return `<div class="social-engagement">${stats.join('<span class="social-engagement-separator">·</span>')}</div>`;
  }

  function renderComments(container, comments, blueskyUrl, mastodonUrl, blueskyEngagement, mastodonEngagement) {
    container.innerHTML = '';

    // Get BearBlog upvote info
    const bearBlogUpvote = getBearBlogUpvote();

    // Combine engagement from all platforms (Bluesky + Mastodon + BearBlog)
    const totalEngagement = {
      likes: (blueskyEngagement?.likes || 0) + (mastodonEngagement?.likes || 0) + (bearBlogUpvote?.count || 0),
      reposts: (blueskyEngagement?.reposts || 0) + (mastodonEngagement?.reposts || 0),
      replies: (blueskyEngagement?.replies || 0) + (mastodonEngagement?.replies || 0)
    };

    // Header
    const header = document.createElement('div');
    header.className = 'social-comments-header';

    const headerLeft = document.createElement('div');
    headerLeft.className = 'social-comments-header-left';

    const title = document.createElement('h3');
    title.className = 'social-comments-title';
    const commentCount = countAllComments(comments);
    title.textContent = commentCount > 0 ? `${t.comments} (${commentCount})` : t.comments;
    headerLeft.appendChild(title);

    // Add engagement stats below title (using combined totals including BearBlog)
    const engagementHtml = renderEngagementStats(totalEngagement);
    if (engagementHtml) {
      headerLeft.insertAdjacentHTML('beforeend', engagementHtml);
    }

    header.appendChild(headerLeft);

    // Join conversation links
    const joinLinks = document.createElement('div');
    joinLinks.className = 'social-comments-join';

    if (blueskyUrl && !mastodonOnly) {
      const bskyLink = document.createElement('a');
      bskyLink.className = 'social-comments-join-bluesky';
      bskyLink.href = blueskyUrl;
      bskyLink.target = '_blank';
      bskyLink.rel = 'noopener';
      bskyLink.innerHTML = `<span class="social-icon-bluesky"></span> ${t.joinBluesky}`;
      joinLinks.appendChild(bskyLink);
    }

    if (mastodonUrl && !blueskyOnly) {
      const mastoLink = document.createElement('a');
      mastoLink.className = 'social-comments-join-mastodon';
      mastoLink.href = mastodonUrl;
      mastoLink.target = '_blank';
      mastoLink.rel = 'noopener';
      mastoLink.innerHTML = `<span class="social-icon-mastodon"></span> ${t.joinMastodon}`;
      joinLinks.appendChild(mastoLink);
    }

    header.appendChild(joinLinks);
    container.appendChild(header);

    // Comments list
    if (comments.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'social-comments-empty';
      empty.textContent = t.noComments;
      container.appendChild(empty);
      return;
    }

    const list = document.createElement('ul');
    list.className = 'social-comments-list';

    for (const comment of comments) {
      list.appendChild(renderComment(comment));
    }

    container.appendChild(list);
  }

  // ─── Main Initialization ─────────────────────────────────────────────────────

  async function init() {
    // Only run on blog post pages
    if (!document.body.classList.contains('post') && !document.body.classList.contains('page')) {
      return;
    }

    const container = document.getElementById(containerId);
    if (!container) {
      console.warn(`Social Comments: Container #${containerId} not found`);
      return;
    }

    // Inject styles early
    createStyles();
    container.classList.add('social-comments');

    // Show loading state while fetching URLs
    container.innerHTML = `<div class="social-comments-loading">${t.loading}</div>`;

    // Get post URLs from meta tags or mappings.json
    const { bluesky: blueskyUrl, mastodon: mastodonUrl } = await findSocialUrls();

    // Check if any URL is found
    if (!blueskyUrl && !mastodonUrl) {
      container.innerHTML = `<div class="social-comments-empty">${t.disabled}</div>`;
      return;
    }

    // Fetch comments from both platforms
    const promises = [];

    if (blueskyUrl && !mastodonOnly) {
      promises.push(
        fetchBlueskyComments(blueskyUrl).catch(e => {
          console.error('Bluesky comments error:', e);
          return { comments: [], engagement: null };
        })
      );
    } else {
      promises.push(Promise.resolve({ comments: [], engagement: null }));
    }

    if (mastodonUrl && !blueskyOnly) {
      promises.push(
        fetchMastodonComments(mastodonUrl).catch(e => {
          console.error('Mastodon comments error:', e);
          return { comments: [], engagement: null };
        })
      );
    } else {
      promises.push(Promise.resolve({ comments: [], engagement: null }));
    }

    try {
      const [blueskyResult, mastodonResult] = await Promise.all(promises);

      // Merge and sort all comments by date (newest first)
      const allComments = [...blueskyResult.comments, ...mastodonResult.comments];
      allComments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      renderComments(
        container,
        allComments,
        blueskyUrl,
        mastodonUrl,
        blueskyResult.engagement,
        mastodonResult.engagement
      );
    } catch (e) {
      console.error('Failed to load comments:', e);
      container.innerHTML = `<div class="social-comments-error">${t.failed}</div>`;
    }
  }

  // Run on DOMContentLoaded or immediately if already loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
