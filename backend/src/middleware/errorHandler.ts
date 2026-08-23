// HealthSure — Global Error Handler Middleware
// backend/src/middleware/errorHandler.ts

import type { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  console.error(`[Error] [${req.method} ${req.url}]`, err);

  // Handle Zod Validation Errors
  if (err instanceof ZodError) {
    res.status(400).json({
      success: false,
      message: err.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', '),
      errors: err.errors,
    });
    return;
  }

  // Handle explicitly thrown operational errors
  if (err.statusCode) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message || 'Operational error.',
    });
    return;
  }

  // Generic internal server error (no stack trace exposure to user)
  res.status(500).json({
    success: false,
    message: err.message || 'Internal server error. Please try again later.',
  });
};
