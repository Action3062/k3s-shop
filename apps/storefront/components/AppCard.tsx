import Link from "next/link";
import type { CatalogApp } from "@/lib/types";

const HUE: Record<string, string> = {
  vaultwarden: "#34D399", nextcloud: "#38BDF8", jellyfin: "#A78BFA", plex: "#A78BFA",
  n8n: "#FBBF24", radarr: "#FBBF24", sonarr: "#FBBF24", "uptime-kuma": "#F472B6", homepage: "#22D3EE",
};

export function AppCard({ app, available }: { app: CatalogApp; available?: boolean }) {
  const plan = app.plans[0];
  const price = plan ? (plan.priceCents / 100).toFixed(0) : "—";
  const hue = HUE[app.slug] ?? "#22D3EE";
  return (
    <article className={`card card-hover group flex flex-col ${available ? "" : "opacity-70"}`}>
      <div className="flex items-start justify-between">
        <span className="grid place-items-center h-11 w-11 rounded-xl text-[15px] mono font-semibold transition-transform group-hover:scale-105" style={{ background: `${hue}1f`, color: hue }}>{app.name.charAt(0)}</span>
        <span className="pill h-7 text-[11px] mono">
          <span className="dot pulse-soft" style={{ background: available ? "#34D399" : "#65788A", boxShadow: available ? "0 0 8px #34D399" : "none" }} />
          {available ? "Verfügbar" : "Bald"}
        </span>
      </div>
      <h3 className="mt-4 text-[16px] font-semibold">{app.name}</h3>
      <p className="mono text-[11px] text-faint uppercase tracking-wider">{app.category}</p>
      <p className="mt-2 text-[14px] leading-[1.6] text-muted">{app.description}</p>
      <div className="mt-5 flex items-center justify-between border-t border-line pt-4">
        <span className="mono text-[13px]">ab <span className="text-accent-ink">{price} €</span>/Mon.</span>
        {available
          ? <Link href={`/catalog/${app.slug}`} className="btn btn-primary h-9 px-4 text-[14px]">Abonnieren</Link>
          : <Link href="/signup" className="btn btn-ghost h-9 px-4 text-[14px]">Benachrichtigen</Link>}
      </div>
    </article>
  );
}
