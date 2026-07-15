# line-n8n-support-starter

**開源 LINE + n8n AI 客服與工單 starter kit，為小商家設計。**

[English README →](README.md)

一個下午就能部署一整套 LINE 官方帳號服務：

- 🤖 **AI 客服** — n8n workflow 讀取 Notion 知識庫，透過任意 LLM 回覆 LINE 私訊
- 🛡️ **群組權限閘門** — 機器人只在白名單群組、白名單使用者、且被 @ 的時候動作，不洗版、不外洩
- 🛒 **LIFF 網站** — 在 LINE 內開啟的 Next.js 訂購／客服網站（商品、購物車、結帳、訂單、會員、人工工單）
- 🎫 **人工工單** — 客服需求自動建成 Notion 工單，團隊在 LINE 群按 Flex Message 按鈕推進工單狀態
- 🔄 **編輯庫 → 正式庫同步** — 客戶自由編輯 Notion 編輯庫；n8n「守門員」workflow 驗證後才同步到系統讀取的正式庫，壞資料永遠進不了 production
- 🔐 **Webhook 簽章工具** — 本地測試器 + 以 LINE 官方文件範例為準的單元測試

## 5 分鐘試玩（不需任何帳號）

```bash
git clone https://github.com/yuipan0611/line-n8n-support-starter.git
cd line-n8n-support-starter
npm install
npm run dev
```

打開 http://localhost:3000/liff/products — 網站以 **mock 模式**跑示範資料，完全不需要憑證。

## 完整部署

照著 [Quickstart](docs/quickstart.md)（約 60–90 分鐘）：Notion → LINE 頻道 → Vercel → n8n → 工單全流程，每一階段都有驗收 checkpoint。

## 內容物

| 路徑 | 內容 |
|---|---|
| `src/` | Next.js 16 App Router LIFF 應用（8 頁）+ 3 條 API route（型錄、工單建立、postback 狀態機） |
| `workflows/` | n8n workflow JSON：AI 客服（A）、工單（B）、內容同步（C1–C3）與 branch 模板 |
| `notion/` | 資料庫 schema 文件與可複製的 Notion 模板 |
| `tools/line/` | Webhook 簽章測試器、Rich Menu 產生／部署工具、Flex Message 產生器 |
| `docs/` | [架構說明](docs/architecture.md)、[Quickstart](docs/quickstart.md)、各項設定指南、疑難排解 |

## 文件

- [Quickstart](docs/quickstart.md) — 部署主線
- [Architecture](docs/architecture.md) — 系統怎麼組、為什麼這樣設計
- 設定指南：[LINE](docs/setup-line.md) · [n8n](docs/setup-n8n.md) · [Notion](docs/setup-notion.md) · [Vercel](docs/deploy-vercel.md)
- [兩層資料庫架構（中文詳解）](docs/two-layer-database-architecture.zh-TW.md)
- [Webhook 疑難排解](docs/line-webhook-troubleshooting.md)

## 開發指令

```bash
npm run dev                # 本地開發（無憑證時走 mock 模式）
npm run lint               # eslint
npm run typecheck          # tsc --noEmit
npm run test:line-webhook  # webhook 簽章單元測試
npm run check:leaks        # 機密／識別字串掃描（CI 也會跑）
npm run build              # production build
```

## 授權

[MIT](LICENSE)
