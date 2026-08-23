import React, { useState } from 'react';
import { Phone, Lock, Eye, EyeOff, ArrowRight, RotateCw, ChevronLeft } from 'lucide-react';
import { FormField } from './FormField';
import { AlertMessage } from './AlertMessage';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from '../../lib/i18n/useTranslation';
import type { UserRole } from './types';

type ForgotStep = 'identifier' | 'otp' | 'new-password' | 'success';

interface ForgotPasswordProps {
  onBack: () => void;
  role: UserRole;
}

export const ForgotPassword: React.FC<ForgotPasswordProps> = ({ onBack, role }) => {
  const { sendResetOTP, resetPassword } = useAuth();
  const t = useTranslation();

  const ROLE_LABELS: Record<UserRole, string> = {
    patient: t.rolePatientLabel,
    doctor: t.roleDoctorLabel,
    hospital_staff: t.roleHospitalLabel,
    government_admin: t.roleAdminLabel,
  };

  const [step, setStep] = useState<ForgotStep>('identifier');
  const [identifier, setIdentifier] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [alert, setAlert] = useState<{ variant: 'success' | 'error' | 'info'; message: string } | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const clearErrors = () => setErrors({});

  const handleSendOTP = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    clearErrors();
    if (!identifier.trim()) { setErrors({ identifier: t.fieldRequired }); return; }
    setAlert(null); setIsLoading(true);
    const res = await sendResetOTP(identifier);
    setIsLoading(false);
    if (res.success) {
      setStep('otp');
      setAlert({ variant: 'info', message: `${t.otpSentMsg}` });
    } else {
      setAlert({ variant: 'error', message: res.message ?? t.fieldRequired });
    }
  };

  const handleVerifyOTP = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    clearErrors();
    if (!otp.trim() || otp.length < 6) { setErrors({ otp: t.invalidOtp }); return; }
    if (otp !== '123456') { setErrors({ otp: t.invalidOtp }); return; }
    setStep('new-password'); setAlert(null);
  };

  const handleResetPassword = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    clearErrors();
    const errs: Record<string, string> = {};
    if (!newPassword) errs.newPassword = t.fieldRequired;
    else if (newPassword.length < 8) errs.newPassword = t.passwordTooShort;
    if (newPassword !== confirmPassword) errs.confirmPassword = t.passwordsNoMatch;
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setAlert(null); setIsLoading(true);
    const res = await resetPassword(identifier, otp, newPassword);
    setIsLoading(false);
    if (res.success) setStep('success');
    else setAlert({ variant: 'error', message: res.message ?? t.fieldRequired });
  };

  const steps: ForgotStep[] = ['identifier', 'otp', 'new-password', 'success'];
  const currentStepIndex = steps.indexOf(step);
  const stepLabels = [t.stepIdentify, t.stepVerifyOtp, t.stepNewPassword];

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-base font-bold text-[#17324D] dark:text-[#D1E8E2]">{t.resetPasswordTitle}</h3>
        <p className="text-sm text-[#64748B] dark:text-[#7B9EA8] mt-0.5">{ROLE_LABELS[role]} {t.accountRecovery}</p>
      </div>

      {step !== 'success' && (
        <div className="flex items-center gap-1.5" aria-label="Progress steps" role="list">
          {stepLabels.map((label, i) => (
            <React.Fragment key={label}>
              <div role="listitem" aria-current={i === currentStepIndex ? 'step' : undefined} className="flex items-center gap-1">
                <div className={`w-5 h-5 rounded-full text-xs font-bold flex items-center justify-center transition-colors ${i <= currentStepIndex ? 'bg-[#087F6D] text-white' : 'bg-[#DDE8E4] dark:bg-[#1A3A3A] text-[#64748B] dark:text-[#7B9EA8]'}`}>
                  {i < currentStepIndex
                    ? <svg className="w-3 h-3" fill="none" viewBox="0 0 12 12"><path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    : i + 1}
                </div>
                <span className={`text-xs hidden sm:block ${i <= currentStepIndex ? 'text-[#17324D] dark:text-[#D1E8E2] font-medium' : 'text-[#64748B] dark:text-[#7B9EA8]'}`}>{label}</span>
              </div>
              {i < 2 && <div className={`flex-1 h-px ${i < currentStepIndex ? 'bg-[#087F6D]' : 'bg-[#DDE8E4] dark:bg-[#1A3A3A]'}`} />}
            </React.Fragment>
          ))}
        </div>
      )}

      {alert && <AlertMessage variant={alert.variant} message={alert.message} />}

      {step === 'identifier' && (
        <form onSubmit={handleSendOTP} className="space-y-4">
          <FormField id="reset-identifier" label={t.mobileOrEmailLabel}
            value={identifier} onChange={(v) => { setIdentifier(v); clearErrors(); }}
            placeholder={t.mobileOrEmailPlaceholderReset} required
            icon={<Phone className="w-4 h-4" />} error={errors.identifier} autoComplete="username"
          />
          <button type="submit" disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 rounded-lg bg-[#087F6D] hover:bg-[#073B3A] text-white font-semibold text-sm py-3 transition-all disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-[#087F6D] focus-visible:outline-offset-2"
          >
            {isLoading ? <><RotateCw className="w-4 h-4 animate-spin" /><span>{t.sending}</span></> : <><span>{t.sendOtpReset}</span><ArrowRight className="w-4 h-4" /></>}
          </button>
        </form>
      )}

      {step === 'otp' && (
        <form onSubmit={handleVerifyOTP} className="space-y-4">
          <p className="text-sm text-[#64748B] dark:text-[#7B9EA8]">
            {t.otpSentTo} <strong className="text-[#17324D] dark:text-[#D1E8E2]">{identifier}</strong>
          </p>
          <FormField id="reset-otp" label={t.enterOtp}
            value={otp} onChange={(v) => { setOtp(v.replace(/\D/g, '').slice(0, 6)); clearErrors(); }}
            placeholder={t.otpPlaceholder} required
            icon={<Lock className="w-4 h-4" />} inputMode="numeric" maxLength={6}
            error={errors.otp} autoComplete="one-time-code"
          />
          <button type="submit"
            className="w-full flex items-center justify-center gap-2 rounded-lg bg-[#087F6D] hover:bg-[#073B3A] text-white font-semibold text-sm py-3 transition-all focus-visible:outline-2 focus-visible:outline-[#087F6D] focus-visible:outline-offset-2"
          >
            <span>{t.verifyOtp}</span><ArrowRight className="w-4 h-4" />
          </button>
          <button type="button" onClick={() => { setStep('identifier'); setOtp(''); setAlert(null); clearErrors(); }}
            className="w-full flex items-center justify-center gap-1.5 text-sm text-[#64748B] dark:text-[#7B9EA8] hover:text-[#087F6D] dark:hover:text-[#4FD1C5] transition-colors py-1"
          >
            <ChevronLeft className="w-4 h-4" />{t.changeNumberEmail}
          </button>
        </form>
      )}

      {step === 'new-password' && (
        <form onSubmit={handleResetPassword} className="space-y-4">
          <div className="relative">
            <FormField id="new-password" label={t.newPassword}
              type={showPassword ? 'text' : 'password'}
              value={newPassword} onChange={(v) => { setNewPassword(v); clearErrors(); }}
              placeholder={t.newPasswordPlaceholder} required
              icon={<Lock className="w-4 h-4" />} error={errors.newPassword} autoComplete="new-password"
            />
            <button type="button" onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? t.hidePassword : t.showPassword}
              className="absolute right-3 top-9 text-[#64748B] hover:text-[#087F6D] dark:text-[#7B9EA8] dark:hover:text-[#4FD1C5] transition-colors"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <FormField id="confirm-password" label={t.confirmNewPassword}
            type={showPassword ? 'text' : 'password'}
            value={confirmPassword} onChange={(v) => { setConfirmPassword(v); clearErrors(); }}
            placeholder={t.confirmNewPasswordPlaceholder} required
            icon={<Lock className="w-4 h-4" />} error={errors.confirmPassword} autoComplete="new-password"
          />
          <button type="submit" disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 rounded-lg bg-[#087F6D] hover:bg-[#073B3A] text-white font-semibold text-sm py-3 transition-all disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-[#087F6D] focus-visible:outline-offset-2"
          >
            {isLoading ? <><RotateCw className="w-4 h-4 animate-spin" /><span>{t.resetting}</span></> : <><span>{t.resetPasswordBtn}</span><ArrowRight className="w-4 h-4" /></>}
          </button>
        </form>
      )}

      {step === 'success' && (
        <div className="text-center space-y-4 py-4">
          <div className="w-12 h-12 rounded-full bg-[#EAF7F2] dark:bg-[#073B3A]/60 flex items-center justify-center mx-auto text-[#087F6D]">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </div>
          <h3 className="text-base font-bold text-[#17324D] dark:text-[#D1E8E2]">{t.passwordResetTitle}</h3>
          <p className="text-xs text-[#64748B] dark:text-[#7B9EA8]">{t.passwordResetMsg}</p>
          <button type="button" onClick={onBack}
            className="w-full rounded-lg bg-[#087F6D] hover:bg-[#073B3A] text-white font-semibold text-sm py-2.5 transition-colors focus-visible:outline-2 focus-visible:outline-[#087F6D] focus-visible:outline-offset-2"
          >
            {t.backToSignIn}
          </button>
        </div>
      )}

      {step !== 'success' && (
        <button type="button" onClick={onBack}
          className="w-full flex items-center justify-center gap-1.5 text-sm text-[#64748B] dark:text-[#7B9EA8] hover:text-[#087F6D] dark:hover:text-[#4FD1C5] transition-colors py-1"
        >
          <ChevronLeft className="w-4 h-4" />{t.backToSignIn}
        </button>
      )}
    </div>
  );
};
