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
  getFreelanceSummary
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

// Summary routes
router.get('/summary', getFreelanceSummary);

export default router;
