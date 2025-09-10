import Joi from 'joi';
import { ValidationError } from '../types';

// Common validation schemas
export const paginationSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  sortBy: Joi.string().optional(),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc'),
});

// User validation schemas
export const registerSchema = Joi.object({
  name: Joi.string().min(2).max(50).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
  timezone: Joi.string().default('UTC'),
  currency: Joi.string().length(3).default('USD'),
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

export const updateProfileSchema = Joi.object({
  name: Joi.string().min(2).max(50).optional(),
  email: Joi.string().email().optional(),
  timezone: Joi.string().optional(),
  currency: Joi.string().length(3).optional(),
});

// Account validation schemas
export const createAccountSchema = Joi.object({
  name: Joi.string().min(2).max(50).required(),
  type: Joi.string().valid('CHECKING', 'SAVINGS', 'CREDIT', 'INVESTMENT').required(),
  balance: Joi.number().default(0),
  currency: Joi.string().length(3).default('USD'),
});

export const updateAccountSchema = Joi.object({
  name: Joi.string().min(2).max(50).optional(),
  type: Joi.string().valid('CHECKING', 'SAVINGS', 'CREDIT', 'INVESTMENT').optional(),
  balance: Joi.number().optional(),
  currency: Joi.string().length(3).optional(),
  isActive: Joi.boolean().optional(),
});

// Transaction validation schemas
export const createTransactionSchema = Joi.object({
  accountId: Joi.string().required(),
  categoryId: Joi.string().required(),
  description: Joi.string().min(1).max(200).required(),
  amount: Joi.number().required(),
  date: Joi.date().default(Date.now),
  type: Joi.string().valid('INCOME', 'EXPENSE').required(),
});

export const updateTransactionSchema = Joi.object({
  accountId: Joi.string().optional(),
  categoryId: Joi.string().optional(),
  description: Joi.string().min(1).max(200).optional(),
  amount: Joi.number().optional(),
  date: Joi.date().optional(),
  type: Joi.string().valid('INCOME', 'EXPENSE').optional(),
  cleared: Joi.boolean().optional(),
});

export const transactionFiltersSchema = Joi.object({
  search: Joi.string().optional(),
  category: Joi.string().optional(),
  account: Joi.string().optional(),
  type: Joi.string().valid('income', 'expense').optional(),
  startDate: Joi.date().optional(),
  endDate: Joi.date().optional(),
  cleared: Joi.boolean().optional(),
});

// Category validation schemas
export const createCategorySchema = Joi.object({
  name: Joi.string().min(2).max(50).required(),
  color: Joi.string().pattern(/^#[0-9A-F]{6}$/i).required(),
  type: Joi.string().valid('INCOME', 'EXPENSE').required(),
});

export const updateCategorySchema = Joi.object({
  name: Joi.string().min(2).max(50).optional(),
  color: Joi.string().pattern(/^#[0-9A-F]{6}$/i).optional(),
  type: Joi.string().valid('INCOME', 'EXPENSE').optional(),
});

// Savings goal validation schemas
export const createSavingsGoalSchema = Joi.object({
  name: Joi.string().min(2).max(50).required(),
  target: Joi.number().positive().required(),
  color: Joi.string().pattern(/^#[0-9A-F]{6}$/i).required(),
  targetDate: Joi.date().optional(),
});

export const updateSavingsGoalSchema = Joi.object({
  name: Joi.string().min(2).max(50).optional(),
  target: Joi.number().positive().optional(),
  current: Joi.number().min(0).optional(),
  color: Joi.string().pattern(/^#[0-9A-F]{6}$/i).optional(),
  targetDate: Joi.date().optional(),
});

// Freelance project validation schemas
export const createFreelanceProjectSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  client: Joi.string().min(2).max(100).required(),
  status: Joi.string().valid('ACTIVE', 'COMPLETED', 'PAUSED').default('ACTIVE'),
  hourlyRate: Joi.number().positive().required(),
});

export const updateFreelanceProjectSchema = Joi.object({
  name: Joi.string().min(2).max(100).optional(),
  client: Joi.string().min(2).max(100).optional(),
  status: Joi.string().valid('ACTIVE', 'COMPLETED', 'PAUSED').optional(),
  hourlyRate: Joi.number().positive().optional(),
  totalHours: Joi.number().min(0).optional(),
});

// Invoice validation schemas
export const createInvoiceSchema = Joi.object({
  projectId: Joi.string().required(),
  amount: Joi.number().positive().required(),
  dueDate: Joi.date().required(),
  invoiceNumber: Joi.string().optional(),
});

export const updateInvoiceSchema = Joi.object({
  amount: Joi.number().positive().optional(),
  status: Joi.string().valid('DRAFT', 'SENT', 'PAID', 'OVERDUE').optional(),
  dueDate: Joi.date().optional(),
});

// Salary validation schemas
export const updateSalarySchema = Joi.object({
  gross: Joi.number().positive().required(),
});

export const createSalaryDeductionSchema = Joi.object({
  name: Joi.string().min(2).max(50).required(),
  amount: Joi.number().positive().required(),
  type: Joi.string().valid('TAX', 'BENEFIT', 'OTHER').required(),
});

// Recurring transaction validation schemas
export const createRecurringTransactionSchema = Joi.object({
  accountId: Joi.string().required(),
  categoryId: Joi.string().required(),
  description: Joi.string().min(1).max(200).required(),
  amount: Joi.number().required(),
  frequency: Joi.string().valid('WEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY').required(),
  nextDueDate: Joi.date().required(),
});

// Report validation schemas
export const reportParamsSchema = Joi.object({
  period: Joi.string().valid('week', 'month', 'quarter', 'year').required(),
  startDate: Joi.date().optional(),
  endDate: Joi.date().optional(),
});

// Validation helper function
export const validateRequest = (schema: Joi.ObjectSchema, data: any): { isValid: boolean; errors: ValidationError[] } => {
  const { error } = schema.validate(data, { abortEarly: false });
  
  if (error) {
    const errors: ValidationError[] = error.details.map(detail => ({
      field: detail.path.join('.'),
      message: detail.message,
    }));
    return { isValid: false, errors };
  }
  
  return { isValid: true, errors: [] };
};
