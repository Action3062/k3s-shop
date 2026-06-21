# Mandanten-Isolation auf Kubernetes / k3s

> **Hinweis (Label-Mapping):** Dieses Dokument nutzt zur Veranschaulichung die Label-Keys `customer` / `app-namespace` und das Namensschema `<kunde>-<app>`. Die **produktive Implementierung** verwendet `dynstore.io/tenant` / `dynstore.io/app` und Namespaces `tenant-<kunde>-<app>` (siehe `platform/tenant-template/`). Wer die YAML-Beispiele übernimmt, muss die Keys entsprechend ersetzen.

**Namespace-pro-App-pro-Kunde mit plattformverwalteten Labels, Default-Deny und kundengebundenen NetworkPolicies**

Stand: 2026-06-20 · Geltungsbereich: k3s-Cluster (Hetzner), Multi-Tenant-App-Hosting (z. B. Sonarr / Radarr / Jellyseerr)

---

## 1. Fachliche Empfehlung (Kurzfassung)

Empfohlen wird ein **Namespace-pro-App-pro-Kunde**-Modell mit vier festen Bausteinen, die für **jeden** App-Namespace identisch und ausschließlich durch die Plattform-Automation (GitOps) erzeugt werden:

1. **Eindeutige, plattformverwaltete Labels** am Namespace (`customer`, `app-namespace`) als alleiniger Vertrauensanker für Isolation.
2. **Default-Deny** für Ingress *und* Egress in jedem Namespace.
3. **Gezielte Allow-Regeln**, die ausschließlich innerhalb desselben `customer`-Labels greifen — pro Quell-App, pro Ziel-Pod, pro Port.
4. **Eigene ResourceQuota + LimitRange** pro App-Namespace (Kapazität, völlig getrennt von der Kommunikationssteuerung).

Die App-zu-App-Kommunikation läuft über reguläre Kubernetes-Services und Cluster-DNS (`<svc>.<namespace>.svc.cluster.local`). Die *Freigabe* dieser Kommunikation erfolgt rein über NetworkPolicies. Kunden erhalten **keine** Rechte, Namespaces oder Labels zu verändern.

> **Kernsatz:** Isolation entsteht nicht durch Vertrauen, sondern durch ein cluster-weit einheitliches Muster aus *Default-Deny* + *kundengebundenem Allow* + *plattformkontrollierten Labels*. Kein Pfad zwischen zwei Kunden existiert, solange keine Regel ihn ausdrücklich öffnet — und keine Regel kann ihn öffnen, weil das `customer`-Label kundenübergreifend nie übereinstimmt.

---

## 2. Technische Begründung

**Namespaces sind die natürliche Isolationsgrenze in Kubernetes.** Sie tragen Labels, RBAC, ResourceQuota und sind der Geltungsbereich von NetworkPolicies. Ein App-eigener Namespace macht damit *jede* Isolationsdimension (Netz, Kapazität, Berechtigung, Lebenszyklus) pro App einzeln steuerbar.

**NetworkPolicies wirken auf L3/L4 (IP/Port) und sind zustandsbehaftet.** Eine erlaubte Verbindung erlaubt automatisch den Rückverkehr — es muss also nur die *initiierende* Richtung modelliert werden. NetworkPolicies sind jedoch **namespaced** und **additiv**: Ein neuer Namespace ist so lange vollständig offen, bis in ihm ein Default-Deny existiert. Deshalb **muss** die Plattform-Automation das Default-Deny mit dem Namespace zusammen ausrollen — nicht nachgelagert.

**`namespaceSelector` matcht Namespace-Labels.** Genau deshalb sind diese Labels sicherheitsrelevant: Wer `customer` setzen darf, entscheidet über Mandantenzugehörigkeit. Folglich dürfen diese Labels **ausschließlich** von der Plattform stammen (GitOps + RBAC, optional per Admission Policy erzwungen).

**k3s erzwingt NetworkPolicies out-of-the-box.** k3s bringt zusätzlich zum Standard-CNI (Flannel) einen eingebetteten NetworkPolicy-Controller (kube-router-Funktionalität) mit. Default-Deny und Allow-Regeln werden also ohne zusätzliches CNI durchgesetzt. (Einmalig per Negativtest verifizieren — siehe Abschnitt 11.)

