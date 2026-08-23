// HealthSure Auth Service — Phase 1
// Structured for easy real API integration later.
// All mock functions follow the same shape as real API calls.

import type { UserRole } from '../components/auth/types';

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';
const TOKEN_KEY = 'healthsure_auth_token';
const USER_KEY = 'healthsure_auth_user';
const OTP_MOCK = '123456'; // Mock OTP for prototype

// ─── Types ──────────────────────────────────────────────────────────────────

export interface AuthUser {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  role: UserRole;
  isPremium: boolean;
  planType: string;
  createdAt?: string;
}

export interface AuthResponse {
  success: boolean;
  token?: string;
  user?: AuthUser;
  message?: string;
}

export interface OTPResponse {
  success: boolean;
  message?: string;
  demoOtp?: string;
  demoMode?: boolean;
}

// ─── Storage Helpers ─────────────────────────────────────────────────────────

export function getStoredToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setStoredToken(token: string, user?: AuthUser): void {
  try {
    localStorage.setItem(TOKEN_KEY, token);
    if (user) {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    }
  } catch {
    // Ignore storage errors
  }
}

export function clearStoredToken(): void {
  try {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  } catch {
    // Ignore
  }
}

// ─── Mock Credentials ────────────────────────────────────────────────────────

const MOCK_USERS: Array<AuthUser & { password: string }> = [
  {
    id: 'user-patient-demo',
    fullName: 'Priya Desai',
    email: 'priya@example.com',
    phone: '+91 9876543210',
    role: 'patient',
    isPremium: false,
    planType: 'Free',
    password: 'demo1234',
  },
  {
    id: 'user-doctor-demo',
    fullName: 'Dr. Rajesh Kumar',
    email: 'dr.rajesh@healthsure.org',
    phone: '+91 9876543211',
    role: 'doctor',
    isPremium: false,
    planType: 'Professional',
    password: 'demo1234',
  },
  {
    id: 'user-hospital-demo',
    fullName: 'Anita Sharma',
    email: 'anita@hospital.gov.in',
    phone: '+91 9876543212',
    role: 'hospital_staff',
    isPremium: false,
    planType: 'Institutional',
    password: 'demo1234',
  },
  {
    id: 'ADM-MH-001',
    fullName: 'Maharashtra State Health Administrator',
    email: 'admin.health@maharashtra.gov.in',
    phone: '+91 9876543213',
    role: 'government_admin',
    isPremium: false,
    planType: 'Government',
    password: 'demo1234',
  },
  {
    id: 'ADM-MH-001',
    fullName: 'Maharashtra State Health Administrator',
    email: 'suresh.patil@gov.in',
    phone: '+91 9876543213',
    role: 'government_admin',
    isPremium: false,
    planType: 'Government',
    password: 'demo1234',
  },
];

// ─── Login ───────────────────────────────────────────────────────────────────

/**
 * Authenticate with email/mobile + password.
 * Replace `loginAPI` body with real fetch when backend is ready.
 */
export async function loginAPI(
  identifier: string,
  password: string,
  role: UserRole
): Promise<AuthResponse> {
  const cleanId = identifier.toLowerCase().trim();
  const cleanPass = password.trim();

  try {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier: cleanId, password: cleanPass, role }),
    });
    if (res.ok) {
      const json = await res.json();
      if (json.success && json.token) {
        setStoredToken(json.token, json.user);
        return json;
      }
    }
  } catch (err) {
    console.warn('[authService] Live backend unreachable, falling back to client authentication:', err);
  }

  await simulateDelay(400);

  // Check mock credentials
  const match = MOCK_USERS.find(
    (u) =>
      (u.email.toLowerCase() === cleanId ||
       u.id.toLowerCase() === cleanId ||
       u.phone?.replace(/\s+/g, '') === cleanId.replace(/\s+/g, '')) &&
      u.password === cleanPass &&
      (u.role === role || (!role && u.role === 'patient'))
  );

  if (match) {
    const { password: _, ...safeUser } = match;
    const token = `token-${safeUser.id}-${Date.now()}`;
    setStoredToken(token, safeUser);
    return { success: true, token, user: safeUser, message: 'Login successful.' };
  }

  // Check locally registered users
  try {
    const registered = JSON.parse(
      localStorage.getItem('healthsure_registered_users') || '[]'
    ) as Array<AuthUser & { password: string }>;
    const found = registered.find(
      (u) =>
        (u.email?.toLowerCase() === cleanId || u.phone?.replace(/\s+/g, '') === cleanId.replace(/\s+/g, '')) &&
        u.password === cleanPass &&
        u.role === role
    );
    if (found) {
      const { password: _, ...safeUser } = found;
      const token = `token-${safeUser.id}-${Date.now()}`;
      setStoredToken(token, safeUser);
      return { success: true, token, user: safeUser, message: 'Login successful.' };
    }
  } catch {
    // Ignore
  }

  return { success: false, message: 'Incorrect credentials. Please check your details and try again.' };
}

