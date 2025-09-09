import { Response } from 'express'
import { PrismaClient } from '@prisma/client'
import { AuthenticatedRequest } from '../types'

const prisma = new PrismaClient()

// Get all workshops
export const getWorkshops = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' })
    }

    const { client, organization, location, orderId, sortBy = 'date', sortOrder = 'desc' } = req.query

    const where: any = { userId }
    
    if (client) {
      where.client = { contains: client as string, mode: 'insensitive' }
    }
    if (organization) {
      where.organization = { contains: organization as string, mode: 'insensitive' }
    }
    if (location) {
      where.location = { contains: location as string, mode: 'insensitive' }
    }
    if (orderId) {
      where.orderId = orderId
    }

    const workshops = await prisma.workshop.findMany({
      where,
      include: {
        order: true,
        tasks: true,
        workshopCosts: true
      },
      orderBy: {
        [sortBy as string]: sortOrder as 'asc' | 'desc'
      }
    })

    return res.json({
      success: true,
      message: 'Workshops retrieved successfully',
      data: workshops
    })
  } catch (error) {
    console.error('Error fetching workshops:', error)
    return res.status(500).json({ success: false, message: 'Internal server error' })
  }
}

// Get a single workshop
export const getWorkshop = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id
    const { id } = req.params

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' })
    }

    const workshop = await prisma.workshop.findFirst({
      where: { id, userId },
      include: {
        order: true,
        tasks: {
          include: {
            taskCosts: {
              include: {
                item: true
              }
            }
          }
        },
        workshopCosts: true
      }
    })

    if (!workshop) {
      return res.status(404).json({ success: false, message: 'Workshop not found' })
    }

    return res.json({
      success: true,
      message: 'Workshop retrieved successfully',
      data: workshop
    })
  } catch (error) {
    console.error('Error fetching workshop:', error)
    return res.status(500).json({ success: false, message: 'Internal server error' })
  }
}

// Create a new workshop
export const createWorkshop = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' })
    }

    const { title, client, organization, date, location, notes, orderId, costs } = req.body

    const workshop = await prisma.workshop.create({
      data: {
        userId,
        title,
        client: client || null,
        organization: organization || null,
        date: new Date(date),
        location: location || null,
        notes: notes || null,
        orderId: orderId || null,
        workshopCosts: {
          create: costs?.map((cost: any) => ({
            description: cost.description,
            amount: Math.round(cost.amount * 100)
          })) || []
        }
      },
      include: {
        order: true,
        tasks: true,
        workshopCosts: true
      }
    })

    return res.status(201).json({
      success: true,
      message: 'Workshop created successfully',
      data: workshop
    })
  } catch (error) {
    console.error('Error creating workshop:', error)
    return res.status(500).json({ success: false, message: 'Internal server error' })
  }
}

// Update a workshop
export const updateWorkshop = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id
    const { id } = req.params
    const { title, client, organization, date, location, notes, orderId } = req.body

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' })
    }

    // Check if workshop exists and belongs to user
    const existingWorkshop = await prisma.workshop.findFirst({
      where: { id, userId }
    })

    if (!existingWorkshop) {
      return res.status(404).json({ success: false, message: 'Workshop not found' })
    }

    const updateData: any = {}
    if (title !== undefined) updateData.title = title
    if (client !== undefined) updateData.client = client
    if (organization !== undefined) updateData.organization = organization
    if (date !== undefined) updateData.date = new Date(date)
    if (location !== undefined) updateData.location = location
    if (notes !== undefined) updateData.notes = notes
    if (orderId !== undefined) updateData.orderId = orderId

    const workshop = await prisma.workshop.update({
      where: { id },
      data: updateData,
      include: {
        order: true,
        tasks: true,
        workshopCosts: true
      }
    })

    return res.json({
      success: true,
      message: 'Workshop updated successfully',
      data: workshop
    })
  } catch (error) {
    console.error('Error updating workshop:', error)
    return res.status(500).json({ success: false, message: 'Internal server error' })
  }
}

