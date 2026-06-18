import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { logout, startService, stopService, restartService, reinstallService, regenerateTokenService } from "@/app/actions";
import { getServices, getServiceToken } from "@/lib/controlPlane";
import { TokenField } from "@/components/TokenField";

export const metadata = { title: "Meine Dienste — MeinAppNest" };

const STATUS: Record<string, string> = {
  RUNNING: "#34D399", PROVISIONING: "#22D3EE", PENDING: "#9DB0BE",
  SUSPENDED: "#FBBF24", DEPROVISIONING: "#9DB0BE", DEPROVISIONED: "#65788A", FAILED: "#FB7185",
};

export default async function Dashboard({ searchParams }: { searchParams: { error?: string; reinstalled?: string; tokenregenerated?: string } }) {
  const session = await auth();
  if (!session) redirect("/login");
  const customerId = (session as { customerId?: string }).customerId ?? "";
  const services = customerId ? await getServices(customerId) : [];

  // Gateway-Tokens für OpenClaw-Instanzen laden
  const tokenEntries = await Promise.all(
    services.filter((s) => s.appSlug === "openclaw").map(async (s) => [s.id, await getServiceToken(customerId, s.id)] as const),
  );
  const tokens: Record<string, string | null> = Object.fromEntries(tokenEntries);

  return (
    <section className="wrap py-16">
      <div className="flex items-center justify-between mb-8">
        <div>
          <span className="eyebrow">Kontrollzentrum</span>
          <h1 className="mt-3 text-[32px] font-semibold tracking-[-0.02em]">Meine Dienste</h1>
          <p className="text-muted mt-1 text-[14px]">Angemeldet als {session.user?.email}</p>
        </div>
        <form action={logout}><button className="btn btn-ghost h-9 px-4" type="submit">Abmelden</button></form>
      </div>

      {searchParams.error === "pw" && <div className="mb-6 text-sm rounded-xl px-4 py-3 border border-red-500/40 text-red-400">Falsches Passwort — Neuinstallation abgebrochen.</div>}
      {searchParams.reinstalled && <div className="mb-6 text-sm rounded-xl px-4 py-3 border border-ok/40 text-ok">Neuinstallation gestartet — die Instanz wird mit leeren Daten neu aufgebaut.</div>}
      {searchParams.tokenregenerated && <div className="mb-6 text-sm rounded-xl px-4 py-3 border border-ok/40 text-ok">Neues Gateway-Token erzeugt — die Instanz startet kurz neu.</div>}

      {services.length === 0 ? (
        <div className="card text-center py-14">
          <p className="text-muted mb-5">Noch keine Dienste. Wähle eine App, um loszulegen.</p>
          <Link href="/catalog" className="btn btn-primary">Zum Katalog →</Link>
        </div>
      ) : (
        <div className="grid lg:grid-cols-2 gap-5">
          {services.map((s) => {
            const color = STATUS[s.status] ?? "#9DB0BE";
            const running = s.status === "RUNNING";
            const token = tokens[s.id];
            return (
              <div key={s.id} className="card">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <span className="chip h-11 w-11">{s.name.charAt(0)}</span>
                    <div><b className="text-[16px]">{s.name}</b><p className="mono text-[11px] text-faint uppercase tracking-wider">{s.appSlug}</p></div>
                  </div>
                  <span className="pill h-7 text-[11px] mono"><span className="dot pulse-soft" style={{ background: color, boxShadow: `0 0 8px ${color}` }} />{s.status}</span>
                </div>
                <a href={s.url} className="block mono text-[13px] text-accent-ink mt-4 hover:underline truncate">{s.url}</a>

                {s.appSlug === "openclaw" && (
                  <div className="mt-4 rounded-xl border border-line bg-surface/40 p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="mono text-[11px] uppercase tracking-wider text-faint">Gateway-Token</span>
                      <form action={regenerateTokenService}><input type="hidden" name="serviceId" value={s.id} /><button className="text-[12px] text-accent-ink hover:underline" type="submit">Neu generieren</button></form>
                    </div>
                    {token ? <TokenField token={token} /> : <span className="text-[13px] text-faint">Token wird erstellt…</span>}
                  </div>
                )}

                <div className="flex flex-wrap gap-2 mt-5 pt-4 border-t border-line">
                  <a href={s.url} className="btn btn-ghost h-9 px-4 text-[14px]">Öffnen</a>
                  {running ? (
                    <form action={stopService}><input type="hidden" name="serviceId" value={s.id} /><button className="btn btn-ghost h-9 px-4 text-[14px]">Stoppen</button></form>
                  ) : (
                    <form action={startService}><input type="hidden" name="serviceId" value={s.id} /><button className="btn btn-ghost h-9 px-4 text-[14px]">Starten</button></form>
                  )}
                  <form action={restartService}><input type="hidden" name="serviceId" value={s.id} /><button className="btn btn-ghost h-9 px-4 text-[14px]">Neu starten</button></form>
                </div>

                <details className="mt-3 rounded-xl border border-red-500/20 bg-red-500/5 px-4">
                  <summary className="py-3 text-[13px] text-red-400 cursor-pointer list-none flex items-center gap-2">⚠ Neu installieren <span className="text-faint font-normal">(löscht alle Daten dieser Instanz)</span></summary>
                  <form action={reinstallService} className="pb-4 flex flex-col sm:flex-row gap-2 sm:items-end">
                    <input type="hidden" name="serviceId" value={s.id} />
                    <label className="flex-1"><span className="block text-[12px] text-muted mb-1">Zur Bestätigung Passwort eingeben</span>
                      <input name="password" type="password" required placeholder="Dein Passwort" className="w-full h-10 px-3 rounded-xl bg-surface border border-line2 text-ink outline-none focus:border-red-400 transition" /></label>
                    <button type="submit" className="btn h-10 px-4 text-[14px] font-semibold" style={{ background: "#FB7185", color: "#1A0A0D" }}>Endgültig neu installieren</button>
                  </form>
                </details>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
