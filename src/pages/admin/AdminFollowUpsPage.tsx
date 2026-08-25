// HealthSure — Government Admin Follow-Up Continuity Monitoring Page
// frontend/src/pages/admin/AdminFollowUpsPage.tsx

import React, { useState, useEffect } from 'react';
import { Clock, Search } from 'lucide-react';
import { adminService } from '../../services/adminService';
import { useTranslation } from '../../lib/i18n/useTranslation';
import type { AdminFollowUpRecord } from '../../types/admin';

export const AdminFollowUpsPage: React.FC = () => {
  const t = useTranslation();
  const [followUps, setFollowUps] = useState<AdminFollowUpRecord[]>([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    adminService.getFollowUps(statusFilter).then(setFollowUps);
  }, [statusFilter]);

  const filtered = followUps.filter(
    (f) =>
      f.patientId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.facility.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.speciality.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="border-b border-[#DDE8E4] dark:border-[#1A3A3A] pb-4">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#EAF7F2] dark:bg-[#073B3A] text-[#087F6D] dark:text-[#4FD1C5] text-xs font-bold mb-1">
          <Clock className="w-3.5 h-3.5" />
          <span>Longitudinal Chronic Care Oversight</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-bold text-[#17324D] dark:text-[#E2EEF4]">
          {t.navFollowups} & Treatment Adherence Monitoring
        </h1>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-white dark:bg-[#0A2020] border border-[#DDE8E4] dark:border-[#1A3A3A] shadow-xs space-y-1">
          <div className="text-xs text-[#64748B] dark:text-[#7B9EA8] font-bold uppercase tracking-wider">
            Total Follow-ups Due
          </div>
          <div className="text-2xl font-extrabold text-[#17324D] dark:text-[#E2EEF4]">
            312
          </div>
          <div className="text-[11px] text-[#64748B] dark:text-[#7B9EA8]">In Current 30-Day Window</div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#0A2020] border border-[#DDE8E4] dark:border-[#1A3A3A] shadow-xs space-y-1">
          <div className="text-xs text-[#64748B] dark:text-[#7B9EA8] font-bold uppercase tracking-wider">
            Adherence Complete
          </div>
          <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
            278 (89%)
          </div>
          <div className="text-[11px] text-emerald-700 dark:text-emerald-300 font-semibold">Attended On-Time</div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#0A2020] border border-[#DDE8E4] dark:border-[#1A3A3A] shadow-xs space-y-1">
          <div className="text-xs text-[#64748B] dark:text-[#7B9EA8] font-bold uppercase tracking-wider">
            Overdue Attention
          </div>
          <div className="text-2xl font-extrabold text-rose-600 dark:text-rose-400">
            17 Overdue
          </div>
          <div className="text-[11px] text-rose-700 dark:text-rose-300 font-semibold">Flagged for ASHA Visit</div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#0A2020] border border-[#DDE8E4] dark:border-[#1A3A3A] shadow-xs space-y-1">
          <div className="text-xs text-[#64748B] dark:text-[#7B9EA8] font-bold uppercase tracking-wider">
            Tele-Kiosk Mode
          </div>
          <div className="text-2xl font-extrabold text-[#087F6D] dark:text-[#4FD1C5]">
            184 (59%)
          </div>
          <div className="text-[11px] text-[#087F6D] font-semibold">Completed at Village PHC</div>
        </div>
      </div>

      {/* Filter & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-[#0A2020] p-4 rounded-2xl border border-[#DDE8E4] dark:border-[#1A3A3A] shadow-xs">
        <div className="flex gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: 'all', label: 'All Records' },
            { id: 'due', label: 'Due Today' },
            { id: 'upcoming', label: 'Upcoming' },
            { id: 'overdue', label: 'Overdue' },
            { id: 'completed', label: 'Completed' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors border ${
                statusFilter === tab.id
                  ? 'bg-[#087F6D] border-[#087F6D] text-white shadow-xs'
                  : 'border-[#DDE8E4] dark:border-[#1A3A3A] bg-white dark:bg-[#0A2020] text-[#64748B] dark:text-[#7B9EA8] hover:text-[#17324D]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-[#64748B] dark:text-[#7B9EA8] absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search patient ID, PHC, speciality..."
            className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-[#DDE8E4] dark:border-[#1A3A3A] bg-[#F5F9F7] dark:bg-[#0F2929] text-xs font-medium text-[#17324D] dark:text-[#E2EEF4]"
          />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-[#DDE8E4] dark:border-[#1A3A3A] bg-white dark:bg-[#0A2020] overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F5F9F7] dark:bg-[#0F2929] border-b border-[#DDE8E4] dark:border-[#1A3A3A] text-[#64748B] dark:text-[#7B9EA8]">
              <tr>
                <th className="p-3 font-bold">Patient Health ID</th>
                <th className="p-3 font-bold">Local PHC Facility</th>
                <th className="p-3 font-bold">{t.specialityLabel}</th>
                <th className="p-3 font-bold">Scheduled Due Date</th>
                <th className="p-3 font-bold">Review Mode</th>
                <th className="p-3 font-bold">Priority</th>
                <th className="p-3 font-bold text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DDE8E4] dark:divide-[#1A3A3A]">
              {filtered.map((item) => (
                <tr key={item.id} className="hover:bg-[#F5F9F7]/60 dark:hover:bg-[#0F2929]/50 transition-colors">
                  <td className="p-3 font-mono font-bold text-[#087F6D] dark:text-[#4FD1C5]">
                    {item.patientId}
                  </td>
                  <td className="p-3 font-semibold text-[#17324D] dark:text-[#E2EEF4]">
                    {item.facility}
                  </td>
                  <td className="p-3 text-[#17324D] dark:text-[#D1E8E2]">
                    {item.speciality}
                  </td>
                  <td className="p-3 text-[#64748B] dark:text-[#7B9EA8]">
                    {item.dueDate}
                  </td>
                  <td className="p-3 capitalize">
                    {item.mode === 'teleconsultation' ? 'Teleconsultation Kiosk' : 'In-Person PHC Visit'}
                  </td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        item.priority === 'Urgent'
                          ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
                          : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                      }`}
                    >
                      {item.priority}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        item.status === 'completed'
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                          : item.status === 'overdue'
                          ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
                          : 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                      }`}
                    >
                      {item.status.toUpperCase()}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
