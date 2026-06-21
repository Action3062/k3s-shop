"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ADMIN_NAV } from "@/lib/adminNav";

export function AdminNav() {
  const path = usePathname() ?? "";
  const isActive = (href: string, exact?: boolean) =>
    exact ? path === href : path === href || path.startsWith(href + "/");

  return (
    <nav className="flex gap-1.5 overflow-x-auto pb-2.5 mb-6 border-b border-line" aria-label="Admin-Navigation">
      {ADMIN_NAV.map((e) => {
        const active = isActive(e.href, e.exact);
        return (
          <Link
            key={e.href}
            href={e.href}
            className={`shrink-0 flex items-center gap-2 px-3.5 py-2 rounded-[10px] text-[13.5px] font-medium transition ${
              active ? "bg-accent/10 text-accent-ink" : "text-muted hover:bg-surface hover:text-ink"
            }`}
          >
            <span aria-hidden>{e.icon}</span>
            <span>{e.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
