import { Request, Response, NextFunction } from 'express';
export declare const validateBook: (req: Request, res: Response, next: NextFunction) => void;
export declare const validatePaymentInitialize: (req: Request, res: Response, next: NextFunction) => void;
export declare const validatePaymentVerify: (req: Request, res: Response, next: NextFunction) => void;
export declare const validateDownload: (req: Request, res: Response, next: NextFunction) => void;
export declare const validateEmail: (email: string) => boolean;
export declare const validatePhone: (phone: string) => boolean;
//# sourceMappingURL=validation.d.ts.map