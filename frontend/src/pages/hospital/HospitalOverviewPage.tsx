// HealthSure — Hospital Staff Overview Dashboard (Fully Localized)
// frontend/src/pages/hospital/HospitalOverviewPage.tsx

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  Share2,
  Activity,
  Stethoscope,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { mockHospitalProfile } from '../../data/hospitalMockData';
import { hospitalService } from '../../services/hospitalService';
import { useTranslation } from '../../lib/i18n/useTranslation';
import type { HospitalReferralEntry } from '../../types/hospital';

export const HospitalOverviewPage: React.FC = () => {
  const t = useTranslation();
  const [referrals, setReferrals] = useState<HospitalReferralEntry[]>([]);

  useEffect(() => {
    hospitalService.getReferrals().then(setReferrals);
  }, []);

  // Pipeline Counts
  const newReferrals = referrals.filter((r) => r.status === 'new').length;
  const acceptedReferrals = referrals.filter((r) => r.status === 'accepted').length;
  const scheduledReferrals = referrals.filter((r) => r.status === 'scheduled').length;
  const completedReferrals = referrals.filter((r) => r.status === 'consultation_done').length;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* ── Top Facility Banner ───────────────────────────────────────────── */}
      <section className="rounded-2xl bg-gradient-to-r from-[#073B3A] via-[#094840] to-[#0D5950] text-white p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-white/15 text-white text-xs font-semibold backdrop-blur-xs">
              <ShieldCheck className="w-3.5 h-3.5 text-[#4FD1C5]" />
              <span>{t.idLabel}: {mockHospitalProfile.id} • {mockHospitalProfile.district}</span>
            </div>

            <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
              {mockHospitalProfile.name}
            </h1>

            <p className="text-xs sm:text-sm text-[#A7D9CE]">
              {t.hospitalPortalTitle} • <strong>{mockHospitalProfile.assignedPHCs.length} {t.registeredPHC}</strong>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/hospital/referrals"
              className="inline-flex items-center gap-2 rounded-xl bg-[#4FD1C5] hover:bg-[#38b2ac] text-[#073B3A] px-4 py-2 text-xs font-bold transition-all shadow-xs"
            >
              <Share2 className="w-4 h-4" />
              <span>{t.intakeDesk} ({newReferrals})</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ── 4 Key Operations Metrics ─────────────────────────────────────── */}
      <section aria-label="Hospital Operations Metrics" className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Link
          to="/hospital/appointments"
          className="p-4 rounded-2xl bg-white dark:bg-[#0A2020] border border-[#DDE8E4] dark:border-[#1A3A3A] space-y-1 hover:border-[#087F6D] transition-colors shadow-xs group"
        >
          <div className="flex items-center justify-between text-xs text-[#64748B] dark:text-[#7B9EA8]">
            <span className="font-bold uppercase tracking-wider text-[10px]">{t.navAppointments}</span>
            <Calendar className="w-4 h-4 text-[#087F6D] group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-extrabold text-[#17324D] dark:text-[#E2EEF4]">42</div>
          <div className="text-[11px] text-[#087F6D] dark:text-[#4FD1C5] font-semibold">
            {t.opdCapacity}
          </div>
        </Link>

        <Link
          to="/hospital/referrals"
          className="p-4 rounded-2xl bg-white dark:bg-[#0A2020] border border-[#DDE8E4] dark:border-[#1A3A3A] space-y-1 hover:border-amber-500 transition-colors shadow-xs group"
        >
          <div className="flex items-center justify-between text-xs text-[#64748B] dark:text-[#7B9EA8]">
            <span className="font-bold uppercase tracking-wider text-[10px]">{t.pendingReferrals}</span>
            <Share2 className="w-4 h-4 text-amber-600 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-extrabold text-[#17324D] dark:text-[#E2EEF4]">11</div>
          <div className="text-[11px] text-amber-700 dark:text-amber-400 font-semibold">
            {t.registeredPHC}
          </div>
        </Link>

        <Link
          to="/hospital/capacity"
          className="p-4 rounded-2xl bg-white dark:bg-[#0A2020] border border-[#DDE8E4] dark:border-[#1A3A3A] space-y-1 hover:border-teal-500 transition-colors shadow-xs group"
        >
          <div className="flex items-center justify-between text-xs text-[#64748B] dark:text-[#7B9EA8]">
            <span className="font-bold uppercase tracking-wider text-[10px]">{t.occupiedBeds}</span>
            <Stethoscope className="w-4 h-4 text-teal-600 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-extrabold text-[#17324D] dark:text-[#E2EEF4]">
            {mockHospitalProfile.occupiedBeds} / {mockHospitalProfile.totalBeds}
          </div>
          <div className="text-[11px] text-teal-700 dark:text-teal-400 font-semibold">
            {mockHospitalProfile.totalBeds - mockHospitalProfile.occupiedBeds} Beds Vacant
          </div>
        </Link>

        <Link
          to="/hospital/outreach"
          className="p-4 rounded-2xl bg-white dark:bg-[#0A2020] border border-[#DDE8E4] dark:border-[#1A3A3A] space-y-1 hover:border-blue-500 transition-colors shadow-xs group"
        >
          <div className="flex items-center justify-between text-xs text-[#64748B] dark:text-[#7B9EA8]">
            <span className="font-bold uppercase tracking-wider text-[10px]">{t.navOutreach}</span>
            <Activity className="w-4 h-4 text-blue-600 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-extrabold text-[#17324D] dark:text-[#E2EEF4]">3</div>
          <div className="text-[11px] text-blue-600 dark:text-blue-400 font-semibold">
            {t.phcKhedVenue}
          </div>
        </Link>
      </section>

      {/* ── 4-Stage Referral Intake Pipeline ───────────────────────────────── */}
      <section aria-label="Referral Intake Desk" className="rounded-2xl border border-[#DDE8E4] dark:border-[#1A3A3A] bg-white dark:bg-[#0A2020] p-5 sm:p-6 space-y-4 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h2 className="text-base font-bold text-[#17324D] dark:text-[#E2EEF4]">
              {t.intakeDesk}
            </h2>
            <p className="text-xs text-[#64748B] dark:text-[#7B9EA8]">
              {t.referralsPageDesc}
            </p>
          </div>

          <Link
            to="/hospital/referrals"
            className="text-xs font-bold text-[#087F6D] dark:text-[#4FD1C5] hover:underline flex items-center gap-1"
          >
            <span>{t.viewAll}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 space-y-1">
            <div className="text-xs font-bold text-amber-800 dark:text-amber-300">{t.statusPending}</div>
            <div className="text-xl font-extrabold text-amber-900 dark:text-amber-200">{newReferrals}</div>
            <div className="text-[10px] text-amber-700 dark:text-amber-400">{t.urgentPriority}</div>
          </div>

          <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 space-y-1">
            <div className="text-xs font-bold text-emerald-800 dark:text-emerald-300">{t.statusHospitalAccepted}</div>
            <div className="text-xl font-extrabold text-emerald-900 dark:text-emerald-200">{acceptedReferrals}</div>
            <div className="text-[10px] text-emerald-700 dark:text-emerald-400">{t.statusConfirmed}</div>
          </div>

          <div className="p-3.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 space-y-1">
            <div className="text-xs font-bold text-blue-800 dark:text-blue-300">{t.statusScheduled}</div>
            <div className="text-xl font-extrabold text-blue-900 dark:text-blue-200">{scheduledReferrals}</div>
            <div className="text-[10px] text-blue-700 dark:text-blue-400">{t.token}</div>
          </div>

          <div className="p-3.5 rounded-xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-900/60 space-y-1">
            <div className="text-xs font-bold text-teal-800 dark:text-teal-300">{t.statusCompleted}</div>
            <div className="text-xl font-extrabold text-teal-900 dark:text-teal-200">{completedReferrals}</div>
            <div className="text-[10px] text-teal-700 dark:text-teal-400">{t.step7Title}</div>
          </div>
        </div>
      </section>
    </div>
  );
};
