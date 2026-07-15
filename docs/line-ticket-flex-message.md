# LINE Flex Message 工單狀態卡片

這份文件是「LINE 群組中的工單狀態追蹤 Flex Message」規格，不是 Dashboard、Admin Panel 或工單管理網站。

## 流程

```text
客戶提出問題
  -> n8n 建立工單
  -> 發送 Flex Message 到客戶/工作群組
  -> 群組負責人點擊卡片按鈕
  -> n8n 接 LINE postback event
  -> 更新 Notion 工單狀態
  -> 發送下一階段 Flex Message
```

## 狀態

```text
新工單 -> 已受理 -> 處理中 -> 待客戶確認 -> 已完成
```

## 設計方向

- LINE Flex Message Bubble Card
- MUJI / 京都插畫 / 手帳風 / LINE 禮物卡片感
- 低飽和中性色
- 柔和留白與圓角
- 不使用 Dashboard、Sidebar、Analytics、Chart、Table
- 綠色只保留給「OK / 已解決」這類語意，紅色只保留給「異常 / 未解決」這類語意，不作為卡片主色

## 卡片配色

| 對象 | 主色 | 用途 |
| --- | --- | --- |
| 客戶官方群 | 茶褐 `#A27C56` / 淺茶 `#F4E9DA` | 安心進度卡，溫和中性，不暗示成功或異常 |
| 員工工作群 | 藍灰 `#6F7F8F` / 淺藍灰 `#E8EEF2` | 內部可操作卡，和客戶端視覺區隔 |
| 已完成 | 灰 `#777777` / `#E6E3DD` | 結案、沉穩收尾 |

## 產生 Flex JSON

從專案根目錄執行：

```bash
node tools/line/ticket-flex-message.cjs all
node tools/line/ticket-flex-message.cjs new
node tools/line/ticket-flex-message.cjs accepted
node tools/line/ticket-flex-message.cjs processing
node tools/line/ticket-flex-message.cjs pending_confirmation
node tools/line/ticket-flex-message.cjs completed
```

客戶官方群進度卡：

```bash
node tools/line/ticket-flex-message.cjs --customer all
node tools/line/ticket-flex-message.cjs --customer new
node tools/line/ticket-flex-message.cjs --customer accepted
node tools/line/ticket-flex-message.cjs --customer processing
node tools/line/ticket-flex-message.cjs --customer pending_confirmation
node tools/line/ticket-flex-message.cjs --customer completed
```

程式位置：

```text
tools/line/ticket-flex-message.cjs
```

可在 n8n Code node 直接使用裡面的 `buildTicketFlexMessage(ticket, statusKey)` 邏輯。

兩種卡片視角：

| 對象 | 函式 | 目的 |
| --- | --- | --- |
| 員工工作群 | `buildTicketFlexMessage(ticket, statusKey)` | 可操作卡，內部人員點按鈕推進狀態 |
| 客戶官方群 | `buildCustomerTicketFlexMessage(ticket, statusKey)` | 安心進度卡，讓客戶知道目前進度 |

客戶卡會顯示五段進度：

```text
送出 -> 已受理 -> 處理中 -> 待確認 -> 完成
```

進度視覺使用固定節點流程，不使用 loading/progress bar 動畫感：

```text
● 送出      完成
│
● 已受理    目前
│
○ 處理中    等待
│
○ 待確認    等待
│
○ 完成      等待
```

規則：

- 五個節點永遠都顯示，讓客戶知道完整流程。
- 已走過的節點顯示 `完成`。
- 已走過的節點使用小實心圓。
- 目前節點顯示 `目前`，使用空心圓與主色外框。
- 圈圈之間使用直向虛線，不使用實線。
- 尚未走到的節點顯示 `等待`。
- 不使用藍色 loading 條或跑動中的視覺。

客戶卡只在 `待客戶確認` 階段顯示按鈕：

```text
已解決
還需要協助
```

## n8n 推送 payload

LINE Push Message HTTP Request node:

```json
{
  "to": "={{ $json.to }}",
  "messages": "={{ $json.messages }}"
}
```

其中 Code node 應輸出：

```js
return [{
  json: {
    to: groupId,
    messages: [buildTicketFlexMessage(ticket, "new")],
  },
}];
```

若要推送客戶官方群的進度卡：

```js
return [{
  json: {
    to: customerGroupId,
    messages: [buildCustomerTicketFlexMessage(ticket, "processing")],
  },
}];
```

## Notion 工單後台

目前使用 Notion database：

```text
Demo Fruit Shop LINE 工單待辦
Database ID: <your-tickets-database-id>
```

這個 database 是 Flex Message 的後台狀態來源。每張 Flex 卡的狀態都要對應到同一筆 Notion 工單。

正式版原則：

- LINE 卡片只顯示必要資訊，不顯示 Notion database ID、postback data、內部 workflow 名稱。
- LINE 按鈕不直接在前端改狀態，而是送 postback 給 n8n。
- n8n 以 `工單編號` 查 Notion，更新狀態與時間欄位後，再推送下一張 Flex 卡。
- Notion 不分享給客戶；一般員工優先透過 LINE 按鈕操作，避免直接改壞狀態欄。
- 若需要嚴格控管，正式工單庫只給 n8n integration 和管理者可寫，一般員工只看 LINE 卡片。

