import Link from "next/link";
import { getCatalog } from "@/lib/controlPlane";
import { AppCard } from "@/components/AppCard";
import type { CatalogApp } from "@/lib/types";

const AVAILABLE = new Set(["vaultwarden", "openclaw"]);

const UPCOMING: CatalogApp[] = [
  { slug: "jellyfin", name: "Jellyfin", category: "Media", description: "Streame Filme, Serien und Musik von überall – werbefrei.", plans: [{ id: "x", name: "Standard", priceCents: 700, interval: "month", storageGi: 10 }] },
  { slug: "nextcloud", name: "Nextcloud", category: "Cloud & Dateien", description: "Deine eigene Cloud für Dateien, Kalender und Kontakte.", plans: [{ id: "x", name: "Standard", priceCents: 900, interval: "month", storageGi: 50 }] },
  { slug: "n8n", name: "n8n", category: "Automatisierung", description: "Verbinde deine Tools und automatisiere Workflows – visuell.", plans: [{ id: "x", name: "Standard", priceCents: 800, interval: "month", storageGi: 5 }] },
  { slug: "uptime-kuma", name: "Uptime Kuma", category: "Monitoring", description: "Behalte deine Dienste im Blick, Alerts bei Ausfällen.", plans: [{ id: "x", name: "Standard", priceCents: 400, interval: "month", storageGi: 2 }] },
  { slug: "homepage", name: "Homepage", category: "Dashboards", description: "Ein schönes Dashboard für all deine Dienste.", plans: [{ id: "x", name: "Standard", priceCents: 300, interval: "month", storageGi: 1 }] },
];

