import { Response } from 'express';
import { AuthenticatedRequest, ApiResponse } from '../types';
import prisma from '../utils/database';
import { asyncHandler, createError } from '../middleware/errorHandler';

// Get all categories for a user
export const getCategories = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  if (!req.user) {
    throw createError('User not authenticated', 401);
  }

  const userId = req.user.id;

  const categories = await prisma.category.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' }
  });

  const response: ApiResponse = {
    success: true,
    data: categories,
    message: 'Categories retrieved successfully'
  };

  res.json(response);
});

// Create a new category
export const createCategory = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  if (!req.user) {
    throw createError('User not authenticated', 401);
  }

  const userId = req.user.id;
  const { name, color, type } = req.body;

  const category = await prisma.category.create({
    data: {
      userId,
      name,
      color,
      type
    }
  });

  const response: ApiResponse = {
    success: true,
    data: category,
    message: 'Category created successfully'
  };

  res.status(201).json(response);
});

// Update a category
export const updateCategory = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  if (!req.user) {
    throw createError('User not authenticated', 401);
  }

  const userId = req.user.id;
  const { id } = req.params;
  const { name, color, type } = req.body;

  // Check if category exists and belongs to user
  const existingCategory = await prisma.category.findFirst({
    where: {
      id,
      userId
    }
  });

  if (!existingCategory) {
    throw createError('Category not found', 404);
  }

  const updateData: any = {};
  if (name !== undefined) updateData.name = name;
  if (color !== undefined) updateData.color = color;
  if (type !== undefined) updateData.type = type;

  const category = await prisma.category.update({
    where: { id },
    data: updateData
  });

  const response: ApiResponse = {
    success: true,
    data: category,
    message: 'Category updated successfully'
  };

  res.json(response);
});

// Delete a category
export const deleteCategory = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  if (!req.user) {
    throw createError('User not authenticated', 401);
  }

  const userId = req.user.id;
  const { id } = req.params;

  // Check if category exists and belongs to user
  const existingCategory = await prisma.category.findFirst({
    where: {
      id,
      userId
    }
  });

  if (!existingCategory) {
    throw createError('Category not found', 404);
  }

  // Check if category has transactions
  const transactionCount = await prisma.transaction.count({
    where: { categoryId: id }
  });

  if (transactionCount > 0) {
    throw createError('Cannot delete category with existing transactions', 400);
  }

  await prisma.category.delete({
    where: { id }
  });

  const response: ApiResponse = {
    success: true,
    message: 'Category deleted successfully'
  };

  res.json(response);
});