---

## 3. Architektur-Zielbild

```
+--------------------------- k3s-Cluster ---------------------------+
|                                                                   |
|  Kunde A  (customer: kunde-a)        Kunde B  (customer: kunde-b) |
|  +------------------------+          +------------------------+   |
|  | ns: kunde-a-seerr      |          | ns: kunde-b-seerr      |   |
|  |  Default-Deny          |          |  Default-Deny          |   |
|  |  +Allow -> sonarr:8989 |--+       |  +Allow -> sonarr:8989 |   |
|  |  +Allow -> radarr:7878 |  |allow  |  ...                   |   |
|  |  ResourceQuota         |  |       |  ResourceQuota         |   |
|  +------------------------+  |       +------------------------+   |
|  +------------------------+  |                                    |
|  | ns: kunde-a-sonarr     |<-+  (gleicher customer-Label)         |
|  |  Default-Deny          |                                       |
|  |  +Allow Ingress<-seerr |     X  customer=kunde-a != kunde-b    |
|  |  Service :8989         |        ->  KEIN Pfad moeglich         |
|  |  ResourceQuota         |                                       |
|  +------------------------+                                       |
|  +------------------------+                                       |
|  | ns: kunde-a-radarr     |                                       |
|  |  Service :7878  ...     |                                      |
|  +------------------------+                                       |
|                                                                   |
|  Steuerung: GitOps (Flux) -> Namespace + Labels + Quota + Policy  |
|  Kunden haben KEINEN kubectl-/Namespace-Schreibzugriff            |
+-------------------------------------------------------------------+
```

**Erzeugungsmuster (ein Template pro App-Namespace, immer vollständig):**

1. `Namespace` mit Labels `customer`, `app-namespace`
2. `ResourceQuota` + `LimitRange`
3. `NetworkPolicy: default-deny-all` (Ingress + Egress)
4. `NetworkPolicy: allow-dns` (Egress zu CoreDNS — Pflicht, sonst keine Namensauflösung)
5. optional `NetworkPolicy: allow-ingress` vom Ingress-Controller (nur für extern erreichbare Web-UIs, z. B. Jellyseerr)
6. je freigegebener App-Beziehung **ein Paar**: Egress-Allow an der Quelle + Ingress-Allow am Ziel

---

## 4. Namespace-Naming und Labels

Namensschema: `<kunde>-<app>` (DNS-konform, kleingeschrieben). Die Wahrheit über Mandant und App steckt jedoch in den **Labels**, nicht im Namen — Selektoren matchen Labels, nicht Strings im Namensfeld.

```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: kunde-a-sonarr
  labels:
    customer: kunde-a            # Vertrauensanker: NUR Plattform setzt das
    app-namespace: sonarr        # App-Kennung innerhalb des Kunden
    app.kubernetes.io/managed-by: platform-automation
---
apiVersion: v1
kind: Namespace
metadata:
  name: kunde-a-seerr
  labels:
    customer: kunde-a
    app-namespace: seerr
    app.kubernetes.io/managed-by: platform-automation
```

**Pod-Labels** müssen konsistent gesetzt sein, da `podSelector` darauf matcht. Im Deployment-Template:

```yaml
spec:
  template:
    metadata:
      labels:
        app: sonarr              # Ziel-/Quell-App-Selektor in NetworkPolicies
        customer: kunde-a        # optional, fuer zusaetzliche Pod-Ebene-Filter
```

> **Hinweis:** Jeder Namespace trägt automatisch das immutable Label
> `kubernetes.io/metadata.name: <name>` (von Kubernetes gesetzt, nicht fälschbar).
> Es eignet sich für robuste System-Selektoren (z. B. kube-system für DNS).
> Der **Mandanten**-Anker bleibt aber das selbstvergebene `customer`-Label —
> deshalb muss dessen Vergabe plattformseitig abgesichert sein (Abschnitt 11).

---

## 5. Service-Kommunikation per DNS

