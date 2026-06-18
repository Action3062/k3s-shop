# ADR-0001 — Grundsatzentscheidungen (Fundament)

- **Status:** Accepted (2026-06-18). Ein Punkt offen: CNI (Entscheidung 3) — wird nach Live-Verifikation finalisiert.
- **Kontext-Tag:** Phase 0

## Kontext

DynStore ist eine self-service Multi-Tenant-Hosting-Plattform (ElfHosted-Stil) auf **bestehender** Infrastruktur — diese wird genutzt, nicht neu gebaut:

- k3s HA-Cluster bei Hetzner (3 Control-Plane-Nodes, x86 `cx23`, `allow_scheduling_on_control_plane=true`, k3s v1.33), provisioniert via kube-hetzner (openSUSE MicroOS).
- Traefik als Ingress-Controller; cert-manager mit ClusterIssuer `letsencrypt-prod` (HTTP-01).
- hcloud-csi, StorageClass `hcloud-volumes` (RWO, WaitForFirstConsumer).
- Hetzner Load Balancer `91.98.1.85` (80/443). PowerDNS autoritativ für `dyndnsv4.de` (ns1/ns2).
- Funktionierende Referenz: Vaultwarden (NS + PVC + Deployment `Recreate` + Service:80 + Ingress + TLS).

Ziel: produktionsreifer MVP, fokussiert startend, sauber erweiterbar.

## Entscheidungen

### 1. Repo-Struktur — Monorepo
`apps/` (Frontend), `services/` (Control-Plane), `platform/` (GitOps), `docs/`. **Warum:** ein API-Vertrag, atomare Cross-Cutting-Änderungen, GitOps-Verzeichnis lebt neben dem Code. **Trade-off:** Repo wird groß; durch klare Top-Level-Grenzen handhabbar.

### 2. GitOps-Engine — Flux
**Warum:** Die `HelmRelease`-CRD passt ideal zum programmatischen Pro-Tenant-Provisioning (Control-Plane committet YAML → helm-controller rollt aus); leichtgewichtig auf 3 Nodes; native SOPS-Entschlüsselung; entspricht der ElfHosted-Referenz. **Alternative ArgoCD** (stärkere UI via ApplicationSet) verworfen wegen höherem Overhead — Betreiber-Sichtbarkeit liefern wir über Dashboard/`flux`-CLI. **Konsequenz:** Git ist Source of Truth; einziger Schreiber Richtung Cluster ist Flux.

### 3. CNI / Mandanten-Isolation — verify-first *(offen)*
k3s bringt standardmäßig einen NetworkPolicy-Controller (kube-router-basiert) mit — auch mit Flannel. Ob kube-hetzner das aktiv lässt, ist am Live-Cluster zu **verifizieren** (Phase-1-Task).
- **Falls NetworkPolicies durchgesetzt werden** → bei Flannel bleiben; Isolation via default-deny NetworkPolicy + ResourceQuota + LimitRange.
- **Falls nicht** → Cilium (kube-hetzner-unterstützt). **Trade-off:** CNI-Migration am laufenden HA-Cluster ist invasiv (ggf. kontrollierter Rebuild) → **vor Durchführung Betreiber-Rückfrage.**

Bis zur Verifikation werden NetworkPolicies geschrieben, deren Enforcement aber nicht vorausgesetzt.

### 4. Backend — separater Control-Plane-Service + Next.js BFF
Provisioning, Lifecycle und Stripe-Webhooks als eigener Node/TS-Dienst (privilegiert, zustandsbehaftet, idempotent, queue-fähig, separat skalierbar; Zugriff auf Git + K8s-API). Next.js liefert Storefront + Auth + dünne BFF-Schicht und ruft die Control-Plane über den API-Vertrag. **Warum nicht alles in Next.js API-Routes:** langlaufende/privilegierte Logik gehört nicht in den Request-Lifecycle des Frontends. **Trade-off:** zwei Deployables + ein Vertrag — bewusst akzeptiert.

