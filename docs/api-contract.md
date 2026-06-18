# API-Vertrag — Storefront (Next.js) ↔ Control-Plane

Status: **Entwurf (Phase 0)**. Base URL der Control-Plane: `CONTROL_PLANE_URL` (clusterintern).

## Konventionen

- JSON über HTTPS. Zeiten ISO-8601 (UTC).
- **Auth:** Storefront authentifiziert Endkunden (Session/JWT). Server-zu-Server-Calls an die Control-Plane tragen ein Service-Token (`Authorization: Bearer <CP_SERVICE_TOKEN>`) + Kundenkontext (`X-Customer-Id`). Stripe-Webhooks gehen direkt an die Control-Plane (signiert).
- **Idempotenz:** Mutierende Calls akzeptieren einen `Idempotency-Key`-Header; die Control-Plane dedupliziert über `ProvisioningJob.idempotencyKey`.
- **Fehlerformat:** `{ "error": { "code": string, "message": string, "details"?: any } }` mit passendem HTTP-Status (400/401/403/404/409/422/429/5xx).

## Endpoints

### Katalog (öffentlich)
- `GET /v1/catalog` → `[{ slug, name, description, logoUrl, category, plans: [{ id, name, priceCents, interval, storageGi }] }]`
- `GET /v1/catalog/{slug}` → einzelner Eintrag mit Details

### Checkout / Subscription (authentifiziert)
- `POST /v1/checkout/session` — body `{ planId }` → `{ checkoutUrl }` (Control-Plane erstellt Stripe-Checkout-Session)
- `POST /v1/portal/session` → `{ portalUrl }` (Stripe Customer Portal)

### Meine Dienste (authentifiziert)
- `GET /v1/me/services` → `[ServiceInstance]`
- `GET /v1/services/{id}` → `ServiceInstance`
- `DELETE /v1/services/{id}` → plant Kündigung/Deprovision nach Karenz (oder verweist auf Stripe-Portal) → `202`

### Lifecycle (intern / admin)
- `POST /v1/services/{id}/suspend` → `replicas:0` (z. B. bei `payment_failed`)
- `POST /v1/services/{id}/resume`
- `POST /v1/services/{id}/backup`

### Stripe (Webhook, signiert)
- `POST /v1/stripe/webhook` — Header `Stripe-Signature`. Verarbeitet:
  - `checkout.session.completed` → **provision**
  - `invoice.payment_failed` → **suspend**
  - `customer.subscription.deleted` → **deprovision** (nach Karenz, mit Backup)
  - Antwort `200` erst nach idempotenter Persistenz (`WebhookEvent`-Dedupe über `stripeEventId`).

## ServiceInstance (Shape)

```json
{
  "id": "string",
  "appSlug": "vaultwarden",
  "name": "string",
  "status": "RUNNING",
  "url": "https://thomas.vaultwarden.dyndnsv4.de",
  "subdomain": "thomas.vaultwarden",
  "namespace": "tenant-thomas-vaultwarden",
  "storageGi": 5,
  "createdAt": "2026-06-18T10:00:00Z",
  "suspendedAt": null,
  "deprovisionAfter": null,
  "lastBackupAt": null
}
```

`status` ∈ `PENDING | PROVISIONING | RUNNING | SUSPENDED | DEPROVISIONING | DEPROVISIONED | FAILED`

## Provisioning-Statusmaschine

```
PENDING → PROVISIONING → RUNNING → (SUSPENDED ⇄ RUNNING) → DEPROVISIONING → DEPROVISIONED
                                                  └── FAILED (aus jedem Schritt, mit Retry)
```

Jeder Übergang ist ein idempotenter `ProvisioningJob` (`QUEUED → RUNNING → SUCCEEDED|FAILED`) mit Retries und `lastError`.
