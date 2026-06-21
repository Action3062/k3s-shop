import { adminListServices } from "@/lib/controlPlane";
import { adminServerAction, adminReinstallServer, adminDeleteServer } from "@/app/admin-actions";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { StatusBanner } from "@/components/dashboard/OverviewWidgets";

export const metadata = { title: "Admin — Server" };

const DONE: Record<string, string> = {
  start: "Server gestartet.", stop: "Server pausiert.", restart: "Neustart ausgelöst.",
  backup: "Backup angestoßen.", "regenerate-token": "Token neu erzeugt.", reinstall: "Neuinstallation ausgelöst.",
};

function Act({ id, action, label }: { id: string; action: string; label: string }) {
  return (
    <form action={adminServerAction}>
      <input type="hidden" name="serviceId" value={id} />
      <input type="hidden" name="action" value={action} />
      <button type="submit" className="btn btn-ghost h-8 px-3 text-[12.5px]">{label}</button>
    </form>
  );
}

export default async function AdminServers({ searchParams }: { searchParams: { done?: string; error?: string; deleted?: string } }) {
  const servers = await adminListServices();

  return (
    <section>
      <h1 className="text-[30px] font-semibold tracking-[-0.02em]">Server</h1>
      <p className="text-muted text-[14px] mt-1 mb-5">Alle Kundeninstanzen — Start, Stopp, Neustart, Backup, Token, Neuinstallation, Löschen.</p>

      {searchParams.deleted && <StatusBanner tone="ok">Server zum Löschen eingeplant — Namespace, Daten &amp; Abo werden entfernt.</StatusBanner>}
      {searchParams.done && <StatusBanner tone="ok">{DONE[searchParams.done] ?? "Aktion ausgeführt."}</StatusBanner>}
      {searchParams.error === "pw" && <StatusBanner tone="danger">Admin-Passwort stimmt nicht — Aktion abgebrochen.</StatusBanner>}
      {searchParams.error === "cp" && <StatusBanner tone="danger">Control-Plane hat die Aktion abgelehnt.</StatusBanner>}

      <div className="text-[14px] font-semibold text-muted mb-3.5">Alle Server <span className="text-faint font-normal">({servers.length})</span></div>

      {servers.length === 0 ? (
        <div className="card text-muted text-[14px]">Keine Server vorhanden.</div>
      ) : (
        <div className="grid gap-3">
          {servers.map((a) => (
            <div key={a.id} className="card flex flex-col gap-3">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <b className="text-[15px]">{a.subdomain ?? a.name}</b>
                    <span className="mono text-[10px] px-2 py-0.5 rounded-md bg-surface border border-line text-muted">{a.appSlug}</span>
                    <StatusBadge status={a.status} />
                  </div>
                  <p className="mono text-[11px] text-faint mt-1 truncate">{a.ownerEmail ?? a.username} · {a.namespace}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Act id={a.id} action="start" label="▶ Start" />
                  <Act id={a.id} action="stop" label="⏸ Stopp" />
                  <Act id={a.id} action="restart" label="↻ Neustart" />
                  <Act id={a.id} action="backup" label="💾 Backup" />
                  <Act id={a.id} action="regenerate-token" label="🔑 Token" />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                <details className="flex-1 rounded-xl border border-[#FBBF24]/25 bg-[#FBBF24]/5 px-3">
                  <summary className="py-2.5 text-[13px] text-[#FBBF24] cursor-pointer list-none">♻ Neu installieren <span className="text-faint font-normal">(löscht Daten)</span></summary>
                  <form action={adminReinstallServer} className="pb-3 flex flex-col sm:flex-row gap-2 sm:items-end">
                    <input type="hidden" name="serviceId" value={a.id} />
                    <label className="flex-1"><span className="block text-[11px] text-muted mb-1">Dein Admin-Passwort</span>
                      <input name="password" type="password" required placeholder="Passwort" className="w-full h-9 px-3 rounded-lg bg-surface border border-line2 text-ink outline-none focus:border-[#FBBF24]" /></label>
                    <button type="submit" className="btn btn-ghost h-9 px-4 text-[13px] font-semibold">Neu installieren</button>
                  </form>
                </details>
                <details className="flex-1 rounded-xl border border-red-500/20 bg-red-500/5 px-3">
                  <summary className="py-2.5 text-[13px] text-red-400 cursor-pointer list-none">🗑 Server löschen <span className="text-faint font-normal">(Namespace, Daten &amp; Abo)</span></summary>
                  <form action={adminDeleteServer} className="pb-3 flex flex-col sm:flex-row gap-2 sm:items-end">
                    <input type="hidden" name="serviceId" value={a.id} />
                    <label className="flex-1"><span className="block text-[11px] text-muted mb-1">Dein Admin-Passwort</span>
                      <input name="password" type="password" required placeholder="Passwort" className="w-full h-9 px-3 rounded-lg bg-surface border border-line2 text-ink outline-none focus:border-red-400" /></label>
                    <button type="submit" className="btn h-9 px-4 text-[13px] font-semibold" style={{ background: "#FB7185", color: "#1A0A0D" }}>Endgültig löschen</button>
                  </form>
                </details>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
