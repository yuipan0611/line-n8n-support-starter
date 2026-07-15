"use client";

import { FormEvent, useState } from "react";
import { PageTitle } from "@/components/ui";
import { readCustomer, saveCustomer } from "@/lib/storage";
import type { Customer } from "@/lib/types";

export default function MemberPage() {
  const [customer, setCustomer] = useState<Customer>(() => readCustomer());
  const [saved, setSaved] = useState(false);

  function update<K extends keyof Customer>(key: K, value: Customer[K]) {
    setCustomer({ ...customer, [key]: value });
    setSaved(false);
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    saveCustomer(customer);
    setSaved(true);
  }

  return (
    <>
      <PageTitle title="會員專區" description="管理公司／學校資料、收貨資訊與常購商品。" />

      <form onSubmit={submit} className="space-y-4 px-5">
        <Field label="客戶名稱" value={customer.name} onChange={(value) => update("name", value)} />
        <label className="block">
          <span className="mb-2 block text-sm font-bold text-stone-800">客戶類型</span>
          <select
            value={customer.type}
            onChange={(event) => update("type", event.target.value as Customer["type"])}
            className="h-12 w-full rounded-md border border-stone-200 bg-white px-3 text-sm font-medium outline-none focus:border-[#7B1FA2] focus:ring-4 focus:ring-purple-100"
          >
            <option>學校</option>
            <option>政府</option>
            <option>公司</option>
            <option>個人</option>
          </select>
        </label>
        <Field label="聯絡人" value={customer.contactPerson} onChange={(value) => update("contactPerson", value)} />
        <Field label="電話" value={customer.phone} onChange={(value) => update("phone", value)} />
        <Field label="地址" value={customer.address} onChange={(value) => update("address", value)} />
        <Field label="統編" value={customer.taxId} onChange={(value) => update("taxId", value)} />
        <Area label="常購商品" value={customer.favoriteProducts} onChange={(value) => update("favoriteProducts", value)} />
        <Area label="備註" value={customer.notes} onChange={(value) => update("notes", value)} />

        {saved ? (
          <div className="rounded-md bg-purple-50 px-4 py-3 text-sm font-bold text-[#7B1FA2]">
            會員資料已更新。
          </div>
        ) : null}

        <button className="h-12 w-full rounded-md bg-[#7B1FA2] text-sm font-black text-white shadow-lg shadow-purple-900/20">
          儲存會員資料
        </button>
      </form>
    </>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-bold text-stone-800">{label}</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-12 w-full rounded-md border border-stone-200 bg-white px-3 text-sm font-medium outline-none focus:border-[#7B1FA2] focus:ring-4 focus:ring-purple-100"
      />
    </label>
  );
}

function Area({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-bold text-stone-800">{label}</span>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="min-h-24 w-full rounded-md border border-stone-200 bg-white p-3 text-sm font-medium outline-none focus:border-[#7B1FA2] focus:ring-4 focus:ring-purple-100"
      />
    </label>
  );
}
