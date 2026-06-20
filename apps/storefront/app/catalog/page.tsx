import { getCatalog } from "@/lib/controlPlane";
import { AppCard } from "@/components/AppCard";

const AVAILABLE = new Set(["vaultwarden", "openclaw", "seerr"]);

export const metadata = { title: "Apps — MeinAppNest" };

export default async function Catalog() {
  const catalog = await getCatalog();
  return (
    <section className="wrap py-16">
      <span className="eyebrow">Katalog</span>
      <h1 className="mt-2.5 mb-2 font-semibold tracking-tight text-[clamp(28px,4vw,44px)]">Alle Apps</h1>
      <p className="text-muted mb-10 max-w-[60ch]">Wähle eine App und erhalte sie als isolierte Instanz unter deiner eigenen Subdomain. Weitere Apps folgen.</p>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-[18px]">
        {catalog.map((a) => <AppCard key={a.slug} app={a} available={AVAILABLE.has(a.slug)} />)}
      </div>
    </section>
  );
}
