// HealthSure — Direct IVR Call Section Component (Clean & Simple)
// frontend/src/components/patient/CallHealthSureCard.tsx

import React, { useState } from 'react';
import { PhoneForwarded, WifiOff, Clock, Copy, Check } from 'lucide-react';
import { HEALTHSURE_IVR_NUMBER, HEALTHSURE_IVR_TEL } from '../../config/constants';

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
    window.location.href = HEALTHSURE_IVR_TEL;
    setTimeout(() => setIsCalling(false), 2500);
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
      aria-label="Direct IVR Hotline"
      className={`rounded-3xl border-2 border-emerald-500/30 bg-gradient-to-br from-emerald-50 via-teal-50 to-white dark:from-[#073B3A] dark:via-[#092B28] dark:to-[#0A2020] p-4 sm:p-5 shadow-sm ${className}`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Left: Info */}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-600 text-white">
              <Clock className="w-3 h-3" />
              <span>24x7 Helpline</span>
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-teal-100 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300">
              <WifiOff className="w-3 h-3" />
              <span>Works without internet</span>
            </span>
          </div>

          <h2 className="text-base sm:text-lg font-black text-[#17324D] dark:text-[#E2EEF4] tracking-tight">
            📞 Call HealthSure: <span className="font-mono text-emerald-700 dark:text-emerald-400">{HEALTHSURE_IVR_NUMBER}</span>
          </h2>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <a
            href={HEALTHSURE_IVR_TEL}
            onClick={handleCall}
            role="button"
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-sm px-5 py-3 shadow-md transition-all active:scale-98 cursor-pointer"
          >
            <PhoneForwarded className="w-4 h-4" />
            <span>{isCalling ? 'Connecting…' : 'Call HealthSure'}</span>
          </a>

          <button
            type="button"
            onClick={handleCopy}
            className="hidden sm:inline-flex items-center gap-1 px-3 py-3 rounded-xl border border-emerald-300 dark:border-emerald-700/50 bg-white dark:bg-[#072424] text-xs font-semibold text-emerald-800 dark:text-emerald-300 hover:bg-emerald-50 transition-colors cursor-pointer"
            title="Copy phone number"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>
      </div>
    </section>
  );
};
