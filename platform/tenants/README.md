# Tenants (von der Control-Plane generiert)

Pro verkauftem Dienst committet die Control-Plane hierhin **eine** `HelmRelease`.
Reihenfolge bei der Provisionierung:
1. Tenant-Template rendern & anwenden (Namespace + Quota + LimitRange + NetworkPolicy).
2. HelmRelease hier ablegen → Flux rollt das Katalog-Chart in den Tenant-Namespace aus.

`example-acme-vaultwarden.yaml` ist nur ein **Muster** (nicht anwenden).
