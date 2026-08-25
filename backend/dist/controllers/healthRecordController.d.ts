import type { Request, Response, NextFunction } from 'express';
export declare const getHealthRecords: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const getHealthRecordById: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const createHealthRecord: (req: Request, res: Response, next: NextFunction) => Promise<void>;
