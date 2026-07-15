#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");
const { createLineSignature } = require("./line-signature.cjs");

const channelSecret = process.env.LINE_CHANNEL_SECRET;
const targetUrl = process.env.LINE_WEBHOOK_TEST_URL || "http://localhost:8787/line/webhook";
const samplePath = process.argv[2] || path.join(__dirname, "../../samples/line/webhook-empty.json");

if (!channelSecret) {
  console.error("Missing LINE_CHANNEL_SECRET.");
  process.exit(1);
}

const rawBody = fs.readFileSync(samplePath);
const signature = createLineSignature(channelSecret, rawBody);

async function main() {
  const response = await fetch(targetUrl, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-line-signature": signature,
    },
    body: rawBody,
  });

  const body = await response.text();
  console.log(`POST ${targetUrl}`);
  console.log(`sample=${samplePath}`);
  console.log(`status=${response.status}`);
  console.log(body);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
