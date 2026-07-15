import type { OrderStatus, StockStatus } from "@/lib/types";

export function PageTitle({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <section className="px-5 pb-4 pt-5">
      <h1 className="text-2xl font-black tracking-normal text-stone-950">{title}</h1>
      <p className="mt-1 text-sm leading-6 text-stone-600">{description}</p>
    </section>
  );
}

export function StockBadge({ status }: { status: StockStatus }) {
  const cls =
    status === "有貨"
      ? "bg-green-50 text-[#2E7D32]"
      : status === "少量"
        ? "bg-amber-50 text-amber-700"
        : status === "預購"
        ? "bg-sky-50 text-sky-700"
          : "bg-stone-100 text-stone-500";
  return <span className={`rounded-md px-2 py-1 text-xs font-bold ${cls}`}>{status}</span>;
}

export function StatusBadge({ status }: { status: OrderStatus }) {
  const cls =
    status === "已完成"
      ? "bg-green-50 text-[#2E7D32]"
      : status === "已取消"
        ? "bg-stone-100 text-stone-500"
        : status === "配送中"
          ? "bg-orange-50 text-orange-700"
        : "bg-sky-50 text-sky-700";
  return <span className={`rounded-md px-2.5 py-1 text-xs font-bold ${cls}`}>{status}</span>;
}