// ─── OTP ─────────────────────────────────────────────────────────────────────

/**
 * Send OTP to mobile number via backend SMS provider.
 */
export async function sendOTPAPI(mobile: string, purpose: 'login' | 'registration' = 'login'): Promise<OTPResponse> {
  const cleanNumber = mobile.replace(/\D/g, '').slice(-10);
  if (!cleanNumber || cleanNumber.length < 10) {
    return { success: false, message: 'Please enter a valid 10-digit mobile number.' };
  }

  try {
    const res = await fetch(`${API_BASE_URL}/auth/send-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mobile: cleanNumber, purpose }),
    });

    const json = await res.json();
    if (res.ok && json.success) {
      return {
        success: true,
        message: json.message || `OTP sent successfully to +91 ${cleanNumber}.`,
        demoOtp: json.demoOtp,
        demoMode: json.demoMode,
      };
    }

    return {
      success: false,
      message: json.message || 'Unable to send OTP right now. Please try again.',
    };
  } catch (err: any) {
    console.warn('[authService sendOTPAPI] Connection error:', err.message);
    return {
      success: false,
      message: 'Unable to send OTP right now. Please try again.',
    };
  }
}

/**
 * Register a new patient verified via SMS OTP.
 */
export async function registerWithOtpAPI(data: {
  fullName: string;
  phone: string;
  otp: string;
  village?: string;
  district?: string;
  preferredLanguage?: string;
}): Promise<AuthResponse> {
  const cleanNumber = data.phone.replace(/\D/g, '').slice(-10);
  try {
    const res = await fetch(`${API_BASE_URL}/auth/register-with-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: data.fullName.trim(),
        phone: cleanNumber,
        otp: data.otp.trim(),
        village: data.village,
        district: data.district,
        preferredLanguage: data.preferredLanguage || 'en',
      }),
    });

    const json = await res.json();
    if (res.ok && json.success && json.token && json.user) {
      const authUser: AuthUser = {
        id: json.user.id,
        fullName: json.user.fullName || data.fullName,
        email: json.user.email || '',
        phone: json.user.phone || `+91 ${cleanNumber}`,
        role: 'patient',
        isPremium: false,
        planType: 'Free',
      };
      setStoredToken(json.token, authUser);
      return {
        success: true,
        token: json.token,
        user: authUser,
        message: json.message || 'Account created and verified successfully.',
      };
    }

    return {
      success: false,
      message: json.message || 'OTP verification failed. Account was not created.',
    };
  } catch (err: any) {
    return {
      success: false,
      message: 'Unable to reach registration server. Please try again.',
    };
  }
}

/**
 * Verify OTP entered by the user.
 */
