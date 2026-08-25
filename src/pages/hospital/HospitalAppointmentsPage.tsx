// HealthSure — Hospital Appointments Management Page
// frontend/src/pages/hospital/HospitalAppointmentsPage.tsx

import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import type { DoctorAppointmentSummary } from '../../types/doctor';
import { hospitalService } from '../../services/hospitalService';

export const HospitalAppointmentsPage: React.FC = () => {
  const [appointments, setAppointments] = useState<DoctorAppointmentSummary[]>([]);
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    hospitalService.getAppointments().then(setAppointments);
  }, []);

  const filtered = appointments.filter((apt) => {
    const matchesDept = departmentFilter === 'all' || apt.speciality.toLowerCase() === departmentFilter.toLowerCase();
    const matchesSearch =
      apt.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      apt.tokenNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      apt.patientId.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesDept && matchesSearch;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="border-b border-[#DDE8E4] dark:border-[#1A3A3A] pb-4">
        <h1 className="text-xl sm:text-2xl font-bold text-[#17324D] dark:text-[#E2EEF4]">
          Hospital Outpatient Appointments (OPD)
        </h1>
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-white dark:bg-[#0A2020] p-4 rounded-2xl border border-[#DDE8E4] dark:border-[#1A3A3A] shadow-xs">
        <div className="sm:col-span-2 relative">
          <Search className="w-4 h-4 text-[#64748B] absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search by patient name, ID, or token number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-[#DDE8E4] dark:border-[#1A3A3A] bg-[#F5F9F7] dark:bg-[#0F2929] text-[#17324D] dark:text-[#E2EEF4] focus:outline-none focus:ring-2 focus:ring-[#087F6D]"
          />
        </div>

        <div>
          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="w-full py-2 px-3 text-xs font-semibold rounded-xl border border-[#DDE8E4] dark:border-[#1A3A3A] bg-[#F5F9F7] dark:bg-[#0F2929] text-[#17324D] dark:text-[#E2EEF4] focus:outline-none focus:ring-2 focus:ring-[#087F6D]"
          >
            <option value="all">All Departments</option>
            <option value="Cardiology">Cardiology (Room 104)</option>
            <option value="Orthopaedics">Orthopaedics (Room 108)</option>
            <option value="General Medicine">General Medicine (Room 101)</option>
            <option value="Ophthalmology">Ophthalmology (Room 202)</option>
          </select>
        </div>
      </div>

      {/* Table / Cards */}
      <div className="space-y-3">
        {filtered.map((apt) => (
          <div
            key={apt.id}
            className="p-4 sm:p-5 rounded-2xl border border-[#DDE8E4] dark:border-[#1A3A3A] bg-white dark:bg-[#0A2020] flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs"
          >
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono font-bold text-xs px-2.5 py-0.5 rounded-lg bg-[#EAF7F2] dark:bg-[#073B3A] text-[#087F6D] dark:text-[#4FD1C5]">
                  {apt.time}
                </span>
                <span className="font-mono text-xs font-bold text-[#17324D] dark:text-[#E2EEF4]">
                  Token: {apt.tokenNumber}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#F5F9F7] dark:bg-[#0F2929] text-[#64748B]">
                  OPD Room 104
                </span>
                {apt.referralId && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-50 text-amber-800">
                    Ref: {apt.referralId}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-[#17324D] dark:text-[#E2EEF4]">
                  {apt.patientName}
                </h3>
                <span className="text-xs text-[#64748B]">
                  ({apt.patientAge}y • {apt.patientGender} • {apt.patientVillage})
                </span>
              </div>

              <div className="text-xs text-[#64748B] dark:text-[#7B9EA8]">
                Doctor: <strong className="text-[#087F6D] font-semibold">Dr. Ananya Mehta</strong> • Origin: {apt.referringPHC}
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span className="px-3 py-1 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-bold">
                {apt.status === 'waiting' ? 'Waiting in OPD' : 'Confirmed'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
