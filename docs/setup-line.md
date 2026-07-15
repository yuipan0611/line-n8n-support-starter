# LINE setup

You need two channels under one LINE Developers provider, plus (optionally) a rich menu.

## 1. Official Account + Messaging API channel

1. Create an Official Account at https://manager.line.biz (free plan is fine).
2. In https://developers.line.biz, the OA appears as a **Messaging API channel** (enable Messaging API from the OA settings if it doesn't).
3. From the channel's *Messaging API* tab copy:
   - **Channel access token** (issue a long-lived one) → `LINE_CHANNEL_ACCESS_TOKEN`
   - **Channel secret** (Basic settings tab) → `LINE_CHANNEL_SECRET`
4. Recommended OA settings: disable auto-reply and greeting messages (n8n will answer), enable webhooks.
5. The **Webhook URL** will be workflow A's production webhook — you set it in the n8n step.

## 2. Login channel + LIFF app

The LIFF app must live in a **LINE Login channel**, not the Messaging API channel.

1. In the same provider, create a *LINE Login* channel.
2. Under its **LIFF** tab, add a LIFF app:
   - Size: Full
   - Endpoint URL: your deployed site root, e.g. `https://your-app.vercel.app`
     (root path — the app routes internally; a sub-path endpoint plus `liff.line.me/<id>/liff/...` concatenation opens the wrong page)
   - Scopes: `profile`, `openid`
3. Copy the LIFF ID (e.g. `1234567890-abcdefgh`) → `NEXT_PUBLIC_LIFF_ID`.

If you haven't deployed yet, use a placeholder endpoint and come back after the Vercel step.

## 3. Verify webhook signatures locally

Before pointing LINE at anything, prove your signature handling works:

```bash
npm run line:webhook     # terminal 1: local server on :8787, verifies x-line-signature
npm run line:sample      # terminal 2: sends a signed sample webhook
npm run test:line-webhook  # unit tests pinned to LINE's documented example
```

Details and failure modes: [line-webhook-troubleshooting.md](line-webhook-troubleshooting.md).

## 4. Rich menu (optional)

```bash
NEXT_PUBLIC_LIFF_ID=<your-liff-id> RICH_MENU_APP_BASE_URL=https://your-app.vercel.app npm run rich-menu:build
LINE_CHANNEL_ACCESS_TOKEN=<token> npm run rich-menu:deploy
```

Design notes and button layout: [line-rich-menu.md](line-rich-menu.md). Use direct deployment URLs in buttons, not `liff.line.me/<id>/<path>`.

## 5. Group setup for ticketing

1. Add the OA to your internal work group (allow group joins in OA settings).
2. Send any message in the group — workflow A's registry branch records the group in the Notion LINE-groups database as **disabled**.
3. In Notion, flip the group to `狀態=啟用` and set `用途=工單通知` to whitelist it.
4. Put the group ID in `LINE_STORE_GROUP_ID` (or rely on the Notion registry lookup).
