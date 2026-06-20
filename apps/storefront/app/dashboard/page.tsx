import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getServices } from "@/lib/controlPlane";
import { computeStats, attentionItems } from "@/lib/dashboard";
import { ServiceCard } from "@/components/dashboard/ServiceCard";
import { StatWidget, StatusBanner, AttentionItem, QuickAction } from "@/components/dashboard/OverviewWidgets";

export default async function Overview() {
  const session = await auth();
  if (!session) redirect("/login");
  const customerId = (session as { customerId?: string }).customerId ?? "";
  const services = customerId ? await getServices(customerId) : [];
  const stats = computeStats(services);
  const attention = attentionItems(services);
  const firstName = (session.user?.name ?? "").split(" ")[0] || "willkommen";
  const today = new Date().toLocaleDateString("de-DE", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  const danger = attention.find((a) => a.tone === "danger");
  const warn = attention.find((a) => a.tone === "warn");

  return (
    <section>
      <span className="eyebrow">Übersicht</span>
      <h1 className="text-[30px] font-semibold tracking-[-0.02em] mt-1.5">Hallo {firstName} 👋</h1>
      <p className="text-muted text-[14px] mt-1 mb-6">{today}</p>

      {danger
        ? <StatusBanner tone="danger" action={{ href: danger.href, label: "Ansehen" }}><b>{danger.title}.</b> {danger.desc}</StatusBanner>
        : warn
        ? <StatusBanner tone="warn" action={{ href: warn.href, label: "Prüfen" }}><b>{warn.title}.</b> {warn.desc}</StatusBanner>
        : stats.total > 0
        ? <StatusBanner tone="ok"><b>Alles läuft.</b> Deine Dienste sind erreichbar.</StatusBanner>
        : null}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <StatWidget label="Aktive Software" value={stats.active} tone="ok" />
        <StatWidget label="Offene Hinweise" value={stats.attention} tone={stats.attention > 0 ? "warn" : "muted"} />
        <StatWidget label="In Einrichtung" value={stats.setting} tone={stats.setting > 0 ? "info" : "muted"} />
        <StatWidget label="Software gesamt" value={stats.total} tone="muted" />
      </div>

      {attention.length > 0 && (
        <>
          <div className="flex items-center justify-between mt-8 mb-3.5"><h2 className="text-[18px] font-semibold">Erfordert deine Aufmerksamkeit</h2></div>
          <div className="card">
            {attention.map((a, i) => <AttentionItem key={i} icon={a.icon} title={a.title} desc={a.desc} action={{ href: a.href, label: "Ansehen" }} />)}
          </div>
        </>
      )}

      <div className="flex items-center justify-between mt-8 mb-3.5">
        <h2 className="text-[18px] font-semibold">Deine Software</h2>
        {services.length > 0 && <Link href="/dashboard/apps" className="text-accent-ink text-[13.5px] hover:underline">Alle anzeigen →</Link>}
      </div>
      {services.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-muted mb-5">Noch keine Software. Wähle eine App, um loszulegen.</p>
          <Link href="/catalog" className="btn btn-primary">Zum Katalog →</Link>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {services.slice(0, 3).map((s) => <ServiceCard key={s.id} s={s} />)}
        </div>
      )}

      <div className="flex items-center justify-between mt-8 mb-3.5"><h2 className="text-[18px] font-semibold">Schnellaktionen</h2></div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <QuickAction icon="🧩" label="Software verwalten" href="/dashboard/apps" />
        <QuickAction icon="💬" label="Support kontaktieren" href="/dashboard/support" />
        <QuickAction icon="🧾" label="Rechnung ansehen" href="/dashboard/billing" />
        <QuickAction icon="＋" label="Neue Software" href="/catalog" />
      </div>
    </section>
  );
}
