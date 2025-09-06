import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

// Extend Request type to include user
interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
  };
}

const prisma = new PrismaClient();

// Project Management
export const createProject = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ 
        success: false, 
        message: 'User not authenticated' 
      });
      return;
    }

    const { name, client, hourlyRate, paymentType = 'HOURLY_RATE' } = req.body;

    // Convert hourly rate to cents
    const hourlyRateInCents = Math.round(hourlyRate * 100);

    const project = await prisma.freelanceProject.create({
      data: {
        userId,
        name,
        client,
        hourlyRate: hourlyRateInCents,
        paymentType,
        status: 'ACTIVE'
      }
    });

    res.status(201).json({
      success: true,
      data: {
        ...project,
        hourlyRate: project.hourlyRate / 100
      },
      message: 'Project created successfully'
    });
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create project'
    });
  }
};

export const getProjects = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ 
        success: false, 
        message: 'User not authenticated' 
      });
      return;
    }

    const projects = await prisma.freelanceProject.findMany({
      where: { userId },
      include: {
        workSessions: true,
        invoices: true
      },
      orderBy: { createdAt: 'desc' }
    });

    // Calculate additional project statistics
    const projectsWithStats = projects.map(project => {
      const totalSessions = project.workSessions.length;
      const completedSessions = project.workSessions.filter(session => session.endTime).length;
      const paidSessions = project.workSessions.filter(session => session.isPaid).length;
      
      return {
        ...project,
        hourlyRate: project.hourlyRate / 100,
        totalAmount: project.totalAmount / 100,
        totalSessions,
        completedSessions,
        paidSessions
      };
    });

    res.json({
      success: true,
      data: projectsWithStats
    });
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch projects'
    });
  }
};

export const updateProject = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
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
    const { name, client, hourlyRate, status } = req.body;

    // Check if project exists and belongs to user
    const existingProject = await prisma.freelanceProject.findFirst({
      where: {
        id,
        userId
      }
    });

    if (!existingProject) {
      res.status(404).json({
        success: false,
        message: 'Project not found'
      });
      return;
    }

    const updateData: any = {};
    if (name) updateData.name = name;
    if (client) updateData.client = client;
    if (hourlyRate) updateData.hourlyRate = Math.round(hourlyRate * 100);
    if (status) updateData.status = status;

    const project = await prisma.freelanceProject.update({
      where: { id },
      data: updateData
    });

    res.json({
      success: true,
      data: {
        ...project,
        hourlyRate: project.hourlyRate / 100,
        totalAmount: project.totalAmount / 100
      },
      message: 'Project updated successfully'
    });
  } catch (error) {
    console.error('Error updating project:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update project'
    });
  }
};

export const deleteProject = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
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

    // Check if project exists and belongs to user
    const existingProject = await prisma.freelanceProject.findFirst({
      where: {
        id,
        userId
      }
    });

    if (!existingProject) {
      res.status(404).json({
        success: false,
        message: 'Project not found'
      });
      return;
    }

    await prisma.freelanceProject.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Project deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting project:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete project'
    });
  }
};

// Work Session Management
export const startWorkSession = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ 
        success: false, 
        message: 'User not authenticated' 
      });
      return;
    }

    const { projectId, description } = req.body;

    // Check if project exists and belongs to user
    const project = await prisma.freelanceProject.findFirst({
      where: {
        id: projectId,
        userId
      }
    });

    if (!project) {
      res.status(404).json({
        success: false,
        message: 'Project not found'
      });
      return;
    }

    // Check if there's already an active session for this project
    const activeSession = await prisma.workSession.findFirst({
      where: {
        projectId,
        userId,
        endTime: null
      }
    });

    if (activeSession) {
      res.status(400).json({
        success: false,
        message: 'There is already an active work session for this project'
      });
      return;
    }

    const workSession = await prisma.workSession.create({
      data: {
        userId,
        projectId,
        startTime: new Date(),
        description
      },
      include: {
        project: true
      }
    });

    res.status(201).json({
      success: true,
      data: workSession,
      message: 'Work session started successfully'
    });
  } catch (error) {
    console.error('Error starting work session:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to start work session'
    });
  }
};

