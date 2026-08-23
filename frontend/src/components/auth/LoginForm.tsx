import React, { useState } from 'react';
import {
  Eye, EyeOff, ArrowRight, RotateCw, ShieldCheck, Lock, Phone,
} from 'lucide-react';
import { FormField } from './FormField';
import { AlertMessage } from './AlertMessage';
import { OTPFlow } from './OTPFlow';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from '../../lib/i18n/useTranslation';
import type { UserRole, LoginMethod } from './types';

interface LoginFormProps {
  role: UserRole;
  onSuccess: () => void;
  onForgotPassword: () => void;
  onRegister: () => void;
  onChangeRole: () => void;
}

const ROLE_ICONS: Record<UserRole, string> = {
  patient: '🧑‍⚕️',
  doctor: '👨‍⚕️',
  hospital_staff: '🏥',
  government_admin: '🏛️',
};

export const LoginForm: React.FC<LoginFormProps> = ({
  role, onSuccess, onForgotPassword, onRegister, onChangeRole,
}) => {
  const { login } = useAuth();
  const t = useTranslation();

  const ROLE_LABELS: Record<UserRole, string> = {
    patient: t.rolePatientLabel,
    doctor: t.roleDoctorLabel,
    hospital_staff: t.roleHospitalLabel,
    government_admin: t.roleAdminLabel,
  };

  const [method, setMethod] = useState<LoginMethod>('password');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [alert, setAlert] = useState<{ variant: 'error' | 'success' | 'info'; message: string } | null>(null);

  const clearErrors = () => { setErrors({}); setAlert(null); };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!identifier.trim()) errs.identifier = t.fieldRequired;
    if (!password) errs.password = t.fieldRequired;
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearErrors();
    if (!validate()) return;
    setIsLoading(true);
    const res = await login(identifier, password, role);
    setIsLoading(false);
    if (res.success) {
      setAlert({ variant: 'success', message: `${t.signInBtn}…` });
      setTimeout(onSuccess, 100);
    } else {
      setAlert({ variant: 'error', message: res.message ?? t.incorrectCredentials });
    }
  };

  if (method === 'otp') {
    return (
      <div className="space-y-5">
        <RoleBadge role={role} label={ROLE_LABELS[role]} onChangeRole={onChangeRole} t={t} />
        <OTPFlow role={role} onSuccess={onSuccess} onBack={() => setMethod('password')} />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      <RoleBadge role={role} label={ROLE_LABELS[role]} onChangeRole={onChangeRole} t={t} />

      {alert && <AlertMessage variant={alert.variant} message={alert.message} />}

      {/* Method toggle */}
      <div className="flex rounded-lg border border-[#DDE8E4] dark:border-[#1A3A3A] p-1 bg-[#F5F9F7] dark:bg-[#0A2020] gap-1">
        {(['password', 'otp'] as LoginMethod[]).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setMethod(m)}
            className={`flex-1 py-2 rounded-md text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-[#087F6D] focus-visible:outline-offset-1 ${
              method === m
                ? 'bg-white dark:bg-[#0F2929] text-[#17324D] dark:text-[#D1E8E2] shadow-sm'
                : 'text-[#64748B] dark:text-[#7B9EA8] hover:text-[#17324D] dark:hover:text-[#D1E8E2]'
            }`}
          >
            {m === 'password' ? t.passwordTab : t.otpTab}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        <FormField
          id="login-identifier"
          label={t.mobileOrEmail}
          value={identifier}
          onChange={(v) => { setIdentifier(v); clearErrors(); }}
          placeholder={t.mobileOrEmailPlaceholder}
          required
          icon={<Phone className="w-4 h-4" />}
          error={errors.identifier}
          autoComplete="username"
          hint={role === 'patient' ? t.mobileHint : undefined}
        />

        <div className="relative">
          <FormField
            id="login-password"
            label={t.password}
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(v) => { setPassword(v); clearErrors(); }}
            placeholder={t.passwordPlaceholder}
            required
            icon={<Lock className="w-4 h-4" />}
            error={errors.password}
            autoComplete="current-password"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? t.hidePassword : t.showPassword}
            className="absolute right-3 top-9 text-[#64748B] hover:text-[#087F6D] dark:text-[#7B9EA8] dark:hover:text-[#4FD1C5] transition-colors"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="w-4 h-4 rounded border-[#DDE8E4] dark:border-[#1A3A3A] accent-[#087F6D] cursor-pointer"
          />
          <span className="text-sm text-[#64748B] dark:text-[#7B9EA8]">{t.rememberMe}</span>
        </label>
        <button
          type="button"
          onClick={onForgotPassword}
          className="text-sm font-medium text-[#087F6D] dark:text-[#4FD1C5] hover:underline focus-visible:outline-2 focus-visible:outline-[#087F6D] rounded"
        >
          {t.forgotPassword}
        </button>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full flex items-center justify-center gap-2 rounded-lg bg-[#087F6D] hover:bg-[#073B3A] active:scale-[0.99] text-white font-semibold text-sm py-3.5 transition-all focus-visible:outline-2 focus-visible:outline-[#087F6D] focus-visible:outline-offset-2 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {isLoading
          ? <><RotateCw className="w-4 h-4 animate-spin" /><span>{t.signingIn}</span></>
          : <><span>{t.signInBtn}</span><ArrowRight className="w-4 h-4" /></>}
      </button>

      {/* Demo hint */}
      <div className="rounded-lg bg-[#F5F9F7] dark:bg-[#0A2020] border border-[#DDE8E4] dark:border-[#1A3A3A] px-3.5 py-2.5">
        <p className="text-xs text-[#64748B] dark:text-[#7B9EA8]">
          <span className="font-semibold text-[#17324D] dark:text-[#D1E8E2]">{t.demoHint} — </span>
          {role === 'government_admin' && (
            <>email <code className="text-[#087F6D] font-mono">admin.health@maharashtra.gov.in</code> / password <code className="text-[#087F6D] font-mono">demo1234</code></>
          )}
          {role === 'doctor' && (
            <>email <code className="text-[#087F6D] font-mono">dr.rajesh@healthsure.org</code> / password <code className="text-[#087F6D] font-mono">demo1234</code></>
          )}
          {role === 'hospital_staff' && (
            <>email <code className="text-[#087F6D] font-mono">anita@hospital.gov.in</code> / password <code className="text-[#087F6D] font-mono">demo1234</code></>
          )}
          {role === 'patient' && (
            <>email <code className="text-[#087F6D] font-mono">priya@example.com</code> / password <code className="text-[#087F6D] font-mono">demo1234</code></>
          )}
          {', or OTP '}
          <code className="text-[#087F6D] font-mono">123456</code>.
        </p>
      </div>

      <p className="text-sm text-center text-[#64748B] dark:text-[#7B9EA8]">
        {t.noAccount}{' '}
        <button
          type="button"
          onClick={onRegister}
          className="font-semibold text-[#087F6D] dark:text-[#4FD1C5] hover:underline focus-visible:outline-2 focus-visible:outline-[#087F6D] rounded"
        >
          {t.createAccount}
        </button>
      </p>
    </form>
  );
};

function RoleBadge({ role, label, onChangeRole, t }: {
  role: UserRole; label: string; onChangeRole: () => void;
  t: ReturnType<typeof useTranslation>;
}) {
  return (
    <div className="flex items-center justify-between rounded-lg bg-[#EAF7F2] dark:bg-[#073B3A]/40 border border-[#DDE8E4] dark:border-[#087F6D]/30 px-3.5 py-2.5">
      <div className="flex items-center gap-2">
        <ShieldCheck className="w-4 h-4 text-[#087F6D] dark:text-[#4FD1C5]" aria-hidden="true" />
        <span className="text-sm font-medium text-[#17324D] dark:text-[#D1E8E2]">
          {t.signingInAs}{' '}<strong>{ROLE_ICONS[role]} {label}</strong>
        </span>
      </div>
      <button
        type="button"
        onClick={onChangeRole}
        className="text-xs font-semibold text-[#087F6D] dark:text-[#4FD1C5] hover:underline focus-visible:outline-2 focus-visible:outline-[#087F6D] rounded"
      >
        {t.changeRole}
      </button>
    </div>
  );
}
