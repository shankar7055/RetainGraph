import { Request, Response } from 'express';
import { accountsService } from './accounts.service';

export class AccountsController {
  public async getAccounts(req: Request, res: Response) {
    try {
      const list = await accountsService.getAccountsList();
      return res.json(list);
    } catch (error) {
      console.error('[AccountsController] Error fetching list:', error);
      return res.status(500).json({ error: 'Failed to retrieve accounts list.' });
    }
  }

  public async getAccountDetails(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const details = await accountsService.getAccountDetails(id);
      return res.json(details);
    } catch (error) {
      console.error('[AccountsController] Error fetching details:', error);
      return res.status(500).json({ error: 'Failed to retrieve account details.' });
    }
  }
}

export const accountsController = new AccountsController();
