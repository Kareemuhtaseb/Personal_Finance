import { Router } from 'express'
import { authenticateToken } from '../middleware/auth'
import {
  getOrders,
  getOrder,
  createOrder,
  updateOrder,
  deleteOrder
} from '../controllers/orderController'

const router = Router()

// Apply authentication middleware to all routes
router.use(authenticateToken)

// Order routes
router.get('/', getOrders)
router.get('/:id', getOrder)
router.post('/', createOrder)
router.put('/:id', updateOrder)
router.delete('/:id', deleteOrder)

export default router
