# Storefront + Dashboard (`apps/storefront`)

Next.js 14 (App Router), TypeScript, Tailwind, Dark Mode.

**Status:** Phase 0 — Platzhalter. Implementierung in Phase 3.

## Seiten (geplant)

Landing/Hero · Katalog · App-Detail · Pricing · Checkout · Login/Signup · Dashboard „Meine Dienste" · Platzhalter Impressum/AGB/Datenschutz.

## Design

- Konsistente Tailwind-Tokens (Farben, Spacing, Radien), vertrauenswürdiges SaaS im Stil von Cloudflare/Tailscale — viel Weißraum, starke Typografie, dezente Akzente.
- Hero/Sektion/abstrakte Visuals via **higgsfield** in **einem** kohärenten Stil; Assets nach `public/`.
- **Offizielle App-Logos** unter `public/logos/<app>.svg` — keine KI-Nachbauten von Marken.

## Integration

Ruft die Control-Plane über den [API-Vertrag](../../docs/api-contract.md). Auth liegt hier; privilegierte Provisioning-Logik in der Control-Plane.
