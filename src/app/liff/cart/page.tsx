"use client";

import type React from "react";
import Link from "next/link";
import Image from "next/image";
import { CheckCircle2, Minus, Plus, Snowflake, Trash2, Truck } from "lucide-react";
import { useCart } from "@/components/cart-context";
import { useCatalog } from "@/components/catalog-context";
import { PageTitle } from "@/components/ui";
import { currency } from "@/lib/format";
import { mockCustomer } from "@/lib/mock-data";

export default function CartPage() {
  const { knowledgeEntries, loading } = useCatalog();
  const {
    lines,
    subtotal,
    deliveryFee,
    deliveryRule,
    freeShippingRemaining,
    total,
    addItem,
    decrementItem,
    removeItem,
  } = useCart();

  if (loading || !deliveryRule) {
    return (
      <PageTitle
        title="購物車"
        description="正在載入配送規則…"
      />
    );
  }

  return (
    <>
      <PageTitle
        title="購物車"
        description="確認已選商品、數量與配送費；送出後可在訂單查詢查看進度。"
      />

      <section className="px-5 pb-4">
        <div className="rounded-lg border border-emerald-100 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-black text-stone-950">{mockCustomer.name}</p>
              <p className="mt-1 text-xs leading-5 text-stone-500">
                {mockCustomer.contactPerson}・{mockCustomer.phone}
              </p>
            </div>
            <span className="rounded-md bg-emerald-50 px-3 py-1.5 text-xs font-black text-[#2E7D32]">
              月結
            </span>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <InfoPill icon={<Truck size={14} />} text={deliveryRule.name} />
            <InfoPill icon={<Snowflake size={14} />} text={`滿 ${deliveryRule.freeShippingThreshold.toLocaleString("zh-TW")} 免運`} />
          </div>
        </div>
      </section>

      <section className="space-y-3 px-5">
        {lines.length === 0 ? (
          <div className="rounded-md border border-dashed border-stone-300 bg-stone-50 p-8 text-center">
            <p className="font-bold text-stone-800">購物車目前是空的</p>
            <Link href="/liff/products" className="mt-4 inline-flex h-11 items-center rounded-md bg-[#2E7D32] px-5 text-sm font-bold text-white">
              回商品頁
            </Link>
          </div>
        ) : (
          lines.map((line) => (
            <article key={line.productId} className="rounded-lg border border-stone-200 bg-white p-3 shadow-sm">
              <div className="flex gap-3">
                <Image
                  src={line.product.imageUrl}
                  alt={line.product.name}
                  width={80}
                  height={80}
                  unoptimized
                  className="size-20 rounded-md object-cover"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-black text-stone-950">{line.product.name}</p>
                      <p className="mt-1 text-xs text-stone-500">{line.product.spec}</p>
                    </div>
                    <button onClick={() => removeItem(line.productId)} className="grid size-8 place-items-center rounded-md bg-stone-100 text-stone-500">
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <p className="font-black text-stone-950">{currency(line.lineTotal)}</p>
                    <div className="flex items-center rounded-md border border-stone-200">
                      <button onClick={() => decrementItem(line.productId)} className="grid size-9 place-items-center text-stone-600">
                        <Minus size={15} />
                      </button>
                      <span className="min-w-9 text-center text-sm font-black">{line.quantity}</span>
                      <button onClick={() => addItem(line.productId)} className="grid size-9 place-items-center text-[#2E7D32]">
                        <Plus size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </article>
          ))
        )}
      </section>

      <section className="mx-5 mt-5 rounded-lg border border-stone-200 bg-white p-4 shadow-sm">
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-stone-600">商品總額</span>
            <span className="font-bold">{currency(subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-stone-600">配送費</span>
            <span className="font-bold">{currency(deliveryFee)}</span>
          </div>
          <div className="rounded-md bg-emerald-50 px-3 py-2 text-xs font-bold leading-5 text-emerald-800">
            {subtotal === 0
              ? deliveryRule.notes
              : freeShippingRemaining > 0
                ? `再訂 ${currency(freeShippingRemaining)} 即可享 ${deliveryRule.area} 免運。`
                : `${deliveryRule.area} 已達免運門檻。`}
          </div>
          <div className="border-t border-stone-200 pt-3">
            <div className="flex justify-between text-lg font-black">
              <span>總金額</span>
              <span className="text-[#2E7D32]">{currency(total)}</span>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-5 mt-3 rounded-lg bg-[#F4FFF8] p-4">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="mt-0.5 shrink-0 text-[#2E7D32]" size={18} />
          <div>
            <p className="text-sm font-black text-stone-950">配送提醒</p>
            <p className="mt-1 text-xs leading-5 text-stone-600">
              {knowledgeEntries.find((entry) => entry.id === "delivery-time")?.content}
            </p>
          </div>
        </div>
      </section>

      <div className="px-5 pt-5">
        <Link
          href={lines.length ? "/liff/checkout" : "/liff/products"}
          className="flex h-12 items-center justify-center rounded-md bg-[#2E7D32] text-sm font-black text-white shadow-lg shadow-green-800/20"
        >
          {lines.length ? "前往確認訂單" : "先去挑水果"}
        </Link>
      </div>
    </>
  );
}

function InfoPill({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex h-9 items-center justify-center gap-1.5 rounded-md bg-stone-50 text-xs font-bold text-stone-700">
      <span className="text-[#2E7D32]">{icon}</span>
      {text}
    </div>
  );
}
