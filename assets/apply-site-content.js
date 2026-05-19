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

  function renderReviews(reviews) {
    const wrapper = document.querySelector(".reviews-swiper .swiper-wrapper");
    if (!wrapper || !Array.isArray(reviews)) return;

    wrapper.innerHTML = reviews
      .map(
        (r) => `
      <div class="swiper-slide">
        <div class="review-card">
          <div class="review-header">
            <img src="${esc(r.avatar || "")}" alt="" class="review-avatar" width="56" height="56" />
            <div>
              <strong>${esc(r.name || "")}</strong>
              <span class="review-date">• ${esc(r.date || "")}</span>
              <div class="stars">★★★★★</div>
            </div>
          </div>
          <img src="${esc(window.SiteStore?.getReviewProductImage?.(r) || r.productImageDataUrl || r.productImage || "")}" alt="" class="review-product" loading="lazy" />
          <p class="review-text">${esc(r.text || "")}</p>
          <strong class="review-author">${esc(r.author || "")}</strong>
        </div>
      </div>
    `
      )
      .join("");
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
    setText("[data-cms='contacts-workshop']", c.workshopTitle);
    setText("[data-cms='contacts-text']", c.text);
    setText("[data-cms='contacts-phone']", c.phone);
    const vk = document.querySelector("[data-cms='contacts-vk']");
    if (vk) {
      vk.href = c.vkUrl || "#";
      vk.textContent = c.vkLabel || "";
    }
    const tg = document.querySelector("[data-cms='contacts-telegram']");
    if (tg) {
      tg.href = c.telegramUrl || "#";
      tg.textContent = c.telegramLabel || "";
    }
    const max = document.querySelector("[data-cms='contacts-max']");
    if (max) {
      max.href = c.maxUrl || "#";
      max.textContent = c.maxLabel || "";
    }
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
