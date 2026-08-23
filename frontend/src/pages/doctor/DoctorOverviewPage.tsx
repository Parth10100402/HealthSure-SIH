import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Calendar,
  Share2,
  Video,
  Clock,
  Stethoscope,
  ArrowRight,
  ShieldCheck,
  Activity,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { mockDoctorProfile } from '../../data/doctorMockData';
import { doctorService } from '../../services/doctorService';
import { useTranslation } from '../../lib/i18n/useTranslation';
import type { DoctorAppointmentSummary } from '../../types/doctor';
import type { Referral, FollowUp } from '../../types/patient';
import { ConsultationModal } from '../../components/doctor/ConsultationModal';

export const DoctorOverviewPage: React.FC = () => {
  const { user } = useAuth();
  const t = useTranslation();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState<DoctorAppointmentSummary[]>([]);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [followUps, setFollowUps] = useState<FollowUp[]>([]);
  const [activeConsultationApt, setActiveConsultationApt] = useState<DoctorAppointmentSummary | null>(null);

  const doctorName = user?.fullName || mockDoctorProfile.fullName;

  const loadData = async () => {
    const [apts, refs, fols] = await Promise.all([
      doctorService.getAppointments(),
      doctorService.getReferrals(),
      doctorService.getFollowUps(),
    ]);
    setAppointments(apts);
    setReferrals(refs);
    setFollowUps(fols);
  };

  useEffect(() => {
    loadData();
  }, []);

  const pendingReferralsCount = referrals.filter((r) => r.status === 'created' || r.status === 'hospital_accepted').length;
  const teleconsultsCount = appointments.filter((a) => a.mode === 'teleconsultation').length;
  const followUpsDueCount = followUps.filter((f) => f.status === 'due').length;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* ── Top Clinical Banner ───────────────────────────────────────────── */}
      <section className="rounded-2xl bg-gradient-to-r from-[#073B3A] via-[#094840] to-[#0D5950] text-white p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-white/15 text-white text-xs font-semibold backdrop-blur-xs">
              <ShieldCheck className="w-3.5 h-3.5 text-[#4FD1C5]" />
              <span>{t.idLabel}: {mockDoctorProfile.id} • {mockDoctorProfile.opdRoom}</span>
            </div>

            <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
              {t.welcomeBack} {doctorName}
            </h1>

            <p className="text-xs sm:text-sm text-[#A7D9CE]">
              {mockDoctorProfile.hospital} • <strong className="text-white">{mockDoctorProfile.speciality} OPD</strong>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/doctor/outreach"
              className="inline-flex items-center gap-2 rounded-xl bg-white/15 hover:bg-white/25 border border-white/20 px-3.5 py-2 text-xs font-semibold text-white transition-colors"
            >
              <Activity className="w-3.5 h-3.5 text-[#4FD1C5]" />
              <span>{t.outreachPageTitle}</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Metric Summary Cards ─────────────────────────────────────────── */}
      <section aria-label="Clinical Metrics" className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Link
          to="/doctor/appointments"
          className="p-4 rounded-2xl bg-white dark:bg-[#0A2020] border border-[#DDE8E4] dark:border-[#1A3A3A] space-y-1 hover:border-[#087F6D] transition-colors shadow-xs group"
        >
          <div className="flex items-center justify-between text-xs text-[#64748B] dark:text-[#7B9EA8]">
            <span className="font-bold uppercase tracking-wider text-[10px]">{t.todaysAppointments}</span>
            <Calendar className="w-4 h-4 text-[#087F6D] group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-extrabold text-[#17324D] dark:text-[#E2EEF4]">
            {appointments.length}
          </div>
          <div className="text-[11px] text-[#087F6D] dark:text-[#4FD1C5] font-semibold">
            6 In-Person • 2 Teleconsults
          </div>
        </Link>

        <Link
          to="/doctor/referrals"
          className="p-4 rounded-2xl bg-white dark:bg-[#0A2020] border border-[#DDE8E4] dark:border-[#1A3A3A] space-y-1 hover:border-[#087F6D] transition-colors shadow-xs group"
        >
          <div className="flex items-center justify-between text-xs text-[#64748B] dark:text-[#7B9EA8]">
            <span className="font-bold uppercase tracking-wider text-[10px]">{t.pendingReferrals}</span>
            <Share2 className="w-4 h-4 text-amber-600 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-extrabold text-[#17324D] dark:text-[#E2EEF4]">
            {pendingReferralsCount}
          </div>
          <div className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold">
            {t.urgentPriority}
          </div>
        </Link>

        <Link
          to="/doctor/teleconsultation"
          className="p-4 rounded-2xl bg-white dark:bg-[#0A2020] border border-[#DDE8E4] dark:border-[#1A3A3A] space-y-1 hover:border-[#087F6D] transition-colors shadow-xs group"
        >
          <div className="flex items-center justify-between text-xs text-[#64748B] dark:text-[#7B9EA8]">
            <span className="font-bold uppercase tracking-wider text-[10px]">{t.teleconsultations}</span>
            <Video className="w-4 h-4 text-blue-600 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-extrabold text-[#17324D] dark:text-[#E2EEF4]">
            {teleconsultsCount}
          </div>
          <div className="text-[11px] text-blue-600 dark:text-blue-400 font-semibold">
            {t.liveConsultation}
          </div>
        </Link>

        <Link
          to="/doctor/follow-ups"
          className="p-4 rounded-2xl bg-white dark:bg-[#0A2020] border border-[#DDE8E4] dark:border-[#1A3A3A] space-y-1 hover:border-[#087F6D] transition-colors shadow-xs group"
        >
          <div className="flex items-center justify-between text-xs text-[#64748B] dark:text-[#7B9EA8]">
            <span className="font-bold uppercase tracking-wider text-[10px]">{t.followUpsDue}</span>
            <Clock className="w-4 h-4 text-emerald-600 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-extrabold text-[#17324D] dark:text-[#E2EEF4]">
            {followUpsDueCount}
          </div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
            {t.statusDue}
          </div>
        </Link>
      </section>

      {/* ── Today's OPD Queue Table ────────────────────────────────────────── */}
      <section aria-label="OPD Queue" className="rounded-2xl border border-[#DDE8E4] dark:border-[#1A3A3A] bg-white dark:bg-[#0A2020] p-5 sm:p-6 space-y-4 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h2 className="text-base font-bold text-[#17324D] dark:text-[#E2EEF4]">
              {t.todaysAppointments} (OPD Room 104)
            </h2>
            <p className="text-xs text-[#64748B] dark:text-[#7B9EA8]">
              {t.patientSubtitle}
            </p>
          </div>
          <Link
            to="/doctor/appointments"
            className="text-xs font-bold text-[#087F6D] dark:text-[#4FD1C5] hover:underline flex items-center gap-1"
          >
            <span>{t.viewAll}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F5F9F7] dark:bg-[#0F2929] border-b border-[#DDE8E4] dark:border-[#1A3A3A] text-[#64748B] dark:text-[#7B9EA8]">
              <tr>
                <th className="p-3 font-bold">{t.token}</th>
                <th className="p-3 font-bold">{t.fullName}</th>
                <th className="p-3 font-bold">{t.age} / {t.gender}</th>
                <th className="p-3 font-bold">{t.registeredPHC}</th>
                <th className="p-3 font-bold">{t.consultModeLabel}</th>
                <th className="p-3 font-bold">{t.reasonSymptomsLabel}</th>
                <th className="p-3 font-bold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DDE8E4] dark:divide-[#1A3A3A]">
              {appointments.slice(0, 5).map((apt) => (
                <tr key={apt.id} className="hover:bg-[#F5F9F7]/60 dark:hover:bg-[#0F2929]/50 transition-colors">
                  <td className="p-3 font-mono font-bold text-[#087F6D] dark:text-[#4FD1C5]">
                    {apt.tokenNumber}
                  </td>
                  <td className="p-3">
                    <div className="font-bold text-[#17324D] dark:text-[#E2EEF4]">{apt.patientName}</div>
                    <div className="text-[10px] text-[#64748B] dark:text-[#7B9EA8]">{t.idLabel}: {apt.patientId}</div>
                  </td>
                  <td className="p-3 text-[#64748B] dark:text-[#7B9EA8]">
                    {apt.patientAge}y / {apt.patientGender}
                  </td>
                  <td className="p-3 text-[#17324D] dark:text-[#D1E8E2]">
                    {apt.referringPHC}
                  </td>
                  <td className="p-3">
                    {apt.mode === 'teleconsultation' ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[10px] font-bold">
                        <Video className="w-3 h-3" /> {t.navTeleconsult}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold">
                        <Stethoscope className="w-3 h-3" /> {t.inPersonMode}
                      </span>
                    )}
                  </td>
                  <td className="p-3 text-[#64748B] dark:text-[#7B9EA8] max-w-xs truncate">
                    {apt.reasonForVisit}
                  </td>
                  <td className="p-3 text-right">
                    <button
                      type="button"
                      onClick={() => {
                        if (apt.mode === 'teleconsultation') {
                          navigate('/doctor/teleconsultation');
                        } else {
                          setActiveConsultationApt(apt);
                        }
                      }}
                      className="px-3 py-1.5 rounded-lg bg-[#087F6D] hover:bg-[#073B3A] text-white text-xs font-bold transition-all shadow-xs"
                    >
                      {apt.mode === 'teleconsultation' ? t.joinVideo : t.startConsultation}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Consultation Record Modal */}
      {activeConsultationApt && (
        <ConsultationModal
          appointment={activeConsultationApt}
          isOpen={!!activeConsultationApt}
          onClose={() => setActiveConsultationApt(null)}
          onConsultationCompleted={() => {
            setActiveConsultationApt(null);
            loadData();
          }}
        />
      )}
    </div>
  );
};
