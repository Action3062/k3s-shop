// Standalone worker entrypoint (run as a separate process/Deployment if desired).
import { logger } from './logger';
import { startWorker } from './services/jobQueue';
import { startDeprovisionSweep } from './services/scheduler';

startWorker();
startDeprovisionSweep();
logger.info('control-plane worker process started');
