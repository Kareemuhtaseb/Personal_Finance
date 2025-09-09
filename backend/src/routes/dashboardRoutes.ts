import { Router } from 'express';
import {
  getOverview,
  getKPIs,
  getRecentTransactions,
  getSavingsGoals,
  getFreelanceSummary,
  getUpcomingRecurring
} from '../controllers/dashboardController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// All dashboard routes require authentication
router.use(authenticateToken);

// Dashboard overview
router.get('/overview', getOverview);
router.get('/kpis', getKPIs);

// Dashboard components
router.get('/recent-transactions', getRecentTransactions);
router.get('/savings-goals', getSavingsGoals);
router.get('/freelance-summary', getFreelanceSummary);
router.get('/upcoming-recurring', getUpcomingRecurring);

export default router;
