"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function NavBar({ loggedIn }: { loggedIn: boolean }) {
  const path = usePathname() ?? "";
  // Marketing-Navigation im Dashboard/Gate ausblenden (eigene Shell)
  if (path.startsWith("/dashboard") || path.startsWith("/gate")) return null;

  return (
    <header className="sticky top-0 z-50 border-b border-line backdrop-blur-xl" style={{ background: "rgba(7,9,12,.7)" }}>
      <div className="wrap flex items-center justify-between h-16">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <span className="chip h-7 w-7 text-[15px]">◧</span>MeinAppNest
        </Link>
        <nav className="hidden md:flex gap-8 text-[15px] text-muted">
          <Link href="/catalog" className="hover:text-ink transition-colors">Apps</Link>
          <Link href="/pricing" className="hover:text-ink transition-colors">Preise</Link>
          <Link href="/#how" className="hover:text-ink transition-colors">So funktioniert&apos;s</Link>
          <Link href="/#faq" className="hover:text-ink transition-colors">FAQ</Link>
        </nav>
        <div className="flex items-center gap-3">
          {loggedIn ? (
            <Link href="/dashboard" className="btn btn-primary h-9 px-4 text-[14px]">Zum Dashboard →</Link>
          ) : (
            <>
              <Link href="/login" className="text-muted hover:text-ink text-[15px]">Login</Link>
              <Link href="/signup" className="btn btn-primary h-9 px-4 text-[14px]">Kostenlos starten</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
