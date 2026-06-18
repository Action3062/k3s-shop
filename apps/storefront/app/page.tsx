import Link from "next/link";
import { getCatalog } from "@/lib/controlPlane";
import { AppCard } from "@/components/AppCard";

const AVAILABLE = new Set(["vaultwarden"]);

export default async function Home() {
  const catalog = await getCatalog();
  return (
    <>
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-x-0 -top-32 h-[620px]"
          style={{ background: "radial-gradient(620px 320px at 70% 8%,rgba(34,211,238,.18),transparent 60%),radial-gradient(520px 300px at 20% 0%,rgba(14,165,233,.10),transparent 60%)" }} />
        <div className="wrap relative grid lg:grid-cols-[1.05fr_.95fr] gap-14 items-center py-[84px]">
          <div>
            <span className="pill"><span className="dot" /> Läuft auf deinem k3s-Cluster · Hosted in Germany</span>
            <h1 className="mt-4 font-semibold tracking-tight leading-[1.05] text-[clamp(34px,5.2vw,60px)]">
              Self-hosted Apps.<br />Live in Minuten.<br />Auf deiner Subdomain.
            </h1>
            <p className="text-[19px] text-muted my-7 max-w-[33ch]">
              Wähle eine App, abonniere sie — und erhalte automatisch eine isolierte, verschlüsselte Instanz unter deiner eigenen Adresse. Kein Setup, kein Server-Gefrickel.
            </p>
            <div className="flex gap-3.5 flex-wrap">
              <Link href="/catalog" className="btn btn-primary">Apps ansehen →</Link>
              <Link href="/#how" className="btn btn-ghost">So funktioniert&apos;s</Link>
            </div>
            <div className="mt-5 text-[13px] text-faint">Eigene Subdomain · automatisches HTTPS · jederzeit kündbar · tägliche Backups</div>
          </div>
          <DemoCard />
        </div>
      </section>

      <section className="py-9">
        <div className="wrap flex flex-wrap gap-x-7 gap-y-2 text-faint text-sm">
          <span>Mandantengetrennt (1 Namespace pro Kunde)</span><span>· Wildcard-TLS via Let&apos;s Encrypt</span><span>· GitOps-Auslieferung</span><span>· DSGVO, Server in Deutschland</span>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <span className="eyebrow">Warum MeinAppNest</span>
          <h2 className="mt-2.5 mb-2 font-semibold tracking-tight text-[clamp(26px,3.4vw,38px)]">Hosting, das sich um sich selbst kümmert.</h2>
          <p className="text-muted max-w-[60ch] mb-9">Du klickst „Abonnieren". Wir kümmern uns um Ausrollen, TLS, Isolation und Lebenszyklus.</p>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-[18px]">
            <Feature icon="⚡" title="In Minuten live" body="Nach dem Kauf wird deine Instanz automatisch ausgerollt — kein manuelles Setup." />
            <Feature icon="🔒" title="Eigene Domain + HTTPS" body="Jede Instanz unter name.app.meinappnest.org mit gültigem Zertifikat." />
            <Feature icon="🧩" title="Sauber getrennt" body="Eigener Namespace, Ressourcen-Limits und Netzwerk-Isolation pro Kunde." />
            <Feature icon="↺" title="Volle Kontrolle" body="Verwalten, pausieren oder kündigen — mit Backup vor jeder Löschung." />
          </div>
        </div>
      </section>

      <section id="apps" className="section">
        <div className="wrap">
          <div className="flex flex-wrap justify-between items-end gap-5 mb-9">
            <div><span className="eyebrow">Katalog</span><h2 className="mt-2.5 font-semibold tracking-tight text-[clamp(26px,3.4vw,38px)]">Wähle deine App</h2></div>
            <Link href="/catalog" className="text-muted hover:text-ink text-sm">Alle Apps →</Link>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-[18px]">
            {catalog.slice(0, 3).map((a) => <AppCard key={a.slug} app={a} available={AVAILABLE.has(a.slug)} />)}
          </div>
        </div>
      </section>

      <section id="how" className="section">
        <div className="wrap">
          <span className="eyebrow">So funktioniert&apos;s</span>
          <h2 className="mt-2.5 mb-9 font-semibold tracking-tight text-[clamp(26px,3.4vw,38px)]">Drei Schritte zur eigenen Instanz.</h2>
          <div className="grid md:grid-cols-3 gap-[18px]">
            <Step n="01" title="App wählen & abonnieren" body="Konto anlegen, App aus dem Katalog wählen, sicher per Stripe bezahlen." />
            <Step n="02" title="Automatisches Ausrollen" body="Wir legen Namespace, Speicher, Ingress und TLS an — vollautomatisch." />
            <Step n="03" title="Loslegen" body="Deine Instanz ist unter deiner Subdomain erreichbar. Fertig." />
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <div className="rounded-[22px] border border-line2 p-12 text-center" style={{ background: "linear-gradient(135deg,#0C1014,#0E2A31)" }}>
            <h2 className="font-semibold tracking-tight text-[clamp(26px,3.4vw,38px)]">Deine erste App ist in fünf Minuten live.</h2>
            <p className="text-muted my-3 mx-auto max-w-[48ch]">Konto anlegen, App wählen, loslegen — ohne Server-Know-how.</p>
            <Link href="/signup" className="btn btn-primary h-12 px-7">Kostenlos starten →</Link>
          </div>
        </div>
      </section>
    </>
  );
}

