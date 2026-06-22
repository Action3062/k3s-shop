# Runbook: OpenClaw „Zombie"-HelmRelease (failed first install)

## Symptom

Ein gerade bestellter OpenClaw-Tenant bleibt im Dashboard auf
`PROVISIONING`. In Flux sieht es so aus:

```
$ flux -n flux-system get helmrelease <name>-openclaw
NAME                READY MESSAGE
<name>-openclaw     False terminal error: cannot remediate failed release: missing target release for rollback
```

Der zugehörige Pod existiert nicht oder ist in `CrashLoopBackOff`; im
GitOps-Repo liegt nur eine angefangene `helmrelease.yaml` im
Tenant-Verzeichnis, aber keine Resources im Cluster
(`kubectl get ns tenant-<user>-openclaw` zeigt evtl. den Namespace,
aber keinen erfolgreichen Release).

Das ist der Helm-Controller-Edge-Case: wenn die *erste* Installation
fehlschlägt (z. B. Auth-Crash wie damals im Migrationsversuch
9413c29 → 5bc8c08), gibt es keinen vorherigen Release-Stand, auf den
Helm zurückrollen kann → der HR sitzt fest und ignoriert auch
korrigierte Chart-Specs, weil er auf das (nicht existente) Rollback
wartet.

## Wer ist betroffen

Nur OpenClaw, weil dort der Image-Entrypoint historisch zickig war.
Andere Apps haben das Problem in der Praxis nicht ausgelöst.

## Diagnose

```bash
# 1. Tenant-Status im Cluster
kubectl get ns tenant-<user>-openclaw
kubectl -n tenant-<user>-openclaw get all,pvc

# 2. HR-Status im flux-system
kubectl -n flux-system get helmrelease <name>-openclaw -o yaml | yq '.status'
kubectl -n flux-system logs deploy/helm-controller --tail=200 | grep <name>-openclaw

# 3. Service-Instance in der DB (Control-Plane)
kubectl -n dynstore exec deploy/control-plane -- node -e \
  "const{PrismaClient}=require('@prisma/client');const p=new PrismaClient();
   p.serviceInstance.findFirst({where:{appSlug:'openclaw',username:'<user>'}})
    .then(i=>{console.log(JSON.stringify(i,null,2));process.exit(0)})"
```

Bestätigt das Bild: HR `Ready=False` mit „missing target release for
rollback", DB-Instanz steht auf `PROVISIONING`.

## Recovery (ohne flux CLI)

Den HR löschen — die Flux-Kustomization `tenants` rekonstruiert ihn
sofort aus Git, der zweite Install-Versuch klappt dann mit korrekter
Chart-Spec.

```bash
# 1. HR weg
kubectl -n flux-system delete helmrelease <name>-openclaw

# 2. Tenants-Kustomization reconcilen (oder warten ~10 min)
kubectl -n flux-system annotate kustomization tenants \
  reconcile.fluxcd.io/requestedAt="$(date +%s)" --overwrite

# 3. Beobachten
watch -n2 "kubectl -n flux-system get helmrelease <name>-openclaw; \
           kubectl -n tenant-<user>-openclaw get pods"
```

Der SOPS-Secret-Push und der Namespace gehören zur
Tenants-Kustomization (nicht zum HR), bleiben also bestehen — nur das
leere PVC wird neu angelegt. Datenverlust = nur das, was beim
fehlgeschlagenen ersten Install bereits geschrieben worden wäre,
also nichts (frischer Bestellung).

## Wenn der HR nicht in Git steht

Wenn Punkt 1 schon im DB-Status hängt aber gar kein
`platform/tenants/<ns>/` existiert (Control-Plane ist beim Schreiben
abgeschmiert), ist das *kein* Zombie-HR, sondern ein abgebrochener
Provision-Lauf. Saubere Behebung über die Admin-API (entfernt die
DB-Instanz):

```bash
CP=$(kubectl -n dynstore get pod -l app=control-plane -o jsonpath='{.items[0].metadata.name}')
# Listen
kubectl -n dynstore exec "$CP" -- sh -c \
  'curl -s http://localhost:8080/v1/admin/services -H "x-admin-token: $CP_ADMIN_TOKEN"' \
  | jq '.[] | select(.username=="<user>" and .appSlug=="openclaw") | {id,status}'
# Löschen (id einsetzen)
kubectl -n dynstore exec "$CP" -- sh -c \
  'curl -sX DELETE http://localhost:8080/v1/admin/services/<id> -H "x-admin-token: $CP_ADMIN_TOKEN"'
```

Dann kann der Kunde im Storefront neu bestellen.

## Vorbeugung (bereits aktiv)

Im OpenClaw-Chart-Rendering (`services/control-plane/src/services/lifecycle.ts::renderHelmRelease`)
ist seit Commit fe0b101 gesetzt:

```yaml
spec:
  install:
    remediation:
      retries: 3
```

Das fängt vorübergehende Probleme (Image-Pull-Hänger, Race mit
SOPS-Decrypt) ab, *bevor* der HR in den Zombie-Zustand kippt.
Persistente Crashes (Auth-Fehlkonfig wie im Vorfall) löst es nicht —
da bleibt der manuelle `kubectl delete helmrelease`-Pfad.

## Verwandtes

- Memory: `openclaw-new-image` (Image-Migration v2026.6.8, ttyd raw-mode, Auth-Modell).
- Memory: `dynstore-gitops-ops` (Wer schreibt wohin in Git; Tenants-vs-Apps-Kustomization).
