# Update-Erkennung pro Catalog-App (Update beim Kunden-Neustart)

Modell: **erkennen, nicht auto-anwenden.** Flux erkennt die neueste Version; die
Control-Plane pinnt pro Tenant die laufende Version im HelmRelease und hebt sie
**nur beim Kunden-Neustart** auf `latest`. Das Dashboard zeigt „Update verfügbar".

Eine App bekommt das Feature, sobald eine **ImagePolicy mit `name: <appSlug>`**
existiert (die Control-Plane liest sie generisch). Pro neuer Catalog-App:

1. `platform/apps/<app>/imagerepository.yaml` → `spec.image: ghcr.io/action3062/<app>`,
   bei **privatem** Package zusätzlich `spec.secretRef.name: ghcr-pull`.
2. `platform/apps/<app>/imagepolicy.yaml` → `imageRepositoryRef.name: <app>`,
   `filterTags.pattern` passend zum Tag-Schema (z. B. `^v(?P<version>\d+\.\d+\.\d+)$`
   für `vX.Y.Z`, oder ohne `v` für `X.Y.Z`), `extract: $version`, `policy.semver.range`.
3. `platform/apps/<app>/kustomization.yaml` (imagerepository + imagepolicy) und `<app>`
   in `platform/apps/kustomization.yaml` ergänzen.
4. Chart muss `image.tag` aus den Values lesen (Standard in allen MeinAppNest-Charts).

Kein ImageUpdateAutomation/Setter-Marker nötig (kein Auto-Bump). Voraussetzung:
das Deployment heißt wie der `<appSlug>` (Control-Plane liest darüber die laufende Version).
