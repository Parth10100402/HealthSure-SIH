// HealthSure — Referral Tracking Page
// frontend/src/pages/patient/ReferralsPage.tsx

import React, { useState, useEffect } from 'react';
import { Share2 } from 'lucide-react';
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
      <div className="border-b border-[#DDE8E4] dark:border-[#1A3A3A] pb-4">
        <h1 className="text-xl sm:text-2xl font-bold text-[#17324D] dark:text-[#E2EEF4]">
          {t.referralsPageTitle}
        </h1>
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