export const createManualWorkSession = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ 
        success: false, 
        message: 'User not authenticated' 
      });
      return;
    }

    const { projectId, description, workHours, date, isPaid = false } = req.body;

    // Check if project exists and belongs to user
    const project = await prisma.freelanceProject.findFirst({
      where: {
        id: projectId,
        userId
      }
    });

    if (!project) {
      res.status(404).json({
        success: false,
        message: 'Project not found'
      });
      return;
    }

    // Validate work hours
    if (!workHours || workHours <= 0) {
      res.status(400).json({
        success: false,
        message: 'Work hours must be greater than 0'
      });
      return;
    }

    // Calculate start and end times based on work hours
    const sessionDate = date ? new Date(date) : new Date();
    const startTime = new Date(sessionDate);
    const endTime = new Date(startTime.getTime() + (workHours * 60 * 60 * 1000)); // Add hours in milliseconds

    // Create the work session
    const workSession = await prisma.workSession.create({
      data: {
        userId,
        projectId,
        startTime,
        endTime,
        description,
        isPaid,
        breakDuration: 0
      },
      include: {
        project: true
      }
    });

    // Update project totals
    await prisma.freelanceProject.update({
      where: { id: projectId },
      data: {
        totalHours: { increment: workHours },
        ...(isPaid 
          ? { paidHours: { increment: workHours } }
          : { unpaidHours: { increment: workHours } }
        )
      }
    });

    // If marked as paid, create income transaction
    if (isPaid) {
      // Get or create Freelance Income category
      let freelanceIncomeCategory = await prisma.category.findFirst({
        where: {
          userId,
          name: 'Freelance',
          type: 'INCOME'
        }
      });

      if (!freelanceIncomeCategory) {
        freelanceIncomeCategory = await prisma.category.create({
          data: {
            userId,
            name: 'Freelance',
            color: '#10B981',
            type: 'INCOME'
          }
        });
      }

      // Get default account for income
      const defaultAccount = await prisma.account.findFirst({
        where: { userId, isActive: true }
      });

      if (defaultAccount) {
        // Calculate the income amount (work hours * hourly rate)
        const incomeAmount = workHours * (project.hourlyRate / 100);
        const incomeAmountInCents = Math.round(incomeAmount * 100);

        // Create income transaction
        await prisma.transaction.create({
          data: {
            userId,
            accountId: defaultAccount.id,
            categoryId: freelanceIncomeCategory.id,
            description: `Freelance work - ${project.name} (${workHours.toFixed(2)}h @ $${(project.hourlyRate / 100).toFixed(2)}/h)`,
            amount: incomeAmountInCents, // Positive for income
            date: sessionDate,
            type: 'INCOME'
          },
          include: {
            account: true,
            category: true
          }
        });
      } else {
        console.error('No active account found for user:', userId);
        throw new Error('No active account found. Please create an account first.');
      }
    }

    res.status(201).json({
      success: true,
      data: {
        ...workSession,
        workHours: workHours.toFixed(2)
      },
      message: 'Manual work session created successfully'
    });
  } catch (error) {
    console.error('Error creating manual work session:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create manual work session'
    });
  }
};

export const endWorkSession = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ 
        success: false, 
        message: 'User not authenticated' 
      });
      return;
    }

    const { sessionId } = req.params;
    const { breakDuration = 0 } = req.body;

    // Check if session exists and belongs to user
    const existingSession = await prisma.workSession.findFirst({
      where: {
        id: sessionId,
        userId
      },
      include: {
        project: true
      }
    });

    if (!existingSession) {
      res.status(404).json({
        success: false,
        message: 'Work session not found'
      });
      return;
    }

    if (existingSession.endTime) {
      res.status(400).json({
        success: false,
        message: 'Work session is already ended'
      });
      return;
    }

    const endTime = new Date();
    const startTime = existingSession.startTime;
    const totalMinutes = Math.floor((endTime.getTime() - startTime.getTime()) / (1000 * 60));
    const workMinutes = totalMinutes - breakDuration;
    const workHours = workMinutes / 60;

    // Update the work session
    const updatedSession = await prisma.workSession.update({
      where: { id: sessionId },
      data: {
        endTime,
        breakDuration
      }
    });

    // Update project totals
    await prisma.freelanceProject.update({
      where: { id: existingSession.projectId },
      data: {
        totalHours: {
          increment: workHours
        },
        unpaidHours: {
          increment: workHours
        }
      }
    });

    res.json({
      success: true,
      data: {
        ...updatedSession,
        workHours: workHours.toFixed(2)
      },
      message: 'Work session ended successfully'
    });
  } catch (error) {
    console.error('Error ending work session:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to end work session'
    });
  }
};

