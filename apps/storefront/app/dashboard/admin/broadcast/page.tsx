import { prisma } from "@/lib/db";
import { createBroadcast, setBroadcastActive } from "@/app/admin-actions";
import { StatusBanner } from "@/components/dashboard/OverviewWidgets";

export const metadata = { title: "Admin — Broadcast" };

const LEVEL: Record<string, { label: string; color: string }> = {
  INFO: { label: "Info", color: "#22D3EE" },
  WARN: { label: "Warnung", color: "#FBBF24" },
  MAINT: { label: "Wartung", color: "#FB7185" },
};

export default async function AdminBroadcast({ searchParams }: { searchParams: { done?: string; error?: string } }) {
  const items = await prisma.broadcast.findMany({ orderBy: { createdAt: "desc" }, take: 50 });

  return (
    <section>
      <h1 className="text-[30px] font-semibold tracking-[-0.02em]">Broadcast</h1>
      <p className="text-muted text-[14px] mt-1 mb-5">Ankündigungen, die allen Kunden im Dashboard angezeigt werden.</p>

      {searchParams.done === "broadcast" && <StatusBanner tone="ok">Gespeichert.</StatusBanner>}
      {searchParams.error === "bad" && <StatusBanner tone="danger">Bitte Titel und Text ausfüllen.</StatusBanner>}

      <form action={createBroadcast} className="card grid gap-2.5 mb-7">
        <div className="text-[14px] font-semibold">Neue Ankündigung</div>
        <label><span className="block text-[11px] text-muted mb-1">Titel</span>
          <input name="title" required className="w-full h-9 px-3 rounded-lg bg-surface border border-line2 text-ink outline-none focus:border-accent" /></label>
        <label><span className="block text-[11px] text-muted mb-1">Text</span>
          <textarea name="body" required rows={2} className="w-full px-3 py-2 rounded-lg bg-surface border border-line2 text-ink outline-none focus:border-accent" /></label>
        <div className="flex gap-2 items-end">
          <label className="flex-1 max-w-[200px]"><span className="block text-[11px] text-muted mb-1">Stufe</span>
            <select name="level" defaultValue="INFO" className="w-full h-9 px-2 rounded-lg bg-surface border border-line2 text-ink text-[13px] outline-none focus:border-accent">
              <option value="INFO">Info</option>
              <option value="WARN">Warnung</option>
              <option value="MAINT">Wartung</option>
            </select></label>
          <button type="submit" className="btn btn-primary h-9 px-4 text-[13px]">Veröffentlichen</button>
        </div>
      </form>

      <div className="text-[14px] font-semibold text-muted mb-3.5">Ankündigungen <span className="text-faint font-normal">({items.length})</span></div>
      <div className="grid gap-2.5">
        {items.map((b) => {
          const lvl = LEVEL[b.level] ?? LEVEL.INFO;
          return (
            <div key={b.id} className="card flex items-start justify-between gap-3 flex-wrap">
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="pill h-7 text-[12px] font-semibold"><span className="dot" style={{ background: lvl.color }} />{lvl.label}</span>
                  <b className="text-[14px]">{b.title}</b>
                  {!b.active && <span className="mono text-[10px] text-faint">(inaktiv)</span>}
                </div>
                <p className="text-[12.5px] text-muted mt-1">{b.body}</p>
                <p className="mono text-[11px] text-faint mt-1">{b.createdAt.toLocaleString("de-DE")} · {b.createdBy ?? "—"}</p>
              </div>
              <form action={setBroadcastActive} className="shrink-0">
                <input type="hidden" name="id" value={b.id} />
                <input type="hidden" name="active" value={b.active ? "false" : "true"} />
                <button type="submit" className="btn btn-ghost h-9 px-3 text-[13px]">{b.active ? "Deaktivieren" : "Aktivieren"}</button>
              </form>
            </div>
          );
        })}
        {items.length === 0 && <div className="card text-muted text-[14px]">Noch keine Ankündigungen.</div>}
      </div>
    </section>
  );
}
