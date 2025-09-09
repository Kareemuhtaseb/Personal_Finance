import { Response } from 'express';
import { AuthenticatedRequest, ApiResponse } from '../types';
import prisma from '../utils/database';
import { asyncHandler, createError } from '../middleware/errorHandler';

// Get all accounts for a user
export const getAccounts = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  if (!req.user) {
    throw createError('User not authenticated', 401);
  }

  const userId = req.user.id;

  const accounts = await prisma.account.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' }
  });

  // Convert balance from cents to dollars
  const formattedAccounts = accounts.map(account => ({
    ...account,
    balance: account.balance / 100
  }));

  const response: ApiResponse = {
    success: true,
    data: formattedAccounts,
    message: 'Accounts retrieved successfully'
  };

  res.json(response);
});

// Create a new account
export const createAccount = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  if (!req.user) {
    throw createError('User not authenticated', 401);
  }

  const userId = req.user.id;
  const { name, type, balance, currency } = req.body;

  // Convert balance to cents
  const balanceInCents = Math.round((balance || 0) * 100);

  const account = await prisma.account.create({
    data: {
      userId,
      name,
      type,
      balance: balanceInCents,
      currency: currency || 'USD'
    }
  });

  const response: ApiResponse = {
    success: true,
    data: {
      ...account,
      balance: account.balance / 100
    },
    message: 'Account created successfully'
  };

  res.status(201).json(response);
});

// Update an account
export const updateAccount = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  if (!req.user) {
    throw createError('User not authenticated', 401);
  }

  const userId = req.user.id;
  const { id } = req.params;
  const { name, type, balance, currency, isActive } = req.body;

  // Check if account exists and belongs to user
  const existingAccount = await prisma.account.findFirst({
    where: {
      id,
      userId
    }
  });

  if (!existingAccount) {
    throw createError('Account not found', 404);
  }

  // Convert balance to cents if provided
  const updateData: any = {};
  if (name !== undefined) updateData.name = name;
  if (type !== undefined) updateData.type = type;
  if (balance !== undefined) updateData.balance = Math.round(balance * 100);
  if (currency !== undefined) updateData.currency = currency;
  if (isActive !== undefined) updateData.isActive = isActive;

  const account = await prisma.account.update({
    where: { id },
    data: updateData
  });

  const response: ApiResponse = {
    success: true,
    data: {
      ...account,
      balance: account.balance / 100
    },
    message: 'Account updated successfully'
  };

  res.json(response);
});

// Delete an account
export const deleteAccount = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  if (!req.user) {
    throw createError('User not authenticated', 401);
  }

  const userId = req.user.id;
  const { id } = req.params;

  // Check if account exists and belongs to user
  const existingAccount = await prisma.account.findFirst({
    where: {
      id,
      userId
    }
  });

  if (!existingAccount) {
    throw createError('Account not found', 404);
  }

  // Check if account has transactions
  const transactionCount = await prisma.transaction.count({
    where: { accountId: id }
  });

  if (transactionCount > 0) {
    throw createError('Cannot delete account with existing transactions', 400);
  }

  await prisma.account.delete({
    where: { id }
  });

  const response: ApiResponse = {
    success: true,
    message: 'Account deleted successfully'
  };

  res.json(response);
});
