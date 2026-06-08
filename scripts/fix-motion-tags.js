const fs = require("fs");
const path = require("path");
const tag = "motion";
const p = path.join(__dirname, "..", "index.html");
let h = fs.readFileSync(p, "utf8");
h = h.split("</" + tag + ">").join("</div>");
h = h.split("<" + tag + " ").join("<div ");
fs.writeFileSync(p, h);
console.log("ok");
