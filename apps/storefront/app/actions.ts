"use server";

import { z } from "zod";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AuthError } from "next-auth";
import { prisma } from "@/lib/db";
import { signIn, signOut, auth } from "@/auth";
import { SESSION_COOKIE } from "@/auth.config";
import { startCheckout, serviceAction, adminDeprovision, billingPortal } from "@/lib/controlPlane";

const useSecure = process.env.NODE_ENV === "production";

const signupSchema = z.object({
  username: z.string().regex(/^[a-z0-9-]{3,40}$/, "username: nur a-z, 0-9, '-', 3–40 Zeichen"),
  email: z.string().email(),
  password: z.string().min(8),
});

export async function signup(formData: FormData) {
  const parsed = signupSchema.safeParse({
    username: String(formData.get("username") ?? "").toLowerCase(),
    email: String(formData.get("email") ?? "").toLowerCase(),
    password: String(formData.get("password") ?? ""),
  });
  if (!parsed.success) redirect("/signup?error=validation");
  const { username, email, password } = parsed.data;

  const exists = await prisma.user.findFirst({ where: { OR: [{ email }, { username }] } });
  if (exists) redirect("/signup?error=exists");

  const passwordHash = await bcrypt.hash(password, 10);
  await prisma.user.create({ data: { email, username, passwordHash, customer: { create: {} } } });
  redirect("/login?registered=1");
}

function safeInternal(path: string, fallback = "/dashboard") {
  return path.startsWith("/") && !path.startsWith("//") ? path : fallback;
}

export async function login(formData: FormData) {
  const remember = formData.get("remember") === "on";
  const callbackUrl = safeInternal(String(formData.get("callbackUrl") || "/dashboard"));
  try {
    await signIn("credentials", {
      email: String(formData.get("email") ?? "").toLowerCase(),
      password: String(formData.get("password") ?? ""),
      remember: remember ? "true" : "false",
      redirect: false,
    });
  } catch (e) {
    if (e instanceof AuthError) redirect(`/login?error=1&callbackUrl=${encodeURIComponent(callbackUrl)}`);
    throw e;
  }

  // "Angemeldet bleiben" NICHT gewählt -> Session-Cookie (verfällt beim Schließen des Browsers)
  if (!remember) {
    const jar = cookies() as unknown as {
      get(name: string): { value: string } | undefined;
      set(name: string, value: string, opts: Record<string, unknown>): void;
    };
    for (const name of [SESSION_COOKIE, `${SESSION_COOKIE}.0`, `${SESSION_COOKIE}.1`]) {
      const c = jar.get(name);
      if (c) jar.set(name, c.value, { httpOnly: true, sameSite: "lax", path: "/", secure: useSecure });
    }
  }

  redirect(callbackUrl);
}

export async function logout() {
  await signOut({ redirectTo: "/" });
}

export async function checkout(formData: FormData) {
  const session = await auth();
  if (!session) redirect("/login");
  const customerId = (session as { customerId?: string }).customerId;
  const planId = String(formData.get("planId") ?? "");
  if (!customerId) redirect("/dashboard?error=nocustomer");
  const url = await startCheckout(customerId, planId).catch(() => null);
  redirect(url ?? "/dashboard?pending=1");
}

function returnTo(formData: FormData, fallback = "/dashboard/apps") {
  return safeInternal(String(formData.get("returnTo") || ""), fallback).startsWith("/dashboard")
    ? safeInternal(String(formData.get("returnTo") || ""), fallback)
    : fallback;
}
function withFlag(path: string, flag: string) {
  return path + (path.includes("?") ? "&" : "?") + flag;
}

async function actOnService(formData: FormData, action: "start" | "stop" | "restart") {
  const session = await auth();
  if (!session) redirect("/login");
  const customerId = (session as { customerId?: string }).customerId;
  const id = String(formData.get("serviceId") ?? "");
  if (customerId && id) await serviceAction(customerId, id, action).catch(() => null);
  redirect(returnTo(formData));
}
export async function startService(formData: FormData) { await actOnService(formData, "start"); }
export async function stopService(formData: FormData) { await actOnService(formData, "stop"); }
export async function restartService(formData: FormData) { await actOnService(formData, "restart"); }

