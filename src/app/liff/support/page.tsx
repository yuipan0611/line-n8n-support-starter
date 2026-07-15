"use client";

import { FormEvent, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Headphones, MessageSquareText } from "lucide-react";
import { PageTitle } from "@/components/ui";
import { supportRequestId } from "@/lib/format";
import { readCustomer, readOrders, saveSupportRequest } from "@/lib/storage";
import type { SupportRequest } from "@/lib/types";

export default function SupportPage() {
  const router = useRouter();
  const [customer] = useState(() => readCustomer());
  const [orders] = useState(() => readOrders());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const isSubmittingRef = useRef(false);
  const latestOrderId = useMemo(() => orders[0]?.orderId ?? "", [orders]);
  const [form, setForm] = useState({
    contactPerson: customer.contactPerson,
    phone: customer.phone,
    topic: "訂單問題" as SupportRequest["topic"],
    urgency: "一般" as SupportRequest["urgency"],
    relatedOrderId: latestOrderId,
    message: "",
  });

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmittingRef.current) return;
    isSubmittingRef.current = true;
    setIsSubmitting(true);
    setSubmitError("");

    const now = new Date().toISOString();
    const request: SupportRequest = {
      requestId: supportRequestId(),
      lineUserId: customer.lineUserId,
      customerName: customer.name,
      contactPerson: form.contactPerson,
      phone: form.phone,
      topic: form.topic,
      urgency: form.urgency,
      relatedOrderId: form.relatedOrderId,
      message: form.message,
      status: "新工單",
      createdAt: now,
    };

    try {
      const response = await fetch("/api/support-request", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          ...request,
          liffUrl: window.location.href,
        }),
      });
      const result = (await response.json()) as { ok?: boolean };

      if (!response.ok || !result.ok) {
        throw new Error("support request delivery failed");
      }

      saveSupportRequest(request);
      router.replace(`/liff/support-success/${request.requestId}`);
    } catch {
      isSubmittingRef.current = false;
      setSubmitError("目前工單送出失敗，請稍後再試或直接從 LINE 留言給店家。");
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <PageTitle title="轉交專人協助" description="請留下問題重點與聯絡資訊，店家會依急迫程度安排回覆。" />

      <section className="mx-5 rounded-md bg-gradient-to-r from-purple-50 to-green-50 p-4">
        <div className="flex gap-3">
          <div className="grid size-11 shrink-0 place-items-center rounded-md bg-white text-[#7B1FA2] shadow-sm">
            <Headphones size={23} />
          </div>
          <div>
            <p className="text-sm font-black text-stone-950">專人會依內容回覆您</p>
            <p className="mt-1 text-xs leading-5 text-stone-600">
              請盡量留下訂單編號、配送日期或想確認的商品，方便我們更快處理。
            </p>
          </div>
        </div>
      </section>

      <form onSubmit={submit} className="space-y-4 px-5 pt-5">
        <Field label="聯絡人" value={form.contactPerson} onChange={(value) => setForm({ ...form, contactPerson: value })} />
        <Field label="聯絡電話" value={form.phone} onChange={(value) => setForm({ ...form, phone: value })} />

        <label className="block">
          <span className="mb-2 block text-sm font-bold text-stone-800">問題類型</span>
          <select
            value={form.topic}
            onChange={(event) => setForm({ ...form, topic: event.target.value as SupportRequest["topic"] })}
            className="h-12 w-full rounded-md border border-stone-200 bg-white px-3 text-sm font-medium outline-none focus:border-[#7B1FA2] focus:ring-4 focus:ring-purple-100"
          >
            <option>訂單問題</option>
            <option>商品報價</option>
            <option>配送安排</option>
            <option>帳款月結</option>
            <option>其他</option>
          </select>
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-bold text-stone-800">急迫程度</span>
          <select
            value={form.urgency}
            onChange={(event) => setForm({ ...form, urgency: event.target.value as SupportRequest["urgency"] })}
            className="h-12 w-full rounded-md border border-stone-200 bg-white px-3 text-sm font-medium outline-none focus:border-[#7B1FA2] focus:ring-4 focus:ring-purple-100"
          >
            <option>一般</option>
            <option>今天需回覆</option>
            <option>急件</option>
          </select>
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-bold text-stone-800">相關訂單</span>
          <select
            value={form.relatedOrderId}
            onChange={(event) => setForm({ ...form, relatedOrderId: event.target.value })}
            className="h-12 w-full rounded-md border border-stone-200 bg-white px-3 text-sm font-medium outline-none focus:border-[#7B1FA2] focus:ring-4 focus:ring-purple-100"
          >
            <option value="">不指定訂單</option>
            {orders.map((order) => (
              <option key={order.orderId} value={order.orderId}>
                {order.orderId}・{order.status}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-bold text-stone-800">問題說明</span>
          <div className="relative">
            <MessageSquareText className="absolute left-3 top-3 text-stone-400" size={18} />
            <textarea
              value={form.message}
              onChange={(event) => setForm({ ...form, message: event.target.value })}
              required
              placeholder="例如：明天上午配送想改下午、想確認香蕉大量報價、需要月結資料..."
              className="min-h-32 w-full rounded-md border border-stone-200 bg-white p-3 pl-10 text-sm font-medium leading-6 outline-none focus:border-[#7B1FA2] focus:ring-4 focus:ring-purple-100"
            />
          </div>
        </label>

        {submitError ? <p className="text-sm font-bold leading-6 text-red-600">{submitError}</p> : null}

        <button
          disabled={isSubmitting}
          className="h-12 w-full rounded-md bg-[#7B1FA2] text-sm font-black text-white shadow-lg shadow-purple-900/20 disabled:cursor-not-allowed disabled:bg-stone-300 disabled:shadow-none"
        >
          {isSubmitting ? "送出中..." : "送出給人工客服"}
        </button>
      </form>
    </>
  );
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-bold text-stone-800">{label}</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        required
        className="h-12 w-full rounded-md border border-stone-200 bg-white px-3 text-sm font-medium outline-none focus:border-[#7B1FA2] focus:ring-4 focus:ring-purple-100"
      />
    </label>
  );
}
