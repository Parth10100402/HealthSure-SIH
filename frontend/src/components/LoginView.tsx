import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthLayout } from './auth/AuthLayout';
import { RoleSelector } from './auth/RoleSelector';
import { LoginForm } from './auth/LoginForm';
import { RegisterForm } from './auth/RegisterForm';
import { ForgotPassword } from './auth/ForgotPassword';
import type { UserRole } from './auth/types';
import { ROLES } from './auth/types';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from '../lib/i18n/useTranslation';

type AuthStep = 'role-selection' | 'login' | 'register' | 'forgot-password';

export const LoginView: React.FC = () => {
  const navigate = useNavigate();
  const { setSelectedRole } = useAuth();
  const t = useTranslation();

  const [step, setStep] = useState<AuthStep>('role-selection');
  const [role, setRole] = useState<UserRole | null>(null);

  // ─── Handlers ─────────────────────────────────────────────────────────────

  const handleRoleContinue = (selectedRole: UserRole) => {
    setRole(selectedRole);
    setSelectedRole(selectedRole);
    setStep('login');
  };

  const handleLoginSuccess = () => {
    if (!role) return;
    const roleConfig = ROLES.find((r) => r.id === role);
    if (roleConfig) {
      navigate(roleConfig.route, { replace: true });
    }
  };

  const handleRegisterSuccess = () => {
    if (!role) return;
    const roleConfig = ROLES.find((r) => r.id === role);
    if (roleConfig) {
      navigate(roleConfig.route, { replace: true });
    }
  };

  const handleChangeRole = () => {
    setStep('role-selection');
    setRole(null);
    setSelectedRole(null);
  };

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <AuthLayout>
      {/* ── STEP 1: Role Selection ────────────────────────────────────────── */}
      {step === 'role-selection' && (
        <div className="space-y-6">
          <RoleSelector
            selectedRole={role}
            onSelect={setRole}
          />
          <button
            type="button"
            onClick={() => role && handleRoleContinue(role)}
            disabled={!role}
            className="
              w-full flex items-center justify-center gap-2 rounded-lg
              bg-[#087F6D] hover:bg-[#073B3A] active:scale-[0.99]
              text-white font-semibold text-sm py-3.5
              transition-all focus-visible:outline-2 focus-visible:outline-[#087F6D] focus-visible:outline-offset-2
              disabled:opacity-40 disabled:cursor-not-allowed
            "
            aria-label={role ? `Continue as ${role}` : t.selectRoleTitle}
          >
            <span>{t.continueBtn}</span>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 16 16">
              <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      )}

      {/* ── STEP 2: Login ─────────────────────────────────────────────────── */}
      {step === 'login' && role && (
        <LoginForm
          role={role}
          onSuccess={handleLoginSuccess}
          onForgotPassword={() => setStep('forgot-password')}
          onRegister={() => setStep('register')}
          onChangeRole={handleChangeRole}
        />
      )}

      {/* ── STEP 3: Register ──────────────────────────────────────────────── */}
      {step === 'register' && role && (
        <RegisterForm
          role={role}
          onSuccess={handleRegisterSuccess}
          onSwitchToLogin={() => setStep('login')}
        />
      )}

      {/* ── STEP 4: Forgot Password ───────────────────────────────────────── */}
      {step === 'forgot-password' && role && (
        <ForgotPassword
          role={role}
          onBack={() => setStep('login')}
        />
      )}
    </AuthLayout>
  );
};
