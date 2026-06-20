import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getServices } from "@/lib/controlPlane";
import { ServiceCard } from "@/components/dashboard/ServiceCard";
import type { ServiceInstance } from "@/lib/types";

export const metadata = { title: "Meine Software — MeinAppNest" };

const GROUPS: { title: string; match: (s: ServiceInstance) => boolean }[] = [
  { title: "Braucht Aufmerksamkeit", match: (s) => s.status === "FAILED" || s.status === "SUSPENDED" },
  { title: "In Einrichtung", match: (s) => s.status === "PROVISIONING" || s.status === "PENDING" },
  { title: "Aktiv", match: (s) => s.status === "RUNNING" },
  { title: "Beendet", match: (s) => s.status === "DEPROVISIONING" || s.status === "DEPROVISIONED" },
];

export default async function AppsPage() {
  const session = await auth();
  if (!session) redirect("/login");
  const customerId = (session as { customerId?: string }).customerId ?? "";
  const services = customerId ? await getServices(customerId) : [];

  return (
    <section>
      <span className="eyebrow">Meine Software</span>
      <h1 className="text-[30px] font-semibold tracking-[-0.02em] mt-1.5">Meine Software</h1>
      <p className="text-muted text-[14px] mt-1 mb-6">Alle deine gebuchten Apps an einem Ort.</p>

      {services.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-muted mb-5">Noch keine Software gebucht.</p>
          <Link href="/catalog" className="btn btn-primary">Zum Katalog →</Link>
        </div>
      ) : (
        GROUPS.map((g) => {
          const items = services.filter(g.match);
          if (items.length === 0) return null;
          return (
            <div key={g.title} className="mb-8">
              <h2 className="text-[15px] font-semibold text-muted mb-3.5">{g.title} <span className="text-faint font-normal">({items.length})</span></h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {items.map((s) => <ServiceCard key={s.id} s={s} />)}
              </div>
            </div>
          );
        })
      )}
    </section>
  );
}
