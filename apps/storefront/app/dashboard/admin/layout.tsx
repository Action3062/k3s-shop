import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AdminNav } from "@/components/dashboard/AdminNav";

export const metadata = { title: "Admin — MeinAppNest" };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session) redirect("/login");
  if ((session.user as { role?: string } | undefined)?.role !== "ADMIN") redirect("/dashboard");

  return (
    <div>
      <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border border-[#FB7185]/30 bg-[#FB7185]/5 text-[#FB7185] text-[13px] mb-5" role="status">
        <span aria-hidden>🛠️</span>
        <span><b>Admin-Bereich.</b> Aktionen wirken kundenübergreifend — mit Bedacht handeln.</span>
      </div>
      <AdminNav />
      {children}
    </div>
  );
}
