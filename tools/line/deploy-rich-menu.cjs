#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");
const { richMenuPayload } = require("./rich-menu.config.cjs");

const token = process.env.LINE_CHANNEL_ACCESS_TOKEN;
const imagePath =
  process.env.RICH_MENU_IMAGE_PATH ||
  path.join(process.cwd(), "public", "line-rich-menu", "fruit-rich-menu.jpg");

if (!token) {
  console.error("Missing LINE_CHANNEL_ACCESS_TOKEN. Put it in your local shell or deployment secret store, not in chat.");
  process.exit(1);
}

if (!fs.existsSync(imagePath)) {
  console.error(`Missing image: ${imagePath}`);
  console.error("Run npm run rich-menu:build first.");
  process.exit(1);
}

async function lineApi(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(options.headers || {}),
    },
  });

  const text = await response.text();
  if (!response.ok) {
    throw new Error(`${options.method || "GET"} ${url} failed: ${response.status} ${text}`);
  }

  return text ? JSON.parse(text) : {};
}

async function main() {
  const created = await lineApi("https://api.line.me/v2/bot/richmenu", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(richMenuPayload()),
  });

  const richMenuId = created.richMenuId;
  const image = fs.readFileSync(imagePath);

  await lineApi(`https://api-data.line.me/v2/bot/richmenu/${richMenuId}/content`, {
    method: "POST",
    headers: { "content-type": imagePath.endsWith(".jpg") || imagePath.endsWith(".jpeg") ? "image/jpeg" : "image/png" },
    body: image,
  });

  await lineApi(`https://api.line.me/v2/bot/user/all/richmenu/${richMenuId}`, {
    method: "POST",
  });

  console.log(`Created and set default rich menu: ${richMenuId}`);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