export const getWorkSessions = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ 
        success: false, 
        message: 'User not authenticated' 
      });
      return;
    }

    const { projectId } = req.query;

    const whereClause: any = { userId };
    if (projectId) {
      whereClause.projectId = projectId as string;
    }

    const workSessions = await prisma.workSession.findMany({
      where: whereClause,
      include: {
        project: true
      },
      orderBy: { startTime: 'desc' }
    });

    // Calculate work hours for each session
    const sessionsWithHours = workSessions.map(session => {
      let workHours = 0;
      if (session.endTime) {
        const totalMinutes = Math.floor((session.endTime.getTime() - session.startTime.getTime()) / (1000 * 60));
        const workMinutes = totalMinutes - session.breakDuration;
        workHours = workMinutes / 60;
      }

      return {
        ...session,
        workHours: workHours.toFixed(2)
      };
    });

    res.json({
      success: true,
      data: sessionsWithHours
    });
  } catch (error) {
    console.error('Error fetching work sessions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch work sessions'
    });
  }
};

export const updateWorkSession = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ 
        success: false, 
        message: 'User not authenticated' 
      });
      return;
    }

    const { sessionId } = req.params;
    const { isPaid, description, customAmount } = req.body;

    // Check if session exists and belongs to user
    const existingSession = await prisma.workSession.findFirst({
      where: {
        id: sessionId,
        userId
      },
      include: {
        project: true
      }
    });

    if (!existingSession) {
      res.status(404).json({
        success: false,
        message: 'Work session not found'
      });
      return;
    }

    if (!existingSession.endTime) {
      res.status(400).json({
        success: false,
        message: 'Cannot update work session that is still active'
      });
      return;
    }

    const updateData: any = {};
    if (typeof isPaid === 'boolean') updateData.isPaid = isPaid;
    if (description) updateData.description = description;
    if (customAmount !== undefined) updateData.customAmount = Math.round(customAmount * 100); // Convert to cents

    const updatedSession = await prisma.workSession.update({
      where: { id: sessionId },
      data: updateData
    });

    // If payment status changed, update project totals and create/delete expense transaction
    if (typeof isPaid === 'boolean' && existingSession.isPaid !== isPaid) {
      const totalMinutes = Math.floor((existingSession.endTime!.getTime() - existingSession.startTime.getTime()) / (1000 * 60));
      const workMinutes = totalMinutes - existingSession.breakDuration;
      const workHours = workMinutes / 60;

      if (isPaid) {
        // Moving from unpaid to paid - create expense transaction
        await prisma.freelanceProject.update({
          where: { id: existingSession.projectId },
          data: {
            paidHours: { increment: workHours },
            unpaidHours: { decrement: workHours }
          }
        });

        // Get or create Freelance Income category
        let freelanceIncomeCategory = await prisma.category.findFirst({
          where: {
            userId,
            name: 'Freelance',
            type: 'INCOME'
          }
        });

        if (!freelanceIncomeCategory) {
          freelanceIncomeCategory = await prisma.category.create({
            data: {
              userId,
              name: 'Freelance',
              color: '#10B981',
              type: 'INCOME'
            }
          });
        }

        // Get default account for income
        const defaultAccount = await prisma.account.findFirst({
          where: { userId, isActive: true }
        });

        if (defaultAccount) {
          // Calculate the income amount based on payment type
          let incomeAmount: number;
          let description: string;
          
          if (existingSession.project.paymentType === 'HOURLY_RATE') {
            incomeAmount = workHours * (existingSession.project.hourlyRate / 100);
            description = `Freelance work - ${existingSession.project.name} (${workHours.toFixed(2)}h @ $${(existingSession.project.hourlyRate / 100).toFixed(2)}/h)`;
          } else {
            // Use custom amount if provided, otherwise calculate from hourly rate as reference
            incomeAmount = customAmount ? (customAmount / 100) : (workHours * (existingSession.project.hourlyRate / 100));
            description = customAmount 
              ? `Freelance work - ${existingSession.project.name} (Custom amount: $${(customAmount / 100).toFixed(2)})`
              : `Freelance work - ${existingSession.project.name} (${workHours.toFixed(2)}h, reference rate: $${(existingSession.project.hourlyRate / 100).toFixed(2)}/h)`;
          }
          
          const incomeAmountInCents = Math.round(incomeAmount * 100);

          // Create income transaction
          await prisma.transaction.create({
            data: {
              userId,
              accountId: defaultAccount.id,
              categoryId: freelanceIncomeCategory.id,
              description,
              amount: incomeAmountInCents, // Positive for income
              date: existingSession.endTime || new Date(),
              type: 'INCOME'
            },
            include: {
              account: true,
              category: true
            }
          });
        } else {
          console.error('No active account found for user:', userId);
          throw new Error('No active account found. Please create an account first.');
        }
      } else {
        // Moving from paid to unpaid - delete the expense transaction if it exists
        await prisma.freelanceProject.update({
          where: { id: existingSession.projectId },
          data: {
            paidHours: { decrement: workHours },
            unpaidHours: { increment: workHours }
          }
        });

        // Find and delete the corresponding income transaction
        const incomeDescription = `Freelance work - ${existingSession.project.name} (${workHours.toFixed(2)}h @ $${(existingSession.project.hourlyRate / 100).toFixed(2)}/h)`;
        await prisma.transaction.deleteMany({
          where: {
            userId,
            description: incomeDescription,
            type: 'INCOME'
          }
        });
      }
    }

    res.json({
      success: true,
      data: updatedSession,
      message: 'Work session updated successfully'
    });
  } catch (error) {
    console.error('Error updating work session:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update work session'
    });
  }
};

