(function() {
  const scriptTag = document.currentScript;
  const email = scriptTag?.dataset.email;

  if (!email) {
    console.warn('Reply by Mail: No email configured. Add data-email="your@email.com" to the script tag.');
    return;
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
        replyLinkWrapper.innerHTML = `<b><a href="mailto:${email}?subject=Re: ${encodeURIComponent(title)}">Reply via email</a></b>`;

        upvoteForm.parentNode.insertBefore(container, upvoteForm);
        container.appendChild(upvoteForm);
        container.appendChild(replyLinkWrapper);

        upvoteForm.style.margin = '0';
        upvoteForm.style.display = 'inline-block';
      }
    }
  });
})();