Jede App exponiert sich kunden-intern über einen Service; angesprochen wird sie über den voll qualifizierten Cluster-DNS-Namen `<service>.<namespace>.svc.cluster.local`.

```yaml
apiVersion: v1
kind: Service
metadata:
  name: sonarr
  namespace: kunde-a-sonarr
spec:
  selector:
    app: sonarr
  ports:
    - name: http
      port: 8989
      targetPort: 8989
```

Aufruf aus `kunde-a-seerr` heraus (in der Jellyseerr-Konfiguration):

```
http://sonarr.kunde-a-sonarr.svc.cluster.local:8989
http://radarr.kunde-a-radarr.svc.cluster.local:7878
```

DNS-Auflösung und NetworkPolicy sind **zwei getrennte Ebenen**: Der DNS-Name löst clusterweit auf, aber die *Verbindung* kommt nur zustande, wenn eine NetworkPolicy sie erlaubt. Ohne passende Allow-Regel schlägt der Verbindungsaufbau trotz korrekt aufgelöster IP fehl.

---

## 6. Default-Deny NetworkPolicy (pro Namespace)

Sperrt sämtlichen ein- und ausgehenden Pod-Verkehr im Namespace. Wird mit jedem App-Namespace ausgerollt.

```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: default-deny-all
  namespace: kunde-a-seerr
spec:
  podSelector: {}                # alle Pods im Namespace
  policyTypes:
    - Ingress
    - Egress
```

**Pflicht-Ergänzung DNS-Egress.** Sobald Egress per Default-Deny gesperrt ist, kann der Pod CoreDNS nicht mehr erreichen — `*.svc.cluster.local` löst dann nicht mehr auf. Deshalb gehört diese Policy fest ins Template jedes Namespace:

```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: allow-dns-egress
  namespace: kunde-a-seerr
spec:
  podSelector: {}
  policyTypes:
    - Egress
  egress:
    - to:
        - namespaceSelector:
            matchLabels:
              kubernetes.io/metadata.name: kube-system
          podSelector:
            matchLabels:
              k8s-app: kube-dns       # CoreDNS in k3s/kube-system
      ports:
        - protocol: UDP
          port: 53
        - protocol: TCP
          port: 53
```

---

## 7. Allow-NetworkPolicy: `kunde-a-seerr` -> `kunde-a-sonarr:8989`

Die Freigabe besteht aus **einem Regelpaar** — Egress an der Quelle, Ingress am Ziel. Beide sind über `customer: kunde-a` an denselben Mandanten gebunden.

**(a) Egress-Allow im Quell-Namespace `kunde-a-seerr`** — nur seerr-Pods dürfen raus, nur zu sonarr, nur Port 8989:

```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: allow-egress-seerr-to-sonarr
  namespace: kunde-a-seerr
spec:
  podSelector:
    matchLabels:
      app: seerr                 # konkrete Quell-App
  policyTypes:
    - Egress
  egress:
    - to:
        - namespaceSelector:
            matchLabels:
              customer: kunde-a       # nur derselbe Kunde
              app-namespace: sonarr   # nur der Ziel-App-Namespace
          podSelector:
            matchLabels:
              app: sonarr             # nur Ziel-Pods
      ports:
        - protocol: TCP
          port: 8989                  # nur konkreter Port
```

**(b) Ingress-Allow im Ziel-Namespace `kunde-a-sonarr`** — nur seerr desselben Kunden darf rein:

```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: allow-ingress-from-seerr
  namespace: kunde-a-sonarr
spec:
  podSelector:
    matchLabels:
      app: sonarr                # konkreter Ziel-Pod
  policyTypes:
    - Ingress
  ingress:
    - from:
        - namespaceSelector:
            matchLabels:
              customer: kunde-a       # nur derselbe Kunde
              app-namespace: seerr    # nur der Quell-App-Namespace
          podSelector:
            matchLabels:
              app: seerr              # nur Quell-Pods
      ports:
        - protocol: TCP
          port: 8989
```

