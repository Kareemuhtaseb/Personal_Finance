import { Response } from 'express';
import { AuthenticatedRequest, ApiResponse, DashboardOverview, KPIData } from '../types';
import prisma from '../utils/database';
import { asyncHandler, createError } from '../middleware/errorHandler';
import { centsToDollars, calculatePercentageChange, getDateRange } from '../utils/database';

// Get dashboard overview
export const getOverview = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  if (!req.user) {
    throw createError('User not authenticated', 401);
  }

  const userId = req.user.id;
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  // Get current month transactions
  const currentMonthTransactions = await prisma.transaction.findMany({
    where: {
      userId,
      date: {
        gte: startOfMonth,
        lte: endOfMonth
      }
    }
  });

  // Get last month transactions for comparison
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
  
  const lastMonthTransactions = await prisma.transaction.findMany({
    where: {
      userId,
      date: {
        gte: lastMonthStart,
        lte: lastMonthEnd
      }
    }
  });

  // Calculate current month totals
  const monthlyIncome = currentMonthTransactions
    .filter(t => t.type === 'INCOME')
    .reduce((sum, t) => sum + t.amount, 0);

  const monthlyExpenses = Math.abs(currentMonthTransactions
    .filter(t => t.type === 'EXPENSE')
    .reduce((sum, t) => sum + t.amount, 0));

  const netSavings = monthlyIncome - monthlyExpenses;

  // Calculate freelance income
  const freelanceIncome = currentMonthTransactions
    .filter(t => t.type === 'INCOME' && t.description.toLowerCase().includes('freelance'))
    .reduce((sum, t) => sum + t.amount, 0);

  // Get total account balance
  const accounts = await prisma.account.findMany({
    where: { userId, isActive: true }
  });
  const totalBalance = accounts.reduce((sum, account) => sum + account.balance, 0);

  // Get savings progress
  const savingsGoals = await prisma.savingsGoal.findMany({
    where: { userId }
  });
  const totalSavingsTarget = savingsGoals.reduce((sum, goal) => sum + goal.target, 0);
  const totalSavingsCurrent = savingsGoals.reduce((sum, goal) => sum + goal.current, 0);
  const savingsProgress = totalSavingsTarget > 0 ? (totalSavingsCurrent / totalSavingsTarget) * 100 : 0;

  // Calculate last month totals for comparison
  const lastMonthIncome = lastMonthTransactions
    .filter(t => t.type === 'INCOME')
    .reduce((sum, t) => sum + t.amount, 0);

  const lastMonthExpenses = Math.abs(lastMonthTransactions
    .filter(t => t.type === 'EXPENSE')
    .reduce((sum, t) => sum + t.amount, 0));

  const lastMonthNet = lastMonthIncome - lastMonthExpenses;

  const lastMonthFreelance = lastMonthTransactions
    .filter(t => t.type === 'INCOME' && t.description.toLowerCase().includes('freelance'))
    .reduce((sum, t) => sum + t.amount, 0);

  const overview: DashboardOverview = {
    monthlyIncome: centsToDollars(monthlyIncome),
    monthlyExpenses: centsToDollars(monthlyExpenses),
    netSavings: centsToDollars(netSavings),
    freelanceIncome: centsToDollars(freelanceIncome),
    totalBalance: centsToDollars(totalBalance),
    savingsProgress: Math.round(savingsProgress * 100) / 100
  };

  const response: ApiResponse = {
    success: true,
    message: 'Dashboard overview retrieved successfully',
    data: overview
  };

  res.json(response);
});

