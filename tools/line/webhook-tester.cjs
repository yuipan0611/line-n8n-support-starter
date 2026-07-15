#!/usr/bin/env node

const http = require("node:http");
const { URL } = require("node:url");
const { verifyLineSignature } = require("./line-signature.cjs");

const channelSecret = process.env.LINE_CHANNEL_SECRET;
const port = Number(process.env.PORT || 8787);
const forwardUrl = process.env.N8N_WEBHOOK_URL;

if (!channelSecret) {
  console.error("Missing LINE_CHANNEL_SECRET. Copy .env.example to .env.local and export it before starting.");
  console.error("Example: LINE_CHANNEL_SECRET=... npm run line:webhook");
  process.exit(1);
}

function readRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

async function forwardToN8n(rawBody, signature) {
  if (!forwardUrl) {
    return null;
  }

  const response = await fetch(forwardUrl, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-line-signature": signature,
    },
    body: rawBody,
  });

  return {
    ok: response.ok,
    status: response.status,
    body: await response.text(),
  };
}

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, { "content-type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(payload, null, 2));
}

const server = http.createServer(async (req, res) => {
  const requestUrl = new URL(req.url, `http://${req.headers.host || "localhost"}`);

  if (req.method === "GET" && requestUrl.pathname === "/health") {
    sendJson(res, 200, {
      ok: true,
      service: "line-webhook-tester",
      forwardsToN8n: Boolean(forwardUrl),
    });
    return;
  }

  if (req.method !== "POST" || requestUrl.pathname !== "/line/webhook") {
    sendJson(res, 404, { ok: false, error: "Use POST /line/webhook" });
    return;
  }

  try {
    const rawBody = await readRawBody(req);
    const signature = req.headers["x-line-signature"];
    const verified = verifyLineSignature(channelSecret, rawBody, signature);
    const bodyText = rawBody.toString("utf8");
    let eventCount = null;
    let destination = null;

    try {
      const bodyJson = JSON.parse(bodyText);
      eventCount = Array.isArray(bodyJson.events) ? bodyJson.events.length : null;
      destination = bodyJson.destination || null;
    } catch {
      // Invalid JSON is still useful for testing signature failures.
    }

    const result = {
      ok: verified,
      signatureVerified: verified,
      destination,
      eventCount,
      rawBodyBytes: rawBody.length,
      forwarded: null,
    };

    if (!verified) {
      console.warn("[LINE webhook] signature failed", {
        rawBodyBytes: rawBody.length,
        hasSignature: Boolean(signature),
      });
      sendJson(res, 401, {
        ...result,
        error: "Invalid LINE signature. Check channel secret and verify against the exact raw request body.",
      });
      return;
    }

    result.forwarded = await forwardToN8n(rawBody, signature);
    console.log("[LINE webhook] verified", result);
    sendJson(res, 200, result);
  } catch (error) {
    console.error("[LINE webhook] tester error", error);
    sendJson(res, 500, { ok: false, error: error.message });
  }
});

server.listen(port, () => {
  console.log(`LINE webhook tester listening on http://localhost:${port}/line/webhook`);
  console.log("Use a tunnel such as ngrok/cloudflared if you want LINE Developers to call this local URL.");
  if (forwardUrl) {
    console.log(`Verified requests will be forwarded to ${forwardUrl}`);
  }
});
