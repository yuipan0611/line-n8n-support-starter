# Knowledge / FAQ — 知識庫編輯庫 / 知識庫正式庫

Maps to `KnowledgeEntry` in `src/lib/types.ts`. This is the content the AI agent (workflow A) reads before answering. Draft/live pair, synced by workflow C2.

## 知識庫編輯庫 (draft)

| Property | Type | Editable by customer | Maps to | Validation |
|---|---|:---:|---|---|
| 標題 | Title | ✅ | title | required |
| 編號 | Text | ⚠️ never change | id | required, unique |
| 分類 | Select | ✅ | category | one of: 商品 / FAQ訂購 / FAQ配送 / FAQ付款 / FAQ退換貨 / FAQ一般 / 貼圖 |
| 內容 | Text | ✅ | content | required, non-empty |
| 狀態 | Select | ✅ | status | 啟用 / 停用, default 啟用 |
| 同步狀態 | Select | ❌ (n8n) | — | 待同步 / 已同步 / 有錯誤 |
| 錯誤訊息 | Text | ❌ (n8n) | — | |
| 最後同步時間 | Date | ❌ (n8n) | — | |

## 知識庫正式庫 (live)

Data columns 標題 / 編號 / 分類 / 內容 / 狀態, plus 來源更新時間 (Date, written by n8n). Read-only for everyone except the sync workflow; the AI agent and `/api/catalog` read rows with 狀態 = 啟用.
