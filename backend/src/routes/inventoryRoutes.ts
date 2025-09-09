import { Router } from 'express'
import { authenticateToken } from '../middleware/auth'
import {
  getItems,
  getItem,
  createItem,
  updateItem,
  deleteItem,
  getLowStockAlerts,
  bulkUpdateInventory
} from '../controllers/inventoryController'

const router = Router()

// Apply authentication middleware to all routes
router.use(authenticateToken)

// Inventory routes
router.get('/', getItems)
router.get('/low-stock', getLowStockAlerts)
router.get('/:id', getItem)
router.post('/', createItem)
router.post('/bulk-update', bulkUpdateInventory)
router.put('/:id', updateItem)
router.delete('/:id', deleteItem)

export default router