> **Kritische Syntax-Regel (AND vs. OR):** `namespaceSelector` und `podSelector`
> stehen oben in **einem** Listenelement (ein `-`, beide Schlüssel darunter) ->
> **UND**-Verknüpfung: "Pod in einem Namespace mit diesen Labels **und** mit
> diesem Pod-Label". Stünden sie als **zwei** Listenelemente (zwei `-`), wäre es
> ein **ODER** — und würde versehentlich *alle* Pods im Mandanten-Namespace
> **oder** gleichnamige Pods in *fremden* Namespaces zulassen. Diese Unterscheidung
> ist der häufigste sicherheitsrelevante Fehler in NetworkPolicies.

Für `kunde-a-seerr` -> `kunde-a-radarr:7878` wird dasselbe Paar mit `app-namespace: radarr` / `app: radarr` / Port `7878` angelegt.

---

## 8. Wie wird Kunde A <-> Kunde B verhindert?

Die Trennung ergibt sich aus dem Zusammenspiel von drei Mechanismen — keiner davon allein, alle drei zusammen:

1. **Default-Deny als Boden:** In jedem Namespace ist ohne explizite Allow-Regel kein Verkehr möglich. Es gibt also keinen "offenen Restzustand", der versehentlich Kunden verbindet.
2. **Kundengebundene Selektoren:** Jede Allow-Regel verlangt `namespaceSelector -> customer: kunde-a`. Die Namespaces von Kunde B tragen `customer: kunde-b`. Der Selektor matcht sie **nie** — unabhängig davon, ob App-Namen (sonarr, seerr …) identisch sind. Gleiche App-Namen verschiedener Kunden kollidieren nicht, weil zusätzlich der `customer`-Wert übereinstimmen muss.
3. **Plattformkontrollierte Labels:** Da `customer` der Vertrauensanker ist, darf nur die Plattform es setzen. Ein Kunde kann seinen Namespace nicht auf `customer: kunde-b` umlabeln, um sich "einzuschleusen", weil er keine Schreibrechte auf Namespace-Objekte hat (RBAC) und Änderungen optional per Admission Policy abgewiesen werden.

**Ergebnis:** Es existiert kein Netzwerkpfad von einer App des Kunden A zu einer App des Kunden B. Die in der Anforderung genannten verbotenen Flüsse (`kunde-a-seerr -> kunde-b-sonarr`, `kunde-b-seerr -> kunde-a-sonarr`, *jede* App A -> *jede* App B) sind strukturell ausgeschlossen, nicht nur konfigurativ "nicht erlaubt".

---

## 9. Abgrenzung zur ResourceQuota

ResourceQuota und NetworkPolicy adressieren **unterschiedliche Achsen** und sind unabhängig voneinander:

| Aspekt | NetworkPolicy | ResourceQuota / LimitRange |
|---|---|---|
| Steuert | **Kommunikation** (wer mit wem auf welchem Port) | **Kapazität** (CPU, RAM, Pods, PVCs, Storage) |
| Ebene | Netz (L3/L4) | Scheduling / Admission |
| Schützt vor | unerlaubten Verbindungen, Mandantenübergriff | Ressourcen-Erschöpfung, "lauten Nachbarn" |
| Wirkt auf | Pods (Selektor) | Namespace (Summe aller Objekte) |

Weil jede App ihren eigenen Namespace hat, bekommt jede App ihre **eigene** Quota — feingranular und unabhängig skalierbar.

```yaml
apiVersion: v1
kind: ResourceQuota
metadata:
  name: app-quota
  namespace: kunde-a-sonarr
spec:
  hard:
    requests.cpu: "1"
    requests.memory: 2Gi
    limits.cpu: "2"
    limits.memory: 4Gi
    pods: "10"
    persistentvolumeclaims: "5"
    requests.storage: 50Gi
---
apiVersion: v1
kind: LimitRange
metadata:
  name: app-defaults
  namespace: kunde-a-sonarr
spec:
  limits:
    - type: Container
      default:               # gilt, wenn Container keine Limits angibt
        cpu: 500m
        memory: 512Mi
      defaultRequest:
        cpu: 100m
        memory: 128Mi
```

