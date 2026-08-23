// HealthSure Frontend — Application Constants
// src/lib/constants.ts

export const APP_NAME = 'HealthSure';
export const APP_TAGLINE = 'Rural Care Continuity Platform';
export const APP_VERSION = '1.0.0';

/** API base URL — from environment variable */
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api';

/** Local storage keys */
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'healthsure_auth_token',
  AUTH_USER: 'healthsure_auth_user',
  LANGUAGE: 'healthsure_language',
  THEME: 'healthsure_theme',
  REGISTERED_USERS: 'healthsure_registered_users',
} as const;

/** Mock OTP for prototype — remove in production */
export const MOCK_OTP = '123456';

/** OTP resend cooldown in seconds */
export const OTP_RESEND_COOLDOWN = 30;

/** OTP length */
export const OTP_LENGTH = 6;

/** Minimum password length */
export const MIN_PASSWORD_LENGTH = 8;

/** Supported languages */
export const SUPPORTED_LANGUAGES = ['en', 'hi', 'mr'] as const;

/** Post-login routes by role */
export const ROLE_ROUTES = {
  patient: '/patient',
  doctor: '/doctor',
  hospital_staff: '/hospital',
  government_admin: '/admin',
} as const;