export async function verifyOTPAPI(
  mobile: string,
  otp: string,
  role: UserRole
): Promise<AuthResponse> {
  const cleanNumber = mobile.replace(/\D/g, '').slice(-10);

  try {
    const res = await fetch(`${API_BASE_URL}/auth/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        mobile: cleanNumber,
        otp: otp.trim(),
        role,
      }),
    });

    const json = await res.json();
    if (res.ok && json.success && json.token && json.user) {
      const authUser: AuthUser = {
        id: json.user.id,
        fullName: json.user.fullName || 'HealthSure Patient',
        email: json.user.email || '',
        phone: json.user.phone || mobile,
        role: json.user.role === 'admin' ? 'government_admin' : (json.user.role as UserRole),
        isPremium: false,
        planType: 'Free',
      };

      setStoredToken(json.token, authUser);
      return {
        success: true,
        token: json.token,
        user: authUser,
        message: json.message || 'Signed in successfully.',
      };
    }

    return {
      success: false,
      message: json.message || 'Invalid or expired OTP code.',
    };
  } catch (err: any) {
    console.warn('[authService verifyOTPAPI] Connection error:', err.message);
    return {
      success: false,
      message: 'Unable to reach authentication server. Please check your connection.',
    };
  }
}

// ─── Register ────────────────────────────────────────────────────────────────

export interface RegisterData {
  role: UserRole;
  fullName: string;
  phone: string;
  email?: string;
  password?: string;
  // Patient-specific
  dateOfBirth?: string;
  gender?: string;
  location?: string;
  preferredLanguage?: string;
  // Doctor-specific
  medicalRegNumber?: string;
  speciality?: string;
  facility?: string;
  // Hospital Staff
  designation?: string;
  // Government Admin
  department?: string;
  district?: string;
}

export async function registerAPI(data: RegisterData): Promise<AuthResponse> {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: data.fullName.trim(),
        email: data.email?.toLowerCase().trim() || undefined,
        phone: data.phone || undefined,
        password: data.password || 'demo1234',
        role: data.role === 'government_admin' ? 'ADMIN' : data.role.toUpperCase(),
        preferredLang: data.preferredLanguage || 'en',
      }),
    });
    if (res.ok) {
      const json = await res.json();
      if (json.success && json.token) {
        const authUser: AuthUser = {
          id: json.user.id,
          fullName: json.user.fullName || data.fullName,
          email: json.user.email || data.email || '',
          phone: data.phone,
          role: data.role,
          isPremium: false,
          planType: 'Standard',
        };
        setStoredToken(json.token, authUser);
        return { success: true, token: json.token, user: authUser, message: 'Account created successfully.' };
      }
    }
  } catch (err) {
    console.warn('[authService] Backend registration unreachable, using local storage:', err);
  }

  await simulateDelay(600);

  const newUser: AuthUser = {
    id: `usr-${Date.now()}`,
    fullName: data.fullName.trim(),
    email: data.email?.toLowerCase().trim() ?? '',
    phone: data.phone,
    role: data.role,
    isPremium: false,
    planType: 'Free',
    createdAt: new Date().toISOString(),
  };

  try {
    const existing = JSON.parse(
      localStorage.getItem('healthsure_registered_users') || '[]'
    );
    localStorage.setItem(
      'healthsure_registered_users',
      JSON.stringify([...existing, { ...newUser, password: data.password ?? '' }])
    );
  } catch {
    // Ignore
  }

  const token = `token-${newUser.id}-${Date.now()}`;
  setStoredToken(token, newUser);

  return { success: true, token, user: newUser, message: 'Account created successfully.' };
}

// ─── Password Reset ───────────────────────────────────────────────────────────

export async function sendPasswordResetOTPAPI(identifier: string): Promise<OTPResponse> {
  await simulateDelay(800);
  if (!identifier.trim()) {
    return { success: false, message: 'Please enter your registered mobile number or email.' };
  }
  console.info(`[Mock Reset OTP] Reset OTP: ${OTP_MOCK}`);
  return { success: true, message: 'Password reset OTP sent. (Mock OTP: 123456)' };
}

export async function resetPasswordAPI(
  _identifier: string,
  otp: string,
  newPassword: string
): Promise<AuthResponse> {
  await simulateDelay(800);
  if (otp.trim() !== OTP_MOCK) {
    return { success: false, message: 'Invalid OTP. Please check and try again.' };
  }
  if (newPassword.length < 8) {
    return { success: false, message: 'Password must be at least 8 characters.' };
  }
  return { success: true, message: 'Password reset successfully. You can now log in.' };
}

export async function fetchCurrentUserAPI(_token: string): Promise<AuthResponse> {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${_token}`,
      },
    });
    if (res.ok) {
      const json = await res.json();
      if (json.success && json.user) {
        const authUser: AuthUser = {
          id: json.user.id,
          fullName: json.user.fullName || json.user.name,
          email: json.user.email || '',
          phone: json.user.phone,
          role: json.user.role === 'admin' || json.user.role === 'ADMIN' ? 'government_admin' : (json.user.role.toLowerCase() as UserRole),
          isPremium: false,
          planType: 'Standard',
        };
        setStoredToken(_token, authUser);
        return { success: true, user: authUser };
      }
    }
  } catch (err) {
    console.warn('[authService] Could not reach /auth/me, using stored session:', err);
  }

  await simulateDelay(100);

  try {
    const storedUser = localStorage.getItem(USER_KEY);
    if (storedUser) {
      return { success: true, user: JSON.parse(storedUser) };
    }
  } catch {
    // Ignore
  }

  return { success: false, message: 'Session expired.' };
}

// ─── Utility ─────────────────────────────────────────────────────────────────

function simulateDelay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Keep for backward compat (old App.tsx imports)
export async function upgradePremiumAPI(_planType: string, _token: string): Promise<AuthResponse> {
  return { success: false, message: 'Not implemented in Phase 1.' };
}
