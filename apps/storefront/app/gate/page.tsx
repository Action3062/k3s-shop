export const dynamic = "force-dynamic";

const ERRORS: Record<string, string> = {
  denied: "Falsches Token. Bitte erneut versuchen.",
  notfound: "Instanz nicht gefunden.",
  badhost: "Ungültige Adresse.",
};

export default function GatePage({
  searchParams,
}: {
  searchParams: { host?: string; rd?: string; error?: string };
}) {
  const host = searchParams.host || "";
  const rd = searchParams.rd || "";
  const error = searchParams.error
    ? ERRORS[searchParams.error] || "Zugriff verweigert."
    : "";

  return (
    <main className="min-h-[80vh] flex items-center justify-center px-4 py-16">
      <div className="card w-full max-w-md p-8">
        <div className="eyebrow mb-3">Gesicherter Zugang</div>
        <h1 className="text-2xl font-semibold mb-2">Zugang bestätigen</h1>
        <p className="text-sm opacity-70 mb-6">
          Diese Instanz ist zusätzlich geschützt. Gib dein Zugangs-Token ein, um{" "}
          <strong className="opacity-100">{host || "deine Instanz"}</strong> zu
          öffnen.
        </p>

        {error ? (
          <div className="mb-4 rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        ) : null}

        <form method="POST" action="/api/gate/login" className="space-y-4">
          <input type="hidden" name="host" value={host} />
          <input type="hidden" name="rd" value={rd} />
          <div>
            <label className="block text-xs uppercase tracking-wide opacity-60 mb-1.5">
              Zugangs-Token
            </label>
            <input
              type="password"
              name="token"
              required
              autoFocus
              autoComplete="off"
              placeholder="Gateway-Token"
              className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm outline-none focus:border-cyan-400/60"
            />
          </div>
          <button type="submit" className="btn w-full justify-center">
            Entsperren
          </button>
        </form>

        <p className="mt-5 text-xs opacity-50">
          Das Token findest du im MeinAppNest-Portal unter „Meine Dienste".
        </p>
      </div>
    </main>
  );
}
