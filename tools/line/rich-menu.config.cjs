const liffId = process.env.NEXT_PUBLIC_LIFF_ID;
if (!liffId) {
  throw new Error(
    "NEXT_PUBLIC_LIFF_ID is required. Set it in .env.local (see .env.example).",
  );
}
const liffUrl = `https://liff.line.me/${liffId}`;
// 直連部署網址，避免 liff.line.me/ID/path 與 Endpoint 子路徑拼接錯誤（例如開到購物車）
const appBaseUrl = process.env.RICH_MENU_APP_BASE_URL;
if (!appBaseUrl) {
  throw new Error(
    "RICH_MENU_APP_BASE_URL is required, e.g. https://your-app.vercel.app",
  );
}

function appUrl(path) {
  return new URL(path, appBaseUrl).toString();
}

const richMenuSize = {
  width: 1535,
  height: 1024,
};

const tiles = [
  {
    label: "商品訂購",
    subtitle: "看今日水果與價格",
    accent: "#2E7D32",
    action: { type: "uri", label: "商品訂購", uri: appUrl("/liff/products") },
  },
  {
    label: "購物車",
    subtitle: "確認數量與配送費",
    accent: "#E35D2F",
    action: { type: "uri", label: "購物車", uri: appUrl("/liff/cart") },
  },
  {
    label: "訂單查詢",
    subtitle: "看配送進度",
    accent: "#276EF1",
    action: { type: "uri", label: "訂單查詢", uri: appUrl("/liff/orders") },
  },
  {
    label: "會員資料",
    subtitle: "月結與收貨資訊",
    accent: "#7A4E2D",
    action: { type: "uri", label: "會員資料", uri: appUrl("/liff/member") },
  },
  {
    label: "配送規則",
    subtitle: "由客服助手回覆",
    accent: "#108A7A",
    action: { type: "message", label: "配送規則", text: "請問配送時間和運費怎麼算？" },
  },
  {
    label: "人工工單",
    subtitle: "填寫協助需求",
    accent: "#5F6368",
    action: { type: "uri", label: "人工工單", uri: appUrl("/liff/support") },
  },
];

function richMenuPayload() {
  const columnWidth = Math.floor(richMenuSize.width / 3);
  const rowHeight = Math.floor(richMenuSize.height / 2);

  return {
    size: richMenuSize,
    selected: true,
    name: "Demo Fruit Shop LIFF Menu",
    chatBarText: "示範果舖選單",
    areas: tiles.map((tile, index) => {
      const col = index % 3;
      const row = Math.floor(index / 3);

      return {
        bounds: {
          x: col * columnWidth,
          y: row * rowHeight,
          width: col === 2 ? richMenuSize.width - columnWidth * 2 : columnWidth,
          height: row === 1 ? richMenuSize.height - rowHeight : rowHeight,
        },
        action: tile.action,
      };
    }),
  };
}

module.exports = {
  appBaseUrl,
  liffId,
  liffUrl,
  richMenuPayload,
  richMenuSize,
  tiles,
};
