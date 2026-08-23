import React, { useState, useRef, useEffect } from 'react';
import { ArrowRight, RotateCw, ChevronLeft, Sparkles, KeyRound } from 'lucide-react';
import { FormField } from './FormField';
import { AlertMessage } from './AlertMessage';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from '../../lib/i18n/useTranslation';
import type { UserRole } from './types';

type OTPStep = 'send' | 'verify';

interface OTPFlowProps {
  role: UserRole;
  onSuccess: () => void;
  onBack: () => void;
}

const OTP_LENGTH = 6;
const RESEND_COOLDOWN = 60;

export const OTPFlow: React.FC<OTPFlowProps> = ({ role, onSuccess, onBack }) => {
  const { sendOTP, verifyOTP } = useAuth();
  const t = useTranslation();

  const [step, setStep] = useState<OTPStep>('send');
  const [mobile, setMobile] = useState('');
  const [mobileError, setMobileError] = useState('');
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [otpError, setOtpError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [alert, setAlert] = useState<{ variant: 'success' | 'error' | 'info'; message: string } | null>(null);
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
    if (step === 'verify') {
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    }
  }, [step]);

  const cleanNumber = (val: string) => val.replace(/\D/g, '').slice(-10);

  const validateMobile = (val: string) => {
    const digits = cleanNumber(val);
    if (!digits) return t.fieldRequired;
    if (digits.length !== 10) return t.invalidMobile || 'Please enter a valid 10-digit mobile number';
    if (!/^[6-9]/.test(digits)) return 'Please enter a valid Indian mobile number starting with 6-9';
    return '';
  };

  const handleSendOTP = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const err = validateMobile(mobile);
    if (err) {
      setMobileError(err);
      return;
    }
    setMobileError('');
    setAlert(null);
    setIsLoading(true);

    const digits = cleanNumber(mobile);
    const res = await sendOTP(digits);
    setIsLoading(false);

    if (res.success) {
      setStep('verify');
      setCooldown(RESEND_COOLDOWN);
      if (res.demoOtp) {
        setDemoOtp(res.demoOtp);
      }
      if (res.demoMode !== undefined) {
        setIsDemoMode(res.demoMode);
      }
      setAlert({
        variant: 'info',
        message: `OTP sent to +91 ${digits.slice(0, 5)} ${digits.slice(5)}`,
      });
    } else {
      setAlert({
        variant: 'error',
        message: res.message || 'Unable to send OTP right now. Please try again.',
      });
    }
  };

  const handleResend = async () => {
    if (cooldown > 0 || isLoading) return;
    setAlert(null);
    setIsLoading(true);
    setOtp(Array(OTP_LENGTH).fill(''));
    setOtpError('');

    const digits = cleanNumber(mobile);
    const res = await sendOTP(digits);
    setIsLoading(false);

    if (res.success) {
      setCooldown(RESEND_COOLDOWN);
      if (res.demoOtp) {
        setDemoOtp(res.demoOtp);
      }
      if (res.demoMode !== undefined) {
        setIsDemoMode(res.demoMode);
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
      handleVerify(undefined, newOtp.join(''));
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
      handleVerify();
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
      handleVerify(undefined, pasted);
    }
  };

  const handleVerify = async (e?: React.FormEvent, otpValue?: string) => {
    if (e) e.preventDefault();
    const code = otpValue ?? otp.join('');
    if (code.length < OTP_LENGTH) {
      setOtpError('Please enter the full 6-digit OTP');
      return;
    }
    setOtpError('');
    setAlert(null);
    setIsLoading(true);

    const digits = cleanNumber(mobile);
    const res = await verifyOTP(digits, code, role);
    setIsLoading(false);

    if (res.success) {
      setAlert({ variant: 'success', message: `${t.verifyOtpBtn}…` });
      setTimeout(onSuccess, 100);
    } else {
      setOtpError(res.message || 'Invalid or expired OTP code. Please try again.');
    }
  };

  // Format cooldown display like 00:59
  const formattedCooldown = `00:${String(cooldown).padStart(2, '0')}`;

  // ── Step 1: Send OTP ──────────────────────────────────────────────────────
  if (step === 'send') {
    return (
      <form onSubmit={handleSendOTP} className="space-y-5" noValidate>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-[#17324D] dark:text-[#D1E8E2]">{t.otpTitle}</h3>
            <p className="text-sm text-[#64748B] dark:text-[#7B9EA8] mt-0.5">{t.otpSubtitle}</p>
          </div>
          {isDemoMode && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/50 text-[#087F6D] dark:text-[#4FD1C5] border border-emerald-200 dark:border-emerald-800/60 shrink-0">
              <Sparkles className="w-3 h-3 text-[#087F6D] dark:text-[#4FD1C5]" />
              Demo Mode Active
            </span>
          )}
        </div>

        {alert && <AlertMessage variant={alert.variant} message={alert.message} />}

        <FormField
          id="otp-mobile"
          label={t.mobileNumber}
          type="tel"
          prefix="+91"
          value={mobile}
          onChange={(v) => {
            const sanitized = v.replace(/\D/g, '').slice(0, 10);
            setMobile(sanitized);
            setMobileError('');
          }}
          placeholder="9876543210"
          required
          inputMode="numeric"
          maxLength={10}
          error={mobileError}
          autoComplete="tel-national"
          hint={t.mobileHintOtp || 'Enter your 10-digit mobile number'}
        />

        <button
          type="submit"
          disabled={isLoading || cleanNumber(mobile).length !== 10}
          className="w-full flex items-center justify-center gap-2 rounded-lg bg-[#087F6D] hover:bg-[#073B3A] text-white font-semibold text-sm py-3 transition-all disabled:opacity-60 disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-[#087F6D] focus-visible:outline-offset-2"
        >
          {isLoading ? (
            <>
              <RotateCw className="w-4 h-4 animate-spin" />
              <span>{t.sendingOtp}</span>
            </>
          ) : (
            <>
              <span>{t.sendOtpBtn}</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>

        <button
          type="button"
          onClick={onBack}
          className="w-full flex items-center justify-center gap-1.5 text-sm text-[#64748B] dark:text-[#7B9EA8] hover:text-[#087F6D] dark:hover:text-[#4FD1C5] transition-colors py-1"
        >
          <ChevronLeft className="w-4 h-4" />
          {t.backToLogin}
        </button>
      </form>
    );
  }

  // ── Step 2: Verify OTP ────────────────────────────────────────────────────
  const digits = cleanNumber(mobile);

  return (
    <form onSubmit={handleVerify} className="space-y-5" noValidate>
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="text-base font-bold text-[#17324D] dark:text-[#D1E8E2]">{t.enterOtpTitle}</h3>
          <p className="text-sm text-[#64748B] dark:text-[#7B9EA8] mt-0.5">
            OTP sent to <strong className="text-[#17324D] dark:text-[#D1E8E2]">+91 {digits.slice(0, 5)} {digits.slice(5)}</strong>
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

      {/* ── Demo Mode Code Helper (visible when demoOtp is returned in Demo Mode) ── */}
      {demoOtp && (
        <div className="rounded-xl bg-[#EAF7F2] dark:bg-[#073B3A]/60 border border-[#087F6D]/30 p-3.5 space-y-2 animate-fadeIn">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-[#087F6D] dark:text-[#4FD1C5] flex items-center gap-1.5">
              <KeyRound className="w-4 h-4" />
              🔑 Demo Verification Code
            </span>
            <span className="text-[11px] font-semibold text-[#087F6D]/80 dark:text-[#4FD1C5]/80">
              "Zero-Credit Simulation"
            </span>
          </div>
          <div className="flex items-center justify-between bg-white dark:bg-[#0A2020] rounded-lg border border-[#DDE8E4] dark:border-[#1A3A3A] px-3.5 py-2 shadow-2xs">
            <span className="text-base font-mono font-black tracking-widest text-[#17324D] dark:text-[#E2EEF4]">
              {demoOtp}
            </span>
            <button
              type="button"
              onClick={() => {
                setOtp(demoOtp.split(''));
                setOtpError('');
              }}
              className="px-3 py-1.5 rounded-lg bg-[#087F6D] hover:bg-[#073B3A] text-white text-xs font-bold transition-all cursor-pointer shadow-2xs hover:scale-105 active:scale-95"
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
        <div className="flex items-center gap-2 justify-center" role="group" aria-label={t.enterOtpTitle}>
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
            <span>{t.verifying}</span>
          </>
        ) : (
          <>
            <span>{t.verifyOtpBtn}</span>
            <ArrowRight className="w-4 h-4" />
          </>
        )}
      </button>

      <div className="flex items-center justify-between text-sm pt-1">
        <button
          type="button"
          onClick={() => {
            setStep('send');
            setOtp(Array(OTP_LENGTH).fill(''));
            setOtpError('');
            setAlert(null);
          }}
          className="flex items-center gap-1 text-[#64748B] dark:text-[#7B9EA8] hover:text-[#087F6D] dark:hover:text-[#4FD1C5] transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          {t.changeNumber || 'Change Number'}
        </button>

        <div className="text-right">
          {cooldown > 0 ? (
            <span className="text-xs font-mono text-[#64748B] dark:text-[#7B9EA8]">
              Resend in <strong className="text-[#087F6D] dark:text-[#4FD1C5]">{formattedCooldown}</strong>
            </span>
          ) : (
            <button
              type="button"
              onClick={handleResend}
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
};
