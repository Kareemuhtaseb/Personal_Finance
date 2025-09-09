import { Response } from 'express'
import { PrismaClient } from '@prisma/client'
import { AuthenticatedRequest } from '../types'

const prisma = new PrismaClient()

// Get operations dashboard data
export const getOperationsDashboard = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' })
    }

    const { period = 'monthly' } = req.query

    // Calculate date range based on period
    const now = new Date()
    let startDate: Date
    let endDate = now

    switch (period) {
      case 'daily':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        break
      case 'weekly':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case 'monthly':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1)
        break
      case 'yearly':
        startDate = new Date(now.getFullYear(), 0, 1)
        break
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1)
    }

    // Get income from orders
    const orderIncome = await prisma.order.aggregate({
      where: {
        userId,
        status: 'PAID',
        updatedAt: {
          gte: startDate,
          lte: endDate
        }
      },
      _sum: {
        amount: true
      }
    })

    // Get expenses from inventory purchases
    const inventoryExpenses = await prisma.transaction.aggregate({
      where: {
        userId,
        type: 'EXPENSE',
        description: 'Inventory Purchase',
        date: {
          gte: startDate,
          lte: endDate
        }
      },
      _sum: {
        amount: true
      }
    })

    // Get expenses from task costs
    const taskExpenses = await prisma.taskCost.aggregate({
      where: {
        task: {
          userId
        },
        createdAt: {
          gte: startDate,
          lte: endDate
        }
      },
      _sum: {
        amount: true
      }
    })

    // Get expenses from workshop costs
    const workshopExpenses = await prisma.workshopCost.aggregate({
      where: {
        workshop: {
          userId
        },
        createdAt: {
          gte: startDate,
          lte: endDate
        }
      },
      _sum: {
        amount: true
      }
    })

    // Calculate totals
    const totalIncome = (orderIncome._sum.amount || 0) / 100
    const totalInventoryExpenses = Math.abs(inventoryExpenses._sum.amount || 0) / 100
    const totalTaskExpenses = (taskExpenses._sum.amount || 0) / 100
    const totalWorkshopExpenses = (workshopExpenses._sum.amount || 0) / 100
    const totalExpenses = totalInventoryExpenses + totalTaskExpenses + totalWorkshopExpenses
    const netProfit = totalIncome - totalExpenses

    // Get detailed breakdown for charts
    const dailyData = await getDailyBreakdown(userId, startDate, endDate)
    const categoryBreakdown = await getCategoryBreakdown(userId, startDate, endDate)

    const dashboard = {
      summary: {
        totalIncome,
        totalExpenses,
        netProfit,
        profitMargin: totalIncome > 0 ? (netProfit / totalIncome) * 100 : 0
      },
      breakdown: {
        income: {
          orders: totalIncome
        },
        expenses: {
          inventory: totalInventoryExpenses,
          tasks: totalTaskExpenses,
          workshops: totalWorkshopExpenses
        }
      },
      charts: {
        daily: dailyData,
        categories: categoryBreakdown
      },
      period,
      dateRange: {
        start: startDate,
        end: endDate
      }
    }

    return res.json({
      success: true,
      message: 'Operations dashboard data retrieved successfully',
      data: dashboard
    })
  } catch (error) {
    console.error('Error fetching operations dashboard:', error)
    return res.status(500).json({ success: false, message: 'Internal server error' })
  }
}

// Get daily breakdown for charts
const getDailyBreakdown = async (userId: string, startDate: Date, endDate: Date) => {
  const dailyData = []
  const currentDate = new Date(startDate)

  while (currentDate <= endDate) {
    const dayStart = new Date(currentDate)
    const dayEnd = new Date(currentDate)
    dayEnd.setDate(dayEnd.getDate() + 1)

    // Get income for this day
    const dayIncome = await prisma.order.aggregate({
      where: {
        userId,
        status: 'PAID',
        updatedAt: {
          gte: dayStart,
          lt: dayEnd
        }
      },
      _sum: {
        amount: true
      }
    })

    // Get expenses for this day
    const dayInventoryExpenses = await prisma.transaction.aggregate({
      where: {
        userId,
        type: 'EXPENSE',
        description: 'Inventory Purchase',
        date: {
          gte: dayStart,
          lt: dayEnd
        }
      },
      _sum: {
        amount: true
      }
    })

    const dayTaskExpenses = await prisma.taskCost.aggregate({
      where: {
        task: {
          userId
        },
        createdAt: {
          gte: dayStart,
          lt: dayEnd
        }
      },
      _sum: {
        amount: true
      }
    })

    const dayWorkshopExpenses = await prisma.workshopCost.aggregate({
      where: {
        workshop: {
          userId
        },
        createdAt: {
          gte: dayStart,
          lt: dayEnd
        }
      },
      _sum: {
        amount: true
      }
    })

    dailyData.push({
      date: currentDate.toISOString().split('T')[0],
      income: (dayIncome._sum.amount || 0) / 100,
      expenses: (Math.abs(dayInventoryExpenses._sum.amount || 0) + 
                (dayTaskExpenses._sum.amount || 0) + 
                (dayWorkshopExpenses._sum.amount || 0)) / 100
    })

    currentDate.setDate(currentDate.getDate() + 1)
  }

  return dailyData
}

