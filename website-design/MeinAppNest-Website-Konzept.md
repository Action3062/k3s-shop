# MeinAppNest — Website-Design-Konzept

> **Positionierung:** Ein App Store für Self-Hosted Tools, kombiniert mit Managed Cloud Hosting und einem eleganten Kontrollzentrum.
> **Zentrale Botschaft:** *Self-hosted Power. Ohne den Self-hosting Stress.*
> **Akzentwelt:** Cyan / Teal auf tiefem, kühlem Dunkel — „cloud-native Control Center".

Dieses Dokument ist als Übergabe an Designer:in **und** Entwickler:in gedacht. Teil 1–6 = Konzept & Texte. Der lauffähige React-Code wird separat als `MeinAppNestLanding.jsx` geliefert.

---

## 1. Visuelle Designrichtung

### Gesamtlook
MeinAppNest sieht aus wie ein **modernes Control Center für gehostete Apps** — ruhig, präzise, technisch, vertrauenswürdig. Die Oberfläche ist dunkel und „cloud-native", aber nie laut: keine Neon-Übersättigung, kein Crypto-Glanz, kein Gaming-RGB. Stattdessen tiefe, kühle Flächen, viel Negativraum, scharfe Typografie und sparsame, leuchtende Cyan-Akzente, die wie *Live-Status-Signale* wirken. Das Vorbild ist die Präzision von Linear, Vercel, Railway, Raycast und Supabase — eigenständig für MeinAppNest interpretiert.

### Farbwelt
Dunkler, leicht ins Blaue gezogener Grund (kein reines Schwarz, kein Grau-Einheitsbrei). Darüber abgestufte „Surface"-Ebenen, die Tiefe erzeugen. Akzent ist ein **elektrisches Cyan/Teal**, das nur dort eingesetzt wird, wo es zählt: Primary-CTA, aktive Status, Hover-Glows, Datenlinien. Ergänzend ein **Status-Grün** („online/live") und sehr zurückhaltende Sekundärtöne. Farbe ist Funktion, nicht Dekoration — die Seite lebt von 90 % Neutral und 10 % Akzent. (Volle Hex-Werte → Teil 5.)

### Typografie
Eine technische, klare Grotesk für UI & Headlines (**Geist Sans**, Fallback **Inter**) plus eine **Monospace** (**Geist Mono** / **JetBrains Mono**) für alles „Maschinelle": Status, Ports, Versionsnummern, Terminal-/Provisioning-Snippets, Preis-Einheiten. Dieser Doppelklang („Mensch + Maschine") ist das typografische Signatur-Element von MeinAppNest. Headlines tight getrackt, große Sprünge in der Skala, ruhige Zeilenlängen (max. ~70 Zeichen im Fließtext).

### Layout-Prinzipien
- **12-Spalten-Grid**, Content-Maxbreite ~1200–1280 px, großzügige Gutter (24 px).
- **Konsequentes 4-px-Spacing-System** — pixelgenaue, rhythmische Abstände.
- **Sektion = klare Idee.** Jede Sektion hat genau eine Botschaft, viel Luft drumherum.
- **Asymmetrie mit Absicht:** Text links, lebendige UI-Preview rechts; nie überladen.
- **Z-Pattern & Scannbarkeit:** Eyebrow → Headline → Sub → CTA, immer in gleicher Reihenfolge.

### Bildsprache / Icons
**Keine Stockfotos.** Stattdessen abstrakte, selbst gebaute UI-Artefakte: App-Kacheln mit Live-Status, ein Dashboard-Mockup, leuchtende „Nodes" (gehostete Instanzen), Stack-Layer, eine Deployment-Pipeline und kleine, echte Terminal-/Provisioning-Snippets. Leitmetapher: **App-Orbit um eine Cloud** — Apps als leuchtende Knoten, die um ein ruhiges Zentrum kreisen. Icons: einheitliche Linien-Icons (**Lucide**), 1.5–2 px Strichstärke; App-Logos in neutralen, gleich großen „Chips" für den Store-Look.

### Stimmung
Vertrauenswürdig, hochwertig, ruhig-technisch. „Das läuft einfach." Premium ohne Protz. Der Nutzer soll fühlen: *hier hat jemand Infrastruktur verstanden — und mir die Komplexität abgenommen.*

### UI-Stil
Glas- und Tiefen-Ästhetik in Maßen: subtile `backdrop-blur`-Panels, hauchfeine 1-px-Borders mit Lichtkante oben, weiche, mehrschichtige Schatten, dezente Akzent-Glows hinter aktiven Elementen. Abgerundete, aber nicht verspielte Radien (12–20 px). Alles wirkt „solide gebaut".

