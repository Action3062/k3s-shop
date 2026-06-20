"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { logout } from "@/app/actions";

type NavEntry = { href: string; icon: string; label: string; exact?: boolean; badge?: number; admin?: boolean };

const NAV: NavEntry[] = [
  { href: "/dashboard",               icon: "🏠", label: "Übersicht", exact: true },
  { href: "/dashboard/apps",          icon: "🧩", label: "Meine Software" },
  { href: "/dashboard/billing",       icon: "🧾", label: "Abrechnung" },
  { href: "/dashboard/support",       icon: "💬", label: "Support" },
  { href: "/dashboard/notifications", icon: "🔔", label: "Benachrichtigungen" },
  { href: "/dashboard/settings",      icon: "⚙️", label: "Einstellungen" },
];

export function DashboardShell({ children, user, isAdmin, unread = 0 }: {
  children: ReactNode;
  user: { name?: string | null; email?: string | null };
  isAdmin: boolean;
  unread?: number;
}) {
  const path = usePathname() ?? "";
  const active = (e: NavEntry) => (e.exact ? path === e.href : path.startsWith(e.href));
  const items = NAV.map((e) => (e.href === "/dashboard/notifications" ? { ...e, badge: unread || undefined } : e));

  return (
    <div className="min-h-screen md:grid md:grid-cols-[248px_1fr]">
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col sticky top-0 h-screen bg-bg2 border-r border-line">
        <Link href="/dashboard" className="flex items-center gap-2.5 px-[18px] py-5 border-b border-line">
          <span className="h-[30px] w-[30px] rounded-[9px] grid place-items-center font-extrabold text-[15px]" style={{ background: "linear-gradient(135deg,#22d3ee,#06b6d4)", color: "#04181C" }}>M</span>
          <b className="text-[15px] lg:inline hidden">MeinAppNest</b>
        </Link>
        <nav className="flex flex-col gap-0.5 p-2.5 flex-1">
          {items.map((e) => (
            <Link key={e.href} href={e.href} className={`relative flex items-center gap-3 px-3 py-2.5 rounded-[11px] text-[14.5px] font-medium transition ${active(e) ? "bg-accent/10 text-accent-ink" : "text-muted hover:bg-surface hover:text-ink"}`}>
              {active(e) && <span className="absolute -left-2.5 top-2 bottom-2 w-[3px] rounded bg-accent" />}
              <span className="w-[18px] text-center" aria-hidden>{e.icon}</span>
              <span className="lg:inline hidden">{e.label}</span>
              {e.badge ? <span className="ml-auto text-[11px] font-bold h-[18px] min-w-[18px] px-1.5 grid place-items-center rounded-[9px]" style={{ background: "#FB7185", color: "#1A0A0D" }}>{e.badge}</span> : null}
            </Link>
          ))}
          {isAdmin && (
            <Link href="/dashboard/admin" className={`relative flex items-center gap-3 px-3 py-2.5 mt-2 pt-3 border-t border-line rounded-[11px] text-[14.5px] font-medium transition ${path.startsWith("/dashboard/admin") ? "bg-accent/10 text-accent-ink" : "text-muted hover:bg-surface hover:text-ink"}`}>
              <span className="w-[18px] text-center" aria-hidden>🛠️</span>
              <span className="lg:inline hidden">Admin</span>
              <span className="ml-auto text-[9px] font-bold px-1.5 h-[16px] grid place-items-center rounded-[8px] mono" style={{ background: "rgba(34,211,238,.15)", color: "#67E8F9" }}>ADMIN</span>
            </Link>
          )}
        </nav>
        <div className="border-t border-line p-3">
          <div className="flex items-center gap-2.5 p-2 rounded-[11px]">
            <span className="h-8 w-8 rounded-full bg-surface3 grid place-items-center font-bold text-accent-ink text-[13px]">{(user.name ?? user.email ?? "?").charAt(0).toUpperCase()}</span>
            <div className="lg:block hidden min-w-0 flex-1">
              <b className="text-[13px] block truncate">{user.name ?? "Konto"}</b>
              <small className="text-faint text-[11.5px] block truncate">{user.email}</small>
            </div>
            <form action={logout} className="lg:block hidden"><button className="text-faint hover:text-ink text-[16px]" title="Abmelden" type="submit">⎋</button></form>
          </div>
        </div>
      </aside>

      {/* Inhalt */}
      <div className="min-w-0">
        <header className="flex items-center gap-3.5 px-5 md:px-7 py-3.5 border-b border-line sticky top-0 z-20" style={{ background: "rgba(7,9,12,.85)", backdropFilter: "blur(10px)" }}>
          <div className="mono text-[13px] text-faint">Kontrollzentrum</div>
          <div className="flex-1" />
          <Link href="/catalog" className="btn btn-primary h-9 px-4 text-[13px]">+ Software</Link>
          <Link href="/dashboard/notifications" className="btn btn-ghost h-9 w-9 p-0 relative" aria-label="Benachrichtigungen">🔔{unread ? <span className="absolute -top-1 -right-1 h-4 min-w-4 px-1 text-[10px] font-bold grid place-items-center rounded-full" style={{ background: "#FB7185", color: "#1A0A0D" }}>{unread}</span> : null}</Link>
          <form action={logout} className="md:hidden"><button className="btn btn-ghost h-9 w-9 p-0" title="Abmelden" type="submit">⎋</button></form>
        </header>
        <div className="p-5 md:p-7 max-w-content pb-24 md:pb-8">{children}</div>
      </div>

      {/* Bottom-Nav (Mobil) */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 flex justify-around px-1.5 py-2 border-t border-line2" style={{ background: "rgba(7,9,12,.95)", backdropFilter: "blur(12px)" }}>
        {items.slice(0, 5).map((e) => (
          <Link key={e.href} href={e.href} className={`flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-[10px] text-[10.5px] font-semibold ${active(e) ? "text-accent-ink" : "text-faint"}`}>
            <span className="text-[18px]" aria-hidden>{e.icon}</span>{e.label.split(" ")[0]}
          </Link>
        ))}
      </nav>
    </div>
  );
}
