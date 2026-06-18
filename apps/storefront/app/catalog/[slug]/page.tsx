import Link from "next/link";
import { notFound } from "next/navigation";
import { getCatalog } from "@/lib/controlPlane";
import { checkout } from "@/app/actions";

const AVAILABLE = new Set(["vaultwarden"]);

export default async function AppDetail({ params }: { params: { slug: string } }) {
  const catalog = await getCatalog();
  const app = catalog.find((a) => a.slug === params.slug);
  if (!app) notFound();
  const plan = app.plans[0];
  const available = AVAILABLE.has(app.slug);

  return (
    <section className="wrap py-16 max-w-3xl">
      <Link href="/catalog" className="text-muted hover:text-ink text-sm">← Alle Apps</Link>
      <div className="mt-6 flex items-center gap-4">
        <div className="grid place-items-center w-16 h-16 rounded-2xl font-bold text-2xl text-bg" style={{ background: "linear-gradient(135deg,#3b82f6,#1d4ed8)" }}>{app.name.charAt(0)}</div>
        <div>
          <h1 className="font-semibold tracking-tight text-[32px]">{app.name}</h1>
          <span className="text-faint">{app.category}</span>
        </div>
      </div>
      <p className="text-muted text-lg mt-6 max-w-[60ch]">{app.description}</p>

      <div className="card rounded-2xl mt-8 max-w-md">
        <div className="flex items-baseline justify-between">
          <div><b className="text-3xl">{plan ? (plan.priceCents / 100).toFixed(0) : "—"}&nbsp;€</b><span className="text-faint"> / Monat</span></div>
          <span className="text-faint text-sm">{plan?.storageGi} GB Speicher</span>
        </div>
        <ul className="mt-4 text-sm text-muted space-y-2">
          <li>Eigene Subdomain unter <span className="font-mono text-[13px]">&lt;username&gt;.{app.slug}.dyndnsv4.de</span></li>
          <li>Automatisches HTTPS · tägliche Backups · jederzeit kündbar</li>
        </ul>
        {available && plan ? (
          <form action={checkout} className="mt-6">
            <input type="hidden" name="planId" value={plan.id} />
            <button className="btn btn-primary w-full" type="submit">Abonnieren →</button>
          </form>
        ) : (
          <div className="mt-6 text-center text-faint text-sm border border-line rounded-[10px] py-3">Bald verfügbar</div>
        )}
      </div>
    </section>
  );
}
