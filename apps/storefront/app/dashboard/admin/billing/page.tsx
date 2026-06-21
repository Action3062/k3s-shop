import { prisma } from "@/lib/db";
import { StatWidget } from "@/components/dashboard/OverviewWidgets";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { euro, formatDate } from "@/lib/dashboard";

export const metadata = { title: "Admin — Abos & Umsatz" };

export default async function AdminBilling() {
  const subs = await prisma.subscription.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      plan: { select: { name: true, priceCents: true, interval: true } },
      app: { select: { name: true } },
      customer: { include: { user: { select: { email: true } } } },
      instance: { select: { status: true } },
    },
  });

  const active = subs.filter((s) => s.status === "ACTIVE");
  const pastDue = subs.filter((s) => s.status === "PAST_DUE");
  const canceled = subs.filter((s) => s.status === "CANCELED");
  const mrr = active.reduce((sum, s) => sum + (s.plan?.priceCents ?? 0), 0);

  return (
    <section>
      <h1 className="text-[30px] font-semibold tracking-[-0.02em]">Abos &amp; Umsatz</h1>
      <p className="text-muted text-[14px] mt-1 mb-5">Wiederkehrender Umsatz und Status aller Abonnements.</p>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 mb-7">
        <StatWidget label="MRR" value={euro(mrr)} tone="ok" />
        <StatWidget label="ARR (×12)" value={euro(mrr * 12)} tone="muted" />
        <StatWidget label="Aktive Abos" value={active.length} tone="ok" />
        <StatWidget label="Zahlung offen" value={pastDue.length} tone={pastDue.length ? "danger" : "muted"} />
      </div>

      {pastDue.length > 0 && (
        <>
          <div className="text-[14px] font-semibold text-[#FBBF24] mb-3.5">Zahlung offen <span className="text-faint font-normal">({pastDue.length})</span></div>
          <div className="grid gap-2.5 mb-7">
            {pastDue.map((s) => (
              <div key={s.id} className="card flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <b className="text-[14px]">{s.customer?.user?.email ?? "—"}</b>
                  <p className="mono text-[11px] text-faint mt-0.5 truncate">{s.app?.name} · {s.plan?.name} · {euro(s.plan?.priceCents ?? 0)}/{s.plan?.interval}</p>
                </div>
                <StatusBadge status={s.status} kind="subscription" />
              </div>
            ))}
          </div>
        </>
      )}

      <div className="text-[14px] font-semibold text-muted mb-3.5">Alle Abos <span className="text-faint font-normal">({subs.length})</span></div>
      <div className="grid gap-2.5">
        {subs.map((s) => (
          <div key={s.id} className="card flex items-center justify-between gap-3 flex-wrap">
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <b className="text-[14px]">{s.customer?.user?.email ?? "—"}</b>
                <StatusBadge status={s.status} kind="subscription" />
              </div>
              <p className="mono text-[11px] text-faint mt-0.5 truncate">{s.app?.name} · {s.plan?.name} · läuft bis {formatDate(s.currentPeriodEnd ? s.currentPeriodEnd.toISOString() : null)}</p>
            </div>
            <div className="text-[14px] font-semibold">{euro(s.plan?.priceCents ?? 0)}<span className="text-faint text-[12px] font-normal">/{s.plan?.interval ?? "month"}</span></div>
          </div>
        ))}
        {subs.length === 0 && <div className="card text-muted text-[14px]">Noch keine Abos.</div>}
      </div>

      <p className="text-faint text-[12px] mt-5">Kündigungen gesamt: {canceled.length}</p>
    </section>
  );
}
