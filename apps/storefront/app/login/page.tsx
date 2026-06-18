import Link from "next/link";
import { login } from "@/app/actions";

export const metadata = { title: "Login — DynStore" };

export default function Login({ searchParams }: { searchParams: { error?: string; registered?: string } }) {
  return (
    <section className="wrap py-20 max-w-md">
      <h1 className="font-semibold tracking-tight text-[32px] mb-2">Willkommen zurück</h1>
      <p className="text-muted mb-8">Melde dich an, um deine Dienste zu verwalten.</p>
      {searchParams.registered && <Note ok>Konto erstellt — bitte einloggen.</Note>}
      {searchParams.error && <Note>Ungültige E-Mail oder Passwort.</Note>}
      <form action={login} className="space-y-4">
        <Field label="E-Mail" name="email" type="email" />
        <Field label="Passwort" name="password" type="password" />
        <button className="btn btn-primary w-full" type="submit">Einloggen</button>
      </form>
      <p className="text-muted text-sm mt-6">Noch kein Konto? <Link href="/signup" className="text-accent-ink hover:underline">Registrieren</Link></p>
    </section>
  );
}

function Field({ label, name, type }: { label: string; name: string; type: string }) {
  return (
    <label className="block">
      <span className="block text-sm text-muted mb-1.5">{label}</span>
      <input name={name} type={type} required className="w-full h-11 px-3.5 rounded-[10px] bg-surface border border-line2 text-ink outline-none focus:border-accent" />
    </label>
  );
}
function Note({ children, ok }: { children: React.ReactNode; ok?: boolean }) {
  return <div className={`mb-5 text-sm rounded-[10px] px-4 py-3 border ${ok ? "border-ok/40 text-ok" : "border-red-500/40 text-red-400"}`}>{children}</div>;
}
