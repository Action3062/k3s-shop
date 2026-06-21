import { prisma } from "@/lib/db";

export const metadata = { title: "Admin — Stripe-Events" };

export default async function AdminEvents() {
  const events = await prisma.webhookEvent.findMany({ orderBy: { receivedAt: "desc" }, take: 100 });

  return (
    <section>
      <h1 className="text-[30px] font-semibold tracking-[-0.02em]">Stripe-Events</h1>
      <p className="text-muted text-[14px] mt-1 mb-5">Eingehende Webhooks von Stripe — die letzten 100.</p>

      <div className="grid gap-2">
        {events.map((e) => (
          <div key={e.id} className="card flex items-center justify-between gap-3 flex-wrap py-3.5">
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <b className="text-[13.5px] mono">{e.type}</b>
                <span className={`mono text-[10px] px-2 py-0.5 rounded-md border ${e.processedAt ? "border-ok/40 text-ok bg-ok/10" : "border-[#FBBF24]/40 text-[#FBBF24] bg-[#FBBF24]/10"}`}>{e.processedAt ? "verarbeitet" : "offen"}</span>
              </div>
              <p className="mono text-[11px] text-faint mt-1 truncate">{e.stripeEventId}</p>
            </div>
            <span className="mono text-[11px] text-faint shrink-0">{e.receivedAt.toLocaleString("de-DE")}</span>
          </div>
        ))}
        {events.length === 0 && <div className="card text-muted text-[14px]">Noch keine Events empfangen.</div>}
      </div>
    </section>
  );
}
