# Platform — GitOps Source of Truth

Von **Flux** reconciled. Hier liegt der deklarative Cluster-Zustand.

## Struktur (wird in Phase 1 befüllt)

| Pfad | Inhalt |
|---|---|
| `clusters/prod/` | Flux-Einstieg (GitRepository + Kustomizations) |
| `infrastructure/` | Wildcard-Cert (`*.<appname>.meinappnest.org`), DNS-01-Issuer (Cloudflare ACME-DNS-01), gemeinsame Ressourcen |
| `catalog/` | 1 Helm-Chart pro App (Muster: `vaultwarden/`) |
| `tenant-template/` | Namespace + ResourceQuota + LimitRange + NetworkPolicy (Vorlage) |
| `tenants/` | pro Tenant generierte `HelmRelease`s (von der Control-Plane committet) |

## Regeln

- **Keine Klartext-Secrets.** Verschlüsselung via SOPS/age (Flux entschlüsselt im Cluster).
- **Ein Wildcard-Zertifikat** statt eines pro Subdomain (Let's-Encrypt-Rate-Limits).
- Tenants generiert die Control-Plane; manuelle Test-Tenants in Phase 1.
- Einziger Schreiber Richtung Cluster ist Flux.
