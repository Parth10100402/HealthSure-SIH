// HealthSure — Hospital Referral Intake Desk Page (Fully Localized)
// frontend/src/pages/hospital/HospitalReferralsPage.tsx

import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  RotateCw,
  Search,
} from 'lucide-react';
import type { HospitalReferralEntry } from '../../types/hospital';
import { hospitalService } from '../../services/hospitalService';
import { useTranslation } from '../../lib/i18n/useTranslation';

export const HospitalReferralsPage: React.FC = () => {
  const t = useTranslation();
  const [referrals, setReferrals] = useState<HospitalReferralEntry[]>([]);
  const [statusFilter, setStatusFilter] = useState<'all' | 'new' | 'accepted' | 'scheduled'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [acceptingId, setAcceptingId] = useState<string | null>(null);

  const loadData = async () => {
    const data = await hospitalService.getReferrals();
    setReferrals(data);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAccept = async (refId: string) => {
    setAcceptingId(refId);
    await hospitalService.acceptReferral(refId, 'Dr. Ananya Mehta (MD, DM)');
    setAcceptingId(null);
    loadData();
  };

  const filtered = referrals.filter((r) => {
    const matchesStatus = statusFilter === 'all' ? true : r.status === statusFilter;
    const matchesSearch =
      r.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.referringPHC.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="border-b border-[#DDE8E4] dark:border-[#1A3A3A] pb-4">
        <h1 className="text-xl sm:text-2xl font-bold text-[#17324D] dark:text-[#E2EEF4]">
          {t.intakeDesk}
        </h1>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Status Tabs */}
        <div className="flex rounded-xl border border-[#DDE8E4] dark:border-[#1A3A3A] p-1 bg-white dark:bg-[#0A2020] gap-1 self-start">
          {[
            { id: 'all', label: `${t.tabAll} (${referrals.length})` },
            { id: 'new', label: `${t.statusPending} (${referrals.filter((r) => r.status === 'new').length})` },
            { id: 'accepted', label: t.statusHospitalAccepted },
            { id: 'scheduled', label: t.statusScheduled },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setStatusFilter(tab.id as typeof statusFilter)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                statusFilter === tab.id
                  ? 'bg-[#087F6D] text-white shadow-xs'
                  : 'text-[#64748B] dark:text-[#7B9EA8]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-[#64748B] absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder={t.searchPlaceholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 pr-4 py-1.5 text-xs rounded-xl border border-[#DDE8E4] dark:border-[#1A3A3A] bg-white dark:bg-[#0A2020] text-[#17324D] dark:text-[#E2EEF4] focus:outline-none focus:ring-2 focus:ring-[#087F6D]"
          />
        </div>
      </div>

      {/* Referrals Cards Grid */}
      <div className="space-y-4">
        {filtered.map((referral) => {
          const isAccepted = referral.status === 'accepted' || referral.status === 'scheduled';
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
                    Date: {referral.dateReceived}
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

              {/* Patient Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-[#F5F9F7] dark:bg-[#0F2929] p-3.5 rounded-xl border border-[#DDE8E4]/60 dark:border-[#1A3A3A]">
                <div>
                  <span className="text-[10px] text-[#64748B] block">{t.fullName}:</span>
                  <strong className="text-[#17324D] dark:text-[#E2EEF4] text-sm">{referral.patientName}</strong>
                  <div className="text-[#64748B] text-[11px]">{referral.patientAge}y / {referral.patientGender} • {referral.patientVillage}</div>
                </div>

                <div>
                  <span className="text-[10px] text-[#64748B] block">{t.originFacility}:</span>
                  <strong className="text-[#087F6D] dark:text-[#4FD1C5]">{referral.referringPHC}</strong>
                  <div className="text-[#64748B] text-[11px]">{t.doctorName}: {referral.referringDoctor}</div>
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
                  {t.specialityLabel}: <strong>{referral.department}</strong>
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
