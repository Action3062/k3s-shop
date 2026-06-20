# Tenant-Template

Vorlage, die die **Control-Plane pro Tenant rendert** (Platzhalter ersetzen) und
*vor* der HelmRelease anwendet — so existiert der Namespace mit Quota/Limits/NetworkPolicy,
bevor die App startet.

Platzhalter: `__NAMESPACE__`, `__TENANT__`, `__APP__`,
`__CPU_REQUEST__`, `__MEM_REQUEST__`, `__CPU_LIMIT__`, `__MEM_LIMIT__`, `__STORAGE__`.

Namenskonvention: Namespace `tenant-<kunde>-<app>`, Subdomain `<username>.<appname>.dyndnsv4.de`.
Mandanten-/App-Labels (nur von der Plattform gesetzt): `dynstore.io/tenant`, `dynstore.io/app`.

## Isolationsmodell

`default-deny` (Ingress+Egress) als Boden. Darauf gezielte Allow-Regeln:

- **Ingress:** nur aus der `traefik`-Namespace **und** aus Namespaces mit
  gleichem `dynstore.io/tenant`.
- **Egress:** CoreDNS + Internet (private Bereiche 10/172.16/192.168 geblockt)
  **und** zu Namespaces mit gleichem `dynstore.io/tenant`.

**Mandantengrenze = Label `dynstore.io/tenant`.** Apps **desselben** Kunden
(mehrere Namespaces `tenant-<kunde>-<app>`, gleicher Tenant-Wert) duerfen
miteinander kommunizieren (z. B. seerr -> sonarr/radarr). **Andere Kunden**
tragen einen anderen Tenant-Wert und sind strukturell ausgeschlossen; fremde
Cluster-Namespaces (ausser `traefik`/`kube-system`) bleiben ebenfalls blockiert.

Das Label setzt ausschliesslich die Plattform (gerendertes `namespace.yaml`, via
GitOps committet). Tenants haben keinen Cluster-Schreibzugriff und koennen es
nicht faelschen — deshalb traegt der `namespaceSelector` als Mandantenanker.

### Feingranular (optional)

`networkpolicy-app-link.example.yaml` zeigt die engere Variante: statt offener
Intra-Tenant-Kommunikation nur **eine** App-Beziehung (Quell-App -> Ziel-App:Port).
Nicht automatisch gerendert — bei Bedarf in `TEMPLATE_FILES`
(`services/control-plane/src/services/templates.ts`) aufnehmen, die noetigen
Platzhalter ergaenzen und die offenen `allow-intra-tenant-*`-Regeln entfernen.

Hintergrund & Begruendung: `docs/mandanten-isolation-k8s-architektur.md`.