const ORBIT = ["Plex", "n8n", "Vault", "Jelly", "Cloud", "Kuma"];
const METRICS: [string, string][] = [["30+", "Apps"], ["~3 Min", "bis live"], ["99,9 %*", "Verfügbarkeit"], ["EU", "Hosting"]];
const PROBLEMS = ["Server einrichten", "Docker-Compose pflegen", "Ports, SSL & Reverse Proxy", "Updates hinterherjagen", "Backups (hoffentlich)", "Ausfälle & Sicherheitslücken"];
const STEPS: [string, string][] = [["App oder Stack wählen", "◧"], ["Account erstellen", "✦"], ["Wir provisionieren", "▦"], ["Zugriff im Dashboard", "◑"], ["Einfach nutzen", "→"]];
const FEATURES: [string, string, string][] = [
  ["▦", "Managed Hosting", "Wir kümmern uns um Server, Skalierung und Betrieb."],
  ["↻", "Automatische Updates", "Neue Versionen werden sicher eingespielt – ohne dein Zutun."],
  ["▢", "Tägliche Backups", "Deine Daten werden gesichert. Wiederherstellung auf Knopfdruck."],
  ["⚿", "SSL & Subdomain", "Jede Instanz läuft sofort verschlüsselt – eigene Domain optional."],
  ["◈", "Isolierte Instanzen", "Jede App läuft getrennt in ihrer eigenen Umgebung."],
  ["◴", "Monitoring & Support", "Wir behalten deine Dienste im Blick und sind für dich da."],
];
const BUNDLES: { name: string; apps: string[]; who: string; benefit: string; price: number; featured: boolean }[] = [
  { name: "Media Starter Stack", apps: ["Jellyfin", "Radarr", "Sonarr", "Prowlarr"], who: "Streaming-Einsteiger", benefit: "Dein komplettes Media-Center – fertig verkabelt.", price: 19, featured: false },
  { name: "Productivity Stack", apps: ["Nextcloud", "Paperless-ngx", "Vaultwarden"], who: "Selbstständige & Teams", benefit: "Dateien, Dokumente und Passwörter an einem sicheren Ort.", price: 24, featured: true },
  { name: "Automation Stack", apps: ["n8n", "Flowise", "Open WebUI"], who: "Power-User & Creator", benefit: "Automatisierung und KI-Workflows, sofort einsatzbereit.", price: 22, featured: false },
];
const COMPARE: [string, string, string][] = [
  ["Einrichtungszeit", "Stunden–Tage", "~3 Minuten"], ["Docker / Compose", "selbst pflegen", "entfällt"],
  ["Updates", "manuell", "automatisch"], ["Backups", "selbst bauen", "inklusive"],
  ["SSL / Reverse Proxy", "selbst", "inklusive"], ["Wartungsaufwand", "dauerhaft", "keiner"],
];
const PLANS: { name: string; price: number; sub: string; res: string; feats: string[]; featured: boolean }[] = [
  { name: "Single App", price: 5, sub: "Eine App, sofort startklar.", res: "1 vCPU · 512 MB · 5 GB", feats: ["Eigene Subdomain", "SSL inklusive", "Tägliche Backups", "Auto-Updates"], featured: false },
  { name: "Plus", price: 12, sub: "Mehr Leistung & Speicher.", res: "2 vCPU · 1 GB · 25 GB", feats: ["Alles aus Single App", "Eigene Domain", "Erweiterte Backups", "Prioritäts-Support"], featured: true },
  { name: "Stack", price: 24, sub: "Mehrere Apps als Paket.", res: "Geteilte Stack-Ressourcen", feats: ["3+ Apps kombiniert", "Eigene Domain", "Monitoring-Dashboard", "Bestpreis pro App"], featured: false },
];
const SECURITY: [string, string][] = [
  ["Isolierte Instanzen", "Eigener Namespace + Netzwerk-Isolation pro App."],
  ["Verschlüsselt", "TLS für jede Subdomain, automatisch ausgestellt."],
  ["Backups & Monitoring", "Automatische Sicherungen, laufende Überwachung."],
  ["EU-Hosting", "Betrieb in Deutschland, klare Verantwortlichkeiten."],
];
const FAQS: [string, string][] = [
  ["Was ist MeinAppNest?", "Eine Plattform, auf der du self-hosted Apps fertig gehostet buchst. Wir stellen automatisch eine private, gesicherte Instanz bereit – du nutzt sie sofort."],
  ["Brauche ich technische Kenntnisse?", "Nein. Wenn du eine App im App Store kaufen kannst, kannst du MeinAppNest nutzen. Alles läuft über ein einfaches Dashboard."],
  ["Kann ich meine eigene Domain nutzen?", "Ja. Standardmäßig läuft jede Instanz unter deiner Subdomain. Eine eigene Domain kannst du optional verbinden."],
  ["Wie schnell ist eine App bereit?", "In der Regel wenige Minuten. Nach der Buchung provisionieren wir deine Instanz automatisch."],
  ["Was passiert bei Updates?", "Updates spielen wir sicher und automatisch ein, inklusive vorheriger Backups. Du musst nichts tun."],
  ["Kann ich später kündigen?", "Jederzeit. Pläne anpassen, Apps hinzufügen oder monatlich kündigen – ohne lange Bindung."],
];

