import Link from "next/link";
import { signup } from "@/app/actions";

export const metadata = { title: "Registrieren — MeinAppNest" };

export default function Signup({ searchParams }: { searchParams: { error?: string } }) {
  return (
    <section className="wrap py-20 max-w-md">
      <h1 className="font-semibold tracking-tight text-[32px] mb-2">Konto erstellen</h1>
      <p className="text-muted mb-8">Dein Username wird Teil deiner App-Adresse: <span className="font-mono text-[13px]">username.app.meinappnest.org</span></p>
      {searchParams.error === "exists" && <Note>E-Mail oder Username bereits vergeben.</Note>}
      {searchParams.error === "validation" && <Note>Bitte Eingaben prüfen (Username: a–z, 0–9, „-", min. 8 Zeichen Passwort).</Note>}
      <form action={signup} className="space-y-4">
        <Field label="Username (DNS-Label)" name="username" type="text" placeholder="z. B. thomas" />
        <Field label="E-Mail" name="email" type="email" />
        <Field label="Passwort (min. 8 Zeichen)" name="password" type="password" />
        <button className="btn btn-primary w-full" type="submit">Konto erstellen</button>
      </form>
      <p className="text-muted text-sm mt-6">Schon registriert? <Link href="/login" className="text-accent-ink hover:underline">Login</Link></p>
    </section>
  );
}

function Field({ label, name, type, placeholder }: { label: string; name: string; type: string; placeholder?: string }) {
  return (
    <label className="block">
      <span className="block text-sm text-muted mb-1.5">{label}</span>
      <input name={name} type={type} placeholder={placeholder} required className="w-full h-11 px-3.5 rounded-[10px] bg-surface border border-line2 text-ink outline-none focus:border-accent" />
    </label>
  );
}
function Note({ children }: { children: React.ReactNode }) {
  return <div className="mb-5 text-sm rounded-[10px] px-4 py-3 border border-red-500/40 text-red-400">{children}</div>;
}
