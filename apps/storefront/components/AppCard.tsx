import Link from "next/link";
import type { CatalogApp } from "@/lib/types";

const MARKS: Record<string, string> = {
  vaultwarden: "linear-gradient(135deg,#3b82f6,#1d4ed8)",
  nextcloud: "linear-gradient(135deg,#0ea5e9,#0369a1)",
  jellyfin: "linear-gradient(135deg,#a855f7,#6d28d9)",
};

export function AppCard({ app, available }: { app: CatalogApp; available?: boolean }) {
  const plan = app.plans[0];
  const price = plan ? (plan.priceCents / 100).toFixed(0) : "—";
  return (
    <div className={`relative card rounded-2xl transition hover:-translate-y-0.5 hover:border-line2 ${available ? "" : "opacity-60"}`}>
      <span className={available ? "absolute top-4 right-4 text-[11px] font-medium text-bg rounded-full px-2.5 py-0.5" : "absolute top-4 right-4 text-[11px] text-faint border border-line rounded-full px-2.5 py-0.5"}
        style={available ? { background: "linear-gradient(135deg,#22d3ee,#0ea5e9)" } : undefined}>
        {available ? "Verfügbar" : "Bald"}
      </span>
      <div className="flex items-center gap-3 mb-3.5">
        <div className="grid place-items-center w-[46px] h-[46px] rounded-xl font-bold text-[18px] text-bg" style={{ background: MARKS[app.slug] ?? "linear-gradient(135deg,#22d3ee,#0ea5e9)" }}>
          {app.name.charAt(0)}
        </div>
        <div>
          <b className="block text-base">{app.name}</b>
          <span className="text-[12.5px] text-faint">{app.category}</span>
        </div>
      </div>
      <p className="text-sm text-muted min-h-[42px]">{app.description}</p>
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-line">
        <span><b className="text-xl">{price}&nbsp;€</b><span className="text-faint text-[13px]"> / Monat</span></span>
        {available
          ? <Link href={`/catalog/${app.slug}`} className="btn btn-primary h-9 px-4">Abonnieren</Link>
          : <Link href="/signup" className="btn btn-ghost h-9 px-4">Benachrichtigen</Link>}
      </div>
    </div>
  );
}