export default async function Home() {
  const catalog = await getCatalog();
  const available = catalog.filter((a) => AVAILABLE.has(a.slug));
  const grid = [...available, ...UPCOMING].slice(0, 8);

  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 h-[520px] w-[820px] rounded-full glow-hero" />
        <div className="wrap relative grid lg:grid-cols-2 gap-14 items-center pt-20 pb-24">
          <div>
            <p className="eyebrow">Managed App Hosting</p>
            <h1 className="mt-4 text-[44px] sm:text-[60px] leading-[1.04] tracking-[-0.03em] font-semibold">
              Self-hosted Power.<br /><span className="bg-gradient-to-r from-accent-ink to-accent bg-clip-text text-transparent">Ohne Self-hosting Stress.</span>
            </h1>
            <p className="mt-6 text-[18px] leading-[1.7] text-muted max-w-[520px]">
              Wähle aus über 30 self-hosted Apps – wir hosten, sichern und aktualisieren sie. In Minuten läuft deine private Instanz unter deiner eigenen Subdomain. Ohne Docker, ohne Server, ohne Wartung.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/catalog" className="btn btn-primary">Apps ansehen →</Link>
              <Link href="/#how" className="btn btn-ghost">So funktioniert&apos;s</Link>
            </div>
            <p className="mt-6 mono text-[12px] text-faint">✓ Keine Kreditkarte für den Start · ✓ EU-gehostet · ✓ Jederzeit kündbar</p>
          </div>
          <div className="relative">
            <div className="relative aspect-square w-full max-w-[420px] mx-auto">
              <div className="absolute inset-0 rounded-full glow-hero" />
              <div className="absolute inset-0 rounded-full border border-line" />
              <div className="absolute rounded-full border border-line" style={{ inset: "16%" }} />
              <div className="absolute rounded-full border border-line" style={{ inset: "32%" }} />
              <div className="spin-slow absolute" style={{ inset: "8%" }}>
                {ORBIT.map((n, i) => {
                  const a = (i / ORBIT.length) * Math.PI * 2;
                  return (
                    <div key={n} className="absolute -translate-x-1/2 -translate-y-1/2 spin-rev" style={{ left: `${50 + 44 * Math.cos(a)}%`, top: `${50 + 44 * Math.sin(a)}%` }}>
                      <div className="grid place-items-center h-11 w-11 rounded-xl border border-line2 bg-bg2 text-[11px] mono text-muted">{n}</div>
                    </div>
                  );
                })}
              </div>
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 grid place-items-center h-20 w-20 rounded-2xl text-[#04181C]" style={{ background: "linear-gradient(135deg,#22D3EE,#06B6D4)", boxShadow: "0 0 50px rgba(34,211,238,.4)" }}>◧</div>
            </div>
            <div className="hidden sm:block absolute -bottom-6 -right-2 w-[300px] rounded-2xl border border-line2 p-4" style={{ background: "rgba(12,17,22,.85)", backdropFilter: "blur(12px)", boxShadow: "0 24px 60px rgba(0,0,0,.5)" }}>
              <div className="flex items-center justify-between mb-3"><p className="text-[13px] font-medium">Meine Dienste</p><span className="mono text-[11px] text-faint">3 aktiv</span></div>
              <div className="space-y-2">
                {[["Vaultwarden", "thomas.vaultwarden", "#34D399"], ["Jellyfin", "thomas.jellyfin", "#34D399"], ["n8n", "thomas.n8n", "#22D3EE"]].map((r) => (
                  <div key={r[0]} className="flex items-center justify-between rounded-xl border border-line bg-surface px-3 py-2.5">
                    <div className="flex items-center gap-3 min-w-0"><span className="h-7 w-7 rounded-lg grid place-items-center text-[11px] mono" style={{ background: "rgba(34,211,238,.12)", color: "#67E8F9" }}>{r[0].charAt(0)}</span>
                      <div className="min-w-0"><p className="text-[13px] leading-tight">{r[0]}</p><p className="mono text-[11px] text-faint truncate">{r[1]}.meinappnest.org</p></div></div>
                    <span className="dot pulse-soft" style={{ background: r[2], boxShadow: `0 0 8px ${r[2]}` }} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* METRICS */}
      <section className="border-y border-line" style={{ background: "rgba(12,17,22,.4)" }}>
        <div className="wrap py-8 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {METRICS.map(([v, l]) => <div key={l}><p className="mono text-[24px]">{v}</p><p className="text-[13px] text-faint">{l}</p></div>)}
        </div>
      </section>

      {/* PROBLEM */}
      <section className="section"><div className="wrap">
        <span className="eyebrow">Das Problem</span>
        <h2 className="mt-3 text-[32px] sm:text-[40px] leading-[1.1] tracking-[-0.02em] font-semibold max-w-[680px]">Self-hosting ist mächtig – und ein zweiter Job.</h2>
        <div className="mt-9 grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {PROBLEMS.map((p) => <div key={p} className="flex items-center gap-3 rounded-xl border border-line bg-bg2 px-4 py-3.5 text-muted"><span className="text-faint">✕</span><span className="mono text-[13px]">{p}</span></div>)}
        </div>
      </div></section>

      {/* APP GRID */}
      <section id="apps" className="section"><div className="wrap">
        <div className="flex flex-wrap justify-between items-end gap-5 mb-9">
          <div><span className="eyebrow">App Store</span><h2 className="mt-3 text-[32px] sm:text-[40px] leading-[1.1] tracking-[-0.02em] font-semibold">Der App Store für gehostete Tools.</h2></div>
          <Link href="/catalog" className="text-muted hover:text-ink text-sm">Alle Apps →</Link>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {grid.map((a) => <AppCard key={a.slug} app={a} available={AVAILABLE.has(a.slug)} />)}
        </div>
      </div></section>

      {/* BUNDLES */}
      <section id="stacks" className="section"><div className="wrap">
        <span className="eyebrow">Stacks</span>
        <h2 className="mt-3 mb-9 text-[32px] sm:text-[40px] leading-[1.1] tracking-[-0.02em] font-semibold">Fertige Stacks für deinen Use-Case.</h2>
        <div className="grid md:grid-cols-3 gap-5">
          {BUNDLES.map((b) => (
            <div key={b.name} className={`card card-hover relative ${b.featured ? "border-accent/50" : ""}`} style={b.featured ? { boxShadow: "0 0 0 1px rgba(34,211,238,.25), 0 12px 40px rgba(34,211,238,.12)" } : undefined}>
              {b.featured && <span className="absolute -top-2.5 left-6 mono text-[11px] px-2 py-0.5 rounded-full text-[#04181C]" style={{ background: "linear-gradient(135deg,#22D3EE,#06B6D4)" }}>Beliebt</span>}
              <div className="flex gap-1.5">{[0, 1, 2].map((l) => <span key={l} className="h-8 w-8 rounded-lg border border-line2 bg-surface" style={{ transform: `translateX(${l * -6}px)` }} />)}</div>
              <h3 className="mt-5 text-[18px] font-semibold">{b.name}</h3>
              <p className="mt-1 mono text-[11px] text-faint uppercase tracking-wider">für {b.who}</p>
              <p className="mt-3 text-[14px] leading-[1.6] text-muted">{b.benefit}</p>
              <div className="mt-4 flex flex-wrap gap-1.5">{b.apps.map((x) => <span key={x} className="tag">{x}</span>)}</div>
              <div className="mt-6 flex items-center justify-between"><span className="mono text-[15px]">ab <span className="text-accent-ink">{b.price} €</span>/Mon.</span><Link href="/signup" className={`btn h-10 px-4 text-[14px] ${b.featured ? "btn-primary" : "btn-ghost"}`}>Stack buchen</Link></div>
            </div>
          ))}
        </div>
      </div></section>

      {/* FEATURES */}
      <section className="section"><div className="wrap">
        <span className="eyebrow">Features</span>
        <h2 className="mt-3 mb-9 text-[32px] sm:text-[40px] leading-[1.1] tracking-[-0.02em] font-semibold">Alles inklusive. Wirklich alles.</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map(([ic, t, d]) => <div key={t} className="card card-hover"><span className="chip h-10 w-10 text-[18px]">{ic}</span><h3 className="mt-4 text-[16px] font-semibold">{t}</h3><p className="mt-1.5 text-[14px] leading-[1.6] text-muted">{d}</p></div>)}
        </div>
      </div></section>

      {/* HOW */}
      <section id="how" className="section"><div className="wrap">
        <span className="eyebrow">So funktioniert&apos;s</span>
        <h2 className="mt-3 mb-9 text-[32px] sm:text-[40px] leading-[1.1] tracking-[-0.02em] font-semibold">In Minuten von Auswahl zu laufender App.</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {STEPS.map(([t, ic], i) => <div key={t} className="card"><div className="flex items-center justify-between"><span className="chip h-9 w-9 text-[16px]">{ic}</span><span className="mono text-[28px] leading-none text-line2">{i + 1}</span></div><p className="mt-4 text-[15px] font-medium">{t}</p></div>)}
        </div>
      </div></section>

      {/* COMPARISON */}
      <section className="section"><div className="wrap">
        <span className="eyebrow">Vergleich</span>
        <h2 className="mt-3 mb-9 text-[32px] sm:text-[40px] leading-[1.1] tracking-[-0.02em] font-semibold">Selbst hosten vs. MeinAppNest.</h2>
        <div className="overflow-x-auto rounded-2xl border border-line2">
          <table className="w-full text-left border-collapse min-w-[520px]">
            <thead><tr className="bg-bg2"><th className="p-4 text-[13px] font-medium text-faint">Kriterium</th><th className="p-4 text-[14px] font-semibold text-muted">Selbst hosten</th><th className="p-4 text-[14px] font-semibold text-accent-ink" style={{ background: "rgba(34,211,238,.06)" }}>MeinAppNest</th></tr></thead>
            <tbody>{COMPARE.map((r) => <tr key={r[0]} className="border-t border-line"><td className="p-4 text-[14px]">{r[0]}</td><td className="p-4 text-[14px] text-muted"><span className="text-faint mr-2">✕</span>{r[1]}</td><td className="p-4 text-[14px]" style={{ background: "rgba(34,211,238,.06)" }}><span className="text-ok mr-2">✓</span>{r[2]}</td></tr>)}</tbody>
          </table>
        </div>
      </div></section>

      {/* PRICING */}
      <section id="pricing" className="section"><div className="wrap">
        <span className="eyebrow">Preise</span>
        <h2 className="mt-3 text-[32px] sm:text-[40px] leading-[1.1] tracking-[-0.02em] font-semibold">Transparent. Pro App oder als Stack.</h2>
        <p className="mt-4 mb-9 text-[17px] leading-[1.7] text-muted max-w-[680px]">Klare Ressourcen, faire Preise, 14 Tage testen. Platzhalterpreise – final je nach Ressourcen.</p>
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
      </div></section>

      {/* SECURITY */}
      <section className="section"><div className="wrap">
        <span className="eyebrow">Sicherheit</span>
        <h2 className="mt-3 mb-9 text-[32px] sm:text-[40px] leading-[1.1] tracking-[-0.02em] font-semibold">Saubere Infrastruktur. Keine Magie.</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {SECURITY.map(([t, d]) => <div key={t} className="card"><span className="chip h-10 w-10 text-[18px]">◈</span><h3 className="mt-4 text-[15px] font-semibold">{t}</h3><p className="mt-1.5 text-[13px] leading-[1.6] text-muted">{d}</p></div>)}
        </div>
      </div></section>

      {/* FAQ */}
      <section id="faq" className="section"><div className="wrap">
        <span className="eyebrow">FAQ</span>
        <h2 className="mt-3 mb-9 text-[32px] sm:text-[40px] leading-[1.1] tracking-[-0.02em] font-semibold">Häufige Fragen.</h2>
        <div className="max-w-[760px] border-t border-line">
          {FAQS.map(([q, a]) => <details key={q} className="faq"><summary>{q}</summary><div>{a}</div></details>)}
        </div>
      </div></section>

      {/* FINAL CTA */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[400px] w-[700px] rounded-full glow-hero" />
        <div className="wrap relative py-28 text-center">
          <h2 className="text-[34px] sm:text-[48px] tracking-[-0.02em] font-semibold">Starte deine erste App in 5 Minuten.</h2>
          <p className="mt-4 text-[18px] text-muted">Self-hosted Power. Ohne Self-hosting Stress.</p>
          <div className="mt-8 flex justify-center gap-3"><Link href="/signup" className="btn btn-primary h-12 px-7">Kostenlos starten →</Link><Link href="/catalog" className="btn btn-ghost h-12 px-7">Apps ansehen</Link></div>
        </div>
      </section>
    </>
  );
}
