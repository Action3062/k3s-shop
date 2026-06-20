import type { ServiceInstance } from "./types";

export type InstanceStatus =
  | "PENDING" | "PROVISIONING" | "RUNNING" | "SUSPENDED"
  | "DEPROVISIONING" | "DEPROVISIONED" | "FAILED";
export type SubscriptionStatus =
  | "INCOMPLETE" | "ACTIVE" | "PAST_DUE" | "SUSPENDED" | "CANCELED";

export type Tone = "ok" | "warn" | "danger" | "info" | "muted";

export const INSTANCE_STATUS: Record<InstanceStatus, { label: string; color: string; tone: Tone; pulse?: boolean }> = {
  RUNNING:        { label: "Aktiv",             color: "#34D399", tone: "ok" },
  PROVISIONING:   { label: "Wird eingerichtet", color: "#22D3EE", tone: "info", pulse: true },
  PENDING:        { label: "In Vorbereitung",   color: "#9DB0BE", tone: "muted" },
  SUSPENDED:      { label: "Pausiert",          color: "#FBBF24", tone: "warn" },
  DEPROVISIONING: { label: "Wird entfernt",     color: "#9DB0BE", tone: "muted", pulse: true },
  DEPROVISIONED:  { label: "Beendet",           color: "#65788A", tone: "muted" },
  FAILED:         { label: "Störung",           color: "#FB7185", tone: "danger" },
};

export const SUBSCRIPTION_STATUS: Record<SubscriptionStatus, { label: string; color: string }> = {
  ACTIVE:     { label: "Aktiv",             color: "#34D399" },
  INCOMPLETE: { label: "Einrichtung offen", color: "#9DB0BE" },
  PAST_DUE:   { label: "Zahlung offen",     color: "#FBBF24" },
  SUSPENDED:  { label: "Pausiert",          color: "#FBBF24" },
  CANCELED:   { label: "Gekündigt",         color: "#65788A" },
};

export function instanceMeta(status: string) {
  return INSTANCE_STATUS[status as InstanceStatus] ?? INSTANCE_STATUS.PENDING;
}

export interface DashboardStats { total: number; active: number; attention: number; setting: number; }
export function computeStats(services: ServiceInstance[]): DashboardStats {
  return {
    total: services.length,
    active: services.filter((s) => s.status === "RUNNING").length,
    attention: services.filter((s) => s.status === "FAILED" || s.status === "SUSPENDED").length,
    setting: services.filter((s) => s.status === "PROVISIONING" || s.status === "PENDING").length,
  };
}

export interface AttentionEntry { icon: string; title: string; desc: string; tone: Tone; href: string; }
export function attentionItems(services: ServiceInstance[]): AttentionEntry[] {
  const out: AttentionEntry[] = [];
  for (const s of services) {
    if (s.status === "FAILED")
      out.push({ icon: "⚠", title: `Störung bei ${s.name}`, desc: "Der Dienst läuft nicht. Wir prüfen das automatisch — bei Bedarf Support kontaktieren.", tone: "danger", href: `/dashboard/apps/${s.id}` });
    else if (s.status === "SUSPENDED")
      out.push({ icon: "⏸", title: `${s.name} ist pausiert`, desc: "Oft wegen einer offenen Zahlung. Prüfe deine Abrechnung.", tone: "warn", href: "/dashboard/billing" });
    else if (s.status === "PROVISIONING" || s.status === "PENDING")
      out.push({ icon: "⏳", title: `${s.name} wird eingerichtet`, desc: "Das dauert meist 1–2 Minuten — du musst nichts tun.", tone: "info", href: `/dashboard/apps/${s.id}` });
  }
  return out;
}

export interface NotificationEntry { icon: string; title: string; time: string; unread: boolean; tone: Tone; }
export function deriveNotifications(services: ServiceInstance[]): NotificationEntry[] {
  const out: NotificationEntry[] = [];
  for (const s of services) {
    if (s.status === "FAILED") out.push({ icon: "⚠", title: `Störung bei ${s.name}`, time: relativeTime(s.createdAt), unread: true, tone: "danger" });
    else if (s.status === "PROVISIONING") out.push({ icon: "⏳", title: `${s.name} wird eingerichtet`, time: relativeTime(s.createdAt), unread: true, tone: "info" });
    else if (s.status === "SUSPENDED") out.push({ icon: "⏸", title: `${s.name} pausiert`, time: relativeTime(s.suspendedAt ?? s.createdAt), unread: false, tone: "warn" });
    if (s.lastBackupAt) out.push({ icon: "✓", title: `Backup für ${s.name} erstellt`, time: relativeTime(s.lastBackupAt), unread: false, tone: "ok" });
  }
  return out.slice(0, 12);
}

export function euro(cents: number): string {
  return (cents / 100).toLocaleString("de-DE", { style: "currency", currency: "EUR" });
}
export function formatDate(iso?: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  return isNaN(d.getTime()) ? "—" : d.toLocaleDateString("de-DE", { day: "2-digit", month: "long", year: "numeric" });
}
export function relativeTime(iso?: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  const hours = Math.floor((Date.now() - d.getTime()) / 3.6e6);
  if (hours < 1) return "gerade eben";
  if (hours < 24) return `vor ${hours} Std.`;
  return `vor ${Math.floor(hours / 24)} Tag(en)`;
}
