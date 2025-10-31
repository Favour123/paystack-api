import { Request, Response, NextFunction } from 'express';
export declare const corsOptions: {
    origin: (origin: string | undefined, callback: Function) => any;
    credentials: boolean;
    optionsSuccessStatus: number;
};
export declare const generalLimiter: import("express-rate-limit").RateLimitRequestHandler;
export declare const paymentLimiter: import("express-rate-limit").RateLimitRequestHandler;
export declare const downloadLimiter: import("express-rate-limit").RateLimitRequestHandler;
export declare const securityHeaders: (req: import("http").IncomingMessage, res: import("http").ServerResponse, next: (err?: unknown) => void) => void;
export declare const requestLogger: (req: Request, res: Response, next: NextFunction) => void;
export declare const errorHandler: (err: Error, req: Request, res: Response, next: NextFunction) => void;
export declare const notFound: (req: Request, res: Response) => void;
//# sourceMappingURL=security.d.ts.map