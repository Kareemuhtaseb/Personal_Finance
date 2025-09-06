import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import {
  createProject,
  getProjects,
  updateProject,
  deleteProject,
  startWorkSession,
  createManualWorkSession,
  endWorkSession,
  getWorkSessions,
  updateWorkSession,
  deleteWorkSession,
  markPaymentReceived,
  bulkMarkSessionsPaid,
  getFreelanceSummary,
  createInvoice,
  getInvoices,
  updateInvoice,
  deleteInvoice,
  createPartialPayment,
  getPartialPayments,
  exportInvoicePDF
} from '../controllers/freelanceController';

const router = Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Project routes
router.post('/projects', createProject);
router.get('/projects', getProjects);
router.put('/projects/:id', updateProject);
router.delete('/projects/:id', deleteProject);

// Work session routes
router.post('/work-sessions/start', startWorkSession);
router.post('/work-sessions/manual', createManualWorkSession);
router.put('/work-sessions/:sessionId/end', endWorkSession);
router.get('/work-sessions', getWorkSessions);
router.put('/work-sessions/:sessionId', updateWorkSession);
router.delete('/work-sessions/:sessionId', deleteWorkSession);

// Payment routes
router.post('/projects/:projectId/payment', markPaymentReceived);
router.post('/work-sessions/bulk-payment', bulkMarkSessionsPaid);

// Invoice routes
router.post('/invoices', createInvoice);
router.get('/invoices', getInvoices);
router.put('/invoices/:id', updateInvoice);
router.delete('/invoices/:id', deleteInvoice);
router.get('/invoices/:id/pdf', exportInvoicePDF);

// Partial payment routes
router.post('/partial-payments', createPartialPayment);
router.get('/partial-payments', getPartialPayments);

// Summary routes
router.get('/summary', getFreelanceSummary);

export default router;
