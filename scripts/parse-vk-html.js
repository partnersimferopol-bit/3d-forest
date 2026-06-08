const fs = require("fs");
const path = require("path");

const html = fs.readFileSync(
  path.join(__dirname, "..", "vk-desktop.html"),
  "utf8"
);

const patterns = [
  /"title":"((?:\\.|[^"\\]){2,120})"/g,
  /"name":"((?:\\.|[^"\\]){2,120})"/g,
  /"price":\{"amount":"?(\d+)"?/g,
  /"price_text":"([^"]+)"/g,
  /market_item[^}]{0,400}/gi,
];

for (const re of patterns) {
  const hits = [...html.matchAll(re)].slice(0, 40);
  console.log("\n===", re.source.slice(0, 40), "count:", hits.length);
  hits.forEach((m) => console.log(m[0].slice(0, 120)));
}
