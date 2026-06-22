import { Request, Response, NextFunction } from 'express';
import { createHmac, timingSafeEqual } from 'node:crypto';
import { config } from '../config';
import { ApiError } from '../lib/errors';
import { logger } from '../logger';

/** Konstantzeit-Vergleich zweier Strings (verhindert Timing-Seitenkanal). */
function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) return false;
  return timingSafeEqual(ab, bb);
}

function bearer(req: Request): string {
  const header = req.header('authorization') ?? '';
  return header.startsWith('Bearer ') ? header.slice(7) : '';
}

/**
 * Server-zu-Server-Token fuer Kunden-Routen (Storefront -> Control-Plane).
 * Akzeptiert den Service-Token; akzeptiert in der Uebergangsphase auch den
 * Admin-Token (damit ein Admin-Call den Service-Token nicht zwingend braucht).
 */
export function serviceAuth(req: Request, _res: Response, next: NextFunction) {
  const token = bearer(req);
  if (!token) {
    throw new ApiError(401, 'unauthorized', 'Invalid or missing service token');
  }
  if (safeEqual(token, config.CP_SERVICE_TOKEN)) return next();
  if (config.CP_ADMIN_TOKEN && safeEqual(token, config.CP_ADMIN_TOKEN)) return next();
  throw new ApiError(401, 'unauthorized', 'Invalid or missing service token');
}

/**
 * Admin-Routen: bevorzugt eigener Admin-Token (Header `Authorization: Bearer`
 * ODER `X-Admin-Token`). Solange `CP_ADMIN_TOKEN` nicht gesetzt ist, faellt
 * adminAuth transparent auf serviceAuth zurueck (Stufe-A-Kompatibilitaet:
 * Storefront ohne neue ENVs funktioniert weiter).
 */
export function adminAuth(req: Request, res: Response, next: NextFunction) {
  if (!config.CP_ADMIN_TOKEN) {
    // Stufe A vor Token-Verteilung: alter Pfad (nur Service-Token).
    return serviceAuth(req, res, next);
  }
  const adminHeader = req.header('x-admin-token') ?? '';
  const tok = adminHeader || bearer(req);
  if (!tok) {
    throw new ApiError(401, 'unauthorized', 'Admin token required');
  }
  if (safeEqual(tok, config.CP_ADMIN_TOKEN)) return next();
  // Uebergang: Service-Token bis Stufe B noch akzeptieren, damit ein noch
  // nicht aktualisierter Storefront-Pod nicht ausgesperrt wird.
  if (safeEqual(tok, config.CP_SERVICE_TOKEN)) {
    logger.warn(
      { path: req.path },
      'admin route accessed with legacy CP_SERVICE_TOKEN — upgrade caller to CP_ADMIN_TOKEN before strict mode',
    );
    return next();
  }
  throw new ApiError(401, 'unauthorized', 'Invalid admin token');
}

/** Kundenkontext aus X-Customer-Id (Legacy-Pfad). */
export function customerContext(req: Request, _res: Response, next: NextFunction) {
  const customerId = req.header('x-customer-id');
  if (!customerId) {
    throw new ApiError(400, 'missing_customer', 'X-Customer-Id header required');
  }
  (req as Request & { customerId?: string }).customerId = customerId;
  next();
}

/**
 * Verifiziert eine vom Storefront ausgestellte HMAC-Customer-Assertion.
 * Format: `<base64url(payload)>.<base64url(sig)>`, payload = JSON `{c,iat,exp}`.
 * Wenn STOREFRONT_ASSERT_SECRET nicht gesetzt ist (Stufe A vor Verteilung):
 * faellt transparent auf customerContext zurueck.
 */
export function customerAssertion(req: Request, res: Response, next: NextFunction) {
  if (!config.STOREFRONT_ASSERT_SECRET) {
    return customerContext(req, res, next);
  }
  const value = req.header('x-customer-assert') ?? '';
  if (!value) {
    // Uebergang: noch alten Header akzeptieren, solange Strict-Mode nicht aktiv ist.
    return customerContext(req, res, next);
  }
  const dot = value.lastIndexOf('.');
  if (dot < 0) {
    throw new ApiError(401, 'bad_assertion', 'Malformed customer assertion');
  }
  const payloadB64 = value.slice(0, dot);
  const sigB64 = value.slice(dot + 1);
  const expected = createHmac('sha256', config.STOREFRONT_ASSERT_SECRET)
    .update(payloadB64)
    .digest('base64url');
  const a = Buffer.from(sigB64);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    throw new ApiError(401, 'bad_assertion', 'Invalid customer assertion signature');
  }
  let payload: { c?: unknown; iat?: unknown; exp?: unknown };
  try {
    payload = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf8'));
  } catch {
    throw new ApiError(401, 'bad_assertion', 'Malformed customer assertion payload');
  }
  const customerId = typeof payload.c === 'string' ? payload.c : '';
  const exp = typeof payload.exp === 'number' ? payload.exp : 0;
  const now = Math.floor(Date.now() / 1000);
  if (!customerId) {
    throw new ApiError(401, 'bad_assertion', 'Customer assertion missing customer id');
  }
  if (!exp || exp <= now) {
    throw new ApiError(401, 'bad_assertion', 'Customer assertion expired');
  }
  if (exp - now > 15 * 60) {
    // sanity: TTL hart bei 15 Min deckeln, auch wenn Aussteller mehr setzt
    throw new ApiError(401, 'bad_assertion', 'Customer assertion TTL too long');
  }
  // Defense-in-Depth: wenn zusaetzlich X-Customer-Id geschickt wird, muss er
  // mit der Assertion uebereinstimmen.
  const headerCid = req.header('x-customer-id');
  if (headerCid && headerCid !== customerId) {
    throw new ApiError(401, 'bad_assertion', 'X-Customer-Id mismatch vs assertion');
  }
  (req as Request & { customerId?: string }).customerId = customerId;
  next();
}
