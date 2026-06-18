# Infrastructure (Flux-managed)

Cluster-weite Ressourcen — von Flux nach `platform/clusters/prod/infrastructure.yaml` ausgerollt.

## Domain-Schema
`<username>.<appname>.dyndnsv4.de` (z. B. `thomas.vaultwarden.dyndnsv4.de`).
Storefront: `store.dyndnsv4.de`.

## TLS-Modell
- **Ein Wildcard-Zertifikat pro App**: `*.<appname>.dyndnsv4.de` deckt alle Kunden der App ab → respektiert LE-Rate-Limits.
- cert-manager **DNS-01** via **RFC2136/TSIG gegen deine PowerDNS** (ClusterIssuer `letsencrypt-dyndnsv4`) — du betreibst dynDNSv4 selbst, daher der direkte, eingebaute Weg.
- Wildcard-Secret zentral in `cert-manager`, per **Reflector** (emberstack) in alle `tenant-*-<app>`-Namespaces gespiegelt; Tenant-Ingress referenziert `wildcard-<app>-tls`.

## DNS
- Tenant-Hosts → Hetzner-LB `91.98.1.85` (+ optional IPv6).
- **`wildcard-per-app` (empfohlen):** je App einmalig `*.<appname>.dyndnsv4.de → LB` → kein DNS-Call pro Tenant.
- **`per-tenant`:** Control-Plane setzt `username.appname… → LB` je Kunde via dynDNSv4-Update-API.

## Betreiber-Eingaben (vor dem Anwenden)
1. **dynDNSv4-Account** + Token. Klärung: geschachtelte Subdomains + Wildcards möglich? Tarif-Limit für „Domains"?
2. **PowerDNS RFC2136/TSIG**: Nameserver-IP + TSIG-Key (Name/Algorithmus/Secret); `dnsupdate`/TSIG für die Zone aktiviert.
3. **ACME-E-Mail** (`__ACME_EMAIL__`).
4. **Reflector** (emberstack) installieren.
5. Secrets via SOPS verschlüsseln; nichts im Klartext.
