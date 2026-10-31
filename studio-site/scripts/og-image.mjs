/**
 * 生成默认 OG 分享图 public/og-default.png（1200×630）。
 * 用法：node scripts/og-image.mjs
 * 品牌信息改动后重跑即可，无需手工修图。
 */
import sharp from "sharp";
import { mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = dirname(dirname(fileURLToPath(import.meta.url)));

// mulberry32 —— 与 src/lib/heatmap.ts 相同的确定性随机，保证每次生成结果一致
function mulberry32(seed) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = Math.imul(t ^ (t >>> 7), 61 | t);
    t = (t ^ (t >>> 14)) >>> 0;
    return t / 4294967296;
  };
}

const rand = mulberry32(20261031);
const stars = [];
for (let i = 0; i < 90; i++) {
  const x = Math.round(rand() * 1200);
  const y = Math.round(rand() * 630);
  const r = 0.8 + rand() * 1.6;
  const o = 0.12 + rand() * 0.5;
  stars.push(`<circle cx="${x}" cy="${y}" r="${r.toFixed(1)}" fill="#e7ecf5" opacity="${o.toFixed(2)}"/>`);
}
// 几颗带十字光芒的亮星
const sparkles = [
  [905, 132, 7],
  [1062, 318, 5],
  [768, 86, 4],
  [178, 96, 5],
];
for (const [x, y, s] of sparkles) {
  stars.push(`<g stroke="#cdd8f0" stroke-width="1.4" opacity="0.75">
    <line x1="${x - s}" y1="${y}" x2="${x + s}" y2="${y}"/>
    <line x1="${x}" y1="${y - s}" x2="${x}" y2="${y + s}"/>
  </g><circle cx="${x}" cy="${y}" r="1.6" fill="#e7ecf5"/>`);
}

const CJK = "Microsoft YaHei, PingFang SC, Noto Sans SC, sans-serif";
const LATIN = "Segoe UI, Sora, sans-serif";

const svg = `<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="accent" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#6d7cff"/>
      <stop offset="100%" stop-color="#38d9f5"/>
    </linearGradient>
    <radialGradient id="glowA" cx="16%" cy="6%" r="60%">
      <stop offset="0%" stop-color="#6d7cff" stop-opacity="0.30"/>
      <stop offset="100%" stop-color="#6d7cff" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="glowB" cx="90%" cy="98%" r="65%">
      <stop offset="0%" stop-color="#38d9f5" stop-opacity="0.22"/>
      <stop offset="100%" stop-color="#38d9f5" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="1200" height="630" fill="#0a0e16"/>
  <rect width="1200" height="630" fill="url(#glowA)"/>
  <rect width="1200" height="630" fill="url(#glowB)"/>
  ${stars.join("\n  ")}
  <text x="98" y="168" font-family="${LATIN}" font-size="26" font-weight="600" letter-spacing="10" fill="#8b95ab">STARISLE STUDIO</text>
  <text x="94" y="300" font-family="${CJK}" font-size="108" font-weight="700" fill="#e7ecf5">星屿工作室</text>
  <rect x="100" y="340" width="120" height="7" rx="3.5" fill="url(#accent)"/>
  <text x="98" y="425" font-family="${CJK}" font-size="42" fill="#aab4c8">把想法做成产品，把学习写成作品</text>
  <circle cx="107" cy="540" r="7" fill="url(#accent)"/>
  <text x="130" y="551" font-family="${LATIN}" font-size="30" fill="#8b95ab">starisle.dev</text>
</svg>`;

mkdirSync(join(root, "public"), { recursive: true });
await sharp(Buffer.from(svg))
  .png({ compressionLevel: 9 })
  .toFile(join(root, "public", "og-default.png"));
console.log("✓ public/og-default.png 已生成（1200×630）");
