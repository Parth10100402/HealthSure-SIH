// HealthSure — Referral Tracking Page (Fully Localized)
// frontend/src/pages/patient/ReferralsPage.tsx

import React, { useState, useEffect } from 'react';
import { Share2, ShieldCheck } from 'lucide-react';
import type { Referral } from '../../types/patient';
import { patientService } from '../../services/patientService';
import { useTranslation } from '../../lib/i18n/useTranslation';
import { ReferralCard } from '../../components/patient/ReferralCard';
import { EmptyState } from '../../components/patient/EmptyState';

export const ReferralsPage: React.FC = () => {
  const t = useTranslation();
  const [referrals, setReferrals] = useState<Referral[]>([]);

  useEffect(() => {
    patientService.getReferrals().then((data) => {
      setReferrals(data);
    });
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Page Header */}
      <div className="space-y-3 border-b border-[#DDE8E4] dark:border-[#1A3A3A] pb-4">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#EAF7F2] dark:bg-[#073B3A] text-[#087F6D] dark:text-[#4FD1C5] text-xs font-bold">
          <Share2 className="w-3.5 h-3.5" />
          {t.navReferrals}
        </div>
        <h1 className="text-xl sm:text-2xl font-bold text-[#17324D] dark:text-[#E2EEF4]">
          {t.referralsPageTitle}
        </h1>
        <p className="text-xs sm:text-sm text-[#64748B] dark:text-[#7B9EA8]">
          {t.referralsPageDesc}
        </p>
      </div>

      {/* Referral Explainer Card */}
      <div className="rounded-2xl bg-white dark:bg-[#0A2020] border border-[#DDE8E4] dark:border-[#1A3A3A] p-4 sm:p-5 space-y-3 text-xs shadow-xs">
        <div className="flex items-center gap-2 font-bold text-[#073B3A] dark:text-[#4FD1C5]">
          <ShieldCheck className="w-4 h-4" />
          <span>{t.appName} • {t.referralsPageTitle}</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-[#64748B] dark:text-[#7B9EA8]">
          <div className="p-3 rounded-xl bg-[#F5F9F7] dark:bg-[#0F2929] border border-[#DDE8E4] dark:border-[#1A3A3A]">
            <strong className="text-[#17324D] dark:text-[#E2EEF4] block mb-1">{t.step1Title}</strong>
            <span>{t.step2Title}</span>
          </div>
          <div className="p-3 rounded-xl bg-[#F5F9F7] dark:bg-[#0F2929] border border-[#DDE8E4] dark:border-[#1A3A3A]">
            <strong className="text-[#17324D] dark:text-[#E2EEF4] block mb-1">{t.step3Title}</strong>
            <span>{t.step4Title}</span>
          </div>
          <div className="p-3 rounded-xl bg-[#F5F9F7] dark:bg-[#0F2929] border border-[#DDE8E4] dark:border-[#1A3A3A]">
            <strong className="text-[#17324D] dark:text-[#E2EEF4] block mb-1">{t.step6Title}</strong>
            <span>{t.step7Title}</span>
          </div>
        </div>
      </div>

      {/* Active Referrals List */}
      {referrals.length === 0 ? (
        <EmptyState
          icon={Share2}
          title={t.noData}
          description={t.emptyDesc}
        />
      ) : (
        <div className="space-y-6">
          {referrals.map((referral) => (
            <ReferralCard key={referral.id} referral={referral} />
          ))}
        </div>
      )}
    </div>
  );
};
