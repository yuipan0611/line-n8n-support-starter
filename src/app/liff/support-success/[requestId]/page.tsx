"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { CheckCircle2, ClipboardList, MessageCircle } from "lucide-react";
import { PageTitle } from "@/components/ui";
import { readSupportRequest } from "@/lib/storage";

export default function SupportSuccessPage() {
  const params = useParams<{ requestId: string }>();
  const request = readSupportRequest(params.requestId);

  return (
    <>
      <PageTitle title="已收到工單" description="我們已將您的問題送交專人處理，店家確認後會透過 LINE 聯繫您。" />

      <section className="px-5">
        <div className="rounded-md border border-purple-100 bg-purple-50 p-5 text-center">
          <CheckCircle2 className="mx-auto text-[#7B1FA2]" size={44} />
          <p className="mt-3 text-xl font-black text-stone-950">工單送出成功</p>
          <p className="mt-1 text-sm font-bold text-[#7B1FA2]">{params.requestId}</p>
          <p className="mt-2 text-xs leading-5 text-stone-600">請勿重複送出同一個問題，專人會依急迫程度回覆。</p>
        </div>
      </section>

      {request ? (
        <section className="mx-5 mt-5 rounded-md border border-stone-200 bg-white p-4 shadow-sm">
          <Info label="客戶" value={request.customerName} />
          <Info label="聯絡人" value={`${request.contactPerson} ${request.phone}`.trim()} />
          <Info label="問題類型" value={request.topic} />
          <Info label="急迫程度" value={request.urgency} />
          <Info label="相關訂單" value={request.relatedOrderId || "未指定"} />
          <Info label="狀態" value={request.status} strong />
        </section>
      ) : (
        <section className="mx-5 mt-5 rounded-md border border-stone-200 bg-white p-4 shadow-sm">
          <div className="flex gap-3">
            <ClipboardList className="mt-0.5 shrink-0 text-[#7B1FA2]" size={22} />
            <p className="text-sm font-bold leading-6 text-stone-700">
              工單已送出。如需補充內容，請直接在 LINE 對話中留言給店家。
            </p>
          </div>
        </section>
      )}

      <div className="grid grid-cols-2 gap-3 px-5 pt-5">
        <Link href="/liff/orders" className="flex h-12 items-center justify-center rounded-md border border-stone-200 text-sm font-black text-stone-700">
          查看訂單
        </Link>
        <Link href="/liff/products" className="flex h-12 items-center justify-center rounded-md bg-[#2E7D32] text-sm font-black text-white">
          回商品頁
        </Link>
      </div>

      <div className="px-5 pt-3">
        <Link href="/liff/support" className="flex h-12 items-center justify-center gap-2 rounded-md border border-purple-100 bg-white text-sm font-black text-[#7B1FA2]">
          <MessageCircle size={18} />
          送出其他問題
        </Link>
      </div>
    </>
  );
}

function Info({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-stone-100 py-3 last:border-0">
      <span className="shrink-0 text-sm text-stone-500">{label}</span>
      <span className={strong ? "text-right font-black text-[#7B1FA2]" : "text-right font-bold text-stone-800"}>{value}</span>
    </div>
  );
}
