/**
 * Синхронизация мини-каталога с VK Маркетом (альбом album_1).
 *
 *   set VK_ACCESS_TOKEN=ваш_токен
 *   node scripts/sync-vk-catalog.js
 *
 * Токен: https://vk.com/apps?act=manage → приложение → ключ доступа
 * (нужны права market, groups; для группы 202321163).
 */
const fs = require("fs");
const path = require("path");

const OWNER_ID = -202321163;
const ALBUM_ID = 1;
const API_VERSION = "5.199";
const TOKEN = process.env.VK_ACCESS_TOKEN || process.env.VK_TOKEN;

const OUT_JS = path.join(__dirname, "..", "assets", "catalog.js");
const OUT_JSON = path.join(__dirname, "..", "data", "vk-album-1.json");

async function vk(method, params) {
  const url = new URL(`https://api.vk.com/method/${method}`);
  url.searchParams.set("access_token", TOKEN);
  url.searchParams.set("v", API_VERSION);
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null) url.searchParams.set(k, String(v));
  }
  const res = await fetch(url);
  const data = await res.json();
  if (data.error) {
    const e = new Error(data.error.error_msg || "VK API error");
    e.code = data.error.error_code;
    throw e;
  }
  return data.response;
}

function slugify(s) {
  return String(s)
    .toLowerCase()
    .replace(/[^a-zа-яё0-9]+/gi, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48);
}

function inferType(title, desc) {
  const t = `${title} ${desc}`.toLowerCase();
  if (/3d|3д|объ[её]м|пазл|конструктор|ночник|светильник/.test(t)) return ["3d"];
  if (/персонал|имя|гравир|надпис|дата|шкатул|таблич/.test(t)) return ["personal"];
  return ["decor"];
}

function inferTags(title, desc) {
  const t = `${title} ${desc}`.toLowerCase();
  const tags = new Set(["фанера"]);
  if (/3d|3д/.test(t)) tags.add("3d");
  if (/имя|гравир|надпис/.test(t)) tags.add("имя");
  if (/дом|ключ|прихож|органайзер|подстав/.test(t)) tags.add("дом");
  if (/дет|реб/.test(t)) tags.add("дети");
  if (/карт|панно|декор|лес/.test(t)) tags.add("декор");
  return [...tags];
}

function inferTarget(title, desc) {
  const t = `${title} ${desc}`.toLowerCase();
  const targets = new Set(["any"]);
  if (/дет|мам|семь|реб/.test(t)) targets.add("family");
  if (/парн|муж|пап/.test(t)) targets.add("guy");
  if (/друг|коллег/.test(t)) targets.add("friends");
  return [...targets];
}

function mapItem(item) {
  const title = item.title?.trim() || "Товар";
  const desc = (item.description || "").replace(/<[^>]+>/g, " ").trim();
  const priceRub =
    typeof item.price === "object" && item.price?.amount
      ? Math.round(Number(item.price.amount) / 100)
      : Number(item.price) || 0;

  return {
    id: `vk-${item.id}`,
    name: title,
    price: priceRub,
    tags: inferTags(title, desc),
    target: inferTarget(title, desc),
    type: inferType(title, desc),
    personalizable: /имя|гравир|надпис|дата|персонал/i.test(`${title} ${desc}`),
    description: desc || "Лазерная резка, фанера. Срок уточняется в мастерской.",
    vkUrl: `https://vk.com/market-${Math.abs(OWNER_ID)}?w=product${OWNER_ID}_${item.id}`,
    thumb: item.thumb_photo || item.photo?.sizes?.[0]?.url || "",
  };
}

async function fetchAllItems() {
  const items = [];
  let offset = 0;

  for (;;) {
    const res = await vk("market.get", {
      owner_id: OWNER_ID,
      album_id: ALBUM_ID,
      count: 200,
      offset,
      extended: 0,
    });

    const batch = res.items || [];
    items.push(...batch);

    const total = res.count ?? items.length;
    if (!batch.length || items.length >= total) break;
    offset += batch.length;
  }

  if (!items.length) {
    const res = await vk("market.get", {
      owner_id: OWNER_ID,
      count: 200,
      offset: 0,
    });
    return (res.items || []).map(mapItem);
  }

  return items.map(mapItem);
}

function writeOutputs(products) {
  const syncedAt = new Date().toISOString();
  const meta = {
    source: `https://vk.com/market-${Math.abs(OWNER_ID)}?section=album_${ALBUM_ID}`,
    ownerId: OWNER_ID,
    albumId: ALBUM_ID,
    syncedAt,
    count: products.length,
  };

  fs.mkdirSync(path.dirname(OUT_JSON), { recursive: true });
  fs.writeFileSync(OUT_JSON, JSON.stringify({ meta, products }, null, 2), "utf8");

  const js = `/* Автогенерация: node scripts/sync-vk-catalog.js */
window.CATALOG_META = ${JSON.stringify(meta, null, 2)};
window.CATALOG_PRODUCTS = ${JSON.stringify(products, null, 2)};
`;

  fs.writeFileSync(OUT_JS, js, "utf8");
  console.log(`OK: ${products.length} товаров → ${OUT_JS}`);
}

async function main() {
  if (!TOKEN) {
    console.error(
      "Нужен VK_ACCESS_TOKEN (или VK_TOKEN).\n" +
        "Получите токен в VK для разработчиков и запустите:\n" +
        "  set VK_ACCESS_TOKEN=... && node scripts/sync-vk-catalog.js"
    );
    process.exit(1);
  }

  if (typeof fetch !== "function") {
    console.error("Нужен Node.js 18+ (fetch).");
    process.exit(1);
  }

  const products = await fetchAllItems();
  if (!products.length) {
    console.warn("Товаров не найдено. Проверьте album_id и права токена.");
  }
  writeOutputs(products);
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
