(() => {
  /** @type {const} */
  const STORAGE_KEY = "giftTemplate.v1";

  const money = new Intl.NumberFormat("ru-RU");

  /** @typedef {{id:string,name:string,price:number,tags:string[],target:("guy"|"family"|"friends"|"any")[],type:("decor"|"3d"|"personal"|"any")[],personalizable:boolean,description:string}} Product */
  /** @type {Product[]} */
  const PRODUCTS_FALLBACK = [
    {
      id: "mini-forest",
      name: "Мини‑лес",
      price: 2990,
      tags: ["декор", "уют"],
      target: ["any"],
      type: ["decor"],
      personalizable: false,
      description: "Небольшой декор на полку или рабочий стол.",
    },
    {
      id: "name-forest",
      name: "3D лес с именем",
      price: 4990,
      tags: ["3d", "имя"],
      target: ["family", "guy", "friends", "any"],
      type: ["3d", "personal"],
      personalizable: true,
      description: "Объёмная композиция + короткая надпись или имя.",
    },
    {
      id: "keyholder",
      name: "Ключница‑панно",
      price: 3890,
      tags: ["практично", "дом"],
      target: ["family", "friends", "any"],
      type: ["decor", "personal"],
      personalizable: true,
      description: "В прихожую: красиво и полезно каждый день.",
    },
    {
      id: "lamp",
      name: "Ночник 3D",
      price: 6490,
      tags: ["3d", "свет"],
      target: ["family", "guy", "any"],
      type: ["3d"],
      personalizable: true,
      description: "Мягкий свет + персональная гравировка по желанию.",
    },
    {
      id: "box",
      name: "Шкатулка с гравировкой",
      price: 5590,
      tags: ["подарок", "шкатулка"],
      target: ["family", "friends", "any"],
      type: ["personal"],
      personalizable: true,
      description: "Тёплая вещь для памятных мелочей и записок.",
    },
    {
      id: "postcard",
      name: "Открытка из фанеры",
      price: 1490,
      tags: ["мини", "быстро"],
      target: ["any"],
      type: ["decor", "personal"],
      personalizable: true,
      description: "Когда хочется «маленький, но особенный» подарок.",
    },
  ];

  /** @returns {Product[]} */
  function getProducts() {
    return Array.isArray(window.CATALOG_PRODUCTS) &&
      window.CATALOG_PRODUCTS.length > 0
      ? window.CATALOG_PRODUCTS
      : PRODUCTS_FALLBACK;
  }

  const PRICING = {
    target: {
      guy: 250,
      family: 300,
      friends: 375,
    },
    type: {
      decor: 750,
      "3d": 1250,
      personal: 2000,
    },
    personal: {
      none: 0,
      name: 375,
      story: 750,
    },
    speed: {
      std: 0,
      fast: 500,
    },
  };

  const $ = (id) => /** @type {HTMLElement} */ (document.getElementById(id));

  const els = {
    year: $("year"),
    budget: /** @type {HTMLSelectElement | null} */ ($("budget")),
    popularGrid: $("popularGrid"),
    catalogGrid: $("catalogGrid"),
    form: /** @type {HTMLFormElement} */ ($("giftForm")),
    target: /** @type {HTMLSelectElement} */ ($("target")),
    type: /** @type {HTMLSelectElement} */ ($("type")),
    personal: /** @type {HTMLSelectElement} */ ($("personal")),
    speed: /** @type {HTMLSelectElement} */ ($("speed")),
    text: /** @type {HTMLTextAreaElement} */ ($("text")),
    total: $("total"),
    priceHint: /** @type {HTMLElement | null} */ ($("priceHint")),
    preview: $("preview"),
    reco: $("reco"),
    saveBtn: $("saveBtn"),
    copyBtn: $("copyBtn"),
    downloadBtn: $("downloadBtn"),
  };

  function nowYear() {
    if (els.year) els.year.textContent = String(new Date().getFullYear());
  }

  function formatRub(n) {
    return `${money.format(Math.max(0, Math.round(n)))} ₽`;
  }

  function productThumb(p) {
    if (window.SiteStore?.getProductImage) return window.SiteStore.getProductImage(p);
    return p.thumbDataUrl || p.thumb || "";
  }

  /** Cache-buster только для путей к файлам; data: URL ломается от суффикса ?v= */
  function imageSrc(url) {
    if (!url) return "";
    if (url.startsWith("data:")) return url;
    return url + (url.includes("?") ? "&" : "?") + "v=2";
  }

  function escapeHtml(s) {
    return String(s)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");
  }

  function getLabel(selectEl) {
    return selectEl.options[selectEl.selectedIndex]?.text ?? "";
  }

  function computeTotal() {
    const target = els.target.value;
    const type = els.type.value;
    const personal = els.personal.value;
    const speed = els.speed.value;

    const t = PRICING.target[target] ?? 0;
    const ty = PRICING.type[type] ?? 0;
    const p = PRICING.personal[personal] ?? 0;
    const s = PRICING.speed[speed] ?? 0;

    const total = t + ty + p + s;

    const hintParts = [];
    if (p > 0) hintParts.push("персонализация учтена");
    if (s > 0) hintParts.push("срочность учтена");
    const hint =
      hintParts.length > 0
        ? `Подсказка: ${hintParts.join(", ")}.`
        : "Подсказка: можно добавить персонализацию для «вау‑эффекта».";

    return {
      total,
      hint,
      parts: { target: t, type: ty, personal: p, speed: s },
    };
  }

  function buildOrderText(total) {
    const lines = [];
    lines.push("3Д-лес — заявка (черновик)");
    lines.push("");
    lines.push(`Кому: ${getLabel(els.target)}`);
    lines.push(`Тип: ${getLabel(els.type)}`);
    lines.push(`Персонализация: ${getLabel(els.personal)}`);
    lines.push(`Срок: ${getLabel(els.speed)}`);
    const txt = els.text.value.trim();
    if (txt) lines.push(`Текст: "${txt}"`);
    lines.push("");
    lines.push(`Итого (ориентир): ${formatRub(total)}`);
    lines.push("");
    lines.push("Примечание: итоговая цена зависит от размеров/сложности.");
    return lines.join("\n");
  }

  function updatePreview(total) {
    const txt = els.text.value.trim() || "Ваш текст появится здесь";
    const showDetails = Boolean(els.target?.value);

    if (!showDetails) {
      els.preview.innerHTML = `
        <div style="background:#f5f0e6;padding:40px 20px;border-radius:16px;text-align:center;min-height:260px;border:3px dashed #d4b99f">
          <p style="font-size:1.2rem;color:#666;margin-bottom:20px">Пример на изделии</p>
          <div style="font-size:1.45rem;font-weight:600;color:#222;line-height:1.4">${escapeHtml(txt)}</div>
        </div>
      `.trim();
      return;
    }

    const emotion =
      (PRICING.personal[els.personal.value] ?? 0) > 0
        ? "Подарок со смыслом"
        : "Базовая комплектация";

    els.preview.innerHTML = `
      <h3>${escapeHtml(emotion)}</h3>
      <p><strong>Кому:</strong> ${escapeHtml(getLabel(els.target))}</p>
      <p><strong>Тип:</strong> ${escapeHtml(getLabel(els.type))}</p>
      <p><strong>Персонализация:</strong> ${escapeHtml(getLabel(els.personal))}</p>
      <p><strong>Срок:</strong> ${escapeHtml(getLabel(els.speed))}</p>
      <p><strong>Текст:</strong> "${escapeHtml(txt)}"</p>
      <hr>
      <h2>${escapeHtml(formatRub(total))}</h2>
      <p>Мастерская «3Д-лес» (фанера, лазерная резка)</p>
    `.trim();
  }

  function productMatches(product, state) {
    const targetOk =
      product.target.includes("any") || product.target.includes(state.target);
    const typeOk =
      product.type.includes("any") || product.type.includes(state.type);
    const personalOk =
      state.personal === "none" ? true : product.personalizable;
    return targetOk && typeOk && personalOk;
  }

  function recommend(state, total) {
    const scored = getProducts().map((p) => {
      let score = 0;
      if (productMatches(p, state)) score += 5;
      const distance = Math.abs(p.price - total);
      score += Math.max(0, 4 - distance / 2000);
      if (state.personal !== "none" && p.personalizable) score += 1.2;
      return { p, score, distance };
    })
      .sort((a, b) => b.score - a.score || a.distance - b.distance)
      .slice(0, 3)
      .map((x) => x.p);

    if (!els.reco) return;

    if (scored.length === 0) {
      els.reco.textContent = "Пока нет идей — попробуйте изменить параметры.";
      return;
    }

    els.reco.innerHTML = scored
      .map(
        (p) => `
        <div class="reco__item">
          <div class="reco__title">${escapeHtml(p.name)} — ${escapeHtml(
          formatRub(p.price)
        )}</div>
          <div class="reco__desc">${escapeHtml(p.description)}</div>
          <div class="product__meta" style="margin-top:8px">
            ${p.tags.map((t) => `<span class="tag">${escapeHtml(t)}</span>`).join("")}
          </div>
        </div>
      `.trim()
      )
      .join("");
  }

  function refreshAos() {
    if (typeof AOS !== "undefined") AOS.refresh();
  }

  function renderPopular() {
    if (!els.popularGrid) return;
    const products = getProducts();
    const popular = products.filter((p) => p.popular).slice(0, 4);
    const list = popular.length ? popular : products.slice(0, 4);

    els.popularGrid.innerHTML = list
      .map(
        (p) => `
        <a class="popular-card" href="#catalog">
          ${productThumb(p) ? `<img class="popular-card__img" src="${escapeHtml(imageSrc(productThumb(p)))}" alt="" loading="lazy" />` : ""}
          <div class="popular-card__body">
            <h3 class="popular-card__title">${escapeHtml(p.name)}</h3>
            <div class="popular-card__price">${escapeHtml(formatRub(p.price))}</div>
          </div>
        </a>
      `
      )
      .join("");
    refreshAos();
  }

  function renderCatalog() {
    const limit = els.budget ? Number(els.budget.value || 0) : 0;
    const list =
      limit > 0
        ? getProducts().filter((p) => p.price <= limit)
        : getProducts().slice();

    const vkLink =
      window.CATALOG_META?.source ||
      "https://vk.com/market-202321163?section=album_1";

    els.catalogGrid.innerHTML =
      list.length === 0
        ? `<div class="product"><div class="product__name">Нет позиций под выбранный бюджет</div><div>Попробуйте увеличить лимит или <a href="${escapeHtml(vkLink)}" target="_blank" rel="noopener">откройте каталог VK</a>.</div></div>`
        : list
            .map(
              (p) => `
              <article class="product" data-product-id="${escapeHtml(p.id)}">
                ${productThumb(p) ? `<img class="product__thumb" src="${escapeHtml(imageSrc(productThumb(p)))}" alt="${escapeHtml(p.name)}" loading="lazy" width="168" height="168" />` : `<div class="wood-slice-wrap" aria-hidden="true"><div class="wood-slice"><span class="wood-slice-label">фанера</span></div></div>`}
                <div class="product__name">${escapeHtml(p.name)}</div>
                <div class="price">${escapeHtml(formatRub(p.price))}</div>
                <div class="product__meta">
                  ${p.tags.map((t) => `<span class="tag">${escapeHtml(t)}</span>`).join("")}
                  ${p.vkUrl ? `<a class="product__vk" href="${escapeHtml(p.vkUrl)}" target="_blank" rel="noopener">В VK</a>` : ""}
                </div>
                <div style="opacity:.92;line-height:1.25">${escapeHtml(
                  p.description
                )}</div>
              </article>
            `.trim()
            )
            .join("");
    refreshAos();
  }

  function saveTemplate() {
    const data = {
      target: els.target.value,
      type: els.type.value,
      personal: els.personal.value,
      speed: els.speed.value,
      text: els.text.value,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  function loadTemplate() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return;
    try {
      const data = JSON.parse(saved);
      if (data?.target) els.target.value = data.target;
      if (data?.type) els.type.value = data.type;
      if (data?.personal) els.personal.value = data.personal;
      if (data?.speed) els.speed.value = data.speed;
      if (typeof data?.text === "string") els.text.value = data.text;
    } catch {
      // ignore
    }
  }

  async function copyOrder(text) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      return false;
    }
  }

  function downloadTxt(filename, text) {
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  function runCalculate() {
    const { total, hint } = computeTotal();
    els.total.textContent = formatRub(total);
    if (els.priceHint) els.priceHint.textContent = hint;

    updatePreview(total);
    recommend(
      {
        target: els.target.value,
        type: els.type.value,
        personal: els.personal.value,
        speed: els.speed.value,
      },
      total
    );

    return total;
  }

  function wirePhraseButtons() {
    document.querySelectorAll(".phrase-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const add = btn.dataset.text || "";
        if (!add) return;
        if (els.text.value.trim() === "") els.text.value = add;
        else els.text.value += " • " + add;
        els.text.focus();
        updatePreview(computeTotal().total);
        if (els.target.value) runCalculate();
        else updatePreview(0);
      });
    });
  }

  function wire() {
    if (!els.form) return;

    nowYear();
    renderPopular();
    renderCatalog();
    if (els.budget) els.budget.addEventListener("change", renderCatalog);

    wirePhraseButtons();
    loadTemplate();
    updatePreview(0);
    if (els.target.value) runCalculate();

    els.form.addEventListener("submit", (e) => {
      e.preventDefault();
      if (!els.target.value) {
        els.target.focus();
        if (els.priceHint)
          els.priceHint.textContent = "Выберите «Кому подарок», чтобы посчитать.";
        updatePreview(0);
        return;
      }
      runCalculate();
    });

    for (const el of [els.target, els.type, els.personal, els.speed]) {
      el.addEventListener("change", () => {
        if (els.target.value) runCalculate();
        else updatePreview(0);
      });
    }

    els.text.addEventListener("input", () => {
      if (els.target.value) runCalculate();
      else updatePreview(0);
    });

    if (els.saveBtn)
      els.saveBtn.addEventListener("click", () => {
        saveTemplate();
        if (els.priceHint) els.priceHint.textContent = "Шаблон сохранён в этом браузере.";
      });

    if (els.copyBtn)
      els.copyBtn.addEventListener("click", async () => {
        const total = computeTotal().total;
        const text = buildOrderText(total);
        const ok = await copyOrder(text);
        if (els.priceHint)
          els.priceHint.textContent = ok
            ? "Скопировано в буфер обмена."
            : "Не удалось скопировать (браузер запретил).";
      });

    if (els.downloadBtn)
      els.downloadBtn.addEventListener("click", () => {
        const total = computeTotal().total;
        const text = buildOrderText(total);
        downloadTxt("3d-les-order.txt", text);
        if (els.priceHint) els.priceHint.textContent = "Файл заказа скачан.";
      });

    refreshAos();
  }

  function boot() {
    wire();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }

  document.addEventListener("site-content-ready", () => {
    renderPopular();
    renderCatalog();
    refreshAos();
  });
})();

