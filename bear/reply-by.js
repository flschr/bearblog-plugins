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
      instancePrompt: 'Gib deine Mastodon-Instanz ein (z.B. mastodon.social):',
      re: 'Re:'
    },
    en: {
      prefix: 'Reply via ',
      email: 'email',
      or: ' or ',
      mastodon: 'Mastodon',
      suffix: '',
      instancePrompt: 'Enter your Mastodon instance (e.g., mastodon.social):',
      re: 'Re:'
    }
  };
  const t = i18n[lang];

  function handleMastodonClick(e) {
    e.preventDefault();

    const url = window.location.href;
    const text = `${mastodonHandle} ${t.re} ${url}\n\n`;

    let instance = localStorage.getItem('mastodon_instance');

    if (!instance) {
      instance = prompt(t.instancePrompt);
      if (!instance) {
        return;
      }
      instance = instance.trim().replace(/^https?:\/\//, '').replace(/\/$/, '');
      localStorage.setItem('mastodon_instance', instance);
    }

    const shareUrl = `https://${instance}/share?text=${encodeURIComponent(text)}`;
    window.open(shareUrl, '_blank');
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
