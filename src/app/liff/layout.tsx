import { LiffShell } from "@/components/liff-shell";

export default function LiffLayout({ children }: { children: React.ReactNode }) {
  return <LiffShell>{children}</LiffShell>;
}
