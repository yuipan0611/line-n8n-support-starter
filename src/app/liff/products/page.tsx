"use client";

import { CalendarDays, Search, ShoppingCart, Sparkles } from "lucide-react";
import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/components/cart-context";
import { useCatalog } from "@/components/catalog-context";
import { PageTitle, StockBadge } from "@/components/ui";
import { mockCustomer } from "@/lib/mock-data";
import { currency } from "@/lib/format";
import type { ProductCategory } from "@/lib/types";

export default function ProductsPage() {
  const [query, setQuery] = useState("");
  const { categories, loading, error, products } = useCatalog();
  const [category, setCategory] = useState<(typeof categories)[number]>("全部");
  const { addItem, count } = useCart();

  const filtered = useMemo(
    () =>
      products
        .filter((product) => category === "全部" || product.category === category)
        .filter((product) => {
          const keyword = query.trim();
          if (!keyword) return true;
          return `${product.name}${product.description}${product.spec}`.includes(keyword);
        })
        .sort((a, b) => a.sortOrder - b.sortOrder),
    [category, products, query],
  );

  if (loading) {
    return (
      <PageTitle
        title="我要訂購"
        description="正在載入商品資料…"
      />
    );
  }

  if (error) {
    return (
      <PageTitle
        title="我要訂購"
        description={error}
      />
    );
  }

  return (
    <>
      <PageTitle
        title="我要訂購"
        description="瀏覽當季水果與團膳品項，加入購物車後即可建立配送訂單。"
      />

      <section className="px-5">
        <div className="overflow-hidden rounded-lg border border-emerald-100 bg-gradient-to-br from-[#F4FFF8] via-white to-[#FFF8ED] shadow-sm">
          <div className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-[#2E7D32]">
                  今日推薦
                </p>
                <h2 className="mt-1 text-xl font-black leading-7 text-stone-950">
                  {mockCustomer.name} 常購補貨
                </h2>
                <p className="mt-1 text-sm leading-6 text-stone-600">
                  {mockCustomer.contactPerson}・{mockCustomer.type}・月結客戶
                </p>
              </div>
              <div className="rounded-md bg-white px-3 py-2 text-right shadow-sm">
                <p className="text-xs font-black text-[#2E7D32]">滿額免運</p>
                <p className="mt-1 text-[11px] font-bold text-stone-500">2,000 元起</p>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2">
              <Metric label="商品" value={`${products.length} 項`} />
              <Metric label="配送" value="可預約" />
              <Metric label="付款" value="月結" />
            </div>
          </div>
        </div>
      </section>

      <section className="mt-5 px-5">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="h-12 w-full rounded-md border border-stone-200 bg-white pl-10 pr-4 text-sm font-medium outline-none transition focus:border-[#2E7D32] focus:ring-4 focus:ring-green-100"
            placeholder="搜尋水果"
          />
        </div>

        <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
          {categories.map((item) => (
            <button
              key={item}
              onClick={() => setCategory(item)}
              className={`h-9 shrink-0 rounded-md px-4 text-sm font-bold ${
                category === item
                  ? "bg-[#2E7D32] text-white shadow-lg shadow-green-800/20"
                  : "border border-stone-200 bg-white text-stone-600"
              }`}
            >
              {item}
            </button>
          ))}
        </div>
      </section>

      <section className="mt-2 space-y-3 px-5 pb-24">
        {filtered.map((product, index) => (
          <article
            key={product.id}
            className="grid grid-cols-[112px_1fr] gap-3 rounded-lg border border-stone-200 bg-white p-3 shadow-sm"
          >
            <div className="relative overflow-hidden rounded-md">
              <Image
                src={product.imageUrl}
                alt={product.name}
                width={232}
                height={280}
                priority={index === 0}
                unoptimized
                className="h-36 w-full object-cover"
              />
            </div>
            <div className="min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-base font-black leading-5 text-stone-950">{product.name}</p>
                  <p className="mt-1 text-xs font-semibold text-stone-500">
                    {product.category as ProductCategory}
                  </p>
                </div>
                <StockBadge status={product.stockStatus} />
              </div>
              <p className="mt-2 line-clamp-2 text-xs leading-5 text-stone-600">{product.description}</p>
              <p className="mt-1 text-xs font-semibold text-stone-500">規格：{product.spec}</p>
              <p className="mt-1 flex items-center gap-1 text-[11px] font-bold text-amber-700">
                <Sparkles size={12} />
                {product.freshnessNote}
              </p>
              <div className="mt-3 flex items-center justify-between">
                <p className="text-lg font-black text-stone-950">
                  {currency(product.price)}
                  <span className="text-xs font-bold text-stone-500"> / {product.unit}</span>
                </p>
                <button
                  onClick={() => addItem(product.id)}
                  disabled={product.stockStatus === "售完"}
                  className="grid size-10 place-items-center rounded-md bg-[#2E7D32] text-white shadow-lg shadow-green-800/20 disabled:bg-stone-300"
                  aria-label={`加入 ${product.name}`}
                >
                  <ShoppingCart size={19} />
                </button>
              </div>
            </div>
          </article>
        ))}
      </section>

      <Link
        href="/liff/cart"
        className="fixed bottom-24 left-1/2 z-30 flex h-12 w-[calc(100%-40px)] max-w-[390px] -translate-x-1/2 items-center justify-center gap-2 rounded-md bg-stone-950 text-sm font-black text-white shadow-xl shadow-stone-900/20"
      >
        <CalendarDays size={18} />
        查看購物車 {count > 0 ? `(${count})` : ""}
      </Link>
    </>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-white p-3 shadow-sm">
      <p className="text-[11px] font-bold text-stone-500">{label}</p>
      <p className="mt-1 text-sm font-black text-stone-950">{value}</p>
    </div>
  );
}
