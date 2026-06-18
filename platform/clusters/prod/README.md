# Flux — Cluster `prod`

Einstiegspunkt für Flux. `flux bootstrap` erzeugt hier zusätzlich `flux-system/`
(GitRepository `flux-system` + die Root-Kustomization).

## Bootstrap (Phase 1, beim Anwenden)

```bash
export KUBECONFIG=/home/admin/k3s-hz_kubeconfig.yaml
export GITHUB_TOKEN=...        # PAT mit repo-Scope
flux bootstrap github \
  --owner=<ORG> --repository=dynstore \
  --branch=main --path=platform/clusters/prod \
  --personal
```

Danach SOPS-Age-Secret im Cluster anlegen (für entschlüsselte HelmReleases/Secrets):

```bash
kubectl -n flux-system create secret generic sops-age \
  --from-file=age.agekey=/path/to/age.key
```

Reconcile-Reihenfolge: `infrastructure` → `tenants`.
