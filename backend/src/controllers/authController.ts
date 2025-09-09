import { Request, Response } from 'express';
import { AuthenticatedRequest, ApiResponse } from '../types';
import { 
  hashPassword, 
  comparePassword, 
  generateToken, 
  generateRefreshToken,
  verifyRefreshToken,
  createUserResponse,
  validatePassword,
  validateEmail
} from '../utils/auth';
import prisma from '../utils/database';
import { asyncHandler, createError } from '../middleware/errorHandler';

// Register new user
export const register = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { name, email, password, timezone, currency } = req.body;

  // Validate email format
  if (!validateEmail(email)) {
    throw createError('Invalid email format', 400);
  }

  // Validate password strength
  const passwordValidation = validatePassword(password);
  if (!passwordValidation.isValid) {
    throw createError(`Password validation failed: ${passwordValidation.errors.join(', ')}`, 400);
  }

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email }
  });

  if (existingUser) {
    throw createError('User with this email already exists', 409);
  }

  // Hash password
  const hashedPassword = await hashPassword(password);

  // Create user
  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      timezone: timezone || 'UTC',
      currency: currency || 'USD',
    }
  });

  // Generate tokens
  const accessToken = generateToken(user.id);
  const refreshToken = generateRefreshToken(user.id);

  const response: ApiResponse = {
    success: true,
    message: 'User registered successfully',
    data: {
      user: createUserResponse(user),
      accessToken,
      refreshToken
    }
  };

  res.status(201).json(response);
});

// Login user
export const login = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  // Find user
  const user = await prisma.user.findUnique({
    where: { email }
  });

  if (!user) {
    throw createError('Invalid email or password', 401);
  }

  // Compare password
  const isPasswordValid = await comparePassword(password, user.password);
  if (!isPasswordValid) {
    throw createError('Invalid email or password', 401);
  }

  // Generate tokens
  const accessToken = generateToken(user.id);
  const refreshToken = generateRefreshToken(user.id);

  const response: ApiResponse = {
    success: true,
    message: 'Login successful',
    data: {
      user: createUserResponse(user),
      accessToken,
      refreshToken
    }
  };

  res.json(response);
});

// Refresh token
export const refreshToken = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    throw createError('Refresh token is required', 400);
  }

  const decoded = verifyRefreshToken(refreshToken);
  if (!decoded) {
    throw createError('Invalid or expired refresh token', 401);
  }

  // Check if user still exists
  const user = await prisma.user.findUnique({
    where: { id: decoded.userId }
  });

  if (!user) {
    throw createError('User not found', 404);
  }

  // Generate new tokens
  const newAccessToken = generateToken(user.id);
  const newRefreshToken = generateRefreshToken(user.id);

  const response: ApiResponse = {
    success: true,
    message: 'Token refreshed successfully',
    data: {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken
    }
  };

  res.json(response);
});

// Get current user profile
export const getProfile = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  if (!req.user) {
    throw createError('User not authenticated', 401);
  }

  const response: ApiResponse = {
    success: true,
    message: 'Profile retrieved successfully',
    data: {
      user: req.user
    }
  };

  res.json(response);
});

// Update user profile
export const updateProfile = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  if (!req.user) {
    throw createError('User not authenticated', 401);
  }

  const { name, email, timezone, currency } = req.body;
  const updateData: any = {};

  if (name) updateData.name = name;
  if (email) {
    if (!validateEmail(email)) {
      throw createError('Invalid email format', 400);
    }
    updateData.email = email;
  }
  if (timezone) updateData.timezone = timezone;
  if (currency) updateData.currency = currency;

  const updatedUser = await prisma.user.update({
    where: { id: req.user.id },
    data: updateData,
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

  const response: ApiResponse = {
    success: true,
    message: 'Profile updated successfully',
    data: {
      user: updatedUser
    }
  };

  res.json(response);
});

// Change password
export const changePassword = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  if (!req.user) {
    throw createError('User not authenticated', 401);
  }

  const { currentPassword, newPassword } = req.body;

  // Validate new password strength
  const passwordValidation = validatePassword(newPassword);
  if (!passwordValidation.isValid) {
    throw createError(`Password validation failed: ${passwordValidation.errors.join(', ')}`, 400);
  }

  // Get user with password
  const user = await prisma.user.findUnique({
    where: { id: req.user.id }
  });

  if (!user) {
    throw createError('User not found', 404);
  }

  // Verify current password
  const isCurrentPasswordValid = await comparePassword(currentPassword, user.password);
  if (!isCurrentPasswordValid) {
    throw createError('Current password is incorrect', 400);
  }

  // Hash new password
  const hashedNewPassword = await hashPassword(newPassword);

  // Update password
  await prisma.user.update({
    where: { id: req.user.id },
    data: { password: hashedNewPassword }
  });

  const response: ApiResponse = {
    success: true,
    message: 'Password changed successfully'
  };

  res.json(response);
});

// Logout (client-side token removal)
export const logout = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const response: ApiResponse = {
    success: true,
    message: 'Logout successful'
  };

  res.json(response);
});
