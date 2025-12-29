(function() {
  const scriptTag = document.currentScript;
  const email = scriptTag?.dataset.email;
  const mastodonHandle = scriptTag?.dataset.mastodon;

  if (!email) {
    console.warn('Reply by: No email configured. Add data-email="your@email.com" to the script tag.');
    return;
  }

  // Inject default styles (easily overridable via CSS)
  const style = document.createElement('style');
  style.textContent = `
    .reply-by-container {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-top: 1.5rem;
    }
    .reply-by-section {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 0.25rem;
    }
    .reply-by-options {
      overflow: hidden;
      max-height: 0;
      opacity: 0;
      transition: max-height 0.3s ease, opacity 0.3s ease;
    }
    .reply-by-options.expanded {
      max-height: 2rem;
      opacity: 1;
    }
    .reply-by-upvote {
      margin: 0;
      display: inline-block;
    }
  `;
  document.head.appendChild(style);

  const lang = document.documentElement.lang?.toLowerCase().startsWith('de') ? 'de' : 'en';
  const i18n = {
    de: {
      reply: 'antworten',
      via: 'Per ',
      email: 'E-Mail',
      or: ' oder ',
      mastodon: 'Mastodon',
      instancePrompt: 'Deine Mastodon-Instanz',
      instancePlaceholder: 'z.B. mastodon.social',
      submit: 'Öffnen',
      cancel: 'Abbrechen',
      re: 'Re:'
    },
    en: {
      reply: 'reply',
      via: 'Via ',
      email: 'email',
      or: ' or ',
      mastodon: 'Mastodon',
      instancePrompt: 'Your Mastodon instance',
      instancePlaceholder: 'e.g., mastodon.social',
      submit: 'Open',
      cancel: 'Cancel',
      re: 'Re:'
    }
  };
  const t = i18n[lang];

  let modal = null;
  let modalInput = null;

  function stripBlogName(title) {
    const lastPipeIndex = title.lastIndexOf('|');
    if (lastPipeIndex === -1) return title;
    return title.substring(0, lastPipeIndex).trim();
  }

  function isDarkMode() {
    const bgColor = getComputedStyle(document.body).backgroundColor;
    const match = bgColor.match(/\d+/g);
    if (match) {
      const [r, g, b] = match.map(Number);
      const luminance = (r * 299 + g * 587 + b * 114) / 1000;
      return luminance < 128;
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }

  function createModal() {
    const dark = isDarkMode();
    modal = document.createElement('div');
    modal.id = 'mastodon-modal';
    modal.style.cssText = 'display:none;position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.5);z-index:10000;align-items:center;justify-content:center;';

    const dialog = document.createElement('div');
    dialog.style.cssText = `background:${dark ? '#1e1e1e' : '#fff'};color:${dark ? '#e0e0e0' : '#333'};padding:1.5rem;border-radius:8px;max-width:320px;width:90%;box-shadow:0 4px 20px rgba(0,0,0,${dark ? '0.4' : '0.15'});`;

    const label = document.createElement('label');
    label.textContent = t.instancePrompt;
    label.style.cssText = 'display:block;margin-bottom:0.5rem;font-weight:bold;';

    modalInput = document.createElement('input');
    modalInput.type = 'text';
    modalInput.placeholder = t.instancePlaceholder;
    modalInput.style.cssText = `width:100%;padding:0.5rem;border:1px solid ${dark ? '#444' : '#ccc'};border-radius:4px;font-size:1rem;box-sizing:border-box;margin-bottom:1rem;background:${dark ? '#2a2a2a' : '#fff'};color:${dark ? '#e0e0e0' : '#333'};`;

    const buttonContainer = document.createElement('div');
    buttonContainer.style.cssText = 'display:flex;gap:0.5rem;justify-content:flex-end;';

    const cancelBtn = document.createElement('button');
    cancelBtn.textContent = t.cancel;
    cancelBtn.type = 'button';
    cancelBtn.style.cssText = `padding:0.5rem 1rem;border:1px solid ${dark ? '#444' : '#ccc'};background:transparent;border-radius:4px;cursor:pointer;color:${dark ? '#e0e0e0' : '#333'};`;
    cancelBtn.addEventListener('click', closeModal);

    const submitBtn = document.createElement('button');
    submitBtn.textContent = t.submit;
    submitBtn.type = 'button';
    submitBtn.style.cssText = 'padding:0.5rem 1rem;border:none;background:#6364ff;color:#fff;border-radius:4px;cursor:pointer;';
    submitBtn.addEventListener('click', handleModalSubmit);

    buttonContainer.appendChild(cancelBtn);
    buttonContainer.appendChild(submitBtn);

    dialog.appendChild(label);
    dialog.appendChild(modalInput);
    dialog.appendChild(buttonContainer);
    modal.appendChild(dialog);

    modal.addEventListener('click', function(e) {
      if (e.target === modal) closeModal();
    });

    modalInput.addEventListener('keydown', function(e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleModalSubmit();
      } else if (e.key === 'Escape') {
        closeModal();
      }
    });

    document.body.appendChild(modal);
  }

  function openModal() {
    if (!modal) createModal();
    const saved = localStorage.getItem('mastodon_instance');
    modalInput.value = saved || '';
    modal.style.display = 'flex';
    modalInput.focus();
    modalInput.select();
  }

  function closeModal() {
    if (modal) modal.style.display = 'none';
  }

  function handleModalSubmit() {
    let instance = modalInput.value.trim();
    if (!instance) return;

    instance = instance.replace(/^https?:\/\//, '').replace(/\/$/, '');
    localStorage.setItem('mastodon_instance', instance);
    closeModal();

    const url = window.location.href;
    const title = document.title;
    const cleanTitle = stripBlogName(title);
    const text = `${mastodonHandle} ${t.re} ${cleanTitle} ${url}`;
    const shareUrl = `https://${instance}/share?text=${encodeURIComponent(text)}`;

    // window.open() is called directly in the click handler - no popup blocker issue
    window.open(shareUrl, '_blank');
  }

  function handleMastodonClick(e) {
    e.preventDefault();
    // Always show modal - it will be pre-filled with saved instance if available
    openModal();
  }

  document.addEventListener("DOMContentLoaded", function() {
    if (document.body.classList.contains('post')) {
      const upvoteForm = document.querySelector('#upvote-form');

      if (upvoteForm) {
        const title = document.title;
        const cleanTitle = stripBlogName(title);

        const container = document.createElement('div');
        container.className = 'reply-by-container';

        const rightSection = document.createElement('div');
        rightSection.className = 'reply-by-section';

        const replyToggle = document.createElement('a');
        replyToggle.href = '#';
        replyToggle.className = 'reply-by-toggle';
        replyToggle.textContent = t.reply;

        const replyOptions = document.createElement('small');
        replyOptions.className = 'reply-by-options';

        if (mastodonHandle) {
          replyOptions.innerHTML = `<span class="reply-by-text">${t.via}<a href="mailto:${email}?subject=${t.re} ${encodeURIComponent(cleanTitle)}" class="reply-by-email">${t.email}</a>${t.or}<a href="#" id="mastodon-reply" class="reply-by-mastodon">${t.mastodon}</a></span>`;
        } else {
          replyOptions.innerHTML = `<span class="reply-by-text">${t.via}<a href="mailto:${email}?subject=${t.re} ${encodeURIComponent(cleanTitle)}" class="reply-by-email">${t.email}</a></span>`;
        }

        replyToggle.addEventListener('click', function(e) {
          e.preventDefault();
          replyOptions.classList.toggle('expanded');
        });

        rightSection.appendChild(replyToggle);
        rightSection.appendChild(replyOptions);

        upvoteForm.parentNode.insertBefore(container, upvoteForm);
        container.appendChild(upvoteForm);
        container.appendChild(rightSection);

        upvoteForm.classList.add('reply-by-upvote');

        if (mastodonHandle) {
          const mastodonLink = document.getElementById('mastodon-reply');
          mastodonLink?.addEventListener('click', handleMastodonClick);
        }
      }
    }
  });
})();
