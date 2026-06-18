# Runbook — Phase 1 anwenden (mutierend, mit Betreiber)

Domain-Schema: `<username>.<appname>.dyndnsv4.de`. DNS+TLS über **dynDNSv4**.

Voraussetzungen (Betreiber):
- **dynDNSv4-Account** + Token. Geklärt: geschachtelte Subdomains + Wildcards möglich? Tarif-Limit „Domains"?
- **PowerDNS RFC2136/TSIG**: Nameserver-IP + TSIG-Key; `dnsupdate`/TSIG für die Zone aktiv.
- **ACME-E-Mail**.
- **GitOps-Repo** (GitHub `owner/dynstore`) + PAT für `flux bootstrap`.
- **age-Keypair** für SOPS.

Schritte:
1. **DNS (Wildcard pro App):** `*.vaultwarden.dyndnsv4.de → 91.98.1.85` (+ AAAA) in dynDNSv4 anlegen; testen.
2. **TLS (RFC2136):** `__ACME_EMAIL__` + `__POWERDNS_IP__` in `cert-manager/clusterissuer-dns01.yaml` setzen; TSIG-Secret als `powerdns-tsig.sops.yaml` (SOPS) ablegen + in `cert-manager/kustomization.yaml` aktivieren.
3. **Reflector** (emberstack) installieren (HelmRelease).
4. **Flux bootstrap** (siehe `platform/clusters/prod/README.md`) → reconciled `infrastructure` + `tenants`.
5. **Verifizieren:** `kubectl -n cert-manager get certificate wildcard-vaultwarden` → READY=True; Secret-Spiegelung in Tenant-NS prüfen.
6. **Test-Tenant:** Control-Plane provisioniert (oder manuell HelmRelease nach `platform/tenants/<ns>/`) → Flux rollt aus.
7. **Smoke-Test Isolation:** default-deny greift (Tenant-zu-Tenant blockiert, Traefik-Ingress ok).
8. `https://thomas.vaultwarden.dyndnsv4.de` aufrufen.
