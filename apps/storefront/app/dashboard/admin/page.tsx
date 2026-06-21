import Link from "next/link";
import { prisma } from "@/lib/db";
import { StatWidget } from "@/components/dashboard/OverviewWidgets";
import { euro } from "@/lib/dashboard";

export const metadata = { title: "Admin — Übersicht" };

const QUICK = [
  { href: "/dashboard/admin/servers",   icon: "🖥️", label: "Server verwalten", desc: "Start, Stopp, Backup, Löschen" },
  { href: "/dashboard/admin/customers", icon: "👥", label: "Kunden",           desc: "Rollen & Konten" },
  { href: "/dashboard/admin/billing",   icon: "💶", label: "Abos & Umsatz",    desc: "MRR, Zahlungen, Kündigungen" },
  { href: "/dashboard/admin/jobs",      icon: "⚙️", label: "Jobs",             desc: "Provisioning-Warteschlange" },
  { href: "/dashboard/admin/cluster",   icon: "🩺", label: "Cluster",          desc: "Nodes & Pods" },
  { href: "/dashboard/admin/backups",   icon: "💾", label: "Backups",          desc: "Snapshots & Status" },
];

export default async function AdminOverview() {
  const [userCount, instances, activeSubs, failedJobs, backupCount] = await Promise.all([
    prisma.user.count(),
    prisma.serviceInstance.findMany({ select: { status: true } }),
    prisma.subscription.findMany({ where: { status: "ACTIVE" }, include: { plan: { select: { priceCents: true } } } }),
    prisma.provisioningJob.count({ where: { status: "FAILED" } }),
    prisma.backup.count(),
  ]);

  const running = instances.filter((i) => i.status === "RUNNING").length;
  const provisioning = instances.filter((i) => i.status === "PROVISIONING" || i.status === "PENDING").length;
  const failed = instances.filter((i) => i.status === "FAILED").length;
  const mrr = activeSubs.reduce((s, x) => s + (x.plan?.priceCents ?? 0), 0);

  return (
    <section>
      <h1 className="text-[30px] font-semibold tracking-[-0.02em]">Übersicht</h1>
      <p className="text-muted text-[14px] mt-1 mb-5">Betriebskennzahlen der gesamten Plattform.</p>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <StatWidget label="Kunden" value={userCount} tone="muted" />
        <StatWidget label="Aktive Server" value={running} tone="ok" />
        <StatWidget label="In Einrichtung" value={provisioning} tone={provisioning ? "info" : "muted"} />
        <StatWidget label="Störungen" value={failed} tone={failed ? "danger" : "muted"} />
        <StatWidget label="MRR" value={euro(mrr)} tone="ok" />
        <StatWidget label="Aktive Abos" value={activeSubs.length} tone="muted" />
        <StatWidget label="Fehlgeschl. Jobs" value={failedJobs} tone={failedJobs ? "danger" : "muted"} />
        <StatWidget label="Backups gesamt" value={backupCount} tone="muted" />
      </div>

      <h2 className="text-[18px] font-semibold mt-8 mb-3.5">Schnellzugriff</h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {QUICK.map((q) => (
          <Link key={q.href} href={q.href} className="card card-hover flex items-center gap-3">
            <span className="grid place-items-center h-10 w-10 rounded-[11px] bg-surface text-[18px]" aria-hidden>{q.icon}</span>
            <div>
              <div className="text-[14.5px] font-semibold">{q.label}</div>
              <div className="text-[12.5px] text-muted">{q.desc}</div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
