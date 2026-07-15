"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { categories as staticCategories } from "@/lib/mock-data";
import type { CatalogData } from "@/lib/catalog-server";
import type { DeliveryRule, KnowledgeEntry, Product } from "@/lib/types";

type CatalogContextValue = {
  loading: boolean;
  error: string | null;
  source: CatalogData["source"] | null;
  products: Product[];
  knowledgeEntries: KnowledgeEntry[];
  deliveryRules: DeliveryRule[];
  categories: readonly (typeof staticCategories)[number][];
};

const CatalogContext = createContext<CatalogContextValue | null>(null);

export function CatalogProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [catalog, setCatalog] = useState<CatalogData | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadCatalog() {
      try {
        const response = await fetch("/api/catalog", { cache: "no-store" });
        const payload = (await response.json()) as CatalogData & { error?: string };

        if (!response.ok) {
          throw new Error(payload.error ?? "無法載入商品資料");
        }

        if (!cancelled) {
          setCatalog(payload);
          setError(null);
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : "無法載入商品資料");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadCatalog();

    function reloadWhenVisible() {
      if (document.visibilityState === "visible") {
        void loadCatalog();
      }
    }

    window.addEventListener("focus", reloadWhenVisible);
    document.addEventListener("visibilitychange", reloadWhenVisible);

    return () => {
      cancelled = true;
      window.removeEventListener("focus", reloadWhenVisible);
      document.removeEventListener("visibilitychange", reloadWhenVisible);
    };
  }, []);

  const value = useMemo<CatalogContextValue>(
    () => ({
      loading,
      error,
      source: catalog?.source ?? null,
      products: catalog?.products ?? [],
      knowledgeEntries: catalog?.knowledgeEntries ?? [],
      deliveryRules: catalog?.deliveryRules ?? [],
      categories: staticCategories,
    }),
    [catalog, error, loading],
  );

  return <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>;
}

export function useCatalog() {
  const context = useContext(CatalogContext);
  if (!context) {
    throw new Error("useCatalog must be used inside CatalogProvider");
  }
  return context;
}
