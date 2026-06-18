export interface CatalogPlan {
  id: string; name: string; priceCents: number; interval: string; storageGi: number;
}
export interface CatalogApp {
  slug: string; name: string; description: string; logoUrl?: string | null;
  category?: string | null; plans: CatalogPlan[];
}
export interface ServiceInstance {
  id: string; appSlug: string; name: string; status: string; url: string;
  subdomain: string; namespace: string; storageGi: number; createdAt: string;
  suspendedAt?: string | null; deprovisionAfter?: string | null; lastBackupAt?: string | null;
}