> **Merksatz:** ResourceQuota begrenzt, *wie viel* eine App verbraucht.
> NetworkPolicy bestimmt, *mit wem* sie reden darf. Beide sind nötig,
> aber keines ersetzt das andere.

---

## 10. Warum Namespace-pro-App besser ist als ein gemeinsamer Kunden-Namespace

Vergleich gegenüber "alle Apps eines Kunden in einem gemeinsamen Namespace":

| Kriterium | Namespace pro App (empfohlen) | Gemeinsamer Namespace pro Kunde |
|---|---|---|
| **Saubere Isolation pro App** | Jede App ist eigene Fehler-/Sicherheitsdomäne; ein kompromittierter Pod bleibt auf seinen Namespace begrenzt. | Apps teilen die Namespace-Grenze; intra-Kunde standardmäßig offen, laterale Bewegung leichter. |
| **Eigene ResourceQuota pro App** | Pro App exakt steuerbar (CPU/RAM/Storage/PVCs). | Nur eine Quota für alle Apps gemeinsam; eine App kann das Budget der anderen aufbrauchen. |
| **Skalierbarkeit** | Apps unabhängig versionier-, deploy- und skalierbar; klares GitOps-Template pro App. | Änderungen an einer App berühren den gemeinsamen Namespace; engere Kopplung. |
| **Klarere Berechtigungen (RBAC)** | RBAC pro App-Namespace; Least-Privilege je App/ServiceAccount. | RBAC nur grob pro Kunde; feinere Trennung kaum möglich. |
| **Kontrollierte Kommunikation** | Auch *innerhalb* des Kunden ist jeder Pfad explizit (seerr->sonarr nur auf 8989) — nachvollziehbar und auditierbar. | Intra-Kunde implizit erlaubt; "wer redet mit wem" nicht erzwungen. |
| **Sicherheit zwischen Kunden** | Default-Deny + kundengebundene Selektoren; Mandantentrennung strukturell. | Trennung nur an der Kunden-Namespace-Grenze; weniger Verteidigungstiefe. |
| **Betriebskosten** | Mehr Objekte (Kunden x Apps) — beherrschbar durch GitOps-Templating/Automation. | Weniger Objekte, einfacheres Setup. |

**Ehrliche Einordnung:** Der gemeinsame Kunden-Namespace ist einfacher und für intra-Kunde-Kommunikation "kostenlos" (gleicher Namespace). Der Preis sind grobkörnige Quota, grobes RBAC und implizit offene App-zu-App-Kommunikation. Für ein Mandanten-Hosting mit den hier genannten Anforderungen (eigene Quota pro App, App-Isolation, *kontrollierte* Kommunikation auch innerhalb eines Kunden) überwiegen die Vorteile des Namespace-pro-App-Modells klar. Die einzige reale Mehraufwand-Dimension — die Objektzahl — wird durch ein einheitliches GitOps-Template (Namespace + Labels + Quota + Policies als ein Satz pro App) aufgefangen.

---

## 11. Label-Hoheit erzwingen & Betriebsmodell

**Labels dürfen nur von der Plattform kommen.** Drei sich ergänzende Maßnahmen:

1. **GitOps als einzige Quelle der Wahrheit:** Namespaces, Labels, Quotas und Policies liegen ausschließlich im Plattform-Git (Flux). Kunden haben dort keinen Schreibzugriff.
2. **RBAC:** Kunden-Identitäten besitzen keine Rechte auf `namespaces` (create/patch/label). Sie können — falls überhaupt — nur innerhalb zugewiesener Namespaces eingeschränkt agieren, nie Namespace-Metadaten ändern.
3. **Admission Policy (optional, härtende Ebene):** Eine `ValidatingAdmissionPolicy` (oder Kyverno) verbietet das Erstellen/Ändern von Namespaces mit `customer`-Label durch Nicht-Plattform-Subjekte bzw. erzwingt, dass `customer` zu einem freigegebenen Wert passt und nicht nachträglich geändert wird.

**Verifikation (einmalig nach Rollout, dann als CI-Check):**

