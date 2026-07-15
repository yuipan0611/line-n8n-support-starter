"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { PageTitle, StatusBadge } from "@/components/ui";
import { currency } from "@/lib/format";
import { readOrders } from "@/lib/storage";

export default function OrderDetailPage() {
  const params = useParams<{ orderId: string }>();
  const order = readOrders().find((item) => item.orderId === params.orderId);

  if (!order) {
    return (
      <>
        <PageTitle title="找不到訂單" description="此訂單可能不存在，請回訂單查詢重新確認。" />
        <div className="px-5">
          <Link href="/liff/orders" className="flex h-12 items-center justify-center rounded-md bg-[#2E7D32] text-sm font-black text-white">
            回訂單查詢
          </Link>
        </div>
      </>
    );
  }

  return (
    <>
      <PageTitle title="訂單明細" description={order.orderId} />

      <section className="mx-5 rounded-md border border-stone-200 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <p className="font-black text-stone-950">{order.orderId}</p>
          <StatusBadge status={order.status} />
        </div>
      </section>

      <section className="mx-5 mt-4 rounded-md border border-stone-200 bg-white p-4 shadow-sm">
        <h2 className="text-base font-black">商品明細</h2>
        <div className="mt-3 space-y-3">
          {order.items.map((item) => (
            <div key={item.productId} className="flex justify-between gap-3 border-b border-stone-100 pb-3 text-sm last:border-0 last:pb-0">
              <div>
                <p className="font-bold text-stone-900">{item.name} x {item.quantity}</p>
                <p className="mt-1 text-xs text-stone-500">{item.spec}</p>
              </div>
              <p className="font-black">{currency(item.price * item.quantity)}</p>
            </div>
          ))}
        </div>
        <div className="mt-4 space-y-2 border-t border-stone-100 pt-3 text-sm">
          <Summary label="商品小計" value={currency(order.subtotal)} />
          <Summary label="配送費" value={currency(order.deliveryFee)} />
          <Summary label="總金額" value={currency(order.totalAmount)} strong />
        </div>
      </section>

      <section className="mx-5 mt-4 rounded-md bg-[#F5F5F5] p-4">
        <h2 className="text-base font-black">配送資訊</h2>
        <div className="mt-3 space-y-2 text-sm">
          <Summary label="收貨人" value={order.receiverName} />
          <Summary label="電話" value={order.phone} />
          <Summary label="地址" value={order.deliveryAddress} />
          <Summary label="配送日期" value={`${order.deliveryDate} ${order.deliveryTimeSlot}`} />
          <Summary label="付款方式" value={order.paymentMethod} />
          <Summary label="備註" value={order.notes || "無"} />
        </div>
      </section>
    </>
  );
}

function Summary({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="shrink-0 text-stone-500">{label}</span>
      <span className={`text-right ${strong ? "text-lg font-black text-[#2E7D32]" : "font-bold text-stone-800"}`}>{value}</span>
    </div>
  );
}
