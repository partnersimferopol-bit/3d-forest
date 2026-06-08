const fs = require("fs");
const path = require("path");
const https = require("https");

const out = path.join(__dirname, "..", "assets", "splash-cursor.js");
const url =
  "https://raw.githubusercontent.com/DavidHDev/react-bits/main/src/content/Animations/SplashCursor/SplashCursor.jsx";

function fetchText(u) {
  return new Promise((resolve, reject) => {
    https
      .get(u, (res) => {
        if (res.statusCode === 301 || res.statusCode === 302) {
          return fetchText(res.headers.location).then(resolve, reject);
        }
        let data = "";
        res.on("data", (c) => (data += c));
        res.on("end", () => resolve(data));
      })
      .on("error", reject);
  });
}

function port(src) {
  const start = src.indexOf("let isActive = true;");
  const end = src.indexOf("// Cleanup function");
  if (start < 0 || end < 0) throw new Error("Could not locate effect body");

  let body = src.slice(start, end);
  body = body.replace(/animationFrameId\.current/g, "animationFrameId");

  const paramNames = [
    "SIM_RESOLUTION",
    "DYE_RESOLUTION",
    "CAPTURE_RESOLUTION",
    "DENSITY_DISSIPATION",
    "VELOCITY_DISSIPATION",
    "PRESSURE",
    "PRESSURE_ITERATIONS",
    "CURL",
    "SPLAT_RADIUS",
    "SPLAT_FORCE",
    "SHADING",
    "COLOR_UPDATE_SPEED",
    "BACK_COLOR",
    "TRANSPARENT",
    "RAINBOW_MODE",
    "COLOR",
  ];

  const destructuring = paramNames.join(",\n      ");

  return `/**
 * SplashCursor — fluid trail (react-bits), vanilla port
 */
(() => {
  function initSplashCursor(userConfig = {}) {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return () => {};
    }

    const {
      ${destructuring}
    } = {
      SIM_RESOLUTION: 128,
      DYE_RESOLUTION: 1440,
      CAPTURE_RESOLUTION: 512,
      DENSITY_DISSIPATION: 3.5,
      VELOCITY_DISSIPATION: 2,
      PRESSURE: 0.1,
      PRESSURE_ITERATIONS: 20,
      CURL: 3,
      SPLAT_RADIUS: 0.2,
      SPLAT_FORCE: 6000,
      SHADING: true,
      COLOR_UPDATE_SPEED: 10,
      BACK_COLOR: { r: 0.5, g: 0, b: 0 },
      TRANSPARENT: true,
      RAINBOW_MODE: false,
      COLOR: "#b87333",
      ...userConfig,
    };

    const layer = document.createElement("motion");
    layer.className = "splash-cursor-layer";
    layer.style.cssText =
      "position:fixed;inset:0;z-index:9999;pointer-events:none;width:100%;height:100%";

    const canvas = document.createElement("canvas");
    canvas.id = "fluid";
    canvas.style.cssText = "width:100vw;height:100vh;display:block";
    layer.appendChild(canvas);
    document.body.appendChild(layer);

    let animationFrameId = null;
    ${body}

    return () => {
      isActive = false;
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
      }
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
      layer.remove();
    };
  }

  function boot() {
    initSplashCursor();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }

  window.initSplashCursor = initSplashCursor;
})();
`;
}

async function main() {
  const src = await fetchText(url);
  let code = port(src);
  code = code.replace(/createElement\("motion"\)/g, 'createElement("div")');
  fs.writeFileSync(out, code, "utf8");
  console.log("Wrote", out);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
