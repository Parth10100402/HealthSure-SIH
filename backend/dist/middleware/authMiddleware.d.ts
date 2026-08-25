import type { Request, Response, NextFunction } from 'express';
import type { AuthTokenPayload, Role } from '../types/index.js';
declare global {
    namespace Express {
        interface Request {
            user?: AuthTokenPayload;
        }
    }
}
/**
 * Authenticate incoming requests via Bearer JWT Token
 */
export declare const authenticate: (req: Request, res: Response, next: NextFunction) => Promise<void>;
/**
 * Enforce Role-Based Authorization
 */
export declare const authorizeRoles: (...allowedRoles: Role[]) => (req: Request, res: Response, next: NextFunction) => void;
