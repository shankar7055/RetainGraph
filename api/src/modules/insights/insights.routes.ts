import { Router } from 'express';
import { insightsController } from './insights.controller';
import { validateInsightsQuery } from './insights.validator';

const router = Router();

router.get('/insights', validateInsightsQuery, insightsController.getInsights);

export const insightsRoutes = router;
