import { prisma } from "@/lib/db";

export const metadata = { title: "Admin — Audit-Log" };

export default async function AdminAudit() {
  const logs = await prisma.auditLog.findMany({ orderBy: { createdAt: "desc" }, take: 200 });

  return (
    <section>
      <h1 className="text-[30px] font-semibold tracking-[-0.02em]">Audit-Log</h1>
      <p className="text-muted text-[14px] mt-1 mb-5">Protokoll aller Admin-Aktionen — die letzten 200 Einträge.</p>

      <div className="grid gap-1.5">
        {logs.map((l) => (
          <div key={l.id} className="card flex items-center justify-between gap-3 flex-wrap py-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="mono text-[12px] px-2 py-0.5 rounded-md bg-accent/10 text-accent-ink border border-accent/20">{l.action}</span>
                <span className="text-[13px]">{l.actorEmail}</span>
              </div>
              <p className="mono text-[11px] text-faint mt-1 truncate">{l.target ?? "—"}{l.detail ? ` · ${l.detail}` : ""}</p>
            </div>
            <span className="mono text-[11px] text-faint shrink-0">{l.createdAt.toLocaleString("de-DE")}</span>
          </div>
        ))}
        {logs.length === 0 && <div className="card text-muted text-[14px]">Noch keine Einträge.</div>}
      </div>
    </section>
  );
}
