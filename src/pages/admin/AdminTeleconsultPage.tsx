// HealthSure — Government Admin Teleconsultation Monitoring Page
// frontend/src/pages/admin/AdminTeleconsultPage.tsx

import React, { useState, useEffect } from 'react';
import { Video, Signal, Search } from 'lucide-react';
import { adminService } from '../../services/adminService';
import { useTranslation } from '../../lib/i18n/useTranslation';
import type { TeleconsultationStats } from '../../types/admin';

interface TeleLog {
  id: string;
  patientId: string;
  doctorName: string;
  speciality: string;
  originKiosk: string;
  date: string;
  durationMins: number;
  networkMode: '2G Adaptive Audio' | 'HD Video';
  status: 'Completed' | 'Pending' | 'Cancelled';
}

const mockTeleLogs: TeleLog[] = [
  {
    id: 'TC-LOG-01',
    patientId: 'HS-10248 (Parth Sharma)',
    doctorName: 'Dr. Ananya Mehta',
    speciality: 'Cardiology',
    originKiosk: 'PHC Khed Tele-Kiosk',
    date: '2026-08-23 10:15 AM',
    durationMins: 12,
    networkMode: '2G Adaptive Audio',
    status: 'Completed',
  },
  {
    id: 'TC-LOG-02',
    patientId: 'HS-10312 (Sunita Gaikwad)',
    doctorName: 'Dr. Rajesh Deshmukh',
    speciality: 'Orthopaedics',
    originKiosk: 'PHC Chiplun Tele-Kiosk',
    date: '2026-08-23 11:00 AM',
    durationMins: 15,
    networkMode: 'HD Video',
    status: 'Completed',
  },
  {
    id: 'TC-LOG-03',
    patientId: 'HS-10384 (Anil Jadhav)',
    doctorName: 'Dr. Arvind Joshi',
    speciality: 'Ophthalmology',
    originKiosk: 'PHC Dapoli Tele-Kiosk',
    date: '2026-08-23 11:45 AM',
    durationMins: 0,
    networkMode: '2G Adaptive Audio',
    status: 'Pending',
  },
  {
    id: 'TC-LOG-04',
    patientId: 'HS-10190 (Meena Kadam)',
    doctorName: 'Dr. Priya Sonawane',
    speciality: 'Paediatrics',
    originKiosk: 'PHC Guhagar Tele-Kiosk',
    date: '2026-08-22 03:30 PM',
    durationMins: 9,
    networkMode: '2G Adaptive Audio',
    status: 'Completed',
  },
];

