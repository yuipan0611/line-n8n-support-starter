# Delivery rules — 配送規則編輯庫 / 配送規則正式庫

Maps to `DeliveryRule` in `src/lib/types.ts`. Draft/live pair, synced by workflow C3. The demo data uses Taichung districts — replace areas and districts with your own service regions (also update the `DeliveryArea` union in `src/lib/types.ts` to match).

## 配送規則編輯庫 (draft)

| Property | Type | Editable by customer | Maps to | Validation |
|---|---|:---:|---|---|
| 規則名稱 | Title | ✅ | name | required |
| 編號 | Text | ⚠️ never change | id | required, unique |
| 區域 | Select | ✅ | area | must be in the configured area list (demo: 台中市區 / 屯區 / 海線 / 山線 / 外縣市) |
| 涵蓋行政區 | Multi-select | ✅ | districts | at least 1 |
| 免運門檻 | Number | ✅ | freeShippingThreshold | ≥ 0 |
| 配送費 | Number | ✅ | deliveryFee | ≥ 0 |
| 最低訂購額 | Number | ✅ | minOrderAmount | ≥ 0 |
| 啟用 | Checkbox | ✅ | isActive | |
| 備註 | Text | ✅ | notes | optional |
| 排序 | Number | ✅ | sortOrder | integer |
| 同步狀態 | Select | ❌ (n8n) | — | 待同步 / 已同步 / 有錯誤 |
| 錯誤訊息 | Text | ❌ (n8n) | — | |
| 最後同步時間 | Date | ❌ (n8n) | — | |

## 配送規則正式庫 (live)

Data columns 規則名稱 / 編號 / 區域 / 涵蓋行政區 / 免運門檻 / 配送費 / 最低訂購額 / 啟用 / 備註 / 排序, plus 來源更新時間 (Date). Delivery-fee calculation in the app: `src/lib/delivery.ts`.
