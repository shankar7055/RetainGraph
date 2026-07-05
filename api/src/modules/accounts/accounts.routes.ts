import { Router } from 'express';
import { accountsController } from './accounts.controller';
import { validateAccountId } from './accounts.validator';

const router = Router();

router.get('/accounts', accountsController.getAccounts);
router.get('/accounts/:id', validateAccountId, accountsController.getAccountDetails);

export const accountsRoutes = router;
