import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import cors from 'cors';
import { Request, Response, NextFunction } from 'express';

// CORS configuration
export const corsOptions = {
  origin: function (origin: string | undefined, callback: Function) {
    const allowedOrigins = [
      process.env.FRONTEND_URL || 'http://localhost:5173',
      'http://localhost:3000',
      'http://localhost:5173'
    ];
    
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
};

// Rate limiting for general API
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiting for payment endpoints
export const paymentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 payment requests per windowMs
  message: {
    success: false,
    message: 'Too many payment attempts from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiting for download endpoints
export const downloadLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5, // limit each IP to 5 download attempts per minute
  message: {
    success: false,
    message: 'Too many download attempts from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Security headers
export const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https://api.paystack.co"],
    },
  },
  crossOriginEmbedderPolicy: false
});

// Request logging middleware
export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.originalUrl} - ${res.statusCode} - ${duration}ms`);
  });
  
  next();
};

// Error handling middleware

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  console.error('Error:', err);
  
  // Mongoose validation error
  if (err.name === 'ValidationError') {
     res.status(400).json({
      success: false,
      message: 'Validation Error',
      error: err.message
    });
  }
  
  // Mongoose duplicate key error
  if (err.name === 'MongoError' && (err as any).code === 11000) {
     res.status(400).json({
      success: false,
      message: 'Duplicate entry',
      error: 'Resource already exists'
    });
  }
  
  // Default error
   res.status(500).json({
    success: false,
    message: 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
};


// 404 handler
export const notFound = (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
};
