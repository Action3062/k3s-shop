# Control-Plane (`services/control-plane`)

Node.js/TypeScript-Dienst: Provisioning-Engine, Lifecycle, REST-API (siehe [`../../docs/api-contract.md`](../../docs/api-contract.md)) und Stripe-Webhooks.

**Status:** Phase 0 — nur Datenmodell (`prisma/schema.prisma`). Implementierung folgt in Phase 2/4.

## Verantwortlichkeiten

- **Provisioning:** Tenant anlegen → `HelmRelease` nach `platform/tenants/` committen (Flux reconciled).
- **Lifecycle:** suspend (`replicas:0`), resume, deprovision nach Karenz (mit vorherigem Backup).
- **Idempotenz:** Job-Verarbeitung über `ProvisioningJob`; Stripe-Webhook-Dedup über `WebhookEvent`.

## Hinweise

- Secrets via Env/K8s-Secret (siehe [`../../.env.example`](../../.env.example)). **Keine** echten Werte im Git.
- Einziger Schreiber Richtung Cluster ist Flux — die Control-Plane schreibt nach Git, nicht direkt in den Cluster (Ausnahme: MVP-Iteration 1, siehe ADR-0001 §8).
