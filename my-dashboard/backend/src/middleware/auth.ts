import { Response, NextFunction } from 'express';
import { AuthenticatedRequest, ApiResponse } from '../types';
import { verifyToken, extractTokenFromHeader } from '../utils/auth';
import prisma from '../utils/database';

export const authenticateToken = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = extractTokenFromHeader(authHeader);

    if (!token) {
      const response: ApiResponse = {
        success: false,
        message: 'Access token is required',
        error: 'MISSING_TOKEN'
      };
      res.status(401).json(response);
      return;
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      const response: ApiResponse = {
        success: false,
        message: 'Invalid or expired token',
        error: 'INVALID_TOKEN'
      };
      res.status(401).json(response);
      return;
    }

    // Fetch user from database
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        name: true,
        timezone: true,
        currency: true,
        createdAt: true,
        updatedAt: true,
      }
    });

    if (!user) {
      const response: ApiResponse = {
        success: false,
        message: 'User not found',
        error: 'USER_NOT_FOUND'
      };
      res.status(401).json(response);
      return;
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    const response: ApiResponse = {
      success: false,
      message: 'Authentication failed',
      error: 'AUTH_ERROR'
    };
    res.status(500).json(response);
  }
};

export const optionalAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = extractTokenFromHeader(authHeader);

    if (token) {
      const decoded = verifyToken(token);
      if (decoded) {
        const user = await prisma.user.findUnique({
          where: { id: decoded.userId },
          select: {
            id: true,
            email: true,
            name: true,
            timezone: true,
            currency: true,
            createdAt: true,
            updatedAt: true,
          }
        });
        if (user) {
          req.user = user;
        }
      }
    }
    
    next();
  } catch (error) {
    console.error('Optional auth error:', error);
    next(); // Continue without authentication
  }
};