export const AdminTeleconsultPage: React.FC = () => {
  const t = useTranslation();
  const [stats, setStats] = useState<TeleconsultationStats | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    adminService.getTeleconsultStats().then(setStats);
  }, []);

  if (!stats) return null;

  const filtered = mockTeleLogs.filter(
    (log) =>
      log.patientId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.doctorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.originKiosk.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="border-b border-[#DDE8E4] dark:border-[#1A3A3A] pb-4">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#EAF7F2] dark:bg-[#073B3A] text-[#087F6D] dark:text-[#4FD1C5] text-xs font-bold mb-1">
          <Video className="w-3.5 h-3.5" />
          <span>Tele-Medicine Infrastructure Oversight</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-bold text-[#17324D] dark:text-[#E2EEF4]">
          {t.teleconsultVolume} & 2G Adoption Tracking
        </h1>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-white dark:bg-[#0A2020] border border-[#DDE8E4] dark:border-[#1A3A3A] shadow-xs space-y-1">
          <div className="text-xs text-[#64748B] dark:text-[#7B9EA8] font-bold uppercase tracking-wider">
            Total Sessions
          </div>
          <div className="text-2xl font-extrabold text-[#17324D] dark:text-[#E2EEF4]">
            {stats.total.toLocaleString()}
          </div>
          <div className="text-[11px] text-[#64748B] dark:text-[#7B9EA8]">Monthly Division Total</div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#0A2020] border border-[#DDE8E4] dark:border-[#1A3A3A] shadow-xs space-y-1">
          <div className="text-xs text-[#64748B] dark:text-[#7B9EA8] font-bold uppercase tracking-wider">
            Successfully Completed
          </div>
          <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
            {stats.completed.toLocaleString()}
          </div>
          <div className="text-[11px] text-emerald-700 dark:text-emerald-300 font-semibold">
            {Math.round((stats.completed / stats.total) * 100)}% Success Rate
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#0A2020] border border-[#DDE8E4] dark:border-[#1A3A3A] shadow-xs space-y-1">
          <div className="text-xs text-[#64748B] dark:text-[#7B9EA8] font-bold uppercase tracking-wider">
            {t.lowBandwidthAdoption}
          </div>
          <div className="text-2xl font-extrabold text-blue-600 dark:text-blue-400">
            {stats.lowBandwidthPercent}%
          </div>
          <div className="text-[11px] text-blue-700 dark:text-blue-300 font-semibold">
            {stats.lowBandwidth2gCount} Sessions via 2G Mode
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#0A2020] border border-[#DDE8E4] dark:border-[#1A3A3A] shadow-xs space-y-1">
          <div className="text-xs text-[#64748B] dark:text-[#7B9EA8] font-bold uppercase tracking-wider">
            Queue / Cancelled
          </div>
          <div className="text-2xl font-extrabold text-amber-600 dark:text-amber-400">
            {stats.pending} / {stats.cancelled}
          </div>
          <div className="text-[11px] text-amber-700 dark:text-amber-300 font-semibold">
            Low dropout rate (3.7%)
          </div>
        </div>
      </div>

      {/* 2G Low Bandwidth Architectural Explanation Note */}
      <div className="p-4 rounded-2xl bg-[#EAF7F2] dark:bg-[#073B3A]/40 border border-[#087F6D]/20 text-xs text-[#17324D] dark:text-[#D1E8E2] space-y-1">
        <div className="font-bold text-[#087F6D] dark:text-[#4FD1C5] flex items-center gap-1.5">
          <Signal className="w-4 h-4" />
          <span>Why 2G Low-Bandwidth Adaptive Monitoring Matters for Public Health:</span>
        </div>
        <p className="text-[#64748B] dark:text-[#7B9EA8] leading-relaxed">
          Over 68% of rural patients in hilly or remote coastal talukas experience cellular drop-offs during video calls. HealthSure automatically downgrades the WebRTC bitrate to high-definition voice mode, allowing the medical consultation and electronic prescription transmission to complete without interruption.
        </p>
      </div>

      {/* Teleconsultation Sessions Table */}
      <div className="rounded-2xl border border-[#DDE8E4] dark:border-[#1A3A3A] bg-white dark:bg-[#0A2020] p-5 space-y-4 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h2 className="text-base font-bold text-[#17324D] dark:text-[#E2EEF4]">
            Recent Teleconsultation Audit Logs
          </h2>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-[#64748B] dark:text-[#7B9EA8] absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search patient, doctor, kiosk..."
              className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-[#DDE8E4] dark:border-[#1A3A3A] bg-[#F5F9F7] dark:bg-[#0F2929] text-xs font-medium text-[#17324D] dark:text-[#E2EEF4]"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F5F9F7] dark:bg-[#0F2929] border-b border-[#DDE8E4] dark:border-[#1A3A3A] text-[#64748B] dark:text-[#7B9EA8]">
              <tr>
                <th className="p-3 font-bold">Session ID</th>
                <th className="p-3 font-bold">Patient</th>
                <th className="p-3 font-bold">Specialist Doctor</th>
                <th className="p-3 font-bold">Origin Tele-Kiosk</th>
                <th className="p-3 font-bold">Date & Time</th>
                <th className="p-3 font-bold">Network Mode</th>
                <th className="p-3 font-bold">Duration</th>
                <th className="p-3 font-bold text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DDE8E4] dark:divide-[#1A3A3A]">
              {filtered.map((log) => (
                <tr key={log.id} className="hover:bg-[#F5F9F7]/60 dark:hover:bg-[#0F2929]/50 transition-colors">
                  <td className="p-3 font-mono font-bold text-[#087F6D] dark:text-[#4FD1C5]">
                    {log.id}
                  </td>
                  <td className="p-3 font-semibold text-[#17324D] dark:text-[#E2EEF4]">
                    {log.patientId}
                  </td>
                  <td className="p-3 text-[#17324D] dark:text-[#D1E8E2]">
                    {log.doctorName} ({log.speciality})
                  </td>
                  <td className="p-3 text-[#64748B] dark:text-[#7B9EA8]">
                    {log.originKiosk}
                  </td>
                  <td className="p-3 text-[#64748B] dark:text-[#7B9EA8]">
                    {log.date}
                  </td>
                  <td className="p-3">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 font-semibold text-[10px]">
                      <Signal className="w-3 h-3" />
                      {log.networkMode}
                    </span>
                  </td>
                  <td className="p-3 font-mono">
                    {log.durationMins > 0 ? `${log.durationMins} mins` : '—'}
                  </td>
                  <td className="p-3 text-right">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        log.status === 'Completed'
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                          : 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                      }`}
                    >
                      {log.status}
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
