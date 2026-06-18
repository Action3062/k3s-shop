# DynStore — Landingpage

Lauffähige Marketing-Landingpage für **DynStore** (*„Self-hosted Power. Ohne den Self-hosting Stress."*).
Gebaut mit **Vite + React + Tailwind CSS + Framer Motion**, Dark Mode als Standard.

## Schnellstart

```bash
npm install
npm run dev      # Dev-Server (http://localhost:5173)
npm run build    # Production-Build nach dist/
npm run preview  # Build lokal ansehen
```

## Brand-Tokens

Alle Marken-Designtokens liegen zentral in `tailwind.config.js` (`theme.extend`):

- **Farben:** `base`, `elevated`, `surface.1/2/3`, `ink` (Text), `accent` (Cyan/Teal), `live`, `hair` (Borders)
- **Fonts:** `font-sans` (Inter), `font-mono` (JetBrains Mono)
- **Schatten:** `shadow-card`, `shadow-glow`, `shadow-glow-strong`
- **Radius:** `rounded-card` (20px)

Im Markup werden diese als Tailwind-Klassen genutzt, z. B. `bg-surface-1`, `text-ink-soft`,
`border-hair-faint`, `text-accent`, `shadow-glow`. Gradient-/Glow-Hilfsklassen
(`.bg-brand-gradient`, `.text-brand-gradient`) stehen in `src/index.css`.

## Struktur

```
dynstore-site/
├─ index.html              # Fonts + Root, <html class="dark">
├─ tailwind.config.js      # Brand-Tokens
├─ src/
│  ├─ main.jsx             # Entry
│  ├─ index.css            # Tailwind-Direktiven + Utilities + Base
│  └─ DynStoreLanding.jsx  # komplette Landingpage (alle Sektionen)
```

## Hinweise
- Preise sind **Platzhalter** — vor Launch durch reale Werte ersetzen.
- App-/Bundle-/FAQ-Inhalte stehen als Arrays oben in `DynStoreLanding.jsx` und sind leicht editierbar.
- Konzept & Designsystem: siehe `../DynStore-Website-Konzept.md`.
