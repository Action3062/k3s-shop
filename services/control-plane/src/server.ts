import express, { ErrorRequestHandler } from 'express';
import { ZodError } from 'zod';
import { config } from './config';
import { logger } from './logger';
import { ApiError, errorBody } from './lib/errors';
import { serviceAuth } from './middleware/auth';
import { catalogRouter } from './routes/catalog';
import { billingRouter } from './routes/billing';
import { servicesRouter } from './routes/services';
import { stripeWebhook } from './routes/stripeWebhook';
import { startWorker } from './services/jobQueue';
import { startDeprovisionSweep } from './services/scheduler';

export function createApp() {
  const app = express();

  // Stripe webhook needs the raw body — register before express.json().
  app.post('/v1/stripe/webhook', express.raw({ type: '*/*', limit: '1mb' }), (req, res) => {
    void stripeWebhook(req, res);
  });

  app.use(express.json({ limit: '1mb' }));

  app.get('/healthz', (_req, res) => res.json({ ok: true }));

  // Public catalog
  app.use('/v1/catalog', catalogRouter);

  // Authenticated (service token)
  app.use('/v1', serviceAuth, billingRouter);
  app.use('/v1', serviceAuth, servicesRouter);

  // Error handler
  const onError: ErrorRequestHandler = (err, _req, res, _next) => {
    if (err instanceof ApiError) {
      res.status(err.status).json(errorBody(err.code, err.message, err.details));
      return;
    }
    if (err instanceof ZodError) {
      res.status(400).json(errorBody('invalid_request', 'validation failed', err.errors));
      return;
    }
    logger.error({ err: String(err) }, 'unhandled error');
    res.status(500).json(errorBody('internal', 'internal error'));
  };
  app.use(onError);

  return app;
}

if (require.main === module) {
  const app = createApp();
  app.listen(config.PORT, () => {
    logger.info({ port: config.PORT, mode: config.PROVISION_MODE }, 'control-plane listening');
    startWorker();
    startDeprovisionSweep();
  });
}
