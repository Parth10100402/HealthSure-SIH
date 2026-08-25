// HealthSure — Doctor Profile Page
// frontend/src/pages/doctor/DoctorProfilePage.tsx

import React from 'react';
import {
  Building2,
  CheckCircle2,
} from 'lucide-react';
import { mockDoctorProfile } from '../../data/doctorMockData';

export const DoctorProfilePage: React.FC = () => {
  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-200">
      {/* Header */}
      <div className="border-b border-[#DDE8E4] dark:border-[#1A3A3A] pb-4">
        <h1 className="text-xl sm:text-2xl font-bold text-[#17324D] dark:text-[#E2EEF4]">
          Doctor Clinical Profile
        </h1>
      </div>

      {/* Main Profile Card */}
      <div className="p-6 rounded-2xl border border-[#DDE8E4] dark:border-[#1A3A3A] bg-white dark:bg-[#0A2020] space-y-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#DDE8E4]/60 dark:border-[#1A3A3A] pb-5">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-[#087F6D] text-white flex items-center justify-center text-2xl font-bold">
              AM
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-bold text-[#17324D] dark:text-[#E2EEF4]">
                  {mockDoctorProfile.fullName}
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-[#EAF7F2] dark:bg-[#073B3A] text-[#087F6D] dark:text-[#4FD1C5] text-xs font-bold">
                  {mockDoctorProfile.speciality}
                </span>
              </div>
              <p className="text-xs text-[#64748B] dark:text-[#7B9EA8] mt-0.5">
                {mockDoctorProfile.qualification} • {mockDoctorProfile.experienceYears} Years Clinical Experience
              </p>
              <div className="font-mono text-xs text-[#087F6D] dark:text-[#4FD1C5] mt-1">
                Medical Council Reg: {mockDoctorProfile.registrationNumber}
              </div>
            </div>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 font-bold text-xs self-start sm:self-auto">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Govt Verified Specialist</span>
          </div>
        </div>

        {/* Clinical Assignment Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="space-y-1 p-3.5 rounded-xl bg-[#F5F9F7] dark:bg-[#0F2929] border border-[#DDE8E4]/50 dark:border-[#1A3A3A]">
            <span className="text-[#64748B] dark:text-[#7B9EA8]">Base Hospital</span>
            <div className="font-bold text-sm text-[#17324D] dark:text-[#E2EEF4]">
              {mockDoctorProfile.hospital}
            </div>
            <div className="text-[11px] text-[#087F6D]">{mockDoctorProfile.department}</div>
          </div>

          <div className="space-y-1 p-3.5 rounded-xl bg-[#F5F9F7] dark:bg-[#0F2929] border border-[#DDE8E4]/50 dark:border-[#1A3A3A]">
            <span className="text-[#64748B] dark:text-[#7B9EA8]">OPD Station & Desk</span>
            <div className="font-bold text-sm text-[#17324D] dark:text-[#E2EEF4]">
              {mockDoctorProfile.opdRoom}
            </div>
            <div className="text-[11px] text-[#64748B]">Non-Invasive Cardiac Lab Attached</div>
          </div>

          <div className="space-y-1 p-3.5 rounded-xl bg-[#F5F9F7] dark:bg-[#0F2929] border border-[#DDE8E4]/50 dark:border-[#1A3A3A]">
            <span className="text-[#64748B] dark:text-[#7B9EA8]">Official Phone</span>
            <div className="font-bold text-sm text-[#17324D] dark:text-[#E2EEF4]">
              {mockDoctorProfile.phone}
            </div>
          </div>

          <div className="space-y-1 p-3.5 rounded-xl bg-[#F5F9F7] dark:bg-[#0F2929] border border-[#DDE8E4]/50 dark:border-[#1A3A3A]">
            <span className="text-[#64748B] dark:text-[#7B9EA8]">Official Government Email</span>
            <div className="font-bold text-sm text-[#17324D] dark:text-[#E2EEF4]">
              {mockDoctorProfile.email}
            </div>
          </div>
        </div>

        {/* Assigned Rural Outreach Network */}
        <div className="pt-2 border-t border-[#DDE8E4]/60 dark:border-[#1A3A3A] space-y-2">
          <h3 className="text-xs font-bold text-[#17324D] dark:text-[#E2EEF4] uppercase tracking-wider">
            Assigned Rural PHC Outreach Network
          </h3>
          <div className="flex flex-wrap gap-2">
            {mockDoctorProfile.outreachAssignedPHCs.map((phc, idx) => (
              <span
                key={idx}
                className="px-3 py-1.5 rounded-xl bg-[#EAF7F2] dark:bg-[#073B3A] text-[#087F6D] dark:text-[#4FD1C5] font-semibold text-xs border border-[#087F6D]/20 flex items-center gap-1.5"
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>{phc}</span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
