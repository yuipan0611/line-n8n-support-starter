# Notion template

**Duplicate the template:**
👉 https://shaded-mail-147.notion.site/LINE-n8n-Support-Starter-Notion-Template-39e44549da21816d8bb1eb7d1826e755

It contains all eight databases with demo rows (6 products, 4 FAQs, 5 delivery rules, a sample ticket, and a sample group registration).

1. Open the link and click **Duplicate** (top right) into your own workspace.
2. Two Status columns can't carry custom options through the API, so fix them once after duplicating (each database's description repeats this):
   - **LINE 工單待辦 → 狀態**: rename the default options to `新工單`, `處理中`, `已完成` and add `已受理`, `待客戶確認`.
   - **LINE 群組登錄 → 狀態**: rename to `啟用` / `停用`.
3. Share the duplicated page with your integration (Share → Invite → the integration from [docs/setup-notion.md](../docs/setup-notion.md)).
4. Copy each database's ID from its URL into `.env.local` (variable names in `.env.example`) and into the n8n workflows.

Prefer building by hand instead? Follow the field-by-field docs in [schemas/](schemas/).
