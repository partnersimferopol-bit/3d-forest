const fs = require("fs");
const path = require("path");

const srcDir = path.join(
  process.env.USERPROFILE || "",
  ".cursor",
  "projects",
  "f",
  "assets"
);
const destDir = path.join(__dirname, "..", "assets", "products");

const destNames = [
  "drakon.png",
  "kalendar-karandash.png",
  "kupyurnitsa.png",
  "karandashnitsa.png",
  "medalki.jpg",
  "nardy.png",
  "podstavka-ruchka.png",
  "cheburashka.png",
];

fs.mkdirSync(destDir, { recursive: true });

if (!fs.existsSync(srcDir)) {
  console.warn("skip: no", srcDir);
  process.exit(0);
}

const files = fs
  .readdirSync(srcDir)
  .filter((f) => /\.(png|jpe?g|webp)$/i.test(f))
  .map((f) => ({
    name: f,
    mtime: fs.statSync(path.join(srcDir, f)).mtimeMs,
  }))
  .sort((a, b) => a.mtime - b.mtime)
  .map((x) => x.name);

destNames.forEach((dest, i) => {
  const src = files[i];
  if (!src) return;
  fs.copyFileSync(path.join(srcDir, src), path.join(destDir, dest));
  console.log(src, "->", dest);
});
