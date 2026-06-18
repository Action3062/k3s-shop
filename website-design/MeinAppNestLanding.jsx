/**
 * MeinAppNest — Landing Page
 * ------------------------------------------------------------------
 * Single-file React landing page for MeinAppNest ("Self-hosted Power.
 * Ohne den Self-hosting Stress.").
 *
 * Stack:
 *   - React (hooks)
 *   - Tailwind CSS (utility classes for layout/spacing/typography)
 *   - Framer Motion (subtle reveals + microinteractions)
 *   - lucide-react (line icons)
 *
 * Design system: see MeinAppNest-Website-Konzept.md (Cyan/Teal on deep dark).
 * Exact brand colors live in the `C` palette object below and are applied
 * via inline styles so the file renders identically with or without a
 * custom Tailwind theme. In a production project you'd move these into
 * tailwind.config.js as theme tokens.
 *
 * Dark mode is the default and only mode here, by design.
 */

import React, { useState, useRef, useMemo } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import {
  Server, Boxes, ShieldCheck, RefreshCw, DatabaseBackup, Lock, Globe,
  Activity, Zap, Search, Check, ChevronDown, ArrowRight, Cloud,
  Cpu, Play, Layers, Gauge, LifeBuoy, Sparkles, Moon, AlertTriangle,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/* Brand palette (mirrors the design system tokens)                    */
/* ------------------------------------------------------------------ */
const C = {
  bg: "#07090C",
  bgElevated: "#0C1014",
  surface1: "#11151B",
  surface2: "#161C24",
  surface3: "#1C2430",
  borderSubtle: "rgba(255,255,255,0.06)",
  borderDefault: "rgba(255,255,255,0.10)",
  borderStrong: "rgba(255,255,255,0.16)",
  borderGlow: "rgba(34,211,238,0.45)",
  textPrimary: "#EBF1F6",
  textSecondary: "#A4B1BE",
  textMuted: "#637180",
  onAccent: "#04181C",
  accent: "#22D3EE",
  accentStrong: "#06B6D4",
  accentDeep: "#0E7490",
  accentSoft: "rgba(34,211,238,0.12)",
  live: "#34D399",
  warning: "#FBBF24",
  gradient: "linear-gradient(135deg, #22D3EE 0%, #0EA5E9 100%)",
};

/* ------------------------------------------------------------------ */
/* Motion helpers                                                      */
/* ------------------------------------------------------------------ */
const easeOut = [0.22, 1, 0.36, 1];

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: easeOut } },
};

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
};

/** Reveal-on-scroll wrapper. */
function Reveal({ children, className, style, variants = fadeUp }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div
      ref={ref}
      className={className}
      style={style}
      variants={variants}
      initial="hidden"
      animate={inView ? "show" : "hidden"}
    >
      {children}
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/* Small UI primitives                                                 */
/* ------------------------------------------------------------------ */
function Eyebrow({ children }) {
  return (
    <span
      className="inline-flex items-center gap-2 text-xs font-medium uppercase"
      style={{ color: C.accent, letterSpacing: "0.12em" }}
    >
      <Sparkles size={13} /> {children}
    </span>
  );
}

function Badge({ children, tone = "accent" }) {
  const tones = {
    accent: { bg: C.accentSoft, fg: C.accent, dot: C.accent },
    live: { bg: "rgba(52,211,153,0.12)", fg: C.live, dot: C.live },
    warning: { bg: "rgba(251,191,36,0.12)", fg: C.warning, dot: C.warning },
    muted: { bg: "rgba(255,255,255,0.06)", fg: C.textMuted, dot: C.textMuted },
  };
  const t = tones[tone] || tones.accent;
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium uppercase"
      style={{ background: t.bg, color: t.fg, letterSpacing: "0.04em" }}
    >
      {tone === "live" && (
        <motion.span
          className="inline-block h-1.5 w-1.5 rounded-full"
          style={{ background: t.dot }}
          animate={{ opacity: [1, 0.35, 1], scale: [1, 0.85, 1] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
        />
      )}
      {children}
    </span>
  );
}

function PrimaryButton({ children, className = "", icon = true, ...props }) {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.18, ease: easeOut }}
      className={`group inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold ${className}`}
      style={{
        background: C.gradient,
        color: C.onAccent,
        boxShadow: "0 8px 30px rgba(34,211,238,0.25)",
      }}
      {...props}
    >
      {children}
      {icon && (
        <ArrowRight
          size={16}
          className="transition-transform duration-200 group-hover:translate-x-0.5"
        />
      )}
    </motion.button>
  );
}

function SecondaryButton({ children, className = "", ...props }) {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.18, ease: easeOut }}
      className={`inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold ${className}`}
      style={{
        background: "rgba(255,255,255,0.04)",
        color: C.textPrimary,
        border: `1px solid ${C.borderDefault}`,
        backdropFilter: "blur(12px)",
      }}
      {...props}
    >
      {children}
    </motion.button>
  );
}

