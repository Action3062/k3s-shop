import { prisma } from "@/lib/db";
import { StatWidget } from "@/components/dashboard/OverviewWidgets";

export const metadata = { title: "Admin — Jobs" };

const JOB_TONE: Record<string, string> = { QUEUED: "#9DB0BE", RUNNING: "#22D3EE", SUCCEEDED: "#34D399", FAILED: "#FB7185" };

export default async function AdminJobs() {
  const jobs = await prisma.provisioningJob.findMany({
    orderBy: { updatedAt: "desc" },
    take: 100,
    include: { instance: { select: { namespace: true, appSlug: true } } },
  });

  const by = (st: string) => jobs.filter((j) => j.status === st).length;

  return (
    <section>
      <h1 className="text-[30px] font-semibold tracking-[-0.02em]">Jobs</h1>
      <p className="text-muted text-[14px] mt-1 mb-5">Provisioning-Warteschlange — die letzten 100 Jobs.</p>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 mb-7">
        <StatWidget label="In Warteschlange" value={by("QUEUED")} tone="muted" />
        <StatWidget label="Läuft" value={by("RUNNING")} tone="info" />
        <StatWidget label="Erfolgreich" value={by("SUCCEEDED")} tone="ok" />
        <StatWidget label="Fehlgeschlagen" value={by("FAILED")} tone={by("FAILED") ? "danger" : "muted"} />
      </div>

      <div className="grid gap-2.5">
        {jobs.map((j) => (
          <div key={j.id} className="card flex items-start justify-between gap-3 flex-wrap">
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="pill h-7 text-[12px] font-semibold"><span className="dot" style={{ background: JOB_TONE[j.status] ?? "#9DB0BE" }} />{j.status}</span>
                <b className="text-[14px]">{j.type}</b>
                {j.attempts > 0 && <span className="text-faint text-[11px]">· {j.attempts} Versuch(e)</span>}
              </div>
              <p className="mono text-[11px] text-faint mt-1 truncate">{j.instance?.namespace ?? "—"} · {j.instance?.appSlug ?? ""} · {j.updatedAt.toLocaleString("de-DE")}</p>
              {j.lastError && <p className="mono text-[11px] text-red-400 mt-1 break-all">⚠ {j.lastError}</p>}
            </div>
          </div>
        ))}
        {jobs.length === 0 && <div className="card text-muted text-[14px]">Keine Jobs vorhanden.</div>}
      </div>
    </section>
  );
}
