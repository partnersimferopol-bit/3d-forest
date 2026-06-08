const fs = require("fs");
const path = require("path");

const srcBase = path.join(
  process.env.USERPROFILE,
  ".cursor",
  "projects",
  "f",
  "assets"
);
const root = path.join(__dirname, "..");
const productsDir = path.join(root, "assets", "products");

/** Порядок как в приложенных файлах пользователя */
const map = [
  ["f__________________________________.png", path.join(root, "эмблема.png")],
  ["f_________________________________.png", path.join(productsDir, "drakon.png")],
  [
    "f______________________________________________.png",
    path.join(productsDir, "kalendar-karandash.png"),
  ],
  ["f____________________________________.png", path.join(productsDir, "kupyurnitsa.png")],
  ["f________________________________.png", path.join(productsDir, "nardy.png")],
  [
    "f_______________________________________.png",
    path.join(productsDir, "karandashnitsa.png"),
  ],
  ["f___________________________________.jpg", path.join(productsDir, "medalki.jpg")],
  [
    "f______________________________________________.png",
    path.join(productsDir, "podstavka-ruchka.png"),
  ],
  ["f____________________________________.png", path.join(productsDir, "cheburashka.png")],
];

fs.mkdirSync(productsDir, { recursive: true });

if (!fs.existsSync(srcBase)) {
  console.error("Нет папки:", srcBase);
  process.exit(1);
}

for (const [srcName, dest] of map) {
  const src = path.join(srcBase, srcName);
  if (!fs.existsSync(src)) {
    console.warn("пропуск (нет файла):", srcName);
    continue;
  }
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(src, dest);
  console.log("OK", path.basename(dest));
}

console.log("готово");