/** Section shell with consistent vertical rhythm + heading block. */
function Section({ id, eyebrow, title, subtitle, children, center }) {
  return (
    <section id={id} className="relative mx-auto w-full max-w-6xl px-6 py-20 sm:py-28">
      {(eyebrow || title) && (
        <Reveal className={`mb-12 ${center ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}`}>
          {eyebrow && <div className="mb-3">{eyebrow}</div>}
          {title && (
            <h2
              className="text-3xl font-semibold sm:text-4xl"
              style={{ color: C.textPrimary, letterSpacing: "-0.02em", lineHeight: 1.1 }}
            >
              {title}
            </h2>
          )}
          {subtitle && (
            <p className="mt-4 text-base sm:text-lg" style={{ color: C.textSecondary, lineHeight: 1.6 }}>
              {subtitle}
            </p>
          )}
        </Reveal>
      )}
      {children}
    </section>
  );
}

/* A subtle card surface used across the page. */
function cardStyle(extra = {}) {
  return {
    background: C.surface1,
    border: `1px solid ${C.borderDefault}`,
    ...extra,
  };
}

/* ------------------------------------------------------------------ */
/* Data                                                                */
/* ------------------------------------------------------------------ */
const CATEGORIES = [
  "Alle", "Media", "Automatisierung", "Cloud & Dateien",
  "Sicherheit", "Monitoring", "KI & Produktivität",
];

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
  {
    name: "Media Starter Stack", audience: "Für Einsteiger ins eigene Streaming",
    apps: ["Jellyfin", "Radarr", "Sonarr", "Prowlarr"], price: 14,
    perks: ["Fertig verkabelt & automatisiert", "Eine Medienzentrale, ein Login", "Günstiger als einzeln"],
    featured: false,
  },
  {
    name: "Productivity Stack", audience: "Für Selbstständige & kleine Teams",
    apps: ["Nextcloud", "Vaultwarden", "Paperless-ngx"], price: 18,
    perks: ["Dateien, Passwörter & papierloses Büro", "EU-Hosting, DSGVO-freundlich", "Geteilter Team-Zugang"],
    featured: true,
  },
  {
    name: "Automation Stack", audience: "Für Power-User & Maker",
    apps: ["n8n", "Flowise", "Open WebUI"], price: 22,
    perks: ["Workflows & eigene KI-Tools", "Ohne Setup-Hölle", "Skaliert mit dir mit"],
    featured: false,
  },
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
  { icon: Server, t: "Server einrichten" },
  { icon: Boxes, t: "Docker Compose pflegen" },
  { icon: Globe, t: "Ports, SSL & Reverse Proxy" },
  { icon: RefreshCw, t: "Updates nachziehen" },
  { icon: DatabaseBackup, t: "Backups & Restore" },
  { icon: AlertTriangle, t: "Ausfälle & Downtime" },
  { icon: Lock, t: "Sicherheitsrisiken" },
  { icon: Moon, t: "Debugging nachts & am Wochenende" },
];

const STEPS = [
  { n: "01", icon: Search, t: "App oder Stack wählen", d: "Stöbere im Store und wähle, was du brauchst." },
  { n: "02", icon: Boxes, t: "Account erstellen", d: "In Sekunden registriert — keine Kreditkarte nötig." },
  { n: "03", icon: Cpu, t: "MeinAppNest provisioniert", d: "Wir richten Instanz, SSL & Domain automatisch ein." },
  { n: "04", icon: Gauge, t: "Zugriff übers Dashboard", d: "Zugangsdaten erhalten, alles an einem Ort." },
  { n: "05", icon: Check, t: "Einfach nutzen", d: "Loslegen — wir kümmern uns um den Betrieb." },
];

const COMPARE = [
  { f: "Einrichtungszeit", self: "Stunden–Tage", vps: "Stunden", dyn: "< 60 Sekunden" },
  { f: "Wartung & Betrieb", self: "Du", vps: "Du", dyn: "MeinAppNest" },
  { f: "Updates", self: "Manuell", vps: "Manuell", dyn: "Automatisch" },
  { f: "Backups", self: "Selbst bauen", vps: "Selbst bauen", dyn: "Inklusive" },
  { f: "SSL / HTTPS", self: "Selbst konfigurieren", vps: "Selbst konfigurieren", dyn: "Automatisch" },
  { f: "Monitoring", self: "Selbst bauen", vps: "Optional", dyn: "Inklusive" },
  { f: "Nötiges Know-how", self: "Hoch", vps: "Mittel–Hoch", dyn: "Keins" },
];

const METRICS = [
  { v: "40+", l: "Apps & Tools" },
  { v: "< 60s", l: "Bereitstellung" },
  { v: "99,9 %", l: "Uptime-Ziel" },
  { v: "EU", l: "Hosting-Region" },
];

