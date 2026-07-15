"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { useState } from "react";
import { PageTitle, StatusBadge } from "@/components/ui";
import { currency, dateLabel } from "@/lib/format";
import { readOrders } from "@/lib/storage";
import type { Order } from "@/lib/types";

export default function OrdersPage() {
  const [orders] = useState<Order[]>(() => readOrders());

  return (
    <>
      <PageTitle title="訂單查詢" description="查看歷史訂單、目前狀態與配送進度。" />

      <section className="space-y-3 px-5">
        {orders.map((order) => (
          <Link key={order.orderId} href={`/liff/orders/${order.orderId}`} className="block rounded-md border border-stone-200 bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-black text-stone-950">{order.orderId}</p>
                <p className="mt-1 text-xs text-stone-500">建立：{dateLabel(order.createdAt)}</p>
              </div>
              <StatusBadge status={order.status} />
            </div>
            <div className="mt-4 grid grid-cols-[1fr_auto] items-end gap-3">
              <div className="text-sm text-stone-600">
                <p>配送：{order.deliveryDate} {order.deliveryTimeSlot}</p>
                <p className="mt-1">金額：<span className="font-black text-stone-950">{currency(order.totalAmount)}</span></p>
              </div>
              <ChevronRight className="text-stone-400" size={20} />
            </div>
          </Link>
        ))}
      </section>
    </>
  );
}
