import { adminClusterSummary } from "@/lib/controlPlane";
import { StatWidget, StatusBanner } from "@/components/dashboard/OverviewWidgets";

export const metadata = { title: "Admin — Cluster" };
export const dynamic = "force-dynamic";

export default async function AdminCluster() {
  const c = await adminClusterSummary();

  return (
    <section>
      <h1 className="text-[30px] font-semibold tracking-[-0.02em]">Cluster</h1>
      <p className="text-muted text-[14px] mt-1 mb-5">Gesundheit des k3s-Clusters in Echtzeit.</p>

      {c.reachable
        ? <StatusBanner tone="ok">Cluster erreichbar — Kubernetes-API antwortet.</StatusBanner>
        : <StatusBanner tone="warn">Cluster nicht erreichbar. Läuft die Control-Plane im Cluster mit Service-Account-Zugriff?</StatusBanner>}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 mt-5">
        <StatWidget label="Nodes bereit" value={`${c.nodes.ready}/${c.nodes.total}`} tone={c.nodes.ready === c.nodes.total && c.nodes.total > 0 ? "ok" : "warn"} />
        <StatWidget label="Pods laufend" value={`${c.pods.running}/${c.pods.total}`} tone="ok" />
        <StatWidget label="Pods ausstehend" value={c.pods.pending} tone={c.pods.pending ? "info" : "muted"} />
        <StatWidget label="Pods fehlerhaft" value={c.pods.failed} tone={c.pods.failed ? "danger" : "muted"} />
        <StatWidget label="Namespaces" value={c.namespaces} tone="muted" />
      </div>
    </section>
  );
}