const FAQS = [
  { q: "Was ist MeinAppNest?", a: "MeinAppNest ist eine Plattform für fertig gehostete Self-Hosted-Apps. Du wählst eine App oder einen Stack, buchst sie und bekommst eine vollständig eingerichtete, sichere und aktuelle Instanz — ohne dich um Server, Docker, Updates oder Konfiguration kümmern zu müssen." },
  { q: "Brauche ich technische Kenntnisse?", a: "Nein. Wenn du eine Web-App im Browser bedienen kannst, kannst du MeinAppNest nutzen. Die gesamte Technik darunter — Server, Reverse Proxy, SSL, Updates — übernehmen wir." },
  { q: "Kann ich meine eigene Domain nutzen?", a: "Ja. Jede Instanz erhält automatisch eine eigene Subdomain mit HTTPS. Eine eigene Domain verbindest du in wenigen Klicks; wir richten das passende Zertifikat automatisch ein." },
  { q: "Wie schnell ist eine App bereit?", a: "In der Regel in unter 60 Sekunden. Nach der Buchung provisioniert MeinAppNest die Instanz automatisch und schickt dir die Zugangsdaten." },
  { q: "Was passiert bei Updates?", a: "Updates und Sicherheits-Patches spielen wir automatisch ein, schonend und getestet. Du musst nichts tun — und kannst bei größeren Versionssprüngen optional informiert werden." },
  { q: "Kann ich Apps kombinieren?", a: "Ja. Du kannst mehrere Apps einzeln buchen oder einen vorkonfigurierten Stack wählen, in dem die Apps bereits miteinander verbunden sind (z. B. Radarr + Prowlarr + Jellyfin)." },
  { q: "Gibt es Backups?", a: "Ja. Deine Daten werden regelmäßig und verschlüsselt gesichert. Im Notfall stellen wir wieder her — Backups sind in jedem Plan enthalten." },
  { q: "Kann ich später wechseln oder kündigen?", a: "Jederzeit. Du kannst Pläne upgraden, downgraden oder monatlich kündigen. Beim Kündigen kannst du deine Daten vorher exportieren." },
  { q: "Ist MeinAppNest legal?", a: "MeinAppNest stellt ausschließlich die Hosting-Infrastruktur und die Software bereit. Welche Inhalte du mit den Apps verarbeitest oder speicherst, liegt in deiner Verantwortung — wie bei jedem anderen Hosting-Anbieter." },
  { q: "Wofür bin ich als Nutzer selbst verantwortlich?", a: "Für deine Inhalte und Daten, deine Zugangsdaten und die rechtmäßige Nutzung der Apps. Wir kümmern uns um Betrieb, Updates, Infrastruktur-Sicherheit, Backups und Verfügbarkeit." },
];

const PRICING = [
  { name: "Single App", monthly: 4, yearly: 40, tagline: "Eine einzelne App, sofort startklar.", cta: "App wählen", features: ["1 gehostete App", "Eigene Subdomain + SSL", "Automatische Updates", "Tägliche Backups", "Community-Support"], featured: false },
  { name: "Stack", monthly: 14, yearly: 140, tagline: "Vorkonfigurierte App-Bundles für deinen Use-Case.", cta: "Stack buchen", features: ["3–4 verbundene Apps", "Alles aus Single App", "Priorisiertes Monitoring", "Eigene Domain möglich", "E-Mail-Support"], featured: true },
  { name: "Pro / Team", monthly: 39, yearly: 390, tagline: "Mehr Leistung, Team-Zugang & Skalierung.", cta: "Pro starten", features: ["Mehrere Stacks & Apps", "Team-Mitglieder & Rollen", "Erhöhte Ressourcen", "Erweiterte Backups", "Prioritäts-Support"], featured: false },
];

/* ------------------------------------------------------------------ */
/* Composite components                                                */
/* ------------------------------------------------------------------ */

/** Cursor-aware glow card used for App & Feature cards. */
function GlowCard({ children, style, className = "", featured = false }) {
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
      className={`relative overflow-hidden rounded-2xl p-5 ${className}`}
      style={{
        ...cardStyle(),
        border: `1px solid ${featured ? C.borderGlow : C.borderDefault}`,
        boxShadow: featured ? "0 0 0 1px rgba(34,211,238,0.25), 0 12px 50px rgba(34,211,238,0.10)" : "0 8px 24px rgba(0,0,0,0.45)",
        ...style,
      }}
    >
      <div
        className="pointer-events-none absolute inset-0 transition-opacity duration-300"
        style={{
          opacity: glow.on ? 1 : 0,
          background: `radial-gradient(420px circle at ${glow.x}% ${glow.y}%, rgba(34,211,238,0.10), transparent 45%)`,
        }}
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
        <div
          className="flex h-11 w-11 items-center justify-center rounded-xl"
          style={{ background: C.surface3, border: `1px solid ${C.borderSubtle}` }}
        >
          <Icon size={20} style={{ color: C.accent }} />
        </div>
        {app.status ? (
          <Badge tone={app.status === "Beliebt" ? "accent" : "live"}>{app.status}</Badge>
        ) : (
          <Badge tone="live">Live</Badge>
        )}
      </div>
      <h3 className="text-base font-semibold" style={{ color: C.textPrimary }}>{app.name}</h3>
      <div className="mb-2 text-xs" style={{ color: C.textMuted }}>{app.cat}</div>
      <p className="mb-4 text-sm" style={{ color: C.textSecondary, lineHeight: 1.55 }}>{app.desc}</p>
      <div className="mb-4 flex flex-wrap gap-1.5">
        {app.tags.map((t) => (
          <span key={t} className="rounded-md px-2 py-0.5 text-[11px]" style={{ background: "rgba(255,255,255,0.05)", color: C.textMuted }}>{t}</span>
        ))}
      </div>
      <div className="mt-auto flex items-center justify-between border-t pt-4" style={{ borderColor: C.borderSubtle }}>
        <div>
          <span className="text-xs" style={{ color: C.textMuted }}>ab </span>
          <span className="font-mono text-lg font-semibold" style={{ color: C.textPrimary }}>{app.price} €</span>
          <span className="text-xs" style={{ color: C.textMuted }}>/Mon.</span>
        </div>
        <button className="group inline-flex items-center gap-1 text-sm font-semibold" style={{ color: C.accent }}>
          Buchen <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
        </button>
      </div>
      {app.note && (
        <div className="mt-3 flex items-center gap-1.5 text-[11px]" style={{ color: C.textMuted }}>
          <Layers size={12} /> {app.note}
        </div>
      )}
    </GlowCard>
  );
}

