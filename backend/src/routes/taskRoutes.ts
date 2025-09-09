import { Router } from 'express'
import { authenticateToken } from '../middleware/auth'
import {
  getTasks,
  getTasksByStatus,
  getTask,
  createTask,
  updateTask,
  updateTaskStatus,
  deleteTask,
  addTaskCost,
  removeTaskCost
} from '../controllers/taskController'

const router = Router()

// Apply authentication middleware to all routes
router.use(authenticateToken)

// Task routes
router.get('/', getTasks)
router.get('/by-status', getTasksByStatus)
router.get('/:id', getTask)
router.post('/', createTask)
router.put('/:id', updateTask)
router.patch('/:id/status', updateTaskStatus)
router.delete('/:id', deleteTask)

// Task cost routes
router.post('/:id/costs', addTaskCost)
router.delete('/:id/costs/:costId', removeTaskCost)

export default router
