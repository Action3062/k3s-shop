import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getServices } from "@/lib/controlPlane";
import { deriveNotifications } from "@/lib/dashboard";

export const metadata = { title: "Benachrichtigungen — MeinAppNest" };

const BG: Record<string, string> = { ok: "rgba(52,211,153,.14)", warn: "rgba(251,191,36,.14)", danger: "rgba(251,113,133,.14)", info: "rgba(34,211,238,.14)", muted: "rgba(255,255,255,.06)" };

export default async function Notifications() {
  const session = await auth();
  if (!session) redirect("/login");
  const customerId = (session as { customerId?: string }).customerId ?? "";
  const services = customerId ? await getServices(customerId) : [];
  const items = deriveNotifications(services);

  return (
    <section className="max-w-[760px]">
      <span className="eyebrow">Benachrichtigungen</span>
      <h1 className="text-[30px] font-semibold tracking-[-0.02em] mt-1.5">Benachrichtigungen</h1>
      <p className="text-muted text-[14px] mt-1 mb-6">Ereignisse zu deinen Diensten.</p>

      {items.length === 0 ? (
        <div className="card text-center py-12 text-muted">Keine Benachrichtigungen. 🎉</div>
      ) : (
        <div className="card">
          {items.map((n, i) => (
            <div key={i} className="flex items-center gap-3 py-3 border-b border-line last:border-0">
              <span className="grid place-items-center h-9 w-9 rounded-[10px] text-[15px]" style={{ background: BG[n.tone] }} aria-hidden>{n.icon}</span>
              <div className="flex-1 min-w-0"><div className="text-[14px] font-medium">{n.title}</div><div className="text-[12px] text-faint">{n.time}</div></div>
              {n.unread && <span className="h-2 w-2 rounded-full" style={{ background: "#22D3EE" }} />}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
