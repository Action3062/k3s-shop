import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getServices } from "@/lib/controlPlane";
import { openBillingPortal } from "@/app/actions";
import { StatusBadge } from "@/components/dashboard/StatusBadge";

export const metadata = { title: "Abrechnung — MeinAppNest" };

export default async function Billing({ searchParams }: { searchParams: { portal?: string } }) {
  const session = await auth();
  if (!session) redirect("/login");
  const customerId = (session as { customerId?: string }).customerId ?? "";
  const services = customerId ? await getServices(customerId) : [];
  const active = services.filter((s) => s.status !== "DEPROVISIONED");

  return (
    <section>
      <span className="eyebrow">Abrechnung</span>
      <h1 className="text-[30px] font-semibold tracking-[-0.02em] mt-1.5">Abrechnung & Rechnungen</h1>
      <p className="text-muted text-[14px] mt-1 mb-6">Deine Abos, Zahlungen und Rechnungen.</p>

      {searchParams.portal === "unavailable" && <div className="mb-4 text-sm rounded-xl px-4 py-3 border border-[#FBBF24]/40 text-[#FBBF24]">Das Zahlungsportal ist gerade nicht erreichbar. Bitte versuch es später erneut oder kontaktiere den Support.</div>}

      <div className="card flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
        <div>
          <h2 className="text-[15px] font-semibold">Zahlungsdaten & Rechnungen</h2>
          <p className="text-muted text-[13.5px] mt-1">Zahlungsmethode verwalten und Rechnungen (PDF) herunterladen — sicher über unser Zahlungsportal.</p>
        </div>
        <form action={openBillingPortal}><button className="btn btn-primary h-10 px-4 text-[14px] whitespace-nowrap" type="submit">Zahlungsportal öffnen ↗</button></form>
      </div>

      <div className="flex items-center justify-between mt-8 mb-3.5"><h2 className="text-[18px] font-semibold">Aktive Abos</h2></div>
      {active.length === 0 ? (
        <div className="card text-muted text-[14px]">Noch keine aktiven Abos.</div>
      ) : (
        <div className="card p-0 overflow-x-auto">
          <table className="w-full text-[13.5px]" style={{ minWidth: 520 }}>
            <thead><tr className="text-left text-faint text-[12px]"><th className="p-3.5 font-semibold">Software</th><th className="p-3.5 font-semibold">Subdomain</th><th className="p-3.5 font-semibold">Status</th></tr></thead>
            <tbody>
              {active.map((s) => (
                <tr key={s.id} className="border-t border-line">
                  <td className="p-3.5"><b>{s.name}</b> <span className="mono text-faint text-[11px]">{s.appSlug}</span></td>
                  <td className="p-3.5 mono text-[12px] text-muted">{s.subdomain}</td>
                  <td className="p-3.5"><StatusBadge status={s.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <p className="text-faint text-[12px] mt-3">Plan-, Preis- und Verlängerungsdetails sowie alle Rechnungen findest du im Zahlungsportal.</p>
    </section>
  );
}