export async function reinstallService(formData: FormData) {
  const session = await auth();
  if (!session) redirect("/login");
  const customerId = (session as { customerId?: string }).customerId;
  const id = String(formData.get("serviceId") ?? "");
  const password = String(formData.get("password") ?? "");
  const email = String(session.user?.email ?? "").toLowerCase();
  const user = await prisma.user.findUnique({ where: { email } });
  const ok = user?.passwordHash ? await bcrypt.compare(password, user.passwordHash) : false;
  if (!ok) redirect(withFlag(returnTo(formData), "error=pw"));
  if (customerId && id) await serviceAction(customerId, id, "reinstall").catch(() => null);
  redirect(withFlag(returnTo(formData), "reinstalled=1"));
}

export async function regenerateTokenService(formData: FormData) {
  const session = await auth();
  if (!session) redirect("/login");
  const customerId = (session as { customerId?: string }).customerId;
  const id = String(formData.get("serviceId") ?? "");
  if (customerId && id) await serviceAction(customerId, id, "regenerate-token").catch(() => null);
  redirect(withFlag(returnTo(formData), "tokenregenerated=1"));
}

export async function adminDeprovisionService(formData: FormData) {
  const session = await auth();
  if (!session) redirect("/login");
  if ((session.user as { role?: string } | undefined)?.role !== "ADMIN") redirect("/dashboard?error=forbidden");
  const id = String(formData.get("serviceId") ?? "");
  const password = String(formData.get("password") ?? "");
  const email = String(session.user?.email ?? "").toLowerCase();
  const user = await prisma.user.findUnique({ where: { email } });
  const ok = user?.passwordHash ? await bcrypt.compare(password, user.passwordHash) : false;
  if (!ok) redirect("/dashboard/admin?error=pw");
  if (id) await adminDeprovision(id).catch(() => null);
  redirect("/dashboard/admin?deleted=1");
}

const pwSchema = z.object({ current: z.string().min(1), next: z.string().min(8) });
export async function changePassword(formData: FormData) {
  const session = await auth();
  if (!session) redirect("/login");
  const parsed = pwSchema.safeParse({
    current: String(formData.get("current") ?? ""),
    next: String(formData.get("next") ?? ""),
  });
  if (!parsed.success) redirect("/dashboard/settings?pw=weak");
  const email = String(session.user?.email ?? "").toLowerCase();
  const user = await prisma.user.findUnique({ where: { email } });
  const ok = user?.passwordHash ? await bcrypt.compare(parsed.data.current, user.passwordHash) : false;
  if (!ok) redirect("/dashboard/settings?pw=wrong");
  const passwordHash = await bcrypt.hash(parsed.data.next, 10);
  await prisma.user.update({ where: { email }, data: { passwordHash } });
  redirect("/dashboard/settings?pw=ok");
}

export async function openBillingPortal() {
  const session = await auth();
  if (!session) redirect("/login");
  const customerId = (session as { customerId?: string }).customerId;
  if (!customerId) redirect("/dashboard/billing?portal=none");
  const url = await billingPortal(customerId).catch(() => null);
  redirect(url ?? "/dashboard/billing?portal=unavailable");
}

/** Beendeten (DEPROVISIONED) Server endgültig aus dem Dashboard/DB entfernen.
 *  Cluster + Daten sind beim Deprovisionieren bereits weg; hier wird nur noch der
 *  Grabstein-Datensatz (ServiceInstance + abhängige Backups/Jobs) gelöscht.
 *  Die Subscription bleibt als Rechnungs-Historie erhalten. */
export async function forgetService(formData: FormData) {
  const session = await auth();
  if (!session) redirect("/login");
  const customerId = (session as { customerId?: string }).customerId;
  const id = String(formData.get("serviceId") ?? "");
  if (!customerId || !id) redirect("/dashboard/apps");
  const inst = await prisma.serviceInstance.findUnique({ where: { id }, include: { subscription: true } });
  if (!inst || inst.subscription.customerId !== customerId) redirect("/dashboard/apps?error=notfound");
  if (inst.status !== "DEPROVISIONED") redirect("/dashboard/apps?error=notended");
  await prisma.backup.deleteMany({ where: { instanceId: id } });
  await prisma.provisioningJob.deleteMany({ where: { instanceId: id } });
  await prisma.serviceInstance.delete({ where: { id } });
  redirect("/dashboard/apps?removed=1");
}
