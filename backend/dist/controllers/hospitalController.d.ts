import type { Request, Response, NextFunction } from 'express';
export declare const getMyHospitalProfile: (_req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const getHospitalReferrals: (_req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const patchHospitalReferral: (req: Request, res: Response, next: NextFunction) => Promise<void>;
