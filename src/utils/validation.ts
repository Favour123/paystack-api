import Joi, { ValidationErrorItem } from 'joi';
import { Request, Response, NextFunction } from 'express';

type ValidationTarget = 'body' | 'query' | 'params';

const validate = (schema: Joi.Schema, target: ValidationTarget = 'body'): ((req: Request, res: Response, next: NextFunction) => void) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const data = (req as any)[target];
    const { error, value } = schema.validate(data, {
      abortEarly: false,
      stripUnknown: true
    });
    if (error) {
      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: error.details.map((d: ValidationErrorItem) => ({
          message: d.message,
          path: d.path.join('.'),
          type: d.type
        }))
      });
      return;
    }
    (req as any)[target] = value;
    return next();
  };
};

// Schemas
const bookSchema = Joi.object({
  title: Joi.string().trim().min(2).max(100).required(),
  description: Joi.string().trim().min(10).max(500).required(),
  price: Joi.number().min(0).required(),
  ages: Joi.string().trim().pattern(/^\d+-\d+$/).required(),
  rating: Joi.number().integer().min(1).max(5).optional(),
  imageUrl: Joi.string().uri().optional(),
  pdfUrl: Joi.string().uri().optional(),
  isActive: Joi.boolean().optional()
});

const paymentInitializeSchema = Joi.object({
  email: Joi.string().email().required(),
  amount: Joi.number().min(1).required(),
  bookId: Joi.string().regex(/^[a-f\d]{24}$/i).required(),
  customerName: Joi.string().trim().min(2).max(100).required()
});

const paymentVerifySchema = Joi.object({
  reference: Joi.string().trim().required()
});

const downloadSchema = Joi.object({
  token: Joi.string().trim().min(32).max(64).required()
});

// Public middlewares
export const validateBook = validate(bookSchema);
export const validatePaymentInitialize = validate(paymentInitializeSchema);
export const validatePaymentVerify = validate(paymentVerifySchema);
export const validateDownload = validate(downloadSchema);

// Simple helpers kept for potential reuse
export const validateEmail = (email: string): boolean => Joi.string().email().validate(email).error == null;
export const validatePhone = (phone: string): boolean => /^[\+]?[1-9][\d]{0,15}$/.test(phone);
