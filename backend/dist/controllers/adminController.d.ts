import type { Request, Response, NextFunction } from 'express';
export declare const getAdminOverview: (_req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const getAdminFacilities: (_req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const getAdminReferrals: (_req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const getAdminOutreach: (_req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const getAdminTeleconsultations: (_req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const getAdminFollowUps: (_req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const getAdminReports: (_req: Request, res: Response, next: NextFunction) => Promise<void>;
