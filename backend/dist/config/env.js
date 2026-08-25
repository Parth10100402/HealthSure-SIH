// HealthSure — Backend Environment Configuration
// backend/src/config/env.ts
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Load .env
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
export const config = {
    PORT: parseInt(process.env.PORT || '5000', 10),
    NODE_ENV: process.env.NODE_ENV || 'development',
    JWT_SECRET: process.env.JWT_SECRET || 'healthsure-jwt-secret-key-production-ready-2026',
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
    DATABASE_URL: process.env.DATABASE_URL || 'postgresql://healthsure:healthsure@localhost:5432/healthsure',
    FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5173',
    // SMS & OTP Configuration
    DEMO_MODE: process.env.DEMO_MODE !== undefined
        ? process.env.DEMO_MODE.toLowerCase() === 'true'
        : (process.env.SMS_PROVIDER || 'mock') === 'mock' || process.env.NODE_ENV !== 'production',
    SMS_PROVIDER: process.env.SMS_PROVIDER || 'mock',
    SMS_API_KEY: process.env.SMS_API_KEY || '',
    SMS_API_SECRET: process.env.SMS_API_SECRET || '',
    SMS_SENDER_ID: process.env.SMS_SENDER_ID || 'HLTHSR',
    FAST2SMS_ROUTE: process.env.FAST2SMS_ROUTE || 'q',
    OTP_EXPIRY_SECONDS: parseInt(process.env.OTP_EXPIRY_SECONDS || '300', 10),
    OTP_RESEND_COOLDOWN_SECONDS: parseInt(process.env.OTP_RESEND_COOLDOWN_SECONDS || '60', 10),
    OTP_MAX_ATTEMPTS: parseInt(process.env.OTP_MAX_ATTEMPTS || '5', 10),
};
