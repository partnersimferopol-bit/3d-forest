/**
 * Кабинет администратора 3Д-лес
 */
(() => {
  let content = null;

  const $ = (sel) => document.querySelector(sel);
  const toastEl = $("#toast");

  function showToast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add("admin-toast--show");
    setTimeout(() => toastEl.classList.remove("admin-toast--show"), 4500);
  }

  function persistToSite(options = {}) {
    if (!options.skipCollect) collectAllPanels();
    if (content.hero?.emblem) {
      content.hero.emblem = normalizeImagePath(content.hero.emblem);
    }
    const result = window.SiteStore.saveContent(content);
    if (result.content) content = result.content;
    if (!result.ok) {
      showToast(result.warning || "Не удалось сохранить");
      return false;
    }
    showToast(
      result.warning ||
        "Сохранено! Откройте index.html из той же папки (Ctrl+F5). Фото — в памяти браузера; файл из загрузки положите в assets/products/"
    );
    return true;
  }

  function compressImage(file, maxSide = 900) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.onload = () => {
        URL.revokeObjectURL(url);
        let w = img.width;
        let h = img.height;
        const scale = Math.min(1, maxSide / Math.max(w, h));
        w = Math.round(w * scale);
        h = Math.round(h * scale);
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        canvas.getContext("2d").drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL("image/jpeg", 0.82));
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error("Не удалось прочитать изображение"));
      };
      img.src = url;
    });
  }

  function downloadBlob(blob, filename) {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  function normalizeImagePath(path) {
    let p = String(path || "")
      .trim()
      .replace(/\\/g, "/");
    if (!p) return "";
    if (/^(data:|https?:)/i.test(p)) return p;

    const assetsIdx = p.toLowerCase().indexOf("assets/products/");
    if (assetsIdx >= 0) return p.slice(assetsIdx);

    const productsIdx = p.toLowerCase().indexOf("products/");
    if (productsIdx >= 0) {
      const tail = p.slice(productsIdx);
      return tail.startsWith("assets/") ? tail : `assets/${tail}`;
    }

    const fileName = p.split("/").pop() || "";
    if (/\.(png|jpe?g|webp|gif)$/i.test(fileName)) {
      return `assets/products/${fileName}`;
    }

    if (!p.startsWith("assets/")) {
      return `assets/products/${p.replace(/^\.?\//, "")}`;
    }
    return p;
  }

  function reviewImageSrc(r) {
    return r?.productImageDataUrl || r?.productImage || "";
  }

  function catalogThumbOptions() {
    const fromCatalog = (window.CATALOG_PRODUCTS || [])
      .map((p) => p.thumb)
      .filter(Boolean);
    const fromContent = (content?.products || [])
      .map((p) => p.thumb)
      .filter(Boolean);
    return [...new Set([...fromCatalog, ...fromContent])].sort();
  }

  function localImagePickOptions(current) {
    return catalogThumbOptions()
      .filter((t) => !/^https?:/i.test(t))
      .map(
        (t) =>
          `<option value="${escapeAttr(t)}"${t === current ? " selected" : ""}>${escapeHtml(t)}</option>`
      )
      .join("");
  }

  function thumbSelectHtml(i, current) {
    return `
      <div class="admin-field">
        <label for="thumbPick-${i}">Быстрый выбор из папки products</label>
        <select id="thumbPick-${i}" data-thumb-pick="${i}">
          <option value="">— выберите файл —</option>
          ${localImagePickOptions(current)}
        </select>
      </div>`;
  }

  function reviewImagePickHtml(i, current) {
    return `
      <div class="admin-field">
        <label for="reviewPick-${i}">Быстрый выбор фото из products</label>
        <select id="reviewPick-${i}" data-review-pick="${i}">
          <option value="">— выберите файл —</option>
          ${localImagePickOptions(current)}
        </select>
      </div>`;
  }

  async function fetchPathAsDataUrl(path, maxSide = 900) {
    const normalized = normalizeImagePath(path);
    if (!normalized || /^https?:/i.test(normalized)) return null;
    try {
      const res = await fetch(normalized, { cache: "no-store" });
      if (!res.ok) throw new Error("not found");
      const blob = await res.blob();
      const name = normalized.split("/").pop() || "image.jpg";
      const file = new File([blob], name, {
        type: blob.type || "image/jpeg",
      });
      return { dataUrl: await compressImage(file, maxSide), path: normalized };
    } catch {
      return null;
    }
  }

  async function embedPathAsDataUrl(index) {
    const embedded = await fetchPathAsDataUrl(content.products[index].thumb);
    if (!embedded) return false;
    content.products[index].thumb = embedded.path;
    content.products[index].thumbDataUrl = embedded.dataUrl;
    return true;
  }

  async function embedReviewPathAsDataUrl(index) {
    const embedded = await fetchPathAsDataUrl(
      content.reviews[index].productImage,
      700
    );
    if (!embedded) return false;
    content.reviews[index].productImage = embedded.path;
    content.reviews[index].productImageDataUrl = embedded.dataUrl;
    return true;
  }

  function probeImageUrl(url) {
    const src = normalizeImagePath(url) || url;
    if (/^data:/i.test(src) || /^https?:\/\//i.test(src)) {
      return Promise.resolve(true);
    }
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
      img.src = src + (src.includes("?") ? "&" : "?") + "t=" + Date.now();
    });
  }

  async function applyProductPath(index, { save = true } = {}) {
    const panel = $("#panel-products");
    const pathInput = panel?.querySelector(`[data-path="products.${index}.thumb"]`);
    const path = normalizeImagePath(
      pathInput?.value || content.products[index].thumb || ""
    );
    if (!path) {
      showToast(
        "Укажите путь: assets/products/drakon.png или просто drakon.png"
      );
      return false;
    }

    content.products[index].thumb = path;
    if (pathInput) pathInput.value = path;
    delete content.products[index].thumbDataUrl;

    const found = await probeImageUrl(path);
    const prev = panel?.querySelector(`[data-preview="${index}"]`);
    if (!found) {
      showToast(
        "Файл не найден: " +
          path +
          ". Скопируйте картинку в папку assets/products/ (рядом с index.html) и нажмите «Применить путь» снова."
      );
      if (prev) prev.removeAttribute("src");
      return false;
    }

    const embedded = await embedPathAsDataUrl(index);
    if (prev) prev.src = embedded ? content.products[index].thumbDataUrl : path;

    if (save) persistToSite({ skipCollect: true });
    return true;
  }

  async function applyReviewPath(index, { save = true } = {}) {
    const panel = $("#panel-reviews");
    const pathInput = panel?.querySelector(
      `[data-path="reviews.${index}.productImage"]`
    );
    const path = normalizeImagePath(
      pathInput?.value || content.reviews[index].productImage || ""
    );
    if (!path) {
      showToast(
        "Укажите путь: assets/products/drakon.png или просто drakon.png"
      );
      return false;
    }

    content.reviews[index].productImage = path;
    if (pathInput) pathInput.value = path;
    delete content.reviews[index].productImageDataUrl;

    const found = await probeImageUrl(path);
    const prev = panel?.querySelector(`[data-review-preview="${index}"]`);
    if (!found) {
      showToast(
        "Файл не найден: " +
          path +
          ". Положите картинку в assets/products/ и нажмите «Применить путь» снова."
      );
      if (prev) prev.removeAttribute("src");
      return false;
    }

    const embedded = await embedReviewPathAsDataUrl(index);
    if (prev) prev.src = reviewImageSrc(content.reviews[index]);

    if (save) persistToSite({ skipCollect: true });
    return true;
  }

  function field(label, id, value = "", type = "text", rows) {
    if (type === "textarea") {
      return `<div class="admin-field"><label for="${id}">${label}</label><textarea id="${id}" data-path="${id}">${escapeHtml(value)}</textarea></div>`;
    }
    return `<div class="admin-field"><label for="${id}">${label}</label><input id="${id}" type="${type}" data-path="${id}" value="${escapeAttr(value)}" /></div>`;
  }

  function escapeHtml(s) {
    return String(s)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;");
  }

  function escapeAttr(s) {
    return escapeHtml(s).replaceAll('"', "&quot;");
  }

  function setByPath(pathStr, value) {
    const parts = pathStr.split(".");
    let cur = content;
    for (let i = 0; i < parts.length - 1; i++) {
      const p = parts[i];
      const next = parts[i + 1];
      if (cur[p] === undefined) {
        cur[p] = /^\d+$/.test(next) ? [] : {};
      }
      cur = cur[p];
    }
    const last = parts[parts.length - 1];
    cur[last] = value;
  }

  function readForm(panel) {
    panel.querySelectorAll("[data-path]").forEach((el) => {
      const val = el.type === "checkbox" ? el.checked : el.value;
      setByPath(el.dataset.path, val);
    });
  }

  function renderTexts() {
    const h = content.hero;
    const s = content.sections;
    $("#panel-texts").innerHTML = `
      <h2>Главный экран</h2>
      ${field("Заголовок, строка 1", "hero.title", h.title)}
      ${field("Заголовок, строка 2", "hero.titleLine2", h.titleLine2)}
      ${field("Подзаголовок, строка 1", "hero.lead1", h.lead1)}
      ${field("Подзаголовок, строка 2", "hero.lead2", h.lead2)}
      ${field("Бейдж под эмблемой", "hero.badge", h.badge)}
      ${field("Путь к эмблеме", "hero.emblem", h.emblem, "text")}
      <p class="admin-hint">Например: <code>assets/products/эмблема.png</code> или просто <code>эмблема.png</code></p>
      <h2>Заголовки секций</h2>
      ${field("Почему мы", "sections.whyTitle", s.whyTitle)}
      ${field("Как работает", "sections.howTitle", s.howTitle)}
      ${field("Популярное", "sections.popularTitle", s.popularTitle)}
      ${field("Каталог", "sections.catalogTitle", s.catalogTitle)}
      ${field("Конструктор", "sections.builderTitle", s.builderTitle)}
      ${field("Подпись конструктора", "sections.builderTagline", s.builderTagline, "textarea")}
      ${field("Отзывы", "sections.reviewsTitle", s.reviewsTitle)}
      ${field("Подзаголовок отзывов", "sections.reviewsSubtitle", s.reviewsSubtitle)}
      ${field("Текст под отзывами", "sections.reviewsCta", s.reviewsCta)}
      <h2>Преимущества</h2>
      ${content.benefits
        .map(
          (b, i) => `
        <div class="admin-item">
          <h3>Преимущество ${i + 1}</h3>
          ${field("Заголовок", `benefits.${i}.title`, b.title)}
          ${field("Текст", `benefits.${i}.text`, b.text, "textarea")}
        </div>`
        )
        .join("")}
      <h2>Шаги</h2>
      ${content.steps
        .map(
          (st, i) => `
        <div class="admin-item">
          <h3>Шаг ${i + 1}</h3>
          ${field("Заголовок", `steps.${i}.title`, st.title)}
          ${field("Текст", `steps.${i}.text`, st.text, "textarea")}
        </div>`
        )
        .join("")}
    `.replace(/<motion /g, "<div ").replace(/<\/motion>/g, "</div>");
  }

  function renderProducts() {
    const panel = $("#panel-products");
    panel.innerHTML =
      `<p class="admin-hint"><strong>Фото из папки products:</strong> выберите файл в списке ниже или введите путь и нажмите «Применить путь». Либо нажмите «Выбрать фото» и укажите файл на диске. Картинки должны лежать в <code>assets/products/</code> рядом с сайтом.</p>` +
      content.products
        .map((p, i) => {
          const img = window.SiteStore.getProductImage(p);
          return `
        <div class="admin-item" data-product-index="${i}">
          <div class="admin-item__head">
            <h3>${escapeHtml(p.name)}</h3>
            <button type="button" class="btn btn--ghost btn--small" data-remove-product="${i}">Удалить</button>
          </div>
          <img class="admin-thumb" src="${escapeAttr(img)}" alt="" data-preview="${i}" />
          ${field("Название", `products.${i}.name`, p.name)}
          ${field("Цена (число)", `products.${i}.price`, String(p.price), "number")}
          ${field("Описание", `products.${i}.description`, p.description, "textarea")}
          ${thumbSelectHtml(i, p.thumb || "")}
          ${field("Путь к файлу", `products.${i}.thumb`, p.thumb || "")}
          <div class="admin-field admin-field--row">
            <button type="button" class="btn btn--ghost btn--small" data-apply-path="${i}">Применить путь</button>
            <label class="admin-file-btn btn btn--ghost btn--small">
              Выбрать фото с диска
              <input type="file" accept="image/*,.png,.jpg,.jpeg,.webp,.gif" hidden data-upload-product="${i}" />
            </label>
            <span class="admin-file-name" data-file-label="${i}"></span>
          </div>
          <label><input type="checkbox" data-path="products.${i}.popular" ${p.popular ? "checked" : ""} /> Показывать в «Популярное»</label>
        </div>`;
        })
        .join("") +
      `<button type="button" class="btn btn--ghost" id="addProductBtn">+ Добавить товар</button>`;

    panel.querySelectorAll("[data-thumb-pick]").forEach((sel) => {
      sel.addEventListener("change", async () => {
        const i = Number(sel.dataset.thumbPick);
        if (!sel.value) return;
        const pathInput = panel.querySelector(`[data-path="products.${i}.thumb"]`);
        if (pathInput) pathInput.value = sel.value;
        await applyProductPath(i);
        sel.value = "";
      });
    });

    panel.querySelectorAll("[data-apply-path]").forEach((btn) => {
      btn.addEventListener("click", () => {
        applyProductPath(Number(btn.dataset.applyPath));
      });
    });

    panel.querySelectorAll("[data-upload-product]").forEach((input) => {
      input.addEventListener("change", async () => {
        const file = input.files?.[0];
        const i = Number(input.dataset.uploadProduct);
        const nameEl = panel.querySelector(`[data-file-label="${i}"]`);
        if (!file) {
          if (nameEl) nameEl.textContent = "";
          return;
        }
        if (nameEl) nameEl.textContent = file.name;
        try {
          const dataUrl = await compressImage(file);
          const safeName = file.name.replace(/[^\w.\-а-яА-Я]+/gi, "_");
          const path = `assets/products/${safeName}`;
          content.products[i].thumbDataUrl = dataUrl;
          content.products[i].thumb = path;
          const pathInput = panel.querySelector(`[data-path="products.${i}.thumb"]`);
          if (pathInput) pathInput.value = path;
          const prev = panel.querySelector(`[data-preview="${i}"]`);
          if (prev) prev.src = dataUrl;
          downloadBlob(file, safeName);
          persistToSite({ skipCollect: true });
        } catch {
          showToast("Не удалось обработать фото");
        }
        input.value = "";
      });
    });

    panel.querySelectorAll("[data-remove-product]").forEach((btn) => {
      btn.addEventListener("click", () => {
        if (!confirm("Удалить товар?")) return;
        content.products.splice(Number(btn.dataset.removeProduct), 1);
        renderProducts();
      });
    });

    $("#addProductBtn")?.addEventListener("click", () => {
      content.products.push({
        id: "item-" + Date.now(),
        name: "Новый товар",
        price: 500,
        thumb: "assets/products/placeholder.png",
        tags: ["новинка"],
        target: ["any"],
        type: ["decor"],
        personalizable: false,
        popular: false,
        description: "Описание товара",
      });
      renderProducts();
    });
  }

  function renderReviews() {
    const panel = $("#panel-reviews");
    panel.innerHTML =
      `<p class="admin-hint">Фото отзыва: выберите из списка, введите путь (<code>drakon.png</code> или <code>assets/products/drakon.png</code>) и нажмите «Применить путь», либо «Выбрать фото».</p>` +
      content.reviews
        .map((r, i) => {
          const img = reviewImageSrc(r);
          return `
      <div class="admin-item">
        <div class="admin-item__head">
          <h3>Отзыв ${i + 1}</h3>
          <button type="button" class="btn btn--ghost btn--small" data-remove-review="${i}">Удалить</button>
        </div>
        <img class="admin-thumb admin-thumb--wide" src="${escapeAttr(img)}" alt="" data-review-preview="${i}" />
        ${reviewImagePickHtml(i, normalizeImagePath(r.productImage) || r.productImage || "")}
        ${field("Имя", `reviews.${i}.name`, r.name)}
        ${field("Дата", `reviews.${i}.date`, r.date)}
        ${field("Аватар (URL или путь)", `reviews.${i}.avatar`, r.avatar)}
        ${field("Фото товара (путь)", `reviews.${i}.productImage`, r.productImage || "")}
        <div class="admin-field admin-field--row">
          <button type="button" class="btn btn--ghost btn--small" data-apply-review-path="${i}">Применить путь</button>
          <label class="admin-file-btn btn btn--ghost btn--small">
            Выбрать фото
            <input type="file" accept="image/*,.png,.jpg,.jpeg,.webp,.gif" hidden data-upload-review="${i}" />
          </label>
          <span class="admin-file-name" data-review-file-label="${i}"></span>
        </div>
        ${field("Текст", `reviews.${i}.text`, r.text, "textarea")}
        ${field("Подпись", `reviews.${i}.author`, r.author)}
      </div>`;
        })
        .join("") +
      `<button type="button" class="btn btn--ghost" id="addReviewBtn">+ Добавить отзыв</button>`;

    panel.querySelectorAll("[data-review-pick]").forEach((sel) => {
      sel.addEventListener("change", async () => {
        const i = Number(sel.dataset.reviewPick);
        if (!sel.value) return;
        const pathInput = panel.querySelector(
          `[data-path="reviews.${i}.productImage"]`
        );
        if (pathInput) pathInput.value = sel.value;
        await applyReviewPath(i);
        sel.value = "";
      });
    });

    panel.querySelectorAll("[data-apply-review-path]").forEach((btn) => {
      btn.addEventListener("click", () => {
        applyReviewPath(Number(btn.dataset.applyReviewPath));
      });
    });

    panel.querySelectorAll("[data-upload-review]").forEach((input) => {
      input.addEventListener("change", async () => {
        const file = input.files?.[0];
        const i = Number(input.dataset.uploadReview);
        const nameEl = panel.querySelector(`[data-review-file-label="${i}"]`);
        if (!file) {
          if (nameEl) nameEl.textContent = "";
          return;
        }
        if (nameEl) nameEl.textContent = file.name;
        try {
          const dataUrl = await compressImage(file, 700);
          const safeName = file.name.replace(/[^\w.\-а-яА-Я]+/gi, "_");
          const path = `assets/products/${safeName}`;
          content.reviews[i].productImageDataUrl = dataUrl;
          content.reviews[i].productImage = path;
          const pathInput = panel.querySelector(
            `[data-path="reviews.${i}.productImage"]`
          );
          if (pathInput) pathInput.value = path;
          const prev = panel.querySelector(`[data-review-preview="${i}"]`);
          if (prev) prev.src = dataUrl;
          downloadBlob(file, safeName);
          persistToSite({ skipCollect: true });
        } catch {
          showToast("Не удалось обработать фото");
        }
        input.value = "";
      });
    });

    panel.querySelectorAll("[data-remove-review]").forEach((btn) => {
      btn.addEventListener("click", () => {
        content.reviews.splice(Number(btn.dataset.removeReview), 1);
        renderReviews();
      });
    });

    $("#addReviewBtn")?.addEventListener("click", () => {
      content.reviews.push({
        name: "Гость",
        date: "2026",
        avatar: "https://via.placeholder.com/80",
        productImage: "https://picsum.photos/600/380",
        text: "«Новый отзыв»",
        author: "— Товар",
      });
      renderReviews();
    });
  }

  function renderContacts() {
    const c = content.contacts;
    $("#panel-contacts").innerHTML = `
      ${field("Название мастерской", "contacts.workshopTitle", c.workshopTitle)}
      ${field("Текст", "contacts.text", c.text, "textarea")}
      ${field("Телефон", "contacts.phone", c.phone)}
      ${field("Ссылка ВК", "contacts.vkUrl", c.vkUrl)}
      ${field("Подпись ВК", "contacts.vkLabel", c.vkLabel)}
      ${field("Ссылка Telegram", "contacts.telegramUrl", c.telegramUrl)}
      ${field("Подпись Telegram", "contacts.telegramLabel", c.telegramLabel)}
      ${field("Ссылка Max", "contacts.maxUrl", c.maxUrl)}
      ${field("Подпись Max", "contacts.maxLabel", c.maxLabel)}
    `;
  }

  function renderSettings() {
    $("#panel-settings").innerHTML = `
      <p class="admin-hint">Смените пароль входа в кабинет. Запомните его — восстановление только через сброс настроек браузера.</p>
      <div class="admin-field">
        <label for="newPassword">Новый пароль</label>
        <input id="newPassword" type="password" />
      </div>
      <button type="button" class="btn btn--primary" id="changePasswordBtn">Сменить пароль</button>
    `;

    $("#changePasswordBtn")?.addEventListener("click", () => {
      const p = $("#newPassword").value.trim();
      if (p.length < 4) {
        showToast("Пароль слишком короткий");
        return;
      }
      const settings = window.SiteStore.getSettings();
      settings.password = p;
      window.SiteStore.saveSettings(settings);
      showToast("Пароль обновлён");
    });
  }

  function renderAll() {
    renderTexts();
    renderProducts();
    renderReviews();
    renderContacts();
    renderSettings();
  }

  function collectAllPanels() {
    const thumbsBefore = content.products.map((p) => p.thumb);
    const reviewPathsBefore = content.reviews.map((r) => r.productImage);
    ["panel-texts", "panel-products", "panel-reviews", "panel-contacts"].forEach((id) => {
      readForm($("#" + id));
    });
    content.products.forEach((p, i) => {
      const el = document.querySelector(`[data-path="products.${i}.price"]`);
      if (el) p.price = Number(el.value) || 0;
      if (thumbsBefore[i] !== p.thumb) delete p.thumbDataUrl;
    });
    content.reviews.forEach((r, i) => {
      if (reviewPathsBefore[i] !== r.productImage) delete r.productImageDataUrl;
    });
  }

  function fileToDataUrl(file) {
    return new Promise((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve(r.result);
      r.onerror = reject;
      r.readAsDataURL(file);
    });
  }

  function showApp() {
    $("#loginScreen").classList.add("hidden");
    $("#adminApp").classList.remove("hidden");
    content = window.SiteStore.loadContent();
    renderAll();
  }

  function bindTabs() {
    document.querySelectorAll(".admin-tab").forEach((tab) => {
      tab.addEventListener("click", () => {
        document.querySelectorAll(".admin-tab").forEach((t) => t.classList.remove("admin-tab--active"));
        document.querySelectorAll(".admin-panel").forEach((p) => p.classList.remove("admin-panel--active"));
        tab.classList.add("admin-tab--active");
        $("#panel-" + tab.dataset.tab).classList.add("admin-panel--active");
      });
    });
  }

  $("#loginForm")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const pass = $("#loginPassword").value;
    if (window.SiteStore.checkPassword(pass)) {
      window.SiteStore.setSession(true);
      showApp();
    } else {
      showToast("Неверный пароль");
    }
  });

  $("#logoutBtn")?.addEventListener("click", () => {
    window.SiteStore.setSession(false);
    location.reload();
  });

  $("#saveBtn")?.addEventListener("click", () => {
    persistToSite();
  });

  $("#exportJsonBtn")?.addEventListener("click", () => {
    collectAllPanels();
    window.SiteStore.exportJson(content);
    showToast("Файл site-content.json скачан");
  });

  $("#exportCatalogBtn")?.addEventListener("click", () => {
    collectAllPanels();
    window.SiteStore.exportCatalogJs(content);
    showToast("Файл catalog.js скачан");
  });

  $("#importJson")?.addEventListener("change", async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      content = JSON.parse(text);
      const result = window.SiteStore.saveContent(content);
      if (result.content) content = result.content;
      renderAll();
      showToast(result.ok ? "JSON загружен и сохранён" : result.warning);
    } catch {
      showToast("Ошибка чтения JSON");
    }
    e.target.value = "";
  });

  $("#resetBtn")?.addEventListener("click", () => {
    if (!confirm("Сбросить все правки в браузере?")) return;
    window.SiteStore.clearContent();
    content = window.SiteStore.buildDefaultContent();
    window.SiteStore.saveContent(content);
    renderAll();
    showToast("Сброшено. Обновите index.html (Ctrl+F5)");
  });

  bindTabs();

  if (window.SiteStore.hasSession()) {
    showApp();
  }
})();