// Delete a workshop
export const deleteWorkshop = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id
    const { id } = req.params

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' })
    }

    // Check if workshop exists and belongs to user
    const workshop = await prisma.workshop.findFirst({
      where: { id, userId }
    })

    if (!workshop) {
      return res.status(404).json({ success: false, message: 'Workshop not found' })
    }

    await prisma.workshop.delete({
      where: { id }
    })

    return res.json({
      success: true,
      message: 'Workshop deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting workshop:', error)
    return res.status(500).json({ success: false, message: 'Internal server error' })
  }
}

// Add cost to a workshop
export const addWorkshopCost = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id
    const { id } = req.params
    const { description, amount } = req.body

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' })
    }

    // Check if workshop exists and belongs to user
    const workshop = await prisma.workshop.findFirst({
      where: { id, userId }
    })

    if (!workshop) {
      return res.status(404).json({ success: false, message: 'Workshop not found' })
    }

    const workshopCost = await prisma.workshopCost.create({
      data: {
        workshopId: id,
        description,
        amount: Math.round(amount * 100)
      }
    })

    return res.status(201).json({
      success: true,
      message: 'Workshop cost added successfully',
      data: workshopCost
    })
  } catch (error) {
    console.error('Error adding workshop cost:', error)
    return res.status(500).json({ success: false, message: 'Internal server error' })
  }
}

// Remove cost from a workshop
export const removeWorkshopCost = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id
    const { id, costId } = req.params

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' })
    }

    // Check if workshop exists and belongs to user
    const workshop = await prisma.workshop.findFirst({
      where: { id, userId }
    })

    if (!workshop) {
      return res.status(404).json({ success: false, message: 'Workshop not found' })
    }

    await prisma.workshopCost.delete({
      where: { id: costId }
    })

    return res.json({
      success: true,
      message: 'Workshop cost removed successfully'
    })
  } catch (error) {
    console.error('Error removing workshop cost:', error)
    return res.status(500).json({ success: false, message: 'Internal server error' })
  }
}

// Export workshop summary
export const exportWorkshopSummary = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id
    const { id } = req.params

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' })
    }

    const workshop = await prisma.workshop.findFirst({
      where: { id, userId },
      include: {
        order: true,
        tasks: {
          include: {
            taskCosts: {
              include: {
                item: true
              }
            }
          }
        },
        workshopCosts: true
      }
    })

    if (!workshop) {
      return res.status(404).json({ success: false, message: 'Workshop not found' })
    }

    // Calculate totals
    const totalTaskCosts = workshop.tasks.reduce((sum, task) => 
      sum + task.taskCosts.reduce((taskSum, cost) => taskSum + cost.amount, 0), 0
    )
    const totalWorkshopCosts = workshop.workshopCosts.reduce((sum, cost) => sum + cost.amount, 0)
    const totalCosts = totalTaskCosts + totalWorkshopCosts

    const summary = {
      workshop: {
        id: workshop.id,
        title: workshop.title,
        client: workshop.client,
        organization: workshop.organization,
        date: workshop.date,
        location: workshop.location,
        notes: workshop.notes
      },
      order: workshop.order,
      tasks: workshop.tasks.map(task => ({
        id: task.id,
        title: task.title,
        status: task.status,
        dueDate: task.dueDate,
        assignedTo: task.assignedTo,
        costs: task.taskCosts.map(cost => ({
          description: cost.description,
          amount: cost.amount / 100,
          item: cost.item?.name
        }))
      })),
      costs: {
        taskCosts: totalTaskCosts / 100,
        workshopCosts: totalWorkshopCosts / 100,
        total: totalCosts / 100
      },
      summary: {
        totalTasks: workshop.tasks.length,
        completedTasks: workshop.tasks.filter(task => task.status === 'COMPLETED').length,
        totalCosts: totalCosts / 100
      }
    }

    return res.json({
      success: true,
      message: 'Workshop summary exported successfully',
      data: summary
    })
  } catch (error) {
    console.error('Error exporting workshop summary:', error)
    return res.status(500).json({ success: false, message: 'Internal server error' })
  }
}
