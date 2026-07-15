# LINE Rich Menu

This project includes a six-button Rich Menu for the Demo Fruit Shop LINE demo.

## Buttons

- 商品訂購 -> `/liff/products`
- 購物車 -> `/liff/cart`
- 訂單查詢 -> `/liff/orders`
- 會員資料 -> `/liff/member`
- 配送規則 -> sends `請問配送時間和運費怎麼算？`
- 轉人工 -> `/liff/support`

**重要：** Rich Menu 按鈕請用直連網址（`https://your-app.vercel.app/liff/...`），不要用 `liff.line.me/ID/liff/...`，否則若 LIFF Endpoint 設成子路徑會開錯頁（例如開到購物車）。

LIFF Endpoint URL 在 LINE Developers 必須設為根路徑：

```text
https://your-app.vercel.app
```

## Build The Image

```bash
npm run rich-menu:build
```

Outputs:

```text
public/line-rich-menu/fruit-rich-menu.svg
public/line-rich-menu/fruit-rich-menu.jpg
public/line-rich-menu/fruit-rich-menu.json
```

LINE Rich Menu images should be PNG/JPEG and commonly use `2500 x 1686` or `2500 x 843` pixels. Keep the file under 1 MB.

## Deploy With Messaging API

Use the long-lived Channel Access Token from the Messaging API channel connected to the target Official Account.

Do not paste the token into chat or commit it to git.

```bash
export LINE_CHANNEL_ACCESS_TOKEN="..."
export RICH_MENU_APP_BASE_URL="https://your-deployed-domain.example"
npm run rich-menu:build
npm run rich-menu:deploy
```

`RICH_MENU_APP_BASE_URL` lets the menu open exact pages such as `/liff/cart`. If you omit it, app buttons fall back to the LIFF URL:

```text
https://liff.line.me/1234567890-abcdefgh
```

## Manual LINE OA Manager Option

If you prefer manual setup:

1. Run `npm run rich-menu:build`.
2. Upload `public/line-rich-menu/fruit-rich-menu.png` in LINE Official Account Manager.
3. Use a 3 x 2 grid.
4. Set URL actions for 商品訂購、購物車、訂單查詢、會員資料、轉人工.
5. Set a message action only for 配送規則.
