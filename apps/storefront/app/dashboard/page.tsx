import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { logout } from "@/app/actions";
import { getServices } from "@/lib/controlPlane";

export const metadata = { title: "Meine Dienste — DynStore" };

const STATUS: Record<string, string> = {
  RUNNING: "text-ok", PROVISIONING: "text-accent-ink", PENDING: "text-muted",
  SUSPENDED: "text-amber-400", DEPROVISIONING: "text-muted", DEPROVISIONED: "text-faint", FAILED: "text-red-400",
};

export default async function Dashboard() {
  const session = await auth();
  if (!session) redirect("/login");
  const customerId = (session as { customerId?: string }).customerId ?? "";
  const services = customerId ? await getServices(customerId) : [];

  return (
    <section className="wrap py-16">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-semibold tracking-tight text-[32px]">Meine Dienste</h1>
          <p className="text-muted mt-1">Angemeldet als {session.user?.email}</p>
        </div>
        <form action={logout}><button className="btn btn-ghost h-9 px-4" type="submit">Abmelden</button></form>
      </div>

      {services.length === 0 ? (
        <div className="card rounded-2xl text-center py-14">
          <p className="text-muted mb-5">Noch keine Dienste. Wähle eine App, um loszulegen.</p>
          <Link href="/catalog" className="btn btn-primary">Zum Katalog →</Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-[18px]">
          {services.map((s) => (
            <div key={s.id} className="card rounded-2xl">
              <div className="flex items-center justify-between">
                <b className="text-lg">{s.name}</b>
                <span className={`text-sm ${STATUS[s.status] ?? "text-muted"}`}>● {s.status}</span>
              </div>
              <a href={s.url} className="block font-mono text-[13px] text-accent-ink mt-2 hover:underline">{s.url}</a>
              <div className="flex gap-2.5 mt-5 pt-4 border-t border-line">
                <a href={s.url} className="btn btn-ghost h-9 px-4">Öffnen</a>
                <button className="btn btn-ghost h-9 px-4">Verwalten</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
