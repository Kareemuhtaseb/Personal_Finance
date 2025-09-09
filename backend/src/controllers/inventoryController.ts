import { Response } from 'express'
import { PrismaClient } from '@prisma/client'
import { AuthenticatedRequest } from '../types'

const prisma = new PrismaClient()

// Get all inventory items
export const getItems = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' })
    }

    const { search, lowStock, sortBy = 'name', sortOrder = 'asc' } = req.query

    const where: any = { userId }
    
    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { description: { contains: search as string, mode: 'insensitive' } }
      ]
    }

    // Note: Low stock filtering is handled in the frontend after fetching items
    // since Prisma doesn't support comparing two fields directly in SQLite

    const items = await prisma.item.findMany({
      where,
      orderBy: {
        [sortBy as string]: sortOrder as 'asc' | 'desc'
      }
    })

    // Calculate total value for each item
    const itemsWithValue = items.map(item => ({
      ...item,
      totalValue: item.quantity * item.unitCost,
      isLowStock: item.quantity <= item.minStock
    }))

    return res.json({
      success: true,
      message: 'Inventory items retrieved successfully',
      data: itemsWithValue
    })
  } catch (error) {
    console.error('Error fetching inventory items:', error)
    return res.status(500).json({ success: false, message: 'Internal server error' })
  }
}

// Get a single inventory item
export const getItem = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id
    const { id } = req.params

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' })
    }

    const item = await prisma.item.findFirst({
      where: { id, userId },
      include: {
        orderItems: {
          include: {
            order: true
          }
        },
        taskCosts: {
          include: {
            task: true
          }
        }
      }
    })

    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found' })
    }

    const itemWithValue = {
      ...item,
      totalValue: item.quantity * item.unitCost,
      isLowStock: item.quantity <= item.minStock
    }

    return res.json({
      success: true,
      message: 'Item retrieved successfully',
      data: itemWithValue
    })
  } catch (error) {
    console.error('Error fetching item:', error)
    return res.status(500).json({ success: false, message: 'Internal server error' })
  }
}

// Create a new inventory item
export const createItem = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' })
    }

    const { name, description, quantity, unitCost, minStock, maxStock } = req.body

    const item = await prisma.item.create({
      data: {
        userId,
        name,
        description,
        quantity: quantity || 0,
        unitCost: Math.round(unitCost * 100), // Convert to cents
        minStock: minStock || 0,
        maxStock: maxStock || null,
        isActive: true
      }
    })

    const itemWithValue = {
      ...item,
      totalValue: item.quantity * item.unitCost,
      isLowStock: item.quantity <= item.minStock
    }

    return res.status(201).json({
      success: true,
      message: 'Item created successfully',
      data: itemWithValue
    })
  } catch (error) {
    console.error('Error creating item:', error)
    return res.status(500).json({ success: false, message: 'Internal server error' })
  }
}

// Update an inventory item
export const updateItem = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id
    const { id } = req.params
    const { name, description, quantity, unitCost, minStock, maxStock, isActive } = req.body

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' })
    }

    // Check if item exists and belongs to user
    const existingItem = await prisma.item.findFirst({
      where: { id, userId }
    })

    if (!existingItem) {
      return res.status(404).json({ success: false, message: 'Item not found' })
    }

    const updateData: any = {}
    if (name !== undefined) updateData.name = name
    if (description !== undefined) updateData.description = description
    if (quantity !== undefined) updateData.quantity = quantity
    if (unitCost !== undefined) updateData.unitCost = Math.round(unitCost * 100)
    if (minStock !== undefined) updateData.minStock = minStock
    if (maxStock !== undefined) updateData.maxStock = maxStock
    if (isActive !== undefined) updateData.isActive = isActive

    const item = await prisma.item.update({
      where: { id },
      data: updateData
    })

    const itemWithValue = {
      ...item,
      totalValue: item.quantity * item.unitCost,
      isLowStock: item.quantity <= item.minStock
    }

    return res.json({
      success: true,
      message: 'Item updated successfully',
      data: itemWithValue
    })
  } catch (error) {
    console.error('Error updating item:', error)
    return res.status(500).json({ success: false, message: 'Internal server error' })
  }
}

// Delete an inventory item
export const deleteItem = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id
    const { id } = req.params

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' })
    }

    // Check if item exists and belongs to user
    const item = await prisma.item.findFirst({
      where: { id, userId }
    })

    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found' })
    }

    await prisma.item.delete({
      where: { id }
    })

    return res.json({
      success: true,
      message: 'Item deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting item:', error)
    return res.status(500).json({ success: false, message: 'Internal server error' })
  }
}

// Get low stock alerts
export const getLowStockAlerts = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' })
    }

    const lowStockItems = await prisma.item.findMany({
      where: {
        userId,
        isActive: true,
        quantity: {
          lte: prisma.item.fields.minStock
        }
      },
      orderBy: {
        quantity: 'asc'
      }
    })

    const alerts = lowStockItems.map(item => ({
      ...item,
      totalValue: item.quantity * item.unitCost,
      isLowStock: true,
      reorderSuggestion: Math.max(item.minStock * 2, 10) // Suggest reordering 2x min stock or 10 units
    }))

    return res.json({
      success: true,
      message: 'Low stock alerts retrieved successfully',
      data: alerts
    })
  } catch (error) {
    console.error('Error fetching low stock alerts:', error)
    return res.status(500).json({ success: false, message: 'Internal server error' })
  }
}

// Bulk update inventory (for purchases)
export const bulkUpdateInventory = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' })
    }

    const { items, accountId, categoryId } = req.body // items: [{ itemId, quantity, unitCost }]

    // Update inventory quantities and costs
    const updatePromises = items.map((item: any) =>
      prisma.item.update({
        where: { id: item.itemId },
        data: {
          quantity: {
            increment: item.quantity
          },
          unitCost: Math.round(item.unitCost * 100) // Update to new cost
        }
      })
    )

    await Promise.all(updatePromises)

    // Create expense transaction for inventory purchase
    if (accountId && categoryId) {
      const totalCost = items.reduce((sum: number, item: any) => 
        sum + (item.quantity * item.unitCost), 0
      )

      await prisma.transaction.create({
        data: {
          userId,
          accountId,
          categoryId,
          description: 'Inventory Purchase',
          amount: -Math.round(totalCost * 100), // Negative for expense
          date: new Date(),
          type: 'EXPENSE'
        }
      })
    }

    return res.json({
      success: true,
      message: 'Inventory updated successfully'
    })
  } catch (error) {
    console.error('Error updating inventory:', error)
    return res.status(500).json({ success: false, message: 'Internal server error' })
  }
}
