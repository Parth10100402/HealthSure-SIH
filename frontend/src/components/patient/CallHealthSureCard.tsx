// HealthSure — Direct IVR Call Section Component
// frontend/src/components/patient/CallHealthSureCard.tsx

import React, { useState } from 'react';
import { PhoneCall, PhoneForwarded, WifiOff, Clock, Copy, Check } from 'lucide-react';
import { HEALTHSURE_IVR_CONFIG, HEALTHSURE_IVR_NUMBER, HEALTHSURE_IVR_TEL } from '../../config/constants';

interface CallHealthSureCardProps {
  className?: string;
}

export const CallHealthSureCard: React.FC<CallHealthSureCardProps> = ({
  className = '',
}) => {
  const [isCalling, setIsCalling] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCall = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsCalling(true);

    // Direct native dialer trigger
    window.location.href = HEALTHSURE_IVR_TEL;

    // Reset indicator after a short delay
    setTimeout(() => {
      setIsCalling(false);
    }, 2500);
  };

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(HEALTHSURE_IVR_NUMBER);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  return (
    <section
      aria-label="Direct IVR Emergency & Accessibility Hotline"
      className={`rounded-2xl border border-emerald-200 dark:border-[#087F6D]/40 bg-gradient-to-br from-[#EAF7F2] via-[#F4FAF7] to-white dark:from-[#073B3A]/70 dark:via-[#092B28]/60 dark:to-[#0A2020] p-5 sm:p-6 shadow-xs relative overflow-hidden transition-all ${className}`}
    >
      {/* Decorative background glow */}
      <div
        className="absolute -right-10 -bottom-10 w-40 h-40 bg-[#087F6D]/10 dark:bg-[#4FD1C5]/5 rounded-full blur-2xl pointer-events-none"
        aria-hidden="true"
      />

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 relative z-10">
        {/* Left: Info & Badges */}
        <div className="space-y-3 max-w-2xl">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-[#087F6D] text-white shadow-xs">
              <PhoneCall className="w-3.5 h-3.5" />
              <span>{HEALTHSURE_IVR_CONFIG.TITLE}</span>
            </span>

            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100/80 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300/60 dark:border-emerald-800/60">
              <Clock className="w-3 h-3 text-[#087F6D] dark:text-[#4FD1C5]" />
              <span>{HEALTHSURE_IVR_CONFIG.BADGE_24X7}</span>
            </span>

            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-teal-100/70 dark:bg-teal-950/50 text-teal-800 dark:text-teal-300 border border-teal-300/50 dark:border-teal-800/50">
              <WifiOff className="w-3 h-3 text-[#087F6D] dark:text-[#4FD1C5]" />
              <span>{HEALTHSURE_IVR_CONFIG.BADGE_OFFLINE}</span>
            </span>
          </div>

          <div>
            <h2 className="text-lg sm:text-xl font-bold text-[#17324D] dark:text-[#E2EEF4] tracking-tight">
              📞 {HEALTHSURE_IVR_CONFIG.TITLE} • <span className="text-[#087F6D] dark:text-[#4FD1C5] font-mono">{HEALTHSURE_IVR_NUMBER}</span>
            </h2>
            <p className="text-xs sm:text-sm text-[#4A6375] dark:text-[#A7D9CE] mt-1 font-medium">
              {HEALTHSURE_IVR_CONFIG.DESCRIPTION}
            </p>
          </div>
        </div>

        {/* Right: Actions & Calling Status */}
        <div className="flex flex-col sm:flex-row lg:flex-col items-start sm:items-center lg:items-end gap-2.5 shrink-0">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            {/* Primary Call Button */}
            <a
              href={HEALTHSURE_IVR_TEL}
              onClick={handleCall}
              role="button"
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2.5 rounded-xl bg-[#087F6D] hover:bg-[#073B3A] dark:hover:bg-[#099984] text-white font-bold text-sm px-6 py-3.5 shadow-md shadow-[#087F6D]/20 hover:shadow-lg transition-all active:scale-98 focus-visible:outline-2 focus-visible:outline-[#087F6D] focus-visible:outline-offset-2 cursor-pointer group"
            >
              <PhoneForwarded className="w-4 h-4 text-[#A7D9CE] group-hover:animate-bounce" />
              <span>{isCalling ? HEALTHSURE_IVR_CONFIG.CALLING_FEEDBACK : HEALTHSURE_IVR_CONFIG.CALL_ACTION_LABEL}</span>
            </a>

            {/* Desktop Copy Button */}
            <button
              type="button"
              onClick={handleCopy}
              title="Copy phone number to clipboard"
              aria-label="Copy phone number"
              className="inline-flex items-center justify-center p-3.5 rounded-xl border border-[#DDE8E4] dark:border-[#1A3A3A] bg-white dark:bg-[#0A2020] text-[#17324D] dark:text-[#D1E8E2] hover:bg-[#EAF7F2] dark:hover:bg-[#0F2929] hover:border-[#087F6D] transition-colors focus-visible:outline-2 focus-visible:outline-[#087F6D]"
            >
              {copied ? (
                <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              ) : (
                <Copy className="w-4 h-4 text-[#64748B] dark:text-[#7B9EA8]" />
              )}
            </button>
          </div>

          {/* Direct status indicator */}
          <div className="text-[11px] text-[#64748B] dark:text-[#7B9EA8] flex items-center gap-1.5 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            {isCalling ? (
              <span className="font-bold text-[#087F6D] dark:text-[#4FD1C5] animate-pulse">
                {HEALTHSURE_IVR_CONFIG.CALLING_FEEDBACK}
              </span>
            ) : copied ? (
              <span className="font-bold text-emerald-600 dark:text-emerald-400">
                Number copied: {HEALTHSURE_IVR_NUMBER}
              </span>
            ) : (
              <span>Toll-Free • Instant Exotel Voice Bridge</span>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