核心欄位：

| 欄位 | 類型 | 用途 |
| --- | --- | --- |
| 工單標題 | title | Notion 頁面標題 |
| 工單編號 | rich_text | 例如 `SR20260701001` 或 `#00031` |
| 狀態 | status | `新工單`、`已受理`、`處理中`、`待客戶確認`、`已完成` |
| 優先級 | select | `緊急`、`高`、`普通`、`低` |
| 類型 | select | `訂單問題`、`配送問題`、`退款問題`、`商品問題`、`客服問題`、`系統問題`、`建議事項` |
| 目前進度 | rich_text | 顯示在處理中卡片，例如「已聯絡物流公司」 |
| 處理結果 | rich_text | 顯示在待確認卡片，例如「重新配送一箱」 |
| 下一步 | select | 方便在 Notion 看目前卡在哪裡 |
| 建立時間 | date | 新工單建立時間 |
| 受理時間 | date | 按「我收到工單」後填入 |
| 開始處理時間 | date | 按「開始處理」後填入 |
| 待確認時間 | date | 按「已解決」後填入 |
| 完成時間 | date | 按「已收到」後填入 |
| 最後更新時間 | date | 每次狀態更新都刷新 |

LIFF 表單送出後，`/api/support-request` 會建立 Notion 工單，初始狀態為：

```text
狀態：新工單
目前進度：等待負責人接單
下一步：等待負責人接單
```

## 按鈕 postback data

每個按鈕使用 LINE postback action，例如：

```text
source=line_ticket_flex&issue_id=#00031&action=accept&next_status=已受理
source=line_ticket_flex&issue_id=#00031&action=start_processing&next_status=處理中
source=line_ticket_flex&issue_id=#00031&action=resolve&next_status=待客戶確認
source=line_ticket_flex&issue_id=#00031&action=complete&next_status=已完成
source=line_ticket_flex&issue_id=#00031&action=reopen&next_status=處理中
```

n8n LINE 主流程收到 postback event 後：

1. 解析 `event.postback.data`
2. 確認 `source=line_ticket_flex`
3. 用 `issue_id` 找 Notion ticket
4. 更新狀態為 `next_status`
5. 補上負責人、時間、處理結果等欄位
6. 再 push 下一張 Flex Message 到群組

## postback 對應 Notion 更新

| action | 狀態 | 寫入欄位 | 下一步 | 下一張卡 |
| --- | --- | --- | --- | --- |
| `accept` | 已受理 | 受理時間、負責人、最後更新時間 | 等待開始處理 | 已受理 |
| `start_processing` | 處理中 | 開始處理時間、目前進度、最後更新時間 | 處理中 | 處理中 |
| `resolve` | 待客戶確認 | 待確認時間、處理結果、最後更新時間 | 等待客戶確認 | 待客戶確認 |
| `complete` | 已完成 | 完成時間、最後更新時間、完成通知 | 已結案 | 已完成 |
| `reopen` | 處理中 | 目前進度、最後更新時間 | 處理中 | 處理中 |

建議 n8n postback branch：

```text
LINE Webhook
  -> Detect Ticket Postback
  -> Query Notion Ticket by 工單編號
  -> Update Notion Ticket Status
  -> Build Next Flex Message
  -> Push LINE Group Message
```

`Detect Ticket Postback` 只處理：

```js
const event = $json.body?.events?.[0] || $json.event || {};
const data = new URLSearchParams(event.postback?.data || "");

return [{
  json: {
    isTicketPostback: data.get("source") === "line_ticket_flex",
    issueId: data.get("issue_id"),
    action: data.get("action"),
    nextStatus: data.get("next_status"),
    replyToken: event.replyToken,
    groupId: event.source?.groupId || event.source?.roomId || "",
    userId: event.source?.userId || "",
    timestamp: new Date().toISOString(),
  },
}];
```

## 五張卡片

### 新工單

按鈕：

```text
我收到工單
```

狀態更新：

```text
新工單 -> 已受理
```

### 已受理

按鈕：

```text
開始處理
```

狀態更新：

```text
已受理 -> 處理中
```

### 處理中

按鈕：

```text
已解決
```

狀態更新：

```text
處理中 -> 待客戶確認
```

### 待客戶確認

按鈕：

```text
已收到
尚未解決
```

狀態更新：

```text
已收到：待客戶確認 -> 已完成
尚未解決：待客戶確認 -> 處理中
```

### 已完成

沒有按鈕，只顯示建立時間、完成時間與總耗時。

## 配色

```text
客戶主色   #A27C56
客戶淺底   #F4E9DA
員工主色   #6F7F8F
員工淺底   #E8EEF2
已完成     #777777 / #E6E3DD

背景       #F8F5F0
卡片       #FFFFFF
文字       #4A4A4A
輔助文字   #8A8A8A
```
