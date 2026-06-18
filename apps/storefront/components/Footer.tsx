import Link from "next/link";

export function Footer() {
  const cols: Record<string, [string, string][]> = {
    Produkt: [["Apps", "/catalog"], ["Preise", "/pricing"], ["Anmelden", "/signup"]],
    Rechtliches: [["Impressum", "/impressum"], ["Datenschutz", "/datenschutz"], ["AGB", "/agb"]],
  };
  return (
    <footer className="border-t border-line mt-12">
      <div className="wrap py-14">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10">
          <div>
            <div className="flex items-center gap-2 font-semibold"><span className="chip h-7 w-7 text-[15px]">◧</span>MeinAppNest</div>
            <p className="mt-3 text-[13px] leading-[1.6] text-faint max-w-[240px]">Deine Lieblings-Apps, fertig gehostet. Self-hosted Power, ohne Self-hosting Stress.</p>
          </div>
          {Object.entries(cols).map(([h, links]) => (
            <div key={h}>
              <p className="mono text-[11px] uppercase tracking-wider text-faint mb-3">{h}</p>
              <ul className="space-y-2">{links.map(([l, href]) => <li key={l}><Link href={href} className="text-[14px] text-muted hover:text-accent-ink">{l}</Link></li>)}</ul>
            </div>
          ))}
          <div>
            <p className="mono text-[11px] uppercase tracking-wider text-faint mb-3">Status</p>
            <p className="inline-flex items-center gap-2 mono text-[12px] text-muted"><span className="dot bg-ok pulse-soft" /> Alle Systeme betriebsbereit</p>
          </div>
        </div>
        <div className="mt-12 pt-6 border-t border-line flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="mono text-[12px] text-faint">© 2026 MeinAppNest · Gehostet in Deutschland</p>
          <p className="mono text-[12px] text-faint">Self-hosted Power. Ohne Self-hosting Stress.</p>
        </div>
      </div>
    </footer>
  );
}
