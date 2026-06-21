import crypto from "crypto";

const INSECURE_DEFAULT = "dev-secret-change-me";

/**
 * Liefert das HMAC-Secret. Faellt nur ausserhalb von Produktion auf einen
 * Default zurueck; in Produktion wird der unsichere Default hart abgelehnt
 * (lazy, damit `next build` ohne gesetztes Secret nicht bricht).
 */
function gateSecret(): string {
  const s =
    process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || INSECURE_DEFAULT;
  if (process.env.NODE_ENV === "production" && s === INSECURE_DEFAULT) {
    throw new Error(
      "AUTH_SECRET/NEXTAUTH_SECRET must be set in production — refusing to sign/verify gate cookies with the insecure default."
    );
  }
  return s;
}
const TTL_MS = 12 * 60 * 60 * 1000;

export const GATE_COOKIE = "mn_gate";

export function signGate(host: string, ttlMs: number = TTL_MS): string {
  const payload = Buffer.from(
    JSON.stringify({ h: host, e: Date.now() + ttlMs })
  ).toString("base64url");
  const sig = crypto.createHmac("sha256", gateSecret()).update(payload).digest("base64url");
  return `${payload}.${sig}`;
}

export function verifyGate(value: string | undefined | null, host: string): boolean {
  if (!value) return false;
  const dot = value.lastIndexOf(".");
  if (dot < 0) return false;
  const payload = value.slice(0, dot);
  const sig = value.slice(dot + 1);
  const expected = crypto
    .createHmac("sha256", gateSecret())
    .update(payload)
    .digest("base64url");
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return false;
  try {
    const o = JSON.parse(Buffer.from(payload, "base64url").toString());
    return o.h === host && typeof o.e === "number" && o.e > Date.now();
  } catch {
    return false;
  }
}
