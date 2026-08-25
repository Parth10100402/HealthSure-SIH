import type { Request, Response, NextFunction } from 'express';
export declare const getAppointments: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const getAppointmentById: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const createAppointment: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const patchAppointment: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const deleteAppointment: (req: Request, res: Response, next: NextFunction) => Promise<void>;
