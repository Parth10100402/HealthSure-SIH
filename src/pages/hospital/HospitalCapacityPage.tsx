// HealthSure — Hospital Capacity & Bed Occupancy Page
// frontend/src/pages/hospital/HospitalCapacityPage.tsx

import React, { useState, useEffect } from 'react';
import {
  Users,
  Activity,
  BedDouble,
} from 'lucide-react';
import type { HospitalCapacityMetric } from '../../types/hospital';
import { hospitalService } from '../../services/hospitalService';
import { mockHospitalProfile } from '../../data/hospitalMockData';

export const HospitalCapacityPage: React.FC = () => {
  const [capacity, setCapacity] = useState<HospitalCapacityMetric[]>([]);

  useEffect(() => {
    hospitalService.getCapacityMetrics().then(setCapacity);
  }, []);

  const totalDailySlots = capacity.reduce((acc, c) => acc + c.totalDailySlots, 0);
  const totalBookedSlots = capacity.reduce((acc, c) => acc + c.bookedSlots, 0);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="border-b border-[#DDE8E4] dark:border-[#1A3A3A] pb-4">
        <h1 className="text-xl sm:text-2xl font-bold text-[#17324D] dark:text-[#E2EEF4]">
          Hospital Operations & Bed Capacity
        </h1>
        <p className="text-xs sm:text-sm text-[#64748B] dark:text-[#7B9EA8] mt-0.5">
          Real-time bed occupancy, specialist OPD slots, and emergency triage load for District Hospital Ratnagiri.
        </p>
      </div>

      {/* Capacity Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Bed Occupancy */}
        <div className="p-5 rounded-2xl border border-[#DDE8E4] dark:border-[#1A3A3A] bg-white dark:bg-[#0A2020] space-y-2 shadow-xs">
          <div className="flex items-center justify-between text-xs text-[#64748B]">
            <span className="font-bold uppercase tracking-wider text-[10px]">Inpatient Bed Occupancy</span>
            <BedDouble className="w-4 h-4 text-[#087F6D]" />
          </div>
          <div className="text-2xl font-extrabold text-[#17324D] dark:text-[#E2EEF4]">
            {mockHospitalProfile.occupiedBeds} / {mockHospitalProfile.totalBeds}
          </div>
          <div className="w-full h-2 rounded-full bg-[#EAF7F2] dark:bg-[#0F2929] overflow-hidden">
            <div
              className="h-full bg-[#087F6D] rounded-full"
              style={{ width: `${(mockHospitalProfile.occupiedBeds / mockHospitalProfile.totalBeds) * 100}%` }}
            />
          </div>
          <div className="text-[11px] text-[#64748B] dark:text-[#7B9EA8]">
            {mockHospitalProfile.totalBeds - mockHospitalProfile.occupiedBeds} General & ICU beds available
          </div>
        </div>

        {/* OPD Daily Slots */}
        <div className="p-5 rounded-2xl border border-[#DDE8E4] dark:border-[#1A3A3A] bg-white dark:bg-[#0A2020] space-y-2 shadow-xs">
          <div className="flex items-center justify-between text-xs text-[#64748B]">
            <span className="font-bold uppercase tracking-wider text-[10px]">OPD Consultations</span>
            <Users className="w-4 h-4 text-[#087F6D]" />
          </div>
          <div className="text-2xl font-extrabold text-[#17324D] dark:text-[#E2EEF4]">
            {totalBookedSlots} / {totalDailySlots}
          </div>
          <div className="w-full h-2 rounded-full bg-[#EAF7F2] dark:bg-[#0F2929] overflow-hidden">
            <div
              className="h-full bg-[#087F6D] rounded-full"
              style={{ width: `${(totalBookedSlots / totalDailySlots) * 100}%` }}
            />
          </div>
          <div className="text-[11px] text-[#087F6D] dark:text-[#4FD1C5] font-semibold">
            {totalDailySlots - totalBookedSlots} Specialist tokens unreserved
          </div>
        </div>

        {/* Emergency Triage */}
        <div className="p-5 rounded-2xl border border-[#DDE8E4] dark:border-[#1A3A3A] bg-white dark:bg-[#0A2020] space-y-2 shadow-xs">
          <div className="flex items-center justify-between text-xs text-[#64748B]">
            <span className="font-bold uppercase tracking-wider text-[10px]">Emergency Triage</span>
            <Activity className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
            Green (Normal)
          </div>
          <div className="text-[11px] text-[#64748B] dark:text-[#7B9EA8]">
            Trauma OT & 108 Casualty reception fully functional
          </div>
        </div>
      </div>

      {/* Department-wise OPD Queue Table */}
      <div className="space-y-3">
        <h3 className="text-base font-bold text-[#17324D] dark:text-[#E2EEF4]">
          Department OPD Stations & Queue Status
        </h3>

        <div className="space-y-3">
          {capacity.map((cap, idx) => (
            <div
              key={idx}
              className="p-5 rounded-2xl border border-[#DDE8E4] dark:border-[#1A3A3A] bg-white dark:bg-[#0A2020] flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-base font-bold text-[#17324D] dark:text-[#E2EEF4]">
                    {cap.department}
                  </h4>
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-[#EAF7F2] dark:bg-[#0F2929] text-[#087F6D] dark:text-[#4FD1C5]">
                    {cap.opdRoom}
                  </span>
                </div>
                <div className="text-xs text-[#64748B] dark:text-[#7B9EA8]">
                  Lead Specialist: <strong className="text-[#17324D] dark:text-[#E2EEF4]">{cap.specialistName}</strong>
                </div>
              </div>

              <div className="flex items-center gap-6 text-xs">
                <div>
                  <span className="text-[#64748B] block text-[10px] uppercase font-bold">Capacity</span>
                  <strong className="text-[#17324D] dark:text-[#E2EEF4]">
                    {cap.bookedSlots} of {cap.totalDailySlots} Tokens
                  </strong>
                </div>

                <div>
                  <span className="text-[#64748B] block text-[10px] uppercase font-bold">In Waiting Area</span>
                  <strong className="text-amber-700 dark:text-amber-400">
                    {cap.queueWaiting} Patients
                  </strong>
                </div>

                <div>
                  <span className="text-[#64748B] block text-[10px] uppercase font-bold">Status</span>
                  <span
                    className={`px-2.5 py-1 rounded-lg font-bold text-[11px] ${
                      cap.status === 'available'
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-amber-50 text-amber-700'
                    }`}
                  >
                    {cap.status === 'available' ? 'Accepting Referrals' : 'Near Daily Cap'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
