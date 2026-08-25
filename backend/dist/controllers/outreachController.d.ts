import type { Request, Response, NextFunction } from 'express';
export declare const getOutreachSchedules: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const getOutreachById: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const bookOutreachSlot: (req: Request, res: Response, next: NextFunction) => Promise<void>;