function FAQItem({ item, open, onToggle }) {
  return (
    <div className="rounded-xl" style={{ background: C.surface1, border: `1px solid ${C.borderDefault}` }}>
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
      >
        <span className="text-sm font-medium sm:text-base" style={{ color: C.textPrimary }}>{item.q}</span>
        <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown size={18} style={{ color: open ? C.accent : C.textMuted }} />
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: easeOut }}
            style={{ overflow: "hidden" }}
          >
            <p className="px-5 pb-5 text-sm" style={{ color: C.textSecondary, lineHeight: 1.6 }}>{item.a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Hero visual: App-Orbit + provisioning terminal                      */
/* ------------------------------------------------------------------ */
function HeroVisual() {
  const orbit = [
    { icon: Play, a: 0 }, { icon: Cloud, a: 60 }, { icon: Lock, a: 120 },
    { icon: Zap, a: 180 }, { icon: Activity, a: 240 }, { icon: Boxes, a: 300 },
  ];
  return (
    <div className="relative mx-auto aspect-square w-full max-w-md">
      {/* ambient glow */}
      <div className="absolute inset-0" style={{ background: "radial-gradient(circle at 50% 45%, rgba(34,211,238,0.18), transparent 60%)" }} />
      {/* orbit rings */}
      {[1, 0.66, 0.36].map((s, i) => (
        <div key={i} className="absolute rounded-full" style={{
          inset: `${(1 - s) * 50}%`, border: `1px solid ${C.borderSubtle}`,
        }} />
      ))}
      {/* rotating orbit nodes */}
      <motion.div
        className="absolute inset-0"
        animate={{ rotate: 360 }}
        transition={{ duration: 48, repeat: Infinity, ease: "linear" }}
      >
        {orbit.map(({ icon: Icon, a }, i) => {
          const rad = (a * Math.PI) / 180;
          const R = 42; // % radius
          const x = 50 + R * Math.cos(rad);
          const y = 50 + R * Math.sin(rad);
          return (
            <motion.div
              key={i}
              className="absolute flex h-12 w-12 items-center justify-center rounded-2xl"
              style={{
                left: `${x}%`, top: `${y}%`, transform: "translate(-50%,-50%)",
                background: C.surface2, border: `1px solid ${C.borderDefault}`,
                boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
              }}
              animate={{ rotate: -360 }}
              transition={{ duration: 48, repeat: Infinity, ease: "linear" }}
            >
              <Icon size={20} style={{ color: C.accent }} />
              <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full" style={{ background: C.live, boxShadow: `0 0 8px ${C.live}` }} />
            </motion.div>
          );
        })}
      </motion.div>
      {/* center cloud */}
      <div className="absolute left-1/2 top-1/2 flex h-20 w-20 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-3xl"
        style={{ background: C.gradient, boxShadow: "0 0 40px rgba(34,211,238,0.45)" }}>
        <Cloud size={34} style={{ color: C.onAccent }} />
      </div>
      {/* provisioning terminal */}
      <div className="absolute -bottom-6 left-1/2 w-[92%] -translate-x-1/2 rounded-xl p-3 font-mono text-[11px]"
        style={{ background: "rgba(12,16,20,0.85)", border: `1px solid ${C.borderDefault}`, backdropFilter: "blur(12px)", color: C.textSecondary }}>
        <div className="mb-2 flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full" style={{ background: "#FF5F57" }} />
          <span className="h-2.5 w-2.5 rounded-full" style={{ background: "#FEBC2E" }} />
          <span className="h-2.5 w-2.5 rounded-full" style={{ background: "#28C840" }} />
          <span className="ml-2" style={{ color: C.textMuted }}>provisioning</span>
        </div>
        {[
          "→ pull image …", "→ configure instance …", "→ issue SSL cert …",
        ].map((l, i) => (
          <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 + i * 0.5 }}>
            <span style={{ color: C.textMuted }}>{l}</span>
          </motion.div>
        ))}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.2 }}>
          <span style={{ color: C.live }}>✓ live · https://dein-app.dynstore.io</span>
        </motion.div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */
