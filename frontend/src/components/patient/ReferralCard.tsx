// HealthSure — Referral Timeline & Referral Card Components (Fully Localized)
// frontend/src/components/patient/ReferralCard.tsx

import React, { useState } from 'react';
import {
  CheckCircle2,
  ArrowRight,
  QrCode,
  X,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Referral, ReferralTimelineStep } from '../../types/patient';
import { StatusBadge } from './StatusBadge';
import { useTranslation } from '../../lib/i18n/useTranslation';

export const ReferralTimeline: React.FC<{ timeline: ReferralTimelineStep[] }> = ({ timeline }) => {
  const t = useTranslation();

  return (
    <div className="space-y-4 py-2">
      <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2.5 before:bottom-2.5 before:w-0.5 before:bg-[#DDE8E4] dark:before:bg-[#1A3A3A]">
        {timeline.map((step) => {
          const isCompleted = step.status === 'completed';
          const isCurrent = step.status === 'current';

          return (
            <div key={step.step} className="relative group">
              {/* Step indicator dot */}
              <div
                className={`absolute -left-6 top-0.5 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold border-2 transition-all ${
                  isCompleted
                    ? 'bg-[#087F6D] border-[#087F6D] text-white'
                    : isCurrent
                    ? 'bg-[#EAF7F2] border-[#087F6D] text-[#087F6D] dark:bg-[#073B3A] dark:text-[#4FD1C5] ring-4 ring-[#087F6D]/20 animate-pulse'
                    : 'bg-white dark:bg-[#0A2020] border-[#DDE8E4] dark:border-[#1A3A3A] text-[#64748B]'
                }`}
              >
                {isCompleted ? <CheckCircle2 className="w-3.5 h-3.5" /> : step.step}
              </div>

              {/* Step content */}
              <div
                className={`p-3.5 rounded-xl border transition-all ${
                  isCurrent
                    ? 'border-[#087F6D]/40 bg-[#EAF7F2]/50 dark:bg-[#073B3A]/30 shadow-xs'
                    : 'border-transparent bg-[#F5F9F7]/40 dark:bg-[#0F2929]/30'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <h5
                    className={`text-xs sm:text-sm font-bold ${
                      isCurrent
                        ? 'text-[#087F6D] dark:text-[#4FD1C5]'
                        : isCompleted
                        ? 'text-[#17324D] dark:text-[#E2EEF4]'
                        : 'text-[#64748B] dark:text-[#7B9EA8]'
                    }`}
                  >
                    {step.label}
                  </h5>

                  {isCurrent && (
                    <span className="px-2 py-0.5 rounded-full bg-[#087F6D] text-white text-[10px] font-bold">
                      {t.statusHospitalAccepted}
                    </span>
                  )}
                </div>

                <p className="text-xs text-[#64748B] dark:text-[#7B9EA8] mt-1 leading-relaxed">
                  {step.description}
                </p>

                {(step.date || step.facility) && (
                  <div className="flex items-center gap-3 text-[11px] text-[#64748B] dark:text-[#7B9EA8] mt-2 pt-1.5 border-t border-[#DDE8E4]/40 dark:border-[#1A3A3A]">
                    {step.date && <span>📅 {step.date}</span>}
                    {step.facility && <span>🏥 {step.facility}</span>}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const ReferralCard: React.FC<{ referral: Referral }> = ({ referral }) => {
  const t = useTranslation();
  const [qrModalOpen, setQrModalOpen] = useState(false);

  return (
    <>
      <div className="rounded-2xl border border-[#DDE8E4] dark:border-[#1A3A3A] bg-white dark:bg-[#0A2020] p-5 sm:p-6 space-y-5 shadow-xs">
        {/* Referral Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#DDE8E4] dark:border-[#1A3A3A] pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-[#087F6D] dark:text-[#4FD1C5] bg-[#EAF7F2] dark:bg-[#073B3A]/60 px-2.5 py-1 rounded-lg border border-[#087F6D]/20">
                {referral.id}
              </span>
              <StatusBadge status={referral.priority.toLowerCase()} label={`${t.referralPriority}: ${referral.priority === 'Urgent' ? t.urgentPriority : t.normalPriority}`} />
              <StatusBadge status="confirmed" label={t.statusHospitalAccepted} />
            </div>
            <h3 className="text-lg font-bold text-[#17324D] dark:text-[#E2EEF4] mt-2">
              {referral.department} {t.navReferrals} • {referral.fromFacility} → {referral.toFacility}
            </h3>
            <p className="text-xs text-[#64748B] dark:text-[#7B9EA8] mt-0.5">
              {t.step1Title} • {referral.referralDate} by {referral.referringDoctor}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setQrModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[#DDE8E4] dark:border-[#1A3A3A] bg-[#F5F9F7] dark:bg-[#0F2929] hover:border-[#087F6D] text-xs font-semibold text-[#17324D] dark:text-[#D1E8E2] transition-colors cursor-pointer"
            >
              <QrCode className="w-4 h-4 text-[#087F6D]" />
              <span>{t.digitalPass}</span>
            </button>
          </div>
        </div>

        {/* ── PROMINENT NEXT ACTION CARD ───────────────────────────────────────── */}
        <div className="p-4 rounded-xl bg-gradient-to-r from-[#EAF7F2] to-emerald-50 dark:from-[#073B3A]/60 dark:to-[#0A2020] border border-[#087F6D]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
          <div className="space-y-0.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#087F6D] dark:text-[#4FD1C5] uppercase tracking-wider">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              {t.step4Title}
            </div>
            <p className="text-sm font-bold text-[#17324D] dark:text-[#E2EEF4]">
              {referral.nextActionLabel}
            </p>
            <p className="text-xs text-[#64748B] dark:text-[#7B9EA8]">
              {t.step5Title} • {t.token}: DH-CARD-14
            </p>
          </div>

          <Link
            to={referral.nextActionRoute}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#087F6D] hover:bg-[#073B3A] text-white text-xs font-bold transition-all shadow-xs shrink-0"
          >
            <span>{t.tabUpcoming}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* ── 7-STEP TIMELINE JOURNEY ────────────────────────────────────────── */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold text-[#17324D] dark:text-[#E2EEF4] uppercase tracking-wider">
            {t.referralsPageTitle} (7-Step Clinical Journey)
          </h4>
          <ReferralTimeline timeline={referral.timeline} />
        </div>
      </div>

      {/* Digital QR Modal */}
      {qrModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white dark:bg-[#0A2020] rounded-2xl border border-[#DDE8E4] dark:border-[#1A3A3A] p-6 space-y-4 shadow-2xl text-center animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-[#DDE8E4] dark:border-[#1A3A3A] pb-3">
              <h3 className="text-base font-bold text-[#17324D] dark:text-[#E2EEF4]">
                {t.digitalPass}
              </h3>
              <button
                type="button"
                onClick={() => setQrModalOpen(false)}
                className="p-1 rounded-lg text-[#64748B] hover:text-[#17324D] dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 bg-white rounded-xl border border-[#DDE8E4] inline-block mx-auto shadow-inner">
              <QrCode className="w-36 h-36 text-[#073B3A]" />
            </div>

            <div className="space-y-1">
              <div className="font-mono text-sm font-bold text-[#087F6D]">{referral.id}</div>
              <p className="text-xs text-[#64748B] dark:text-[#7B9EA8]">
                {t.step5Title}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setQrModalOpen(false)}
              className="w-full py-2.5 rounded-xl bg-[#087F6D] hover:bg-[#073B3A] text-white text-xs font-semibold"
            >
              {t.closeBtn}
            </button>
          </div>
        </div>
      )}
    </>
  );
};
