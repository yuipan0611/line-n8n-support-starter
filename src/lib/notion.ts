import type {
  DeliveryArea,
  DeliveryRule,
  KnowledgeEntry,
  Product,
  ProductCategory,
  StockStatus,
} from "./types";

const NOTION_VERSION = "2022-06-28";

type NotionProperty = {
  type: string;
  title?: Array<{ plain_text: string }>;
  rich_text?: Array<{ plain_text: string }>;
  number?: number | null;
  select?: { name: string } | null;
  multi_select?: Array<{ name: string }>;
  checkbox?: boolean;
  url?: string | null;
};

type NotionPage = {
  properties: Record<string, NotionProperty>;
};

function getPlainText(property: NotionProperty | undefined) {
  if (!property) return "";
  if (property.type === "title") {
    return property.title?.[0]?.plain_text ?? "";
  }
  if (property.type === "rich_text") {
    return property.rich_text?.[0]?.plain_text ?? "";
  }
  return "";
}

function getSelect(property: NotionProperty | undefined) {
  return property?.select?.name ?? "";
}

function getNumber(property: NotionProperty | undefined, fallback = 0) {
  return property?.number ?? fallback;
}

function getUrl(property: NotionProperty | undefined) {
  return property?.url ?? "";
}

function getCheckbox(property: NotionProperty | undefined) {
  return property?.checkbox ?? false;
}

function getMultiSelect(property: NotionProperty | undefined) {
  return property?.multi_select?.map((item) => item.name) ?? [];
}

async function queryDatabase(databaseId: string, body: Record<string, unknown>) {
  const apiKey = process.env.NOTION_API_KEY;
  if (!apiKey) {
    throw new Error("NOTION_API_KEY is not configured");
  }

  const pages: NotionPage[] = [];
  let cursor: string | undefined;

  do {
    const response = await fetch(`https://api.notion.com/v1/databases/${databaseId}/query`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Notion-Version": NOTION_VERSION,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...body,
        start_cursor: cursor,
      }),
      cache: "no-store",
    });

    if (!response.ok) {
      const detail = await response.text();
      throw new Error(`Notion query failed (${response.status}): ${detail}`);
    }

    const payload = (await response.json()) as {
      results: NotionPage[];
      has_more: boolean;
      next_cursor: string | null;
    };

    pages.push(...payload.results);
    cursor = payload.has_more ? (payload.next_cursor ?? undefined) : undefined;
  } while (cursor);

  return pages;
}

export function mapNotionProduct(page: NotionPage): Product {
  const properties = page.properties;

  return {
    id: getPlainText(properties["編號"]),
    name: getPlainText(properties["商品名稱"]),
    category: getSelect(properties["分類"]) as ProductCategory,
    description: getPlainText(properties["說明"]),
    spec: getPlainText(properties["規格"]),
    unit: getPlainText(properties["單位"]),
    price: getNumber(properties["價格"]),
    stockStatus: getSelect(properties["庫存狀態"]) as StockStatus,
    imageUrl: getUrl(properties["圖片網址"]),
    sortOrder: getNumber(properties["排序"], 999),
    sourceStatus: getSelect(properties["上架狀態"]) as "啟用" | "停用",
    freshnessNote: getPlainText(properties["鮮度備註"]),
  };
}

export function mapNotionKnowledgeEntry(page: NotionPage): KnowledgeEntry {
  const properties = page.properties;

  return {
    id: getPlainText(properties["編號"]),
    title: getPlainText(properties["標題"]),
    category: getSelect(properties["分類"]) as KnowledgeEntry["category"],
    content: getPlainText(properties["內容"]),
    status: getSelect(properties["狀態"]) as KnowledgeEntry["status"],
  };
}

export function mapNotionDeliveryRule(page: NotionPage): DeliveryRule {
  const properties = page.properties;

  return {
    id: getPlainText(properties["編號"]),
    name: getPlainText(properties["規則名稱"]),
    area: getSelect(properties["區域"]) as DeliveryArea,
    districts: getMultiSelect(properties["涵蓋行政區"]),
    freeShippingThreshold: getNumber(properties["免運門檻"]),
    deliveryFee: getNumber(properties["配送費"]),
    minOrderAmount: getNumber(properties["最低訂購額"]),
    isActive: getCheckbox(properties["啟用"]),
    notes: getPlainText(properties["備註"]),
    sortOrder: getNumber(properties["排序"], 999),
  };
}

export async function fetchLiveProducts() {
  const databaseId = process.env.NOTION_PRODUCTS_LIVE_DB_ID;
  if (!databaseId) {
    throw new Error("NOTION_PRODUCTS_LIVE_DB_ID is not configured");
  }

  const pages = await queryDatabase(databaseId, {
    filter: {
      property: "上架狀態",
      select: { equals: "啟用" },
    },
    sorts: [{ property: "排序", direction: "ascending" }],
  });

  return pages.map(mapNotionProduct).filter((product) => product.id && product.name);
}

export async function fetchLiveKnowledgeEntries() {
  const databaseId = process.env.NOTION_KNOWLEDGE_LIVE_DB_ID;
  if (!databaseId) {
    throw new Error("NOTION_KNOWLEDGE_LIVE_DB_ID is not configured");
  }

  const pages = await queryDatabase(databaseId, {
    filter: {
      property: "狀態",
      select: { equals: "啟用" },
    },
  });

  return pages.map(mapNotionKnowledgeEntry).filter((entry) => entry.id && entry.title);
}

export async function fetchLiveDeliveryRules() {
  const databaseId = process.env.NOTION_DELIVERY_LIVE_DB_ID;
  if (!databaseId) {
    throw new Error("NOTION_DELIVERY_LIVE_DB_ID is not configured");
  }

  const pages = await queryDatabase(databaseId, {
    sorts: [{ property: "排序", direction: "ascending" }],
  });

  return pages.map(mapNotionDeliveryRule).filter((rule) => rule.id && rule.name);
}
