// HealthSure — Government Admin Specialist Outreach Monitoring Page
// frontend/src/pages/admin/AdminOutreachPage.tsx

import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Activity, Search } from 'lucide-react';
import { adminService } from '../../services/adminService';
import { useTranslation } from '../../lib/i18n/useTranslation';
import type { SpecialistOutreachRecord } from '../../types/admin';

interface AdminContextType {
  selectedDistrict: string;
  selectedFacility: string;
}

export const AdminOutreachPage: React.FC = () => {
  const t = useTranslation();
  const { selectedFacility } = useOutletContext<AdminContextType>();

  const [outreachList, setOutreachList] = useState<SpecialistOutreachRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    adminService.getSpecialistOutreach(selectedFacility).then(setOutreachList);
  }, [selectedFacility]);

  const totalAvailable = outreachList.reduce((acc, curr) => acc + curr.totalSlots, 0);
  const totalBooked = outreachList.reduce((acc, curr) => acc + curr.bookedSlots, 0);
  const avgUtilization = totalAvailable > 0 ? Math.round((totalBooked / totalAvailable) * 100) : 0;

  const filtered = outreachList.filter((item) => {
    return (
      item.doctorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.targetPHC.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.speciality.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="border-b border-[#DDE8E4] dark:border-[#1A3A3A] pb-4">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#EAF7F2] dark:bg-[#073B3A] text-[#087F6D] dark:text-[#4FD1C5] text-xs font-bold mb-1">
          <Activity className="w-3.5 h-3.5" />
          <span>Mobile Medical Unit (MMU) & Rural Outreach</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-bold text-[#17324D] dark:text-[#E2EEF4]">
          {t.outreachCoverage} & Utilization Oversight
        </h1>
      </div>

      {/* ── Utilization Summary Cards ───────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-4 rounded-2xl bg-white dark:bg-[#0A2020] border border-[#DDE8E4] dark:border-[#1A3A3A] shadow-xs space-y-1">
          <div className="text-xs text-[#64748B] dark:text-[#7B9EA8] font-bold uppercase tracking-wider">
            Total Slots Scheduled
          </div>
          <div className="text-2xl font-extrabold text-[#17324D] dark:text-[#E2EEF4]">
            {totalAvailable} Slots
          </div>
          <div className="text-[11px] text-[#087F6D] dark:text-[#4FD1C5] font-semibold">
            Across {outreachList.length} Scheduled PHC Camps
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#0A2020] border border-[#DDE8E4] dark:border-[#1A3A3A] shadow-xs space-y-1">
          <div className="text-xs text-[#64748B] dark:text-[#7B9EA8] font-bold uppercase tracking-wider">
            Rural Patients Booked
          </div>
          <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
            {totalBooked} Booked
          </div>
          <div className="text-[11px] text-emerald-700 dark:text-emerald-300 font-semibold">
            Saved ~45km round-trip per patient
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#0A2020] border border-[#DDE8E4] dark:border-[#1A3A3A] shadow-xs space-y-1">
          <div className="text-xs text-[#64748B] dark:text-[#7B9EA8] font-bold uppercase tracking-wider">
            Average Utilization Rate
          </div>
          <div className="text-2xl font-extrabold text-[#087F6D] dark:text-[#4FD1C5]">
            {avgUtilization}%
          </div>
          <div className="text-[11px] text-[#64748B] dark:text-[#7B9EA8]">
            Optimal capacity utilization target: &gt;70%
          </div>
        </div>
      </div>

      {/* ── Available vs Booked Slots Visualizer ─────────────────────────── */}
      <section className="p-5 rounded-2xl bg-white dark:bg-[#0A2020] border border-[#DDE8E4] dark:border-[#1A3A3A] shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h3 className="text-sm font-bold text-[#17324D] dark:text-[#E2EEF4]">
              {t.slotsAvailableVsBooked} (Weekly Camps)
            </h3>
            <p className="text-[11px] text-[#64748B] dark:text-[#7B9EA8]">
              Comparison of total capacity vs confirmed beneficiary bookings per venue.
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs font-semibold">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-[#087F6D]"></span>
              <span>Booked</span>
            </div>
            <div className="flex items-center gap-1.5 text-[#64748B]">
              <span className="w-3 h-3 rounded-full bg-slate-300 dark:bg-slate-700"></span>
              <span>Unfilled</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
          {outreachList.map((item) => (
            <div key={item.id} className="p-3.5 rounded-xl bg-[#F5F9F7] dark:bg-[#0F2929] space-y-2 border border-[#DDE8E4]/60 dark:border-[#1A3A3A]">
              <div className="flex items-start justify-between gap-1">
                <div>
                  <strong className="text-xs text-[#17324D] dark:text-[#E2EEF4] block">{item.targetPHC}</strong>
                  <span className="text-[10px] text-[#087F6D] dark:text-[#4FD1C5] font-semibold">{item.speciality}</span>
                </div>
                <span className="font-mono text-xs font-bold text-[#17324D] dark:text-[#E2EEF4]">
                  {item.bookedSlots}/{item.totalSlots}
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-slate-200 dark:bg-slate-700 h-2.5 rounded-full overflow-hidden flex">
                <div
                  className="bg-[#087F6D] h-full"
                  style={{ width: `${(item.bookedSlots / item.totalSlots) * 100}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[10px] text-[#64748B] dark:text-[#7B9EA8] pt-0.5">
                <span>{item.date}</span>
                <span className="font-bold text-[#087F6D] dark:text-[#4FD1C5]">{item.utilizationRate}% Booked</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Specialist Outreach Coverage Table ───────────────────────────── */}
      <section className="rounded-2xl border border-[#DDE8E4] dark:border-[#1A3A3A] bg-white dark:bg-[#0A2020] overflow-hidden shadow-xs space-y-3 p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h2 className="text-base font-bold text-[#17324D] dark:text-[#E2EEF4]">
            Specialist Outstation Deployments & Schedule
          </h2>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-[#64748B] dark:text-[#7B9EA8] absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search doctor, speciality, PHC..."
              className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-[#DDE8E4] dark:border-[#1A3A3A] bg-[#F5F9F7] dark:bg-[#0F2929] text-xs font-medium text-[#17324D] dark:text-[#E2EEF4]"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F5F9F7] dark:bg-[#0F2929] border-b border-[#DDE8E4] dark:border-[#1A3A3A] text-[#64748B] dark:text-[#7B9EA8]">
              <tr>
                <th className="p-3 font-bold">Specialist</th>
                <th className="p-3 font-bold">{t.specialityLabel}</th>
                <th className="p-3 font-bold">Base Hospital</th>
                <th className="p-3 font-bold">Target PHC Venue</th>
                <th className="p-3 font-bold">{t.preferredDateLabel}</th>
                <th className="p-3 font-bold">Capacity Slots</th>
                <th className="p-3 font-bold">Booked</th>
                <th className="p-3 font-bold">Utilization</th>
                <th className="p-3 font-bold text-right">MMU Vehicle</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DDE8E4] dark:divide-[#1A3A3A]">
              {filtered.map((row) => (
                <tr key={row.id} className="hover:bg-[#F5F9F7]/60 dark:hover:bg-[#0F2929]/50 transition-colors">
                  <td className="p-3 font-bold text-[#17324D] dark:text-[#E2EEF4]">
                    {row.doctorName}
                  </td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded-md bg-[#EAF7F2] dark:bg-[#073B3A] text-[#087F6D] dark:text-[#4FD1C5] font-semibold text-[10px]">
                      {row.speciality}
                    </span>
                  </td>
                  <td className="p-3 text-[#64748B] dark:text-[#7B9EA8]">
                    {row.parentHospital}
                  </td>
                  <td className="p-3 font-semibold text-[#17324D] dark:text-[#E2EEF4]">
                    {row.targetPHC}
                  </td>
                  <td className="p-3 text-[#64748B] dark:text-[#7B9EA8]">
                    {row.date}
                  </td>
                  <td className="p-3 font-mono">
                    {row.totalSlots}
                  </td>
                  <td className="p-3 font-mono font-bold text-[#087F6D] dark:text-[#4FD1C5]">
                    {row.bookedSlots}
                  </td>
                  <td className="p-3 font-bold text-[#17324D] dark:text-[#E2EEF4]">
                    {row.utilizationRate}%
                  </td>
                  <td className="p-3 text-right">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                      {row.mmuStatus}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};
