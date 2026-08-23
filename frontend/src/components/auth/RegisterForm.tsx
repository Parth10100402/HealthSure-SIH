import React, { useState, useRef, useEffect } from 'react';
import { Eye, EyeOff, ArrowRight, RotateCw, CheckCircle2, ChevronLeft, Sparkles, KeyRound } from 'lucide-react';
import { FormField } from './FormField';
import { AlertMessage } from './AlertMessage';
import { useAuth } from '../../context/AuthContext';
import { sendOTPAPI, registerWithOtpAPI } from '../../services/authService';
import { useTranslation } from '../../lib/i18n/useTranslation';
import type { UserRole } from './types';

interface RegisterFormProps {
  role: UserRole;
  onSuccess: () => void;
  onSwitchToLogin: () => void;
}

const OTP_LENGTH = 6;
const RESEND_COOLDOWN = 60;

export const RegisterForm: React.FC<RegisterFormProps> = ({ role, onSuccess, onSwitchToLogin }) => {
  const { register } = useAuth();
  const t = useTranslation();

  const TITLE: Record<UserRole, string> = {
    patient: t.createPatientAccount,
    doctor: t.createDoctorAccount,
    hospital_staff: t.createHospitalAccount,
    government_admin: t.createAdminAccount,
  };

  // Steps: 'form' -> 'verify_otp' (for patient) -> 'success'
  const [step, setStep] = useState<'form' | 'verify_otp' | 'success'>('form');
  const [form, setForm] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [alert, setAlert] = useState<{ variant: 'error' | 'success' | 'info'; message: string } | null>(null);

  // OTP Verification state for Patient registration
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [otpError, setOtpError] = useState('');
  const [cooldown, setCooldown] = useState(0);
  const [demoOtp, setDemoOtp] = useState<string | null>(null);
  const [isDemoMode, setIsDemoMode] = useState(true);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  useEffect(() => {
    if (step === 'verify_otp') {
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    }
  }, [step]);

  const cleanNumber = (val: string) => (val || '').replace(/\D/g, '').slice(-10);

  const set = (key: string, val: string) => {
    setForm((f) => ({ ...f, [key]: val }));
    setErrors((e) => {
      const n = { ...e };
      delete n[key];
      return n;
    });
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    const req = (key: string) => {
      if (!form[key]?.trim()) errs[key] = t.fieldRequired;
    };

    req('fullName');
    
    // Mobile validation
    const digits = cleanNumber(form.phone || '');
    if (!digits) {
      errs.phone = t.fieldRequired;
    } else if (digits.length !== 10) {
      errs.phone = 'Please enter a valid 10-digit mobile number';
    } else if (!/^[6-9]/.test(digits)) {
      errs.phone = 'Please enter a valid Indian mobile number starting with 6-9';
    }

    if (role !== 'patient') {
      req('email');
      req('password');
      req('confirmPassword');
      if (form.password && form.password.length < 8) errs.password = t.passwordTooShort;
      if (form.password && form.confirmPassword && form.password !== form.confirmPassword) {
        errs.confirmPassword = t.passwordsNoMatch;
      }
    }
    if (role === 'doctor') {
      req('medicalRegNumber');
      req('speciality');
      req('facility');
    }
    if (role === 'hospital_staff') {
      req('facility');
      req('designation');
    }
    if (role === 'government_admin') {
      req('officialEmail');
      req('department');
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Step 1 Submission: Patient triggers Send OTP; Non-patient submits password registration
  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setAlert(null);
    if (!validate()) return;

    const digits = cleanNumber(form.phone || '');

    // For Patient: Require OTP Verification flow
    if (role === 'patient') {
      setIsLoading(true);
      const res = await sendOTPAPI(digits, 'registration');
      setIsLoading(false);

      if (res.success) {
        setStep('verify_otp');
        setCooldown(RESEND_COOLDOWN);
        if (res.demoOtp) {
          setDemoOtp(res.demoOtp);
        }
        if (res.demoMode !== undefined) {
          setIsDemoMode(res.demoMode);
        }
        setAlert({
          variant: 'info',
          message: `OTP sent to +91 ${digits.slice(0, 5)} ${digits.slice(5)}. Enter code to verify.`,
        });
      } else {
        setAlert({
          variant: 'error',
          message: res.message || 'Unable to send OTP. Please check your mobile number or try signing in.',
        });
      }
      return;
    }

    // For other roles (Doctor / Hospital / Admin demo flows)
    setIsLoading(true);
    const res = await register({
      fullName: form.fullName || '',
      phone: digits,
      ...form,
      role,
    });
    setIsLoading(false);

    if (res.success) {
      setStep('success');
      setTimeout(onSuccess, 400);
    } else {
      setAlert({ variant: 'error', message: res.message ?? t.fieldRequired });
    }
  };

  // Patient Step 2: Resend OTP
  const handleResendOTP = async () => {
    if (cooldown > 0 || isLoading) return;
    setAlert(null);
    setIsLoading(true);
    setOtp(Array(OTP_LENGTH).fill(''));
    setOtpError('');

    const digits = cleanNumber(form.phone || '');
    const res = await sendOTPAPI(digits, 'registration');
    setIsLoading(false);

    if (res.success) {
      setCooldown(RESEND_COOLDOWN);
      if (res.demoOtp) {
        setDemoOtp(res.demoOtp);
      }
      setAlert({
        variant: 'info',
        message: `OTP resent to +91 ${digits.slice(0, 5)} ${digits.slice(5)}`,
      });
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    } else {
      setAlert({
        variant: 'error',
        message: res.message || 'Unable to resend OTP right now. Please try again.',
      });
    }
  };

  // Patient Step 2: OTP Input Handling
  const handleOTPInput = (index: number, value: string) => {
    const digit = value.replace(/\D/g, '').slice(-1);
    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);
    setOtpError('');

    if (digit && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
    if (digit && newOtp.every((d) => d !== '') && newOtp.join('').length === OTP_LENGTH) {
      handleVerifyPatientRegistration(undefined, newOtp.join(''));
    }
  };

  const handleOTPKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (otp[index]) {
        const n = [...otp];
        n[index] = '';
        setOtp(n);
      } else if (index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    }
    if (e.key === 'ArrowLeft' && index > 0) inputRefs.current[index - 1]?.focus();
    if (e.key === 'ArrowRight' && index < OTP_LENGTH - 1) inputRefs.current[index + 1]?.focus();
    if (e.key === 'Enter') {
      e.preventDefault();
      handleVerifyPatientRegistration();
    }
  };

  const handleOTPPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH);
    if (!pasted) return;
    const newOtp = Array(OTP_LENGTH).fill('');
    pasted.split('').forEach((d, i) => {
      newOtp[i] = d;
    });
    setOtp(newOtp);
    inputRefs.current[Math.min(pasted.length, OTP_LENGTH - 1)]?.focus();
    if (pasted.length === OTP_LENGTH) {
      handleVerifyPatientRegistration(undefined, pasted);
    }
  };

  // Patient Step 2: Verify OTP and finalize Account Creation
  const handleVerifyPatientRegistration = async (e?: React.FormEvent, otpValue?: string) => {
    if (e) e.preventDefault();
    const code = otpValue ?? otp.join('');
    if (code.length < OTP_LENGTH) {
      setOtpError('Please enter the full 6-digit OTP code');
      return;
    }
    setOtpError('');
    setAlert(null);
    setIsLoading(true);

    const digits = cleanNumber(form.phone || '');
    const res = await registerWithOtpAPI({
      fullName: form.fullName || '',
      phone: digits,
      otp: code,
      village: form.location,
      district: form.district || 'Ratnagiri',
      preferredLanguage: form.preferredLanguage || 'en',
    });
    setIsLoading(false);

    if (res.success) {
      setStep('success');
      setTimeout(onSuccess, 400);
    } else {
      setOtpError(res.message || 'OTP verification failed. Account was not created.');
    }
  };

  // ── Success View ──────────────────────────────────────────────────────────
  if (step === 'success') {
    return (
      <div className="text-center space-y-5 py-6">
        <div className="w-16 h-16 rounded-full bg-[#EAF7F2] dark:bg-[#073B3A]/60 flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-9 h-9 text-[#087F6D]" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-[#17324D] dark:text-[#D1E8E2]">{t.accountCreatedTitle}</h3>
          <p className="text-sm text-[#64748B] dark:text-[#7B9EA8] mt-1">{t.accountCreatedMsg}</p>
        </div>
        <div className="flex items-center justify-center gap-2 text-sm text-[#087F6D]">
          <RotateCw className="w-4 h-4 animate-spin" />
          <span>{t.pleaseWait}</span>
        </div>
      </div>
    );
  }

  // ── Patient Step 2: Verify OTP Screen ─────────────────────────────────────
  if (step === 'verify_otp' && role === 'patient') {
    const digits = cleanNumber(form.phone || '');
    const formattedCooldown = `00:${String(cooldown).padStart(2, '0')}`;

    return (
      <form onSubmit={handleVerifyPatientRegistration} className="space-y-5" noValidate>
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="text-base font-bold text-[#17324D] dark:text-[#D1E8E2]">Verify Mobile Number</h3>
            <p className="text-sm text-[#64748B] dark:text-[#7B9EA8] mt-0.5">
              Enter the 6-digit OTP sent to <strong className="text-[#17324D] dark:text-[#D1E8E2]">+91 {digits.slice(0, 5)} {digits.slice(5)}</strong> to activate your patient account.
            </p>
          </div>
          {isDemoMode && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/50 text-[#087F6D] dark:text-[#4FD1C5] border border-emerald-200 dark:border-emerald-800/60 shrink-0">
              <Sparkles className="w-3 h-3 text-[#087F6D] dark:text-[#4FD1C5]" />
              Demo Mode Active
            </span>
          )}
        </div>

        {alert && <AlertMessage variant={alert.variant} message={alert.message} />}

        {/* ── Demo Mode Code Helper (visible in dev/demo mode only) ── */}
        {demoOtp && isDemoMode && (
          <div className="rounded-lg bg-[#EAF7F2] dark:bg-[#073B3A]/60 border border-[#087F6D]/30 p-3 space-y-1.5 animate-fadeIn">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-[#087F6D] dark:text-[#4FD1C5] flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5" />
                Demo Verification Code
              </span>
              <span className="text-[10px] text-[#64748B] dark:text-[#7B9EA8]">
                (Zero-Credit Simulation)
              </span>
            </div>
            <div className="flex items-center justify-between bg-white dark:bg-[#0A2020] rounded-md border border-[#DDE8E4] dark:border-[#1A3A3A] px-3 py-1.5">
              <span className="text-sm font-mono font-bold tracking-widest text-[#17324D] dark:text-[#E2EEF4]">
                {demoOtp}
              </span>
              <button
                type="button"
                onClick={() => {
                  setOtp(demoOtp.split(''));
                  setOtpError('');
                }}
                className="text-xs font-bold text-[#087F6D] dark:text-[#4FD1C5] hover:underline"
              >
                1-Click Auto-Fill
              </button>
            </div>
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-[#64748B] dark:text-[#7B9EA8] mb-2 text-center uppercase tracking-wider">
            Enter 6-digit OTP
          </label>
          <div className="flex items-center gap-2 justify-center" role="group" aria-label="Registration OTP">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => {
                  inputRefs.current[index] = el;
                }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleOTPInput(index, e.target.value)}
                onKeyDown={(e) => handleOTPKeyDown(index, e)}
                onPaste={index === 0 ? handleOTPPaste : undefined}
                aria-label={`OTP digit ${index + 1}`}
                aria-invalid={!!otpError}
                disabled={isLoading}
                className={`w-11 h-12 text-center text-lg font-bold rounded-lg border text-[#17324D] dark:text-[#E2EEF4] bg-white dark:bg-[#0A2020] transition-colors focus:outline-none focus:ring-2 focus:ring-[#087F6D] focus:border-[#087F6D] disabled:opacity-50 ${
                  otpError
                    ? 'border-red-400 dark:border-red-600'
                    : digit
                    ? 'border-[#087F6D] bg-[#EAF7F2] dark:bg-[#073B3A]/40'
                    : 'border-[#DDE8E4] dark:border-[#1A3A3A]'
                }`}
              />
            ))}
          </div>
          {otpError && (
            <p role="alert" className="mt-2 text-center text-xs font-medium text-red-600 dark:text-red-400">
              {otpError}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading || otp.some((d) => !d)}
          className="w-full flex items-center justify-center gap-2 rounded-lg bg-[#087F6D] hover:bg-[#073B3A] text-white font-semibold text-sm py-3 transition-all disabled:opacity-60 disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-[#087F6D] focus-visible:outline-offset-2"
        >
          {isLoading ? (
            <>
              <RotateCw className="w-4 h-4 animate-spin" />
              <span>Verifying & Creating Account…</span>
            </>
          ) : (
            <>
              <span>Verify & Create Account</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>

        <div className="flex items-center justify-between text-sm pt-1">
          <button
            type="button"
            onClick={() => {
              setStep('form');
              setOtp(Array(OTP_LENGTH).fill(''));
              setOtpError('');
              setAlert(null);
            }}
            className="flex items-center gap-1 text-[#64748B] dark:text-[#7B9EA8] hover:text-[#087F6D] dark:hover:text-[#4FD1C5] transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Edit Registration Details
          </button>

          <div className="text-right">
            {cooldown > 0 ? (
              <span className="text-xs font-mono text-[#64748B] dark:text-[#7B9EA8]">
                Resend in <strong className="text-[#087F6D] dark:text-[#4FD1C5]">{formattedCooldown}</strong>
              </span>
            ) : (
              <button
                type="button"
                onClick={handleResendOTP}
                disabled={isLoading}
                className="font-medium text-sm text-[#087F6D] dark:text-[#4FD1C5] hover:text-[#073B3A] dark:hover:text-[#A7D9CE] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {t.resendOtp || 'Resend OTP'}
              </button>
            )}
          </div>
        </div>
      </form>
    );
  }

  // ── Step 1: Registration Form ─────────────────────────────────────────────
  return (
    <form onSubmit={handleSubmitForm} noValidate className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-[#17324D] dark:text-[#D1E8E2]">{TITLE[role]}</h3>
          <p className="text-sm text-[#64748B] dark:text-[#7B9EA8] mt-0.5">{t.fillDetails}</p>
        </div>
        {role === 'patient' && isDemoMode && (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/50 text-[#087F6D] dark:text-[#4FD1C5] border border-emerald-200 dark:border-emerald-800/60 shrink-0">
            <Sparkles className="w-3 h-3 text-[#087F6D] dark:text-[#4FD1C5]" />
            Demo Mode Active
          </span>
        )}
      </div>

      {alert && <AlertMessage variant={alert.variant} message={alert.message} />}

      {/* ── Shared fields ─────────────────────────────────────────── */}
      <FormField
        id="reg-fullName"
        label={t.fullName}
        required
        placeholder={role === 'doctor' ? t.fullNameDoctorPlaceholder : t.fullNamePlaceholder}
        value={form.fullName ?? ''}
        onChange={(v) => set('fullName', v)}
        error={errors.fullName}
        autoComplete="name"
      />

      <FormField
        id="reg-phone"
        label={t.mobileField}
        type="tel"
        prefix="+91"
        required
        placeholder="9876543210"
        value={form.phone ?? ''}
        onChange={(v) => {
          const sanitized = v.replace(/\D/g, '').slice(0, 10);
          set('phone', sanitized);
        }}
        error={errors.phone}
        autoComplete="tel-national"
        inputMode="numeric"
        maxLength={10}
        hint={role === 'patient' ? 'We will send a 6-digit OTP to verify this number' : undefined}
      />

      {/* ── Patient-specific ──────────────────────────────────────── */}
      {role === 'patient' && (
        <>
          <FormField
            id="reg-email"
            label={t.emailField}
            type="email"
            placeholder={t.emailPlaceholderPatient}
            value={form.email ?? ''}
            onChange={(v) => set('email', v)}
            error={errors.email}
            autoComplete="email"
            hint={t.emailOptional}
          />
          <FormField
            id="reg-dob"
            label={t.dateOfBirth}
            type="date"
            value={form.dateOfBirth ?? ''}
            onChange={(v) => set('dateOfBirth', v)}
            error={errors.dateOfBirth}
          />
          <div className="space-y-1">
            <label htmlFor="reg-gender" className="block text-sm font-medium text-[#17324D] dark:text-[#D1E8E2]">
              {t.gender}
            </label>
            <select
              id="reg-gender"
              value={form.gender ?? ''}
              onChange={(e) => set('gender', e.target.value)}
              className="w-full rounded-lg border border-[#DDE8E4] dark:border-[#1A3A3A] bg-white dark:bg-[#0A2020] text-[#17324D] dark:text-[#D1E8E2] px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#087F6D]"
            >
              <option value="">{t.selectGender}</option>
              <option value="male">{t.male}</option>
              <option value="female">{t.female}</option>
              <option value="other">{t.other}</option>
              <option value="prefer_not_to_say">{t.preferNotToSay}</option>
            </select>
          </div>
          <FormField
            id="reg-location"
            label={t.location}
            placeholder={t.locationPlaceholder}
            value={form.location ?? ''}
            onChange={(v) => set('location', v)}
            error={errors.location}
          />
          <div className="space-y-1">
            <label htmlFor="reg-lang" className="block text-sm font-medium text-[#17324D] dark:text-[#D1E8E2]">
              {t.preferredLanguage}
            </label>
            <select
              id="reg-lang"
              value={form.preferredLanguage ?? ''}
              onChange={(e) => set('preferredLanguage', e.target.value)}
              className="w-full rounded-lg border border-[#DDE8E4] dark:border-[#1A3A3A] bg-white dark:bg-[#0A2020] text-[#17324D] dark:text-[#D1E8E2] px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#087F6D]"
            >
              <option value="">{t.selectLanguageField}</option>
              <option value="en">{t.englishOption}</option>
              <option value="hi">{t.hindiOption}</option>
              <option value="mr">{t.marathiOption}</option>
            </select>
          </div>
          <div className="rounded-lg bg-[#EAF7F2] dark:bg-[#073B3A]/40 border border-[#DDE8E4] dark:border-[#087F6D]/30 px-3.5 py-2.5">
            <p className="text-xs text-[#17324D] dark:text-[#D1E8E2]">
              🔒 <strong>Instant Verification:</strong> A 6-digit OTP will be sent to verify your phone number before your health ID is generated.
            </p>
          </div>
        </>
      )}

      {/* ── Doctor-specific ───────────────────────────────────────── */}
      {role === 'doctor' && (
        <>
          <FormField
            id="reg-email"
            label={t.emailField}
            type="email"
            required
            placeholder="dr.name@healthsure.org"
            value={form.email ?? ''}
            onChange={(v) => set('email', v)}
            error={errors.email}
            autoComplete="email"
          />
          <FormField
            id="reg-reg"
            label={t.medicalRegNo}
            required
            placeholder={t.medicalRegPlaceholder}
            value={form.medicalRegNumber ?? ''}
            onChange={(v) => set('medicalRegNumber', v)}
            error={errors.medicalRegNumber}
          />
          <FormField
            id="reg-spec"
            label={t.speciality}
            required
            placeholder={t.specialityPlaceholder}
            value={form.speciality ?? ''}
            onChange={(v) => set('speciality', v)}
            error={errors.speciality}
          />
          <FormField
            id="reg-facility"
            label={t.hospitalFacility}
            required
            placeholder={t.hospitalPlaceholder}
            value={form.facility ?? ''}
            onChange={(v) => set('facility', v)}
            error={errors.facility}
          />
        </>
      )}

      {/* ── Hospital staff-specific ───────────────────────────────── */}
      {role === 'hospital_staff' && (
        <>
          <FormField
            id="reg-email"
            label={t.emailField}
            type="email"
            required
            placeholder="name@hospital.gov.in"
            value={form.email ?? ''}
            onChange={(v) => set('email', v)}
            error={errors.email}
            autoComplete="email"
          />
          <FormField
            id="reg-facility"
            label={t.hospitalFacility}
            required
            placeholder={t.hospitalPlaceholder}
            value={form.facility ?? ''}
            onChange={(v) => set('facility', v)}
            error={errors.facility}
          />
          <FormField
            id="reg-designation"
            label={t.designation}
            required
            placeholder={t.designationPlaceholder}
            value={form.designation ?? ''}
            onChange={(v) => set('designation', v)}
            error={errors.designation}
          />
        </>
      )}

      {/* ── Government admin-specific ─────────────────────────────── */}
      {role === 'government_admin' && (
        <>
          <FormField
            id="reg-officialEmail"
            label={t.emailRequired}
            type="email"
            required
            placeholder={t.emailPlaceholderGovt}
            value={form.officialEmail ?? ''}
            onChange={(v) => set('officialEmail', v)}
            error={errors.officialEmail}
            autoComplete="email"
          />
          <FormField
            id="reg-dept"
            label={t.department}
            required
            placeholder={t.departmentPlaceholder}
            value={form.department ?? ''}
            onChange={(v) => set('department', v)}
            error={errors.department}
          />
          <FormField
            id="reg-district"
            label={t.district}
            placeholder={t.districtPlaceholder}
            value={form.district ?? ''}
            onChange={(v) => set('district', v)}
            error={errors.district}
          />
        </>
      )}

      {/* ── Password fields (non-patient roles) ───────────────────── */}
      {role !== 'patient' && (
        <>
          <div className="relative">
            <FormField
              id="reg-password"
              label={t.passwordField}
              type={showPassword ? 'text' : 'password'}
              required
              placeholder={t.passwordMin}
              value={form.password ?? ''}
              onChange={(v) => set('password', v)}
              error={errors.password}
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? t.hidePassword : t.showPassword}
              className="absolute right-3 top-9 text-[#64748B] hover:text-[#087F6D] dark:text-[#7B9EA8] transition-colors"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <FormField
            id="reg-confirm"
            label={t.confirmPassword}
            type="password"
            required
            placeholder={t.confirmPasswordPlaceholder}
            value={form.confirmPassword ?? ''}
            onChange={(v) => set('confirmPassword', v)}
            error={errors.confirmPassword}
            autoComplete="new-password"
          />
        </>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className="w-full flex items-center justify-center gap-2 rounded-lg bg-[#087F6D] hover:bg-[#073B3A] text-white font-semibold text-sm py-3.5 transition-all disabled:opacity-60 disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-[#087F6D] focus-visible:outline-offset-2"
      >
        {isLoading ? (
          <>
            <RotateCw className="w-4 h-4 animate-spin" />
            <span>{role === 'patient' ? t.sendingOtp || 'Sending Verification OTP…' : t.creatingAccount}</span>
          </>
        ) : (
          <>
            <span>{role === 'patient' ? 'Send Verification OTP' : t.createAccountBtn}</span>
            <ArrowRight className="w-4 h-4" />
          </>
        )}
      </button>

      <p className="text-sm text-center text-[#64748B] dark:text-[#7B9EA8]">
        {t.alreadyHaveAccount}{' '}
        <button
          type="button"
          onClick={onSwitchToLogin}
          className="font-semibold text-[#087F6D] dark:text-[#4FD1C5] hover:underline focus-visible:outline-2 focus-visible:outline-[#087F6D] rounded"
        >
          {t.signIn}
        </button>
      </p>
    </form>
  );
};
