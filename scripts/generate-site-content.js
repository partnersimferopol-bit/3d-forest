/**
 * Генерирует assets/site-content.json из catalog.js (для GitHub Pages).
 * Запуск: node scripts/generate-site-content.js
 */
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = path.join(__dirname, "..");
const catalogPath = path.join(root, "assets", "catalog.js");
const outPath = path.join(root, "assets", "site-content.json");

const ctx = { window: {} };
vm.runInContext(fs.readFileSync(catalogPath, "utf8"), vm.createContext(ctx));
const products = JSON.parse(JSON.stringify(ctx.window.CATALOG_PRODUCTS || []));

const content = {
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

fs.writeFileSync(outPath, JSON.stringify(content, null, 2) + "\n", "utf8");
console.log("Written:", outPath);
