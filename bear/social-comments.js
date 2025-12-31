/**
 * Social Reactions Plugin for Bear Blog - Modal & Plural Edition
 */
(function() {
  'use strict';

  const scriptTag = document.currentScript;
  const email = scriptTag?.dataset.email;
  const mastodonHandle = scriptTag?.dataset.mastodon;
  const mappingsUrl = scriptTag?.dataset.mappingsUrl || 'https://raw.githubusercontent.com/flschr/bearblog-automation/main/mappings.json';

  const customLike = scriptTag?.dataset.like?.split('|') || [];
  const customConv = scriptTag?.dataset.conv?.split('|') || [];
  const activeServices = scriptTag?.dataset.services ? scriptTag.dataset.services.split(',').map(s => s.trim()) : ['bluesky', 'mastodon', 'mail'];
  
  const ui = {
    like: customLike[0] || 'Like this post',
    thankYou: customLike[1] || 'Thank you!',
    liked: customLike[2] || 'and you liked this',
    startConv: customConv[0] || 'Start the conversation',
    joinConvPlural: customConv[1] || 'comments, join the conversation',
    reactions: customConv[2] || 'reactions, join in',
    unmapped: customConv[3] || 'Share & Discuss',
    joinConvSingular: customConv[4] || 'comment, join the conversation',
    mail: scriptTag?.dataset.mail || 'Reply by mail',
    modalTitle: 'Your Mastodon instance',
    modalPlaceholder: 'e.g. mastodon.social',
    modalCancel: 'Cancel',
    modalOpen: 'Open'
  };

  const icons = {
    heart: '<svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>',
    heartOutline: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>',
    mail: '<svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>',
    mastodon: '<svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M23.268 5.313c-.35-2.578-2.617-4.61-5.304-5.004C17.51.242 15.792 0 11.813 0h-.03c-3.98 0-4.835.242-5.288.309C3.882.692 1.496 2.518.917 5.127.64 6.412.61 7.837.661 9.143c.074 1.874.088 3.745.26 5.611.118 1.24.325 2.47.62 3.68.55 2.237 2.777 4.098 4.96 4.857 2.336.792 4.849.923 7.256.38.265-.061.527-.132.786-.213.585-.184 1.27-.39 1.774-.753a.057.057 0 0 0 .023-.043v-1.809a.052.052 0 0 0-.02-.041.053.053 0 0 0-.046-.01 20.282 20.282 0 0 1-4.709.545c-2.73 0-3.463-1.284-3.674-1.818a5.593 5.593 0 0 1-.319-1.433.053.053 0 0 1 .066-.054c1.517.363 3.072.546 4.632.546.376 0 .75 0 1.125-.01 1.57-.044 3.224-.124 4.768-.422.038-.008.077-.015.11-.024 2.435-.464 4.753-1.92 4.989-5.604.008-.145.03-1.52.03-1.67.002-.512.167-3.63-.024-5.545zm-3.748 9.195h-2.561V8.29c0-1.309-.55-1.976-1.67-1.976-1.23 0-1.846.79-1.846 2.35v3.403h-2.546V8.663c0-1.56-.617-2.35-1.848-2.35-1.112 0-1.668.668-1.668 1.977v6.218H4.822V8.102c0-1.31.337-2.35 1.011-3.12.696-.77 1.608-1.164 2.74-1.164 1.311 0 2.302.5 2.962 1.498l.638 1.06.638-1.06c.66-.999 1.65-1.498 2.96-1.498 1.13 0 2.043.395 2.74 1.164.675.77 1.012 1.81 1.012 3.12v6.406z"/></svg>',
    bluesky: '<svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M12 10.8c-1.087-2.114-4.046-6.053-6.798-7.995C2.566.944 1.561 1.266.902 1.565.139 1.908 0 3.08 0 3.768c0 .69.378 5.65.624 6.479.815 2.736 3.713 3.66 6.383 3.364.136-.02.275-.039.415-.056-.138.022-.276.04-.415.056-3.912.58-7.387 2.005-2.83 7.078 5.013 5.19 6.87-1.113 7.823-4.308.953 3.195 2.05 9.271 7.733 4.308 4.267-4.308 1.172-6.498-2.74-7.078a8.741 8.741 0 0 1-.415-.056c.14.017.279.036.415.056 2.67.297 5.568-.628 6.383-3.364.246-.828.624-5.79.624-6.478 0-.69-.139-1.861-.902-2.206-.659-.298-1.664-.62-4.3 1.24C16.046 4.748 13.087 8.687 12 10.8z"/></svg>'
  };

  let modal = null, modalInput = null, storedMastoUrl = null;

  function normalizeUrl(url) { return url.replace(/[?#].*$/, '').replace(/\/$/, '').replace(/^https?:\/\//, '').replace(/^www\./, ''); }
  function isDarkMode() { const bg = getComputedStyle(document.body).backgroundColor; const rgb = bg.match(/\d+/g); return rgb ? (rgb[0]*299 + rgb[1]*587 + rgb[2]*114)/1000 < 128 : false; }

  async function findSocialUrls() {
    const bskyMeta = document.querySelector('meta[name="bsky-post"]');
    const mastoMeta = document.querySelector('meta[name="mastodon-post"]');
    let bskyUrl = bskyMeta?.content || null;
    let mastoUrl = mastoMeta?.content || null;
    try {
      const res = await fetch(mappingsUrl);
      const mappings = await res.json();
      const currentUrl = normalizeUrl(window.location.href);
      for (const [url, data] of Object.entries(mappings)) {
        if (normalizeUrl(url) === currentUrl) { bskyUrl = bskyUrl || data.bluesky; mastoUrl = mastoUrl || data.mastodon; break; }
      }
    } catch (e) {}
    return { bluesky: bskyUrl, mastodon: mastoUrl };
  }

  async function fetchEngagement(url, platform) {
    try {
      if (platform === 'bsky') {
        const match = url.match(/bsky\.app\/profile\/([^\/]+)\/post\/([^\/\?]+)/);
        const didRes = await fetch(`https://public.api.bsky.app/xrpc/com.atproto.identity.resolveHandle?handle=${match[1]}`);
        const { did } = await didRes.json();
        const res = await fetch(`https://public.api.bsky.app/xrpc/app.bsky.feed.getPostThread?uri=${encodeURIComponent(`at://${did}/app.bsky.feed.post/${match[2]}`)}&depth=0`);
        const { thread } = await res.json();
        return { likes: thread.post.likeCount||0, total: (thread.post.likeCount||0) + (thread.post.repostCount||0) + (thread.post.replyCount||0), replies: thread.post.replyCount||0 };
      } else {
        const urlObj = new URL(url);
        const id = urlObj.pathname.split('/').pop();
        const res = await fetch(`${urlObj.origin}/api/v1/statuses/${id}`);
        const data = await res.json();
        return { likes: data.favourites_count||0, total: (data.favourites_count||0) + (data.reblogs_count||0) + (data.replies_count||0), replies: data.replies_count||0 };
      }
    } catch (e) { return null; }
  }

  async function fetchBearBlog() {
    const form = document.querySelector('#upvote-form');
    const uid = form?.querySelector('input[name="uid"]')?.value || form?.action.match(/\/upvote\/([^\/]+)/)?.[1];
    if (!uid) return null;
    try {
      const res = await fetch(`/upvote-info/${uid}/`);
      const data = await res.json();
      return { count: data.upvote_count || 0, isUpvoted: data.upvoted || false };
    } catch (e) { return null; }
  }

  function createModal() {
    const dark = isDarkMode();
    if (modal) return;
    modal = document.createElement('div');
    modal.style.cssText = 'display:none;position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.6);z-index:10000;align-items:center;justify-content:center;font-family:inherit;';
    modal.innerHTML = `
      <div style="background:${dark ? '#1e1e1e' : '#fff'}; padding:1.5rem; border-radius:12px; max-width:320px; width:90%; color:${dark ? '#ebdbb2' : '#333'}; box-shadow: 0 10px 25px rgba(0,0,0,0.2);">
        <label style="display:block; margin-bottom:0.7rem; font-weight:bold;">${ui.modalTitle}</label>
        <input type="text" id="masto-instance" placeholder="${ui.modalPlaceholder}" style="width:100%; padding:0.6rem; margin-bottom:1rem; border:1px solid ${dark ? '#444' : '#ccc'}; border-radius:6px; background:${dark ? '#2a2a2a' : '#fff'}; color:inherit;">
        <div style="display:flex; justify-content:flex-end; gap:0.5rem;">
          <button id="masto-cancel" style="padding:0.5rem 1rem; background:none; border:none; cursor:pointer; color:inherit;">${ui.modalCancel}</button>
          <button id="masto-submit" style="padding:0.5rem 1rem; background:#6364ff; color:#fff; border:none; border-radius:6px; cursor:pointer;">${ui.modalOpen}</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
    modalInput = modal.querySelector('#masto-instance');
    modal.querySelector('#masto-cancel').onclick = () => modal.style.display = 'none';
    modal.querySelector('#masto-submit').onclick = () => {
      let inst = modalInput.value.trim().replace(/^https?:\/\//, '').replace(/\/$/, '');
      if (!inst) return; localStorage.setItem('mastodon_instance', inst);
      modal.style.display = 'none';
      const url = storedMastoUrl 
        ? `https://${inst}/authorize_interaction?uri=${encodeURIComponent(storedMastoUrl)}`
        : `https://${inst}/share?text=${encodeURIComponent(mastodonHandle + ' Re: ' + document.title + ' ' + window.location.href)}`;
      window.open(url, '_blank');
    };
  }

  function injectStyles() {
    const dark = isDarkMode();
    if (document.getElementById('social-reactions-styles')) return;
    const style = document.createElement('style');
    style.id = 'social-reactions-styles';
    style.textContent = `
      .social-reactions-wrapper { margin: 1.5rem 0; }
      .social-reactions-buttons { display: flex; flex-wrap: wrap; gap: 0.6rem; }
      .social-reactions-button {
        display: inline-flex; align-items: center; padding: 0.5rem 0.9rem;
        font-size: 0.9rem; font-family: inherit; font-weight: 500;
        border: 1px solid ${dark ? '#504945' : '#ddd'}; border-radius: 8px;
        background: ${dark ? '#282828' : '#fafafa'}; color: ${dark ? '#ebdbb2' : '#333'};
        cursor: pointer; transition: all 0.2s ease; line-height: 1; white-space: nowrap;
      }
      .social-reactions-button:hover:not(:disabled) { background: ${dark ? '#3c3836' : '#f0f0f0'}; border-color: ${dark ? '#665c54' : '#bbb'}; }
      .social-reactions-button.liked { background: ${dark ? 'rgba(251, 73, 52, 0.1)' : '#fff0f0'}; border-color: #fb4934; color: #fb4934; cursor: default; }
      .social-reactions-button .sr-icon { display: flex; align-items: center; margin-right: 0.5rem; }
      .social-reactions-button .sr-count { font-variant-numeric: tabular-nums; font-weight: 700; margin-right: 0.25rem; }
      .social-reactions-button.liked:hover .sr-icon svg { animation: heartBeat 0.8s infinite; }
      @keyframes heartBeat { 0% { transform: scale(1); } 14% { transform: scale(1.3); } 28% { transform: scale(1); } 42% { transform: scale(1.3); } 70% { transform: scale(1); } }
      .social-reactions-button-bluesky:hover { color: #0085ff; }
      .social-reactions-button-mastodon:hover { color: #563acc; }
    `;
    document.head.appendChild(style);
  }

  async function init() {
    if (!document.body.classList.contains('post') || !email) return;
    injectStyles();

    const [urls, bb] = await Promise.all([findSocialUrls(), fetchBearBlog()]);
    const [bsky, masto] = await Promise.all([
      urls.bluesky ? fetchEngagement(urls.bluesky, 'bsky') : null,
      urls.mastodon ? fetchEngagement(urls.mastodon, 'masto') : null
    ]);

    const btnContainer = document.createElement('div');
    btnContainer.className = 'social-reactions-buttons';

    const buildInner = (icon, count, text) => {
      const countPart = count > 0 ? `<span class="sr-count">${count}</span>` : '';
      return `<span class="sr-icon">${icon}</span>${countPart}<span class="sr-text">${text}</span>`;
    };

    const upBtn = document.querySelector('#upvote-form .upvote-button, #upvote-form button');
    if (scriptTag?.dataset.like !== undefined && upBtn) {
      const total = (bsky?.likes||0) + (masto?.likes||0) + (bb?.count||0);
      const btn = document.createElement('button');
      btn.className = 'social-reactions-button';
      const updateState = (voted, count) => {
        btn.classList.toggle('liked', voted); btn.disabled = voted;
        btn.innerHTML = buildInner(voted ? icons.heart : icons.heartOutline, count, voted ? ui.liked : ui.like);
      };
      updateState(bb?.isUpvoted || upBtn.disabled, total);
      btn.onclick = () => {
        upBtn.click(); btn.innerHTML = buildInner(icons.heart, '', ui.thankYou); btn.classList.add('liked'); btn.disabled = true;
        setTimeout(() => updateState(true, total+1), 3000);
      };
      btnContainer.appendChild(btn);
      document.querySelector('#upvote-form').style.display = 'none';
    }

    const getTxt = (eng, url) => {
      if (!url) return ui.unmapped;
      if (!eng) return ui.startConv;
      const t = (eng.likes||0) + (eng.reposts||0) + (eng.replies||0);
      if (t === 0) return ui.startConv;
      return eng.replies > 0 ? (eng.replies === 1 ? ui.joinConvSingular : ui.joinConvPlural) : ui.reactions;
    };

    const getCount = (eng, url) => (url && eng?.total > 0) ? (eng.replies > 0 ? eng.replies : eng.total) : 0;

    if (activeServices.includes('bluesky')) {
      const btn = document.createElement('button');
      btn.className = 'social-reactions-button social-reactions-button-bluesky';
      btn.innerHTML = buildInner(icons.bluesky, getCount(bsky, urls.bluesky), getTxt(bsky, urls.bluesky));
      btn.onclick = () => {
        if (urls.bluesky) window.open(urls.bluesky, '_blank');
        else window.open(`https://bsky.app/intent/compose?text=${encodeURIComponent('Re: ' + document.title + ' ' + window.location.href)}`, '_blank');
      };
      btnContainer.appendChild(btn);
    }

    if (mastodonHandle && activeServices.includes('mastodon')) {
      const btn = document.createElement('button');
      btn.className = 'social-reactions-button social-reactions-button-mastodon';
      btn.innerHTML = buildInner(icons.mastodon, getCount(masto, urls.mastodon), getTxt(masto, urls.mastodon));
      btn.onclick = () => {
        storedMastoUrl = urls.mastodon;
        createModal();
        modal.style.display = 'flex';
        modalInput.value = localStorage.getItem('mastodon_instance') || '';
        modalInput.focus();
      };
      btnContainer.appendChild(btn);
    }

    if (activeServices.includes('mail')) {
      const btn = document.createElement('button');
      btn.className = 'social-reactions-button';
      btn.innerHTML = buildInner(icons.mail, 0, ui.mail);
      btn.onclick = () => window.location.href = `mailto:${email}?subject=Re: ${encodeURIComponent(document.title)}`;
      btnContainer.appendChild(btn);
    }

    const wrap = document.createElement('div'); wrap.className = 'social-reactions-wrapper';
    wrap.appendChild(btnContainer);
    const target = document.querySelector('#upvote-form') || document.querySelector('.blog-content');
    if (target) target.parentNode.insertBefore(wrap, target);
  }

  init();
})();