const fs = require("fs");
const path = require("path");

const p = path.join(__dirname, "..", "подбор подарков.html");
let h = fs.readFileSync(p, "utf8");

const blockStart = "    <!-- Карточки: иконка";
const blockEnd = "    </motion>\n\n  </motion>";
const blockEndAlt = "    </div>\n\n  </div>";

const i = h.indexOf(blockStart);
let j = h.indexOf(blockEnd, i);
if (j < 0) j = h.indexOf(blockEndAlt, i);
if (i < 0 || j < 0) {
  console.error("block not found", i, j);
  process.exit(1);
}

const repl = `    <p class="hint" id="catalogHint"></p>
    <div class="catalog" id="miniCatalog"></div>`;

h = h.slice(0, i) + repl + h.slice(j);

if (!h.includes('src="assets/catalog.js"')) {
  h = h.replace(
    "<script>\n\nfunction calculate",
    '<script src="assets/catalog.js"></script>\n<script>\n\nfunction calculate'
  );
}

const renderFn = `
function renderMiniCatalog() {
  const grid = document.getElementById("miniCatalog");
  const hint = document.getElementById("catalogHint");
  if (!grid) return;
  const list =
    window.CATALOG_PRODUCTS && window.CATALOG_PRODUCTS.length
      ? window.CATALOG_PRODUCTS
      : [
          { name: "Мини-лес", price: 2990 },
          { name: "3D лес с именем", price: 4990 },
        ];
  if (hint) {
    hint.textContent = window.CATALOG_META?.syncedAt
      ? "Синхронизировано с VK: " +
        new Date(window.CATALOG_META.syncedAt).toLocaleString("ru-RU")
      : "Каталог VK: https://vk.com/market-202321163?section=album_1";
  }
  const fmt = (n) => new Intl.NumberFormat("ru-RU").format(n) + " ₽";
  grid.innerHTML = list
    .map(
      (p) =>
        '<div class="product"><div class="wood-slice-wrap"><div class="wood-slice" role="img" aria-label="Стилизация среза дерева"><span class="wood-slice-label">фанера</span></motion></div><p><strong>' +
        p.name +
        "</strong></p><p class=\\"price\\">" +
        fmt(p.price) +
        "</p></div>"
    )
    .join("");
}
`.replace(/<\/motion>/g, "</div>");

if (!h.includes("function renderMiniCatalog")) {
  h = h.replace("window.onload = () => {", renderFn + "\nwindow.onload = () => {");
  h = h.replace(
    "calculate();\n}\n};",
    "calculate();\n}\nrenderMiniCatalog();\n};"
  );
}

fs.writeFileSync(p, h);
console.log("patched", p);
