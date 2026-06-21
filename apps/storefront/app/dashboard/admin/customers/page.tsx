import { prisma } from "@/lib/db";
import { setUserRole } from "@/app/admin-actions";
import { StatusBanner } from "@/components/dashboard/OverviewWidgets";
import { euro, formatDate } from "@/lib/dashboard";

export const metadata = { title: "Admin — Kunden" };

export default async function AdminCustomers({ searchParams }: { searchParams: { done?: string; error?: string } }) {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    include: { customer: { include: { subscriptions: { include: { plan: { select: { priceCents: true } }, instance: { select: { status: true } } } } } } },
  });

  return (
    <section>
      <h1 className="text-[30px] font-semibold tracking-[-0.02em]">Kunden</h1>
      <p className="text-muted text-[14px] mt-1 mb-5">Alle Konten mit Abos, laufenden Servern und Rolle.</p>

      {searchParams.done === "role" && <StatusBanner tone="ok">Rolle aktualisiert.</StatusBanner>}
      {searchParams.error === "self" && <StatusBanner tone="warn">Du kannst dir selbst nicht die Admin-Rolle entziehen.</StatusBanner>}
      {searchParams.error === "bad" && <StatusBanner tone="danger">Ungültige Eingabe.</StatusBanner>}

      <div className="text-[14px] font-semibold text-muted mb-3.5">Konten <span className="text-faint font-normal">({users.length})</span></div>

      <div className="grid gap-3">
        {users.map((u) => {
          const subs = u.customer?.subscriptions ?? [];
          const active = subs.filter((s) => s.status === "ACTIVE");
          const running = subs.filter((s) => s.instance?.status === "RUNNING").length;
          const mrr = active.reduce((sum, s) => sum + (s.plan?.priceCents ?? 0), 0);
          return (
            <div key={u.id} className="card flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <b className="text-[15px]">{u.email}</b>
                  <span className={`mono text-[10px] px-2 py-0.5 rounded-md border ${u.role === "ADMIN" ? "border-accent/40 text-accent-ink bg-accent/10" : "border-line text-muted bg-surface"}`}>{u.role}</span>
                </div>
                <p className="mono text-[11px] text-faint mt-1 truncate">@{u.username} · seit {formatDate(u.createdAt.toISOString())} · {subs.length} Abo(s) · {running} aktiv · {euro(mrr)}/Mon.</p>
              </div>
              <form action={setUserRole} className="flex gap-2 items-center shrink-0">
                <input type="hidden" name="userId" value={u.id} />
                <select name="role" defaultValue={u.role} className="h-9 px-2 rounded-lg bg-surface border border-line2 text-ink text-[13px] outline-none focus:border-accent">
                  <option value="USER">USER</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
                <button type="submit" className="btn btn-ghost h-9 px-3 text-[13px]">Speichern</button>
              </form>
            </div>
          );
        })}
      </div>
    </section>
  );
}
