import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { ApiResponse } from '../types';

export const validate = (schema: Joi.ObjectSchema, property: 'body' | 'query' | 'params' = 'body') => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const data = req[property];
    console.log('Validation data:', JSON.stringify(data, null, 2));
    const { error } = schema.validate(data, { abortEarly: false });

    if (error) {
      console.log('Validation errors:', error.details);
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
      }));

      const response: ApiResponse = {
        success: false,
        message: 'Validation failed',
        error: 'VALIDATION_ERROR',
        data: errors
      };

      res.status(400).json(response);
      return;
    }

    next();
  };
};

export const validateBody = (schema: Joi.ObjectSchema) => validate(schema, 'body');
export const validateQuery = (schema: Joi.ObjectSchema) => validate(schema, 'query');
export const validateParams = (schema: Joi.ObjectSchema) => validate(schema, 'params');
