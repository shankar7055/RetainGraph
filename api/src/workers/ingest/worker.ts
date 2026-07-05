import { ingestScheduler } from './scheduler';

export const startIngestWorker = () => {
  console.log('[IngestWorker] Starting background processing worker...');
  ingestScheduler.start();
};
