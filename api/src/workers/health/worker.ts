import { healthScheduler } from './scheduler';

export const startHealthWorker = () => {
  console.log('[HealthWorker] Initializing Proactive Intelligence health checks...');
  healthScheduler.start();
};
