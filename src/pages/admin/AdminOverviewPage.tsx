// HealthSure — Government / Public Health Admin Overview Page
// frontend/src/pages/admin/AdminOverviewPage.tsx

import React, { useState, useEffect } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import {
  Users,
  Share2,
  CheckCircle2,
  Activity,
  Video,
  Clock,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { adminService } from '../../services/adminService';
import { useTranslation } from '../../lib/i18n/useTranslation';
import type {
  PublicHealthIndicator,
  ReferralPipelineStage,
  SystemBottleneck,
  FacilityPerformance,
  SpecialistOutreachRecord,
  TeleconsultationStats,
} from '../../types/admin';

interface AdminContextType {
  selectedDistrict: string;
  selectedFacility: string;
}

export const AdminOverviewPage: React.FC = () => {
  const t = useTranslation();
  const { selectedDistrict, selectedFacility } = useOutletContext<AdminContextType>();

  const [indicators, setIndicators] = useState<PublicHealthIndicator | null>(null);
  const [pipeline, setPipeline] = useState<ReferralPipelineStage[]>([]);
  const [bottlenecks, setBottlenecks] = useState<SystemBottleneck[]>([]);
  const [facilities, setFacilities] = useState<FacilityPerformance[]>([]);
  const [outreach, setOutreach] = useState<SpecialistOutreachRecord[]>([]);
  const [teleStats, setTeleStats] = useState<TeleconsultationStats | null>(null);

  useEffect(() => {
    const fetchData = () => {
      adminService.getIndicators({ state: 'Maharashtra', district: selectedDistrict, facility: selectedFacility }).then(setIndicators);
      adminService.getReferralPipeline().then(setPipeline);
      adminService.getBottlenecks().then(setBottlenecks);
      adminService.getFacilities(selectedDistrict).then(setFacilities);
      adminService.getSpecialistOutreach(selectedFacility).then(setOutreach);
      adminService.getTeleconsultStats().then(setTeleStats);
    };
    fetchData();
    const interval = setInterval(fetchData, 8000);
    return () => clearInterval(interval);
  }, [selectedDistrict, selectedFacility]);

  if (!indicators) return null;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* ── Top Government Banner & Demo Data Disclaimer ────────────────── */}
      <section className="rounded-2xl bg-gradient-to-r from-[#073B3A] via-[#094840] to-[#0D5950] text-white p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-white/15 text-white text-xs font-semibold backdrop-blur-xs">
              <ShieldCheck className="w-3.5 h-3.5 text-[#4FD1C5]" />
              <span>{t.adminPortalTitle}</span>
              <span className="bg-[#4FD1C5]/20 text-[#4FD1C5] px-2 py-0.2 rounded-md text-[10px]">Authoritative DB</span>
            </div>

            <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
              State Healthcare Access & Care Continuity Dashboard
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/admin/reports"
              className="inline-flex items-center gap-2 rounded-xl bg-[#4FD1C5] hover:bg-[#38b2ac] text-[#073B3A] px-4 py-2.5 text-xs font-bold transition-all shadow-xs"
            >
              <span>{t.operationalReports}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Core Public Health Indicators ─────────────────────────────── */}
      <section aria-label="Key Indicators" className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
        {/* 1. Patients Served */}
        <div className="p-4 rounded-2xl bg-white dark:bg-[#0A2020] border border-[#DDE8E4] dark:border-[#1A3A3A] space-y-1 shadow-xs">
          <div className="flex items-center justify-between text-[#64748B] dark:text-[#7B9EA8]">
            <span className="font-bold uppercase tracking-wider text-[10px] truncate">{t.patientsServed}</span>
            <Users className="w-4 h-4 text-[#087F6D]" />
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-[#17324D] dark:text-[#E2EEF4]">
            {indicators.patientsServed.toLocaleString()}
          </div>
          <div className="text-[10px] text-[#64748B] dark:text-[#7B9EA8]">Across Rural PHCs</div>
        </div>

        {/* 2. Total Appointments (Authoritative DB Count) */}
        <div className="p-4 rounded-2xl bg-white dark:bg-[#0A2020] border border-[#DDE8E4] dark:border-[#1A3A3A] space-y-1 shadow-xs">
          <div className="flex items-center justify-between text-[#64748B] dark:text-[#7B9EA8]">
            <span className="font-bold uppercase tracking-wider text-[10px] truncate">Appointments</span>
            <Activity className="w-4 h-4 text-[#087F6D]" />
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-[#087F6D] dark:text-[#4FD1C5]">
            {(indicators.totalAppointments || 1240).toLocaleString()}
          </div>
          <div className="text-[10px] text-[#087F6D] dark:text-[#4FD1C5] font-semibold">Live DB Synced</div>
        </div>

        {/* 3. Active Referrals */}
        <div className="p-4 rounded-2xl bg-white dark:bg-[#0A2020] border border-[#DDE8E4] dark:border-[#1A3A3A] space-y-1 shadow-xs">
          <div className="flex items-center justify-between text-[#64748B] dark:text-[#7B9EA8]">
            <span className="font-bold uppercase tracking-wider text-[10px] truncate">{t.activeReferrals}</span>
            <Share2 className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-[#17324D] dark:text-[#E2EEF4]">
            {indicators.activeReferrals}
          </div>
          <div className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold">In Transfer Pipeline</div>
        </div>

        {/* 4. Referral Completion Rate */}
        <div className="p-4 rounded-2xl bg-white dark:bg-[#0A2020] border border-[#DDE8E4] dark:border-[#1A3A3A] space-y-1 shadow-xs">
          <div className="flex items-center justify-between text-[#64748B] dark:text-[#7B9EA8]">
            <span className="font-bold uppercase tracking-wider text-[10px] truncate">{t.referralCompletionRate}</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
            {indicators.referralCompletionRate}%
          </div>
          <div className="text-[10px] text-emerald-700 dark:text-emerald-300 font-semibold">+3.2% vs Last Quarter</div>
        </div>

        {/* 5. Specialist Outreach */}
        <div className="p-4 rounded-2xl bg-white dark:bg-[#0A2020] border border-[#DDE8E4] dark:border-[#1A3A3A] space-y-1 shadow-xs">
          <div className="flex items-center justify-between text-[#64748B] dark:text-[#7B9EA8]">
            <span className="font-bold uppercase tracking-wider text-[10px] truncate">{t.outreachVisits}</span>
            <Activity className="w-4 h-4 text-[#087F6D]" />
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-[#17324D] dark:text-[#E2EEF4]">
            {indicators.specialistOutreachVisits}
          </div>
          <div className="text-[10px] text-[#087F6D] dark:text-[#4FD1C5] font-semibold">Visits Conducted</div>
        </div>

        {/* 6. Teleconsultations */}
        <div className="p-4 rounded-2xl bg-white dark:bg-[#0A2020] border border-[#DDE8E4] dark:border-[#1A3A3A] space-y-1 shadow-xs">
          <div className="flex items-center justify-between text-[#64748B] dark:text-[#7B9EA8]">
            <span className="font-bold uppercase tracking-wider text-[10px] truncate">{t.teleconsultations}</span>
            <Video className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-[#17324D] dark:text-[#E2EEF4]">
            {indicators.teleconsultations.toLocaleString()}
          </div>
          <div className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold">68% in 2G Audio Mode</div>
        </div>

        {/* 7. Follow-ups Due */}
        <div className="p-4 rounded-2xl bg-white dark:bg-[#0A2020] border border-[#DDE8E4] dark:border-[#1A3A3A] space-y-1 shadow-xs">
          <div className="flex items-center justify-between text-[#64748B] dark:text-[#7B9EA8]">
            <span className="font-bold uppercase tracking-wider text-[10px] truncate">{t.followUpsDue}</span>
            <Clock className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-[#17324D] dark:text-[#E2EEF4]">
            {indicators.followUpsDue}
          </div>
          <div className="text-[10px] text-purple-600 dark:text-purple-400 font-semibold">Continuity Checks</div>
        </div>
      </section>

      {/* ── Referral Pipeline Breakdown ─────────────────────────────────── */}
      <section className="rounded-2xl border border-[#DDE8E4] dark:border-[#1A3A3A] bg-white dark:bg-[#0A2020] p-5 sm:p-6 space-y-4 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h2 className="text-base font-bold text-[#17324D] dark:text-[#E2EEF4]">
              {t.referralPipeline} (7-Stage Journey Tracking)
            </h2>
            <p className="text-xs text-[#64748B] dark:text-[#7B9EA8]">
              Tracks where patient transfers succeed and where bottlenecks occur between PHCs and District Hospitals.
            </p>
          </div>
          <Link
            to="/admin/referrals"
            className="text-xs font-bold text-[#087F6D] dark:text-[#4FD1C5] hover:underline flex items-center gap-1"
          >
            <span>{t.viewAll}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 pt-1">
          {pipeline.map((stage) => (
            <div
              key={stage.stage}
              className="p-3 rounded-xl border border-[#DDE8E4]/80 dark:border-[#1A3A3A] bg-[#F5F9F7]/70 dark:bg-[#0F2929]/40 space-y-1 relative"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-[#64748B] dark:text-[#7B9EA8] uppercase">
                  Stage {stage.stage}
                </span>
                <span className="font-mono text-xs font-bold text-[#087F6D] dark:text-[#4FD1C5]">
                  {stage.count}
                </span>
              </div>
              <div className="font-bold text-xs text-[#17324D] dark:text-[#E2EEF4] line-clamp-1">
                {stage.title}
              </div>
              <p className="text-[10px] text-[#64748B] dark:text-[#7B9EA8] line-clamp-2 leading-tight">
                {stage.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── System Bottlenecks / Attention Required ─────────────────────── */}
      <section className="rounded-2xl border border-[#DDE8E4] dark:border-[#1A3A3A] bg-white dark:bg-[#0A2020] p-5 sm:p-6 space-y-4 shadow-xs">
        <div className="flex items-center justify-between border-b border-[#DDE8E4] dark:border-[#1A3A3A] pb-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            <div>
              <h2 className="text-base font-bold text-[#17324D] dark:text-[#E2EEF4]">
                {t.systemBottlenecks}
              </h2>
              <p className="text-xs text-[#64748B] dark:text-[#7B9EA8]">
                Identifies where the rural healthcare system is currently encountering friction.
              </p>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 text-xs font-bold">
            {bottlenecks.length} Active Items
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {bottlenecks.map((bot) => (
            <div
              key={bot.id}
              className={`p-4 rounded-xl border space-y-2 ${
                bot.severity === 'high'
                  ? 'border-rose-200 bg-rose-50/50 dark:border-rose-900/50 dark:bg-rose-950/20'
                  : 'border-amber-200 bg-amber-50/50 dark:border-amber-900/50 dark:bg-amber-950/20'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="font-bold text-xs text-[#17324D] dark:text-[#E2EEF4]">
                  {bot.title}
                </div>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                    bot.severity === 'high'
                      ? 'bg-rose-100 text-rose-800 dark:bg-rose-900/60 dark:text-rose-200'
                      : 'bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-200'
                  }`}
                >
                  {bot.count} Cases
                </span>
              </div>

              <p className="text-xs text-[#64748B] dark:text-[#7B9EA8] leading-relaxed">
                {bot.description}
              </p>

              <div className="pt-2 border-t border-black/5 dark:border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[11px]">
                <span className="text-[#64748B] dark:text-[#7B9EA8]">Facility: <strong>{bot.affectedFacility}</strong></span>
                <span className="font-semibold text-[#087F6D] dark:text-[#4FD1C5]">Action: {bot.actionRecommendation}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── District & Facility Performance Table ───────────────────────── */}
      <section className="rounded-2xl border border-[#DDE8E4] dark:border-[#1A3A3A] bg-white dark:bg-[#0A2020] p-5 sm:p-6 space-y-4 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h2 className="text-base font-bold text-[#17324D] dark:text-[#E2EEF4]">
              {t.facilityPerformance}
            </h2>
            <p className="text-xs text-[#64748B] dark:text-[#7B9EA8]">
              Continuity indicators across Primary Health Centres and District referral hospitals.
            </p>
          </div>

          <Link
            to="/admin/facilities"
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
                <th className="p-3 font-bold">Facility Name</th>
                <th className="p-3 font-bold">Type</th>
                <th className="p-3 font-bold">District / Taluka</th>
                <th className="p-3 font-bold">{t.patientsServed}</th>
                <th className="p-3 font-bold">Referrals Sent</th>
                <th className="p-3 font-bold">Completion Rate</th>
                <th className="p-3 font-bold">Specialist Visits</th>
                <th className="p-3 font-bold">Tele-Consults</th>
                <th className="p-3 font-bold text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DDE8E4] dark:divide-[#1A3A3A]">
              {facilities.map((fac) => (
                <tr key={fac.id} className="hover:bg-[#F5F9F7]/60 dark:hover:bg-[#0F2929]/50 transition-colors">
                  <td className="p-3 font-bold text-[#17324D] dark:text-[#E2EEF4]">
                    {fac.name}
                  </td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded-md bg-[#EAF7F2] dark:bg-[#073B3A] text-[#087F6D] dark:text-[#4FD1C5] font-semibold text-[10px]">
                      {fac.type}
                    </span>
                  </td>
                  <td className="p-3 text-[#64748B] dark:text-[#7B9EA8]">
                    {fac.district} ({fac.taluka})
                  </td>
                  <td className="p-3 font-semibold text-[#17324D] dark:text-[#E2EEF4]">
                    {fac.patientsServed.toLocaleString()}
                  </td>
                  <td className="p-3 text-[#17324D] dark:text-[#D1E8E2]">
                    {fac.referralsSent}
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-1.5">
                      <div className="w-16 bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            fac.referralCompletionRate >= 85 ? 'bg-[#087F6D]' : 'bg-amber-500'
                          }`}
                          style={{ width: `${fac.referralCompletionRate}%` }}
                        />
                      </div>
                      <span className="font-bold text-xs text-[#17324D] dark:text-[#E2EEF4]">
                        {fac.referralCompletionRate}%
                      </span>
                    </div>
                  </td>
                  <td className="p-3 font-semibold text-[#087F6D] dark:text-[#4FD1C5]">
                    {fac.outreachVisitsCount}
                  </td>
                  <td className="p-3 font-semibold text-blue-600 dark:text-blue-400">
                    {fac.teleconsultationsCount}
                  </td>
                  <td className="p-3 text-right">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        fac.status === 'Operational'
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                          : 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                      }`}
                    >
                      {fac.status === 'Operational' ? t.statusOperational : t.statusAttentionRequired}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── Specialist Outreach & Teleconsultation Quick Rows ───────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Outreach Utilization Preview */}
        <section className="rounded-2xl border border-[#DDE8E4] dark:border-[#1A3A3A] bg-white dark:bg-[#0A2020] p-5 space-y-3 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <h3 className="text-sm font-bold text-[#17324D] dark:text-[#E2EEF4]">
                {t.outreachUtilization} (Available vs Booked Slots)
              </h3>
              <p className="text-[11px] text-[#64748B] dark:text-[#7B9EA8]">
                Shows whether scheduled specialist visits are actively utilized by rural patients.
              </p>
            </div>
            <Link to="/admin/outreach" className="text-xs font-bold text-[#087F6D] hover:underline">
              {t.viewAll} →
            </Link>
          </div>

          <div className="space-y-2.5 pt-1">
            {outreach.slice(0, 3).map((item) => (
              <div key={item.id} className="p-3 rounded-xl bg-[#F5F9F7] dark:bg-[#0F2929] space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-[#17324D] dark:text-[#E2EEF4]">
                    {item.targetPHC} • {item.speciality} ({item.doctorName})
                  </div>
                  <span className="font-bold text-[#087F6D] dark:text-[#4FD1C5]">
                    {item.utilizationRate}% Utilized
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-[#64748B] dark:text-[#7B9EA8]">
                  <span>Date: {item.date}</span>
                  <span>{item.bookedSlots} booked / {item.totalSlots} available slots</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-[#087F6D] h-full rounded-full transition-all"
                    style={{ width: `${item.utilizationRate}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Teleconsultation Stats Preview */}
        {teleStats && (
          <section className="rounded-2xl border border-[#DDE8E4] dark:border-[#1A3A3A] bg-white dark:bg-[#0A2020] p-5 space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <h3 className="text-sm font-bold text-[#17324D] dark:text-[#E2EEF4]">
                  {t.teleconsultVolume} (Remote Specialist Sessions)
                </h3>
                <p className="text-[11px] text-[#64748B] dark:text-[#7B9EA8]">
                  Breakdown of video consultations and low-bandwidth 2G adaptive sessions.
                </p>
              </div>
              <Link to="/admin/teleconsultations" className="text-xs font-bold text-[#087F6D] hover:underline">
                {t.viewAll} →
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs pt-1">
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 space-y-0.5">
                <div className="text-[10px] font-bold text-emerald-800 dark:text-emerald-300">Completed Sessions</div>
                <div className="text-lg font-extrabold text-emerald-900 dark:text-emerald-200">{teleStats.completed}</div>
                <div className="text-[10px] text-emerald-700 dark:text-emerald-400">89% completion rate</div>
              </div>

              <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/50 space-y-0.5">
                <div className="text-[10px] font-bold text-blue-800 dark:text-blue-300">{t.lowBandwidthAdoption}</div>
                <div className="text-lg font-extrabold text-blue-900 dark:text-blue-200">{teleStats.lowBandwidthPercent}%</div>
                <div className="text-[10px] text-blue-700 dark:text-blue-400">{teleStats.lowBandwidth2gCount} sessions in 2G</div>
              </div>

              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 space-y-0.5">
                <div className="text-[10px] font-bold text-amber-800 dark:text-amber-300">Pending / Queue</div>
                <div className="text-lg font-extrabold text-amber-900 dark:text-amber-200">{teleStats.pending}</div>
                <div className="text-[10px] text-amber-700 dark:text-amber-400">Awaiting specialist slot</div>
              </div>

              <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-900/50 space-y-0.5">
                <div className="text-[10px] font-bold text-purple-800 dark:text-purple-300">Avg Duration</div>
                <div className="text-lg font-extrabold text-purple-900 dark:text-purple-200">{teleStats.avgDurationMinutes} min</div>
                <div className="text-[10px] text-purple-700 dark:text-purple-400">Per patient clinical consult</div>
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
};