### Animationen & Microinteractions (emilkowalski-Niveau)
- **Scroll-Reveals:** Elemente faden + 12–16 px nach oben, gestaffelt (Stagger 40–80 ms), Spring statt Linear.
- **Card-Hover:** sanftes Anheben (translateY -4 px), Border leuchtet cyan auf, Glow erscheint, Icon mikro-skaliert (1.0 → 1.04).
- **Primary-CTA:** weicher Glow-Puls beim Hover, gedrückter Zustand mit kurzem Scale-Down (0.98).
- **Live-Status-Dot:** ruhiges Pulsieren (grün) als Beweis „Instanzen laufen".
- **Number-Counter:** Metriken zählen beim Eintreten hoch.
- **Cursor-aware Glow** auf großen Cards (radialer Lichtschein folgt dem Mauszeiger).
- **Provisioning-Demo:** im Hero läuft ein Mini-Terminal Schritte ab (`Pull → Configure → SSL → Live`).
- **Regel:** alles ≤ 300 ms, `ease`/Spring, `prefers-reduced-motion` respektiert. Lebendig, nie verspielt.

---

## 2. Homepage-Struktur

Reihenfolge der Sektionen (Begründung: erst Versprechen, dann Schmerz, dann Lösung, dann Beweis/Angebot, dann Abschluss):

`[Navigation] → [Hero] → [Trust/Metrics] → [Problem] → [Solution] → [App-Store-Grid] → [Bundles] → [Features] → [How it works] → [Comparison] → [Pricing] → [Security] → [FAQ] → [Final CTA] → [Footer]`

