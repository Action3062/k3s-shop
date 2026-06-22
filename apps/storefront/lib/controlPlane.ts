import type { CatalogApp, ServiceInstance } from "./types";
import { signCustomerAssertion } from "./customerAssert";

const BASE = process.env.CONTROL_PLANE_URL ?? "";
const TOKEN = process.env.CP_SERVICE_TOKEN ?? "";
const ADMIN_TOKEN = process.env.CP_ADMIN_TOKEN ?? "";

type CpInit = RequestInit & { customerId?: string; admin?: boolean };

async function cp<T>(path: string, init?: CpInit): Promise<T> {
  const headers: Record<string, string> = {
    "content-type": "application/json",
    authorization: `Bearer ${TOKEN}`,
  };
  if (init?.customerId) {
    // Stufe A: signierte Assertion zusaetzlich zum Legacy-Header senden.
    headers["x-customer-id"] = init.customerId;
    const assert = signCustomerAssertion(init.customerId);
    if (assert) headers["x-customer-assert"] = assert;
  }
  if (init?.admin && ADMIN_TOKEN) {
    headers["x-admin-token"] = ADMIN_TOKEN;
  }
  const res = await fetch(`${BASE}${path}`, { ...init, headers, cache: "no-store" });
  if (!res.ok) throw new Error(`control-plane ${path} -> ${res.status}`);
  return res.json() as Promise<T>;
}

// Statischer Fallback, solange die Control-Plane nicht läuft (Design-/Build-Phase).
export const FALLBACK_CATALOG: CatalogApp[] = [
  { slug: "vaultwarden", name: "Vaultwarden", category: "Passwort-Manager",
    description: "Self-hosted, Bitwarden-kompatibler Tresor für Passwörter & Secrets — privat und sicher.",
    plans: [{ id: "vw-standard", name: "Standard", priceCents: 500, interval: "month", storageGi: 5 }] },
  { slug: "nextcloud", name: "Nextcloud", category: "Dateien & Kollaboration",
    description: "Deine eigene Cloud für Dateien, Kalender und Kontakte.",
    plans: [{ id: "nc-standard", name: "Standard", priceCents: 900, interval: "month", storageGi: 50 }] },
  { slug: "jellyfin", name: "Jellyfin", category: "Medien-Streaming",
    description: "Streame deine Film- und Musiksammlung von überall.",
    plans: [{ id: "jf-standard", name: "Standard", priceCents: 700, interval: "month", storageGi: 10 }] },
];

export async function getCatalog(): Promise<CatalogApp[]> {
  if (!BASE) return FALLBACK_CATALOG;
  try { return await cp<CatalogApp[]>("/v1/catalog"); }
  catch { return FALLBACK_CATALOG; }
}

export async function getServices(customerId: string): Promise<ServiceInstance[]> {
  if (!BASE) return [];
  try { return await cp<ServiceInstance[]>("/v1/me/services", { customerId }); }
  catch { return []; }
}

export async function startCheckout(customerId: string, planId: string): Promise<string | null> {
  if (!BASE) return null;
  const r = await cp<{ checkoutUrl: string }>("/v1/checkout/session", {
    method: "POST", customerId, body: JSON.stringify({ planId }),
  });
  return r.checkoutUrl;
}

export async function serviceAction(
  customerId: string,
  id: string,
  action: "start" | "stop" | "restart" | "reinstall" | "regenerate-token",
): Promise<boolean> {
  if (!BASE) return false;
  try {
    await cp(`/v1/services/${id}/${action}`, { method: "POST", customerId });
    return true;
  } catch {
    return false;
  }
}

export async function getServiceToken(customerId: string, id: string): Promise<string | null> {
  if (!BASE) return null;
  try {
    const r = await cp<{ token: string | null }>(`/v1/services/${id}/token`, { customerId });
    return r.token;
  } catch {
    return null;
  }
}

export type AdminServiceInstance = ServiceInstance & {
  username?: string; ownerEmail?: string | null; subdomain?: string; namespace?: string;
};

export async function adminListServices(): Promise<AdminServiceInstance[]> {
  if (!BASE) return [];
  try { return await cp<AdminServiceInstance[]>("/v1/admin/services", { admin: true }); }
  catch { return []; }
}

export async function adminDeprovision(id: string): Promise<boolean> {
  if (!BASE) return false;
  try { await cp(`/v1/admin/services/${id}`, { method: "DELETE", admin: true }); return true; }
  catch { return false; }
}

export async function adminServiceAction(
  id: string,
  action: "start" | "stop" | "restart" | "reinstall" | "regenerate-token" | "backup",
): Promise<boolean> {
  if (!BASE) return false;
  try {
    await cp(`/v1/admin/services/${id}/${action}`, { method: "POST", admin: true });
    return true;
  } catch {
    return false;
  }
}

export interface ClusterSummary {
  reachable: boolean;
  nodes: { ready: number; total: number };
  pods: { running: number; pending: number; failed: number; total: number };
  namespaces: number;
}

export async function adminClusterSummary(): Promise<ClusterSummary> {
  const empty: ClusterSummary = {
    reachable: false,
    nodes: { ready: 0, total: 0 },
    pods: { running: 0, pending: 0, failed: 0, total: 0 },
    namespaces: 0,
  };
  if (!BASE) return empty;
  try { return await cp<ClusterSummary>("/v1/admin/cluster", { admin: true }); }
  catch { return empty; }
}

// Stripe Billing Portal (Phase 4) — Endpunkt optional; null => UI zeigt Hinweis.
export async function billingPortal(customerId: string): Promise<string | null> {
  if (!BASE) return null;
  try {
    const r = await cp<{ url: string }>("/v1/billing/portal", { method: "POST", customerId });
    return r.url;
  } catch {
    return null;
  }
}
