/**
 * Применяет контент из SiteStore к главной странице
 */
(() => {
  function esc(s) {
    return String(s)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;");
  }

  function setText(sel, text) {
    const el = document.querySelector(sel);
    if (el && text != null) el.textContent = text;
  }

  function setHtml(sel, html) {
    const el = document.querySelector(sel);
    if (el && html != null) el.innerHTML = html;
  }

  function resolveAssetPath(path) {
    if (window.SiteStore?.resolveAssetPath) {
      return window.SiteStore.resolveAssetPath(path);
    }
    let p = String(path || "")
      .trim()
      .replace(/\\/g, "/");
    if (!p || /^(data:|https?:)/i.test(p)) return p;
    if (p.includes("assets/products/")) return p;
    const fileName = p.split("/").pop() || "";
    if (/\.(png|jpe?g|webp|gif)$/i.test(fileName)) {
      return `assets/products/${fileName}`;
    }
    return p.startsWith("assets/") ? p : `assets/products/${p.replace(/^\.?\//, "")}`;
  }

  function heroEmblemSrc(hero) {
    if (!hero) return "";
    if (hero.emblemDataUrl) return hero.emblemDataUrl;
    if (hero.emblem) return resolveAssetPath(hero.emblem);
    return "";
  }

  function reviewAvatarSrc(review) {
    if (window.SiteStore?.getReviewAvatar) {
      return window.SiteStore.getReviewAvatar(review);
    }
    return review.avatar || "";
  }

  function reviewProductSrc(review) {
    if (window.SiteStore?.getReviewProductImage) {
      return window.SiteStore.getReviewProductImage(review);
    }
    return review.productImageDataUrl || review.productImage || "";
  }

  function renderReviews(reviews) {
    const wrapper = document.querySelector(".reviews-swiper .swiper-wrapper");
    if (!wrapper || !Array.isArray(reviews)) return;

    wrapper.innerHTML = "";
    reviews.forEach((r) => {
      const slide = document.createElement("div");
      slide.className = "swiper-slide";
      slide.innerHTML = `
        <div class="review-card">
          <div class="review-header">
            <img src="" alt="" class="review-avatar" width="56" height="56" />
            <div>
              <strong></strong>
              <span class="review-date"></span>
              <div class="stars">★★★★★</div>
            </div>
          </div>
          <img src="" alt="" class="review-product" loading="lazy" />
          <p class="review-text"></p>
          <strong class="review-author"></strong>
        </div>`;

      const avatarEl = slide.querySelector(".review-avatar");
      const productEl = slide.querySelector(".review-product");
      const avatarSrc = reviewAvatarSrc(r);
      const productSrc = reviewProductSrc(r);

      if (avatarEl && avatarSrc) avatarEl.src = avatarSrc;
      if (productEl && productSrc) productEl.src = productSrc;

      const strong = slide.querySelector(".review-header strong");
      if (strong) strong.textContent = r.name || "";
      const date = slide.querySelector(".review-date");
      if (date) date.textContent = "• " + (r.date || "");
      const text = slide.querySelector(".review-text");
      if (text) text.textContent = r.text || "";
      const author = slide.querySelector(".review-author");
      if (author) author.textContent = r.author || "";

      wrapper.appendChild(slide);
    });
  }

  function apply(content) {
    if (!content) return;

    window.CATALOG_PRODUCTS = content.products || [];
    window.CATALOG_META = {
      source: "admin",
      syncedAt: content.updatedAt || new Date().toISOString(),
      count: window.CATALOG_PRODUCTS.length,
    };

    if (content.meta?.title) document.title = content.meta.title;
    const desc = document.querySelector('meta[name="description"]');
    if (desc && content.meta?.description) desc.setAttribute("content", content.meta.description);

    const h = content.hero || {};
    setHtml(
      "[data-cms='hero-title']",
      `${esc(h.title || "")}<br />${esc(h.titleLine2 || "")}`
    );
    setHtml(
      "[data-cms='hero-lead']",
      `${esc(h.lead1 || "")}<br />${esc(h.lead2 || "")}`
    );
    setText("[data-cms='hero-badge']", h.badge);

    const emblemSrc = heroEmblemSrc(h);
    document.querySelectorAll(".emblem-showcase__img, .brand__mark").forEach((img) => {
      if (emblemSrc) img.src = emblemSrc;
    });

    const s = content.sections || {};
    setText("[data-cms='why-title']", s.whyTitle);
    setText("[data-cms='how-title']", s.howTitle);
    setText("[data-cms='popular-title']", s.popularTitle);
    setText("[data-cms='catalog-title']", s.catalogTitle);
    setText("[data-cms='builder-title']", s.builderTitle);
    setText("[data-cms='builder-tagline']", s.builderTagline);
    setText("[data-cms='reviews-title']", s.reviewsTitle);
    setText("[data-cms='reviews-subtitle']", s.reviewsSubtitle);
    setText("[data-cms='reviews-cta']", s.reviewsCta);
    setText("[data-cms='contacts-title']", s.contactsTitle);

    const benefits = document.querySelectorAll("[data-cms-benefit]");
    (content.benefits || []).forEach((b, i) => {
      const card = benefits[i];
      if (!card) return;
      const strong = card.querySelector("strong");
      const p = card.querySelector("p");
      if (strong) strong.textContent = b.title || "";
      if (p) p.textContent = b.text || "";
    });

    const steps = document.querySelectorAll("[data-cms-step]");
    (content.steps || []).forEach((st, i) => {
      const card = steps[i];
      if (!card) return;
      const title = card.querySelector(".step__title");
      const text = card.querySelector(".step__text");
      if (title) title.textContent = st.title || "";
      if (text) text.textContent = st.text || "";
    });

    renderReviews(content.reviews);

    const c = content.contacts || {};
    const contactDefaults = {
      "contacts-vk": "https://vk.com/3d_les",
      "contacts-telegram": "https://web.telegram.org/a/#-1003332873905",
      "contacts-max": "https://m-x.su/les-3d",
    };

    setText("[data-cms='contacts-workshop']", c.workshopTitle);
    setText("[data-cms='contacts-text']", c.text);
    setText("[data-cms='contacts-phone']", c.phone);

    function applyContactHref(key, url) {
      let href = String(url || "").trim();
      if (!href) href = contactDefaults[key] || "#";
      if (key === "contacts-telegram" && /t\.me\/c\//i.test(href)) {
        href = contactDefaults[key];
      }
      document.querySelectorAll(`[data-cms-href="${key}"]`).forEach((el) => {
        el.href = href;
      });
    }

    applyContactHref("contacts-vk", c.vkUrl);
    applyContactHref("contacts-telegram", c.telegramUrl);
    applyContactHref("contacts-max", c.maxUrl);

    const vk = document.querySelector("[data-cms='contacts-vk']");
    if (vk) vk.textContent = c.vkLabel || "vk.com/3d_les";
    const tg = document.querySelector("[data-cms='contacts-telegram']");
    if (tg) tg.textContent = c.telegramLabel || "чат в Telegram";
    const max = document.querySelector("[data-cms='contacts-max']");
    if (max) max.textContent = c.maxLabel || "m-x.su/les-3d";

    wireContactLinks();
  }

  function wireContactLinks() {
    document.querySelectorAll("[data-cms-href]").forEach((link) => {
      if (link.dataset.contactWired === "1") return;
      link.dataset.contactWired = "1";
      link.addEventListener("click", (e) => {
        const url = link.getAttribute("href");
        if (!url || url === "#" || !/^https?:/i.test(url)) {
          e.preventDefault();
          return;
        }
        if (window.location.protocol === "file:") {
          e.preventDefault();
          const opened = window.open(url, "_blank");
          if (!opened) window.location.assign(url);
        }
      });
    });
  }

  function init() {
    if (!window.SiteStore) return;
    const content = window.SiteStore.loadContent();
    apply(content);
    window.__SITE_CONTENT__ = content;
    document.dispatchEvent(new CustomEvent("site-content-applied", { detail: content }));
    document.dispatchEvent(new CustomEvent("site-content-ready", { detail: content }));
  }

  function boot() {
    if (!document.getElementById("catalogGrid") && !document.querySelector("[data-cms='hero-title']")) {
      document.addEventListener("DOMContentLoaded", init);
      return;
    }
    init();
  }

  boot();
})();