### 2.1 Hero
- **Headline:** „Self-hosted Power. Ohne den Self-hosting Stress."
- **Subheadline:** Apps wie Plex, Jellyfin, Nextcloud & n8n — fertig gehostet, in unter 60 Sekunden bereit.
- **Primary CTA:** „App in 60 Sek. starten"
- **Secondary CTA:** „App-Store ansehen"
- **Visuelle Idee:** Links Text, rechts ein lebendiges **Dashboard-/App-Orbit-Mockup**: zentrale „Cloud", darum kreisende App-Nodes mit grünem Live-Dot; darunter ein Mini-Terminal, das eine Provisionierung durchläuft.
- **Trust-Hinweise (unter den CTAs):** „Keine Kreditkarte nötig · 14 Tage testen · SSL & Backups inklusive · EU-Hosting".
- **App-Preview:** kleine Reihe bekannter App-Logos („Beliebt: Plex · Jellyfin · Radarr · Vaultwarden · n8n").

> **5-Sekunden-Ziel:** Beim ersten Blick muss klar sein — *MeinAppNest hostet fertige Apps; ich muss mich nicht um Server, Docker, Updates oder Konfiguration kümmern.*

### 2.2 Trust / Metrics (schmaler Streifen)
Logo-/App-Leiste + 3–4 Kennzahlen-Counter: `40+ Apps`, `< 60 Sek. Bereitstellung`, `99,9 % Uptime-Ziel`, `Automatische Backups & Updates`. Dezent, monospace-Zahlen.

### 2.3 Problem („So fühlt sich Self-Hosting heute an")
Raster aus 6–8 „Pain-Cards" mit Linien-Icon + kurzem Satz: Server einrichten · Docker Compose pflegen · Ports/SSL/Reverse Proxy · Updates · Backups · Ausfälle · Sicherheitsrisiken · Fehlersuche nachts/am Wochenende. Ton: empathisch, kennt den Schmerz. Visuell leicht „unruhig" (im Kontrast zur ruhigen Solution).

### 2.4 Solution („Mit MeinAppNest: 4 Schritte, fertig")
Ruhige, geordnete Gegen-Darstellung: **App auswählen → Paket buchen → Instanz startet automatisch → Zugangsdaten erhalten → nutzen.** Begleitet von einer animierten Mini-Pipeline. Botschaft: dieselben Tools, ohne den Betrieb.

### 2.5 App-Store / App-Grid (Herzstück)
Suchleiste + Kategorie-Filter (Chips) über einem responsiven **App-Card-Grid** (3–4 Spalten). Jede Card: Icon, App-Name, Kategorie, Kurzbeschreibung, Status-/Beliebtheits-Badge, „ab X €/Monat", Tags, Kompatibilitäts-/Integrationshinweis, CTA. Wirkt wie ein echter App Store für gehostete Tools. Beispiel-Apps: Plex, Jellyfin, Radarr, Sonarr, Prowlarr, Nextcloud, Vaultwarden, n8n, Uptime Kuma, Homepage Dashboard.

### 2.6 Bundles / Stacks
Vorgefertigte Pakete als größere Cards: **Media Starter**, **Media Pro**, **Productivity**, **Automation**, **Team Tools**. Je Card: enthaltene Apps (Logo-Chips), Zielgruppe, Preislogik, Vorteile, CTA. Eine Card als „Beliebt" hervorgehoben (Akzent-Border + Glow).

### 2.7 Features
Bento-artiges Raster aus Feature-Cards: Managed Hosting, automatische Updates, Backups, SSL inklusive, eigene Subdomain (optional eigene Domain), Monitoring, Support, einfache Skalierung, App-Dashboard, isolierte Instanzen, schnelle Bereitstellung. Mix aus großen und kleinen Kacheln für Rhythmus.

### 2.8 How it works
3–5 nummerierte Schritte als horizontale Timeline: **1. App/Stack wählen → 2. Account erstellen → 3. MeinAppNest provisioniert → 4. Zugriff übers Dashboard → 5. Einfach nutzen.** Verbindungslinie „füllt" sich beim Scrollen.

### 2.9 Comparison
Drei-Spalten-Tabelle: **Selbst hosten · Klassischer VPS · MeinAppNest**. Zeilen u. a. Einrichtungszeit, Wartung, Updates, Backups, SSL, Monitoring, Skalierung, nötiges Know-how. MeinAppNest-Spalte hervorgehoben (Häkchen in Akzentfarbe).

### 2.10 Pricing
Drei Pläne (z. B. **Single App · Stack · Pro/Team**) + Hinweis auf Add-ons, Testphase und transparente Ressourcenlogik. Monatlich/jährlich-Umschalter. **Platzhalter-Preise**, klar als Beispiel markiert. Mittlerer Plan „Empfohlen".

### 2.11 Trust / Security
Vier ruhige Cards: isolierte App-Instanzen · verschlüsselte Verbindungen (SSL/TLS) · automatische Backups · Monitoring & Status. Plus ein klarer Satz zu Verantwortlichkeiten („keine Magie, saubere Infrastruktur"). Optional EU-/DSGVO-Hinweis.

### 2.12 FAQ
Accordion mit 10 Fragen (Texte → Teil 3.8). Ruhig, ehrlich, klar.

### 2.13 Final CTA
Großflächiger, fokussierter Abschluss mit Glow-Hintergrund: Headline, ein Satz, ein Primary-CTA, ein sekundärer Link. Keine Ablenkung.

### 2.14 Footer
Mehrspaltig: Produkt · Apps · Ressourcen · Rechtliches. Plus Claim, Status-Link, Sprache, Social. Dezent, aufgeräumt.

---

## 3. Konkrete Texte (Deutsch)

### 3.1 Hero
- **Headline:** **Self-hosted Power. Ohne den Self-hosting Stress.**
- **Subheadline:** Plex, Jellyfin, Nextcloud, n8n und 40+ weitere Tools — fertig gehostet und in unter 60 Sekunden startklar. Keine Server, kein Docker, keine Updates. Du wählst die App, wir kümmern uns um den Rest.
- **Eyebrow (klein, über H1):** Managed App Hosting für Power-User, Teams & Creator

### 3.2 CTAs
- **Primär:** „App in 60 Sek. starten" · alternativ „Kostenlos starten"
- **Sekundär:** „App-Store ansehen" · alternativ „Live-Demo ansehen"
- **Im Pricing:** „Plan wählen" / „14 Tage testen"
- **Trust-Zeile:** „Keine Kreditkarte nötig · Jederzeit kündbar · SSL & Backups inklusive"

### 3.3 Feature-Cards (5)
1. **Managed Hosting** — Wir betreiben deine Apps auf sicherer, überwachter Infrastruktur. Du nutzt sie einfach — wie eine ganz normale Web-App.
2. **Automatische Updates** — Neue Versionen und Sicherheits-Patches laufen automatisch ein. Kein manuelles Nachziehen, keine kaputten Container.
3. **Backups inklusive** — Regelmäßige, verschlüsselte Backups deiner Daten. Im Ernstfall stellen wir wieder her — ohne Drama.
4. **SSL & eigene Domain** — Jede Instanz kommt mit HTTPS und eigener Subdomain. Deine eigene Domain verbindest du in wenigen Klicks.
5. **Isolierte Instanzen** — Jede App läuft sauber getrennt in ihrer eigenen Umgebung. Mehr Sicherheit, keine Nebenwirkungen zwischen Apps.

### 3.4 App-Cards (5)
1. **Plex** — *Media Server.* Deine Filme & Serien, gestreamt auf jedem Gerät — ohne eigenen Server. `ab 7 €/Monat` · Tags: Streaming, 4K, Transcoding · *Beliebt*
2. **Jellyfin** — *Media Server.* Freie, werbefreie Medienzentrale mit voller Kontrolle. Open Source, fertig gehostet. `ab 6 €/Monat` · Tags: Open Source, Streaming · *Beliebt*
3. **Radarr** — *Automatisierung.* Automatische Verwaltung deiner Filmsammlung. Spielt perfekt mit Plex & Jellyfin zusammen. `ab 4 €/Monat` · Tags: Automation, Arr-Stack · Integration: Prowlarr, Plex
4. **Nextcloud** — *Cloud & Dateien.* Deine eigene Cloud für Dateien, Kalender & Kontakte — DSGVO-freundlich in der EU. `ab 8 €/Monat` · Tags: Storage, Sync, Teams
5. **Vaultwarden** — *Passwörter & Sicherheit.* Leichtgewichtiger, Bitwarden-kompatibler Passwort-Manager — nur für dich gehostet. `ab 3 €/Monat` · Tags: Security, Self-hosted

*(Weitere im Grid: Sonarr, Prowlarr, n8n, Uptime Kuma, Homepage Dashboard.)*

### 3.5 Bundle-Cards (3)
1. **Media Starter Stack** — *Für Einsteiger ins eigene Streaming.* Enthält: Jellyfin + Radarr + Sonarr + Prowlarr. Eine komplette, automatisierte Medienzentrale — fertig verkabelt. **ab 14 €/Monat** (günstiger als einzeln) · CTA: „Media Starter buchen"
2. **Productivity Stack** — *Für Selbstständige & kleine Teams.* Enthält: Nextcloud + Vaultwarden + Paperless-ngx. Dateien, Passwörter und papierloses Büro an einem Ort. **ab 18 €/Monat** · CTA: „Productivity buchen"
3. **Automation Stack** — *Für Power-User & Maker.* Enthält: n8n + Flowise + Open WebUI. Workflows automatisieren und eigene KI-Tools betreiben — ohne Setup-Hölle. **ab 22 €/Monat** · CTA: „Automation buchen"

*(Weitere Stacks: Media Pro, Team Tools.)*

### 3.6 Bundle-Vorteilszeile (allgemein)
„Stacks sind vorkonfiguriert: Die Apps sind bereits miteinander verbunden, abgesichert und überwacht — du sparst Einrichtung und zahlst weniger als für Einzel-Apps."

### 3.7 Section-Headlines (Vorschläge)
- Problem: „Self-Hosting ist mächtig — und ein Vollzeitjob."
- Solution: „Dieselben Tools. Ohne den Betrieb."
- App-Grid: „Wähle aus 40+ fertig gehosteten Apps."
- Bundles: „Fertige Stacks für deinen Use-Case."
- Features: „Alles inklusive, worüber du sonst nachts grübelst."
- How it works: „In 4 Schritten startklar."
- Comparison: „Warum MeinAppNest statt Server selbst betreiben?"
- Pricing: „Transparente Preise. Keine Überraschungen."
- Security: „Saubere Infrastruktur. Keine Magie."

### 3.8 FAQ (Fragen + Antworten)
1. **Was ist MeinAppNest?** — MeinAppNest ist eine Plattform für fertig gehostete Self-Hosted-Apps. Du wählst eine App oder einen Stack, buchst sie und bekommst eine vollständig eingerichtete, sichere und aktuelle Instanz — ohne dich um Server, Docker, Updates oder Konfiguration kümmern zu müssen.
2. **Brauche ich technische Kenntnisse?** — Nein. Wenn du eine Web-App im Browser bedienen kannst, kannst du MeinAppNest nutzen. Die gesamte Technik darunter — Server, Reverse Proxy, SSL, Updates — übernehmen wir.
3. **Kann ich meine eigene Domain nutzen?** — Ja. Jede Instanz erhält automatisch eine eigene Subdomain mit HTTPS. Eine eigene Domain verbindest du in wenigen Klicks; wir richten das passende Zertifikat automatisch ein.
4. **Wie schnell ist eine App bereit?** — In der Regel in unter 60 Sekunden. Nach der Buchung provisioniert MeinAppNest die Instanz automatisch und schickt dir die Zugangsdaten.
5. **Was passiert bei Updates?** — Updates und Sicherheits-Patches spielen wir automatisch ein, schonend und getestet. Du musst nichts tun — und kannst bei größeren Versionssprüngen optional informiert werden.
6. **Kann ich Apps kombinieren?** — Ja. Du kannst mehrere Apps einzeln buchen oder einen vorkonfigurierten Stack wählen, in dem die Apps bereits miteinander verbunden sind (z. B. Radarr + Prowlarr + Jellyfin).
7. **Gibt es Backups?** — Ja. Deine Daten werden regelmäßig und verschlüsselt gesichert. Im Notfall stellen wir wieder her — Backups sind in jedem Plan enthalten.
8. **Kann ich später wechseln oder kündigen?** — Jederzeit. Du kannst Pläne upgraden, downgraden oder monatlich kündigen. Beim Kündigen kannst du deine Daten vorher exportieren.
9. **Ist MeinAppNest legal?** — MeinAppNest stellt ausschließlich die Hosting-Infrastruktur und die Software bereit. Welche Inhalte du mit den Apps verarbeitest oder speicherst, liegt in deiner Verantwortung — genau wie bei jedem anderen Hosting-Anbieter.
10. **Wofür bin ich als Nutzer selbst verantwortlich?** — Für deine Inhalte und Daten, deine Zugangsdaten und die rechtmäßige Nutzung der Apps. Wir kümmern uns um Betrieb, Updates, Sicherheit der Infrastruktur, Backups und Verfügbarkeit.

### 3.9 Final CTA
- **Headline:** „Starte deine erste App in unter einer Minute."
- **Subline:** „Keine Server. Kein Docker. Keine Update-Nächte. Nur deine Tools — sofort einsatzbereit."
- **CTA:** „Jetzt kostenlos starten" · Sekundär: „Erst den App-Store ansehen"

### 3.10 Footer-Claim
**„MeinAppNest — deine Lieblings-Apps. Fertig gehostet."**
*Tools starten statt Server warten.*

---

## 4. UI-Komponenten

Für jede Komponente: Layout · Inhalt · Varianten · Hover · Mobile · Animation.

### 4.1 Navigation
- **Layout:** Fixierte Top-Bar, transparent über Hero, beim Scrollen `backdrop-blur` + dünne Border. Links Logo, Mitte Links (Apps, Bundles, Preise, Features, Docs), rechts „Anmelden" + Primary-CTA.
- **Varianten:** transparent / solid (scrolled) / mobil (Burger).
- **Hover:** Link bekommt Akzent-Unterstrich, der von links einläuft; CTA mit Glow.
- **Mobile:** Burger → Full-screen-Overlay-Menü mit gestaffeltem Einblenden.
- **Animation:** Hide-on-scroll-down / show-on-scroll-up; Blur-Übergang weich.

### 4.2 Hero
- **Layout:** Zwei Spalten (Text links, Visual rechts); mobil gestapelt.
- **Inhalt:** Eyebrow, H1, Sub, 2 CTAs, Trust-Zeile, App-Logo-Reihe, App-Orbit-/Dashboard-Mockup.
- **Varianten:** mit Mockup / mit Terminal-Demo / reduziert.
- **Hover:** Orbit-Nodes vergrößern sich leicht, Tooltip mit App-Name.
- **Mobile:** Visual unter den Text, Orbit kompakter.
- **Animation:** gestaffelter Text-Reveal; Orbit rotiert langsam; Terminal tippt Schritte.

### 4.3 App Card
- **Layout:** Hochformat-Card; oben Icon + Status-Badge, Titel + Kategorie, 2-Zeilen-Beschreibung, Tag-Chips, unten „ab X €" + CTA.
- **Inhalt:** Icon, Name, Kategorie, Kurzbeschreibung, Status/Beliebtheit, Preis ab, Tags, Integrationshinweis, CTA.
- **Varianten:** Standard · *Beliebt* (Akzent-Ring) · *Neu* · *Bald verfügbar* (gedimmt).
- **Hover:** anheben (-4 px), Cyan-Border-Glow, cursor-aware Lichtschein, Icon mikro-skaliert, CTA wird sichtbarer.
- **Mobile:** volle Breite oder 2er-Grid; Tap-Feedback statt Hover.
- **Animation:** Scroll-Reveal mit Stagger; Status-Dot pulsiert.

### 4.4 Bundle Card
- **Layout:** Breitere Card; Titel + Zielgruppe, Reihe aus App-Logo-Chips, Vorteils-Bullets, Preis-Block, CTA.
- **Inhalt:** Stack-Name, Zielgruppe, enthaltene Apps, Vorteile, Preislogik, CTA.
- **Varianten:** Standard · „Beliebt" (hervorgehoben) · „Spar-Hinweis".
- **Hover:** App-Chips fächern minimal auf / leuchten nacheinander; Card-Glow.
- **Mobile:** gestapelt; Chips umbrechen.
- **Animation:** Chips-Stagger beim Reveal.

### 4.5 Pricing Card
- **Layout:** Drei Spalten; je Card Plan-Name, Preis (groß, monospace), Abrechnungshinweis, Feature-Liste mit Häkchen, CTA.
- **Inhalt:** Plan, Preis, Inklusivleistungen, „Empfohlen"-Badge, CTA.
- **Varianten:** Standard · „Empfohlen" (Akzent-Border + leichter Scale) · Enterprise/Team (Kontakt).
- **Hover:** sanftes Anheben; Häkchen animieren kurz.
- **Mobile:** vertikal gestapelt, „Empfohlen" zuerst.
- **Animation:** Monatlich/Jährlich-Toggle wechselt Preis mit kurzem Zähl-/Cross-Fade.

### 4.6 Comparison Table
- **Layout:** 4 Spalten (Merkmal · Selbst hosten · VPS · MeinAppNest); MeinAppNest-Spalte mit Akzent-Hintergrund.
- **Inhalt:** Zeilen zu Zeit, Wartung, Updates, Backups, SSL, Monitoring, Skalierung, Know-how.
- **Varianten:** Häkchen/Kreuz · Text-Werte · kompakt (mobil).
- **Hover:** aktive Zeile dezent hervorgehoben.
- **Mobile:** wird zu gestapelten Karten je Anbieter / horizontal scrollbar.
- **Animation:** Zeilen-Reveal beim Scrollen; MeinAppNest-Häkchen „poppen" leicht.

### 4.7 FAQ Accordion
- **Layout:** Einspaltige Liste; je Eintrag Frage + Chevron, ausklappbare Antwort.
- **Inhalt:** 10 Q&A (Teil 3.8).
- **Varianten:** einzeln offen / mehrere offen.
- **Hover:** Zeile leicht aufhellen; Chevron dreht.
- **Mobile:** identisch, größere Tap-Fläche.
- **Animation:** Höhe + Opacity weich (Spring), Chevron-Rotation 180°.

### 4.8 Footer
- **Layout:** Mehrspaltiges Link-Raster + obere Claim-Zeile, untere Meta-Zeile (Status, Sprache, Social, Rechtliches).
- **Inhalt:** Produkt, Apps, Ressourcen, Rechtliches, Claim, Live-Status-Badge.
- **Varianten:** voll / kompakt.
- **Hover:** Links Akzent-Fade.
- **Mobile:** Spalten zu Accordion oder gestapelt.
- **Animation:** Status-Dot pulsiert („Alle Systeme betriebsbereit").

### 4.9 Dashboard Preview
- **Layout:** Browser-/App-Frame-Mockup mit Sidebar (App-Liste), Hauptbereich (Instanz-Karten mit Status, CPU/RAM-Sparklines, „Öffnen"-Button).
- **Inhalt:** laufende Instanzen, Status, Ressourcen, Aktionen.
- **Varianten:** Hero-Version (poliert) · Feature-Version (Detail).
- **Hover:** Instanz-Karten reagieren wie echte App Cards.
- **Mobile:** auf eine Spalte reduziert, horizontal antippbar.
- **Animation:** Sparklines zeichnen sich; Status-Dots pulsieren; sanftes Parallax.

### 4.10 Status Badge
- **Layout:** Pille mit Dot + Label.
- **Inhalt:** „Live", „Beliebt", „Neu", „Wartung", „Bald".
- **Varianten:** Grün (live) · Cyan (beliebt/neu) · Amber (Wartung) · Grau (bald).
- **Hover:** Tooltip mit Detail.
- **Mobile:** unverändert.
- **Animation:** „Live"-Dot pulsiert sanft.

### 4.11 Category Filter
- **Layout:** Horizontale Chip-Reihe über dem App-Grid (Alle, Media, Automatisierung, Cloud & Dateien, Sicherheit, Monitoring, KI & Produktivität).
- **Inhalt:** Kategorien + aktive Auswahl.
- **Varianten:** aktiv (Akzent-Fill) / inaktiv (Ghost).
- **Hover:** Border-Akzent.
- **Mobile:** horizontal scrollbar, snap.
- **Animation:** Grid re-layoutet mit `layout`-Animation (Cards gleiten an neue Position).

### 4.12 Search Bar
- **Layout:** Breites Eingabefeld mit Such-Icon, Platzhalter „App suchen … (z. B. Plex, n8n)", optional ⌘K-Hinweis.
- **Inhalt:** Live-Filterung des Grids.
- **Varianten:** inline (im Store) · Command-Palette (Overlay).
- **Hover/Focus:** Border + Glow in Akzentfarbe, leichter Scale.
- **Mobile:** volle Breite, Sticky beim Scrollen im Store.
- **Animation:** Ergebnisse faden/umsortieren weich; „keine Treffer"-Zustand sanft.

### 4.13 Buttons (Basis-Komponente)
- **Primär:** Cyan-Gradient, weißer Text, weicher Glow; Hover = Glow-Puls, Active = Scale 0.98.
- **Sekundär:** Glas/Outline, heller Text; Hover = Border-Akzent + leichte Fläche.
- **Tertiär/Ghost:** nur Text + Icon; Hover = Akzent-Fade.
- **Größen:** sm / md / lg; Icon-only-Variante.
- **Mobile:** mind. 44 px Tap-Höhe.

---

## 5. Designsystem

### 5.1 Farben (Hex)

**Hintergründe / Surfaces**
| Token | Hex | Einsatz |
|---|---|---|
| `bg-base` | `#07090C` | Seiten-Hintergrund (tief, kühl) |
| `bg-elevated` | `#0C1014` | Sektionswechsel / leicht erhöht |
| `surface-1` | `#11151B` | Cards |
| `surface-2` | `#161C24` | Card-Hover / verschachtelt |
| `surface-3` | `#1C2430` | Inputs, Chips |

**Borders / Linien**
| Token | Hex / Wert | Einsatz |
|---|---|---|
| `border-subtle` | `rgba(255,255,255,0.06)` | Standard-Trennlinien |
| `border-default` | `rgba(255,255,255,0.10)` | Card-Borders |
| `border-strong` | `rgba(255,255,255,0.16)` | Hover / aktiv |
| `border-glow` | `rgba(34,211,238,0.45)` | Akzent-Hover-Ring |

**Text**
| Token | Hex | Einsatz |
|---|---|---|
| `text-primary` | `#EBF1F6` | Headlines, wichtige Labels |
| `text-secondary` | `#A4B1BE` | Fließtext |
| `text-muted` | `#637180` | Meta, Hinweise |
| `text-onAccent` | `#04181C` | Text auf Cyan-Flächen |

**Akzent (Cyan / Teal)**
| Token | Hex | Einsatz |
|---|---|---|
| `accent` | `#22D3EE` | Primärakzent, Glows, Links |
| `accent-strong` | `#06B6D4` | CTA-Fill, aktive States |
| `accent-deep` | `#0E7490` | Gradient-Ende, gedrückt |
| `accent-soft` | `rgba(34,211,238,0.12)` | Akzent-Flächen, Badges |
| Gradient | `linear-gradient(135deg,#22D3EE → #0EA5E9)` | Primary-CTA, Hero-Glow |

**Status / Semantik**
| Token | Hex | Einsatz |
|---|---|---|
| `status-live` | `#34D399` | Online/Live-Dot, Erfolg |
| `status-warning` | `#FBBF24` | Wartung |
| `status-error` | `#F87171` | Fehler |
| `status-info` | `#38BDF8` | Hinweis |

### 5.2 Typografie
- **UI / Headlines:** Geist Sans (Fallback: Inter, system-ui).
- **Mono / Technisch:** Geist Mono (Fallback: JetBrains Mono, ui-monospace).
- **Skala (rem):** Display 4.5 / H1 3.5 / H2 2.5 / H3 1.75 / H4 1.25 / Body-lg 1.125 / Body 1.0 / Small 0.875 / Caption 0.75.
- **Weights:** 400 (Body), 500 (Medium/Labels), 600 (Headlines), 700 sparsam.
- **Tracking:** Headlines `-0.02em`; Mono/Labels-Caps `+0.04em`.
- **Line-Height:** Headlines 1.05–1.15; Body 1.6.

### 5.3 Spacing-System
4-px-Basis: `4 · 8 · 12 · 16 · 24 · 32 · 48 · 64 · 96 · 128`.
Sektion-Padding vertikal: 96–128 px (Desktop), 64 px (Mobile). Card-Innenabstand: 24 px. Element-Gaps: 8/12/16.

### 5.4 Border Radius
`sm 8 · md 12 · lg 16 · xl 20 · 2xl 24 · pill 9999`. Cards meist 16–20; Buttons 12; Chips/Badges pill; Inputs 12.

### 5.5 Schatten
- `shadow-sm`: `0 1px 2px rgba(0,0,0,0.4)`
- `shadow-md`: `0 8px 24px rgba(0,0,0,0.45)`
- `shadow-lg`: `0 24px 60px rgba(0,0,0,0.55)`
- `glow-accent`: `0 0 0 1px rgba(34,211,238,0.4), 0 8px 40px rgba(34,211,238,0.20)` (Hover/aktiv)

### 5.6 Glas- / Blur-Effekte
Panels: `background: rgba(17,21,27,0.6)` + `backdrop-filter: blur(16px)` + 1-px-`border-default` + obere Lichtkante (`inset 0 1px 0 rgba(255,255,255,0.06)`). Einsatz: Navbar (scrolled), Command-Palette, Tooltips, Dashboard-Frame. Sparsam — nicht jede Card.

### 5.7 Button-Stile
| Stil | Fläche | Text | Hover | Active |
|---|---|---|---|---|
| Primary | Cyan-Gradient | `text-onAccent` | Glow-Puls | Scale 0.98 |
| Secondary | Glas/Outline | `text-primary` | Border-Akzent + Fläche | Scale 0.98 |
| Ghost | transparent | `text-secondary` | Akzent-Fade | — |
Höhen: sm 36 / md 44 / lg 52 px. Icon-Gap 8 px.

### 5.8 Card-Stile
Basis: `surface-1`, `border-default`, Radius 20, `shadow-md`, Padding 24. Hover: `surface-2`, `border-strong`/`border-glow`, translateY -4 px, `glow-accent`, 200 ms Spring. „Beliebt": zusätzlicher Akzent-Ring + dezenter Hintergrund-Glow.

### 5.9 Icons
Lucide, 1.5–2 px Strich, 20/24 px. App-Logos in einheitlichen, gleich großen Chips (40–48 px, `surface-3`, Radius 12). Konsistente optische Größe wichtiger als Pixelgröße.

### 5.10 Badges
Pill, `accent-soft`/Status-Fläche, Caps-Label 0.75 rem `+0.04em`, optional Dot. Varianten: Live (grün, pulsierend), Beliebt/Neu (cyan), Wartung (amber), Bald (grau).

### 5.11 Grid-System
12 Spalten, Maxbreite 1200–1280 px, Gutter 24 px, Außenrand 24 px (Desktop) / 16 px (Mobile). App-Grid: 4 Spalten (≥1280), 3 (≥1024), 2 (≥640), 1 (mobil). Breakpoints: `sm 640 · md 768 · lg 1024 · xl 1280 · 2xl 1536`.

---

## 6. Landingpage-Wireframe (Text, oben → unten)

```
┌──────────────────────────────────────────────────────────────┐
│ [NAVIGATION]  ◐ MeinAppNest   Apps  Bundles  Preise  Features  Docs   [Anmelden] [App starten▸] │
├──────────────────────────────────────────────────────────────┤
│ [HERO]                                                        │
│  Eyebrow: Managed App Hosting für Power-User, Teams & Creator │
│  H1: Self-hosted Power. Ohne den Self-hosting Stress.         │     ╭───────────────╮
│  Sub: Plex, Jellyfin, Nextcloud, n8n & 40+ Tools …           │     │  APP-ORBIT /  │
│  [App in 60 Sek. starten▸]  [App-Store ansehen]              │     │  DASHBOARD-   │
│  ✓ keine Kreditkarte · 14 Tage · SSL & Backups · EU          │     │  PREVIEW +    │
│  Beliebt: Plex · Jellyfin · Radarr · Vaultwarden · n8n       │     │  Terminal-Demo│
│                                                              │     ╰───────────────╯
├──────────────────────────────────────────────────────────────┤
│ [TRUST / METRICS]  40+ Apps · <60 Sek. · 99,9 % Uptime-Ziel · Auto-Backups │
├──────────────────────────────────────────────────────────────┤
│ [PROBLEM]  „Self-Hosting ist mächtig — und ein Vollzeitjob."  │
│  ▢ Server   ▢ Docker   ▢ Ports/SSL   ▢ Updates                │
│  ▢ Backups  ▢ Ausfälle ▢ Security    ▢ Debugging nachts       │
├──────────────────────────────────────────────────────────────┤
│ [SOLUTION]  „Dieselben Tools. Ohne den Betrieb."              │
│  ① App wählen → ② buchen → ③ Instanz startet → ④ Zugang → nutzen │
├──────────────────────────────────────────────────────────────┤
│ [APP-STORE GRID]  „Wähle aus 40+ fertig gehosteten Apps."     │
│  🔍 [ App suchen … ]   (Alle)(Media)(Automation)(Cloud)(Security)(KI) │
│  ┌Plex┐ ┌Jellyfin┐ ┌Radarr┐ ┌Sonarr┐                          │
│  ┌Prowlarr┐ ┌Nextcloud┐ ┌Vaultwarden┐ ┌n8n┐                   │
│  ┌Uptime Kuma┐ ┌Homepage┐ …                  [Alle Apps ▸]    │
├──────────────────────────────────────────────────────────────┤
│ [BUNDLES]  „Fertige Stacks für deinen Use-Case."              │
│  ┌Media Starter┐  ┌Productivity ★beliebt┐  ┌Automation┐       │
├──────────────────────────────────────────────────────────────┤
│ [FEATURES]  Bento: Managed · Updates · Backups · SSL/Domain · │
│  Monitoring · Isolierung · Skalierung · Dashboard · Support   │
├──────────────────────────────────────────────────────────────┤
│ [HOW IT WORKS]  ①Wählen ─ ②Account ─ ③Provisioning ─ ④Dashboard ─ ⑤Nutzen │
├──────────────────────────────────────────────────────────────┤
│ [COMPARISON]   Merkmal │ Selbst hosten │ VPS │ ✦MeinAppNest✦     │
│   Zeit/Wartung/Updates/Backups/SSL/Monitoring/Know-how         │
├──────────────────────────────────────────────────────────────┤
│ [PRICING]  (Monatlich ◐ Jährlich)                             │
│  ┌Single App┐  ┌Stack ★Empfohlen┐  ┌Pro / Team┐               │
├──────────────────────────────────────────────────────────────┤
│ [SECURITY]  Isolierte Instanzen · Verschlüsselung · Backups · Monitoring │
├──────────────────────────────────────────────────────────────┤
│ [FAQ]  ▸ Was ist MeinAppNest?  ▸ Technik nötig?  ▸ Eigene Domain? … (10) │
├──────────────────────────────────────────────────────────────┤
│ [FINAL CTA]  „Starte deine erste App in unter einer Minute."  │
│              [Jetzt kostenlos starten▸]  App-Store ansehen     │
├──────────────────────────────────────────────────────────────┤
│ [FOOTER]  Produkt · Apps · Ressourcen · Rechtliches           │
│  „MeinAppNest — deine Lieblings-Apps. Fertig gehostet."  ● Status: betriebsbereit │
└──────────────────────────────────────────────────────────────┘
```

---

## Übergabe-Hinweise
- **Akzent bewusst sparsam** einsetzen — die Premium-Wirkung entsteht durch Zurückhaltung.
- **Mono für „Maschinelles"** (Preise, Status, Ports, Terminal) ist Teil der Markenidentität.
- **Keine Stockfotos** — UI-Artefakte, App-Cards, Dashboards, Status, Snippets bauen.
- **Motion = Politur, nicht Show:** dezent, schnell, `prefers-reduced-motion` respektieren.
- **Preise sind Platzhalter** und müssen vor Launch durch reale Werte ersetzt werden.

*Begleitend geliefert: `MeinAppNestLanding.jsx` — lauffähige React-Landingpage (Tailwind + Framer Motion, Dark Mode), die diese Designrichtung umsetzt.*