export default function MeinAppNestLanding() {
  const [cat, setCat] = useState("Alle");
  const [query, setQuery] = useState("");
  const [yearly, setYearly] = useState(false);
  const [openFaq, setOpenFaq] = useState(0);

  const apps = useMemo(() => {
    return APPS.filter((a) => (cat === "Alle" || a.cat === cat))
      .filter((a) => a.name.toLowerCase().includes(query.toLowerCase()) || a.tags.join(" ").toLowerCase().includes(query.toLowerCase()));
  }, [cat, query]);

  const nav = [
    ["Apps", "#apps"], ["Bundles", "#bundles"], ["Preise", "#pricing"],
    ["Features", "#features"], ["Docs", "#faq"],
  ];

  return (
    <div style={{ background: C.bg, color: C.textPrimary, minHeight: "100vh" }}>
      {/* ambient top glow */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[600px]" style={{ background: "radial-gradient(900px circle at 70% -10%, rgba(34,211,238,0.10), transparent 60%)" }} />

      {/* ---------------- Navigation ---------------- */}
      <header className="sticky top-0 z-50">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4"
          style={{ background: "rgba(7,9,12,0.6)", backdropFilter: "blur(16px)", borderBottom: `1px solid ${C.borderSubtle}` }}>
          <div className="flex items-center gap-2 font-semibold">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ background: C.gradient }}>
              <Layers size={18} style={{ color: C.onAccent }} />
            </span>
            MeinAppNest
          </div>
          <nav className="hidden items-center gap-7 text-sm md:flex" style={{ color: C.textSecondary }}>
            {nav.map(([t, h]) => (
              <a key={t} href={h} className="transition-colors hover:text-white">{t}</a>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <a href="#" className="hidden text-sm font-medium sm:block" style={{ color: C.textSecondary }}>Anmelden</a>
            <PrimaryButton className="!px-4 !py-2 text-xs">App starten</PrimaryButton>
          </div>
        </div>
      </header>

      {/* ---------------- Hero ---------------- */}
      <section className="relative mx-auto grid max-w-6xl items-center gap-12 px-6 pb-10 pt-16 sm:pt-24 lg:grid-cols-2">
        <motion.div variants={stagger} initial="hidden" animate="show">
          <motion.div variants={fadeUp}><Eyebrow>Managed App Hosting für Power-User, Teams &amp; Creator</Eyebrow></motion.div>
          <motion.h1 variants={fadeUp} className="mt-5 text-4xl font-semibold sm:text-6xl"
            style={{ letterSpacing: "-0.03em", lineHeight: 1.05 }}>
            Self-hosted Power.<br />
            <span style={{ background: C.gradient, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>
              Ohne den Self-hosting Stress.
            </span>
          </motion.h1>
          <motion.p variants={fadeUp} className="mt-6 max-w-xl text-base sm:text-lg" style={{ color: C.textSecondary, lineHeight: 1.6 }}>
            Plex, Jellyfin, Nextcloud, n8n und 40+ weitere Tools — fertig gehostet und in
            unter 60 Sekunden startklar. Keine Server, kein Docker, keine Updates. Du wählst
            die App, wir kümmern uns um den Rest.
          </motion.p>
          <motion.div variants={fadeUp} className="mt-8 flex flex-wrap gap-3">
            <PrimaryButton>App in 60 Sek. starten</PrimaryButton>
            <SecondaryButton>App-Store ansehen</SecondaryButton>
          </motion.div>
          <motion.div variants={fadeUp} className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs" style={{ color: C.textMuted }}>
            {["Keine Kreditkarte nötig", "14 Tage testen", "SSL & Backups inklusive", "EU-Hosting"].map((t) => (
              <span key={t} className="inline-flex items-center gap-1.5"><Check size={13} style={{ color: C.live }} /> {t}</span>
            ))}
          </motion.div>
        </motion.div>
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.7, ease: easeOut }} className="pb-8">
          <HeroVisual />
        </motion.div>
      </section>

      {/* ---------------- Trust / Metrics ---------------- */}
      <div className="mx-auto max-w-6xl px-6 py-8">
        <Reveal variants={stagger}>
          <div className="grid grid-cols-2 gap-4 rounded-2xl p-6 sm:grid-cols-4" style={{ background: C.surface1, border: `1px solid ${C.borderSubtle}` }}>
            {METRICS.map((m) => (
              <motion.div key={m.l} variants={fadeUp} className="text-center">
                <div className="font-mono text-2xl font-semibold sm:text-3xl" style={{ color: C.textPrimary }}>{m.v}</div>
                <div className="mt-1 text-xs" style={{ color: C.textMuted }}>{m.l}</div>
              </motion.div>
            ))}
          </div>
        </Reveal>
      </div>

      {/* ---------------- Problem ---------------- */}
      <Section
        eyebrow={<Eyebrow>Das Problem</Eyebrow>}
        title="Self-Hosting ist mächtig — und ein Vollzeitjob."
        subtitle="Die Tools sind großartig. Der Betrieb drumherum frisst Abende, Wochenenden und Nerven."
      >
        <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-80px" }}
          className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {PROBLEMS.map((p) => {
            const Icon = p.icon;
            return (
              <motion.div key={p.t} variants={fadeUp} className="rounded-xl p-4" style={{ background: C.surface1, border: `1px solid ${C.borderSubtle}` }}>
                <Icon size={20} style={{ color: C.textMuted }} />
                <div className="mt-3 text-sm" style={{ color: C.textSecondary }}>{p.t}</div>
              </motion.div>
            );
          })}
        </motion.div>
      </Section>

      {/* ---------------- Solution / How it works ---------------- */}
      <Section
        id="how"
        eyebrow={<Eyebrow>Die Lösung</Eyebrow>}
        title="Dieselben Tools. Ohne den Betrieb."
        subtitle="In wenigen Schritten von der Auswahl zur laufenden App — den Rest übernimmt MeinAppNest."
      >
        <div className="relative grid gap-4 sm:grid-cols-3 lg:grid-cols-5">
          <div className="absolute left-0 right-0 top-7 hidden h-px lg:block" style={{ background: C.borderSubtle }} />
          {STEPS.map((s) => {
            const Icon = s.icon;
            return (
              <Reveal key={s.n} className="relative">
                <div className="rounded-2xl p-5" style={{ background: C.surface1, border: `1px solid ${C.borderDefault}` }}>
                  <div className="mb-3 flex items-center justify-between">
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg" style={{ background: C.accentSoft }}>
                      <Icon size={18} style={{ color: C.accent }} />
                    </span>
                    <span className="font-mono text-xs" style={{ color: C.textMuted }}>{s.n}</span>
                  </div>
                  <div className="text-sm font-semibold" style={{ color: C.textPrimary }}>{s.t}</div>
                  <div className="mt-1 text-xs" style={{ color: C.textSecondary, lineHeight: 1.5 }}>{s.d}</div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </Section>

      {/* ---------------- App Store Grid ---------------- */}
      <Section
        id="apps"
        eyebrow={<Eyebrow>App-Store</Eyebrow>}
        title="Wähle aus 40+ fertig gehosteten Apps."
        subtitle="Ein App Store für Self-Hosted Tools — gebucht, gestartet, genutzt."
      >
        {/* Search + filter */}
        <div className="mb-6 flex flex-col gap-4">
          <div className="relative">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: C.textMuted }} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="App suchen … (z. B. Plex, n8n)"
              className="w-full rounded-xl py-3 pl-11 pr-4 text-sm outline-none"
              style={{ background: C.surface3, border: `1px solid ${C.borderDefault}`, color: C.textPrimary }}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cName) => {
              const active = cat === cName;
              return (
                <button
                  key={cName}
                  onClick={() => setCat(cName)}
                  className="rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors"
                  style={{
                    background: active ? C.accentSoft : "rgba(255,255,255,0.03)",
                    color: active ? C.accent : C.textSecondary,
                    border: `1px solid ${active ? C.borderGlow : C.borderSubtle}`,
                  }}
                >
                  {cName}
                </button>
              );
            })}
          </div>
        </div>

        {/* Grid */}
        <motion.div layout variants={stagger} initial="hidden" animate="show"
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <AnimatePresence mode="popLayout">
            {apps.map((app) => (
              <motion.div key={app.name} layout initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }} transition={{ duration: 0.25, ease: easeOut }}>
                <AppCard app={app} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
        {apps.length === 0 && (
          <div className="py-12 text-center text-sm" style={{ color: C.textMuted }}>Keine Treffer — versuch eine andere Kategorie oder Suche.</div>
        )}
      </Section>

      {/* ---------------- Bundles ---------------- */}
      <Section
        id="bundles"
        eyebrow={<Eyebrow>Bundles &amp; Stacks</Eyebrow>}
        title="Fertige Stacks für deinen Use-Case."
        subtitle="Vorkonfiguriert, verbunden und überwacht — günstiger als die Summe der Einzel-Apps."
      >
        <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-80px" }}
          className="grid gap-5 lg:grid-cols-3">
          {BUNDLES.map((b) => (
            <GlowCard key={b.name} featured={b.featured} className="flex flex-col">
              {b.featured && <div className="mb-3"><Badge tone="accent">Beliebt</Badge></div>}
              <h3 className="text-lg font-semibold" style={{ color: C.textPrimary }}>{b.name}</h3>
              <p className="mt-1 text-xs" style={{ color: C.textMuted }}>{b.audience}</p>
              <div className="mt-4 flex flex-wrap gap-1.5">
                {b.apps.map((a) => (
                  <span key={a} className="rounded-md px-2 py-1 text-[11px]" style={{ background: C.surface3, color: C.textSecondary, border: `1px solid ${C.borderSubtle}` }}>{a}</span>
                ))}
              </div>
              <ul className="mt-4 space-y-2">
                {b.perks.map((p) => (
                  <li key={p} className="flex items-start gap-2 text-sm" style={{ color: C.textSecondary }}>
                    <Check size={15} style={{ color: C.live, marginTop: 2 }} /> {p}
                  </li>
                ))}
              </ul>
              <div className="mt-5 flex items-end justify-between border-t pt-4" style={{ borderColor: C.borderSubtle }}>
                <div>
                  <span className="text-xs" style={{ color: C.textMuted }}>ab </span>
                  <span className="font-mono text-2xl font-semibold" style={{ color: C.textPrimary }}>{b.price} €</span>
                  <span className="text-xs" style={{ color: C.textMuted }}>/Mon.</span>
                </div>
              </div>
              <div className="mt-4">
                {b.featured ? <PrimaryButton className="w-full">Stack buchen</PrimaryButton> : <SecondaryButton className="w-full">Stack buchen</SecondaryButton>}
              </div>
            </GlowCard>
          ))}
        </motion.div>
      </Section>

      {/* ---------------- Features (bento) ---------------- */}
      <Section
        id="features"
        eyebrow={<Eyebrow>Features</Eyebrow>}
        title="Alles inklusive, worüber du sonst nachts grübelst."
        subtitle="Betrieb, Sicherheit und Wartung — übernommen, damit du nur noch nutzt."
      >
        <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-80px" }}
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => {
            const Icon = f.icon;
            return (
              <GlowCard key={f.title} className={f.big ? "sm:col-span-2 lg:col-span-1" : ""}>
                <span className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: C.accentSoft }}>
                  <Icon size={20} style={{ color: C.accent }} />
                </span>
                <h3 className="mt-4 text-base font-semibold" style={{ color: C.textPrimary }}>{f.title}</h3>
                <p className="mt-1.5 text-sm" style={{ color: C.textSecondary, lineHeight: 1.55 }}>{f.desc}</p>
              </GlowCard>
            );
          })}
        </motion.div>
      </Section>

      {/* ---------------- Comparison ---------------- */}
      <Section
        eyebrow={<Eyebrow>Vergleich</Eyebrow>}
        title="Warum MeinAppNest statt Server selbst betreiben?"
        subtitle="Dieselben Apps — aber ohne die Arbeit drumherum."
      >
        <Reveal className="overflow-x-auto">
          <div className="min-w-[640px] overflow-hidden rounded-2xl" style={{ border: `1px solid ${C.borderDefault}` }}>
            <div className="grid grid-cols-4 text-sm font-semibold" style={{ background: C.surface2 }}>
              <div className="p-4" style={{ color: C.textMuted }}>Merkmal</div>
              <div className="p-4 text-center" style={{ color: C.textSecondary }}>Selbst hosten</div>
              <div className="p-4 text-center" style={{ color: C.textSecondary }}>Klassischer VPS</div>
              <div className="p-4 text-center" style={{ color: C.accent, background: C.accentSoft }}>MeinAppNest</div>
            </div>
            {COMPARE.map((row, i) => (
              <div key={row.f} className="grid grid-cols-4 text-sm" style={{ background: i % 2 ? "rgba(255,255,255,0.015)" : "transparent", borderTop: `1px solid ${C.borderSubtle}` }}>
                <div className="p-4" style={{ color: C.textPrimary }}>{row.f}</div>
                <div className="p-4 text-center" style={{ color: C.textMuted }}>{row.self}</div>
                <div className="p-4 text-center" style={{ color: C.textMuted }}>{row.vps}</div>
                <div className="flex items-center justify-center gap-1.5 p-4 font-medium" style={{ color: C.textPrimary, background: C.accentSoft }}>
                  <Check size={15} style={{ color: C.accent }} /> {row.dyn}
                </div>
              </div>
            ))}
          </div>
        </Reveal>
      </Section>

      {/* ---------------- Pricing ---------------- */}
      <Section
        id="pricing"
        center
        eyebrow={<Eyebrow>Preise</Eyebrow>}
        title="Transparente Preise. Keine Überraschungen."
        subtitle="Beispielpreise — flexibel monatlich oder jährlich. 14 Tage testen, jederzeit kündbar."
      >
        {/* toggle */}
        <div className="mb-8 flex items-center justify-center gap-3 text-sm">
          <span style={{ color: !yearly ? C.textPrimary : C.textMuted }}>Monatlich</span>
          <button
            onClick={() => setYearly((y) => !y)}
            className="relative h-7 w-12 rounded-full transition-colors"
            style={{ background: yearly ? C.accentStrong : C.surface3, border: `1px solid ${C.borderDefault}` }}
          >
            <motion.span className="absolute top-1 h-5 w-5 rounded-full" style={{ background: "#fff" }}
              animate={{ left: yearly ? 24 : 4 }} transition={{ duration: 0.2, ease: easeOut }} />
          </button>
          <span style={{ color: yearly ? C.textPrimary : C.textMuted }}>
            Jährlich <span style={{ color: C.live }}>· 2 Monate gratis</span>
          </span>
        </div>

        <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-80px" }}
          className="grid gap-5 text-left lg:grid-cols-3">
          {PRICING.map((p) => (
            <motion.div key={p.name} variants={fadeUp} whileHover={{ y: -4 }} transition={{ duration: 0.2, ease: easeOut }}
              className="relative flex flex-col rounded-2xl p-6"
              style={{
                background: C.surface1,
                border: `1px solid ${p.featured ? C.borderGlow : C.borderDefault}`,
                boxShadow: p.featured ? "0 0 0 1px rgba(34,211,238,0.25), 0 16px 50px rgba(34,211,238,0.10)" : "0 8px 24px rgba(0,0,0,0.4)",
              }}>
              {p.featured && <div className="absolute -top-3 left-6"><Badge tone="accent">Empfohlen</Badge></div>}
              <h3 className="text-base font-semibold" style={{ color: C.textPrimary }}>{p.name}</h3>
              <p className="mt-1 text-xs" style={{ color: C.textMuted, lineHeight: 1.5 }}>{p.tagline}</p>
              <div className="mt-5 flex items-baseline gap-1">
                <span className="font-mono text-4xl font-semibold" style={{ color: C.textPrimary }}>
                  {yearly ? Math.round(p.yearly / 12) : p.monthly} €
                </span>
                <span className="text-sm" style={{ color: C.textMuted }}>/Mon.</span>
              </div>
              <div className="mt-1 text-xs" style={{ color: C.textMuted }}>
                {yearly ? `${p.yearly} € jährlich abgerechnet` : "monatlich abgerechnet"}
              </div>
              <ul className="mt-5 space-y-2.5">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm" style={{ color: C.textSecondary }}>
                    <Check size={15} style={{ color: C.accent, marginTop: 2 }} /> {f}
                  </li>
                ))}
              </ul>
              <div className="mt-6">
                {p.featured ? <PrimaryButton className="w-full">{p.cta}</PrimaryButton> : <SecondaryButton className="w-full">{p.cta}</SecondaryButton>}
              </div>
            </motion.div>
          ))}
        </motion.div>
        <p className="mt-6 text-center text-xs" style={{ color: C.textMuted }}>
          Add-ons (mehr Speicher, Leistung, eigene Domain) flexibel zubuchbar · Ressourcen transparent ausgewiesen
        </p>
      </Section>

      {/* ---------------- Security ---------------- */}
      <Section
        eyebrow={<Eyebrow>Sicherheit &amp; Vertrauen</Eyebrow>}
        title="Saubere Infrastruktur. Keine Magie."
        subtitle="Klar getrennte Verantwortlichkeiten — wir betreiben sicher, du nutzt sorgenfrei."
      >
        <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-80px" }}
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: ShieldCheck, t: "Isolierte Instanzen", d: "Jede App in eigener, abgeschotteter Umgebung." },
            { icon: Lock, t: "Verschlüsselte Verbindungen", d: "SSL/TLS automatisch für jede Instanz." },
            { icon: DatabaseBackup, t: "Automatische Backups", d: "Regelmäßig, verschlüsselt, wiederherstellbar." },
            { icon: Activity, t: "Monitoring & Status", d: "Wir bemerken Probleme, bevor du sie merkst." },
          ].map((s) => {
            const Icon = s.icon;
            return (
              <motion.div key={s.t} variants={fadeUp} className="rounded-2xl p-5" style={{ background: C.surface1, border: `1px solid ${C.borderDefault}` }}>
                <Icon size={22} style={{ color: C.accent }} />
                <h3 className="mt-3 text-sm font-semibold" style={{ color: C.textPrimary }}>{s.t}</h3>
                <p className="mt-1 text-xs" style={{ color: C.textSecondary, lineHeight: 1.5 }}>{s.d}</p>
              </motion.div>
            );
          })}
        </motion.div>
      </Section>

      {/* ---------------- FAQ ---------------- */}
      <Section
        id="faq"
        center
        eyebrow={<Eyebrow>FAQ</Eyebrow>}
        title="Häufige Fragen"
      >
        <div className="mx-auto max-w-3xl space-y-3 text-left">
          {FAQS.map((item, i) => (
            <FAQItem key={item.q} item={item} open={openFaq === i} onToggle={() => setOpenFaq(openFaq === i ? -1 : i)} />
          ))}
        </div>
      </Section>

      {/* ---------------- Final CTA ---------------- */}
      <Section center>
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl px-6 py-16 text-center"
            style={{ background: C.surface1, border: `1px solid ${C.borderDefault}` }}>
            <div className="pointer-events-none absolute inset-0" style={{ background: "radial-gradient(600px circle at 50% 0%, rgba(34,211,238,0.16), transparent 60%)" }} />
            <div className="relative">
              <h2 className="mx-auto max-w-2xl text-3xl font-semibold sm:text-4xl" style={{ letterSpacing: "-0.02em", lineHeight: 1.1 }}>
                Starte deine erste App in unter einer Minute.
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-base" style={{ color: C.textSecondary, lineHeight: 1.6 }}>
                Keine Server. Kein Docker. Keine Update-Nächte. Nur deine Tools — sofort einsatzbereit.
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <PrimaryButton>Jetzt kostenlos starten</PrimaryButton>
                <SecondaryButton>Erst den App-Store ansehen</SecondaryButton>
              </div>
            </div>
          </div>
        </Reveal>
      </Section>

      {/* ---------------- Footer ---------------- */}
      <footer className="border-t" style={{ borderColor: C.borderSubtle }}>
        <div className="mx-auto max-w-6xl px-6 py-12">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-5">
            <div className="lg:col-span-2">
              <div className="flex items-center gap-2 font-semibold">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ background: C.gradient }}>
                  <Layers size={18} style={{ color: C.onAccent }} />
                </span>
                MeinAppNest
              </div>
              <p className="mt-3 max-w-xs text-sm" style={{ color: C.textSecondary }}>
                Deine Lieblings-Apps. Fertig gehostet.<br />Tools starten statt Server warten.
              </p>
              <div className="mt-4 inline-flex items-center gap-2 text-xs" style={{ color: C.textMuted }}>
                <span className="inline-block h-2 w-2 rounded-full" style={{ background: C.live, boxShadow: `0 0 8px ${C.live}` }} />
                Alle Systeme betriebsbereit
              </div>
            </div>
            {[
              ["Produkt", ["Apps", "Bundles", "Preise", "Features"]],
              ["Ressourcen", ["Docs", "Status", "Changelog", "Support"]],
              ["Rechtliches", ["Impressum", "Datenschutz", "AGB"]],
            ].map(([h, items]) => (
              <div key={h}>
                <div className="text-sm font-semibold" style={{ color: C.textPrimary }}>{h}</div>
                <ul className="mt-3 space-y-2 text-sm" style={{ color: C.textSecondary }}>
                  {items.map((it) => (
                    <li key={it}><a href="#" className="transition-colors hover:text-white">{it}</a></li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t pt-6 text-xs sm:flex-row" style={{ borderColor: C.borderSubtle, color: C.textMuted }}>
            <span>© {new Date().getFullYear()} MeinAppNest. Alle Rechte vorbehalten.</span>
            <span>Made for Power-User, Teams &amp; Creator · EU-Hosting</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
