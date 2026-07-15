# LINE group registry — LINE 群組登錄

The whitelist that gates every group interaction. New groups the bot encounters are auto-registered as **disabled** by the registry branch (`workflows/branches/n8n-line-group-registry-branch.template.json`); a human must approve each one.

| Property | Type | Notes |
|---|---|---|
| 群組名稱 | Title | group display name |
| Group ID | Text | `C` + 32 hex chars, from the webhook source |
| 群組類型 | Select | e.g. 工作群 / 客戶群 / 測試群 |
| 狀態 | Status | 啟用 / 停用 — **new groups start 停用** |
| 用途 | Multi-select | e.g. 工單通知 / 客服 / 待辦查詢 |
| 最後訊息時間 | Date | updated by the registry branch |
| 最後訊息摘要 | Text | updated by the registry branch |
| 最後發話 User ID | Text | updated by the registry branch |

## Approval flow

1. Bot joins a group / receives a group message → row auto-created with 狀態 = 停用, no 用途.
2. You review the row, set 狀態 = 啟用 and pick the 用途 (e.g. 工單通知 to receive ticket Flex cards).
3. Workflows A and B honor this registry: unapproved groups are silently ignored.

`/api/support-request` resolves the ticket work group either from `LINE_STORE_GROUP_ID` or by querying this database for an enabled group with 用途 = 工單通知.
