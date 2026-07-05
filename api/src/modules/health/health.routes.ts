import { Router } from 'express';
import { healthController } from './health.controller';
import { validateHealthParams, validateCorrectionInput } from './health.validator';

const router = Router();

router.get('/accounts/:id/health', validateHealthParams, healthController.getHealth);
router.get('/accounts/:id/decision', validateHealthParams, healthController.getDecisionExplanation);
router.get('/accounts/:id/health/timeline', validateHealthParams, healthController.getHealthTimeline);
router.post('/health/:id/correct', validateCorrectionInput, healthController.submitCorrection);

export const healthRoutes = router;
