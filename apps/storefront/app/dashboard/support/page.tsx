import Link from "next/link";

export const metadata = { title: "Support — MeinAppNest" };

const FAQ: [string, string][] = [
  ["Wie lange dauert die Einrichtung?", "Nach der Buchung ist deine App meist in 1–2 Minuten bereit. Der Status springt dann auf „Aktiv“."],
  ["Meine App zeigt „Störung“ — was tun?", "Wir erkennen Störungen automatisch und kümmern uns. Bleibt es länger bestehen, kontaktiere uns über den Button oben."],
  ["Wie ändere ich meinen Plan?", "Plan-Änderungen und Kündigungen verwaltest du im Bereich Abrechnung über das Zahlungsportal."],
  ["Sind meine Daten gesichert?", "Ja. Jede Instanz wird automatisch gesichert; das letzte Backup siehst du in der Detailansicht der App."],
];

export default function Support() {
  return (
    <section>
      <span className="eyebrow">Support</span>
      <h1 className="text-[30px] font-semibold tracking-[-0.02em] mt-1.5">Support & Hilfe</h1>
      <p className="text-muted text-[14px] mt-1 mb-6">Wir helfen dir gern weiter.</p>

      <div className="grid sm:grid-cols-2 gap-3.5">
        <div className="card">
          <h2 className="text-[16px] font-semibold">📚 Hilfe-Center</h2>
          <p className="text-muted text-[13.5px] mt-1">Antworten auf häufige Fragen — von Einrichtung bis Backup.</p>
        </div>
        <div className="card">
          <h2 className="text-[16px] font-semibold">✉️ Anfrage erstellen</h2>
          <p className="text-muted text-[13.5px] mt-1 mb-3">Schreib uns — wir antworten meist innerhalb eines Werktags.</p>
          <a href="mailto:support@meinappnest.org?subject=Support-Anfrage" className="btn btn-primary h-9 px-4 text-[14px]">E-Mail an den Support</a>
        </div>
      </div>

      <div className="flex items-center justify-between mt-8 mb-3.5"><h2 className="text-[18px] font-semibold">Häufige Fragen</h2></div>
      <div className="card">
        {FAQ.map(([q, a]) => (
          <details key={q} className="border-b border-line last:border-0">
            <summary className="py-3.5 cursor-pointer list-none flex items-center justify-between text-[14.5px] font-medium">{q}<span className="text-faint">＋</span></summary>
            <p className="pb-3.5 text-[13.5px] text-muted leading-relaxed">{a}</p>
          </details>
        ))}
      </div>
      <p className="text-faint text-[12.5px] mt-4">Brauchst du Hilfe zu einer bestimmten App? Öffne sie unter <Link href="/dashboard/apps" className="text-accent-ink hover:underline">Meine Software</Link> und nutze dort den Support-Hinweis.</p>
    </section>
  );
}