- Negativtest: Aus `kunde-b-seerr` eine Verbindung zu `sonarr.kunde-a-sonarr.svc.cluster.local:8989` versuchen -> muss scheitern (Timeout).
- Positivtest: Aus `kunde-a-seerr` dieselbe Verbindung zu `kunde-a-sonarr` -> muss gelingen.
- DNS-Test: Aus jedem Namespace `nslookup` eines `.svc.cluster.local`-Namens -> muss auflösen (bestätigt DNS-Egress-Policy).

```bash
# Negativtest (erwartetes Ergebnis: Timeout/refused)
kubectl -n kunde-b-seerr run probe --rm -it --image=busybox --restart=Never -- \
  wget -T 5 -qO- http://sonarr.kunde-a-sonarr.svc.cluster.local:8989 ; echo "exit=$?"

# Positivtest (erwartetes Ergebnis: HTTP-Antwort)
kubectl -n kunde-a-seerr run probe --rm -it --image=busybox --restart=Never -- \
  wget -T 5 -qO- http://sonarr.kunde-a-sonarr.svc.cluster.local:8989 ; echo "exit=$?"
```

**Grenzen / weiterführende Härtung (Transparenz):** NetworkPolicies wirken auf L3/L4, nicht auf Anwendungsebene (kein L7-Auth, keine Verschlüsselung erzwungen). Für höhere Schutzbedarfe ergänzbar durch: mTLS/Service-Mesh, dedizierte Node-Pools pro Kunde, eigene ServiceAccounts/RBAC je App, sowie — bei sehr hohem Trennungsbedarf — Cluster-pro-Mandant. Für das beschriebene App-Hosting ist das Namespace-pro-App-Modell mit Default-Deny + kundengebundenem Allow der angemessene, gängige Standard.

---

## 12. Übernahmefertige Formulierung (für Konzept / Architekturentscheidung)

> **Architekturentscheidung: Mandantentrennung über Namespace-pro-App und kundengebundene NetworkPolicies**
>
> Jede Kundenanwendung wird in einem eigenen Namespace nach dem Schema
> `<kunde>-<app>` betrieben. Jeder Namespace erhält ausschließlich durch die
> Plattform-Automation (GitOps) die Labels `customer: <kunde>` und
> `app-namespace: <app>`; Kunden besitzen keine Rechte, Namespaces oder deren
> Labels zu erstellen oder zu verändern.
>
> In jedem Namespace gilt ein Default-Deny für ein- und ausgehenden Verkehr.
> Erlaubte Kommunikation wird ausschließlich über explizite NetworkPolicies
> freigegeben und ist stets an dasselbe `customer`-Label gebunden: pro Quell-App,
> pro Ziel-Pod und pro Port. App-zu-App-Kommunikation erfolgt über Kubernetes-
> Services und Cluster-DNS (`<svc>.<namespace>.svc.cluster.local`); jeder
> Namespace erhält zusätzlich eine Egress-Freigabe zu CoreDNS.
>
> Dadurch ist Kommunikation zwischen verschiedenen Kunden strukturell
> ausgeschlossen — der Mandantenselektor `customer` trifft kundenübergreifend
> nie zu und ist nicht durch Kunden manipulierbar. Innerhalb eines Kunden ist
> jede App-Beziehung einzeln und nachvollziehbar freigegeben (z. B. darf
> `kunde-a-seerr` ausschließlich `kunde-a-sonarr` auf Port 8989 erreichen).
>
> Kapazitätssteuerung erfolgt unabhängig davon über je eine ResourceQuota und
> LimitRange pro App-Namespace (CPU, RAM, Pods, PVCs, Storage). ResourceQuota
> steuert ausschließlich den Ressourcenverbrauch und hat keinen Einfluss auf die
> Kommunikation; die Kommunikationssteuerung erfolgt allein über NetworkPolicies.
>
> Die Plattform durchsetzt die Label-Hoheit über GitOps, RBAC und optional eine
> Validating Admission Policy. Die Wirksamkeit der Trennung wird per Negativ-/
> Positivtest verifiziert und als wiederkehrender Prüfschritt in der Pipeline
> verankert.
