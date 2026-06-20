export const dynamic = "force-dynamic";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCatalog } from "@/lib/controlPlane";
import { checkout } from "@/app/actions";

const AVAILABLE = new Set(["vaultwarden", "openclaw", "seerr"]);
const HUE: Record<string, string> = { vaultwarden: "#34D399", nextcloud: "#38BDF8", jellyfin: "#A78BFA", n8n: "#FBBF24", "uptime-kuma": "#F472B6", homepage: "#22D3EE" };

export default async function AppDetail({ params }: { params: { slug: string } }) {
  const catalog = await getCatalog();
  const app = catalog.find((a) => a.slug === params.slug);
  if (!app) notFound();
  const plan = app.plans[0];
  const available = AVAILABLE.has(app.slug);
  const hue = HUE[app.slug] ?? "#22D3EE";

  return (
    <section className="wrap py-16 max-w-3xl">
      <Link href="/catalog" className="text-muted hover:text-ink text-sm">← Alle Apps</Link>
      <div className="mt-6 flex items-center gap-4">
        <div className="grid place-items-center w-16 h-16 rounded-2xl font-semibold text-2xl mono" style={{ background: `${hue}1f`, color: hue }}>{app.name.charAt(0)}</div>
        <div>
          <h1 className="font-semibold tracking-[-0.02em] text-[32px]">{app.name}</h1>
          <span className="mono text-[12px] text-faint uppercase tracking-wider">{app.category}</span>
        </div>
      </div>
      <p className="text-muted text-lg mt-6 max-w-[60ch] leading-[1.7]">{app.description}</p>

      <div className="card mt-8 max-w-md">
        <div className="flex items-baseline justify-between">
          <div><span className="mono text-[34px]">{plan ? (plan.priceCents / 100).toFixed(0) : "—"} €</span><span className="text-faint"> / Monat</span></div>
          <span className="text-faint text-sm">{plan?.storageGi} GB Speicher</span>
        </div>
        <ul className="mt-4 text-sm text-muted space-y-2">
          <li>Eigene Subdomain unter <span className="mono text-[13px] text-accent-ink">&lt;username&gt;.{app.slug}.meinappnest.org</span></li>
          <li>Automatisches HTTPS · tägliche Backups · jederzeit kündbar</li>
        </ul>
        {available && plan ? (
          <form action={checkout} className="mt-6">
            <input type="hidden" name="planId" value={plan.id} />
            <button className="btn btn-primary w-full" type="submit">Abonnieren →</button>
          </form>
        ) : (
          <div className="mt-6 text-center text-faint text-sm border border-line rounded-xl py-3">Bald verfügbar</div>
        )}
      </div>
    </section>
  );
}
