import Link from "next/link";
import { signup } from "@/app/actions";

export const metadata = { title: "Registrieren — MeinAppNest" };

export default function Signup({ searchParams }: { searchParams: { error?: string } }) {
  return (
    <section className="relative overflow-hidden">
      <div className="pointer-events-none absolute -top-32 left-1/2 -translate-x-1/2 h-[360px] w-[600px] rounded-full glow-hero" />
      <div className="wrap relative py-20 max-w-[440px]">
        <div className="card">
          <span className="eyebrow">Registrieren</span>
          <h1 className="mt-3 text-[28px] font-semibold tracking-[-0.02em]">Konto erstellen</h1>
          <p className="text-muted mt-1.5 mb-7 text-[15px]">Dein Username wird Teil deiner App-Adresse: <span className="mono text-[13px] text-accent-ink">username.app.meinappnest.org</span></p>
          {searchParams.error === "exists" && <Note>E-Mail oder Username bereits vergeben.</Note>}
          {searchParams.error === "validation" && <Note>Bitte Eingaben prüfen (Username: a–z, 0–9, „-"; Passwort min. 8 Zeichen).</Note>}
          <form action={signup} className="space-y-4">
            <Field label="Username (DNS-Label)" name="username" type="text" placeholder="z. B. thomas" />
            <Field label="E-Mail" name="email" type="email" placeholder="" />
            <Field label="Passwort (min. 8 Zeichen)" name="password" type="password" placeholder="" />
            <button className="btn btn-primary w-full" type="submit">Konto erstellen</button>
          </form>
        </div>
        <p className="text-muted text-sm mt-6 text-center">Schon registriert? <Link href="/login" className="text-accent-ink hover:underline">Login</Link></p>
      </div>
    </section>
  );
}

function Field({ label, name, type, placeholder }: { label: string; name: string; type: string; placeholder?: string }) {
  return (
    <label className="block">
      <span className="block text-[13px] text-muted mb-1.5">{label}</span>
      <input name={name} type={type} placeholder={placeholder} required className="w-full h-11 px-3.5 rounded-xl bg-surface border border-line2 text-ink outline-none transition focus:border-accent focus:shadow-[0_0_0_3px_rgba(34,211,238,0.12)]" />
    </label>
  );
}
function Note({ children }: { children: React.ReactNode }) {
  return <div className="mb-5 text-sm rounded-xl px-4 py-3 border border-red-500/40 text-red-400">{children}</div>;
}
