// HealthSure — Government Admin Appointments Monitoring Page
// frontend/src/pages/admin/AdminAppointmentsPage.tsx

import React, { useState } from 'react';
import { Calendar, Search } from 'lucide-react';
import { useTranslation } from '../../lib/i18n/useTranslation';

interface AppointmentMetricRow {
  id: string;
  facility: string;
  department: string;
  inPersonToday: number;
  teleconsultToday: number;
  totalTokens: number;
  averageWaitTimeMins: number;
  status: 'Normal Flow' | 'High Load';
}

const mockAppointmentRows: AppointmentMetricRow[] = [
  {
    id: 'APT-MTR-01',
    facility: 'District Hospital Ratnagiri',
    department: 'Cardiology (Room 104)',
    inPersonToday: 32,
    teleconsultToday: 10,
    totalTokens: 42,
    averageWaitTimeMins: 18,
    status: 'Normal Flow',
  },
  {
    id: 'APT-MTR-02',
    facility: 'District Hospital Ratnagiri',
    department: 'Orthopaedics (Room 108)',
    inPersonToday: 38,
    teleconsultToday: 6,
    totalTokens: 44,
    averageWaitTimeMins: 22,
    status: 'Normal Flow',
  },
  {
    id: 'APT-MTR-03',
    facility: 'District Hospital Ratnagiri',
    department: 'General Medicine (Room 101)',
    inPersonToday: 64,
    teleconsultToday: 14,
    totalTokens: 78,
    averageWaitTimeMins: 35,
    status: 'High Load',
  },
  {
    id: 'APT-MTR-04',
    facility: 'Sub-District Hospital Sawantwadi',
    department: 'Paediatrics (Room 202)',
    inPersonToday: 24,
    teleconsultToday: 8,
    totalTokens: 32,
    averageWaitTimeMins: 14,
    status: 'Normal Flow',
  },
  {
    id: 'APT-MTR-05',
    facility: 'PHC Khed (Tele-Kiosk)',
    department: 'Remote Specialist Queue',
    inPersonToday: 0,
    teleconsultToday: 16,
    totalTokens: 16,
    averageWaitTimeMins: 8,
    status: 'Normal Flow',
  },
];

export const AdminAppointmentsPage: React.FC = () => {
  const t = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = mockAppointmentRows.filter(
    (row) =>
      row.facility.toLowerCase().includes(searchQuery.toLowerCase()) ||
      row.department.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalInPerson = mockAppointmentRows.reduce((a, b) => a + b.inPersonToday, 0);
  const totalTele = mockAppointmentRows.reduce((a, b) => a + b.teleconsultToday, 0);
  const totalAll = totalInPerson + totalTele;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="border-b border-[#DDE8E4] dark:border-[#1A3A3A] pb-4">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#EAF7F2] dark:bg-[#073B3A] text-[#087F6D] dark:text-[#4FD1C5] text-xs font-bold mb-1">
          <Calendar className="w-3.5 h-3.5" />
          <span>Daily Consultation Traffic Oversight</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-bold text-[#17324D] dark:text-[#E2EEF4]">
          {t.navAppointments} Load & OPD Queue Monitoring
        </h1>
      </div>

      {/* Summary KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-4 rounded-2xl bg-white dark:bg-[#0A2020] border border-[#DDE8E4] dark:border-[#1A3A3A] shadow-xs space-y-1">
          <div className="text-xs text-[#64748B] dark:text-[#7B9EA8] font-bold uppercase tracking-wider">
            Total Patients Today
          </div>
          <div className="text-2xl font-extrabold text-[#17324D] dark:text-[#E2EEF4]">
            {totalAll} Consultations
          </div>
          <div className="text-[11px] text-[#64748B] dark:text-[#7B9EA8]">Across 5 Monitored Departments</div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#0A2020] border border-[#DDE8E4] dark:border-[#1A3A3A] shadow-xs space-y-1">
          <div className="text-xs text-[#64748B] dark:text-[#7B9EA8] font-bold uppercase tracking-wider">
            In-Person OPD Consults
          </div>
          <div className="text-2xl font-extrabold text-[#087F6D] dark:text-[#4FD1C5]">
            {totalInPerson} ({Math.round((totalInPerson / totalAll) * 100)}%)
          </div>
          <div className="text-[11px] text-[#087F6D] font-semibold">Hospital OPD Desk Visits</div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#0A2020] border border-[#DDE8E4] dark:border-[#1A3A3A] shadow-xs space-y-1">
          <div className="text-xs text-[#64748B] dark:text-[#7B9EA8] font-bold uppercase tracking-wider">
            Remote Teleconsultations
          </div>
          <div className="text-2xl font-extrabold text-blue-600 dark:text-blue-400">
            {totalTele} ({Math.round((totalTele / totalAll) * 100)}%)
          </div>
          <div className="text-[11px] text-blue-600 font-semibold">PHC Kiosk & Rural Video Mode</div>
        </div>
      </div>

      {/* Department Traffic Table */}
      <div className="rounded-2xl border border-[#DDE8E4] dark:border-[#1A3A3A] bg-white dark:bg-[#0A2020] p-5 space-y-4 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h2 className="text-base font-bold text-[#17324D] dark:text-[#E2EEF4]">
            Departmental OPD Flow & Waiting Time
          </h2>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-[#64748B] dark:text-[#7B9EA8] absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search facility or department..."
              className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-[#DDE8E4] dark:border-[#1A3A3A] bg-[#F5F9F7] dark:bg-[#0F2929] text-xs font-medium text-[#17324D] dark:text-[#E2EEF4]"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F5F9F7] dark:bg-[#0F2929] border-b border-[#DDE8E4] dark:border-[#1A3A3A] text-[#64748B] dark:text-[#7B9EA8]">
              <tr>
                <th className="p-3 font-bold">Facility</th>
                <th className="p-3 font-bold">Department / Room</th>
                <th className="p-3 font-bold">In-Person OPD</th>
                <th className="p-3 font-bold">Tele-Consults</th>
                <th className="p-3 font-bold">Total Tokens</th>
                <th className="p-3 font-bold">Avg Wait Time</th>
                <th className="p-3 font-bold text-right">Traffic Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DDE8E4] dark:divide-[#1A3A3A]">
              {filtered.map((row) => (
                <tr key={row.id} className="hover:bg-[#F5F9F7]/60 dark:hover:bg-[#0F2929]/50 transition-colors">
                  <td className="p-3 font-bold text-[#17324D] dark:text-[#E2EEF4]">
                    {row.facility}
                  </td>
                  <td className="p-3 text-[#64748B] dark:text-[#7B9EA8]">
                    {row.department}
                  </td>
                  <td className="p-3 font-semibold text-[#087F6D] dark:text-[#4FD1C5]">
                    {row.inPersonToday}
                  </td>
                  <td className="p-3 font-semibold text-blue-600 dark:text-blue-400">
                    {row.teleconsultToday}
                  </td>
                  <td className="p-3 font-mono font-bold text-[#17324D] dark:text-[#E2EEF4]">
                    {row.totalTokens}
                  </td>
                  <td className="p-3 text-[#64748B] dark:text-[#7B9EA8]">
                    {row.averageWaitTimeMins} mins
                  </td>
                  <td className="p-3 text-right">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        row.status === 'Normal Flow'
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                          : 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                      }`}
                    >
                      {row.status}
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
