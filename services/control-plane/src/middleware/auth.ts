import { Request, Response, NextFunction } from 'express';
import { timingSafeEqual } from 'node:crypto';
import { config } from '../config';
import { ApiError } from '../lib/errors';

/** Konstantzeit-Vergleich zweier Strings (verhindert Timing-Seitenkanal). */
function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) return false;
  return timingSafeEqual(ab, bb);
}

/** Server-zu-Server-Token (Storefront -> Control-Plane). */
export function serviceAuth(req: Request, _res: Response, next: NextFunction) {
  const header = req.header('authorization') ?? '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  if (!token || !safeEqual(token, config.CP_SERVICE_TOKEN)) {
    throw new ApiError(401, 'unauthorized', 'Invalid or missing service token');
  }
  next();
}

/** Kundenkontext aus X-Customer-Id. */
export function customerContext(req: Request, _res: Response, next: NextFunction) {
  const customerId = req.header('x-customer-id');
  if (!customerId) {
    throw new ApiError(400, 'missing_customer', 'X-Customer-Id header required');
  }
  (req as Request & { customerId?: string }).customerId = customerId;
  next();
}
