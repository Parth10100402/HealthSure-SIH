import React, { createContext, useContext, useState, useEffect } from 'react';
import type { UserRole, Language, Theme } from '../components/auth/types';
import {
  type AuthUser,
  type AuthResponse,
  type RegisterData,
  type OTPResponse,
  getStoredToken,
  setStoredToken,
  clearStoredToken,
  loginAPI,
  sendOTPAPI,
  verifyOTPAPI,
  registerAPI,
  fetchCurrentUserAPI,
  sendPasswordResetOTPAPI,
  resetPasswordAPI,
} from '../services/authService';

// ─── Context Shape ───────────────────────────────────────────────────────────

interface AuthContextType {
  // User state
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Role selection
  selectedRole: UserRole | null;
  setSelectedRole: (role: UserRole | null) => void;

  // UI preferences
  language: Language;
  setLanguage: (lang: Language) => void;
  theme: Theme;
  toggleTheme: () => void;

  // Auth actions
  login: (identifier: string, password: string, role: UserRole) => Promise<AuthResponse>;
  sendOTP: (mobile: string) => Promise<OTPResponse>;
  verifyOTP: (mobile: string, otp: string, role: UserRole) => Promise<AuthResponse>;
  register: (data: RegisterData) => Promise<AuthResponse>;
  logout: () => void;

  // Password reset
  sendResetOTP: (identifier: string) => Promise<OTPResponse>;
  resetPassword: (identifier: string, otp: string, newPassword: string) => Promise<AuthResponse>;

  // Legacy stub
  upgradePremium?: () => void;
}

// ─── Context ─────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ─── Provider ────────────────────────────────────────────────────────────────

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(getStoredToken());
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);

  // Language — persisted
  const [language, setLanguageState] = useState<Language>(() => {
    try {
      return (localStorage.getItem('healthsure_language') as Language) || 'en';
    } catch {
      return 'en';
    }
  });

  // Theme — persisted, default light
  const [theme, setTheme] = useState<Theme>(() => {
    try {
      return (localStorage.getItem('healthsure_theme') as Theme) || 'light';
    } catch {
      return 'light';
    }
  });

  // Apply language and RTL to <html>
  useEffect(() => {
    const root = document.documentElement;
    root.lang = language;
    if (language === 'ur') {
      root.dir = 'rtl';
    } else {
      root.dir = 'ltr';
    }
    try {
      localStorage.setItem('healthsure_language', language);
    } catch {
      // Ignore
    }
  }, [language]);

  // Apply theme class to <html>
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    try {
      localStorage.setItem('healthsure_theme', theme);
    } catch {
      // Ignore
    }
  }, [theme]);

  // Validate session on mount
  useEffect(() => {
    async function initSession() {
      const storedToken = getStoredToken();
      if (storedToken) {
        const res = await fetchCurrentUserAPI(storedToken);
        if (res.success && res.user) {
          setUser(res.user);
          setToken(storedToken);
        } else {
          clearStoredToken();
          setToken(null);
          setUser(null);
        }
      }
      setIsLoading(false);
    }
    initSession();
  }, []);

  // ─── Actions ───────────────────────────────────────────────────────────────

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem('healthsure_language', lang);
    } catch {
      // Ignore
    }
  };

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const login = async (
    identifier: string,
    password: string,
    role: UserRole
  ): Promise<AuthResponse> => {
    const res = await loginAPI(identifier, password, role);
    if (res.success && res.token && res.user) {
      setStoredToken(res.token, res.user);
      setToken(res.token);
      setUser(res.user);
    }
    return res;
  };

  const sendOTP = async (mobile: string): Promise<OTPResponse> => {
    return sendOTPAPI(mobile);
  };

  const verifyOTP = async (
    mobile: string,
    otp: string,
    role: UserRole
  ): Promise<AuthResponse> => {
    const res = await verifyOTPAPI(mobile, otp, role);
    if (res.success && res.token && res.user) {
      setStoredToken(res.token, res.user);
      setToken(res.token);
      setUser(res.user);
    }
    return res;
  };

  const register = async (data: RegisterData): Promise<AuthResponse> => {
    const res = await registerAPI(data);
    if (res.success && res.token && res.user) {
      setStoredToken(res.token, res.user);
      setToken(res.token);
      setUser(res.user);
    }
    return res;
  };

  const logout = () => {
    clearStoredToken();
    setToken(null);
    setUser(null);
    setSelectedRole(null);
  };

  const sendResetOTP = async (identifier: string): Promise<OTPResponse> => {
    return sendPasswordResetOTPAPI(identifier);
  };

  const resetPassword = async (
    identifier: string,
    otp: string,
    newPassword: string
  ): Promise<AuthResponse> => {
    return resetPasswordAPI(identifier, otp, newPassword);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isLoading,
        selectedRole,
        setSelectedRole,
        language,
        setLanguage,
        theme,
        toggleTheme,
        login,
        sendOTP,
        verifyOTP,
        register,
        logout,
        sendResetOTP,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// ─── Hook ─────────────────────────────────────────────────────────────────────

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
