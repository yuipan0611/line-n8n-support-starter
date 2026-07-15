# LINE Webhook Troubleshooting

This project includes a local webhook tester for the Demo Fruit Shop LINE 客服助手 flow. It verifies `x-line-signature` before any JSON parsing, then can optionally forward verified requests to the production n8n webhook.

LINE's current webhook signature rule is HMAC-SHA256 over the exact raw request body, keyed by the Messaging API channel secret, then Base64 encoded. Do not prettify, deserialize, trim, or re-stringify the body before verifying it.

Reference: https://developers.line.biz/en/docs/messaging-api/verify-webhook-signature/

## Local Signature Check

From `line-n8n-support-starter`:

```bash
cp .env.example .env.local
LINE_CHANNEL_SECRET=your_channel_secret npm run test:line-webhook
```

Run the local webhook:

```bash
LINE_CHANNEL_SECRET=your_channel_secret npm run line:webhook
```

Send the included sample payload:

```bash
LINE_CHANNEL_SECRET=your_channel_secret npm run line:sample
LINE_CHANNEL_SECRET=your_channel_secret npm run line:sample samples/line/webhook-text-message.json
```

Expected result:

```json
{
  "ok": true,
  "signatureVerified": true
}
```

## Forward Verified Requests To n8n

Start the tester with the production n8n webhook URL:

```bash
LINE_CHANNEL_SECRET=your_channel_secret \
N8N_WEBHOOK_URL=https://your-workspace.app.n8n.cloud/webhook/line-agent \
npm run line:webhook
```

Use a tunnel if LINE Developers needs to call your local machine:

```bash
cloudflared tunnel --url http://localhost:8787
```

Set the LINE webhook URL to:

```text
https://your-tunnel-url/line/webhook
```

For regular production testing from the LINE mobile app, set LINE Developers to the production n8n webhook URL, not the n8n test webhook URL.

## Fast Failure Split

If LINE sends a message but n8n has no execution:

- Confirm the user is messaging the same Official Account connected to the Messaging API channel.
- Confirm LINE Developers `Webhook URL` is the production n8n URL or the tunnel URL above.
- Confirm `Use webhook` is enabled in LINE Developers.
- Confirm the n8n workflow is active/published.
- Confirm you are not using an n8n test webhook URL unless the editor is actively listening.
- Confirm `LINE_CHANNEL_SECRET` is from the Messaging API channel's Basic settings, not a LINE Login/LIFF channel.

If n8n execution starts but LINE receives no reply:

- Confirm the HTTP Request node for LINE Reply API uses a Channel Access Token from the same Messaging API channel.
- Confirm the reply API node replies once and uses the current execution's reply token.
- Confirm LINE OA auto-response messages are disabled when n8n should answer.
- Open the first failed red node in n8n Executions; do not debug downstream nodes first.

## LINE Console Setup Checklist

- Provider and Official Account match the account being tested.
- Messaging API channel ID matches the target Official Account.
- Channel secret is current; if reissued, update every verifier immediately.
- Channel access token is current and stored only in n8n credentials.
- Webhook is on.
- Webhook URL is production n8n or tunneled local tester.
- Auto-response messages are off unless intentionally used as fallback.
