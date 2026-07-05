import dotenv from 'dotenv';
dotenv.config();

import { startHealthWorker } from './health/worker';
import { startIngestWorker } from './ingest/worker';

console.log('[IngestWorker] Initializing modular background worker instances...');

startHealthWorker();
startIngestWorker();
