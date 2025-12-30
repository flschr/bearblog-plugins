(function() {
  const scriptTag = document.currentScript;
  const email = scriptTag?.dataset.email;
  const mastodonHandle = scriptTag?.dataset.mastodon;
  const lang = scriptTag?.dataset.lang || 'en';

  const showLikeButton = scriptTag?.dataset.like !== undefined;
  const likeTexts = scriptTag?.dataset.like?.split('|') || [];

  // Translations
  const translations = {
    de: {
      mail: 'Per Mail antworten',
      mastodon: 'Auf Mastodon antworten',
      like: 'Gefällt mir',
      liked: 'Gefällt mir',
      modalTitle: 'Deine Mastodon-Instanz',
      modalPlaceholder: 'z.B. mastodon.social',
      modalCancel: 'Abbrechen',
      modalOpen: 'Öffnen'
    },
    en: {
      mail: 'Reply by mail',
      mastodon: 'Reply on Mastodon',
      like: 'Like this post',
      liked: 'Liked',
      modalTitle: 'Your Mastodon instance',
      modalPlaceholder: 'e.g., mastodon.social',
      modalCancel: 'Cancel',
      modalOpen: 'Open'
    }
  };

  const t = translations[lang] || translations.en;

  // Override like/liked texts if custom values provided via data-like="text|likedText"
  if (likeTexts[0]) t.like = likeTexts[0].trim();
  if (likeTexts[1]) t.liked = likeTexts[1].trim();

  if (!email) {
    console.warn('Reply by: No email configured. Add data-email="your@email.com" to the script tag.');
    return;
  }

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
    label.textContent = t.modalTitle;
    label.style.cssText = 'display:block;margin-bottom:0.5rem;font-weight:bold;';

    modalInput = document.createElement('input');
    modalInput.type = 'text';
    modalInput.placeholder = t.modalPlaceholder;
    modalInput.style.cssText = `width:100%;padding:0.5rem;border:1px solid ${dark ? '#444' : '#ccc'};border-radius:4px;font-size:1rem;box-sizing:border-box;margin-bottom:1rem;background:${dark ? '#2a2a2a' : '#fff'};color:${dark ? '#e0e0e0' : '#333'};`;

    const buttonContainer = document.createElement('div');
    buttonContainer.style.cssText = 'display:flex;gap:0.5rem;justify-content:flex-end;';

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
    const text = `${mastodonHandle} Re: ${cleanTitle} ${url}`;
    const shareUrl = `https://${instance}/share?text=${encodeURIComponent(text)}`;

    window.open(shareUrl, '_blank');
  }

  function createButtons(upvoteButton) {
    const container = document.createElement('div');
    container.className = 'reply-buttons-container';
    container.setAttribute('data-lang', lang);

    // Like button (if configured and upvote exists)
    if (showLikeButton && upvoteButton) {
      const likeButton = document.createElement('button');
      likeButton.className = 'reply-button reply-button-like';
      likeButton.type = 'button';
      likeButton.setAttribute('aria-label', t.like);
      likeButton.textContent = t.like;

      // Function to update button state based on native upvote
      function updateLikeState() {
        const isLiked = upvoteButton.classList.contains('upvoted') ||
                        upvoteButton.disabled ||
                        upvoteButton.hasAttribute('disabled');
        if (isLiked) {
          likeButton.classList.add('liked');
          likeButton.textContent = t.liked;
          likeButton.disabled = true;
        } else {
          likeButton.classList.remove('liked');
          likeButton.textContent = t.like;
          likeButton.disabled = false;
        }
      }

      // Initial state check
      updateLikeState();

      // Watch for changes on the native upvote button
      const observer = new MutationObserver(updateLikeState);
      observer.observe(upvoteButton, {
        attributes: true,
        attributeFilter: ['class', 'disabled']
      });

      likeButton.addEventListener('click', function() {
        upvoteButton.click();
        // Optimistic update
        setTimeout(updateLikeState, 100);
      });

      container.appendChild(likeButton);
    }

    // Mail button
    const mailButton = document.createElement('button');
    mailButton.className = 'reply-button reply-button-mail';
    mailButton.type = 'button';
    mailButton.textContent = t.mail;
    mailButton.setAttribute('aria-label', t.mail);

    const title = document.title;
    const cleanTitle = stripBlogName(title);
    mailButton.addEventListener('click', function() {
      window.location.href = `mailto:${email}?subject=Re: ${encodeURIComponent(cleanTitle)}`;
    });

    container.appendChild(mailButton);

    // Mastodon button (if configured)
    if (mastodonHandle) {
      const mastodonButton = document.createElement('button');
      mastodonButton.className = 'reply-button reply-button-mastodon';
      mastodonButton.type = 'button';
      mastodonButton.textContent = t.mastodon;
      mastodonButton.setAttribute('aria-label', t.mastodon);
      mastodonButton.addEventListener('click', function(e) {
        e.preventDefault();
        openModal();
      });

      container.appendChild(mastodonButton);
    }

    return container;
  }

  function injectDefaultStyles() {
    // Only inject if no custom styles are already present
    if (document.getElementById('reply-buttons-default-styles')) return;

    const style = document.createElement('style');
    style.id = 'reply-buttons-default-styles';
    style.textContent = `
      .reply-interaction-wrapper {
        display: flex;
        gap: 1rem;
        align-items: center;
        margin-top: 1.5rem;
        flex-wrap: wrap;
      }

      .reply-buttons-container {
        display: flex;
        gap: 0.5rem;
        flex-wrap: wrap;
      }

      .reply-button {
        padding: 0.5rem 1rem;
        border: 1px solid currentColor;
        background: transparent;
        border-radius: 4px;
        cursor: pointer;
        font-size: 0.9rem;
        font-family: inherit;
        color: inherit;
        transition: background-color 0.2s, color 0.2s, transform 0.1s;
        -webkit-tap-highlight-color: transparent;
      }

      .reply-button:hover {
        background-color: currentColor;
        color: var(--bg-color, #fff);
        opacity: 0.9;
      }

      .reply-button:active {
        transform: scale(0.95);
      }

      .reply-button:focus-visible {
        outline: 2px solid currentColor;
        outline-offset: 2px;
      }

      .reply-button-like {
        display: inline-flex;
        align-items: center;
      }

      .reply-button-like::before {
        content: "\\2661"; /* ♡ outline heart */
        display: inline-block;
        margin-right: 0.3em;
        font-size: 1.2em;
        line-height: 1;
        color: #e88a9e;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Apple Color Emoji", "Segoe UI Emoji", sans-serif;
        transition: transform 0.15s ease;
      }

      .reply-button-like:not(.liked):not([disabled]):hover::before {
        transform: scale(1.25);
      }

      .reply-button-like.liked::before,
      .reply-button-like[disabled]::before {
        content: "\\2665"; /* ♥ filled heart */
        color: #e25d7c;
      }

      .reply-button-like[disabled] {
        cursor: default;
        opacity: 0.8;
      }

      .reply-button-like:hover {
        background-color: transparent;
        color: inherit;
        opacity: 1;
      }

      .reply-button-mail {
        /* Custom styles for mail button can be added */
      }

      .reply-button-mastodon {
        /* Custom styles for mastodon button can be added */
      }
    `;
    document.head.appendChild(style);
  }

  document.addEventListener("DOMContentLoaded", function() {
    if (!document.body.classList.contains('post')) return;

    // Inject default styles
    injectDefaultStyles();

    // Find the upvote container (various selectors for Bear Blog)
    const upvoteContainer = document.querySelector('#upvote-form, .upvote-button, .upvote-container, .upvote');

    // Find the actual clickable upvote button inside the container
    const upvoteButton = upvoteContainer?.querySelector('button, [type="submit"], a') || upvoteContainer;

    // Create reply buttons (pass upvote button for like functionality)
    const buttonsContainer = createButtons(upvoteButton);

    if (upvoteContainer) {
      // Create a wrapper that contains both upvote and reply buttons
      const wrapper = document.createElement('div');
      wrapper.className = 'reply-interaction-wrapper';

      // Move upvote into wrapper
      upvoteContainer.parentNode.insertBefore(wrapper, upvoteContainer);
      wrapper.appendChild(upvoteContainer);

      // Hide native upvote if like button is shown
      if (showLikeButton) {
        upvoteContainer.style.display = 'none';
      }

      // Add reply buttons to wrapper
      wrapper.appendChild(buttonsContainer);
    } else {
      // No upvote container - append buttons after article content
      const content = document.querySelector('.blog-content, article, .post-content, main');
      if (content) {
        const wrapper = document.createElement('div');
        wrapper.className = 'reply-interaction-wrapper';
        wrapper.appendChild(buttonsContainer);
        content.appendChild(wrapper);
      } else {
        // Last resort: append to body
        const wrapper = document.createElement('div');
        wrapper.className = 'reply-interaction-wrapper';
        wrapper.appendChild(buttonsContainer);
        document.body.appendChild(wrapper);
      }
    }
  });
})();
