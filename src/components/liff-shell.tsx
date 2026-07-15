"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ClipboardList, ShoppingBasket, ShoppingCart, UserRound } from "lucide-react";
import { CatalogProvider } from "./catalog-context";
import { CartProvider, useCart } from "./cart-context";

const navItems = [
  { href: "/liff/products", label: "商品", icon: ShoppingBasket },
  { href: "/liff/orders", label: "訂單", icon: ClipboardList },
  { href: "/liff/member", label: "我的", icon: UserRound },
];

function BottomNav() {
  const pathname = usePathname();
  const { count } = useCart();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 mx-auto max-w-[430px] border-t border-stone-200 bg-white/95 px-4 pb-[max(env(safe-area-inset-bottom),10px)] pt-2 shadow-[0_-10px_28px_rgba(22,60,32,0.08)] backdrop-blur">
      <div className="grid grid-cols-4 items-center gap-1">
        {navItems.map((item) => {
          const active = pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex h-12 flex-col items-center justify-center gap-1 rounded-md text-xs font-semibold ${
                active ? "bg-green-50 text-[#2E7D32]" : "text-stone-500"
              }`}
            >
              <Icon size={20} strokeWidth={active ? 2.6 : 2.1} />
              {item.label}
            </Link>
          );
        })}
        <Link
          href="/liff/cart"
          className={`relative flex h-12 flex-col items-center justify-center gap-1 rounded-md text-xs font-semibold ${
            pathname.startsWith("/liff/cart") || pathname.startsWith("/liff/checkout")
              ? "bg-green-50 text-[#2E7D32]"
              : "text-stone-500"
          }`}
        >
          <ShoppingCart size={20} />
          購物車
          {count > 0 ? (
            <span className="absolute right-4 top-1 grid min-w-5 place-items-center rounded-full bg-[#F9A825] px-1 text-[11px] font-bold text-white">
              {count}
            </span>
          ) : null}
        </Link>
      </div>
    </nav>
  );
}

function ShellInner({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#EEF5EF] text-stone-950">
      <div className="mx-auto min-h-screen max-w-[430px] bg-[#FBFCFA] shadow-2xl shadow-green-950/10">
        <header className="sticky top-0 z-30 border-b border-emerald-100 bg-[#FBFCFA]/95 px-5 pb-3 pt-[max(env(safe-area-inset-top),14px)] backdrop-blur">
          <div className="flex items-center justify-between">
            <Link href="/liff/products" className="flex items-center gap-2">
              <span className="grid size-9 place-items-center rounded-md bg-[#2E7D32] text-lg font-black text-white shadow-sm shadow-green-900/20">
                果
              </span>
              <div>
                <p className="text-sm font-bold leading-4 text-stone-950">示範果舖</p>
                <p className="text-xs font-medium text-stone-500">線上訂購・配送服務</p>
              </div>
            </Link>
            <div className="rounded-md bg-white px-3 py-1.5 text-right shadow-sm">
              <p className="text-[11px] font-semibold text-[#2E7D32]">團膳客戶</p>
              <p className="text-xs text-stone-600">專人配送</p>
            </div>
          </div>
        </header>
        <main className="pb-24">{children}</main>
        <BottomNav />
      </div>
    </div>
  );
}

export function LiffShell({ children }: { children: React.ReactNode }) {
  return (
    <CatalogProvider>
      <CartProvider>
        <ShellInner>{children}</ShellInner>
      </CartProvider>
    </CatalogProvider>
  );
}
