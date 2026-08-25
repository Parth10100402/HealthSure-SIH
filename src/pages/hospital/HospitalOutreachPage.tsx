// HealthSure — Hospital Specialist Outreach Management Page
// frontend/src/pages/hospital/HospitalOutreachPage.tsx

import React, { useState, useEffect } from 'react';
import {
  Activity,
  Plus,
  Truck,
  CheckCircle2,
} from 'lucide-react';
import type { OutreachCampManagementItem } from '../../types/hospital';
import { hospitalService } from '../../services/hospitalService';
import { OutreachCreateModal } from '../../components/hospital/OutreachCreateModal';

export const HospitalOutreachPage: React.FC = () => {
  const [camps, setCamps] = useState<OutreachCampManagementItem[]>([]);
  const [createModalOpen, setCreateModalOpen] = useState(false);

  const loadData = async () => {
    const data = await hospitalService.getOutreachCamps();
    setCamps(data);
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#DDE8E4] dark:border-[#1A3A3A] pb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#EAF7F2] dark:bg-[#073B3A] text-[#087F6D] dark:text-[#4FD1C5] text-xs font-bold mb-1">
            <Activity className="w-3.5 h-3.5" />
            <span>HealthSure Specialist Mobility</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#17324D] dark:text-[#E2EEF4]">
            Specialist Outreach Camp Dispatch
          </h1>
        </div>

        <button
          type="button"
          onClick={() => setCreateModalOpen(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-[#087F6D] hover:bg-[#073B3A] text-white text-xs sm:text-sm font-bold px-4 py-2.5 transition-all shadow-xs shrink-0 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Dispatch New Outreach Camp</span>
        </button>
      </div>

      {/* Outreach Operations Grid */}
      <div className="space-y-4">
        {camps.map((camp) => (
          <div
            key={camp.id}
            className="p-5 rounded-2xl border border-[#DDE8E4] dark:border-[#1A3A3A] bg-white dark:bg-[#0A2020] space-y-4 shadow-xs"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#DDE8E4]/60 dark:border-[#1A3A3A] pb-3">
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-xs px-2.5 py-1 rounded-lg bg-[#EAF7F2] dark:bg-[#073B3A] text-[#087F6D] dark:text-[#4FD1C5]">
                  {camp.id}
                </span>
                <span className="text-xs font-bold text-[#17324D] dark:text-[#E2EEF4]">
                  📅 {camp.date} • {camp.timeSlot}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold">
                  Active Deployment
                </span>
              </div>
            </div>

            {/* Doctor, Venue & Capacity Details */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-[#F5F9F7] dark:bg-[#0F2929] p-3.5 rounded-xl border border-[#DDE8E4]/60 dark:border-[#1A3A3A]">
              <div>
                <span className="text-[10px] text-[#64748B] block font-bold">Clinical Specialty & Doctor:</span>
                <strong className="text-sm text-[#087F6D] dark:text-[#4FD1C5]">{camp.speciality}</strong>
                <div className="text-[#17324D] dark:text-[#E2EEF4] font-medium">{camp.doctorName}</div>
              </div>

              <div>
                <span className="text-[10px] text-[#64748B] block font-bold">Destination PHC Venue:</span>
                <strong className="text-sm text-[#17324D] dark:text-[#E2EEF4]">{camp.destinationPHC}</strong>
                <div className="text-[#64748B]">Rural Primary Centre</div>
              </div>

              <div>
                <span className="text-[10px] text-[#64748B] block font-bold">Patient Slot Utilization:</span>
                <strong className="text-sm text-[#17324D] dark:text-[#E2EEF4]">
                  {camp.bookedSlots} Booked / {camp.totalSlots} Slots
                </strong>
                <div className="text-emerald-600 font-semibold">
                  {camp.totalSlots - camp.bookedSlots} slots available to villagers
                </div>
              </div>
            </div>

            {/* Logistics & Transport */}
            <div className="flex flex-wrap items-center justify-between gap-3 text-xs pt-1">
              <div className="flex items-center gap-2 text-[#64748B] dark:text-[#7B9EA8]">
                <Truck className="w-4 h-4 text-[#087F6D]" />
                <span>{camp.driverOrTransportStatus}</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg font-bold text-[11px] flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Medical Kit & Diagnostic Cart Supplied</span>
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Create Modal */}
      <OutreachCreateModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onCreated={() => loadData()}
      />
    </div>
  );
};
