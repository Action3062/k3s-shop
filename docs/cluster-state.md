# Verifizierter Cluster-Ist-Zustand (2026-06-18, read-only)

Geprüft über `KUBECONFIG=/home/admin/k3s-hz_kubeconfig.yaml` von der Admin-VM `192.168.20.135`.

## Topologie
- **Admin-VM** `192.168.20.135` (Debian 12 auf Proxmox, Hostname `k3s`): kube-hetzner Terraform
  (`kube.tf`, `terraform.tfstate`), `kubectl`, Kubeconfig, Vaultwarden-Referenzmanifeste.
- **Cluster** (Hetzner): 3× Control-Plane (openSUSE MicroOS, **k3s v1.33.12+k3s1**, containerd),
  Scheduling auf CP erlaubt, **keine Worker**. API: `https://5.75.169.117:6443`.
  Node-External-IPs: 94.130.178.190, 46.224.212.238, 5.75.169.117. LB: `91.98.1.85`.

## Plattform-Komponenten
| Komponente | Status |
|---|---|
| Ingress | Traefik (IngressClass `traefik`, Traefik-Hub-CRDs vorhanden) |
| TLS | cert-manager (3 Pods Running), ClusterIssuer `letsencrypt-prod` READY=True (HTTP-01) |
| Storage | `hcloud-volumes` (default, csi.hetzner.cloud, WaitForFirstConsumer, Expansion an) |
| CNI | **Flannel** (Cilium in kube.tf auskommentiert) |
| NetworkPolicy | **wird durchgesetzt** — `--disable-network-policy` ist in der tfstate NICHT gesetzt (k3s kube-router-Controller aktiv). Smoke-Test beim ersten Policy-Apply. |
| Autoscaler | in kube.tf vorbereitet, deaktiviert (später) |

## Namespaces
cert-manager, default, kube-system, kube-node-lease, kube-public, system-upgrade, traefik, vaultwarden

## Vaultwarden-Referenz (Muster fürs Chart)
- Deployment 1/1, Service `:80` (ClusterIP), Ingress via Traefik, PVC `vaultwarden-data` 10Gi RWO `hcloud-volumes`.
- Aktueller Host: **`vault.dyn.dyndnsv4.de`**, Cert `vaultwarden-tls` READY=True.
- Manifeste auf der Admin-VM: `/home/admin/vaultwarden.yaml`, `/home/admin/vaultwarden-tls.yaml`.

## Entscheidung Domain
Tenant-Apps künftig unter **`*.<appname>.dyndnsv4.de`** (Brief). Storefront: `store.dyndnsv4.de`.
Das bestehende `vault.dyn.dyndnsv4.de` bleibt als manuelle Referenz bestehen.

## Update (2026-06-18) — Domain & DNS
- Tenant-Apps: `<username>.<appname>.dyndnsv4.de` (z. B. `thomas.vaultwarden.dyndnsv4.de`).
- DNS+TLS über **dynDNSv4** (DynDNS-Update-API + ACME-DNS-01). Wildcard pro App.
