import { RequestHandler } from 'express';

/** Wraps an async route so rejected promises reach the Express error handler. */
export const asyncHandler =
  (fn: RequestHandler): RequestHandler =>
  (req, res, next) =>
    Promise.resolve(fn(req, res, next)).catch(next);
