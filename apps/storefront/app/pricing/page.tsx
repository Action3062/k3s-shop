import { getCatalog } from "@/lib/controlPlane";

export const metadata = { title: "Preise — DynStore" };

export default async function Pricing() {
  const catalog = await getCatalog();
  return (
    <section className="wrap py-16">
      <span className="eyebrow">Preise</span>
      <h1 className="mt-2.5 mb-2 font-semibold tracking-tight text-[clamp(28px,4vw,44px)]">Pro App. Monatlich kündbar.</h1>
      <p className="text-muted mb-10">Du zahlst nur für die Apps, die du nutzt. Keine versteckten Kosten.</p>
      <div className="grid md:grid-cols-3 gap-[18px]">
        {catalog.map((a, i) => {
          const plan = a.plans[0];
          return (
            <div key={a.slug} className={`card rounded-2xl ${i === 0 ? "border-accent" : ""}`} style={i === 0 ? { borderWidth: 1.5, boxShadow: "0 0 0 4px rgba(34,211,238,.12)" } : undefined}>
              <h3 className="font-semibold text-lg">{a.name}</h3>
              <div className="text-[34px] font-semibold tracking-tight mt-2.5">{plan ? (plan.priceCents / 100).toFixed(0) : "—"}&nbsp;€</div>
              <span className="text-faint">pro Monat</span>
              <ul className="mt-4 space-y-2 text-sm text-muted">
                <li>✓ {plan?.storageGi} GB Speicher</li>
                <li>✓ Eigene Subdomain + HTTPS</li>
                <li>✓ Tägliche Backups</li>
              </ul>
            </div>
          );
        })}
      </div>
    </section>
  );
}
