# Tickets — LINE 工單待辦

Created by workflow B (and `/api/support-request`); updated by `/api/ticket-postback` when the team taps Flex Message buttons in the work group.

| Property | Type | Written by |
|---|---|---|
| 工單標題 | Title | system |
| 工單編號 | Text | system (e.g. `SR20260701...` — the postback lookup key) |
| 狀態 | Status | n8n / LINE postback |
| 優先級 | Select | system / n8n |
| 類型 | Select | system |
| 來源 | Select | system |
| LINE User ID | Text | system |
| LINE Group ID | Text | system |
| 客戶名稱 | Text | system |
| 聯絡人 | Text | system |
| 電話 | Phone | system |
| 相關訂單 | Text | system |
| 問題說明 | Text | system |
| 負責人 | Text (or Person) | n8n / staff |
| LINE Mention User ID | Text | staff config |
| 目前進度 | Text | n8n / staff |
| 處理結果 | Text | n8n / staff |
| 內部備註 | Text | staff |
| 建立時間 | Date | system |
| 受理時間 | Date | n8n |
| 開始處理時間 | Date | n8n |
| 待確認時間 | Date | n8n |
| 完成時間 | Date | n8n |
| 最後更新時間 | Date | n8n |
| 下一步 | Select | n8n |
| 到期日 | Date | system / n8n |
| 完成通知 | Checkbox | n8n |

## Status lifecycle

```
新工單 → 已受理 → 處理中 → 待客戶確認 → 已完成
```

## Postback action mapping

Flex buttons carry `source=line_ticket_flex&issue_id=SR...&action=...&next_status=...`:

| action | New status | Timestamps / fields filled |
|---|---|---|
| accept | 已受理 | 受理時間, 負責人 |
| start_processing | 處理中 | 開始處理時間, 目前進度 |
| resolve | 待客戶確認 | 待確認時間, 處理結果 |
| complete | 已完成 | 完成時間, 完成通知 |
| reopen | 處理中 | 目前進度 (處理結果 kept as history) |

Implementation: `src/app/api/ticket-postback/route.ts`. Flex card layout: [docs/line-ticket-flex-message.md](../../docs/line-ticket-flex-message.md).
