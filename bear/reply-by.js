(function() {
  const scriptTag = document.currentScript;
  const email = scriptTag?.dataset.email;
  const mastodonHandle = scriptTag?.dataset.mastodon;

  if (!email) {
    console.warn('Reply by: No email configured. Add data-email="your@email.com" to the script tag.');
    return;
  }

  const lang = document.documentElement.lang?.toLowerCase().startsWith('de') ? 'de' : 'en';
  const i18n = {
    de: {
      prefix: 'Per ',
      email: 'E-Mail',
      or: ' oder ',
      mastodon: 'Mastodon',
      suffix: ' antworten',
      instancePrompt: 'Deine Mastodon-Instanz',
      instancePlaceholder: 'z.B. mastodon.social',
      submit: 'Öffnen',
      cancel: 'Abbrechen',
      re: 'Re:'
    },
    en: {
      prefix: 'Reply via ',
      email: 'email',
      or: ' or ',
      mastodon: 'Mastodon',
      suffix: '',
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

  function createModal() {
    modal = document.createElement('div');
    modal.id = 'mastodon-modal';
    modal.style.cssText = 'display:none;position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.5);z-index:10000;align-items:center;justify-content:center;';

    const dialog = document.createElement('div');
    dialog.style.cssText = 'background:var(--bg,#fff);color:var(--text,#333);padding:1.5rem;border-radius:8px;max-width:320px;width:90%;box-shadow:0 4px 20px rgba(0,0,0,0.15);';

    const label = document.createElement('label');
    label.textContent = t.instancePrompt;
    label.style.cssText = 'display:block;margin-bottom:0.5rem;font-weight:bold;';

    modalInput = document.createElement('input');
    modalInput.type = 'text';
    modalInput.placeholder = t.instancePlaceholder;
    modalInput.style.cssText = 'width:100%;padding:0.5rem;border:1px solid var(--border,#ccc);border-radius:4px;font-size:1rem;box-sizing:border-box;margin-bottom:1rem;';

    const buttonContainer = document.createElement('div');
    buttonContainer.style.cssText = 'display:flex;gap:0.5rem;justify-content:flex-end;';

    const cancelBtn = document.createElement('button');
    cancelBtn.textContent = t.cancel;
    cancelBtn.type = 'button';
    cancelBtn.style.cssText = 'padding:0.5rem 1rem;border:1px solid var(--border,#ccc);background:transparent;border-radius:4px;cursor:pointer;';
    cancelBtn.addEventListener('click', closeModal);

    const submitBtn = document.createElement('button');
    submitBtn.textContent = t.submit;
    submitBtn.type = 'button';
    submitBtn.style.cssText = 'padding:0.5rem 1rem;border:1px solid var(--text,#333);background:var(--text,#333);color:var(--bg,#fff);border-radius:4px;cursor:pointer;';
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
    const text = `${mastodonHandle} ${t.re} ${url}\n\n`;
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

        const container = document.createElement('div');
        container.style.display = 'flex';
        container.style.justifyContent = 'space-between';
        container.style.alignItems = 'baseline';
        container.style.marginTop = '1.5rem';

        const replyLinkWrapper = document.createElement('small');

        if (mastodonHandle) {
          replyLinkWrapper.innerHTML = `<b>${t.prefix}<a href="mailto:${email}?subject=${t.re} ${encodeURIComponent(title)}">${t.email}</a>${t.or}<a href="#" id="mastodon-reply">${t.mastodon}</a>${t.suffix}</b>`;
        } else {
          replyLinkWrapper.innerHTML = `<b>${t.prefix}<a href="mailto:${email}?subject=${t.re} ${encodeURIComponent(title)}">${t.email}</a>${t.suffix}</b>`;
        }

        upvoteForm.parentNode.insertBefore(container, upvoteForm);
        container.appendChild(upvoteForm);
        container.appendChild(replyLinkWrapper);

        upvoteForm.style.margin = '0';
        upvoteForm.style.display = 'inline-block';

        if (mastodonHandle) {
          const mastodonLink = document.getElementById('mastodon-reply');
          mastodonLink?.addEventListener('click', handleMastodonClick);
        }
      }
    }
  });
})();
