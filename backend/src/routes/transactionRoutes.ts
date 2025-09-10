import { Router } from 'express';
import { createTransaction, getTransactions, deleteTransaction } from '../controllers/transactionController';
import { authenticateToken } from '../middleware/auth';
import { validateBody } from '../middleware/validation';
import { createTransactionSchema } from '../utils/validation';

const router = Router();

// All transaction routes require authentication
router.use(authenticateToken);

// Transaction routes
router.post('/', validateBody(createTransactionSchema), createTransaction);
router.get('/', getTransactions);
router.delete('/:id', deleteTransaction);

export default router;
