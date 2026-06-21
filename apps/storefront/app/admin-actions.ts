"use server";

import { z } from "zod";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { auth } from "@/auth";
import { audit } from "@/lib/audit";
import { adminServiceAction, adminDeprovision } from "@/lib/controlPlane";
import { SETTING_DEFS } from "@/lib/settings";

/** Stellt sicher, dass der Aufrufer ADMIN ist; liefert die Admin-E-Mail zurück. */
async function requireAdmin(): Promise<string> {
  const session = await auth();
  if (!session) redirect("/login");
  if ((session.user as { role?: string } | undefined)?.role !== "ADMIN") redirect("/dashboard?error=forbidden");
  return String(session.user?.email ?? "").toLowerCase();
}

async function passwordOk(email: string, password: string): Promise<boolean> {
  const user = await prisma.user.findUnique({ where: { email } });
  return user?.passwordHash ? bcrypt.compare(password, user.passwordHash) : false;
}

function withFlag(path: string, flag: string): string {
  return path + (path.includes("?") ? "&" : "?") + flag;
}

const SERVERS = "/dashboard/admin/servers";
const CUSTOMERS = "/dashboard/admin/customers";
const CATALOG = "/dashboard/admin/catalog";
const BROADCAST = "/dashboard/admin/broadcast";
const SETTINGS = "/dashboard/admin/settings";

// ---- Server-Lifecycle (kundenübergreifend) ----
const LIFECYCLE = new Set(["start", "stop", "restart", "backup", "regenerate-token"]);

export async function adminServerAction(formData: FormData) {
  const actor = await requireAdmin();
  const id = String(formData.get("serviceId") ?? "");
  const action = String(formData.get("action") ?? "");
  if (!id || !LIFECYCLE.has(action)) redirect(withFlag(SERVERS, "error=bad"));
  const ok = await adminServiceAction(
    id,
    action as "start" | "stop" | "restart" | "backup" | "regenerate-token",
  ).catch(() => false);
  await audit(actor, `server.${action}`, id, ok ? "ok" : "failed");
  redirect(withFlag(SERVERS, ok ? `done=${action}` : "error=cp"));
}

export async function adminReinstallServer(formData: FormData) {
  const actor = await requireAdmin();
  const id = String(formData.get("serviceId") ?? "");
  const password = String(formData.get("password") ?? "");
  if (!(await passwordOk(actor, password))) redirect(withFlag(SERVERS, "error=pw"));
  const ok = await adminServiceAction(id, "reinstall").catch(() => false);
  await audit(actor, "server.reinstall", id, ok ? "ok" : "failed");
  redirect(withFlag(SERVERS, ok ? "done=reinstall" : "error=cp"));
}

export async function adminDeleteServer(formData: FormData) {
  const actor = await requireAdmin();
  const id = String(formData.get("serviceId") ?? "");
  const password = String(formData.get("password") ?? "");
  if (!(await passwordOk(actor, password))) redirect(withFlag(SERVERS, "error=pw"));
  const ok = await adminDeprovision(id).catch(() => false);
  await audit(actor, "server.delete", id, ok ? "ok" : "failed");
  redirect(withFlag(SERVERS, ok ? "deleted=1" : "error=cp"));
}

// ---- Kunden / Rollen ----
const roleSchema = z.object({ userId: z.string().min(1), role: z.enum(["USER", "ADMIN"]) });

export async function setUserRole(formData: FormData) {
  const actor = await requireAdmin();
  const parsed = roleSchema.safeParse({
    userId: String(formData.get("userId") ?? ""),
    role: String(formData.get("role") ?? ""),
  });
  if (!parsed.success) redirect(withFlag(CUSTOMERS, "error=bad"));
  const me = await prisma.user.findUnique({ where: { email: actor } });
  if (me?.id === parsed.data.userId && parsed.data.role !== "ADMIN") redirect(withFlag(CUSTOMERS, "error=self"));
  await prisma.user.update({ where: { id: parsed.data.userId }, data: { role: parsed.data.role } });
  await audit(actor, "user.role", parsed.data.userId, parsed.data.role);
  redirect(withFlag(CUSTOMERS, "done=role"));
}

// ---- Katalog ----
export async function catalogToggleActive(formData: FormData) {
  const actor = await requireAdmin();
  const id = String(formData.get("appId") ?? "");
  const app = await prisma.catalogApp.findUnique({ where: { id } });
  if (!app) redirect(withFlag(CATALOG, "error=bad"));
  await prisma.catalogApp.update({ where: { id }, data: { active: !app.active } });
  await audit(actor, "catalog.toggle", id, app.active ? "disabled" : "enabled");
  redirect(withFlag(CATALOG, "done=catalog"));
}

const catalogSchema = z.object({
  appId: z.string().min(1),
  name: z.string().min(1),
  description: z.string().min(1),
  category: z.string().optional(),
  defaultStorageGi: z.coerce.number().int().min(1).max(1000),
});

export async function catalogUpdate(formData: FormData) {
  const actor = await requireAdmin();
  const parsed = catalogSchema.safeParse({
    appId: String(formData.get("appId") ?? ""),
    name: String(formData.get("name") ?? ""),
    description: String(formData.get("description") ?? ""),
    category: String(formData.get("category") ?? ""),
    defaultStorageGi: String(formData.get("defaultStorageGi") ?? "5"),
  });
  if (!parsed.success) redirect(withFlag(CATALOG, "error=bad"));
  const { appId, name, description, category, defaultStorageGi } = parsed.data;
  await prisma.catalogApp.update({
    where: { id: appId },
    data: { name, description, category: category || null, defaultStorageGi },
  });
  await audit(actor, "catalog.update", appId, name);
  redirect(withFlag(CATALOG, "done=catalog"));
}

// ---- Plattform-Einstellungen ----
export async function saveSettings(formData: FormData) {
  const actor = await requireAdmin();
  for (const def of SETTING_DEFS) {
    const value = def.type === "bool"
      ? (formData.get(def.key) === "on" ? "true" : "false")
      : String(formData.get(def.key) ?? def.default);
    await prisma.setting.upsert({ where: { key: def.key }, update: { value }, create: { key: def.key, value } });
  }
  await audit(actor, "settings.save");
  redirect(withFlag(SETTINGS, "done=settings"));
}

// ---- Broadcast / Ankündigungen ----
const broadcastSchema = z.object({
  title: z.string().min(1),
  body: z.string().min(1),
  level: z.enum(["INFO", "WARN", "MAINT"]),
});

export async function createBroadcast(formData: FormData) {
  const actor = await requireAdmin();
  const parsed = broadcastSchema.safeParse({
    title: String(formData.get("title") ?? ""),
    body: String(formData.get("body") ?? ""),
    level: String(formData.get("level") ?? "INFO"),
  });
  if (!parsed.success) redirect(withFlag(BROADCAST, "error=bad"));
  await prisma.broadcast.create({ data: { ...parsed.data, createdBy: actor } });
  await audit(actor, "broadcast.create", null, parsed.data.title);
  redirect(withFlag(BROADCAST, "done=broadcast"));
}

export async function setBroadcastActive(formData: FormData) {
  const actor = await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const active = String(formData.get("active") ?? "") === "true";
  if (!id) redirect(withFlag(BROADCAST, "error=bad"));
  await prisma.broadcast.update({ where: { id }, data: { active } });
  await audit(actor, "broadcast.active", id, String(active));
  redirect(withFlag(BROADCAST, "done=broadcast"));
}
