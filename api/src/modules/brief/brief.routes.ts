import { Router } from 'express';
import { briefController } from './brief.controller';
import { validateBriefRequest } from './brief.validator';

const router = Router();

router.post('/accounts/:id/brief', validateBriefRequest, briefController.getBrief);

export const briefRoutes = router;
