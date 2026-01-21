document.addEventListener('DOMContentLoaded', function () {
  document.querySelectorAll('[data-email-encoded]').forEach(function (el) {
    var encoded = el.getAttribute('data-email-encoded');
    try {
      var email = atob(encoded); // Base64 → Klartext
      var label = el.getAttribute('data-label') || email;

      var link = document.createElement('a');
      link.href = 'mailto:' + email;
      link.textContent = label;

      el.replaceWith(link);
    } catch (e) {
      console.error('Email decoding failed', e);
    }
  });
});
