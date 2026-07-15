const assert = require("node:assert/strict");
const test = require("node:test");
const { createLineSignature, verifyLineSignature } = require("./line-signature.cjs");

// The secret, body, and expected signature below are the public example from
// LINE's official docs (Messaging API "Verify webhook signature") — not real
// credentials. Keep them unchanged so the test pins the documented behavior.
test("creates the LINE Developers documented signature", () => {
  const secret = "8c570fa6dd201bb328f1c1eac23a96d8";
  const body = '{"destination":"U8e742f61d673b39c7fff3cecb7536ef0","events":[]}';

  assert.equal(createLineSignature(secret, body), "GhRKmvmHys4Pi8DxkF4+EayaH0OqtJtaZxgTD9fMDLs=");
});

test("verifies exact raw body and rejects reformatted JSON", () => {
  const secret = "8c570fa6dd201bb328f1c1eac23a96d8";
  const body = '{"destination":"U8e742f61d673b39c7fff3cecb7536ef0","events":[]}';
  const signature = createLineSignature(secret, body);

  assert.equal(verifyLineSignature(secret, body, signature), true);
  assert.equal(
    verifyLineSignature(secret, JSON.stringify(JSON.parse(body), null, 2), signature),
    false,
  );
});
