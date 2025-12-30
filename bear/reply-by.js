(function() {
  const scriptTag = document.currentScript;
  const email = scriptTag?.dataset.email;
  const mastodonHandle = scriptTag?.dataset.mastodon;

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
    label.textContent = 'Your Mastodon instance';
    label.style.cssText = 'display:block;margin-bottom:0.5rem;font-weight:bold;';

    modalInput = document.createElement('input');
    modalInput.type = 'text';
    modalInput.placeholder = 'e.g., mastodon.social';
    modalInput.style.cssText = `width:100%;padding:0.5rem;border:1px solid ${dark ? '#444' : '#ccc'};border-radius:4px;font-size:1rem;box-sizing:border-box;margin-bottom:1rem;background:${dark ? '#2a2a2a' : '#fff'};color:${dark ? '#e0e0e0' : '#333'};`;

    const buttonContainer = document.createElement('div');
    buttonContainer.style.cssText = 'display:flex;gap:0.5rem;justify-content:flex-end;';

    const cancelBtn = document.createElement('button');
    cancelBtn.textContent = 'Cancel';
    cancelBtn.type = 'button';
    cancelBtn.style.cssText = `padding:0.5rem 1rem;border:1px solid ${dark ? '#444' : '#ccc'};background:transparent;border-radius:4px;cursor:pointer;color:${dark ? '#e0e0e0' : '#333'};`;
    cancelBtn.addEventListener('click', closeModal);

    const submitBtn = document.createElement('button');
    submitBtn.textContent = 'Open';
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

  document.addEventListener("DOMContentLoaded", function() {
    if (!document.body.classList.contains('post')) return;

    const replyContainer = document.querySelector('.reply-by');
    if (!replyContainer) return;

    const title = document.title;
    const cleanTitle = stripBlogName(title);

    // Replace [Mail] placeholder with email link
    const html = replyContainer.innerHTML;
    let newHtml = html.replace(/\[Mail\]/g, `<a href="mailto:${email}?subject=Re: ${encodeURIComponent(cleanTitle)}">Mail</a>`);

    // Replace [Mastodon] placeholder with link (if handle configured)
    if (mastodonHandle) {
      newHtml = newHtml.replace(/\[Mastodon\]/g, '<a href="#" class="reply-by-mastodon">Mastodon</a>');
    } else {
      // Remove [Mastodon] and surrounding " or " if no handle configured
      newHtml = newHtml.replace(/\s*or\s*\[Mastodon\]/g, '');
      newHtml = newHtml.replace(/\[Mastodon\]\s*or\s*/g, '');
      newHtml = newHtml.replace(/\[Mastodon\]/g, '');
    }

    replyContainer.innerHTML = newHtml;

    // Add click handler for Mastodon link
    const mastodonLink = replyContainer.querySelector('.reply-by-mastodon');
    if (mastodonLink) {
      mastodonLink.addEventListener('click', function(e) {
        e.preventDefault();
        openModal();
      });
    }
  });
})();
