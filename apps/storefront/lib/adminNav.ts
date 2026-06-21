export interface AdminNavEntry {
  href: string;
  icon: string;
  label: string;
  exact?: boolean;
}

/** Untermenü des Admin-Bereichs ("Admin Menu"). */
export const ADMIN_NAV: AdminNavEntry[] = [
  { href: "/dashboard/admin", icon: "📊", label: "Übersicht", exact: true },
  { href: "/dashboard/admin/servers", icon: "🖥️", label: "Server" },
  { href: "/dashboard/admin/customers", icon: "👥", label: "Kunden" },
  { href: "/dashboard/admin/billing", icon: "💶", label: "Abos & Umsatz" },
  { href: "/dashboard/admin/jobs", icon: "⚙️", label: "Jobs" },
  { href: "/dashboard/admin/backups", icon: "💾", label: "Backups" },
  { href: "/dashboard/admin/cluster", icon: "🩺", label: "Cluster" },
  { href: "/dashboard/admin/catalog", icon: "🧩", label: "Katalog" },
  { href: "/dashboard/admin/events", icon: "🔌", label: "Stripe-Events" },
  { href: "/dashboard/admin/audit", icon: "📜", label: "Audit-Log" },
  { href: "/dashboard/admin/broadcast", icon: "📣", label: "Broadcast" },
  { href: "/dashboard/admin/settings", icon: "🛠️", label: "Einstellungen" },
];
