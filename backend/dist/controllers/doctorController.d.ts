import type { Request, Response, NextFunction } from 'express';
export declare const getMyDoctorProfile: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const getDoctorAppointments: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const getDoctorReferrals: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const getDoctorFollowUps: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const completeConsultation: (req: Request, res: Response, next: NextFunction) => Promise<void>;
