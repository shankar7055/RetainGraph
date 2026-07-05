import { Router } from 'express';
import { graphController } from './graph.controller';
import { validateGraphParams } from './graph.validator';

const router = Router();

router.get('/accounts/:id/graph', validateGraphParams, graphController.getGraph);

export const graphRoutes = router;
