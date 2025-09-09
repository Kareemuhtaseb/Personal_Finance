import { Router } from 'express';
import {
  getAccounts,
  createAccount,
  updateAccount,
  deleteAccount
} from '../controllers/accountController';
import { authenticateToken } from '../middleware/auth';
import { validateBody } from '../middleware/validation';
import { createAccountSchema, updateAccountSchema } from '../utils/validation';

const router = Router();

// All account routes require authentication
router.use(authenticateToken);

// Account routes
router.get('/', getAccounts);
router.post('/', validateBody(createAccountSchema), createAccount);
router.put('/:id', validateBody(updateAccountSchema), updateAccount);
router.delete('/:id', deleteAccount);

export default router;
