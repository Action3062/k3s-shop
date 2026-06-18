# DynStore

> Self-service Multi-Tenant-Hosting-Plattform (ElfHosted-Stil) auf einem bestehenden **k3s**-HA-Cluster bei Hetzner. Kunden abonnieren im Store eine self-hosted App und erhalten wenige Minuten später eine laufende, isolierte Instanz unter `https://<username>.<appname>.meinappnest.org` — inklusive eigener Subdomain und HTTPS.

*Arbeitsname — gern umbenennen.* Status: **Phase 0 (Fundament)**. Siehe [Roadmap](#roadmap).

---

## Was DynStore tut

1. Kunde besucht den Store (`store.meinappnest.org`), wählt eine App, registriert sich.
2. Kunde abonniert (Stripe Checkout).
3. Auf `checkout.session.completed` provisioniert die **Control-Plane** automatisch eine isolierte Instanz: eigener Namespace → App via Helm/GitOps → PVC → Ingress + TLS → Subdomain.
4. Im Dashboard „Meine Dienste" sieht der Kunde Status, URL, und kann verwalten/kündigen.
5. Lebenszyklus über Stripe-Webhooks: Zahlung fehlgeschlagen → **suspend** (`replicas: 0`); gekündigt → **deprovision** nach Karenzzeit (mit vorherigem Backup).

## Architektur (Überblick)

```
                 store.meinappnest.org                 *.<appname>.meinappnest.org
                        │                                   │
                        ▼                                   ▼
              ┌───────────────────┐                ┌──────────────────┐
   Kunde ───▶ │ Storefront (Next) │                │  Tenant-Apps      │
              │  + Auth / BFF     │                │  (1 NS pro Tenant)│
              └─────────┬─────────┘                └──────────────────┘
                        │ REST (API-Vertrag)                 ▲
                        ▼                                     │ reconciled
              ┌───────────────────┐   git commit    ┌────────┴─────────┐
              │  Control-Plane    │ ──────────────▶ │  Git (platform/) │
              │  Provisioning +   │                 │  HelmReleases     │
              │  Lifecycle + API  │ ◀── Stripe WH   └────────┬─────────┘
              └─────────┬─────────┘                          │ Flux
                        │                                     ▼
                   ┌────┴─────┐                       ┌──────────────┐
                   │ Postgres │                       │ k3s-Cluster  │
                   └──────────┘                       │ Traefik/cert │
                                                      └──────────────┘
```

Provisioning-Prinzip: Die Control-Plane **schreibt** pro Tenant eine `HelmRelease` ins Git-Repo (`platform/tenants/`), **Flux** gleicht den Cluster ab. (Für die allererste MVP-Iteration ist direkter K8s-API-Zugriff akzeptabel, das Design läuft aber auf GitOps zu — siehe [ADR-0001](docs/adr/0001-foundations.md).)

## Tech-Stack

| Bereich | Wahl |
|---|---|
| Frontend | Next.js 14 (App Router), TypeScript, Tailwind, Dark Mode |
| Control-Plane | Node.js/TypeScript (separater Service) |
| Datenbank | PostgreSQL via Prisma |
| Bezahlung | Stripe (Checkout + Customer Portal + Webhooks) |
| Ausrollen | 1 Helm-Chart pro App, ausgeliefert via **Flux** (GitOps) |
| Ingress / TLS | Traefik + cert-manager, **ein Wildcard-Zertifikat pro App** `*.<appname>.meinappnest.org` (DNS-01 via Cloudflare) |
| DNS | **Cloudflare** (Registrar + DNS, DNS-01), Wildcard pro App `*.<appname> → 91.98.1.85` |
| Isolation | Namespace pro Tenant + ResourceQuota + LimitRange + NetworkPolicy |
| Secrets | SOPS + age (Flux-native), keine Klartext-Secrets im Git |

Begründungen und Trade-offs: **[ADR-0001](docs/adr/0001-foundations.md)**.

## Repo-Layout (Monorepo)

```
.
├── apps/
│   └── storefront/          # Next.js 14 Storefront + Dashboard (Phase 3)
├── services/
│   └── control-plane/       # Provisioning-Engine, Lifecycle, REST-API, Stripe (Phase 2/4)
│       └── prisma/schema.prisma
├── platform/                # GitOps Source of Truth (Flux)
│   ├── clusters/prod/        # Flux-Einstieg (Kustomizations)
│   ├── infrastructure/       # Wildcard-Cert, DNS-01-Issuer, gemeinsame Ressourcen
│   ├── catalog/              # 1 Helm-Chart pro App (z. B. vaultwarden/)
│   ├── tenant-template/      # NS + Quota + LimitRange + NetworkPolicy (Vorlage)
│   └── tenants/              # generierte HelmReleases pro Tenant (von Control-Plane committet)
└── docs/
    ├── adr/                  # Architecture Decision Records
    └── api-contract.md       # Vertrag Frontend ↔ Control-Plane
```

## Domains

- Storefront: `store.meinappnest.org`
- Tenant-Apps: `*.<appname>.meinappnest.org` (Schema: `<username>.<appname>.meinappnest.org`)

## Eine neue App zum Katalog hinzufügen

Ziel: Eine neue App ist „nur Daten" — kein Sonderfall im Code.

1. Helm-Chart unter `platform/catalog/<app>/` anlegen (Muster: `vaultwarden/`). Es muss Namespace-, PVC- (`hcloud-volumes`), Deployment-, Service:80-, Ingress- und TLS-Werte aus `values` parametrisieren (Subdomain, Storage-Größe, Limits).
2. Katalog-Eintrag in der DB anlegen (`CatalogApp` + `Plan` mit `stripePriceId`) — siehe `services/control-plane/prisma/schema.prisma`.
3. Offizielles App-Logo unter `apps/storefront/public/logos/<app>.svg` ablegen (echte Logos, **keine** KI-Nachbauten).
4. Fertig — Storefront listet die App automatisch, Provisioning nutzt das Chart über eine generierte `HelmRelease`.

## Roadmap

- [x] **Phase 0** — Fundament: Repo-Scaffolding + ADR (GitOps/CNI/Backend/Repo/API/Datenmodell)
- [ ] **Phase 1** — Infra: Wildcard-DNS + Wildcard-TLS (Cloudflare DNS-01), Flux, Tenant-Namespace-Template, Vaultwarden-Chart, 1 Test-Tenant via GitOps
- [ ] **Phase 2** — Control-Plane: Prisma-Migrations, Provisioning-Engine, Basis-API
- [ ] **Phase 3** — Storefront + Dashboard: Design + higgsfield-Assets + Auth
- [ ] **Phase 4** — Billing: Stripe Checkout + Webhooks → Provisioning/Lifecycle
- [ ] **Phase 5** — Abschluss: E2E-Test, Security-Review, Doku

## Leitplanken

- **Keine echten Secrets im Git.** Platzhalter + Secret-Mechanismus (SOPS/age bzw. Sealed Secrets). Echte Werte liefert der Betreiber lokal/im Cluster.
- **Let's-Encrypt-Rate-Limits respektieren** → ein Wildcard-Zertifikat statt eines pro Host.
- **Provisioning & Webhooks idempotent** (Teilfehler, Retries, Karenzzeiten).
- **Vor destruktiven Cluster-Aktionen** (Namespace/Volume löschen) und **vor allem, was echtes Geld oder echte Credentials betrifft → Rückfrage an den Betreiber.**

## Cluster-Zugang (Betreiber-Notiz)

Admin-/Proxmox-VM `192.168.20.135` (Debian), SSH-User `admin`. Cluster bei Hetzner (3× Control-Plane, openSUSE MicroOS). `kubectl` von der VM via `KUBECONFIG=/home/admin/k3s-hz_kubeconfig.yaml` (API `5.75.169.117:6443`). Hetzner-LB öffentlich: `91.98.1.85` (80/443).
