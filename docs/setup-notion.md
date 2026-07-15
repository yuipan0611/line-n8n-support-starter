# Notion setup

## 1. Integration

1. Go to https://www.notion.so/my-integrations → *New integration* (internal).
2. Copy the token (`ntn_...`) → `NOTION_API_KEY`. Treat it like a password; never commit it.

## 2. Databases

Fastest path: duplicate the public template linked in [`notion/TEMPLATE.md`](../notion/TEMPLATE.md), then share the duplicated page with your integration (Share → Invite).

Manual path: create each database following the field-by-field schemas in [`notion/schemas/`](../notion/schemas/):

| Schema doc | Database | Notes |
|---|---|---|
| `products.md` | 商品編輯庫 + 商品正式庫 | draft/live pair |
| `knowledge.md` | 知識庫編輯庫 + 知識庫正式庫 | draft/live pair, feeds the AI agent |
| `delivery-rules.md` | 配送規則編輯庫 + 配送規則正式庫 | draft/live pair |
| `tickets.md` | LINE 工單待辦 | ticket lifecycle + timestamps |
| `line-groups.md` | LINE 群組登錄 | group whitelist registry |

Two rules that make or break the sync workflows:

- Select option labels must match the schema docs **exactly** (including full-width characters) — validation compares strings.
- The `編號` (stable ID) column must never be edited after creation; it is the upsert key between draft and live.

## 3. Database IDs

For each database, copy the ID from its URL (the 32-hex segment) into `.env.local` — variable names are in `.env.example`. n8n needs the same IDs (as node parameters or n8n env vars).

## 4. Sharing / permissions

- Share **draft** databases with your customer/merchant (can edit).
- Share **nothing else**: live databases and the tickets database are accessed only by the integration.
- Rationale and role matrix: [two-layer-database-architecture.zh-TW.md](two-layer-database-architecture.zh-TW.md).

## 5. Seed data

Duplicate-template users get demo rows for free. Manual builders: copy a few rows from `src/lib/mock-data.ts` (6 products, 4 FAQs, 5 delivery rules) so the catalog isn't empty on first run.
