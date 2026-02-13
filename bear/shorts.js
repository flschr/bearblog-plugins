(() => {
  const BATCH = 20;

  function initShorts() {
    const isShortsPath =
      (location.pathname || "").replace(/\/+$/, "/") === "/shorts/";
    const list = document.querySelector("ul.embedded.blog-posts");
    if (!isShortsPath || !list) return;

    const items = Array.from(list.querySelectorAll(":scope > li"));

    const visibleItems = () =>
      items.filter(li => !li.classList.contains("shorts-hidden"));

    const markLastVisible = () => {
      items.forEach(li => li.classList.remove("shorts-last-visible"));
      const visible = visibleItems();
      if (visible.length) {
        visible[visible.length - 1].classList.add("shorts-last-visible");
      }
    };

    /* 1) Make existing <time> the permalink */
    items.forEach(li => {
      const time = li.querySelector(":scope > span time");
      const titleLink = li.querySelector(":scope > a[href]");
      if (!time || !titleLink) return;
      if (time.closest("a")) return;

      const a = document.createElement("a");
      a.href = titleLink.getAttribute("href");
      a.className = "shorts-date-link";
      a.setAttribute(
        "aria-label",
        `Zum Artikel: ${titleLink.textContent.trim()}`
      );

      time.parentNode.insertBefore(a, time);
      a.appendChild(time);
    });

    /* 2) Hide everything after first batch */
    items.forEach((li, idx) => {
      if (idx >= BATCH) li.classList.add("shorts-hidden");
    });

    markLastVisible();

    /* 3) Load-more button */
    if (items.length > BATCH && !document.querySelector(".shorts-loadmore-wrap")) {
      const wrap = document.createElement("div");
      wrap.className = "shorts-loadmore-wrap";

      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "shorts-loadmore";
      wrap.appendChild(btn);

      list.insertAdjacentElement("afterend", wrap);

      const updateBtn = () => {
        const shown = visibleItems().length;
        const remaining = items.length - shown;
        if (remaining <= 0) {
          wrap.remove();
          return;
        }
        btn.textContent = `Mehr laden (${Math.min(BATCH, remaining)})`;
      };

      btn.addEventListener("click", () => {
        btn.disabled = true;

        const shown = visibleItems().length;
        const end = Math.min(shown + BATCH, items.length);
        for (let i = shown; i < end; i++) {
          items[i].classList.remove("shorts-hidden");
        }

        markLastVisible();
        btn.disabled = false;
        updateBtn();
      });

      updateBtn();
    }

    /* 4) iOS-stable lazy loading */
    list.querySelectorAll("img").forEach(img => {
      img.loading = "lazy";
      img.decoding = "async";
      img.setAttribute("draggable", "false");
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initShorts, { once: true });
  } else {
    initShorts();
  }
})();
