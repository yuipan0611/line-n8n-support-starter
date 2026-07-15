import {
  deliveryRules as mockDeliveryRules,
  knowledgeEntries as mockKnowledgeEntries,
  products as mockProducts,
} from "./mock-data";
import {
  fetchLiveDeliveryRules,
  fetchLiveKnowledgeEntries,
  fetchLiveProducts,
} from "./notion";
import type { DeliveryRule, KnowledgeEntry, Product } from "./types";

export type CatalogData = {
  products: Product[];
  knowledgeEntries: KnowledgeEntry[];
  deliveryRules: DeliveryRule[];
  source: "notion" | "mock";
};

function canUseNotion() {
  return Boolean(
    process.env.NOTION_API_KEY &&
      process.env.NOTION_PRODUCTS_LIVE_DB_ID &&
      process.env.NOTION_KNOWLEDGE_LIVE_DB_ID &&
      process.env.NOTION_DELIVERY_LIVE_DB_ID,
  );
}

export async function getCatalogData(): Promise<CatalogData> {
  if (!canUseNotion()) {
    return {
      products: mockProducts,
      knowledgeEntries: mockKnowledgeEntries,
      deliveryRules: mockDeliveryRules,
      source: "mock",
    };
  }

  const [products, knowledgeEntries, deliveryRules] = await Promise.all([
    fetchLiveProducts(),
    fetchLiveKnowledgeEntries(),
    fetchLiveDeliveryRules(),
  ]);

  return {
    products,
    knowledgeEntries,
    deliveryRules,
    source: "notion",
  };
}
