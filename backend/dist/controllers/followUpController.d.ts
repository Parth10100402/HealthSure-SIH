import type { Request, Response, NextFunction } from 'express';
export declare const getFollowUps: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const createFollowUp: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const patchFollowUp: (req: Request, res: Response, next: NextFunction) => Promise<void>;
