"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { useCart } from "@/components/cart-context";
import { PageTitle } from "@/components/ui";
import { currency, orderId } from "@/lib/format";
import { readCustomer, saveOrder } from "@/lib/storage";
import type { Customer, Order } from "@/lib/types";

export default function CheckoutPage() {
  const router = useRouter();
  const cart = useCart();
  const [customer] = useState<Customer>(() => readCustomer());
  const [form, setForm] = useState(() => ({
    receiverName: customer.contactPerson,
    phone: customer.phone,
    deliveryAddress: customer.address,
    deliveryDate: "2026-06-28",
    deliveryTimeSlot: "上午" as Order["deliveryTimeSlot"],
    notes: customer.notes,
  }));

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (cart.lines.length === 0) return;

    const id = orderId();
    const now = new Date().toISOString();
    const order: Order = {
      orderId: id,
      customerName: customer.name,
      lineUserId: customer.lineUserId,
      status: "已建立",
      items: cart.lines.map((line) => ({
        productId: line.productId,
        name: line.product.name,
        spec: line.product.spec,
        unit: line.product.unit,
        price: line.product.price,
        quantity: line.quantity,
      })),
      subtotal: cart.subtotal,
      deliveryFee: cart.deliveryFee,
      totalAmount: cart.total,
      paymentMethod: "月結",
      receiverName: form.receiverName,
      phone: form.phone,
      deliveryAddress: form.deliveryAddress,
      deliveryDate: form.deliveryDate,
      deliveryTimeSlot: form.deliveryTimeSlot,
      notes: form.notes,
      createdAt: now,
      updatedAt: now,
    };

    saveOrder(order);
    cart.clearCart();
    router.push(`/liff/order-success/${id}`);
  }

  return (
    <>
      <PageTitle title="確認訂單" description="填寫配送資訊，送出後店家會確認訂單並安排配送。" />

      <section className="mx-5 rounded-md bg-[#F5F5F5] p-4">
        <div className="space-y-2">
          {cart.lines.map((line) => (
            <div key={line.productId} className="flex justify-between gap-3 text-sm">
              <span className="text-stone-700">
                {line.product.name} x {line.quantity}
              </span>
              <span className="font-bold">{currency(line.lineTotal)}</span>
            </div>
          ))}
        </div>
        <div className="mt-4 flex justify-between border-t border-stone-200 pt-3 text-lg font-black">
          <span>總金額</span>
          <span className="text-[#2E7D32]">{currency(cart.total)}</span>
        </div>
        <p className="mt-2 text-xs font-bold leading-5 text-stone-600">
          {cart.deliveryRule
            ? `配送規則：${cart.deliveryRule.name}，滿 ${currency(cart.deliveryRule.freeShippingThreshold)} 免運。`
            : "正在載入配送規則…"}
        </p>
      </section>

      <form onSubmit={submit} className="space-y-4 px-5 pt-5">
        <Field label="收貨人姓名" value={form.receiverName} onChange={(value) => setForm({ ...form, receiverName: value })} />
        <Field label="聯絡電話" value={form.phone} onChange={(value) => setForm({ ...form, phone: value })} />
        <Field label="配送地址" value={form.deliveryAddress} onChange={(value) => setForm({ ...form, deliveryAddress: value })} />
        <Field label="希望配送日期" type="date" value={form.deliveryDate} onChange={(value) => setForm({ ...form, deliveryDate: value })} />

        <label className="block">
          <span className="mb-2 block text-sm font-bold text-stone-800">希望配送時段</span>
          <select
            value={form.deliveryTimeSlot}
            onChange={(event) => setForm({ ...form, deliveryTimeSlot: event.target.value as Order["deliveryTimeSlot"] })}
            className="h-12 w-full rounded-md border border-stone-200 bg-white px-3 text-sm font-medium outline-none focus:border-[#2E7D32] focus:ring-4 focus:ring-green-100"
          >
            <option>上午</option>
            <option>下午</option>
            <option>指定時間</option>
          </select>
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-bold text-stone-800">備註</span>
          <textarea
            value={form.notes}
            onChange={(event) => setForm({ ...form, notes: event.target.value })}
            className="min-h-24 w-full rounded-md border border-stone-200 bg-white p-3 text-sm font-medium outline-none focus:border-[#2E7D32] focus:ring-4 focus:ring-green-100"
          />
        </label>

        <button className="h-12 w-full rounded-md bg-[#2E7D32] text-sm font-black text-white shadow-lg shadow-green-800/20">
          確認送出訂單
        </button>
      </form>
    </>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  type?: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-bold text-stone-800">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        required
        className="h-12 w-full rounded-md border border-stone-200 bg-white px-3 text-sm font-medium outline-none focus:border-[#2E7D32] focus:ring-4 focus:ring-green-100"
      />
    </label>
  );
}
