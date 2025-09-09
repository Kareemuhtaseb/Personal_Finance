import { Router } from 'express'
import { authenticateToken } from '../middleware/auth'
import {
  getWorkshops,
  getWorkshop,
  createWorkshop,
  updateWorkshop,
  deleteWorkshop,
  addWorkshopCost,
  removeWorkshopCost,
  exportWorkshopSummary
} from '../controllers/workshopController'

const router = Router()

// Apply authentication middleware to all routes
router.use(authenticateToken)

// Workshop routes
router.get('/', getWorkshops)
router.get('/:id', getWorkshop)
router.get('/:id/export', exportWorkshopSummary)
router.post('/', createWorkshop)
router.put('/:id', updateWorkshop)
router.delete('/:id', deleteWorkshop)

// Workshop cost routes
router.post('/:id/costs', addWorkshopCost)
router.delete('/:id/costs/:costId', removeWorkshopCost)

export default router
