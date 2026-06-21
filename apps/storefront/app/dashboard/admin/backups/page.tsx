import { prisma } from "@/lib/db";
import { StatWidget } from "@/components/dashboard/OverviewWidgets";

export const metadata = { title: "Admin — Backups" };

const B_TONE: Record<string, string> = { PENDING: "#9DB0BE", COMPLETED: "#34D399", FAILED: "#FB7185" };

function size(bytes: bigint | null): string {
  if (bytes == null) return "—";
  const mb = Number(bytes) / 1e6;
  return mb >= 1000 ? `${(mb / 1000).toFixed(1)} GB` : `${mb.toFixed(0)} MB`;
}

export default async function AdminBackups() {
  const [backups, stale] = await Promise.all([
    prisma.backup.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
      include: { instance: { select: { namespace: true, appSlug: true } } },
    }),
    prisma.serviceInstance.findMany({
      where: { status: "RUNNING", OR: [{ lastBackupAt: null }, { lastBackupAt: { lt: new Date(Date.now() - 7 * 864e5) } }] },
      select: { id: true, namespace: true, appSlug: true, lastBackupAt: true },
    }),
  ]);

  const ok = backups.filter((b) => b.status === "COMPLETED").length;
  const failed = backups.filter((b) => b.status === "FAILED").length;

  return (
    <section>
      <h1 className="text-[30px] font-semibold tracking-[-0.02em]">Backups</h1>
      <p className="text-muted text-[14px] mt-1 mb-5">Volume-Snapshots aller Instanzen.</p>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 mb-7">
        <StatWidget label="Backups gesamt" value={backups.length} tone="muted" />
        <StatWidget label="Erfolgreich" value={ok} tone="ok" />
        <StatWidget label="Fehlgeschlagen" value={failed} tone={failed ? "danger" : "muted"} />
        <StatWidget label="Ohne akt. Backup" value={stale.length} tone={stale.length ? "warn" : "muted"} />
      </div>

      {stale.length > 0 && (
        <div className="card mb-7">
          <div className="text-[14px] font-semibold text-[#FBBF24] mb-2">Laufende Server ohne aktuelles Backup (&gt; 7 Tage)</div>
          <div className="grid gap-1.5">
            {stale.map((s) => (
              <p key={s.id} className="mono text-[12px] text-faint">{s.namespace} · {s.appSlug} · {s.lastBackupAt ? s.lastBackupAt.toLocaleDateString("de-DE") : "noch nie"}</p>
            ))}
          </div>
        </div>
      )}

      <div className="text-[14px] font-semibold text-muted mb-3.5">Verlauf <span className="text-faint font-normal">({backups.length})</span></div>
      <div className="grid gap-2.5">
        {backups.map((b) => (
          <div key={b.id} className="card flex items-center justify-between gap-3 flex-wrap">
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="pill h-7 text-[12px] font-semibold"><span className="dot" style={{ background: B_TONE[b.status] ?? "#9DB0BE" }} />{b.status}</span>
                <b className="text-[13.5px] mono">{b.instance?.namespace ?? "—"}</b>
              </div>
              <p className="mono text-[11px] text-faint mt-1 truncate">{b.snapshotRef ?? "—"} · {size(b.sizeBytes)} · {b.createdAt.toLocaleString("de-DE")}</p>
            </div>
          </div>
        ))}
        {backups.length === 0 && <div className="card text-muted text-[14px]">Noch keine Backups.</div>}
      </div>
    </section>
  );
}
