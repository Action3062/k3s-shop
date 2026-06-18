# Tenant-Template

Vorlage, die die **Control-Plane pro Tenant rendert** (Platzhalter ersetzen) und
*vor* der HelmRelease anwendet — so existiert der Namespace mit Quota/Limits/NetworkPolicy,
bevor die App startet.

Platzhalter: `__NAMESPACE__`, `__TENANT__`, `__APP__`,
`__CPU_REQUEST__`, `__MEM_REQUEST__`, `__CPU_LIMIT__`, `__MEM_LIMIT__`, `__STORAGE__`.

Namenskonvention: Namespace `tenant-<kunde>-<app>`, Subdomain `<username>.<appname>.dyndnsv4.de`.

Isolation: `default-deny` (Ingress+Egress), erlaubt nur Ingress aus der `traefik`-Namespace
und Egress zu CoreDNS + Internet (private Bereiche 10/172.16/192.168 geblockt → keine
Tenant-zu-Tenant- oder Cluster-interne Kommunikation).
