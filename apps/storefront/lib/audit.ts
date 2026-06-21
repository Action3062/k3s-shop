import { prisma } from "./db";

/**
 * Schreibt einen Audit-Eintrag. Darf die auslösende Aktion NIE zum Scheitern bringen,
 * deshalb wird jeder Fehler verschluckt.
 */
export async function audit(
  actorEmail: string,
  action: string,
  target?: string | null,
  detail?: string | null,
): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: { actorEmail, action, target: target ?? null, detail: detail ?? null },
    });
  } catch {
    /* bewusst ignoriert */
  }
}
