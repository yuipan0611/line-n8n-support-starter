"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { PageTitle, StatusBadge } from "@/components/ui";
import { currency } from "@/lib/format";
import { readOrders } from "@/lib/storage";

export default function OrderSuccessPage() {
  const params = useParams<{ orderId: string }>();
  const order = readOrders().find((item) => item.orderId === params.orderId);

  return (
    <>
      <PageTitle title="訂單已建立" description="我們已收到您的訂單，店家確認後會再通知您。" />

      <section className="px-5">
        <div className="rounded-md border border-green-100 bg-green-50 p-5 text-center">
          <CheckCircle2 className="mx-auto text-[#2E7D32]" size={44} />
          <p className="mt-3 text-xl font-black text-stone-950">送出成功</p>
          <p className="mt-1 text-sm text-stone-600">訂單編號已產生，可至訂單查詢查看狀態。</p>
        </div>
      </section>

      {order ? (
        <section className="mx-5 mt-5 rounded-md border border-stone-200 bg-white p-4 shadow-sm">
          <Info label="訂單編號" value={order.orderId} strong />
          <Info label="訂購人" value={order.customerName} />
          <Info label="配送日期" value={`${order.deliveryDate} ${order.deliveryTimeSlot}`} />
          <Info label="訂單金額" value={currency(order.totalAmount)} strong />
          <div className="flex items-center justify-between py-3">
            <span className="text-sm text-stone-500">訂單狀態</span>
            <StatusBadge status={order.status} />
          </div>
        </section>
      ) : null}

      <div className="grid grid-cols-2 gap-3 px-5 pt-5">
        <Link href="/liff/products" className="flex h-12 items-center justify-center rounded-md border border-stone-200 text-sm font-black text-stone-700">
          繼續訂購
        </Link>
        <Link href={`/liff/orders/${params.orderId}`} className="flex h-12 items-center justify-center rounded-md bg-[#2E7D32] text-sm font-black text-white">
          查看明細
        </Link>
      </div>
    </>
  );
}

function Info({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex items-center justify-between border-b border-stone-100 py-3">
      <span className="text-sm text-stone-500">{label}</span>
      <span className={strong ? "font-black text-stone-950" : "font-bold text-stone-800"}>{value}</span>
    </div>
  );
}
