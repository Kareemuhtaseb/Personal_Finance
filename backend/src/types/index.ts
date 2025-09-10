import { Request } from 'express';
import { User } from '@prisma/client';

// Extend Express Request to include user
export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    name: string;
    timezone: string;
    currency: string;
    createdAt: Date;
    updatedAt: Date;
  };
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

// Pagination types
export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Transaction types
export interface TransactionFilters {
  search?: string;
  category?: string;
  account?: string;
  type?: 'income' | 'expense';
  startDate?: string;
  endDate?: string;
  cleared?: boolean;
}

// Dashboard types
export interface DashboardOverview {
  monthlyIncome: number;
  monthlyExpenses: number;
  netSavings: number;
  freelanceIncome: number;
  totalBalance: number;
  savingsProgress: number;
}

export interface KPIData {
  title: string;
  value: number;
  change: number;
  changeType: 'increase' | 'decrease';
  icon: string;
  color: string;
}

// Report types
export interface ReportParams {
  period: 'week' | 'month' | 'quarter' | 'year';
  startDate?: string;
  endDate?: string;
}

export interface CashflowReport {
  period: string;
  income: number;
  expenses: number;
  net: number;
}

export interface CategoryReport {
  category: string;
  amount: number;
  percentage: number;
  color: string;
}

// Validation types
export interface ValidationError {
  field: string;
  message: string;
}

// File upload types
export interface FileUpload {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  destination: string;
  filename: string;
  path: string;
}

// Email types
export interface EmailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
  attachments?: Array<{
    filename: string;
    content: Buffer;
    contentType: string;
  }>;
}
