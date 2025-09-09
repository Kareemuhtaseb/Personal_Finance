import { Router } from 'express';
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory
} from '../controllers/categoryController';
import { authenticateToken } from '../middleware/auth';
import { validateBody } from '../middleware/validation';
import { createCategorySchema, updateCategorySchema } from '../utils/validation';

const router = Router();

// All category routes require authentication
router.use(authenticateToken);

// Category routes
router.get('/', getCategories);
router.post('/', validateBody(createCategorySchema), createCategory);
router.put('/:id', validateBody(updateCategorySchema), updateCategory);
router.delete('/:id', deleteCategory);

export default router;
