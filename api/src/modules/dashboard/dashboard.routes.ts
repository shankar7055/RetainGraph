import { Router } from 'express';
import { dashboardController } from './dashboard.controller';
import { validateOverviewQuery } from './dashboard.validator';

const router = Router();

router.get('/dashboard/overview', validateOverviewQuery, dashboardController.getOverview);

export const dashboardRoutes = router;
