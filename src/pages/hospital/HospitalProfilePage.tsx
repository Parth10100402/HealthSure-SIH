// HealthSure — Hospital Facility Profile Page
// frontend/src/pages/hospital/HospitalProfilePage.tsx

import React from 'react';
import {
  Building2,
  CheckCircle2,
} from 'lucide-react';
import { mockHospitalProfile } from '../../data/hospitalMockData';

export const HospitalProfilePage: React.FC = () => {
  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-200">
      {/* Header */}
      <div className="border-b border-[#DDE8E4] dark:border-[#1A3A3A] pb-4">
        <h1 className="text-xl sm:text-2xl font-bold text-[#17324D] dark:text-[#E2EEF4]">
          Hospital Facility & Nodal Network Profile
        </h1>
      </div>

      {/* Profile Card */}
      <div className="p-6 rounded-2xl border border-[#DDE8E4] dark:border-[#1A3A3A] bg-white dark:bg-[#0A2020] space-y-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#DDE8E4]/60 dark:border-[#1A3A3A] pb-5">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-[#087F6D] text-white flex items-center justify-center text-2xl font-bold">
              DH
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-bold text-[#17324D] dark:text-[#E2EEF4]">
                  {mockHospitalProfile.name}
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-[#EAF7F2] dark:bg-[#073B3A] text-[#087F6D] dark:text-[#4FD1C5] text-xs font-bold font-mono">
                  {mockHospitalProfile.id}
                </span>
              </div>
              <p className="text-xs text-[#64748B] dark:text-[#7B9EA8] mt-0.5">
                {mockHospitalProfile.type} • District: {mockHospitalProfile.district}, {mockHospitalProfile.state}
              </p>
            </div>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 font-bold text-xs self-start sm:self-auto">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Nodal Referral Hub</span>
          </div>
        </div>

        {/* Key Facility Numbers */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-[#F5F9F7] dark:bg-[#0F2929] border border-[#DDE8E4]/50 dark:border-[#1A3A3A] space-y-1">
            <span className="text-[#64748B] block uppercase font-bold text-[10px]">Bed Strength</span>
            <div className="text-lg font-bold text-[#17324D] dark:text-[#E2EEF4]">
              {mockHospitalProfile.occupiedBeds} / {mockHospitalProfile.totalBeds} Beds
            </div>
            <div className="text-[11px] text-[#087F6D] font-semibold">General, ICU, HDU & Maternity</div>
          </div>

          <div className="p-4 rounded-xl bg-[#F5F9F7] dark:bg-[#0F2929] border border-[#DDE8E4]/50 dark:border-[#1A3A3A] space-y-1">
            <span className="text-[#64748B] block uppercase font-bold text-[10px]">Active Specialists</span>
            <div className="text-lg font-bold text-[#17324D] dark:text-[#E2EEF4]">
              {mockHospitalProfile.activeSpecialistsCount} Doctors
            </div>
            <div className="text-[11px] text-[#087F6D] font-semibold">Across 8 Medical Specialties</div>
          </div>

          <div className="p-4 rounded-xl bg-[#F5F9F7] dark:bg-[#0F2929] border border-[#DDE8E4]/50 dark:border-[#1A3A3A] space-y-1">
            <span className="text-[#64748B] block uppercase font-bold text-[10px]">Emergency Helplines</span>
            <div className="text-lg font-bold text-[#17324D] dark:text-[#E2EEF4]">
              {mockHospitalProfile.emergencyHelpline}
            </div>
            <div className="text-[11px] text-[#64748B]">Ambulance & Casualty Service</div>
          </div>
        </div>

        {/* Administration & Contact */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-3.5 rounded-xl bg-[#F5F9F7] dark:bg-[#0F2929] border border-[#DDE8E4]/50 dark:border-[#1A3A3A] space-y-1">
            <span className="text-[#64748B]">Civil Surgeon / Nodal Officer:</span>
            <strong className="text-[#17324D] dark:text-[#E2EEF4] block text-sm">
              {mockHospitalProfile.nodalOfficer}
            </strong>
          </div>

          <div className="p-3.5 rounded-xl bg-[#F5F9F7] dark:bg-[#0F2929] border border-[#DDE8E4]/50 dark:border-[#1A3A3A] space-y-1">
            <span className="text-[#64748B]">Official Contact:</span>
            <strong className="text-[#17324D] dark:text-[#E2EEF4] block text-sm">
              {mockHospitalProfile.contactPhone}
            </strong>
          </div>
        </div>

        {/* Assigned Rural Primary Health Centres Network */}
        <div className="pt-2 border-t border-[#DDE8E4]/60 dark:border-[#1A3A3A] space-y-2">
          <h3 className="text-xs font-bold text-[#17324D] dark:text-[#E2EEF4] uppercase tracking-wider">
            Connected Primary Health Centres & Sub-Centres
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {mockHospitalProfile.assignedPHCs.map((phc, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-[#EAF7F2] dark:bg-[#073B3A] text-[#087F6D] dark:text-[#4FD1C5] font-semibold text-xs border border-[#087F6D]/20 flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4" />
                  <span>{phc}</span>
                </div>
                <span className="text-[10px] font-bold uppercase bg-white/50 dark:bg-black/20 px-2 py-0.5 rounded-md">
                  Active Link
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
