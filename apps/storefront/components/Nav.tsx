import Link from "next/link";

export function Nav() {
  return (
    <header className="sticky top-0 z-50 border-b border-line backdrop-blur-md" style={{ background: "rgba(10,11,13,.72)" }}>
      <div className="wrap flex items-center justify-between h-16">
        <Link href="/" className="flex items-center gap-2.5 font-medium">
          <span className="grid place-items-center w-7 h-7 rounded-lg text-bg font-bold text-[15px]" style={{ background: "linear-gradient(135deg,#8a90ff,#a855f7)" }}>D</span>
          DynStore
        </Link>
        <nav className="hidden md:flex gap-7 text-[15px]">
          <Link href="/catalog" className="text-muted hover:text-ink">Apps</Link>
          <Link href="/#how" className="text-muted hover:text-ink">So funktioniert&apos;s</Link>
          <Link href="/pricing" className="text-muted hover:text-ink">Preise</Link>
        </nav>
        <div className="flex items-center gap-3.5">
          <Link href="/login" className="text-muted hover:text-ink text-[15px]">Login</Link>
          <Link href="/signup" className="btn btn-primary h-9 px-4">Kostenlos starten</Link>
        </div>
      </div>
    </header>
  );
}
