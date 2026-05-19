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
        emblem: "эмблема.png",
      },
      sections: {
        whyTitle: "Почему наши подарки не как у всех",
        howTitle: "Как это работает",
        popularTitle: "Популярные подарки",
        catalogTitle: "Мини-каталог",
        builderTitle: "Соберите свой подарок",
        builderTagline: "Параметры и текст сразу попадают в предпросмотр",
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
          avatar:
            "https://via.placeholder.com/80x80/ffebee/7a4f22?text=%D0%90",
          productImage: "https://picsum.photos/id/1015/600/380",
          text: "«Дарила мужу на годовщину. Он реально прослезился. Говорит, что это лучший подарок за все годы.»",
          author: "— Панно с координатами",
        },
        {
          name: "Екатерина, 34 года",
          date: "май 2026",
          avatar:
            "https://via.placeholder.com/80x80/e8dfd4/7a4f22?text=%D0%95",
          productImage: "https://picsum.photos/id/201/600/380",
          text: "«Сделали именное панно для детской. Ребёнок теперь каждый вечер просит почитать надпись.»",
          author: "— Именное панно",
        },
        {
          name: "Мария, 31 год",
          date: "апрель 2026",
          avatar:
            "https://via.placeholder.com/80x80/f5f0e6/7a4f22?text=%D0%9C",
          productImage: "https://picsum.photos/id/237/600/380",
          text: "«Заказывала срочно за 2 дня. Качество огонь! Мама до сих пор в восторге.»",
          author: "— Срочный подарок маме",
        },
        {
          name: "Ольга, 27 лет",
          date: "апрель 2026",
          avatar:
            "https://via.placeholder.com/80x80/fff3e0/7a4f22?text=%D0%9E",
          productImage: "https://picsum.photos/id/133/600/380",
          text: "«Подарок парню с координатами первого свидания. Сказал, что никогда ничего подобного не получал.»",
          author: "— Карта с координатами",
        },
        {
          name: "Ирина, 35 лет",
          date: "март 2026",
          avatar:
            "https://via.placeholder.com/80x80/e8eaf6/7a4f22?text=%D0%98",
          productImage: "https://picsum.photos/id/180/600/380",
          text: "«Все гости на свадьбе спрашивали, где такое заказать. Очень красиво и душевно.»",
          author: "— Свадебный подарок",
        },
        {
          name: "Настя, 29 лет",
          date: "март 2026",
          avatar:
            "https://via.placeholder.com/80x80/fce4ec/7a4f22?text=%D0%9D",
          productImage: "https://picsum.photos/id/251/600/380",
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

  function getProductImage(product) {
    if (product.thumbDataUrl) return product.thumbDataUrl;
    return product.thumb || "";
  }

  function getReviewProductImage(review) {
    if (review.productImageDataUrl) return review.productImageDataUrl;
    return review.productImage || "";
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
          if (!r.productImageDataUrl) return r;
          const copy = { ...r };
          delete copy.productImageDataUrl;
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

  function loadContent() {
    const stored = loadFromStorage();
    if (stored) return stored;
    return buildDefaultContent();
  }

  async function loadContentAsync() {
    const stored = loadFromStorage();
    if (stored) return stored;
    const file = await loadFromFile();
    if (file) return file;
    return buildDefaultContent();
  }

  function exportJson(content) {
    const blob = new Blob([JSON.stringify(content, null, 2)], {
      type: "application/json",
    });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "site-content.json";
    a.click();
    URL.revokeObjectURL(a.href);
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
    saveContent,
    exportJson,
    exportCatalogJs,
    getProductImage,
    getReviewProductImage,
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
