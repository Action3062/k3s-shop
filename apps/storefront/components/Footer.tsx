import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-line py-12 text-faint text-sm">
      <div className="wrap">
        <div className="flex flex-wrap justify-between gap-8 mb-7">
          <div className="flex items-center gap-2.5 font-medium text-ink">
            <span className="grid place-items-center w-7 h-7 rounded-lg text-bg font-bold text-[15px]" style={{ background: "linear-gradient(135deg,#22d3ee,#0ea5e9)" }}>D</span>
            DynStore
          </div>
          <FCol title="Produkt" links={[["Apps", "/catalog"], ["Preise", "/pricing"], ["So funktioniert's", "/#how"]]} />
          <FCol title="Konto" links={[["Login", "/login"], ["Registrieren", "/signup"], ["Dashboard", "/dashboard"]]} />
          <FCol title="Rechtliches" links={[["Impressum", "/impressum"], ["AGB", "/agb"], ["Datenschutz", "/datenschutz"]]} />
        </div>
        <div>© 2026 DynStore · Gehostet in Deutschland</div>
      </div>
    </footer>
  );
}

function FCol({ title, links }: { title: string; links: [string, string][] }) {
  return (
    <div>
      <b className="block text-[13px] text-ink mb-2 font-medium">{title}</b>
      {links.map(([label, href]) => (
        <Link key={href} href={href} className="block text-muted hover:text-ink py-1">{label}</Link>
      ))}
    </div>
  );
}
