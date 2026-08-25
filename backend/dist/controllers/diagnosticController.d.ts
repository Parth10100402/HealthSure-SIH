import type { Request, Response, NextFunction } from 'express';
export declare const getDiagnosticServices: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const getDiagnosticReports: (req: Request, res: Response, next: NextFunction) => Promise<void>;
