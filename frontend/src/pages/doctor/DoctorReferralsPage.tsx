// HealthSure — Doctor Referral Review & Acceptance Page (Fully Localized)
// frontend/src/pages/doctor/DoctorReferralsPage.tsx

import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  RotateCw,
} from 'lucide-react';
import type { Referral } from '../../types/patient';
import { doctorService } from '../../services/doctorService';
import { useTranslation } from '../../lib/i18n/useTranslation';

export const DoctorReferralsPage: React.FC = () => {
  const t = useTranslation();
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [acceptingId, setAcceptingId] = useState<string | null>(null);

  const loadData = async () => {
    const data = await doctorService.getReferrals();
    setReferrals(data);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAccept = async (refId: string) => {
    setAcceptingId(refId);
    await doctorService.acceptReferral(refId);
    setAcceptingId(null);
    loadData();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="border-b border-[#DDE8E4] dark:border-[#1A3A3A] pb-4">
        <h1 className="text-xl sm:text-2xl font-bold text-[#17324D] dark:text-[#E2EEF4]">
          {t.incomingReferrals}
        </h1>
        <p className="text-xs sm:text-sm text-[#64748B] dark:text-[#7B9EA8] mt-0.5">
          {t.referralsPageDesc}
        </p>
      </div>

      {/* Referrals List */}
      <div className="space-y-4">
        {referrals.map((referral) => {
          const isAccepted = referral.status === 'hospital_accepted';
          return (
            <div
              key={referral.id}
              className="p-5 rounded-2xl border border-[#DDE8E4] dark:border-[#1A3A3A] bg-white dark:bg-[#0A2020] space-y-4 shadow-xs"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#DDE8E4]/60 dark:border-[#1A3A3A] pb-3">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-xs px-2.5 py-1 rounded-lg bg-[#EAF7F2] dark:bg-[#073B3A] text-[#087F6D] dark:text-[#4FD1C5]">
                    {referral.id}
                  </span>
                  <span className="text-xs text-[#64748B] dark:text-[#7B9EA8]">
                    Date: {referral.referralDate}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {referral.priority === 'Urgent' && (
                    <span className="px-2.5 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 font-bold text-[10px]">
                      {t.urgentPriority}
                    </span>
                  )}
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      isAccepted
                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                        : 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                    }`}
                  >
                    {isAccepted ? t.statusHospitalAccepted : t.statusPending}
                  </span>
                </div>
              </div>

              {/* Inter-facility Transfer Route */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-[#F5F9F7] dark:bg-[#0F2929] p-3.5 rounded-xl border border-[#DDE8E4]/60 dark:border-[#1A3A3A]">
                <div>
                  <span className="text-[10px] text-[#64748B] block">{t.originFacility}:</span>
                  <strong className="text-[#17324D] dark:text-[#E2EEF4]">{referral.fromFacility}</strong>
                  <div className="text-[#64748B] text-[11px]">{t.doctorName}: {referral.referringDoctor}</div>
                </div>

                <div>
                  <span className="text-[10px] text-[#64748B] block">{t.destinationFacility}:</span>
                  <strong className="text-[#087F6D] dark:text-[#4FD1C5]">{referral.toFacility}</strong>
                  <div className="text-[#64748B] text-[11px]">{t.specialityLabel}: {referral.department}</div>
                </div>
              </div>

              {/* Clinical Justification */}
              <div className="text-xs space-y-1">
                <span className="font-bold text-[#17324D] dark:text-[#E2EEF4]">{t.reasonSymptomsLabel}:</span>
                <p className="text-[#64748B] dark:text-[#7B9EA8] leading-relaxed bg-white dark:bg-[#0A2020] p-3 rounded-xl border border-[#DDE8E4]/50 dark:border-[#1A3A3A]">
                  {referral.clinicalReason}
                </p>
              </div>

              {/* Actions */}
              <div className="pt-2 flex items-center justify-between gap-3">
                <div className="text-xs text-[#64748B] dark:text-[#7B9EA8]">
                  {t.step4Title}
                </div>

                {!isAccepted ? (
                  <button
                    type="button"
                    disabled={acceptingId === referral.id}
                    onClick={() => handleAccept(referral.id)}
                    className="px-4 py-2 rounded-xl bg-[#087F6D] hover:bg-[#073B3A] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    {acceptingId === referral.id ? (
                      <>
                        <RotateCw className="w-3.5 h-3.5 animate-spin" />
                        <span>{t.confirmBtn}…</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>{t.acceptReferral}</span>
                      </>
                    )}
                  </button>
                ) : (
                  <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{t.statusHospitalAccepted}</span>
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
