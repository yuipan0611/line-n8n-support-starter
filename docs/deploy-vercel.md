# Deploy to Vercel

Any Node 20+ host works; Vercel is the zero-config path.

## 1. Import

1. Push your fork/clone to GitHub.
2. https://vercel.com/new → import the repo. Framework preset: **Next.js** (auto-detected). No build settings to change.

## 2. Environment variables

Add these in *Project → Settings → Environment Variables* (names in `.env.example`):

Required for a live site:

- `NEXT_PUBLIC_LIFF_ID`
- `NOTION_API_KEY`, `NOTION_PRODUCTS_LIVE_DB_ID`, `NOTION_KNOWLEDGE_LIVE_DB_ID`, `NOTION_DELIVERY_LIVE_DB_ID`
- `NOTION_TICKETS_DATABASE_ID`, `NOTION_LINE_GROUPS_DATABASE_ID`
- `LINE_CHANNEL_ACCESS_TOKEN`, `LINE_CHANNEL_SECRET`, `LINE_STORE_GROUP_ID`
- `N8N_SUPPORT_WEBHOOK_URL`

Everything is optional in **mock mode**: with no Notion credentials the catalog API serves `src/lib/mock-data.ts`, so you can preview the UI before any integration exists.

## 3. Connect LIFF

After the first deployment, copy the production URL (e.g. `https://your-app.vercel.app`) into:

- the LIFF app's **Endpoint URL** (LINE Login channel → LIFF), and
- `RICH_MENU_APP_BASE_URL` if you use the rich-menu tooling.

Redeploy after changing env vars (Vercel only injects them at build/deploy time).

## 4. Verify

- `https://your-app.vercel.app/liff/products` in a desktop browser → catalog renders (mock or Notion).
- `https://liff.line.me/<your-liff-id>` on your phone → opens in LINE, login works.
- Submit the support form → `/api/support-request` returns success and n8n receives the payload.
