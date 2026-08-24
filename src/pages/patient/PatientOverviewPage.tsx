// HealthSure — Patient Overview Dashboard (Fully Localized)
// frontend/src/pages/patient/PatientOverviewPage.tsx

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  Share2,
  Clock,
  FileText,
  Video,
  ShieldCheck,
  Building2,
  ChevronRight,
  PhoneCall,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from '../../lib/i18n/useTranslation';
import { mockPatientProfile } from '../../data/patientMockData';
import { patientService } from '../../services/patientService';
import type { Appointment, Referral, FollowUp } from '../../types/patient';
import { AppointmentBookingModal } from '../../components/patient/AppointmentCard';
import { VoiceIVRModal } from '../../components/patient/VoiceIVRModal';
import { CallHealthSureCard } from '../../components/patient/CallHealthSureCard';
import { HEALTHSURE_IVR_NUMBER } from '../../config/constants';

export const PatientOverviewPage: React.FC = () => {
  const { user } = useAuth();
  const t = useTranslation();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [followUps, setFollowUps] = useState<FollowUp[]>([]);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [voiceModalOpen, setVoiceModalOpen] = useState(false);

  const patientName = user?.fullName || mockPatientProfile.fullName;

  useEffect(() => {
    Promise.all([
      patientService.getAppointments(),
      patientService.getReferrals(),
      patientService.getFollowUps(),
    ]).then(([apts, refs, fols]) => {
      setAppointments(apts);
      setReferrals(refs);
      setFollowUps(fols);
    });
  }, []);

  // Priority Single Items for scannable dashboard
  const nextAppointment = appointments.find((a) => a.status === 'confirmed') || appointments[0];
  const activeReferral = referrals[0];
  const nextFollowUp = followUps[0];

  return (
    <div className="space-y-6 max-w-6xl mx-auto animate-in fade-in duration-200">
      {/* ── A. WELCOME / PATIENT SUMMARY ───────────────────────────────────── */}
      <section
        className="rounded-2xl bg-gradient-to-r from-[#073B3A] via-[#094840] to-[#0D5950] text-white p-5 sm:p-6 shadow-md"
        aria-label="Patient Summary"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-bold backdrop-blur-xs">
              <ShieldCheck className="w-4 h-4 text-[#4FD1C5]" />
              <span>{t.idLabel}: {(user as any)?.patientId || user?.id || mockPatientProfile.id} • {(user as any)?.village || mockPatientProfile.registeredFacility}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex flex-wrap items-center gap-2 drop-shadow-xs">
              <span className="text-[#A7D9CE] font-semibold">{t.welcomeBack}</span>
              <span className="text-white font-black">{patientName}</span>
            </h1>

            <p className="text-xs sm:text-sm text-[#D1E8E2] max-w-xl font-medium">
              {t.patientSubtitle}
            </p>
          </div>

          {/* HealthSure Voice trigger pill */}
          <button
            type="button"
            onClick={() => setVoiceModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-white/15 hover:bg-white/25 border border-white/30 px-4 py-2.5 text-xs font-bold text-white transition-colors self-start md:self-auto shrink-0 cursor-pointer shadow-xs"
          >
            <PhoneCall className="w-4 h-4 text-[#4FD1C5]" />
            <span>Interactive IVR Simulator: <strong>{HEALTHSURE_IVR_NUMBER}</strong></span>
          </button>
        </div>
      </section>

      {/* ── PROMINENT DIRECT IVR HOTLINE CARD ──────────────────────────────── */}
      <CallHealthSureCard />

      {/* ── B, C, D: CORE CLINICAL SUMMARY CARDS ────────────────────────────── */}
      <section aria-label="Clinical Summary" className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* B. NEXT APPOINTMENT */}
        <div className="rounded-2xl border border-[#DDE8E4] dark:border-[#1A3A3A] bg-white dark:bg-[#0A2020] p-5 flex flex-col justify-between space-y-4 shadow-xs">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#087F6D] dark:text-[#4FD1C5] uppercase tracking-wider">
                <Calendar className="w-4 h-4" />
                <span>{t.nextAptHeading}</span>
              </div>
              <span className="px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-[11px] font-bold">
                {t.statusConfirmed}
              </span>
            </div>

            {nextAppointment ? (
              <div className="space-y-1">
                <div className="text-base font-bold text-[#17324D] dark:text-[#E2EEF4]">
                  {nextAppointment.speciality}
                </div>
                <div className="text-xs font-semibold text-[#087F6D] dark:text-[#4FD1C5]">
                  {nextAppointment.doctorName}
                </div>
                <div className="text-xs text-[#64748B] dark:text-[#7B9EA8] pt-1">
                  📅 28 Aug 2026 • 10:30 AM
                </div>
                <div className="text-xs text-[#64748B] dark:text-[#7B9EA8] flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{nextAppointment.facility}</span>
                </div>
              </div>
            ) : (
              <p className="text-xs text-[#64748B] dark:text-[#7B9EA8]">{t.noData}</p>
            )}
          </div>

          <Link
            to="/patient/appointments"
            className="inline-flex items-center justify-between text-xs font-bold text-[#087F6D] dark:text-[#4FD1C5] hover:underline pt-2 border-t border-[#DDE8E4]/60 dark:border-[#1A3A3A]"
          >
            <span>{t.tabAll}</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {/* C. ACTIVE REFERRAL */}
        <div className="rounded-2xl border border-[#DDE8E4] dark:border-[#1A3A3A] bg-white dark:bg-[#0A2020] p-5 flex flex-col justify-between space-y-4 shadow-xs">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider">
                <Share2 className="w-4 h-4" />
                <span>{t.activeReferralHeading}</span>
              </div>
              <span className="px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 text-[11px] font-bold">
                {t.statusHospitalAccepted}
              </span>
            </div>

            {activeReferral ? (
              <div className="space-y-1">
                <div className="text-base font-bold text-[#17324D] dark:text-[#E2EEF4]">
                  {activeReferral.department} {t.navReferrals}
                </div>
                <div className="text-xs text-[#64748B] dark:text-[#7B9EA8]">
                  {t.referringCentre}: <strong className="text-[#17324D] dark:text-[#E2EEF4] font-semibold">{activeReferral.fromFacility}</strong>
                </div>
                <div className="text-xs text-[#64748B] dark:text-[#7B9EA8]">
                  {t.destinationFacility}: <strong className="text-[#087F6D] dark:text-[#4FD1C5] font-semibold">{activeReferral.toFacility}</strong>
                </div>
                <div className="text-[11px] text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 px-2.5 py-1 rounded-lg mt-1 font-medium truncate">
                  {activeReferral.nextActionLabel}
                </div>
              </div>
            ) : (
              <p className="text-xs text-[#64748B] dark:text-[#7B9EA8]">{t.noData}</p>
            )}
          </div>

          <Link
            to="/patient/referrals"
            className="inline-flex items-center justify-between text-xs font-bold text-[#087F6D] dark:text-[#4FD1C5] hover:underline pt-2 border-t border-[#DDE8E4]/60 dark:border-[#1A3A3A]"
          >
            <span>{t.viewReferralTimeline}</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {/* D. NEXT FOLLOW-UP */}
        <div className="rounded-2xl border border-[#DDE8E4] dark:border-[#1A3A3A] bg-white dark:bg-[#0A2020] p-5 flex flex-col justify-between space-y-4 shadow-xs">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wider">
                <Clock className="w-4 h-4" />
                <span>{t.navFollowups}</span>
              </div>
              <span className="px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 text-[11px] font-bold">
                {t.statusDue}
              </span>
            </div>

            {nextFollowUp ? (
              <div className="space-y-1">
                <div className="text-base font-bold text-[#17324D] dark:text-[#E2EEF4]">
                  {nextFollowUp.speciality} {t.navFollowups}
                </div>
                <div className="text-xs font-semibold text-[#17324D] dark:text-[#E2EEF4]">
                  {t.assignedDoctor}: {nextFollowUp.doctorName}
                </div>
                <div className="text-xs text-[#64748B] dark:text-[#7B9EA8] pt-1 truncate">
                  🎯 {nextFollowUp.title}
                </div>
                <div className="text-xs text-[#64748B] dark:text-[#7B9EA8] flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{nextFollowUp.facility}</span>
                </div>
              </div>
            ) : (
              <p className="text-xs text-[#64748B] dark:text-[#7B9EA8]">{t.noData}</p>
            )}
          </div>

          <Link
            to="/patient/follow-ups"
            className="inline-flex items-center justify-between text-xs font-bold text-[#087F6D] dark:text-[#4FD1C5] hover:underline pt-2 border-t border-[#DDE8E4]/60 dark:border-[#1A3A3A]"
          >
            <span>{t.viewAll}</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* ── E. QUICK ACTIONS ─────────────────────────────────────────────────── */}
      <section aria-label="Quick Actions" className="space-y-3">
        <h2 className="text-sm font-bold text-[#17324D] dark:text-[#E2EEF4] uppercase tracking-wider">
          {t.appName}
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <button
            type="button"
            onClick={() => setBookingModalOpen(true)}
            className="flex flex-col items-center justify-center p-4 rounded-2xl bg-white dark:bg-[#0A2020] border border-[#DDE8E4] dark:border-[#1A3A3A] hover:border-[#087F6D] hover:bg-[#EAF7F2]/40 dark:hover:bg-[#073B3A]/30 text-center transition-all group shadow-xs cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-[#EAF7F2] dark:bg-[#073B3A] text-[#087F6D] dark:text-[#4FD1C5] flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
              <Calendar className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-[#17324D] dark:text-[#E2EEF4]">{t.quickBookApt}</span>
            <span className="text-[10px] text-[#64748B] dark:text-[#7B9EA8] mt-0.5">{t.phcKhedVenue}</span>
          </button>

          <Link
            to="/patient/referrals"
            className="flex flex-col items-center justify-center p-4 rounded-2xl bg-white dark:bg-[#0A2020] border border-[#DDE8E4] dark:border-[#1A3A3A] hover:border-[#087F6D] hover:bg-[#EAF7F2]/40 dark:hover:bg-[#073B3A]/30 text-center transition-all group shadow-xs"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
              <Share2 className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-[#17324D] dark:text-[#E2EEF4]">{t.quickTrackReferral}</span>
            <span className="text-[10px] text-[#64748B] dark:text-[#7B9EA8] mt-0.5">{t.destinationFacility}</span>
          </Link>

          <Link
            to="/patient/teleconsultation"
            className="flex flex-col items-center justify-center p-4 rounded-2xl bg-white dark:bg-[#0A2020] border border-[#DDE8E4] dark:border-[#1A3A3A] hover:border-[#087F6D] hover:bg-[#EAF7F2]/40 dark:hover:bg-[#073B3A]/30 text-center transition-all group shadow-xs"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
              <Video className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-[#17324D] dark:text-[#E2EEF4]">{t.navTeleconsult}</span>
            <span className="text-[10px] text-[#64748B] dark:text-[#7B9EA8] mt-0.5">{t.audio2gMode}</span>
          </Link>

          <Link
            to="/patient/records"
            className="flex flex-col items-center justify-center p-4 rounded-2xl bg-white dark:bg-[#0A2020] border border-[#DDE8E4] dark:border-[#1A3A3A] hover:border-[#087F6D] hover:bg-[#EAF7F2]/40 dark:hover:bg-[#073B3A]/30 text-center transition-all group shadow-xs"
          >
            <div className="w-10 h-10 rounded-xl bg-[#EAF7F2] dark:bg-[#073B3A] text-[#087F6D] dark:text-[#4FD1C5] flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
              <FileText className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-[#17324D] dark:text-[#E2EEF4]">{t.quickViewRecords}</span>
            <span className="text-[10px] text-[#64748B] dark:text-[#7B9EA8] mt-0.5">{t.prescribedMedicines}</span>
          </Link>
        </div>
      </section>

      {/* ── F. 4-STEP VISUAL JOURNEY ────────────────────────────────────────── */}
      <section
        aria-label="Care Continuity Journey"
        className="rounded-2xl border border-[#DDE8E4] dark:border-[#1A3A3A] bg-white dark:bg-[#0A2020] p-5 space-y-3 shadow-xs"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold text-[#17324D] dark:text-[#E2EEF4] uppercase tracking-wider">
            {t.appName} • {t.patientPortalTitle}
          </h2>
          <span className="text-[11px] text-[#087F6D] dark:text-[#4FD1C5] font-semibold">
            4-Step Patient Journey
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5 pt-1">
          {/* Step 1 */}
          <div className="p-3 rounded-xl bg-[#F5F9F7] dark:bg-[#0F2929] border border-[#DDE8E4]/60 dark:border-[#1A3A3A] space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-[#087F6D] text-white flex items-center justify-center text-[10px] font-bold">
                1
              </span>
              <strong className="text-xs font-bold text-[#17324D] dark:text-[#E2EEF4]">{t.registeredPHC}</strong>
            </div>
            <p className="text-[11px] text-[#64748B] dark:text-[#7B9EA8] pl-7">
              {t.step1Title}
            </p>
          </div>

          {/* Step 2 */}
          <div className="p-3 rounded-xl bg-[#F5F9F7] dark:bg-[#0F2929] border border-[#DDE8E4]/60 dark:border-[#1A3A3A] space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-[#087F6D] text-white flex items-center justify-center text-[10px] font-bold">
                2
              </span>
              <strong className="text-xs font-bold text-[#17324D] dark:text-[#E2EEF4]">{t.navOutreach}</strong>
            </div>
            <p className="text-[11px] text-[#64748B] dark:text-[#7B9EA8] pl-7">
              {t.step2Title}
            </p>
          </div>

          {/* Step 3 */}
          <div className="p-3 rounded-xl bg-[#F5F9F7] dark:bg-[#0F2929] border border-[#DDE8E4]/60 dark:border-[#1A3A3A] space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-[#087F6D] text-white flex items-center justify-center text-[10px] font-bold">
                3
              </span>
              <strong className="text-xs font-bold text-[#17324D] dark:text-[#E2EEF4]">{t.navTeleconsult}</strong>
            </div>
            <p className="text-[11px] text-[#64748B] dark:text-[#7B9EA8] pl-7">
              {t.step6Title}
            </p>
          </div>

          {/* Step 4 */}
          <div className="p-3 rounded-xl bg-[#F5F9F7] dark:bg-[#0F2929] border border-[#DDE8E4]/60 dark:border-[#1A3A3A] space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-[#087F6D] text-white flex items-center justify-center text-[10px] font-bold">
                4
              </span>
              <strong className="text-xs font-bold text-[#17324D] dark:text-[#E2EEF4]">{t.navFollowups}</strong>
            </div>
            <p className="text-[11px] text-[#64748B] dark:text-[#7B9EA8] pl-7">
              {t.step7Title}
            </p>
          </div>
        </div>
      </section>

      {/* Booking Modal */}
      <AppointmentBookingModal
        isOpen={bookingModalOpen}
        onClose={() => setBookingModalOpen(false)}
        onBooked={() => {
          patientService.getAppointments().then(setAppointments);
        }}
      />

      {/* HealthSure Voice Modal */}
      <VoiceIVRModal
        isOpen={voiceModalOpen}
        onClose={() => setVoiceModalOpen(false)}
      />
    </div>
  );
};
