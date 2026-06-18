import { Request, Response, NextFunction } from 'express';
import { config } from '../config';
import { ApiError } from '../lib/errors';

/** Server-zu-Server-Token (Storefront -> Control-Plane). */
export function serviceAuth(req: Request, _res: Response, next: NextFunction) {
  const header = req.header('authorization') ?? '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  if (!token || token !== config.CP_SERVICE_TOKEN) {
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
