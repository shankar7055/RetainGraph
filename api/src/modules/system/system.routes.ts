import { Router } from 'express';
import { systemController } from './system.controller';

const router = Router();

router.get('/system/status', systemController.getStatus);
router.get('/system/pipeline', systemController.getPipeline);

export const systemRoutes = router;
