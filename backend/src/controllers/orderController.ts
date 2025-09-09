import { Response } from 'express'
import { PrismaClient } from '@prisma/client'
import { generateOrderNumber } from '../utils/orderUtils'
import { AuthenticatedRequest } from '../types'

const prisma = new PrismaClient()

// Get all orders for a user
export const getOrders = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' })
    }

    const { status, priority, type, sortBy = 'createdAt', sortOrder = 'desc' } = req.query

    const where: any = { userId }
    
    if (status) {
      where.status = status
    }
    if (priority) {
      where.priority = priority
    }
    if (type) {
      where.type = type
    }

    const orders = await prisma.order.findMany({
      where,
      include: {
        orderItems: {
          include: {
            item: true
          }
        },
        tasks: true,
        workshops: true
      },
      orderBy: {
        [sortBy as string]: sortOrder as 'asc' | 'desc'
      }
    })

    return res.json({
      success: true,
      message: 'Orders retrieved successfully',
      data: orders
    })
  } catch (error) {
    console.error('Error fetching orders:', error)
    return res.status(500).json({ success: false, message: 'Internal server error' })
  }
}

// Get a single order
export const getOrder = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id
    const { id } = req.params

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' })
    }

    const order = await prisma.order.findFirst({
      where: { id, userId },
      include: {
        orderItems: {
          include: {
            item: true
          }
        },
        tasks: true,
        workshops: true
      }
    })

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' })
    }

    return res.json({
      success: true,
      message: 'Order retrieved successfully',
      data: order
    })
  } catch (error) {
    console.error('Error fetching order:', error)
    return res.status(500).json({ success: false, message: 'Internal server error' })
  }
}

// Create a new order
export const createOrder = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' })
    }

    const { amount, type, dueDate, priority, description, items } = req.body

    // Generate unique order number
    const orderNumber = await generateOrderNumber()

    const order = await prisma.order.create({
      data: {
        userId,
        orderNumber,
        amount: Math.round(amount * 100), // Convert to cents
        type,
        dueDate: dueDate ? new Date(dueDate) : null,
        priority: priority || 'NORMAL',
        description,
        orderItems: {
          create: items?.map((item: any) => ({
            itemId: item.itemId,
            quantity: item.quantity,
            unitPrice: Math.round(item.unitPrice * 100)
          })) || []
        }
      },
      include: {
        orderItems: {
          include: {
            item: true
          }
        }
      }
    })

    return res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: order
    })
  } catch (error) {
    console.error('Error creating order:', error)
    return res.status(500).json({ success: false, message: 'Internal server error' })
  }
}

// Update an order
export const updateOrder = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id
    const { id } = req.params
    const { status, amount, type, dueDate, priority, description } = req.body

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' })
    }

    // Check if order exists and belongs to user
    const existingOrder = await prisma.order.findFirst({
      where: { id, userId }
    })

    if (!existingOrder) {
      return res.status(404).json({ success: false, message: 'Order not found' })
    }

    const updateData: any = {}
    if (status !== undefined) updateData.status = status
    if (amount !== undefined) updateData.amount = Math.round(amount * 100)
    if (type !== undefined) updateData.type = type
    if (dueDate !== undefined) updateData.dueDate = dueDate ? new Date(dueDate) : null
    if (priority !== undefined) updateData.priority = priority
    if (description !== undefined) updateData.description = description

    const order = await prisma.order.update({
      where: { id },
      data: updateData,
      include: {
        orderItems: {
          include: {
            item: true
          }
        },
        tasks: true,
        workshops: true
      }
    })

    // If order is marked as paid, deduct inventory and create income transaction
    if (status === 'PAID' && existingOrder.status !== 'PAID') {
      await handleOrderPayment(order)
    }

    return res.json({
      success: true,
      message: 'Order updated successfully',
      data: order
    })
  } catch (error) {
    console.error('Error updating order:', error)
    return res.status(500).json({ success: false, message: 'Internal server error' })
  }
}

// Delete an order
export const deleteOrder = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id
    const { id } = req.params

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' })
    }

    // Check if order exists and belongs to user
    const order = await prisma.order.findFirst({
      where: { id, userId }
    })

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' })
    }

    await prisma.order.delete({
      where: { id }
    })

    return res.json({
      success: true,
      message: 'Order deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting order:', error)
    return res.status(500).json({ success: false, message: 'Internal server error' })
  }
}

// Handle order payment - deduct inventory and create income transaction
const handleOrderPayment = async (order: any) => {
  try {
    // Deduct inventory for each order item
    for (const orderItem of order.orderItems) {
      await prisma.item.update({
        where: { id: orderItem.itemId },
        data: {
          quantity: {
            decrement: orderItem.quantity
          }
        }
      })
    }

    // Create income transaction
    let incomeCategory = await prisma.category.findFirst({
      where: { userId: order.userId, type: 'INCOME', name: 'Orders' }
    })

    // Create Orders category if it doesn't exist
    if (!incomeCategory) {
      incomeCategory = await prisma.category.create({
        data: {
          userId: order.userId,
          name: 'Orders',
          color: '#3B82F6',
          type: 'INCOME'
        }
      })
    }

    const account = await prisma.account.findFirst({
      where: { userId: order.userId, isActive: true }
    })

    if (account) {
      await prisma.transaction.create({
        data: {
          userId: order.userId,
          accountId: account.id,
          categoryId: incomeCategory.id,
          description: `Order Payment - ${order.orderNumber}`,
          amount: order.amount, // Already in cents
          date: new Date(),
          type: 'INCOME'
        }
      })
    }
  } catch (error) {
    console.error('Error handling order payment:', error)
  }
}
