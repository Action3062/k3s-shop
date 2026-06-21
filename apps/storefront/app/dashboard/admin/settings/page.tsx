import { getSettings, SETTING_DEFS } from "@/lib/settings";
import { saveSettings } from "@/app/admin-actions";
import { StatusBanner } from "@/components/dashboard/OverviewWidgets";

export const metadata = { title: "Admin — Einstellungen" };

export default async function AdminSettings({ searchParams }: { searchParams: { done?: string } }) {
  const values = await getSettings();

  return (
    <section>
      <h1 className="text-[30px] font-semibold tracking-[-0.02em]">Einstellungen</h1>
      <p className="text-muted text-[14px] mt-1 mb-5">Globale Plattform-Schalter.</p>

      {searchParams.done === "settings" && <StatusBanner tone="ok">Einstellungen gespeichert.</StatusBanner>}

      <form action={saveSettings} className="card grid gap-4 max-w-2xl">
        {SETTING_DEFS.map((d) => (
          <div key={d.key} className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="text-[14px] font-medium">{d.label}</div>
              <div className="text-[12.5px] text-muted">{d.hint}</div>
            </div>
            {d.type === "bool" ? (
              <input type="checkbox" name={d.key} defaultChecked={values[d.key] === "true"} className="h-5 w-5 mt-1 accent-[#22d3ee] shrink-0" />
            ) : (
              <input
                name={d.key}
                type={d.type === "number" ? "number" : "text"}
                defaultValue={values[d.key]}
                className="h-9 px-3 w-32 rounded-lg bg-surface border border-line2 text-ink outline-none focus:border-accent shrink-0"
              />
            )}
          </div>
        ))}
        <div><button type="submit" className="btn btn-primary h-9 px-4 text-[13px]">Speichern</button></div>
      </form>
    </section>
  );
}
