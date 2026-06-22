import crypto from "crypto";

/**
 * Storefront-signierte HMAC-Assertion fuer Control-Plane-Kundencalls.
 * Format: `<base64url(JSON.stringify({c,iat,exp}))>.<base64url(sig)>`
 *
 * Wenn STOREFRONT_ASSERT_SECRET nicht gesetzt ist, gibt sign() `null` zurueck
 * und der Caller faellt auf den Legacy-Header (X-Customer-Id) zurueck. So
 * funktioniert Stufe A vor Verteilung des Geheimnisses.
 */
const TTL_SECONDS = 5 * 60;

export function signCustomerAssertion(customerId: string): string | null {
  const secret = process.env.STOREFRONT_ASSERT_SECRET;
  if (!secret) return null;
  const now = Math.floor(Date.now() / 1000);
  const payload = Buffer.from(
    JSON.stringify({ c: customerId, iat: now, exp: now + TTL_SECONDS })
  ).toString("base64url");
  const sig = crypto
    .createHmac("sha256", secret)
    .update(payload)
    .digest("base64url");
  return `${payload}.${sig}`;
}
