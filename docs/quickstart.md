# Quickstart

End-to-end setup takes roughly **60–90 minutes**. Each stage ends with a checkpoint — don't move on until it passes.

Prerequisites: Node.js 20+, a LINE account, a Notion account, an n8n instance (Cloud free trial or self-hosted), a Vercel account (or any Node host), and an OpenAI (or other LLM) API key for the AI agent.

## 0. Run locally in mock mode (5 min)

```bash
git clone https://github.com/yuipan0611/line-n8n-support-starter.git
cd line-n8n-support-starter
npm install
npm run dev
```

Open http://localhost:3000/liff/products — with **no credentials at all**, the site renders demo products, FAQ, and delivery rules from `src/lib/mock-data.ts`.

✅ **Checkpoint:** product cards render locally.

## 1. Notion (10–15 min)

1. Create an internal integration at https://www.notion.so/my-integrations and copy the token (`ntn_...`).
2. Duplicate the Notion template (link in [`notion/TEMPLATE.md`](../notion/TEMPLATE.md)) — or create the databases by hand following [`notion/schemas/`](../notion/schemas/).
3. Share the duplicated page with your integration (Share → Invite → your integration).
4. Copy each database ID into `.env.local` (see `.env.example` for the variable names).

✅ **Checkpoint:** `npm run dev`, then `curl http://localhost:3000/api/catalog` returns your Notion data instead of mock data.

## 2. LINE channels (20 min)

Follow [setup-line.md](setup-line.md). In short:

1. Create a LINE Official Account + **Messaging API channel** → copy the channel access token and channel secret.
2. Create a **LINE Login channel** in the same provider → add a **LIFF app** (endpoint URL is your Vercel URL — you'll fill this in after step 3; LIFF setup is a two-pass step by design).
3. Set `LINE_CHANNEL_ACCESS_TOKEN`, `LINE_CHANNEL_SECRET`, `NEXT_PUBLIC_LIFF_ID` in `.env.local`.

✅ **Checkpoint:** `npm run line:webhook` in one terminal, `npm run line:sample` in another — the local tester verifies a signed webhook round-trip.

## 3. Deploy to Vercel (10 min)

Follow [deploy-vercel.md](deploy-vercel.md): import the repo in Vercel, set the environment variables from `.env.example`, deploy, then paste the deployment URL into your LIFF app's endpoint.

✅ **Checkpoint:** open `https://liff.line.me/<your-liff-id>` on your phone — the site opens inside LINE and shows your name after login.

## 4. n8n workflows (20 min)

Follow [setup-n8n.md](setup-n8n.md):

1. Import the JSON files from [`workflows/`](../workflows/) into n8n.
2. Create three credentials: LINE Messaging API (header auth), Notion, and your LLM provider.
3. Fill in your Notion database IDs and group whitelist.
4. Activate workflow **A**, copy its production webhook URL into the LINE Developers console (Messaging API → Webhook URL) and enable "Use webhook".
5. Activate workflow **B**, copy its production webhook URL into Vercel as `N8N_SUPPORT_WEBHOOK_URL`.

✅ **Checkpoint:** message your Official Account 1:1 — the AI answers using your Notion knowledge base.

## 5. Ticket flow end-to-end (10 min)

1. Create a LINE group with your bot, register it (workflow A auto-registers new groups into the LINE-groups database as *disabled*), then enable it in Notion (`狀態=啟用`, `用途=工單通知`).
2. Open the LIFF site → 人工工單 (support) → submit a request.
3. The work group receives a Flex Message card; tap the accept button.

✅ **Checkpoint:** the Notion ticket's status moves `新工單 → 已受理` and the group receives the next card.

## 6. Optional polish

- Rich menu: `npm run rich-menu:build && npm run rich-menu:deploy` (see [line-rich-menu.md](line-rich-menu.md)).
- Error alerts: import `workflows/branches/n8n-error-alert-workflow.template.json` so workflow failures ping you on LINE (see [n8n-error-alert-branch.md](n8n-error-alert-branch.md)).
- Draft/live content sync: activate C1/C2/C3 and share only the draft databases with your customer (see [architecture.md](architecture.md#two-layer-notion-database-design)).

## Troubleshooting

Webhook signature failures, LIFF endpoint pitfalls, and common n8n issues: [line-webhook-troubleshooting.md](line-webhook-troubleshooting.md).