// Get KPI data
export const getKPIs = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  if (!req.user) {
    throw createError('User not authenticated', 401);
  }

  const userId = req.user.id;
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  // Get current and previous month data
  const currentMonthTransactions = await prisma.transaction.findMany({
    where: {
      userId,
      date: { gte: startOfMonth, lte: endOfMonth }
    }
  });

  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
  
  const lastMonthTransactions = await prisma.transaction.findMany({
    where: {
      userId,
      date: { gte: lastMonthStart, lte: lastMonthEnd }
    }
  });

  // Calculate KPIs
  const currentIncome = currentMonthTransactions
    .filter(t => t.type === 'INCOME')
    .reduce((sum, t) => sum + t.amount, 0);

  const currentExpenses = Math.abs(currentMonthTransactions
    .filter(t => t.type === 'EXPENSE')
    .reduce((sum, t) => sum + t.amount, 0));

  const currentNet = currentIncome - currentExpenses;

  const currentFreelance = currentMonthTransactions
    .filter(t => t.type === 'INCOME' && t.description.toLowerCase().includes('freelance'))
    .reduce((sum, t) => sum + t.amount, 0);

  const lastIncome = lastMonthTransactions
    .filter(t => t.type === 'INCOME')
    .reduce((sum, t) => sum + t.amount, 0);

  const lastExpenses = Math.abs(lastMonthTransactions
    .filter(t => t.type === 'EXPENSE')
    .reduce((sum, t) => sum + t.amount, 0));

  const lastNet = lastIncome - lastExpenses;

  const lastFreelance = lastMonthTransactions
    .filter(t => t.type === 'INCOME' && t.description.toLowerCase().includes('freelance'))
    .reduce((sum, t) => sum + t.amount, 0);

  const kpis: KPIData[] = [
    {
      title: 'Monthly Income',
      value: centsToDollars(currentIncome),
      change: calculatePercentageChange(currentIncome, lastIncome),
      changeType: currentIncome >= lastIncome ? 'increase' : 'decrease',
      icon: 'arrow-trending-up',
      color: 'green'
    },
    {
      title: 'Monthly Expenses',
      value: centsToDollars(currentExpenses),
      change: calculatePercentageChange(currentExpenses, lastExpenses),
      changeType: currentExpenses <= lastExpenses ? 'decrease' : 'increase',
      icon: 'arrow-trending-down',
      color: 'red'
    },
    {
      title: 'Net Savings',
      value: centsToDollars(currentNet),
      change: calculatePercentageChange(currentNet, lastNet),
      changeType: currentNet >= lastNet ? 'increase' : 'decrease',
      icon: 'banknotes',
      color: 'blue'
    },
    {
      title: 'Freelance Income',
      value: centsToDollars(currentFreelance),
      change: calculatePercentageChange(currentFreelance, lastFreelance),
      changeType: currentFreelance >= lastFreelance ? 'increase' : 'decrease',
      icon: 'briefcase',
      color: 'purple'
    }
  ];

  const response: ApiResponse = {
    success: true,
    message: 'KPIs retrieved successfully',
    data: kpis
  };

  res.json(response);
});

// Get recent transactions
export const getRecentTransactions = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  if (!req.user) {
    throw createError('User not authenticated', 401);
  }

  const userId = req.user.id;
  const limit = parseInt(req.query.limit as string) || 5;

  const transactions = await prisma.transaction.findMany({
    where: { userId },
    include: {
      account: {
        select: { name: true, type: true }
      },
      category: {
        select: { name: true, color: true }
      }
    },
    orderBy: { date: 'desc' },
    take: limit
  });

  // Convert amounts back to dollars
  const formattedTransactions = transactions.map(transaction => ({
    ...transaction,
    amount: transaction.amount / 100,
  }));

  const response: ApiResponse = {
    success: true,
    message: 'Recent transactions retrieved successfully',
    data: formattedTransactions
  };

  res.json(response);
});

// Get savings goals
export const getSavingsGoals = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  if (!req.user) {
    throw createError('User not authenticated', 401);
  }

  const userId = req.user.id;

  const goals = await prisma.savingsGoal.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' }
  });

  const response: ApiResponse = {
    success: true,
    message: 'Savings goals retrieved successfully',
    data: goals
  };

  res.json(response);
});

// Get freelance summary
export const getFreelanceSummary = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  if (!req.user) {
    throw createError('User not authenticated', 401);
  }

  const userId = req.user.id;

  const activeProjects = await prisma.freelanceProject.count({
    where: { userId, status: 'ACTIVE' }
  });

  const totalHours = await prisma.freelanceProject.aggregate({
    where: { userId },
    _sum: { totalHours: true }
  });

  const unpaidInvoices = await prisma.invoice.count({
    where: { 
      userId,
      status: { in: ['SENT', 'OVERDUE'] }
    }
  });

  const totalUnpaid = await prisma.invoice.aggregate({
    where: { 
      userId,
      status: { in: ['SENT', 'OVERDUE'] }
    },
    _sum: { amount: true }
  });

  const summary = {
    activeProjects,
    hoursLogged: totalHours._sum.totalHours || 0,
    unpaidInvoices,
    totalUnpaid: totalUnpaid._sum.amount || 0
  };

  const response: ApiResponse = {
    success: true,
    message: 'Freelance summary retrieved successfully',
    data: summary
  };

  res.json(response);
});

// Get upcoming recurring transactions
export const getUpcomingRecurring = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  if (!req.user) {
    throw createError('User not authenticated', 401);
  }

  const userId = req.user.id;
  const now = new Date();
  const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  const upcoming = await prisma.recurringTransaction.findMany({
    where: {
      userId,
      isActive: true,
      nextDueDate: {
        gte: now,
        lte: nextWeek
      }
    },
    include: {
      account: {
        select: { name: true }
      },
      category: {
        select: { name: true, color: true }
      }
    },
    orderBy: { nextDueDate: 'asc' }
  });

  const response: ApiResponse = {
    success: true,
    message: 'Upcoming recurring transactions retrieved successfully',
    data: upcoming
  };

  res.json(response);
});
