// HealthSure — Government Admin Referral Monitoring Page
// frontend/src/pages/admin/AdminReferralsPage.tsx

import React, { useState, useEffect } from 'react';
import {
  Share2,
  Search,
  AlertTriangle,
  Eye,
  X,
} from 'lucide-react';
import { adminService } from '../../services/adminService';
import { useTranslation } from '../../lib/i18n/useTranslation';
import type { AdminReferralRecord, ReferralPipelineStage, SystemBottleneck } from '../../types/admin';

export const AdminReferralsPage: React.FC = () => {
  const t = useTranslation();

  const [referrals, setReferrals] = useState<AdminReferralRecord[]>([]);
  const [pipeline, setPipeline] = useState<ReferralPipelineStage[]>([]);
  const [bottlenecks, setBottlenecks] = useState<SystemBottleneck[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedReferral, setSelectedReferral] = useState<AdminReferralRecord | null>(null);

  useEffect(() => {
    adminService.getReferrals(searchQuery, priorityFilter, statusFilter).then(setReferrals);
    adminService.getReferralPipeline().then(setPipeline);
    adminService.getBottlenecks().then(setBottlenecks);
  }, [searchQuery, priorityFilter, statusFilter]);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="border-b border-[#DDE8E4] dark:border-[#1A3A3A] pb-4">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#EAF7F2] dark:bg-[#073B3A] text-[#087F6D] dark:text-[#4FD1C5] text-xs font-bold mb-1">
          <Share2 className="w-3.5 h-3.5" />
          <span>Inter-Facility Continuity Architecture</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-bold text-[#17324D] dark:text-[#E2EEF4]">
          {t.referralPipeline} & Triage Monitoring
        </h1>
      </div>

      {/* ── 7-Stage Referral Pipeline Summary Strip ─────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
        {pipeline.map((p) => (
          <div
            key={p.stage}
            className="p-3 rounded-2xl bg-white dark:bg-[#0A2020] border border-[#DDE8E4] dark:border-[#1A3A3A] shadow-xs space-y-1 text-center"
          >
            <div className="text-[10px] font-bold text-[#64748B] dark:text-[#7B9EA8] uppercase">
              Stage {p.stage}
            </div>
            <div className="text-xl font-extrabold text-[#087F6D] dark:text-[#4FD1C5]">
              {p.count}
            </div>
            <div className="text-[11px] font-bold text-[#17324D] dark:text-[#E2EEF4] truncate">
              {p.title.split('.')[1] || p.title}
            </div>
          </div>
        ))}
      </div>

      {/* ── Bottlenecks Alert Bar ────────────────────────────────────────── */}
      <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 space-y-2">
        <div className="flex items-center gap-2 text-xs font-bold text-amber-900 dark:text-amber-200">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>System Bottlenecks Flagged Across Division:</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-amber-800 dark:text-amber-300">
          {bottlenecks.slice(0, 3).map((b) => (
            <div key={b.id} className="p-2.5 rounded-xl bg-white/70 dark:bg-[#0A2020]/60 border border-amber-200/60 dark:border-amber-900/40">
              <strong className="block font-bold text-[#17324D] dark:text-[#E2EEF4]">{b.title}</strong>
              <span className="text-[11px] text-[#64748B] dark:text-[#7B9EA8]">{b.affectedFacility}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Filter and Search Controls ───────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-[#0A2020] p-4 rounded-2xl border border-[#DDE8E4] dark:border-[#1A3A3A] shadow-xs">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Priority Filter */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-[#DDE8E4] dark:border-[#1A3A3A] bg-[#F5F9F7] dark:bg-[#0F2929] text-xs font-semibold text-[#17324D] dark:text-[#E2EEF4]"
          >
            <option value="all">All Priorities</option>
            <option value="Urgent">{t.urgentPriority}</option>
            <option value="Normal">{t.normalPriority}</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-[#DDE8E4] dark:border-[#1A3A3A] bg-[#F5F9F7] dark:bg-[#0F2929] text-xs font-semibold text-[#17324D] dark:text-[#E2EEF4]"
          >
            <option value="all">All Statuses</option>
            <option value="created">Created (Awaiting Review)</option>
            <option value="accepted">{t.statusHospitalAccepted}</option>
            <option value="scheduled">{t.statusScheduled}</option>
            <option value="completed">{t.statusCompleted}</option>
          </select>
        </div>

        {/* Search Box */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-[#64748B] dark:text-[#7B9EA8] absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search referral ID, patient, PHC..."
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-[#DDE8E4] dark:border-[#1A3A3A] bg-[#F5F9F7] dark:bg-[#0F2929] text-xs font-medium text-[#17324D] dark:text-[#E2EEF4] focus:outline-none focus:ring-2 focus:ring-[#087F6D]"
          />
        </div>
      </div>

      {/* ── Referrals Master Table ───────────────────────────────────────── */}
      <div className="rounded-2xl border border-[#DDE8E4] dark:border-[#1A3A3A] bg-white dark:bg-[#0A2020] overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F5F9F7] dark:bg-[#0F2929] border-b border-[#DDE8E4] dark:border-[#1A3A3A] text-[#64748B] dark:text-[#7B9EA8]">
              <tr>
                <th className="p-3 font-bold">Referral ID</th>
                <th className="p-3 font-bold">Patient</th>
                <th className="p-3 font-bold">{t.originFacility}</th>
                <th className="p-3 font-bold">{t.destinationFacility}</th>
                <th className="p-3 font-bold">{t.specialityLabel}</th>
                <th className="p-3 font-bold">Priority</th>
                <th className="p-3 font-bold">Status</th>
                <th className="p-3 font-bold">Initiated Date</th>
                <th className="p-3 font-bold text-right">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DDE8E4] dark:divide-[#1A3A3A]">
              {referrals.map((r) => (
                <tr key={r.id} className="hover:bg-[#F5F9F7]/60 dark:hover:bg-[#0F2929]/50 transition-colors">
                  <td className="p-3 font-mono font-bold text-[#087F6D] dark:text-[#4FD1C5]">
                    {r.id}
                  </td>
                  <td className="p-3">
                    <div className="font-bold text-[#17324D] dark:text-[#E2EEF4]">{r.patientName}</div>
                    <div className="text-[10px] text-[#64748B] dark:text-[#7B9EA8]">{r.patientId}</div>
                  </td>
                  <td className="p-3 text-[#17324D] dark:text-[#D1E8E2]">
                    {r.fromFacility}
                  </td>
                  <td className="p-3 text-[#17324D] dark:text-[#D1E8E2]">
                    {r.toHospital}
                  </td>
                  <td className="p-3 font-semibold text-[#087F6D] dark:text-[#4FD1C5]">
                    {r.speciality}
                  </td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        r.priority === 'Urgent'
                          ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
                          : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                      }`}
                    >
                      {r.priority === 'Urgent' ? t.urgentPriority : t.normalPriority}
                    </span>
                  </td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        r.status === 'completed'
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                          : r.status === 'accepted' || r.status === 'scheduled'
                          ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300'
                          : 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                      }`}
                    >
                      {r.status === 'completed'
                        ? t.statusCompleted
                        : r.status === 'accepted'
                        ? t.statusHospitalAccepted
                        : r.status === 'scheduled'
                        ? t.statusScheduled
                        : t.statusPending}
                    </span>
                  </td>
                  <td className="p-3 text-[#64748B] dark:text-[#7B9EA8]">
                    {r.createdDate}
                  </td>
                  <td className="p-3 text-right">
                    <button
                      type="button"
                      onClick={() => setSelectedReferral(r)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-[#DDE8E4] dark:border-[#1A3A3A] hover:bg-[#F5F9F7] text-xs font-semibold text-[#087F6D] dark:text-[#4FD1C5]"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Audit</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Referral Audit Modal */}
      {selectedReferral && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white dark:bg-[#0A2020] rounded-2xl border border-[#DDE8E4] dark:border-[#1A3A3A] p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-[#DDE8E4] dark:border-[#1A3A3A] pb-3">
              <div className="flex items-center gap-2">
                <Share2 className="w-5 h-5 text-[#087F6D]" />
                <h3 className="text-base font-bold text-[#17324D] dark:text-[#E2EEF4]">
                  Referral Audit Record ({selectedReferral.id})
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedReferral(null)}
                className="p-1 rounded-lg text-[#64748B] hover:text-[#17324D] dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-[#F5F9F7] dark:bg-[#0F2929] grid grid-cols-2 gap-2">
                <div>
                  <span className="text-[#64748B] block">Patient:</span>
                  <strong className="text-[#17324D] dark:text-[#E2EEF4]">{selectedReferral.patientName} ({selectedReferral.patientId})</strong>
                </div>
                <div>
                  <span className="text-[#64748B] block">Speciality:</span>
                  <strong className="text-[#087F6D] dark:text-[#4FD1C5]">{selectedReferral.speciality}</strong>
                </div>
                <div>
                  <span className="text-[#64748B] block">From Facility:</span>
                  <div className="font-semibold text-[#17324D] dark:text-[#E2EEF4]">{selectedReferral.fromFacility}</div>
                </div>
                <div>
                  <span className="text-[#64748B] block">To Hospital:</span>
                  <div className="font-semibold text-[#17324D] dark:text-[#E2EEF4]">{selectedReferral.toHospital}</div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#EAF7F2]/60 dark:bg-[#073B3A]/30 space-y-1">
                <div className="font-bold text-[#087F6D] dark:text-[#4FD1C5]">Inter-Facility Compliance Status</div>
                <p className="text-[#17324D] dark:text-[#D1E8E2]">
                  Referral digitally verified with pre-cleared token DH-CARD-14. Triage turnaround time: {selectedReferral.turnaroundHours} hours.
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-[#DDE8E4] dark:border-[#1A3A3A] flex items-center justify-end">
              <button
                type="button"
                onClick={() => setSelectedReferral(null)}
                className="px-4 py-2 rounded-xl bg-[#087F6D] text-white text-xs font-bold"
              >
                {t.closeBtn}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
