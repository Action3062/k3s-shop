import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getServices } from "@/lib/controlPlane";
import { deriveNotifications } from "@/lib/dashboard";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { prisma } from "@/lib/db";

export const metadata = { title: "Dashboard — MeinAppNest" };

const B_COLOR: Record<string, string> = { INFO: "#22D3EE", WARN: "#FBBF24", MAINT: "#FB7185" };

async function activeBroadcasts() {
  try {
    return await prisma.broadcast.findMany({ where: { active: true }, orderBy: { createdAt: "desc" }, take: 3 });
  } catch {
    return [];
  }
}

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session) redirect("/login?callbackUrl=/dashboard");
  const isAdmin = (session.user as { role?: string } | undefined)?.role === "ADMIN";
  const customerId = (session as { customerId?: string }).customerId ?? "";
  const services = customerId ? await getServices(customerId) : [];
  const unread = deriveNotifications(services).filter((n) => n.unread).length;
  const broadcasts = await activeBroadcasts();

  return (
    <DashboardShell user={{ name: session.user?.name, email: session.user?.email }} isAdmin={isAdmin} unread={unread}>
      {broadcasts.length > 0 && (
        <div className="grid gap-2.5 mb-5">
          {broadcasts.map((b) => (
            <div
              key={b.id}
              className="flex items-start gap-3 px-4 py-3 rounded-xl border text-[14px]"
              style={{ borderColor: (B_COLOR[b.level] ?? "#22D3EE") + "55", color: B_COLOR[b.level] ?? "#22D3EE" }}
              role="status"
            >
              <span aria-hidden>📣</span>
              <div className="flex-1"><b>{b.title}</b> <span className="text-ink">{b.body}</span></div>
            </div>
          ))}
        </div>
      )}
      {children}
    </DashboardShell>
  );
}
