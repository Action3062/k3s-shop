import Link from "next/link";
import { login } from "@/app/actions";

export const metadata = { title: "Login — MeinAppNest" };

export default function Login({ searchParams }: { searchParams: { error?: string; registered?: string } }) {
  return (
    <section className="relative overflow-hidden">
      <div className="pointer-events-none absolute -top-32 left-1/2 -translate-x-1/2 h-[360px] w-[600px] rounded-full glow-hero" />
      <div className="wrap relative py-20 max-w-[440px]">
        <div className="card">
          <span className="eyebrow">Login</span>
          <h1 className="mt-3 text-[28px] font-semibold tracking-[-0.02em]">Willkommen zurück</h1>
          <p className="text-muted mt-1.5 mb-7 text-[15px]">Melde dich an, um deine Dienste zu verwalten.</p>
          {searchParams.registered && <Note ok>Konto erstellt — bitte einloggen.</Note>}
          {searchParams.error && <Note>Ungültige E-Mail oder Passwort.</Note>}
          <form action={login} className="space-y-4">
            <Field label="E-Mail" name="email" type="email" />
            <Field label="Passwort" name="password" type="password" />
            <button className="btn btn-primary w-full" type="submit">Einloggen</button>
          </form>
        </div>
        <p className="text-muted text-sm mt-6 text-center">Noch kein Konto? <Link href="/signup" className="text-accent-ink hover:underline">Registrieren</Link></p>
      </div>
    </section>
  );
}

function Field({ label, name, type }: { label: string; name: string; type: string }) {
  return (
    <label className="block">
      <span className="block text-[13px] text-muted mb-1.5">{label}</span>
      <input name={name} type={type} required className="w-full h-11 px-3.5 rounded-xl bg-surface border border-line2 text-ink outline-none transition focus:border-accent focus:shadow-[0_0_0_3px_rgba(34,211,238,0.12)]" />
    </label>
  );
}
function Note({ children, ok }: { children: React.ReactNode; ok?: boolean }) {
  return <div className={`mb-5 text-sm rounded-xl px-4 py-3 border ${ok ? "border-ok/40 text-ok" : "border-red-500/40 text-red-400"}`}>{children}</div>;
}
