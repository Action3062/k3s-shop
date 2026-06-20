import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { changePassword, logout } from "@/app/actions";

export const metadata = { title: "Einstellungen — MeinAppNest" };

export default async function Settings({ searchParams }: { searchParams: { pw?: string } }) {
  const session = await auth();
  if (!session) redirect("/login");
  const pw = searchParams.pw;

  return (
    <section className="max-w-[720px]">
      <span className="eyebrow">Einstellungen</span>
      <h1 className="text-[30px] font-semibold tracking-[-0.02em] mt-1.5">Einstellungen</h1>
      <p className="text-muted text-[14px] mt-1 mb-6">Konto, Sicherheit und Abmeldung.</p>

      <div className="card mb-3.5">
        <h2 className="text-[15px] font-semibold mb-3">Profil</h2>
        <div className="flex justify-between py-2.5 border-b border-line text-[14px]"><span className="text-muted">Name</span><span className="font-medium">{session.user?.name ?? "—"}</span></div>
        <div className="flex justify-between py-2.5 text-[14px]"><span className="text-muted">E-Mail</span><span className="font-medium">{session.user?.email}</span></div>
      </div>

      <div className="card mb-3.5">
        <h2 className="text-[15px] font-semibold mb-1">Passwort ändern</h2>
        {pw === "ok" && <div className="my-2 text-sm rounded-xl px-4 py-2.5 border border-ok/40 text-ok">Passwort geändert.</div>}
        {pw === "wrong" && <div className="my-2 text-sm rounded-xl px-4 py-2.5 border border-red-500/40 text-red-400">Aktuelles Passwort stimmt nicht.</div>}
        {pw === "weak" && <div className="my-2 text-sm rounded-xl px-4 py-2.5 border border-red-500/40 text-red-400">Neues Passwort muss mindestens 8 Zeichen haben.</div>}
        <form action={changePassword} className="grid sm:grid-cols-2 gap-3 mt-3">
          <label className="block sm:col-span-2 max-w-[320px]"><span className="block text-[12.5px] text-muted mb-1">Aktuelles Passwort</span>
            <input name="current" type="password" required autoComplete="current-password" className="w-full h-10 px-3 rounded-xl bg-surface border border-line2 text-ink outline-none focus:border-accent transition" /></label>
          <label className="block sm:col-span-2 max-w-[320px]"><span className="block text-[12.5px] text-muted mb-1">Neues Passwort (min. 8 Zeichen)</span>
            <input name="next" type="password" required minLength={8} autoComplete="new-password" className="w-full h-10 px-3 rounded-xl bg-surface border border-line2 text-ink outline-none focus:border-accent transition" /></label>
          <div className="sm:col-span-2"><button type="submit" className="btn btn-primary h-10 px-4 text-[14px]">Passwort ändern</button></div>
        </form>
      </div>

      <div className="card flex items-center justify-between">
        <div><h2 className="text-[15px] font-semibold">Abmelden</h2><p className="text-muted text-[13px] mt-0.5">Auf diesem Gerät abmelden.</p></div>
        <form action={logout}><button type="submit" className="btn btn-ghost h-10 px-4 text-[14px]">Abmelden</button></form>
      </div>
    </section>
  );
}
