import Link from "next/link";

export const metadata = { title: "Preise — MeinAppNest" };

const PLANS = [
  { name: "Single App", price: 5, sub: "Eine App, sofort startklar.", res: "1 vCPU · 512 MB · 5 GB", feats: ["Eigene Subdomain", "SSL inklusive", "Tägliche Backups", "Auto-Updates"], featured: false },
  { name: "Plus", price: 12, sub: "Mehr Leistung & Speicher.", res: "2 vCPU · 1 GB · 25 GB", feats: ["Alles aus Single App", "Eigene Domain", "Erweiterte Backups", "Prioritäts-Support"], featured: true },
  { name: "Stack", price: 24, sub: "Mehrere Apps als Paket.", res: "Geteilte Stack-Ressourcen", feats: ["3+ Apps kombiniert", "Eigene Domain", "Monitoring-Dashboard", "Bestpreis pro App"], featured: false },
];

export default function Pricing() {
  return (
    <section className="wrap py-20">
      <span className="eyebrow">Preise</span>
      <h1 className="mt-3 text-[clamp(30px,4vw,44px)] leading-[1.1] tracking-[-0.02em] font-semibold">Transparent. Pro App oder als Stack.</h1>
      <p className="mt-4 mb-10 text-[17px] leading-[1.7] text-muted max-w-[680px]">Klare Ressourcen, faire Preise, 14 Tage testen. Du zahlst nur für die Apps, die du nutzt — keine versteckten Kosten.</p>
      <div className="grid md:grid-cols-3 gap-5">
        {PLANS.map((p) => (
          <div key={p.name} className={`card card-hover ${p.featured ? "border-accent/50" : ""}`} style={p.featured ? { boxShadow: "0 0 0 1px rgba(34,211,238,.25), 0 12px 40px rgba(34,211,238,.12)" } : undefined}>
            {p.featured && <span className="mono text-[11px] px-2 py-0.5 rounded-full" style={{ background: "rgba(34,211,238,.12)", color: "#67E8F9" }}>Beliebt</span>}
            <h3 className="mt-2 text-[17px] font-semibold">{p.name}</h3>
            <p className="mt-1 text-[14px] text-muted">{p.sub}</p>
            <p className="mt-5 mono"><span className="text-[40px]">{p.price} €</span><span className="text-faint text-[14px]">/Monat</span></p>
            <p className="mt-1 mono text-[12px] text-faint">▦ {p.res}</p>
            <ul className="mt-5 space-y-2.5">{p.feats.map((f) => <li key={f} className="flex items-center gap-2 text-[14px] text-muted"><span className="text-ok">✓</span>{f}</li>)}</ul>
            <Link href="/signup" className={`btn w-full mt-6 ${p.featured ? "btn-primary" : "btn-ghost"}`}>Auswählen</Link>
          </div>
        ))}
      </div>
      <p className="mt-8 mono text-[12px] text-faint">* Platzhalterpreise – finale Preise je nach Ressourcen.</p>
    </section>
  );
}
