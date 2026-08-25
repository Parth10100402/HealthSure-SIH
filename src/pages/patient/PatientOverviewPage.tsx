// HealthSure — Patient Overview Dashboard (Simplified Mobile-First)
// frontend/src/pages/patient/PatientOverviewPage.tsx

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  Share2,
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
import type { Appointment } from '../../types/patient';
import { AppointmentBookingModal } from '../../components/patient/AppointmentCard';
import { VoiceIVRModal } from '../../components/patient/VoiceIVRModal';
import { CallHealthSureCard } from '../../components/patient/CallHealthSureCard';

export const PatientOverviewPage: React.FC = () => {
  const { user } = useAuth();
  const t = useTranslation();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [voiceModalOpen, setVoiceModalOpen] = useState(false);

  const patientName = user?.fullName || mockPatientProfile.fullName;
  const patientId = (user as any)?.patientId || user?.id || mockPatientProfile.id;
  const facility = (user as any)?.village || mockPatientProfile.registeredFacility;

  useEffect(() => {
    patientService.getAppointments().then(setAppointments);
  }, []);

  const nextAppointment = appointments.find((a) => a.status === 'confirmed' || a.status === 'pending') || appointments[0];

  return (
    <div className="space-y-5 max-w-5xl mx-auto animate-in fade-in duration-150">
      {/* ── 1. PATIENT GREETING BANNER ────────────────────────────────────── */}
      <section
        className="rounded-3xl bg-gradient-to-r from-[#073B3A] via-[#094840] to-[#087F6D] text-white p-5 sm:p-6 shadow-md"
        aria-label="Patient Summary"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-bold backdrop-blur-xs">
              <ShieldCheck className="w-4 h-4 text-[#4FD1C5]" />
              <span>{patientId} • {facility}</span>
            </div>

            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white flex flex-wrap items-center gap-2">
              <span className="text-[#A7D9CE] font-medium">{t.welcomeBack},</span>
              <span className="font-black">{patientName}</span>
            </h1>
          </div>

          <button
            type="button"
            onClick={() => setVoiceModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white/15 hover:bg-white/25 border border-white/30 px-4 py-2.5 text-xs font-bold text-white transition-all self-start sm:self-auto shrink-0 cursor-pointer"
          >
            <PhoneCall className="w-4 h-4 text-[#4FD1C5]" />
            <span>Voice IVR Demo</span>
          </button>
        </div>
      </section>

      {/* ── 2. PROMINENT 1-TAP CALL HEALTHSURE CARD ───────────────────────── */}
      <CallHealthSureCard />

      {/* ── 3. PRIMARY 4 ACTION TILES (CLEAN - NO SUBTEXT) ────────────────── */}
      <section aria-label="Primary Health Actions" className="space-y-2">
        <h2 className="text-xs font-bold text-[#64748B] dark:text-[#7B9EA8] uppercase tracking-wider px-1">
          Healthcare Services
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* Tile 1: Book Appointment */}
          <button
            type="button"
            onClick={() => setBookingModalOpen(true)}
            className="flex flex-col items-center justify-center p-5 rounded-2xl bg-white dark:bg-[#0A2020] border border-[#DDE8E4] dark:border-[#1A3A3A] hover:border-[#087F6D] text-center shadow-xs transition-all active:scale-98 cursor-pointer group"
          >
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-[#087F6D] dark:text-[#4FD1C5] flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <Calendar className="w-6 h-6" />
            </div>
            <span className="text-sm font-bold text-[#17324D] dark:text-[#E2EEF4]">
              {t.quickBookApt}
            </span>
          </button>

          {/* Tile 2: Teleconsultation */}
          <Link
            to="/patient/teleconsultation"
            className="flex flex-col items-center justify-center p-5 rounded-2xl bg-white dark:bg-[#0A2020] border border-[#DDE8E4] dark:border-[#1A3A3A] hover:border-blue-500 text-center shadow-xs transition-all active:scale-98 group"
          >
            <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <Video className="w-6 h-6" />
            </div>
            <span className="text-sm font-bold text-[#17324D] dark:text-[#E2EEF4]">
              {t.navTeleconsult}
            </span>
          </Link>

          {/* Tile 3: Health Records */}
          <Link
            to="/patient/records"
            className="flex flex-col items-center justify-center p-5 rounded-2xl bg-white dark:bg-[#0A2020] border border-[#DDE8E4] dark:border-[#1A3A3A] hover:border-[#087F6D] text-center shadow-xs transition-all active:scale-98 group"
          >
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-[#087F6D] dark:text-[#4FD1C5] flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <FileText className="w-6 h-6" />
            </div>
            <span className="text-sm font-bold text-[#17324D] dark:text-[#E2EEF4]">
              {t.quickViewRecords}
            </span>
          </Link>

          {/* Tile 4: Track Referral */}
          <Link
            to="/patient/referrals"
            className="flex flex-col items-center justify-center p-5 rounded-2xl bg-white dark:bg-[#0A2020] border border-[#DDE8E4] dark:border-[#1A3A3A] hover:border-amber-500 text-center shadow-xs transition-all active:scale-98 group"
          >
            <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <Share2 className="w-6 h-6" />
            </div>
            <span className="text-sm font-bold text-[#17324D] dark:text-[#E2EEF4]">
              {t.quickTrackReferral}
            </span>
          </Link>
        </div>
      </section>

      {/* ── 4. CURRENT ACTIVE APPOINTMENT ─────────────────────────────────── */}
      <section aria-label="Upcoming Care" className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-xs font-bold text-[#64748B] dark:text-[#7B9EA8] uppercase tracking-wider">
            {t.nextAptHeading}
          </h2>
          <Link
            to="/patient/appointments"
            className="text-xs font-bold text-[#087F6D] dark:text-[#4FD1C5] hover:underline flex items-center gap-0.5"
          >
            <span>{t.tabAll}</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {nextAppointment ? (
          <div className="rounded-3xl border border-[#DDE8E4] dark:border-[#1A3A3A] bg-white dark:bg-[#0A2020] p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
                  {nextAppointment.status.toUpperCase()}
                </span>
                <span className="text-xs font-semibold text-[#087F6D] dark:text-[#4FD1C5]">
                  Token: {nextAppointment.tokenNumber}
                </span>
              </div>

              <h3 className="text-base font-bold text-[#17324D] dark:text-[#E2EEF4]">
                {nextAppointment.speciality} • {nextAppointment.doctorName}
              </h3>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#64748B] dark:text-[#7B9EA8]">
                <div className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-[#087F6D]" />
                  <span>{nextAppointment.date} at {nextAppointment.time}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5 text-[#087F6D]" />
                  <span>{nextAppointment.facility}</span>
                </div>
              </div>
            </div>

            <Link
              to="/patient/appointments"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#087F6D] hover:bg-[#073B3A] text-white font-bold text-xs px-5 py-3 shadow-xs shrink-0 self-start sm:self-auto"
            >
              <span>View Appointment Slip</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-[#DDE8E4] dark:border-[#1A3A3A] p-6 text-center text-xs text-[#64748B] dark:text-[#7B9EA8]">
            No upcoming appointments scheduled.
          </div>
        )}
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
