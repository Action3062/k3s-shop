import Link from "next/link";
import type { ReactNode } from "react";
import type { Tone } from "@/lib/dashboard";

const TONE_TEXT: Record<Tone, string> = { ok: "#34D399", warn: "#FBBF24", danger: "#FB7185", info: "#22D3EE", muted: "#EBF1F6" };

export function StatWidget({ label, value, hint, tone = "muted" }: { label: string; value: ReactNode; hint?: string; tone?: Tone }) {
  return (
    <div className="card">
      <div className="text-faint text-[12.5px] font-medium">{label}</div>
      <div className="text-[28px] font-semibold tracking-[-0.02em] mt-1.5" style={{ color: TONE_TEXT[tone] }}>{value}</div>
      {hint && <p className="text-faint text-[12px] mt-1">{hint}</p>}
    </div>
  );
}

export function StatusBanner({ tone, children, action }: { tone: "ok" | "warn" | "danger"; children: ReactNode; action?: { href: string; label: string } }) {
  const cls = { ok: "border-ok/35 text-ok", warn: "border-[#FBBF24]/40 text-[#FBBF24]", danger: "border-[#FB7185]/40 text-[#FB7185]" }[tone];
  const icon = { ok: "✓", warn: "⚠", danger: "✕" }[tone];
  return (
    <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-[14px] mb-4 ${cls}`} role="status">
      <span aria-hidden>{icon}</span>
      <div className="flex-1">{children}</div>
      {action && <Link href={action.href} className="btn btn-ghost h-8 px-3 text-[13px]">{action.label}</Link>}
    </div>
  );
}

export function AttentionItem({ icon, title, desc, action }: { icon: string; title: string; desc?: string; action?: { href: string; label: string } }) {
  return (
    <div className="flex items-center gap-3 py-3 border-b border-line last:border-0">
      <span className="grid place-items-center h-9 w-9 rounded-[10px] bg-surface text-[16px]" aria-hidden>{icon}</span>
      <div className="flex-1 min-w-0">
        <div className="text-[14px] font-medium">{title}</div>
        {desc && <div className="text-[12.5px] text-muted">{desc}</div>}
      </div>
      {action && <Link href={action.href} className="btn btn-ghost h-8 px-3 text-[13px] shrink-0">{action.label}</Link>}
    </div>
  );
}

export function QuickAction({ icon, label, href }: { icon: string; label: string; href: string }) {
  return (
    <Link href={href} className="flex flex-col gap-2.5 p-4 rounded-xl border border-line2 bg-bg2 hover:border-accent/40 hover:bg-surface transition">
      <span className="text-[20px]" aria-hidden>{icon}</span>
      <span className="text-[13.5px] font-semibold">{label}</span>
    </Link>
  );
}
