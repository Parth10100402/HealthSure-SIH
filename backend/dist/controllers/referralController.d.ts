import type { Request, Response, NextFunction } from 'express';
export declare const getReferrals: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const getReferralById: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const createReferral: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const patchReferral: (req: Request, res: Response, next: NextFunction) => Promise<void>;
