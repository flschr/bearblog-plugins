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
    if (document.body.classList.contains('post')) {
      const upvoteForm = document.querySelector('#upvote-form');

      if (upvoteForm) {
        const title = document.title;
        const cleanTitle = stripBlogName(title);

        const container = document.createElement('div');
        container.className = 'reply-by-container';

        const replySection = document.createElement('div');
        replySection.className = 'reply-by-section';

        const replyLink = document.createElement('a');
        replyLink.href = '#';
        replyLink.className = 'reply-by-toggle';
        replyLink.innerHTML = 'reply <span class="reply-arrow">↩</span>';

        let expanded = false;

        replyLink.addEventListener('click', function(e) {
          e.preventDefault();
          if (!expanded) {
            expanded = true;
            replySection.innerHTML = '';

            const replyText = document.createElement('span');
            replyText.className = 'reply-by-text';

            replyText.appendChild(document.createTextNode('reply by '));

            const emailLink = document.createElement('a');
            emailLink.href = `mailto:${email}?subject=Re: ${encodeURIComponent(cleanTitle)}`;
            emailLink.className = 'reply-by-email';
            emailLink.textContent = 'Mail';

            replyText.appendChild(emailLink);

            if (mastodonHandle) {
              replyText.appendChild(document.createTextNode(' or '));

              const mastodonLink = document.createElement('a');
              mastodonLink.href = '#';
              mastodonLink.className = 'reply-by-mastodon';
              mastodonLink.textContent = 'Mastodon';
              mastodonLink.addEventListener('click', function(e) {
                e.preventDefault();
                openModal();
              });

              replyText.appendChild(mastodonLink);
            }

            replyText.appendChild(document.createTextNode(' '));
            const arrowLink = document.createElement('a');
            arrowLink.href = '#';
            arrowLink.className = 'reply-arrow';
            arrowLink.textContent = '↩';
            arrowLink.addEventListener('click', function(e) {
              e.preventDefault();
              expanded = false;
              replySection.innerHTML = '';
              replySection.appendChild(replyLink);
            });
            replyText.appendChild(arrowLink);

            replySection.appendChild(replyText);
          }
        });

        replySection.appendChild(replyLink);

        upvoteForm.parentNode.insertBefore(container, upvoteForm);
        container.appendChild(upvoteForm);
        container.appendChild(replySection);

        upvoteForm.classList.add('reply-by-upvote');
      }
    }
  });
})();