function DemoCard() {
  const rows = [
    ["10:02", "Bestellung erhalten — Vaultwarden", false],
    ["10:02", "Namespace tenant-thomas-vaultwarden erstellt", true],
    ["10:03", "Volume · Ingress · TLS bereit", true],
    ["10:03", "Healthcheck grün", true],
  ] as const;
  return (
    <div className="rounded-[18px] border border-line2 p-[18px]" style={{ background: "linear-gradient(180deg,#11151B,#0C1014)", boxShadow: "0 30px 80px -40px rgba(0,0,0,.8)" }}>
      <div className="flex items-center gap-2 pb-3.5 border-b border-line">
        <i className="w-[11px] h-[11px] rounded-full inline-block bg-[#2a2f37]" /><i className="w-[11px] h-[11px] rounded-full inline-block bg-[#2a2f37]" /><i className="w-[11px] h-[11px] rounded-full inline-block bg-[#2a2f37]" />
        <span className="ml-2 font-mono text-[12.5px] text-faint">dynstore · provisioning</span>
      </div>
      {rows.map(([t, msg, ok], i) => (
        <div key={i} className="font-mono text-[13px] py-[7px] text-muted flex gap-2.5">
          <span className="text-faint min-w-[54px]">{t}</span>
          <span className={ok ? "text-ok" : ""}>{msg}</span>
        </div>
      ))}
      <div className="mt-3.5 bg-bg2 border border-line rounded-xl px-4 py-3.5 flex items-center justify-between">
        <span className="font-mono text-[13.5px] text-accent-ink">https://thomas.vaultwarden.meinappnest.org</span>
        <span className="pill h-[26px]"><span className="dot" /> live</span>
      </div>
    </div>
  );
}

function Feature({ icon, title, body }: { icon: string; title: string; body: string }) {
  return (
    <div className="card">
      <div className="grid place-items-center w-10 h-10 rounded-[10px] bg-surface2 border border-line mb-3.5 text-accent-ink text-xl">{icon}</div>
      <h3 className="font-semibold text-lg mb-1.5">{title}</h3>
      <p className="text-[14.5px] text-muted">{body}</p>
    </div>
  );
}

function Step({ n, title, body }: { n: string; title: string; body: string }) {
  return (
    <div className="card">
      <div className="font-mono text-accent-ink text-[13px] mb-2.5">{n}</div>
      <h3 className="font-semibold text-lg mb-1.5">{title}</h3>
      <p className="text-[14.5px] text-muted">{body}</p>
    </div>
  );
}
