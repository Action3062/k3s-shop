import { prisma } from "./db";

export interface SettingDef {
  key: string;
  label: string;
  hint: string;
  type: "bool" | "number" | "text";
  default: string;
}

/** Bekannte Plattform-Einstellungen (Schlüssel-Wert in DB, mit Default-Fallback). */
export const SETTING_DEFS: SettingDef[] = [
  { key: "signupOpen",       label: "Registrierung offen",     hint: "Neue Kunden können sich registrieren.",                      type: "bool",   default: "true" },
  { key: "maintenanceMode",  label: "Wartungsmodus",           hint: "Zeigt allen Kunden im Dashboard einen Wartungshinweis.",     type: "bool",   default: "false" },
  { key: "defaultGraceDays", label: "Karenzzeit (Tage)",       hint: "Tage bis zur endgültigen Löschung nach einer Kündigung.",    type: "number", default: "14" },
  { key: "defaultStorageGi", label: "Standard-Speicher (GiB)", hint: "Vorgabe für neue Instanzen ohne ausdrückliche Plan-Angabe.", type: "number", default: "5" },
];

export async function getSettings(): Promise<Record<string, string>> {
  const map: Record<string, string> = {};
  for (const d of SETTING_DEFS) map[d.key] = d.default;
  try {
    const rows = await prisma.setting.findMany();
    for (const r of rows) map[r.key] = r.value;
  } catch {
    /* Tabelle evtl. noch nicht migriert — Defaults nutzen */
  }
  return map;
}

export async function isMaintenance(): Promise<boolean> {
  return (await getSettings()).maintenanceMode === "true";
}
