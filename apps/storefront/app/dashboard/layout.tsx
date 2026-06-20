import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getServices } from "@/lib/controlPlane";
import { deriveNotifications } from "@/lib/dashboard";
import { DashboardShell } from "@/components/dashboard/DashboardShell";

export const metadata = { title: "Dashboard — MeinAppNest" };

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session) redirect("/login?callbackUrl=/dashboard");
  const isAdmin = (session.user as { role?: string } | undefined)?.role === "ADMIN";
  const customerId = (session as { customerId?: string }).customerId ?? "";
  const services = customerId ? await getServices(customerId) : [];
  const unread = deriveNotifications(services).filter((n) => n.unread).length;

  return (
    <DashboardShell user={{ name: session.user?.name, email: session.user?.email }} isAdmin={isAdmin} unread={unread}>
      {children}
    </DashboardShell>
  );
}
