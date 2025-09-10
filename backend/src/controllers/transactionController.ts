import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { validateBody } from '../middleware/validation';
import { createTransactionSchema } from '../utils/validation';

// Extend Request type to include user
interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
  };
}

const prisma = new PrismaClient();

export const createTransaction = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ 
        success: false, 
        message: 'User not authenticated' 
      });
      return;
    }

    const { accountId, categoryId, description, amount, date, type } = req.body;

    // Convert amount to cents (multiply by 100)
    const amountInCents = Math.round(amount * 100);

    // Create the transaction
    const transaction = await prisma.transaction.create({
      data: {
        userId,
        accountId,
        categoryId,
        description,
        amount: amountInCents,
        date: date ? new Date(date) : new Date(),
        type,
      },
      include: {
        account: true,
        category: true,
      },
    });

    res.status(201).json({
      success: true,
      data: {
        ...transaction,
        amount: transaction.amount / 100, // Convert back to dollars
      },
      message: 'Transaction created successfully'
    });
  } catch (error) {
    console.error('Error creating transaction:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create transaction'
    });
  }
};

export const getTransactions = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ 
        success: false, 
        message: 'User not authenticated' 
      });
      return;
    }

    const { limit = 50, offset = 0 } = req.query;

    const transactions = await prisma.transaction.findMany({
      where: { userId },
      include: {
        account: true,
        category: true,
      },
      orderBy: { date: 'desc' },
      take: parseInt(limit as string),
      skip: parseInt(offset as string),
    });

    // Convert amounts back to dollars
    const formattedTransactions = transactions.map(transaction => ({
      ...transaction,
      amount: transaction.amount / 100,
    }));

    res.json({
      success: true,
      data: formattedTransactions
    });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch transactions'
    });
  }
};

export const deleteTransaction = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ 
        success: false, 
        message: 'User not authenticated' 
      });
      return;
    }

    const { id } = req.params;

    // Check if transaction exists and belongs to user
    const existingTransaction = await prisma.transaction.findFirst({
      where: {
        id,
        userId
      }
    });

    if (!existingTransaction) {
      res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
      return;
    }

    // Delete the transaction
    await prisma.transaction.delete({
      where: {
        id
      }
    });

    res.json({
      success: true,
      message: 'Transaction deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting transaction:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete transaction'
    });
  }
};
