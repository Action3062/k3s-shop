import { prisma } from "@/lib/db";
import { catalogToggleActive, catalogUpdate } from "@/app/admin-actions";
import { StatusBanner } from "@/components/dashboard/OverviewWidgets";
import { euro } from "@/lib/dashboard";

export const metadata = { title: "Admin — Katalog" };

export default async function AdminCatalog({ searchParams }: { searchParams: { done?: string; error?: string } }) {
  const apps = await prisma.catalogApp.findMany({
    orderBy: { name: "asc" },
    include: { plans: { orderBy: { priceCents: "asc" } }, _count: { select: { subscriptions: true } } },
  });

  return (
    <section>
      <h1 className="text-[30px] font-semibold tracking-[-0.02em]">Katalog</h1>
      <p className="text-muted text-[14px] mt-1 mb-5">Apps sichtbar/unsichtbar schalten, Beschreibung &amp; Standard-Speicher pflegen.</p>

      {searchParams.done === "catalog" && <StatusBanner tone="ok">Katalog aktualisiert.</StatusBanner>}
      {searchParams.error === "bad" && <StatusBanner tone="danger">Ungültige Eingabe.</StatusBanner>}

      <div className="grid gap-3">
        {apps.map((app) => (
          <div key={app.id} className="card flex flex-col gap-3">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <b className="text-[15px]">{app.name}</b>
                  <span className="mono text-[10px] px-2 py-0.5 rounded-md bg-surface border border-line text-muted">{app.slug}</span>
                  <span className={`mono text-[10px] px-2 py-0.5 rounded-md border ${app.active ? "border-ok/40 text-ok bg-ok/10" : "border-line text-faint bg-surface"}`}>{app.active ? "aktiv" : "inaktiv"}</span>
                </div>
                <p className="text-[12.5px] text-muted mt-1">{app.description}</p>
                <p className="mono text-[11px] text-faint mt-1">{app.category ?? "—"} · {app.defaultStorageGi} GiB Standard · {app._count.subscriptions} Abo(s) · {app.plans.length} Plan/Pläne</p>
              </div>
              <form action={catalogToggleActive}>
                <input type="hidden" name="appId" value={app.id} />
                <button type="submit" className="btn btn-ghost h-9 px-3 text-[13px]">{app.active ? "Deaktivieren" : "Aktivieren"}</button>
              </form>
            </div>

            {app.plans.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {app.plans.map((p) => (
                  <span key={p.id} className="mono text-[11px] px-2.5 py-1 rounded-lg bg-surface border border-line text-muted">{p.name}: {euro(p.priceCents)}/{p.interval} · {p.storageGi} GiB</span>
                ))}
              </div>
            )}

            <details className="rounded-xl border border-line2 bg-surface/40 px-3">
              <summary className="py-2.5 text-[13px] text-muted cursor-pointer list-none">✎ Bearbeiten</summary>
              <form action={catalogUpdate} className="pb-3 grid gap-2.5 sm:grid-cols-2">
                <input type="hidden" name="appId" value={app.id} />
                <label className="sm:col-span-2"><span className="block text-[11px] text-muted mb-1">Name</span>
                  <input name="name" defaultValue={app.name} required className="w-full h-9 px-3 rounded-lg bg-bg2 border border-line2 text-ink outline-none focus:border-accent" /></label>
                <label className="sm:col-span-2"><span className="block text-[11px] text-muted mb-1">Beschreibung</span>
                  <textarea name="description" defaultValue={app.description} required rows={2} className="w-full px-3 py-2 rounded-lg bg-bg2 border border-line2 text-ink outline-none focus:border-accent" /></label>
                <label><span className="block text-[11px] text-muted mb-1">Kategorie</span>
                  <input name="category" defaultValue={app.category ?? ""} className="w-full h-9 px-3 rounded-lg bg-bg2 border border-line2 text-ink outline-none focus:border-accent" /></label>
                <label><span className="block text-[11px] text-muted mb-1">Standard-Speicher (GiB)</span>
                  <input name="defaultStorageGi" type="number" min={1} max={1000} defaultValue={app.defaultStorageGi} className="w-full h-9 px-3 rounded-lg bg-bg2 border border-line2 text-ink outline-none focus:border-accent" /></label>
                <div className="sm:col-span-2"><button type="submit" className="btn btn-primary h-9 px-4 text-[13px]">Speichern</button></div>
              </form>
            </details>
          </div>
        ))}
        {apps.length === 0 && <div className="card text-muted text-[14px]">Katalog ist leer. (Control-Plane-Seed nötig.)</div>}
      </div>
    </section>
  );
}
