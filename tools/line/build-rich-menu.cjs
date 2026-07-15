#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");
const { execFileSync } = require("node:child_process");
const { richMenuPayload, richMenuSize, tiles } = require("./rich-menu.config.cjs");

const outDir = path.join(process.cwd(), "public", "line-rich-menu");
const sourceImagePath = path.join(outDir, "rich-menu-layout.png");
const svgPath = path.join(outDir, "fruit-rich-menu.svg");
const pngPath = path.join(outDir, "fruit-rich-menu.png");
const jpgPath = path.join(outDir, "fruit-rich-menu.jpg");
const jsonPath = path.join(outDir, "fruit-rich-menu.json");

fs.mkdirSync(outDir, { recursive: true });

if (fs.existsSync(sourceImagePath)) {
  fs.writeFileSync(jsonPath, JSON.stringify(richMenuPayload(), null, 2));
  execFileSync(
    "sips",
    ["-s", "format", "jpeg", "-s", "formatOptions", "88", sourceImagePath, "--out", jpgPath],
    { stdio: "ignore" },
  );

  const size = fs.statSync(jpgPath).size;
  console.log(`Using ${sourceImagePath}`);
  console.log(`Wrote ${jpgPath} (${Math.round(size / 1024)} KB)`);
  console.log(`Wrote ${jsonPath}`);
  if (size > 1024 * 1024) {
    console.warn("JPEG is larger than 1 MB. Lower formatOptions before uploading to LINE.");
  }
  process.exit(0);
}

const columnWidth = richMenuSize.width / 3;
const headerHeight = 116;
const visualGridHeight = richMenuSize.height - headerHeight;
const rowHeight = visualGridHeight / 2;

function escapeXml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function tileSvg(tile, index) {
  const col = index % 3;
  const row = Math.floor(index / 3);
  const x = col * columnWidth;
  const y = row * rowHeight;
  const isPrimary = index === 0;
  const fill = isPrimary ? "#F1FFF5" : "#FFFFFF";
  const icon = ["訂", "車", "單", "員", "配", "人"][index];

  return `
    <g transform="translate(${x} ${y})">
      <rect x="0" y="0" width="${columnWidth}" height="${rowHeight}" fill="${fill}" stroke="#DCE8DD" stroke-width="4"/>
      <circle cx="${columnWidth / 2}" cy="205" r="82" fill="${tile.accent}"/>
      <text x="${columnWidth / 2}" y="236" text-anchor="middle" font-size="76" font-weight="900" fill="#FFFFFF">${icon}</text>
      <text x="${columnWidth / 2}" y="398" text-anchor="middle" font-size="68" font-weight="900" fill="#17231B">${escapeXml(tile.label)}</text>
      <text x="${columnWidth / 2}" y="478" text-anchor="middle" font-size="34" font-weight="700" fill="#667067">${escapeXml(tile.subtitle)}</text>
      <rect x="220" y="555" width="${columnWidth - 440}" height="72" rx="20" fill="${tile.accent}" opacity="0.11"/>
      <text x="${columnWidth / 2}" y="603" text-anchor="middle" font-size="32" font-weight="800" fill="${tile.accent}">點一下開啟</text>
    </g>`;
}

const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${richMenuSize.width}" height="${richMenuSize.height}" viewBox="0 0 ${richMenuSize.width} ${richMenuSize.height}">
  <rect width="2500" height="1686" fill="#FBFCFA"/>
  <rect x="0" y="0" width="2500" height="${headerHeight}" fill="#2E7D32"/>
  <text x="92" y="76" font-size="48" font-weight="900" fill="#FFFFFF" font-family="Arial, PingFang TC, Microsoft JhengHei, sans-serif">示範果舖</text>
  <text x="380" y="75" font-size="31" font-weight="700" fill="#DDF5E2" font-family="Arial, PingFang TC, Microsoft JhengHei, sans-serif">LINE 客服・下單選單</text>
  <g transform="translate(0 ${headerHeight})">
    ${tiles.map(tileSvg).join("\n")}
  </g>
  <rect x="0" y="1558" width="2500" height="128" fill="#FBFCFA" opacity="0.92"/>
</svg>`;

fs.writeFileSync(svgPath, svg);
fs.writeFileSync(jsonPath, JSON.stringify(richMenuPayload(), null, 2));
execFileSync("sips", ["-s", "format", "png", svgPath, "--out", pngPath], { stdio: "ignore" });

const size = fs.statSync(pngPath).size;
console.log(`Wrote ${svgPath}`);
console.log(`Wrote ${pngPath} (${Math.round(size / 1024)} KB)`);
console.log(`Wrote ${jsonPath}`);
if (size > 1024 * 1024) {
  console.warn("PNG is larger than 1 MB. Compress before uploading to LINE.");
}
