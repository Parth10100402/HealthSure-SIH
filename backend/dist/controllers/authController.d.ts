import type { Request, Response, NextFunction } from 'express';
export declare const login: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const register: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const getMe: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const logout: (_req: Request, res: Response) => Promise<void>;
export declare const sendOtp: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const registerWithOtp: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const verifyOtp: (req: Request, res: Response, next: NextFunction) => Promise<void>;
