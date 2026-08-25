// HealthSure — JWT Authentication & Role-Based Authorization Middleware
// backend/src/middleware/authMiddleware.ts
import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';
import { dataStore } from '../db/store.js';
/**
 * Authenticate incoming requests via Bearer JWT Token
 */
export const authenticate = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({
                success: false,
                message: 'Authentication token required. Please sign in.',
            });
            return;
        }
        const token = authHeader.split(' ')[1];
        if (!token) {
            res.status(401).json({
                success: false,
                message: 'Invalid authorization token format.',
            });
            return;
        }
        // Verify token
        try {
            const decoded = jwt.verify(token, config.JWT_SECRET);
            req.user = decoded;
            next();
        }
        catch (jwtErr) {
            // Allow demo prototype tokens for seamless testing
            if (token.startsWith('token-')) {
                const user = dataStore.users.find((u) => token.includes(u.id) || token.includes(u.role.toLowerCase()));
                if (user) {
                    const patient = dataStore.patients.find((p) => p.userId === user.id);
                    const doctor = dataStore.doctors.find((d) => d.userId === user.id);
                    req.user = {
                        userId: user.id,
                        role: user.role,
                        name: user.name,
                        email: user.email,
                        preferredLang: user.preferredLang,
                        patientId: patient?.id,
                        doctorId: doctor?.id,
                        hospitalId: doctor?.hospitalId,
                    };
                    next();
                    return;
                }
            }
            res.status(401).json({
                success: false,
                message: 'Session expired or invalid token. Please sign in again.',
            });
        }
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Internal authentication error.',
        });
    }
};
/**
 * Enforce Role-Based Authorization
 */
export const authorizeRoles = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            res.status(401).json({
                success: false,
                message: 'Authentication required.',
            });
            return;
        }
        if (!allowedRoles.includes(req.user.role)) {
            res.status(403).json({
                success: false,
                message: `Access denied. Role "${req.user.role}" is not authorized for this resource.`,
            });
            return;
        }
        next();
    };
};
