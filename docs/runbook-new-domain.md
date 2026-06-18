# Runbook — Eigene Produktiv-Domain anbinden (z. B. MeinAppNest.de)

Ziel: Storefront unter `MeinAppNest.de` / `store.MeinAppNest.de`, Tenant-Apps unter
`<username>.<appname>.MeinAppNest.de` mit **automatischem Wildcard-TLS**.

## Kernpunkt
Die **Standard-Nameserver von checkdomain** reichen, um die Domain zu *zeigen* — aber NICHT
für automatisches Wildcard-TLS (cert-manager muss `_acme-challenge`-TXT automatisch schreiben,
~alle 60 Tage je App; Wildcards gehen nur über DNS-01). Lösung: Domain bei checkdomain an eine
**API-/RFC2136-fähige DNS delegieren**. Eigene NS komplett neu aufsetzen ist NICHT nötig.

## Ablauf (anbieter-unabhängig)
1. Domain bei checkdomain bestellen.
2. Bei checkdomain die **Nameserver der Domain** auf den gewählten DNS-Anbieter ändern (Delegation).
3. Im DNS-Anbieter Records anlegen:
   - `MeinAppNest.de`, `www`, `store` → A `91.98.1.85` (+ AAAA, falls IPv6).
   - pro Katalog-App: `*.<appname>.MeinAppNest.de` → A `91.98.1.85` (deckt alle Kunden der App).
4. cert-manager DNS-01 stellt Wildcard-Zertifikate `*.<appname>.MeinAppNest.de` automatisch aus.

## Option A — eigene PowerDNS (dein dynDNSv4)  [empfohlen, self-hosted/DE]
- checkdomain-NS auf deine PowerDNS-NS zeigen (ns1/ns2 von dynDNSv4).
- Admin aktiviert für die Zone: `dnsupdate=yes` + Update-TSIG-Key
  (`pdnsutil generate-tsig-key acme-update hmac-sha256` + `set-meta MeinAppNest.de TSIG-ALLOW-DNSUPDATE acme-update`).
- Du gibst mir: Nameserver-IP, TSIG Keyname/Algorithmus/Secret.
- Nutzt unseren **bestehenden** RFC2136-Issuer (`platform/infrastructure/cert-manager/clusterissuer-dns01.yaml`).

## Option B — deSEC.io  [managed, Berlin, kostenlos]
- Account + Zone `MeinAppNest.de` anlegen; checkdomain-NS auf deSEC zeigen.
- TSIG/Token erzeugen → cert-manager RFC2136 (eingebaut) — gleicher Issuer-Typ wie A.

## Option C — Cloudflare / Hetzner DNS  [managed, API-Webhook]
- checkdomain-NS auf den Anbieter zeigen.
- Cloudflare: cert-manager nativ (scoped API-Token) — am einfachsten, aber US.
- Hetzner DNS: DE, via cert-manager-Webhook + API-Token.

## Was ich dann im Repo/Cluster umstelle (1x je Domain)
- `APPS_BASE_DOMAIN=MeinAppNest.de` (Control-Plane env) + `.env.example`.
- cert-manager: ClusterIssuer (Email + Solver-Creds des Anbieters) + pro App ein
  `Certificate *.<appname>.MeinAppNest.de` (+ Reflector in Tenant-NS).
- Storefront: `NEXT_PUBLIC_APP_URL=https://store.MeinAppNest.de` + Ingress-Host; Apex/`www`.
- Tenant-Naming/HelmRelease `baseDomain` → MeinAppNest.de.
- README/ADR aktualisieren; `*.vaultwarden.dyndnsv4.de`-Provisorium ablösen.

## Hinweise
- Wildcard ist **einstufig**: `*.vaultwarden.MeinAppNest.de` deckt `kunde.vaultwarden…` — passt zum Schema.
- DNS-Wechsel/Delegation braucht Propagation (Minuten–Stunden); LE-Staging zum Testen nutzen.
- Sovereignty/DSGVO: A oder B bleiben EU/DE; Cloudflare = US (nur DNS, keine Inhalte).

---

## Option D — Domain bei Cloudflare (Registrar + DNS)  [einfachster Auto-TLS-Weg]

Cloudflare ist Registrar **und** authoritative DNS in einem → keine Delegation nötig, und
cert-manager unterstützt Cloudflare **nativ** (kein Webhook/TSIG).

Schritte:
1. Domain im **Cloudflare Registrar** kaufen → Zone liegt sofort auf Cloudflare-NS.
2. **API-Token** anlegen: Permissions *Zone → DNS → Edit*, Scope nur diese Zone. Als
   K8s-Secret (SOPS) `cloudflare-api-token` in `cert-manager` ablegen.
3. ClusterIssuer (Beispiel):
   ```yaml
   apiVersion: cert-manager.io/v1
   kind: ClusterIssuer
   metadata: { name: letsencrypt-cloudflare }
   spec:
     acme:
       server: https://acme-v02.api.letsencrypt.org/directory
       email: __ACME_EMAIL__
       privateKeySecretRef: { name: letsencrypt-cloudflare-key }
       solvers:
         - dns01:
             cloudflare:
               apiTokenSecretRef: { name: cloudflare-api-token, key: api-token }
             selector: { dnsNames: ["*.vaultwarden.MeinAppNest.de"] }
   ```
4. DNS-Records (Dashboard/API): `MeinAppNest.de`, `store`, `www` → A `91.98.1.85` (+AAAA);
   pro App `*.<appname>` → A `91.98.1.85`.
5. **WICHTIG: Records auf „DNS only" (graue Wolke), nicht proxied.** Cloudflares kostenloses
   Universal-SSL deckt nur EINE Subdomain-Ebene ab (`*.MeinAppNest.de`), NICHT zweistufig
   (`*.<appname>.MeinAppNest.de`). Grau = Traffic direkt zum LB, Traefik+LE am Origin → unser
   Wildcard-per-App greift, kein bezahltes Cloudflare ACM nötig.
   (Optional später: Proxy/CDN/DDoS davor → braucht Advanced Certificate Manager, kostenpflichtig.)

Vorteile: voll automatisch, kostenlos, kein PowerDNS-API-Exposure/kein TSIG; cert-manager-
Cloudflare ist Erste-Wahl-Integration. Nachteil ggü. A/B: US-Anbieter (nur DNS, keine Inhalte).

Repo-Änderungen wie oben („Was ich dann im Repo/Cluster umstelle"), Issuer = `letsencrypt-cloudflare`.

---

## ✅ DONE (2026-06-18) — meinappnest.org live (Option D: Cloudflare)

Cutover vollzogen: Cloudflare DNS (DNS-only) + ClusterIssuer `letsencrypt-cloudflare` (DNS-01) + Wildcard-Cert `*.vaultwarden.meinappnest.org` + Reflector (kube-system). `store.meinappnest.org` und `thomas.vaultwarden.meinappnest.org` sind HTTPS-gruen (HTTP 200, LE-Wildcard). `*.dyndnsv4.de` ist als MeinAppNest-Domain stillgelegt (nur unverwandtes `vault.dyn.dyndnsv4.de` bleibt).
