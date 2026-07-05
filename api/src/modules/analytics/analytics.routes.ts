import { Router } from 'express';
import { analyticsController } from './analytics.controller';
import { validateAnalyticsQuery } from './analytics.validator';

const router = Router();

router.get('/analytics', validateAnalyticsQuery, analyticsController.getAnalytics);

export const analyticsRoutes = router;
