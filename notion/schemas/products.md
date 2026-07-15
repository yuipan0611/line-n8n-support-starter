# Products — 商品編輯庫 / 商品正式庫

Maps to `Product` in `src/lib/types.ts`. Two databases: a customer-editable **draft** (編輯庫) and a system-only **live** (正式庫).

## 商品編輯庫 (draft)

| Property | Type | Editable by customer | Maps to | Validation (enforced by n8n C1) |
|---|---|:---:|---|---|
| 商品名稱 | Title | ✅ | name | required, non-empty |
| 編號 | Text | ⚠️ never change | id | required, unique, alphanumeric + `-` |
| 分類 | Select | ✅ | category | one of: 當季水果 / 進口水果 / 禮盒組合 / 學校團膳 / 公司訂購 |
| 說明 | Text | ✅ | description | optional |
| 規格 | Text | ✅ | spec | required |
| 單位 | Text | ✅ | unit | required (箱 / 公斤 / 盒 …) |
| 價格 | Number | ✅ | price | required, ≥ 0 |
| 庫存狀態 | Select | ✅ | stockStatus | one of: 有貨 / 少量 / 售完 / 預購 |
| 圖片網址 | URL | ✅ | imageUrl | optional, must start with http(s) |
| 排序 | Number | ✅ | sortOrder | integer, default 999 |
| 鮮度備註 | Text | ✅ | freshnessNote | optional |
| 上架狀態 | Select | ✅ | sourceStatus | 啟用 / 停用, default 啟用 |
| 同步狀態 | Select | ❌ (n8n writes) | — | 待同步 / 已同步 / 有錯誤 |
| 錯誤訊息 | Text | ❌ (n8n writes) | — | validation failure reason |
| 最後同步時間 | Date | ❌ (n8n writes) | — | last successful sync |

## 商品正式庫 (live)

Same data columns as the draft (商品名稱 / 編號 / 分類 / 說明 / 規格 / 單位 / 價格 / 庫存狀態 / 圖片網址 / 排序 / 鮮度備註 / 上架狀態), **without** the three sync-status columns, plus:

| Property | Type | Notes |
|---|---|---|
| 來源更新時間 | Date | written by n8n on each sync |

The app reads only this database, and only rows with 上架狀態 = 啟用.

Rules that keep the sync working: never edit 編號 after creation (it is the upsert key); deactivate rows (上架狀態 = 停用) instead of deleting them; select option labels must match this doc exactly.
