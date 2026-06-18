/**
 * DynStore — Landing Page (Tailwind-token edition)
 * Brand tokens live in tailwind.config.js (colors, fonts, radius, shadows);
 * gradient/glow helpers live in src/index.css. Dark mode is the default.
 */
import React, { useState, useRef, useMemo } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import {
  Server, Boxes, ShieldCheck, RefreshCw, DatabaseBackup, Lock, Globe,
  Activity, Zap, Search, Check, ChevronDown, ArrowRight, Cloud,
  Cpu, Play, Layers, Gauge, LifeBuoy, Sparkles, Moon, AlertTriangle,
} from "lucide-react";

const easeOut = [0.22, 1, 0.36, 1];
const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: easeOut } },
};
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } } };

function Reveal({ children, className, variants = fadeUp }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div ref={ref} className={className} variants={variants} initial="hidden" animate={inView ? "show" : "hidden"}>
      {children}
    </motion.div>
  );
}

function Eyebrow({ children }) {
  return (
    <span className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-widecaps text-accent">
      <Sparkles size={13} /> {children}
    </span>
  );
}

function Badge({ children, tone = "accent" }) {
  const map = {
    accent: "bg-accent-soft text-accent",
    live: "bg-live/10 text-live",
    warning: "bg-amber-400/10 text-amber-300",
    muted: "bg-white/5 text-ink-dim",
  };
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.04em] ${map[tone] || map.accent}`}>
      {tone === "live" && <span className="inline-block h-1.5 w-1.5 rounded-full bg-live animate-pulse-dot" />}
      {children}
    </span>
  );
}

function PrimaryButton({ children, className = "", icon = true, ...props }) {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} transition={{ duration: 0.18, ease: easeOut }}
      className={`group inline-flex items-center justify-center gap-2 rounded-xl bg-brand-gradient px-5 py-3 text-sm font-semibold text-ink-on shadow-glow-strong ${className}`}
      {...props}
    >
      {children}
      {icon && <ArrowRight size={16} className="transition-transform duration-200 group-hover:translate-x-0.5" />}
    </motion.button>
  );
}

function SecondaryButton({ children, className = "", ...props }) {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} transition={{ duration: 0.18, ease: easeOut }}
      className={`inline-flex items-center justify-center gap-2 rounded-xl border border-hair-faint bg-white/5 px-5 py-3 text-sm font-semibold text-ink backdrop-blur transition-colors hover:border-hair-strong hover:bg-white/10 ${className}`}
      {...props}
    >
      {children}
    </motion.button>
  );
}

function Section({ id, eyebrow, title, subtitle, children, center }) {
  return (
    <section id={id} className="relative mx-auto w-full max-w-content px-6 py-20 sm:py-28">
      {(eyebrow || title) && (
        <Reveal className={`mb-12 ${center ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}`}>
          {eyebrow && <div className="mb-3">{eyebrow}</div>}
          {title && <h2 className="text-3xl font-semibold leading-tight tracking-tightish text-ink sm:text-4xl">{title}</h2>}
          {subtitle && <p className="mt-4 text-base leading-relaxed text-ink-soft sm:text-lg">{subtitle}</p>}
        </Reveal>
      )}
      {children}
    </section>
  );
}

const CATEGORIES = ["Alle", "Media", "Automatisierung", "Cloud & Dateien", "Sicherheit", "Monitoring", "KI & Produktivität"];
const APPS = [
  { name: "Plex", cat: "Media", icon: Play, desc: "Filme & Serien auf jedem Gerät streamen — ohne eigenen Server.", price: 7, tags: ["Streaming", "4K"], note: "Integration: Radarr, Sonarr", status: "Beliebt" },
  { name: "Jellyfin", cat: "Media", icon: Play, desc: "Freie, werbefreie Medienzentrale mit voller Kontrolle.", price: 6, tags: ["Open Source", "Streaming"], note: "Integration: Arr-Stack", status: "Beliebt" },
  { name: "Radarr", cat: "Automatisierung", icon: Boxes, desc: "Automatische Verwaltung deiner Filmsammlung.", price: 4, tags: ["Automation", "Arr"], note: "Integration: Prowlarr, Plex", status: null },
  { name: "Sonarr", cat: "Automatisierung", icon: Boxes, desc: "Serien automatisch organisieren und aktuell halten.", price: 4, tags: ["Automation", "Arr"], note: "Integration: Prowlarr", status: null },
  { name: "Prowlarr", cat: "Automatisierung", icon: Layers, desc: "Zentrale Indexer-Verwaltung für den ganzen Arr-Stack.", price: 3, tags: ["Indexer", "Arr"], note: "Verbindet Radarr & Sonarr", status: null },
  { name: "Nextcloud", cat: "Cloud & Dateien", icon: Cloud, desc: "Deine eigene Cloud für Dateien, Kalender & Kontakte.", price: 8, tags: ["Storage", "Sync"], note: "EU-Hosting, DSGVO-freundlich", status: "Beliebt" },
  { name: "Vaultwarden", cat: "Sicherheit", icon: Lock, desc: "Bitwarden-kompatibler Passwort-Manager, nur für dich.", price: 3, tags: ["Security", "Vault"], note: "Bitwarden-Clients kompatibel", status: null },
  { name: "n8n", cat: "KI & Produktivität", icon: Zap, desc: "Workflows & Automationen visuell bauen — ohne Code.", price: 9, tags: ["Automation", "Low-Code"], note: "400+ Integrationen", status: "Beliebt" },
  { name: "Uptime Kuma", cat: "Monitoring", icon: Activity, desc: "Schönes Status- & Uptime-Monitoring für deine Dienste.", price: 3, tags: ["Monitoring", "Status"], note: "Benachrichtigungen inkl.", status: null },
  { name: "Homepage", cat: "Monitoring", icon: Gauge, desc: "Elegantes Dashboard, das alle deine Apps bündelt.", price: 2, tags: ["Dashboard"], note: "Widgets für 100+ Apps", status: "Neu" },
  { name: "Paperless-ngx", cat: "KI & Produktivität", icon: Layers, desc: "Papierloses Büro: Dokumente scannen, taggen, finden.", price: 6, tags: ["Docs", "OCR"], note: "Volltextsuche & OCR", status: null },
  { name: "Grafana", cat: "Monitoring", icon: Activity, desc: "Dashboards & Visualisierung für all deine Metriken.", price: 7, tags: ["Monitoring", "Charts"], note: "Datenquellen-Integrationen", status: null },
];
const BUNDLES = [
  { name: "Media Starter Stack", audience: "Für Einsteiger ins eigene Streaming", apps: ["Jellyfin", "Radarr", "Sonarr", "Prowlarr"], price: 14, perks: ["Fertig verkabelt & automatisiert", "Eine Medienzentrale, ein Login", "Günstiger als einzeln"], featured: false },
  { name: "Productivity Stack", audience: "Für Selbstständige & kleine Teams", apps: ["Nextcloud", "Vaultwarden", "Paperless-ngx"], price: 18, perks: ["Dateien, Passwörter & papierloses Büro", "EU-Hosting, DSGVO-freundlich", "Geteilter Team-Zugang"], featured: true },
  { name: "Automation Stack", audience: "Für Power-User & Maker", apps: ["n8n", "Flowise", "Open WebUI"], price: 22, perks: ["Workflows & eigene KI-Tools", "Ohne Setup-Hölle", "Skaliert mit dir mit"], featured: false },
];
const FEATURES = [
  { icon: Server, title: "Managed Hosting", desc: "Wir betreiben deine Apps auf sicherer, überwachter Infrastruktur. Du nutzt sie einfach.", big: true },
  { icon: RefreshCw, title: "Automatische Updates", desc: "Versionen & Sicherheits-Patches laufen automatisch ein — keine kaputten Container." },
  { icon: DatabaseBackup, title: "Backups inklusive", desc: "Regelmäßige, verschlüsselte Backups. Im Ernstfall stellen wir wieder her." },
  { icon: Globe, title: "SSL & eigene Domain", desc: "HTTPS und eigene Subdomain ab Werk. Eigene Domain in wenigen Klicks." },
  { icon: ShieldCheck, title: "Isolierte Instanzen", desc: "Jede App läuft sauber getrennt — mehr Sicherheit, keine Nebenwirkungen.", big: true },
  { icon: Activity, title: "Monitoring & Status", desc: "Health-Checks und Status im Blick — wir bemerken Probleme zuerst." },
  { icon: Gauge, title: "Einfache Skalierung", desc: "Mehr Leistung per Klick, wenn dein Bedarf wächst." },
  { icon: LifeBuoy, title: "Support", desc: "Echte Hilfe von Menschen, die Infrastruktur verstehen." },
];
const PROBLEMS = [
  { icon: Server, t: "Server einrichten" }, { icon: Boxes, t: "Docker Compose pflegen" },
  { icon: Globe, t: "Ports, SSL & Reverse Proxy" }, { icon: RefreshCw, t: "Updates nachziehen" },
  { icon: DatabaseBackup, t: "Backups & Restore" }, { icon: AlertTriangle, t: "Ausfälle & Downtime" },
  { icon: Lock, t: "Sicherheitsrisiken" }, { icon: Moon, t: "Debugging nachts & am Wochenende" },
];
const STEPS = [
  { n: "01", icon: Search, t: "App oder Stack wählen", d: "Stöbere im Store und wähle, was du brauchst." },
  { n: "02", icon: Boxes, t: "Account erstellen", d: "In Sekunden registriert — keine Kreditkarte nötig." },
  { n: "03", icon: Cpu, t: "DynStore provisioniert", d: "Wir richten Instanz, SSL & Domain automatisch ein." },
  { n: "04", icon: Gauge, t: "Zugriff übers Dashboard", d: "Zugangsdaten erhalten, alles an einem Ort." },
  { n: "05", icon: Check, t: "Einfach nutzen", d: "Loslegen — wir kümmern uns um den Betrieb." },
];
const COMPARE = [
  { f: "Einrichtungszeit", self: "Stunden–Tage", vps: "Stunden", dyn: "< 60 Sekunden" },
  { f: "Wartung & Betrieb", self: "Du", vps: "Du", dyn: "DynStore" },
  { f: "Updates", self: "Manuell", vps: "Manuell", dyn: "Automatisch" },
  { f: "Backups", self: "Selbst bauen", vps: "Selbst bauen", dyn: "Inklusive" },
  { f: "SSL / HTTPS", self: "Selbst konfigurieren", vps: "Selbst konfigurieren", dyn: "Automatisch" },
  { f: "Monitoring", self: "Selbst bauen", vps: "Optional", dyn: "Inklusive" },
  { f: "Nötiges Know-how", self: "Hoch", vps: "Mittel–Hoch", dyn: "Keins" },
];
const METRICS = [
  { v: "40+", l: "Apps & Tools" }, { v: "< 60s", l: "Bereitstellung" },
  { v: "99,9 %", l: "Uptime-Ziel" }, { v: "EU", l: "Hosting-Region" },
];
const FAQS = [
  { q: "Was ist DynStore?", a: "DynStore ist eine Plattform für fertig gehostete Self-Hosted-Apps. Du wählst eine App oder einen Stack, buchst sie und bekommst eine vollständig eingerichtete, sichere und aktuelle Instanz — ohne dich um Server, Docker, Updates oder Konfiguration kümmern zu müssen." },
  { q: "Brauche ich technische Kenntnisse?", a: "Nein. Wenn du eine Web-App im Browser bedienen kannst, kannst du DynStore nutzen. Die gesamte Technik darunter — Server, Reverse Proxy, SSL, Updates — übernehmen wir." },
  { q: "Kann ich meine eigene Domain nutzen?", a: "Ja. Jede Instanz erhält automatisch eine eigene Subdomain mit HTTPS. Eine eigene Domain verbindest du in wenigen Klicks; wir richten das passende Zertifikat automatisch ein." },
  { q: "Wie schnell ist eine App bereit?", a: "In der Regel in unter 60 Sekunden. Nach der Buchung provisioniert DynStore die Instanz automatisch und schickt dir die Zugangsdaten." },
  { q: "Was passiert bei Updates?", a: "Updates und Sicherheits-Patches spielen wir automatisch ein, schonend und getestet. Du musst nichts tun — und kannst bei größeren Versionssprüngen optional informiert werden." },
  { q: "Kann ich Apps kombinieren?", a: "Ja. Du kannst mehrere Apps einzeln buchen oder einen vorkonfigurierten Stack wählen, in dem die Apps bereits miteinander verbunden sind (z. B. Radarr + Prowlarr + Jellyfin)." },
  { q: "Gibt es Backups?", a: "Ja. Deine Daten werden regelmäßig und verschlüsselt gesichert. Im Notfall stellen wir wieder her — Backups sind in jedem Plan enthalten." },
  { q: "Kann ich später wechseln oder kündigen?", a: "Jederzeit. Du kannst Pläne upgraden, downgraden oder monatlich kündigen. Beim Kündigen kannst du deine Daten vorher exportieren." },
  { q: "Ist DynStore legal?", a: "DynStore stellt ausschließlich die Hosting-Infrastruktur und die Software bereit. Welche Inhalte du mit den Apps verarbeitest oder speicherst, liegt in deiner Verantwortung — wie bei jedem anderen Hosting-Anbieter." },
  { q: "Wofür bin ich als Nutzer selbst verantwortlich?", a: "Für deine Inhalte und Daten, deine Zugangsdaten und die rechtmäßige Nutzung der Apps. Wir kümmern uns um Betrieb, Updates, Infrastruktur-Sicherheit, Backups und Verfügbarkeit." },
];
const PRICING = [
  { name: "Single App", monthly: 4, yearly: 40, tagline: "Eine einzelne App, sofort startklar.", cta: "App wählen", features: ["1 gehostete App", "Eigene Subdomain + SSL", "Automatische Updates", "Tägliche Backups", "Community-Support"], featured: false },
  { name: "Stack", monthly: 14, yearly: 140, tagline: "Vorkonfigurierte App-Bundles für deinen Use-Case.", cta: "Stack buchen", features: ["3–4 verbundene Apps", "Alles aus Single App", "Priorisiertes Monitoring", "Eigene Domain möglich", "E-Mail-Support"], featured: true },
  { name: "Pro / Team", monthly: 39, yearly: 390, tagline: "Mehr Leistung, Team-Zugang & Skalierung.", cta: "Pro starten", features: ["Mehrere Stacks & Apps", "Team-Mitglieder & Rollen", "Erhöhte Ressourcen", "Erweiterte Backups", "Prioritäts-Support"], featured: false },
];

function GlowCard({ children, className = "", featured = false }) {
  const ref = useRef(null);
  const [glow, setGlow] = useState({ x: 50, y: 0, on: false });
  function onMove(e) {
    const r = ref.current.getBoundingClientRect();
    setGlow({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100, on: true });
  }
  return (
    <motion.div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={() => setGlow((g) => ({ ...g, on: false }))}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2, ease: easeOut }}
      variants={fadeUp}
      className={`relative overflow-hidden rounded-card border bg-surface-1 p-5 ${featured ? "border-hair-glow shadow-glow" : "border-hair-faint shadow-card"} ${className}`}
    >
      <div
        className="pointer-events-none absolute inset-0 transition-opacity duration-300"
        style={{ opacity: glow.on ? 1 : 0, background: `radial-gradient(420px circle at ${glow.x}% ${glow.y}%, rgba(34,211,238,0.10), transparent 45%)` }}
      />
      <div className="relative">{children}</div>
    </motion.div>
  );
}

function AppCard({ app }) {
  const Icon = app.icon;
  return (
    <GlowCard className="flex h-full flex-col">
      <div className="mb-4 flex items-start justify-between">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-hair-subtle bg-surface-3 text-accent">
          <Icon size={20} />
        </div>
        {app.status ? <Badge tone={app.status === "Beliebt" ? "accent" : "live"}>{app.status}</Badge> : <Badge tone="live">Live</Badge>}
      </div>
      <h3 className="text-base font-semibold text-ink">{app.name}</h3>
      <div className="mb-2 text-xs text-ink-dim">{app.cat}</div>
      <p className="mb-4 text-sm leading-relaxed text-ink-soft">{app.desc}</p>
      <div className="mb-4 flex flex-wrap gap-1.5">
        {app.tags.map((t) => <span key={t} className="rounded-md bg-white/5 px-2 py-0.5 text-[11px] text-ink-dim">{t}</span>)}
      </div>
      <div className="mt-auto flex items-center justify-between border-t border-hair-subtle pt-4">
        <div>
          <span className="text-xs text-ink-dim">ab </span>
          <span className="font-mono text-lg font-semibold text-ink">{app.price} €</span>
          <span className="text-xs text-ink-dim">/Mon.</span>
        </div>
        <button className="group inline-flex items-center gap-1 text-sm font-semibold text-accent">
          Buchen <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
        </button>
      </div>
      {app.note && <div className="mt-3 flex items-center gap-1.5 text-[11px] text-ink-dim"><Layers size={12} /> {app.note}</div>}
    </GlowCard>
  );
}

function FAQItem({ item, open, onToggle }) {
  return (
    <div className="rounded-xl border border-hair-faint bg-surface-1">
      <button onClick={onToggle} className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left">
        <span className="text-sm font-medium text-ink sm:text-base">{item.q}</span>
        <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown size={18} className={open ? "text-accent" : "text-ink-dim"} />
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.28, ease: easeOut }} className="overflow-hidden">
            <p className="px-5 pb-5 text-sm leading-relaxed text-ink-soft">{item.a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function HeroVisual() {
  const orbit = [Play, Cloud, Lock, Zap, Activity, Boxes];
  return (
    <div className="relative mx-auto aspect-square w-full max-w-md">
      <div className="absolute inset-0 glow-hero" />
      <div className="absolute inset-0 rounded-full border border-hair-subtle" />
      <div className="absolute inset-[17%] rounded-full border border-hair-subtle" />
      <div className="absolute inset-[32%] rounded-full border border-hair-subtle" />
      <motion.div className="absolute inset-0" animate={{ rotate: 360 }} transition={{ duration: 48, repeat: Infinity, ease: "linear" }}>
        {orbit.map((Icon, i) => {
          const rad = (i * 60 * Math.PI) / 180, R = 42;
          const x = 50 + R * Math.cos(rad), y = 50 + R * Math.sin(rad);
          return (
            <motion.div key={i}
              className="absolute flex h-12 w-12 items-center justify-center rounded-2xl border border-hair-faint bg-surface-2 text-accent shadow-card"
              style={{ left: `${x}%`, top: `${y}%`, transform: "translate(-50%,-50%)" }}
              animate={{ rotate: -360 }} transition={{ duration: 48, repeat: Infinity, ease: "linear" }}>
              <Icon size={20} />
              <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-live" style={{ boxShadow: "0 0 8px #34D399" }} />
            </motion.div>
          );
        })}
      </motion.div>
      <div className="glow-core absolute left-1/2 top-1/2 flex h-20 w-20 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-3xl bg-brand-gradient text-ink-on">
        <Cloud size={34} />
      </div>
      <div className="absolute -bottom-6 left-1/2 w-[92%] -translate-x-1/2 rounded-xl border border-hair-faint bg-elevated/80 p-3 font-mono text-[11px] text-ink-soft backdrop-blur-md">
        <div className="mb-2 flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full" style={{ background: "#FF5F57" }} />
          <span className="h-2.5 w-2.5 rounded-full" style={{ background: "#FEBC2E" }} />
          <span className="h-2.5 w-2.5 rounded-full" style={{ background: "#28C840" }} />
          <span className="ml-2 text-ink-dim">provisioning</span>
        </div>
        {["→ pull image …", "→ configure instance …", "→ issue SSL cert …"].map((l, i) => (
          <motion.div key={i} className="text-ink-dim" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 + i * 0.5 }}>{l}</motion.div>
        ))}
        <motion.div className="text-live" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.2 }}>✓ live · https://dein-app.dynstore.io</motion.div>
      </div>
    </div>
  );
}

export default function DynStoreLanding() {
  const [cat, setCat] = useState("Alle");
  const [query, setQuery] = useState("");
  const [yearly, setYearly] = useState(false);
  const [openFaq, setOpenFaq] = useState(0);

  const apps = useMemo(() =>
    APPS.filter((a) => cat === "Alle" || a.cat === cat)
      .filter((a) => a.name.toLowerCase().includes(query.toLowerCase()) || a.tags.join(" ").toLowerCase().includes(query.toLowerCase())),
  [cat, query]);

  const nav = [["Apps", "#apps"], ["Bundles", "#bundles"], ["Preise", "#pricing"], ["Features", "#features"], ["Docs", "#faq"]];

  return (
    <div className="min-h-screen bg-base text-ink">
      <div className="glow-top pointer-events-none absolute inset-x-0 top-0 h-[600px]" />

      <header className="sticky top-0 z-50">
        <div className="mx-auto flex max-w-content items-center justify-between border-b border-hair-subtle bg-base/60 px-6 py-4 backdrop-blur-md">
          <div className="flex items-center gap-2 font-semibold">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-gradient text-ink-on"><Layers size={18} /></span>
            DynStore
          </div>
          <nav className="hidden items-center gap-7 text-sm text-ink-soft md:flex">
            {nav.map(([t, h]) => <a key={t} href={h} className="transition-colors hover:text-white">{t}</a>)}
          </nav>
          <div className="flex items-center gap-3">
            <a href="#" className="hidden text-sm font-medium text-ink-soft sm:block">Anmelden</a>
            <PrimaryButton className="!px-4 !py-2 text-xs">App starten</PrimaryButton>
          </div>
        </div>
      </header>

      <section className="relative mx-auto grid max-w-content items-center gap-12 px-6 pb-10 pt-16 sm:pt-24 lg:grid-cols-2">
        <motion.div variants={stagger} initial="hidden" animate="show">
          <motion.div variants={fadeUp}><Eyebrow>Managed App Hosting für Power-User, Teams &amp; Creator</Eyebrow></motion.div>
          <motion.h1 variants={fadeUp} className="mt-5 text-4xl font-semibold leading-[1.05] tracking-tight sm:text-6xl">
            Self-hosted Power.<br /><span className="text-brand-gradient">Ohne den Self-hosting Stress.</span>
          </motion.h1>
          <motion.p variants={fadeUp} className="mt-6 max-w-xl text-base leading-relaxed text-ink-soft sm:text-lg">
            Plex, Jellyfin, Nextcloud, n8n und 40+ weitere Tools — fertig gehostet und in unter 60 Sekunden startklar. Keine Server, kein Docker, keine Updates. Du wählst die App, wir kümmern uns um den Rest.
          </motion.p>
          <motion.div variants={fadeUp} className="mt-8 flex flex-wrap gap-3">
            <PrimaryButton>App in 60 Sek. starten</PrimaryButton>
            <SecondaryButton>App-Store ansehen</SecondaryButton>
          </motion.div>
          <motion.div variants={fadeUp} className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-ink-dim">
            {["Keine Kreditkarte nötig", "14 Tage testen", "SSL & Backups inklusive", "EU-Hosting"].map((t) => (
              <span key={t} className="inline-flex items-center gap-1.5"><Check size={13} className="text-live" /> {t}</span>
            ))}
          </motion.div>
        </motion.div>
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.7, ease: easeOut }} className="pb-8">
          <HeroVisual />
        </motion.div>
      </section>

      <div className="mx-auto max-w-content px-6 py-8">
        <Reveal variants={stagger}>
          <div className="grid grid-cols-2 gap-4 rounded-card border border-hair-subtle bg-surface-1 p-6 sm:grid-cols-4">
            {METRICS.map((m) => (
              <motion.div key={m.l} variants={fadeUp} className="text-center">
                <div className="font-mono text-2xl font-semibold text-ink sm:text-3xl">{m.v}</div>
                <div className="mt-1 text-xs text-ink-dim">{m.l}</div>
              </motion.div>
            ))}
          </div>
        </Reveal>
      </div>

      <Section eyebrow={<Eyebrow>Das Problem</Eyebrow>} title="Self-Hosting ist mächtig — und ein Vollzeitjob." subtitle="Die Tools sind großartig. Der Betrieb drumherum frisst Abende, Wochenenden und Nerven.">
        <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-80px" }} className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {PROBLEMS.map((p) => {
            const Icon = p.icon;
            return (
              <motion.div key={p.t} variants={fadeUp} className="rounded-xl border border-hair-subtle bg-surface-1 p-4">
                <Icon size={20} className="text-ink-dim" />
                <div className="mt-3 text-sm text-ink-soft">{p.t}</div>
              </motion.div>
            );
          })}
        </motion.div>
      </Section>

      <Section id="how" eyebrow={<Eyebrow>Die Lösung</Eyebrow>} title="Dieselben Tools. Ohne den Betrieb." subtitle="In wenigen Schritten von der Auswahl zur laufenden App — den Rest übernimmt DynStore.">
        <div className="relative grid gap-4 sm:grid-cols-3 lg:grid-cols-5">
          <div className="absolute left-0 right-0 top-7 hidden h-px bg-hair-subtle lg:block" />
          {STEPS.map((s) => {
            const Icon = s.icon;
            return (
              <Reveal key={s.n} className="relative">
                <div className="rounded-card border border-hair-faint bg-surface-1 p-5">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent-soft text-accent"><Icon size={18} /></span>
                    <span className="font-mono text-xs text-ink-dim">{s.n}</span>
                  </div>
                  <div className="text-sm font-semibold text-ink">{s.t}</div>
                  <div className="mt-1 text-xs leading-relaxed text-ink-soft">{s.d}</div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </Section>

      <Section id="apps" eyebrow={<Eyebrow>App-Store</Eyebrow>} title="Wähle aus 40+ fertig gehosteten Apps." subtitle="Ein App Store für Self-Hosted Tools — gebucht, gestartet, genutzt.">
        <div className="mb-6 flex flex-col gap-4">
          <div className="relative">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-dim" />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="App suchen … (z. B. Plex, n8n)"
              className="w-full rounded-xl border border-hair-faint bg-surface-3 py-3 pl-11 pr-4 text-sm text-ink outline-none focus:border-hair-glow" />
          </div>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((c) => {
              const active = cat === c;
              return (
                <button key={c} onClick={() => setCat(c)}
                  className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors ${active ? "border border-hair-glow bg-accent-soft text-accent" : "border border-hair-subtle bg-white/5 text-ink-soft hover:border-hair-faint"}`}>
                  {c}
                </button>
              );
            })}
          </div>
        </div>
        <motion.div layout variants={stagger} initial="hidden" animate="show" className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <AnimatePresence mode="popLayout">
            {apps.map((app) => (
              <motion.div key={app.name} layout initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }} transition={{ duration: 0.25, ease: easeOut }}>
                <AppCard app={app} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
        {apps.length === 0 && <div className="py-12 text-center text-sm text-ink-dim">Keine Treffer — versuch eine andere Kategorie oder Suche.</div>}
      </Section>

      <Section id="bundles" eyebrow={<Eyebrow>Bundles &amp; Stacks</Eyebrow>} title="Fertige Stacks für deinen Use-Case." subtitle="Vorkonfiguriert, verbunden und überwacht — günstiger als die Summe der Einzel-Apps.">
        <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-80px" }} className="grid gap-5 lg:grid-cols-3">
          {BUNDLES.map((b) => (
            <GlowCard key={b.name} featured={b.featured} className="flex flex-col">
              {b.featured && <div className="mb-3"><Badge tone="accent">Beliebt</Badge></div>}
              <h3 className="text-lg font-semibold text-ink">{b.name}</h3>
              <p className="mt-1 text-xs text-ink-dim">{b.audience}</p>
              <div className="mt-4 flex flex-wrap gap-1.5">
                {b.apps.map((a) => <span key={a} className="rounded-md border border-hair-subtle bg-surface-3 px-2 py-1 text-[11px] text-ink-soft">{a}</span>)}
              </div>
              <ul className="mt-4 space-y-2">
                {b.perks.map((p) => <li key={p} className="flex items-start gap-2 text-sm text-ink-soft"><Check size={15} className="mt-0.5 text-live" /> {p}</li>)}
              </ul>
              <div className="mt-5 flex items-end justify-between border-t border-hair-subtle pt-4">
                <div><span className="text-xs text-ink-dim">ab </span><span className="font-mono text-2xl font-semibold text-ink">{b.price} €</span><span className="text-xs text-ink-dim">/Mon.</span></div>
              </div>
              <div className="mt-4">{b.featured ? <PrimaryButton className="w-full">Stack buchen</PrimaryButton> : <SecondaryButton className="w-full">Stack buchen</SecondaryButton>}</div>
            </GlowCard>
          ))}
        </motion.div>
      </Section>

      <Section id="features" eyebrow={<Eyebrow>Features</Eyebrow>} title="Alles inklusive, worüber du sonst nachts grübelst." subtitle="Betrieb, Sicherheit und Wartung — übernommen, damit du nur noch nutzt.">
        <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-80px" }} className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => {
            const Icon = f.icon;
            return (
              <GlowCard key={f.title} className={f.big ? "sm:col-span-2 lg:col-span-1" : ""}>
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-soft text-accent"><Icon size={20} /></span>
                <h3 className="mt-4 text-base font-semibold text-ink">{f.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">{f.desc}</p>
              </GlowCard>
            );
          })}
        </motion.div>
      </Section>

      <Section eyebrow={<Eyebrow>Vergleich</Eyebrow>} title="Warum DynStore statt Server selbst betreiben?" subtitle="Dieselben Apps — aber ohne die Arbeit drumherum.">
        <Reveal className="overflow-x-auto">
          <div className="min-w-[640px] overflow-hidden rounded-card border border-hair-faint">
            <div className="grid grid-cols-4 bg-surface-2 text-sm font-semibold">
              <div className="p-4 text-ink-dim">Merkmal</div>
              <div className="p-4 text-center text-ink-soft">Selbst hosten</div>
              <div className="p-4 text-center text-ink-soft">Klassischer VPS</div>
              <div className="bg-accent-soft p-4 text-center text-accent">DynStore</div>
            </div>
            {COMPARE.map((row, i) => (
              <div key={row.f} className={`grid grid-cols-4 border-t border-hair-subtle text-sm ${i % 2 ? "bg-white/[0.015]" : ""}`}>
                <div className="p-4 text-ink">{row.f}</div>
                <div className="p-4 text-center text-ink-dim">{row.self}</div>
                <div className="p-4 text-center text-ink-dim">{row.vps}</div>
                <div className="flex items-center justify-center gap-1.5 bg-accent-soft p-4 font-medium text-ink"><Check size={15} className="text-accent" /> {row.dyn}</div>
              </div>
            ))}
          </div>
        </Reveal>
      </Section>

      <Section id="pricing" center eyebrow={<Eyebrow>Preise</Eyebrow>} title="Transparente Preise. Keine Überraschungen." subtitle="Beispielpreise — flexibel monatlich oder jährlich. 14 Tage testen, jederzeit kündbar.">
        <div className="mb-8 flex items-center justify-center gap-3 text-sm">
          <span className={yearly ? "text-ink-dim" : "text-ink"}>Monatlich</span>
          <button onClick={() => setYearly((y) => !y)} className={`relative h-7 w-12 rounded-full border border-hair-faint transition-colors ${yearly ? "bg-accent-strong" : "bg-surface-3"}`}>
            <motion.span className="absolute top-1 h-5 w-5 rounded-full bg-white" animate={{ left: yearly ? 24 : 4 }} transition={{ duration: 0.2, ease: easeOut }} />
          </button>
          <span className={yearly ? "text-ink" : "text-ink-dim"}>Jährlich <span className="text-live">· 2 Monate gratis</span></span>
        </div>
        <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-80px" }} className="grid gap-5 text-left lg:grid-cols-3">
          {PRICING.map((p) => (
            <motion.div key={p.name} variants={fadeUp} whileHover={{ y: -4 }} transition={{ duration: 0.2, ease: easeOut }}
              className={`relative flex flex-col rounded-card border bg-surface-1 p-6 ${p.featured ? "border-hair-glow shadow-glow" : "border-hair-faint shadow-card"}`}>
              {p.featured && <div className="absolute -top-3 left-6"><Badge tone="accent">Empfohlen</Badge></div>}
              <h3 className="text-base font-semibold text-ink">{p.name}</h3>
              <p className="mt-1 text-xs leading-relaxed text-ink-dim">{p.tagline}</p>
              <div className="mt-5 flex items-baseline gap-1">
                <span className="font-mono text-4xl font-semibold text-ink">{yearly ? Math.round(p.yearly / 12) : p.monthly} €</span>
                <span className="text-sm text-ink-dim">/Mon.</span>
              </div>
              <div className="mt-1 text-xs text-ink-dim">{yearly ? `${p.yearly} € jährlich abgerechnet` : "monatlich abgerechnet"}</div>
              <ul className="mt-5 space-y-2.5">
                {p.features.map((f) => <li key={f} className="flex items-start gap-2 text-sm text-ink-soft"><Check size={15} className="mt-0.5 text-accent" /> {f}</li>)}
              </ul>
              <div className="mt-6">{p.featured ? <PrimaryButton className="w-full">{p.cta}</PrimaryButton> : <SecondaryButton className="w-full">{p.cta}</SecondaryButton>}</div>
            </motion.div>
          ))}
        </motion.div>
        <p className="mt-6 text-center text-xs text-ink-dim">Add-ons (mehr Speicher, Leistung, eigene Domain) flexibel zubuchbar · Ressourcen transparent ausgewiesen</p>
      </Section>

      <Section eyebrow={<Eyebrow>Sicherheit &amp; Vertrauen</Eyebrow>} title="Saubere Infrastruktur. Keine Magie." subtitle="Klar getrennte Verantwortlichkeiten — wir betreiben sicher, du nutzt sorgenfrei.">
        <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-80px" }} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: ShieldCheck, t: "Isolierte Instanzen", d: "Jede App in eigener, abgeschotteter Umgebung." },
            { icon: Lock, t: "Verschlüsselte Verbindungen", d: "SSL/TLS automatisch für jede Instanz." },
            { icon: DatabaseBackup, t: "Automatische Backups", d: "Regelmäßig, verschlüsselt, wiederherstellbar." },
            { icon: Activity, t: "Monitoring & Status", d: "Wir bemerken Probleme, bevor du sie merkst." },
          ].map((s) => {
            const Icon = s.icon;
            return (
              <motion.div key={s.t} variants={fadeUp} className="rounded-card border border-hair-faint bg-surface-1 p-5">
                <Icon size={22} className="text-accent" />
                <h3 className="mt-3 text-sm font-semibold text-ink">{s.t}</h3>
                <p className="mt-1 text-xs leading-relaxed text-ink-soft">{s.d}</p>
              </motion.div>
            );
          })}
        </motion.div>
      </Section>

      <Section id="faq" center eyebrow={<Eyebrow>FAQ</Eyebrow>} title="Häufige Fragen">
        <div className="mx-auto max-w-3xl space-y-3 text-left">
          {FAQS.map((item, i) => <FAQItem key={item.q} item={item} open={openFaq === i} onToggle={() => setOpenFaq(openFaq === i ? -1 : i)} />)}
        </div>
      </Section>

      <Section center>
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl border border-hair-faint bg-surface-1 px-6 py-16 text-center">
            <div className="glow-cta pointer-events-none absolute inset-0" />
            <div className="relative">
              <h2 className="mx-auto max-w-2xl text-3xl font-semibold leading-tight tracking-tightish sm:text-4xl">Starte deine erste App in unter einer Minute.</h2>
              <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-ink-soft">Keine Server. Kein Docker. Keine Update-Nächte. Nur deine Tools — sofort einsatzbereit.</p>
              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <PrimaryButton>Jetzt kostenlos starten</PrimaryButton>
                <SecondaryButton>Erst den App-Store ansehen</SecondaryButton>
              </div>
            </div>
          </div>
        </Reveal>
      </Section>

      <footer className="border-t border-hair-subtle">
        <div className="mx-auto max-w-content px-6 py-12">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-5">
            <div className="lg:col-span-2">
              <div className="flex items-center gap-2 font-semibold">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-gradient text-ink-on"><Layers size={18} /></span>
                DynStore
              </div>
              <p className="mt-3 max-w-xs text-sm text-ink-soft">Deine Lieblings-Apps. Fertig gehostet.<br />Tools starten statt Server warten.</p>
              <div className="mt-4 inline-flex items-center gap-2 text-xs text-ink-dim">
                <span className="inline-block h-2 w-2 rounded-full bg-live" style={{ boxShadow: "0 0 8px #34D399" }} /> Alle Systeme betriebsbereit
              </div>
            </div>
            {[
              ["Produkt", ["Apps", "Bundles", "Preise", "Features"]],
              ["Ressourcen", ["Docs", "Status", "Changelog", "Support"]],
              ["Rechtliches", ["Impressum", "Datenschutz", "AGB"]],
            ].map(([h, items]) => (
              <div key={h}>
                <div className="text-sm font-semibold text-ink">{h}</div>
                <ul className="mt-3 space-y-2 text-sm text-ink-soft">
                  {items.map((it) => <li key={it}><a href="#" className="transition-colors hover:text-white">{it}</a></li>)}
                </ul>
              </div>
            ))}
          </div>
          <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-hair-subtle pt-6 text-xs text-ink-dim sm:flex-row">
            <span>© {new Date().getFullYear()} DynStore. Alle Rechte vorbehalten.</span>
            <span>Made for Power-User, Teams &amp; Creator · EU-Hosting</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
