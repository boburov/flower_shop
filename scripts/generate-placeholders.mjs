/**
 * Generates tasteful SVG flower placeholders under public/images/flowers.
 *
 * These are intentional vector bouquets (soft gradient + layered petals), not
 * gray boxes, so the site looks finished during development. Swap them for real
 * photography by updating imageUrl on each product (local file or VPS URL).
 *
 * Run: node scripts/generate-placeholders.mjs
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = join(__dirname, "..", "public", "images", "flowers");
mkdirSync(OUT_DIR, { recursive: true });

const W = 800;
const H = 1000;

/** One flower: a ring of petals around a center, rendered as a <g>. */
function flower(cx, cy, scale, petal, center, petals = 9) {
  const parts = [];
  const r = 58 * scale; // petal distance from center
  const pw = 34 * scale; // petal width
  const ph = 62 * scale; // petal length
  for (let i = 0; i < petals; i++) {
    const angle = (360 / petals) * i;
    parts.push(
      `<ellipse cx="${cx}" cy="${cy - r}" rx="${pw}" ry="${ph}" fill="${petal}" ` +
        `transform="rotate(${angle} ${cx} ${cy})" opacity="0.95"/>`,
    );
  }
  parts.push(`<circle cx="${cx}" cy="${cy}" r="${26 * scale}" fill="${center}"/>`);
  parts.push(`<circle cx="${cx}" cy="${cy}" r="${26 * scale}" fill="none" stroke="rgba(0,0,0,0.04)" stroke-width="2"/>`);
  return `<g>${parts.join("")}</g>`;
}

function leaf(cx, cy, rot, scale, color) {
  return `<ellipse cx="${cx}" cy="${cy}" rx="${22 * scale}" ry="${70 * scale}" fill="${color}" opacity="0.9" transform="rotate(${rot} ${cx} ${cy})"/>`;
}

function svg({ bgFrom, bgTo, petal, petal2, center, leafColor }) {
  const id = Math.random().toString(36).slice(2, 8);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img">
  <defs>
    <radialGradient id="bg-${id}" cx="50%" cy="38%" r="75%">
      <stop offset="0%" stop-color="${bgFrom}"/>
      <stop offset="100%" stop-color="${bgTo}"/>
    </radialGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#bg-${id})"/>
  <!-- stems -->
  <path d="M400 560 C 360 760 360 820 330 940" stroke="${leafColor}" stroke-width="10" fill="none" opacity="0.7"/>
  <path d="M400 560 C 440 760 450 820 470 940" stroke="${leafColor}" stroke-width="10" fill="none" opacity="0.7"/>
  <path d="M400 560 C 400 760 400 820 400 950" stroke="${leafColor}" stroke-width="10" fill="none" opacity="0.7"/>
  <!-- leaves -->
  ${leaf(320, 640, -28, 1, leafColor)}
  ${leaf(488, 640, 28, 1, leafColor)}
  ${leaf(404, 660, 6, 1.1, leafColor)}
  <!-- bouquet of flowers -->
  ${flower(300, 470, 1.0, petal, center)}
  ${flower(500, 470, 1.0, petal2, center)}
  ${flower(400, 360, 1.25, petal, center)}
  ${flower(400, 540, 0.85, petal2, center)}
  <!-- ribbon -->
  <rect x="356" y="700" width="88" height="54" rx="12" fill="rgba(255,255,255,0.55)"/>
</svg>`;
}

const flowers = {
  "pink-peonies": { bgFrom: "#fdeef3", bgTo: "#f6d7e0", petal: "#ec9bb4", petal2: "#e98aa8", center: "#f4c9a1", leafColor: "#7d9b80" },
  "classic-red-roses": { bgFrom: "#f8e5e8", bgTo: "#eec9cf", petal: "#c33148", petal2: "#b22a3f", center: "#7e1f2e", leafColor: "#6e8a6f" },
  "tulips-chrysanthemums": { bgFrom: "#fbefe6", bgTo: "#f3dcc9", petal: "#e98a5b", petal2: "#e6a0bc", center: "#f0c87e", leafColor: "#7d9b80" },
  "peonies-dahlias": { bgFrom: "#fbe7ee", bgTo: "#f3cdda", petal: "#e07a97", petal2: "#c9456a", center: "#f2cba6", leafColor: "#6e8a6f" },
  "pastel-rose": { bgFrom: "#faf2ec", bgTo: "#efdcd2", petal: "#edc2c9", petal2: "#e9cbb6", center: "#f0dcc2", leafColor: "#8aa38b" },
  "spring-garden": { bgFrom: "#f4f1e6", bgTo: "#e7ead1", petal: "#e79ab0", petal2: "#e7c66a", center: "#f2d79a", leafColor: "#7d9b80" },
  "white-elegance": { bgFrom: "#f6f2ec", bgTo: "#ece6dd", petal: "#ffffff", petal2: "#f3efe9", center: "#ebd9b8", leafColor: "#8aa38b" },
  "sunset-colours": { bgFrom: "#fbeadf", bgTo: "#f3cdb3", petal: "#e9804f", petal2: "#e7a24e", center: "#f3c77e", leafColor: "#7d9b80" },
  "birthday-brights": { bgFrom: "#fbeaf1", bgTo: "#f3cfe0", petal: "#e36aa0", petal2: "#e7a24e", center: "#f2d79a", leafColor: "#7fa86b" },
  "blush-tulips": { bgFrom: "#fbf0f3", bgTo: "#f1d7de", petal: "#eec0cb", petal2: "#e7adbc", center: "#f0dcc2", leafColor: "#8aa38b" },
  "crimson-dahlia": { bgFrom: "#f2dadf", bgTo: "#e4bcc3", petal: "#9e2740", petal2: "#7e1f2e", center: "#6e1a2b", leafColor: "#6e8a6f" },
  "eternal-red-roses": { bgFrom: "#f5dce1", bgTo: "#ecc2c9", petal: "#b22a3f", petal2: "#9e2740", center: "#7e1f2e", leafColor: "#6e8a6f" },
};

for (const [name, palette] of Object.entries(flowers)) {
  writeFileSync(join(OUT_DIR, `${name}.svg`), svg(palette), "utf8");
}

// Neutral fallback placeholder.
writeFileSync(
  join(OUT_DIR, "placeholder.svg"),
  svg({ bgFrom: "#f7f1ec", bgTo: "#ece2db", petal: "#e9b9c6", petal2: "#e3c9b8", center: "#f0dcc2", leafColor: "#8aa38b" }),
  "utf8",
);

console.log(`✓ Generated ${Object.keys(flowers).length + 1} placeholder images in public/images/flowers`);
