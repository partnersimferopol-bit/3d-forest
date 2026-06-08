/**
 * Хранилище контента сайта: localStorage → site-content.json → catalog.js
 */
(() => {
  const STORAGE_KEY = "3dles-site-content-v1";
  const AUTH_KEY = "3dles-admin-session";
  const SETTINGS_KEY = "3dles-admin-settings";
  const DEFAULT_PASSWORD = "3dles2026";

  function getSettings() {
    try {
      return JSON.parse(localStorage.getItem(SETTINGS_KEY) || "{}");
    } catch {
      return {};
    }
  }

  function saveSettings(settings) {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  }

  function buildDefaultContent() {
    const products = Array.isArray(window.CATALOG_PRODUCTS)
      ? JSON.parse(JSON.stringify(window.CATALOG_PRODUCTS))
      : [];

    return {
      version: 1,
      updatedAt: new Date().toISOString(),
      meta: {
        title: "3Д-лес — Подарки со смыслом, которые запоминаются",
        description:
          "Персонализированные подарки из фанеры и 3D-печати. Именные изделия, от которых плачут от счастья и которые хранятся годами.",
      },
      hero: {
        title: "Подарки со смыслом,",
        titleLine2: "которые запоминаются навсегда",
        lead1: "Именные изделия из фанеры и 3D-печати.",
        lead2: "От которых плачут от счастья и которые хранят годами.",
        badge: "Лазерная резка · Фанера · 3D-печать",
        emblem: "assets/products/эмблема.png",
      },
      sections: {
        whyTitle: "Почему наши подарки не как у всех",
        howTitle: "Как это работает",
        popularTitle: "Популярные подарки",
        catalogTitle: "Мини-каталог",
        builderTitle: "Подарок из Будущего",
        builderTagline:
          "Пройдите 6 шагов — мастер из будущего подскажет идею персонального подарка",
        reviewsTitle: "Они уже подарили эмоции",
        reviewsSubtitle: "Реальные истории и реакции наших клиентов",
        reviewsCta: "Хотите такой же подарок, от которого будут эмоции?",
        contactsTitle: "Контакты",
      },
      benefits: [
        {
          title: "Со смыслом",
          text: "Имя, дата, ваша история, координаты — делаем по-настоящему личное",
        },
        {
          title: "Вызывают эмоции",
          text: "Реальные реакции «вау» и слёзы счастья — это норма",
        },
        {
          title: "Остаются на годы",
          text: "Не пылится на полке. Становится семейной ценностью",
        },
      ],
      steps: [
        {
          title: "Выбираете параметры",
          text: "Кому подарок, тип изделия, персонализацию и срок.",
        },
        {
          title: "Получаете рекомендации",
          text: "Мы подскажем 3 лучших варианта.",
        },
        {
          title: "Сохраняете или заказываете",
          text: "Готовый текст + ориентировочная цена.",
        },
      ],
      products,
      reviews: [
        {
          name: "Алина, 28 лет",
          date: "май 2026",
          avatar: "",
          productImage: "assets/products/kalendar-karandash.png",
          text: "«Дарила мужу на годовщину. Он реально прослезился. Говорит, что это лучший подарок за все годы.»",
          author: "— Панно с координатами",
        },
        {
          name: "Екатерина, 34 года",
          date: "май 2026",
          avatar: "",
          productImage: "assets/products/kalendar-karandash.png",
          text: "«Сделали именное панно для детской. Ребёнок теперь каждый вечер просит почитать надпись.»",
          author: "— Именное панно",
        },
        {
          name: "Мария, 31 год",
          date: "апрель 2026",
          avatar: "",
          productImage: "assets/products/kupyurnitsa.png",
          text: "«Заказывала срочно за 2 дня. Качество огонь! Мама до сих пор в восторге.»",
          author: "— Срочный подарок маме",
        },
        {
          name: "Ольга, 27 лет",
          date: "апрель 2026",
          avatar: "",
          productImage: "assets/products/nardy.png",
          text: "«Подарок парню с координатами первого свидания. Сказал, что никогда ничего подобного не получал.»",
          author: "— Карта с координатами",
        },
        {
          name: "Ирина, 35 лет",
          date: "март 2026",
          avatar: "",
          productImage: "assets/products/kupyurnitsa.png",
          text: "«Все гости на свадьбе спрашивали, где такое заказать. Очень красиво и душевно.»",
          author: "— Свадебный подарок",
        },
        {
          name: "Настя, 29 лет",
          date: "март 2026",
          avatar: "",
          productImage: "assets/products/podstavka-ruchka.png",
          text: "«Заказывала уже третий раз. Качество стабильно высокое.»",
          author: "— Декор для дома",
        },
      ],
      contacts: {
        workshopTitle: "Мастерская «3Д-лес»",
        text: "Напишите нам, чтобы уточнить детали.",
        phone: "+7 (___) ___-__-__",
        vkUrl: "https://vk.com/3d_les",
        vkLabel: "vk.com/3d_les",
        telegramUrl: "https://web.telegram.org/a/#-1003332873905",
        telegramLabel: "чат в Telegram",
        maxUrl: "https://m-x.su/les-3d",
        maxLabel: "m-x.su/les-3d",
      },
    };
  }

  function loadFromStorage() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  async function loadFromFile() {
    try {
      const res = await fetch("assets/site-content.json", { cache: "no-store" });
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  }

  function resolveAssetPath(path) {
    let p = String(path || "")
      .trim()
      .replace(/\\/g, "/");
    if (!p || /^(data:|https?:)/i.test(p)) return p;

    const assetsIdx = p.toLowerCase().indexOf("assets/products/");
    if (assetsIdx >= 0) return p.slice(assetsIdx);

    const fileName = p.split("/").pop() || "";
    if (/\.(png|jpe?g|webp|gif|svg)$/i.test(fileName)) {
      return `assets/products/${fileName}`;
    }

    return p.startsWith("assets/") ? p : `assets/products/${p.replace(/^\.?\//, "")}`;
  }

  function letterAvatarDataUrl(letter, bg = "e8dfd4", fg = "7a4f22") {
    const ch = String(letter || "?")
      .trim()
      .charAt(0)
      .toUpperCase();
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80"><rect fill="#${bg}" width="80" height="80" rx="40"/><text x="40" y="48" text-anchor="middle" dominant-baseline="middle" fill="#${fg}" font-size="34" font-family="Arial,sans-serif">${ch}</text></svg>`;
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  }

  function getProductImage(product) {
    if (product?.thumbDataUrl) return product.thumbDataUrl;
    const path = product?.thumb || "";
    if (/^data:/i.test(path)) return path;
    if (/^https?:\/\//i.test(path)) return path;
    return resolveAssetPath(path);
  }

  function getReviewProductImage(review) {
    if (review?.productImageDataUrl) return review.productImageDataUrl;
    const path = review?.productImage || "";
    if (/^data:/i.test(path)) return path;
    if (/^https?:\/\//i.test(path)) return path;
    return resolveAssetPath(path);
  }

  function getReviewAvatar(review) {
    if (review?.avatarDataUrl) return review.avatarDataUrl;
    const path = review?.avatar || "";
    if (/via\.placeholder\.com/i.test(path)) {
      return letterAvatarDataUrl(review?.name || "?");
    }
    if (/^data:/i.test(path)) return path;
    if (/^https?:\/\//i.test(path)) return path;
    if (path) return resolveAssetPath(path);
    return letterAvatarDataUrl(review?.name || "?");
  }

  function migrateReviewImages(review) {
    if (!review || typeof review !== "object") return review;
    const copy = { ...review };
    if (/via\.placeholder\.com/i.test(copy.avatar || "")) {
      copy.avatar = "";
    }
    if (
      !copy.productImageDataUrl &&
      /^https?:\/\//i.test(copy.productImage || "") &&
      !/^data:/i.test(copy.productImage || "")
    ) {
      copy.productImage = "assets/products/kalendar-karandash.png";
    }
    return copy;
  }

  function saveContent(content) {
    content.updatedAt = new Date().toISOString();
    const json = JSON.stringify(content);
    try {
      localStorage.setItem(STORAGE_KEY, json);
      return { ok: true, content, warning: null };
    } catch (err) {
      if (err && err.name === "QuotaExceededError") {
        const lean = JSON.parse(json);
        lean.products = (lean.products || []).map((p) => {
          if (!p.thumbDataUrl) return p;
          const copy = { ...p };
          delete copy.thumbDataUrl;
          return copy;
        });
        lean.reviews = (lean.reviews || []).map((r) => {
          if (!r.productImageDataUrl && !r.avatarDataUrl) return r;
          const copy = { ...r };
          delete copy.productImageDataUrl;
          delete copy.avatarDataUrl;
          return copy;
        });
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(lean));
          return {
            ok: true,
            content: lean,
            warning:
              "Фото не поместились в память браузера. Тексты сохранены. Загрузите картинки в папку assets/products/ и укажите путь к файлу.",
          };
        } catch {
          return { ok: false, content, warning: "Не удалось сохранить: слишком много данных." };
        }
      }
      return { ok: false, content, warning: "Ошибка сохранения: " + (err.message || err) };
    }
  }

  function normalizeContacts(contacts) {
    const defaults = {
      vkUrl: "https://vk.com/3d_les",
      vkLabel: "vk.com/3d_les",
      telegramUrl: "https://web.telegram.org/a/#-1003332873905",
      telegramLabel: "чат в Telegram",
      maxUrl: "https://m-x.su/les-3d",
      maxLabel: "m-x.su/les-3d",
    };
    const c = { ...defaults, ...(contacts || {}) };
    const tg = String(c.telegramUrl || "").trim();
    if (!tg || /t\.me\/c\//i.test(tg)) {
      c.telegramUrl = defaults.telegramUrl;
    }
    if (!String(c.vkUrl || "").trim()) c.vkUrl = defaults.vkUrl;
    if (!String(c.maxUrl || "").trim()) c.maxUrl = defaults.maxUrl;
    return c;
  }

  function normalizeStoredContent(content) {
    if (!content) return content;
    if (Array.isArray(content.reviews)) {
      content.reviews = content.reviews.map(migrateReviewImages);
    }
    if (content.contacts) {
      content.contacts = normalizeContacts(content.contacts);
    }
    return content;
  }

  function isLocalPreview() {
    const host = location.hostname;
    return (
      location.protocol === "file:" ||
      host === "localhost" ||
      host === "127.0.0.1" ||
      /[?&]preview=1(?:&|$)/.test(location.search)
    );
  }

  function loadContent() {
    const stored = loadFromStorage();
    if (isLocalPreview() && stored) return normalizeStoredContent(stored);
    return buildDefaultContent();
  }

  async function loadContentForPage() {
    const fromFile = await loadFromFile();
    const fromStorage = loadFromStorage();

    if (isLocalPreview() && fromStorage) {
      return normalizeStoredContent(fromStorage);
    }
    if (fromFile) return normalizeStoredContent(fromFile);
    if (fromStorage) return normalizeStoredContent(fromStorage);
    return buildDefaultContent();
  }

  async function loadContentAsync() {
    return loadContentForPage();
  }

  /** Убирает тяжёлые data: из JSON для публикации на GitHub (остаются пути к файлам). */
  function prepareForPublish(content) {
    const copy = JSON.parse(JSON.stringify(content || {}));
    copy.updatedAt = new Date().toISOString();

    (copy.products || []).forEach((p) => {
      if (p.thumb && p.thumbDataUrl) delete p.thumbDataUrl;
    });
    (copy.reviews || []).forEach((r) => {
      if (r.productImage && r.productImageDataUrl) delete r.productImageDataUrl;
      if (r.avatar && r.avatarDataUrl) delete r.avatarDataUrl;
    });
    if (copy.hero?.emblem && copy.hero?.emblemDataUrl) {
      delete copy.hero.emblemDataUrl;
    }
    return copy;
  }

  function publishWarnings(content) {
    const warnings = [];
    (content.products || []).forEach((p, i) => {
      if (p.thumbDataUrl && !p.thumb) {
        warnings.push(`Товар «${p.name || i + 1}»: нет пути к файлу фото`);
      } else if (p.thumbDataUrl && p.thumb) {
        warnings.push(
          `Товар «${p.name || i + 1}»: положите файл ${p.thumb} в репозиторий`
        );
      }
    });
    return warnings;
  }

  function downloadJson(content, filename = "site-content.json") {
    const blob = new Blob([JSON.stringify(content, null, 2)], {
      type: "application/json",
    });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  function exportJson(content) {
    downloadJson(content);
  }

  function exportPublishJson(content) {
    const prepared = prepareForPublish(content);
    downloadJson(prepared, "site-content.json");
    return { prepared, warnings: publishWarnings(content) };
  }

  function exportCatalogJs(content) {
    const products = content.products || [];
    const body = `window.CATALOG_META = {
  source: "admin",
  syncedAt: "${new Date().toISOString()}",
  count: ${products.length},
};

window.CATALOG_PRODUCTS = ${JSON.stringify(products, null, 2)};
`;
    const blob = new Blob([body], { type: "text/javascript" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "catalog.js";
    a.click();
    URL.revokeObjectURL(a.href);
  }

  function checkPassword(password) {
    const settings = getSettings();
    const expected = settings.password || DEFAULT_PASSWORD;
    return password === expected;
  }

  function setSession(ok) {
    if (ok) sessionStorage.setItem(AUTH_KEY, String(Date.now()));
    else sessionStorage.removeItem(AUTH_KEY);
  }

  function hasSession() {
    return !!sessionStorage.getItem(AUTH_KEY);
  }

  window.SiteStore = {
    STORAGE_KEY,
    DEFAULT_PASSWORD,
    buildDefaultContent,
    loadContent,
    loadContentAsync,
    loadContentForPage,
    isLocalPreview,
    prepareForPublish,
    publishWarnings,
    saveContent,
    exportJson,
    exportPublishJson,
    exportCatalogJs,
    resolveAssetPath,
    getProductImage,
    getReviewProductImage,
    getReviewAvatar,
    letterAvatarDataUrl,
    getSettings,
    saveSettings,
    checkPassword,
    setSession,
    hasSession,
    clearContent() {
      localStorage.removeItem(STORAGE_KEY);
    },
  };
})();