// Get category breakdown for pie charts
const getCategoryBreakdown = async (userId: string, startDate: Date, endDate: Date) => {
  const categories = {
    income: {
      orders: 0
    },
    expenses: {
      inventory: 0,
      tasks: 0,
      workshops: 0
    }
  }

  // Get order income
  const orderIncome = await prisma.order.aggregate({
    where: {
      userId,
      status: 'PAID',
      updatedAt: {
        gte: startDate,
        lte: endDate
      }
    },
    _sum: {
      amount: true
    }
  })

  categories.income.orders = (orderIncome._sum.amount || 0) / 100

  // Get inventory expenses
  const inventoryExpenses = await prisma.transaction.aggregate({
    where: {
      userId,
      type: 'EXPENSE',
      description: 'Inventory Purchase',
      date: {
        gte: startDate,
        lte: endDate
      }
    },
    _sum: {
      amount: true
    }
  })

  categories.expenses.inventory = Math.abs(inventoryExpenses._sum.amount || 0) / 100

  // Get task expenses
  const taskExpenses = await prisma.taskCost.aggregate({
    where: {
      task: {
        userId
      },
      createdAt: {
        gte: startDate,
        lte: endDate
      }
    },
    _sum: {
      amount: true
    }
  })

  categories.expenses.tasks = (taskExpenses._sum.amount || 0) / 100

  // Get workshop expenses
  const workshopExpenses = await prisma.workshopCost.aggregate({
    where: {
      workshop: {
        userId
      },
      createdAt: {
        gte: startDate,
        lte: endDate
      }
    },
    _sum: {
      amount: true
    }
  })

  categories.expenses.workshops = (workshopExpenses._sum.amount || 0) / 100

  return categories
}

// Get operations summary (for main dashboard)
export const getOperationsSummary = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' })
    }

    // Get counts
    const totalOrders = await prisma.order.count({
      where: { userId }
    })

    const unpaidOrders = await prisma.order.count({
      where: { userId, status: 'UNPAID' }
    })

    const totalItems = await prisma.item.count({
      where: { userId, isActive: true }
    })

    // Get all items to check for low stock
    const allItems = await prisma.item.findMany({
      where: {
        userId,
        isActive: true
      },
      select: {
        quantity: true,
        minStock: true
      }
    })
    
    const lowStockItems = allItems.filter(item => item.quantity <= item.minStock).length

    const totalTasks = await prisma.task.count({
      where: { userId }
    })

    const pendingTasks = await prisma.task.count({
      where: { userId, status: 'PENDING' }
    })

    const totalWorkshops = await prisma.workshop.count({
      where: { userId }
    })

    // Get this month's totals
    const now = new Date()
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

    const monthlyIncome = await prisma.order.aggregate({
      where: {
        userId,
        status: 'PAID',
        updatedAt: {
          gte: monthStart
        }
      },
      _sum: {
        amount: true
      }
    })

    const monthlyExpenses = await prisma.transaction.aggregate({
      where: {
        userId,
        type: 'EXPENSE',
        description: 'Inventory Purchase',
        date: {
          gte: monthStart
        }
      },
      _sum: {
        amount: true
      }
    })

    const summary = {
      orders: {
        total: totalOrders,
        unpaid: unpaidOrders
      },
      inventory: {
        total: totalItems,
        lowStock: lowStockItems
      },
      tasks: {
        total: totalTasks,
        pending: pendingTasks
      },
      workshops: {
        total: totalWorkshops
      },
      monthly: {
        income: (monthlyIncome._sum.amount || 0) / 100,
        expenses: Math.abs(monthlyExpenses._sum.amount || 0) / 100
      }
    }

    return res.json({
      success: true,
      message: 'Operations summary retrieved successfully',
      data: summary
    })
  } catch (error) {
    console.error('Error fetching operations summary:', error)
    return res.status(500).json({ success: false, message: 'Internal server error' })
  }
}
