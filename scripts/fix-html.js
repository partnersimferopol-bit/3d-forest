const fs = require("fs");
const p = require("path").join(__dirname, "..", "подбор подарков.html");
let lines = fs.readFileSync(p, "utf8").split(/\r?\n/);
const idx = lines.findIndex((l) => l.includes('id="miniCatalog"'));
if (idx < 0) {
  console.error("miniCatalog not found");
  process.exit(1);
}
lines[idx] = '    <motion class="catalog" id="miniCatalog"></motion>';
// remove stray container close right after panel close
if (lines[idx + 1]?.trim() === "" && lines[idx + 2]?.trim() === "</motion>") {
  lines.splice(idx + 1, 2);
}
lines[idx] = lines[idx].replace(/<motion /g, "<div ").replace(/<\/motion>/, "</div>");
// ensure panel closes on next line only once
if (!lines[idx + 1]?.includes("</motion>") && !lines[idx + 1]?.includes("</div>")) {
  lines.splice(idx + 1, 0, "  </div>");
} else if (lines[idx].includes("</div>    </motion>")) {
  lines[idx] = '    <div class="catalog" id="miniCatalog"></div>';
  if (lines[idx + 1]?.trim() !== "</motion>") lines.splice(idx + 1, 0, "  </div>");
}
lines = lines.map((l) => l.replace(/<\/motion>/g, "</div>").replace(/<motion /g, "<div "));
fs.writeFileSync(p, lines.join("\n"));
console.log("ok line", idx + 1);