export const deleteWorkSession = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ 
        success: false, 
        message: 'User not authenticated' 
      });
      return;
    }

    const { sessionId } = req.params;

    // Check if session exists and belongs to user
    const existingSession = await prisma.workSession.findFirst({
      where: {
        id: sessionId,
        userId
      }
    });

    if (!existingSession) {
      res.status(404).json({
        success: false,
        message: 'Work session not found'
      });
      return;
    }

    // If session is completed, update project totals
    if (existingSession.endTime) {
      const totalMinutes = Math.floor((existingSession.endTime.getTime() - existingSession.startTime.getTime()) / (1000 * 60));
      const workMinutes = totalMinutes - existingSession.breakDuration;
      const workHours = workMinutes / 60;

      await prisma.freelanceProject.update({
        where: { id: existingSession.projectId },
        data: {
          totalHours: { decrement: workHours },
          paidHours: existingSession.isPaid ? { decrement: workHours } : undefined,
          unpaidHours: !existingSession.isPaid ? { decrement: workHours } : undefined
        }
      });
    }

    await prisma.workSession.delete({
      where: { id: sessionId }
    });

    res.json({
      success: true,
      message: 'Work session deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting work session:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete work session'
    });
  }
};

// Payment Management
export const markPaymentReceived = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ 
        success: false, 
        message: 'User not authenticated' 
      });
      return;
    }

    const { projectId } = req.params;
    const { amount, date, accountId, categoryId } = req.body;

    // Check if project exists and belongs to user
    const project = await prisma.freelanceProject.findFirst({
      where: {
        id: projectId,
        userId
      }
    });

    if (!project) {
      res.status(404).json({
        success: false,
        message: 'Project not found'
      });
      return;
    }

    // Get or create Freelance category
    let freelanceCategory = await prisma.category.findFirst({
      where: {
        userId,
        name: 'Freelance',
        type: 'INCOME'
      }
    });

    if (!freelanceCategory) {
      freelanceCategory = await prisma.category.create({
        data: {
          userId,
          name: 'Freelance',
          color: '#10B981',
          type: 'INCOME'
        }
      });
    }

    // Create income transaction
    const amountInCents = Math.round(amount * 100);
    const transaction = await prisma.transaction.create({
      data: {
        userId,
        accountId: accountId || (await prisma.account.findFirst({ where: { userId, isActive: true } }))?.id,
        categoryId: categoryId || freelanceCategory.id,
        description: `Freelance payment - ${project.name}`,
        amount: amountInCents,
        date: date ? new Date(date) : new Date(),
        type: 'INCOME'
      },
      include: {
        account: true,
        category: true
      }
    });

    // Update project totals
    await prisma.freelanceProject.update({
      where: { id: projectId },
      data: {
        totalAmount: { increment: amountInCents }
      }
    });

    res.status(201).json({
      success: true,
      data: {
        transaction: {
          ...transaction,
          amount: transaction.amount / 100
        }
      },
      message: 'Payment recorded successfully'
    });
  } catch (error) {
    console.error('Error recording payment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to record payment'
    });
  }
};

// Dashboard Summary
export const getFreelanceSummary = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ 
        success: false, 
        message: 'User not authenticated' 
      });
      return;
    }

    const projects = await prisma.freelanceProject.findMany({
      where: { userId },
      include: {
        workSessions: true
      }
    });

    const activeProjects = projects.filter(p => p.status === 'ACTIVE').length;
    const totalHours = projects.reduce((sum, p) => sum + p.totalHours, 0);
    const paidHours = projects.reduce((sum, p) => sum + p.paidHours, 0);
    const unpaidHours = projects.reduce((sum, p) => sum + p.unpaidHours, 0);
    const totalEarnings = projects.reduce((sum, p) => sum + p.totalAmount, 0);

    res.json({
      success: true,
      data: {
        activeProjects,
        totalHours: totalHours.toFixed(2),
        paidHours: paidHours.toFixed(2),
        unpaidHours: unpaidHours.toFixed(2),
        totalEarnings: totalEarnings / 100
      }
    });
  } catch (error) {
    console.error('Error fetching freelance summary:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch freelance summary'
    });
  }
};

