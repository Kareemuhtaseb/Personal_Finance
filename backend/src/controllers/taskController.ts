import { Response } from 'express'
import { PrismaClient } from '@prisma/client'
import { AuthenticatedRequest } from '../types'

const prisma = new PrismaClient()

// Get all tasks
export const getTasks = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' })
    }

    const { status, orderId, workshopId, assignedTo, sortBy = 'createdAt', sortOrder = 'desc' } = req.query

    const where: any = { userId }
    
    if (status) {
      where.status = status
    }
    if (orderId) {
      where.orderId = orderId
    }
    if (workshopId) {
      where.workshopId = workshopId
    }
    if (assignedTo) {
      where.assignedTo = assignedTo
    }

    const tasks = await prisma.task.findMany({
      where,
      include: {
        order: true,
        workshop: true,
        taskCosts: {
          include: {
            item: true
          }
        }
      },
      orderBy: {
        [sortBy as string]: sortOrder as 'asc' | 'desc'
      }
    })

    return res.json({
      success: true,
      message: 'Tasks retrieved successfully',
      data: tasks
    })
  } catch (error) {
    console.error('Error fetching tasks:', error)
    return res.status(500).json({ success: false, message: 'Internal server error' })
  }
}

// Get tasks by status (for Kanban board)
export const getTasksByStatus = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' })
    }

    const tasks = await prisma.task.findMany({
      where: { userId },
      include: {
        order: true,
        workshop: true,
        taskCosts: {
          include: {
            item: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Group tasks by status
    const tasksByStatus = {
      PENDING: tasks.filter(task => task.status === 'PENDING'),
      IN_PROGRESS: tasks.filter(task => task.status === 'IN_PROGRESS'),
      COMPLETED: tasks.filter(task => task.status === 'COMPLETED')
    }

    return res.json({
      success: true,
      message: 'Tasks retrieved successfully',
      data: tasksByStatus
    })
  } catch (error) {
    console.error('Error fetching tasks by status:', error)
    return res.status(500).json({ success: false, message: 'Internal server error' })
  }
}

// Get a single task
export const getTask = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id
    const { id } = req.params

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' })
    }

    const task = await prisma.task.findFirst({
      where: { id, userId },
      include: {
        order: true,
        workshop: true,
        taskCosts: {
          include: {
            item: true
          }
        }
      }
    })

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' })
    }

    return res.json({
      success: true,
      message: 'Task retrieved successfully',
      data: task
    })
  } catch (error) {
    console.error('Error fetching task:', error)
    return res.status(500).json({ success: false, message: 'Internal server error' })
  }
}

// Create a new task
export const createTask = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' })
    }

    const { title, description, dueDate, assignedTo, orderId, workshopId, costs } = req.body

    const task = await prisma.task.create({
      data: {
        userId,
        title,
        description,
        dueDate: dueDate ? new Date(dueDate) : null,
        assignedTo,
        orderId: orderId || null,
        workshopId: workshopId || null,
        status: 'PENDING',
        taskCosts: {
          create: costs?.map((cost: any) => ({
            description: cost.description,
            amount: Math.round(cost.amount * 100),
            itemId: cost.itemId || null
          })) || []
        }
      },
      include: {
        order: true,
        workshop: true,
        taskCosts: {
          include: {
            item: true
          }
        }
      }
    })

    return res.status(201).json({
      success: true,
      message: 'Task created successfully',
      data: task
    })
  } catch (error) {
    console.error('Error creating task:', error)
    return res.status(500).json({ success: false, message: 'Internal server error' })
  }
}

// Update a task
export const updateTask = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id
    const { id } = req.params
    const { title, description, status, dueDate, assignedTo, orderId, workshopId } = req.body

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' })
    }

    // Check if task exists and belongs to user
    const existingTask = await prisma.task.findFirst({
      where: { id, userId }
    })

    if (!existingTask) {
      return res.status(404).json({ success: false, message: 'Task not found' })
    }

    const updateData: any = {}
    if (title !== undefined) updateData.title = title
    if (description !== undefined) updateData.description = description
    if (status !== undefined) updateData.status = status
    if (dueDate !== undefined) updateData.dueDate = dueDate ? new Date(dueDate) : null
    if (assignedTo !== undefined) updateData.assignedTo = assignedTo
    if (orderId !== undefined) updateData.orderId = orderId
    if (workshopId !== undefined) updateData.workshopId = workshopId

    const task = await prisma.task.update({
      where: { id },
      data: updateData,
      include: {
        order: true,
        workshop: true,
        taskCosts: {
          include: {
            item: true
          }
        }
      }
    })

    return res.json({
      success: true,
      message: 'Task updated successfully',
      data: task
    })
  } catch (error) {
    console.error('Error updating task:', error)
    return res.status(500).json({ success: false, message: 'Internal server error' })
  }
}

// Update task status (for drag and drop)
export const updateTaskStatus = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id
    const { id } = req.params
    const { status } = req.body

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' })
    }

    // Check if task exists and belongs to user
    const existingTask = await prisma.task.findFirst({
      where: { id, userId }
    })

    if (!existingTask) {
      return res.status(404).json({ success: false, message: 'Task not found' })
    }

    const task = await prisma.task.update({
      where: { id },
      data: { status },
      include: {
        order: true,
        workshop: true,
        taskCosts: {
          include: {
            item: true
          }
        }
      }
    })

    return res.json({
      success: true,
      message: 'Task status updated successfully',
      data: task
    })
  } catch (error) {
    console.error('Error updating task status:', error)
    return res.status(500).json({ success: false, message: 'Internal server error' })
  }
}

// Delete a task
export const deleteTask = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id
    const { id } = req.params

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' })
    }

    // Check if task exists and belongs to user
    const task = await prisma.task.findFirst({
      where: { id, userId }
    })

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' })
    }

    await prisma.task.delete({
      where: { id }
    })

    return res.json({
      success: true,
      message: 'Task deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting task:', error)
    return res.status(500).json({ success: false, message: 'Internal server error' })
  }
}

// Add cost to a task
export const addTaskCost = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id
    const { id } = req.params
    const { description, amount, itemId } = req.body

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' })
    }

    // Check if task exists and belongs to user
    const task = await prisma.task.findFirst({
      where: { id, userId }
    })

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' })
    }

    const taskCost = await prisma.taskCost.create({
      data: {
        taskId: id,
        description,
        amount: Math.round(amount * 100),
        itemId: itemId || null
      },
      include: {
        item: true
      }
    })

    return res.status(201).json({
      success: true,
      message: 'Task cost added successfully',
      data: taskCost
    })
  } catch (error) {
    console.error('Error adding task cost:', error)
    return res.status(500).json({ success: false, message: 'Internal server error' })
  }
}

// Remove cost from a task
export const removeTaskCost = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id
    const { id, costId } = req.params

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' })
    }

    // Check if task exists and belongs to user
    const task = await prisma.task.findFirst({
      where: { id, userId }
    })

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' })
    }

    await prisma.taskCost.delete({
      where: { id: costId }
    })

    return res.json({
      success: true,
      message: 'Task cost removed successfully'
    })
  } catch (error) {
    console.error('Error removing task cost:', error)
    return res.status(500).json({ success: false, message: 'Internal server error' })
  }
}
