import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { adminListServices } from "@/lib/controlPlane";
import { adminDeprovisionService } from "@/app/actions";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { StatWidget } from "@/components/dashboard/OverviewWidgets";

export const metadata = { title: "Admin — MeinAppNest" };

export default async function Admin({ searchParams }: { searchParams: { error?: string; deleted?: string } }) {
  const session = await auth();
  if (!session) redirect("/login");
  if ((session.user as { role?: string } | undefined)?.role !== "ADMIN") redirect("/dashboard");

  const servers = await adminListServices();
  const customers = new Set(servers.map((s) => s.ownerEmail ?? s.username ?? s.id)).size;
  const active = servers.filter((s) => s.status === "RUNNING").length;
  const setting = servers.filter((s) => s.status === "PROVISIONING" || s.status === "PENDING").length;
  const failed = servers.filter((s) => s.status === "FAILED").length;

  return (
    <section>
      <span className="eyebrow" style={{ color: "#FB7185" }}>Admin-Bereich</span>
      <h1 className="text-[30px] font-semibold tracking-[-0.02em] mt-1.5">Betrieb & alle Server</h1>
      <p className="text-muted text-[14px] mt-1 mb-5">Kundenübergreifende Verwaltung — nur für Rolle ADMIN.</p>

      <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-[#FB7185]/40 text-[#FB7185] text-[14px] mb-5" role="status">
        <span aria-hidden>🛠️</span><div className="flex-1"><b>Admin-Ansicht.</b> Aktionen hier wirken auf fremde Kundeninstanzen. Mit Bedacht handeln.</div>
      </div>

      {searchParams.error === "pw" && <div className="mb-4 text-sm rounded-xl px-4 py-3 border border-red-500/40 text-red-400">Admin-Passwort stimmt nicht — Aktion abgebrochen.</div>}
      {searchParams.deleted && <div className="mb-4 text-sm rounded-xl px-4 py-3 border border-ok/40 text-ok">Server deprovisioniert — Namespace, Daten & Abo wurden entfernt.</div>}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <StatWidget label="Kunden" value={customers} tone="muted" />
        <StatWidget label="Aktive Server" value={active} tone="ok" />
        <StatWidget label="In Einrichtung" value={setting} tone={setting > 0 ? "info" : "muted"} />
        <StatWidget label="Störungen" value={failed} tone={failed > 0 ? "danger" : "muted"} />
      </div>

      <div className="flex items-center justify-between mt-8 mb-3.5"><h2 className="text-[18px] font-semibold">Alle Server <span className="text-faint font-normal">({servers.length})</span></h2></div>

      {servers.length === 0 ? (
        <div className="card text-muted text-[14px]">Keine Server vorhanden.</div>
      ) : (
        <div className="grid gap-3">
          {servers.map((a) => (
            <div key={a.id} className="card flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <b className="text-[15px]">{a.subdomain ?? a.name}</b>
                  <span className="mono text-[10px] px-2 py-0.5 rounded-md bg-surface border border-line text-muted">{a.appSlug}</span>
                  <StatusBadge status={a.status} />
                </div>
                <p className="mono text-[11px] text-faint mt-1 truncate">{a.ownerEmail ?? a.username} · {a.namespace}</p>
              </div>
              <details className="rounded-xl border border-red-500/20 bg-red-500/5 px-3 sm:min-w-[360px]">
                <summary className="py-2.5 text-[13px] text-red-400 cursor-pointer list-none">🗑 Server löschen <span className="text-faint font-normal">(entfernt Namespace, Daten &amp; Abo)</span></summary>
                <form action={adminDeprovisionService} className="pb-3 flex flex-col sm:flex-row gap-2 sm:items-end">
                  <input type="hidden" name="serviceId" value={a.id} />
                  <label className="flex-1"><span className="block text-[11px] text-muted mb-1">Dein Admin-Passwort</span>
                    <input name="password" type="password" required placeholder="Passwort" className="w-full h-9 px-3 rounded-lg bg-surface border border-line2 text-ink outline-none focus:border-red-400" /></label>
                  <button type="submit" className="btn h-9 px-4 text-[13px] font-semibold" style={{ background: "#FB7185", color: "#1A0A0D" }}>Endgültig löschen</button>
                </form>
              </details>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