// Bulk Payment Management
export const bulkMarkSessionsPaid = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ 
        success: false, 
        message: 'User not authenticated' 
      });
      return;
    }

    const { sessionIds, amount, date, accountId, categoryId } = req.body;

    if (!sessionIds || !Array.isArray(sessionIds) || sessionIds.length === 0) {
      res.status(400).json({
        success: false,
        message: 'Session IDs are required'
      });
      return;
    }

    if (!amount || amount <= 0) {
      res.status(400).json({
        success: false,
        message: 'Amount must be greater than 0'
      });
      return;
    }

    // Get all sessions and verify they belong to the user
    const sessions = await prisma.workSession.findMany({
      where: {
        id: { in: sessionIds },
        userId,
        endTime: { not: null } // Only completed sessions
      },
      include: {
        project: true
      }
    });

    if (sessions.length !== sessionIds.length) {
      res.status(400).json({
        success: false,
        message: 'Some sessions not found or not completed'
      });
      return;
    }

    // Check if any sessions are already paid
    const alreadyPaidSessions = sessions.filter(s => s.isPaid);
    if (alreadyPaidSessions.length > 0) {
      res.status(400).json({
        success: false,
        message: 'Some sessions are already marked as paid'
      });
      return;
    }

    // Get or create Freelance Income category
    let freelanceIncomeCategory = await prisma.category.findFirst({
      where: {
        userId,
        name: 'Freelance',
        type: 'INCOME'
      }
    });

    if (!freelanceIncomeCategory) {
      freelanceIncomeCategory = await prisma.category.create({
        data: {
          userId,
          name: 'Freelance',
          color: '#10B981',
          type: 'INCOME'
        }
      });
    }

    // Get account for income
    let account;
    if (accountId) {
      account = await prisma.account.findFirst({
        where: { id: accountId, userId, isActive: true }
      });
    } else {
      account = await prisma.account.findFirst({
        where: { userId, isActive: true }
      });
    }

    if (!account) {
      res.status(400).json({
        success: false,
        message: 'No active account found'
      });
      return;
    }

    // Calculate total work hours for all sessions
    const totalWorkHours = sessions.reduce((sum, session) => {
      const totalMinutes = Math.floor((session.endTime!.getTime() - session.startTime.getTime()) / (1000 * 60));
      const workMinutes = totalMinutes - session.breakDuration;
      return sum + (workMinutes / 60);
    }, 0);

    // Update all sessions to paid
    await prisma.workSession.updateMany({
      where: {
        id: { in: sessionIds }
      },
      data: {
        isPaid: true
      }
    });

    // Update project totals
    const projectUpdates = new Map();
    sessions.forEach(session => {
      const totalMinutes = Math.floor((session.endTime!.getTime() - session.startTime.getTime()) / (1000 * 60));
      const workMinutes = totalMinutes - session.breakDuration;
      const workHours = workMinutes / 60;

      if (!projectUpdates.has(session.projectId)) {
        projectUpdates.set(session.projectId, { paidHours: 0, unpaidHours: 0 });
      }
      const updates = projectUpdates.get(session.projectId);
      updates.paidHours += workHours;
      updates.unpaidHours -= workHours;
    });

    // Apply project updates
    for (const [projectId, updates] of projectUpdates) {
      await prisma.freelanceProject.update({
        where: { id: projectId },
        data: {
          paidHours: { increment: updates.paidHours },
          unpaidHours: { decrement: updates.unpaidHours }
        }
      });
    }

    // Create single income transaction for the bulk payment
    const amountInCents = Math.round(amount * 100);
    const sessionDescriptions = sessions.map(s => s.project.name).join(', ');
    
    const transaction = await prisma.transaction.create({
      data: {
        userId,
        accountId: account.id,
        categoryId: freelanceIncomeCategory.id,
        description: `Freelance work - Bulk payment (${sessions.length} sessions: ${sessionDescriptions}) - Total: ${totalWorkHours.toFixed(2)}h`,
        amount: amountInCents,
        date: date ? new Date(date) : new Date(),
        type: 'INCOME'
      },
      include: {
        account: true,
        category: true
      }
    });

    res.json({
      success: true,
      data: {
        transaction: {
          ...transaction,
          amount: transaction.amount / 100
        }
      },
      message: `${sessions.length} work sessions marked as paid successfully`
    });
  } catch (error) {
    console.error('Error bulk marking sessions as paid:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark sessions as paid'
    });
  }
};