### 5. TLS/DNS — ein Wildcard-Zertifikat via DNS-01 (PowerDNS)
Ein Wildcard-Zertifikat `*.<appname>.dyndnsv4.de` über cert-manager **DNS-01** gegen PowerDNS (RFC2136/TSIG **oder** PowerDNS-Webhook-Solver — in Phase 1 evaluieren) + Wildcard-A-Record `*.apps → 91.98.1.85`. **Warum:** KEIN Zertifikat pro Subdomain (Let's-Encrypt-Rate-Limits); jede neue Subdomain funktioniert sofort. Der bestehende HTTP-01-Issuer bleibt für `store.dyndnsv4.de` nutzbar.

### 6. Secrets — SOPS + age (Flux-native)
GitOps-Secrets via SOPS/age (Flux entschlüsselt im Cluster). Runtime-Secrets der Control-Plane via K8s-Secret/Env. **Keine** echten Tokens im Git; `.env.example` nur Platzhalter; echte Werte liefert der Betreiber. **Alternative** Sealed Secrets möglich; SOPS gewählt wegen Flux-Integration + Diffbarkeit.

### 7. Mandanten-Modell — Namespace pro Tenant
Pro Kunde/Dienst ein Namespace + ResourceQuota + LimitRange + NetworkPolicy (default-deny + erlaubter Ingress von Traefik + DNS). Subdomain-Schema `<username>.<appname>.dyndnsv4.de`.

### 8. Provisioning-Pfad
**Zielbild:** Control-Plane schreibt `HelmRelease` nach `platform/tenants/` → Flux reconciled. **MVP-Iteration 1** darf direkten K8s/Helm-Zugriff nutzen, muss aber auf das GitOps-Modell zulaufen (gleiche Werte/gleiches Chart).

## Konsequenzen

- Klare Trennung Frontend / Control-Plane / Platform.
- Skalierung neuer Apps = Daten + Chart, kein Code-Sonderfall (siehe README „Eine neue App hinzufügen").
- **Offene Punkte für Phase 1:** CNI-Verifikation; PowerDNS-Solver-Variante (RFC2136 vs. Webhook); Backup-Mechanismus (voraussichtlich hcloud-CSI VolumeSnapshots).

---

## Update (2026-06-18) — Verifikationsergebnis (Phase 1, read-only)

- **Entscheidung 3 (CNI) aufgelöst:** CNI ist **Flannel**; `--disable-network-policy` ist **nicht** gesetzt → k3s setzt NetworkPolicies durch. → **Kein Cilium.** Isolation via default-deny NetworkPolicy + ResourceQuota + LimitRange (Smoke-Test beim ersten Apply).
- **Domain bestätigt:** Tenant-Apps unter `*.<appname>.dyndnsv4.de`; Storefront `store.dyndnsv4.de`. (Bestehendes `vault.dyn.dyndnsv4.de` bleibt manuelle Referenz.)
- **TLS-Mechanik festgelegt:** ein Wildcard-Cert `*.<appname>.dyndnsv4.de` (DNS-01) im `traefik`-NS + Traefik `TLSStore default` → kein Zertifikat/Secret pro Tenant.
- Details: siehe `docs/cluster-state.md` und `docs/runbook-phase1.md`.

---

## Update (2026-06-18) — Domain-Schema & DNS-Provider geändert

- **Domain-Schema:** `<username>.<appname>.dyndnsv4.de` (Username bei Registrierung gewählt; appname = App-Slug). Storefront `store.dyndnsv4.de`.
- **DNS-Provider:** **dynDNSv4** (dyndnsv4.de) — DynDNS-Update-API (`panel.dyndnsv4.de/nic/update`, A/AAAA, Token) + **ACME-DNS-01-API** für Let's-Encrypt-Wildcards. Ersetzt den direkten PowerDNS/RFC2136-Ansatz aus Entscheidung 5.
- **TLS:** **ein Wildcard-Zertifikat pro App** (`*.<appname>.dyndnsv4.de`), zentral via cert-manager (`letsencrypt-dyndnsv4`, acmeDNS-Solver) ausgestellt und per **Reflector** in die Tenant-Namespaces gespiegelt. (Das frühere globale Traefik-Default-Cert entfällt — ein Default-Cert deckt mehrere App-Wildcards nicht ab.)
- **Datenmodell:** `User.username` (unique) + `ServiceInstance.username` ergänzt.
- **Offen:** dynDNSv4-Tarif/Account-Fähigkeiten (geschachtelte Subdomains, Wildcards, Anzahl Domains); cert-manager↔dynDNSv4-Solver (acme-dns vs. Webhook); wildcard-per-app vs. Record-pro-Tenant.

## Update (2026-06-18) — DNS/TLS finalisiert

- Betreiber betreibt dynDNSv4 **selbst** (PowerDNS-Backend, volle Kontrolle).
- **DNS:** Wildcard **pro App** `*.<appname>.dyndnsv4.de → 91.98.1.85` (einmalig je App), kein DNS-Call pro Tenant (`DNS_MODE=wildcard-per-app`). dynDNSv4 spricht dyndns2 für A/AAAA-Updates.
- **TLS:** cert-manager **DNS-01 via RFC2136/TSIG gegen PowerDNS** (`letsencrypt-dyndnsv4`), Wildcard-Cert je App, per Reflector in Tenant-NS gespiegelt. (acme-dns/Webhook verworfen — direkter PowerDNS-Weg ist robuster, da Betreiber die DNS kontrolliert.)
