const crypto = require("node:crypto");

function createLineSignature(channelSecret, rawBody) {
  if (!channelSecret) {
    throw new Error("LINE_CHANNEL_SECRET is required");
  }

  return crypto
    .createHmac("sha256", channelSecret)
    .update(Buffer.isBuffer(rawBody) ? rawBody : Buffer.from(String(rawBody), "utf8"))
    .digest("base64");
}

function verifyLineSignature(channelSecret, rawBody, headerSignature) {
  if (!headerSignature || typeof headerSignature !== "string") {
    return false;
  }

  const expected = Buffer.from(createLineSignature(channelSecret, rawBody), "base64");
  const received = Buffer.from(headerSignature, "base64");

  if (expected.length !== received.length) {
    return false;
  }

  return crypto.timingSafeEqual(expected, received);
}

module.exports = {
  createLineSignature,
  verifyLineSignature,
};
