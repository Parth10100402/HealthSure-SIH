// HealthSure — Doctor Specialist Outreach Schedule
// frontend/src/pages/doctor/DoctorOutreachPage.tsx

import React, { useState, useEffect } from 'react';
import {
  Activity,
  Building2,
} from 'lucide-react';
import type { SpecialistOutreach } from '../../types/patient';
import { doctorService } from '../../services/doctorService';

export const DoctorOutreachPage: React.FC = () => {
  const [outreachSchedule, setOutreachSchedule] = useState<SpecialistOutreach[]>([]);

  useEffect(() => {
    doctorService.getOutreachSchedule().then(setOutreachSchedule);
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="space-y-2 border-b border-[#DDE8E4] dark:border-[#1A3A3A] pb-4">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#EAF7F2] dark:bg-[#073B3A] text-[#087F6D] dark:text-[#4FD1C5] text-xs font-bold">
          <Activity className="w-3.5 h-3.5" />
          <span>Rural Care Outreach Program</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-bold text-[#17324D] dark:text-[#E2EEF4]">
          My Specialist Outreach Schedule
        </h1>
        <p className="text-xs sm:text-sm text-[#64748B] dark:text-[#7B9EA8]">
          Scheduled clinical visits to rural Primary Health Centres (PHCs) so local villagers don't need to travel 50km.
        </p>
      </div>

      {/* Explainer Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-[#EAF7F2] via-white to-[#EAF7F2] dark:from-[#073B3A]/40 dark:via-[#0A2020] dark:to-[#073B3A]/40 border border-[#087F6D]/20 text-xs text-[#17324D] dark:text-[#D1E8E2] space-y-1">
        <strong className="text-[#073B3A] dark:text-[#4FD1C5] block font-bold">
          Physician Mobility Model (HealthSure Core):
        </strong>
        <p className="text-[#64748B] dark:text-[#7B9EA8] leading-relaxed">
          Instead of 20 cardiac patients travelling from Khed to Ratnagiri, Dr. Ananya Mehta conducts scheduled outpatient evaluations directly at PHC Khed.
        </p>
      </div>

      {/* Outreach Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {outreachSchedule.map((camp) => (
          <div
            key={camp.id}
            className="p-5 rounded-2xl border border-[#DDE8E4] dark:border-[#1A3A3A] bg-white dark:bg-[#0A2020] space-y-4 shadow-xs"
          >
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded-lg bg-[#EAF7F2] dark:bg-[#073B3A] text-[#087F6D] dark:text-[#4FD1C5]">
                {camp.dayOfWeek} • {camp.date}
              </span>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                Confirmed Deployment
              </span>
            </div>

            <div>
              <h3 className="text-base font-bold text-[#17324D] dark:text-[#E2EEF4]">
                {camp.speciality} Outreach Clinic
              </h3>
              <div className="text-xs text-[#087F6D] dark:text-[#4FD1C5] font-semibold mt-0.5 flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5" />
                <span>Venue: {camp.outreachLocation}</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[#F5F9F7] dark:bg-[#0F2929] border border-[#DDE8E4]/50 dark:border-[#1A3A3A] text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-[#64748B]">Timings:</span>
                <strong className="font-semibold">{camp.timeSlot}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-[#64748B]">Slot Allocation:</span>
                <strong className="text-[#087F6D] font-bold">
                  {camp.totalSlots - camp.availableSlots} Booked of {camp.totalSlots} Total ({camp.availableSlots} Remaining)
                </strong>
              </div>
              <div className="flex justify-between">
                <span className="text-[#64748B]">Coordinator:</span>
                <span className="font-mono">{camp.contactPhone}</span>
              </div>
            </div>

            <div className="pt-2 border-t border-[#DDE8E4]/60 dark:border-[#1A3A3A] flex items-center justify-between">
              <span className="text-[11px] text-[#64748B]">Mobile Medical Unit Transport Arranged</span>
              <button
                type="button"
                onClick={() => alert(`Opening booked patient roster for ${camp.outreachLocation} (${camp.date}). Includes Parth Sharma and 7 other registered villagers.`)}
                className="py-1.5 px-3.5 rounded-xl bg-[#087F6D] hover:bg-[#073B3A] text-white text-xs font-bold shadow-xs transition-colors"
              >
                View Patient Roster
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
