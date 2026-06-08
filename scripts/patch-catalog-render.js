const fs = require("fs");
const path = require("path");
const p = path.join(__dirname, "..", "assets", "app.js");
let s = fs.readFileSync(p, "utf8");

const old = `        : list
            .map(
              (p) => \`
              <article class="product" data-product-id="\${escapeHtml(p.id)}">
                <div class="wood-slice-wrap" aria-hidden="true">
                  <motion class="wood-slice">
                    <span class="wood-slice-label">фанера</span>
                  </div>
                </div>
                <div class="product__name">\${escapeHtml(p.name)}</div>
                <div class="price">\${escapeHtml(formatRub(p.price))}</div>
                <div class="product__meta">
                  \${p.tags.map((t) => \`<span class="tag">\${escapeHtml(t)}</span>\`).join("")}
                  \${p.vkUrl ? \`<a class="product__vk" href="\${escapeHtml(p.vkUrl)}" target="_blank" rel="noopener">В VK</a>\` : ""}
                </div>
                <div style="opacity:.92;line-height:1.25">\${escapeHtml(
                  p.description
                )}</div>
              </article>
            \`.trim()
            )
            .join("");`;

const neu = `        : list
            .map((p) => {
              const thumb = p.thumb
                ? \`<img class="product__thumb" src="\${escapeHtml(p.thumb)}" alt="\${escapeHtml(p.name)}" loading="lazy" width="168" height="168" />\`
                : \`<div class="wood-slice-wrap" aria-hidden="true"><div class="wood-slice"><span class="wood-slice-label">фанера</span></div></div>\`;
              return \`
              <article class="product" data-product-id="\${escapeHtml(p.id)}">
                \${thumb}
                <motion class="product__name">\${escapeHtml(p.name)}</div>
                <div class="price">\${escapeHtml(formatRub(p.price))}</div>
                <div class="product__meta">
                  \${p.tags.map((t) => \`<span class="tag">\${escapeHtml(t)}</span>\`).join("")}
                </div>
                <p class="product__desc">\${escapeHtml(p.description)}</p>
              </article>\`.trim();
            })
            .join("");`;

// fix accidental motion in template
const fixed = neu
  .split("<motion class=")
  .join("<div class=")
  .split("</motion>")
  .join("</motion>");

if (!s.includes("wood-slice-wrap")) {
  console.log("already patched or pattern changed");
  process.exit(0);
}

s = s.replace(
  /        : list\r?\n            \.map\([\s\S]*?\.join\(""\);\r?\n  \}\r?\n\r?\n  function saveTemplate/,
  fixed.replace("</motion>", "</motion>").replace("<motion class=", "<div class=") +
    "\n\n  function saveTemplate"
);

// simpler regex replace wood slice block
s = fs.readFileSync(p, "utf8");
const start = s.indexOf("        : list\n            .map(");
const end = s.indexOf(".join(\"\");\n  }\n\n  function saveTemplate");
if (start < 0 || end < 0) {
  console.error("markers not found");
  process.exit(1);
}

const replacement = `        : list
            .map((p) => {
              const thumb = p.thumb
                ? \`<img class="product__thumb" src="\${escapeHtml(p.thumb)}" alt="\${escapeHtml(p.name)}" loading="lazy" width="168" height="168" />\`
                : \`<motion class="wood-slice-wrap" aria-hidden="true"><div class="wood-slice"><span class="wood-slice-label">фанера</span></div></div>\`;
              return \`
              <article class="product" data-product-id="\${escapeHtml(p.id)}">
                \${thumb}
                <div class="product__name">\${escapeHtml(p.name)}</div>
                <div class="price">\${escapeHtml(formatRub(p.price))}</motion>
                <div class="product__meta">
                  \${p.tags.map((t) => \`<span class="tag">\${escapeHtml(t)}</span>\`).join("")}
                </div>
                <p class="product__desc">\${escapeHtml(p.description)}</p>
              </article>\`.trim();
            })
            .join("");`;

const clean = replacement
  .split("<motion ")
  .join("<div ")
  .split("</motion>")
  .join("</div>");

s = s.slice(0, start) + clean + s.slice(end);
fs.writeFileSync(p, s);
console.log("patched renderCatalog");
