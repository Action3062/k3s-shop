import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { getServices, getServiceToken } from "@/lib/controlPlane";
import { instanceMeta, formatDate } from "@/lib/dashboard";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { TokenField } from "@/components/TokenField";
import { startService, stopService, restartService, reinstallService, regenerateTokenService } from "@/app/actions";

export default async function ServiceDetail({ params, searchParams }: {
  params: { id: string };
  searchParams: { error?: string; reinstalled?: string; tokenregenerated?: string };
}) {
  const session = await auth();
  if (!session) redirect("/login");
  const customerId = (session as { customerId?: string }).customerId ?? "";
  const services = customerId ? await getServices(customerId) : [];
  const s = services.find((x) => x.id === params.id);
  if (!s) notFound();

  const running = s.status === "RUNNING";
  const isOpenClaw = s.appSlug === "openclaw";
  const token = isOpenClaw ? await getServiceToken(customerId, s.id) : null;
  const back = `/dashboard/apps/${s.id}`;
  const meta = instanceMeta(s.status);

  return (
    <section className="max-w-[860px]">
      <Link href="/dashboard/apps" className="inline-flex items-center gap-2 text-muted text-[13.5px] hover:text-accent-ink mb-3">← Zurück zu Meine Software</Link>

      {searchParams.error === "pw" && <div className="mb-5 text-sm rounded-xl px-4 py-3 border border-red-500/40 text-red-400">Passwort stimmt nicht — Neuinstallation abgebrochen. Es wurde nichts verändert.</div>}
      {searchParams.reinstalled && <div className="mb-5 text-sm rounded-xl px-4 py-3 border border-ok/40 text-ok">Neuinstallation gestartet — die Instanz wird mit leeren Daten neu aufgebaut.</div>}
      {searchParams.tokenregenerated && <div className="mb-5 text-sm rounded-xl px-4 py-3 border border-ok/40 text-ok">Neues Gateway-Token erzeugt — die Instanz startet kurz neu.</div>}

      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3.5">
          <span className="chip h-12 w-12 text-[20px]">{s.name.charAt(0)}</span>
          <div><h1 className="text-[24px] font-semibold tracking-[-0.02em]">{s.name}</h1><p className="mono text-[11px] text-faint uppercase tracking-wider">{s.appSlug} · {s.subdomain}</p></div>
        </div>
        <StatusBadge status={s.status} />
      </div>

      <div className="flex gap-2 mt-4 flex-wrap">
        {running
          ? <a href={s.url} target="_blank" rel="noopener" className="btn btn-primary h-10 px-4 text-[14px]">Öffnen ↗</a>
          : <span className="btn btn-ghost h-10 px-4 text-[14px] opacity-60 cursor-not-allowed">Öffnen ↗</span>}
        {isOpenClaw && running && <a href={`${s.url.replace(/\/$/, "")}/cli/`} target="_blank" rel="noopener" className="btn btn-ghost h-10 px-4 text-[14px]">OpenCLI ⌨</a>}
      </div>
      <a href={s.url} target="_blank" rel="noopener" className="block mono text-[13px] text-accent-ink mt-3 hover:underline break-all">{s.url}</a>

      {/* Zustand */}
      <div className="grid sm:grid-cols-2 gap-3.5 mt-6">
        <div className="card">
          <h2 className="text-[15px] font-semibold mb-3">Zustand</h2>
          <Row k="Status" v={meta.label} />
          <Row k="Aktiv seit" v={formatDate(s.createdAt)} />
          <Row k="Letztes Backup" v={formatDate(s.lastBackupAt)} last />
        </div>
        <div className="card">
          <h2 className="text-[15px] font-semibold mb-3">Speicher & Vertrag</h2>
          <Row k="Speicher" v={`${s.storageGi} GB`} />
          <Row k="Subdomain" v={s.subdomain} />
          <div className="flex justify-between items-center pt-3 text-[14px]"><span className="text-muted">Plan & Preis</span><Link href="/dashboard/billing" className="text-accent-ink hover:underline text-[13.5px]">In Abrechnung →</Link></div>
        </div>
      </div>

      {/* Verwalten */}
      <div className="card mt-3.5">
        <h2 className="text-[15px] font-semibold mb-1">Verwalten</h2>
        <p className="text-muted text-[13px] mb-4">Starte, pausiere oder starte deinen Dienst neu.</p>
        {s.updateAvailable && (
          <div className="mb-4 text-sm rounded-xl px-4 py-3 border border-line bg-surface/40 text-ink">
            <b>Update verfügbar:</b> Version <span className="mono text-accent-ink">{s.latestVersion}</span> (aktuell <span className="mono">{s.currentVersion}</span>). Beim nächsten <b>Neu starten</b> wird sie automatisch eingespielt.
          </div>
        )}
        <div className="flex flex-wrap gap-2">
          {running ? <Act action={stopService} id={s.id} back={back} label="Pausieren" /> : <Act action={startService} id={s.id} back={back} label="Starten" />}
          <Act action={restartService} id={s.id} back={back} label="Neu starten" />
        </div>

        {isOpenClaw && (
          <div className="mt-5 rounded-xl border border-line bg-surface/40 p-3.5">
            <div className="flex items-center justify-between mb-2">
              <span className="mono text-[11px] uppercase tracking-wider text-faint">Gateway-Token</span>
              <form action={regenerateTokenService}><input type="hidden" name="serviceId" value={s.id} /><input type="hidden" name="returnTo" value={back} /><button className="text-[12px] text-accent-ink hover:underline" type="submit">Neu generieren</button></form>
            </div>
            {token ? <TokenField token={token} /> : <span className="text-[13px] text-faint">Token wird erstellt…</span>}
            <p className="mt-3 text-[11px] text-faint leading-relaxed">Provider verbinden im <b className="text-ink">OpenCLI</b>-Terminal, z. B.:<br /><code className="mono text-accent-ink">openclaw models auth login --provider openai-codex</code></p>
          </div>
        )}
      </div>

      {/* Gefahrenzone */}
      <div className="mt-3.5 rounded-2xl border border-red-500/25 bg-red-500/[0.04] p-4">
        <h2 className="text-[14px] font-semibold text-red-400 mb-1">Gefahrenzone</h2>
        <details className="rounded-xl px-1">
          <summary className="py-2.5 text-[13px] text-red-400 cursor-pointer list-none flex items-center gap-2">⚠ Neu installieren <span className="text-faint font-normal">(löscht alle Daten dieser Instanz)</span></summary>
          <form action={reinstallService} className="pb-3 flex flex-col sm:flex-row gap-2 sm:items-end">
            <input type="hidden" name="serviceId" value={s.id} />
            <input type="hidden" name="returnTo" value={back} />
            <label className="flex-1"><span className="block text-[12px] text-muted mb-1">Zur Bestätigung Passwort eingeben</span>
              <input name="password" type="password" required placeholder="Dein Passwort" className="w-full h-10 px-3 rounded-xl bg-surface border border-line2 text-ink outline-none focus:border-red-400 transition" /></label>
            <button type="submit" className="btn h-10 px-4 text-[14px] font-semibold" style={{ background: "#FB7185", color: "#1A0A0D" }}>Endgültig neu installieren</button>
          </form>
        </details>
      </div>
    </section>
  );
}

function Row({ k, v, last }: { k: string; v: string; last?: boolean }) {
  return <div className={`flex justify-between py-2.5 text-[14px] ${last ? "" : "border-b border-line"}`}><span className="text-muted">{k}</span><span className="font-medium">{v}</span></div>;
}
function Act({ action, id, back, label }: { action: (fd: FormData) => void; id: string; back: string; label: string }) {
  return <form action={action}><input type="hidden" name="serviceId" value={id} /><input type="hidden" name="returnTo" value={back} /><button className="btn btn-ghost h-9 px-4 text-[14px]" type="submit">{label}</button></form>;
}
