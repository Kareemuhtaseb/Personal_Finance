import { Router } from 'express'
import { authenticateToken } from '../middleware/auth'
import {
  getOperationsDashboard,
  getOperationsSummary
} from '../controllers/operationsController'

const router = Router()

// Apply authentication middleware to all routes
router.use(authenticateToken)

// Operations dashboard routes
router.get('/dashboard', getOperationsDashboard)
router.get('/summary', getOperationsSummary)

export default router
