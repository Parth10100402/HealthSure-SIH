// HealthSure — Hospital Create Outreach Camp Modal
// frontend/src/components/hospital/OutreachCreateModal.tsx

import React, { useState } from 'react';
import {
  X,
  Activity,
  RotateCw,
  CheckCircle2,
} from 'lucide-react';
import { hospitalService } from '../../services/hospitalService';
import { mockHospitalProfile } from '../../data/hospitalMockData';

interface OutreachCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: () => void;
}

export const OutreachCreateModal: React.FC<OutreachCreateModalProps> = ({
  isOpen,
  onClose,
  onCreated,
}) => {
  const [speciality, setSpeciality] = useState('Cardiology');
  const [doctorName, setDoctorName] = useState('Dr. Ananya Mehta (MD, DM)');
  const [destinationPHC, setDestinationPHC] = useState('PHC Khed');
  const [date, setDate] = useState('2026-08-31');
  const [timeSlot, setTimeSlot] = useState('09:00 AM - 01:00 PM');
  const [totalSlots, setTotalSlots] = useState(20);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    await hospitalService.createOutreachCamp({
      speciality,
      doctorName,
      destinationPHC,
      date,
      timeSlot,
      totalSlots,
      driverOrTransportStatus: 'Assigned (Govt Mobile Medical Unit #MH-08-G-1402)',
      medicalKitSupplied: true,
    });

    setIsSubmitting(false);
    setSuccess(true);

    setTimeout(() => {
      setSuccess(false);
      onCreated();
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white dark:bg-[#0A2020] rounded-2xl border border-[#DDE8E4] dark:border-[#1A3A3A] p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between border-b border-[#DDE8E4] dark:border-[#1A3A3A] pb-3">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-[#087F6D] dark:text-[#4FD1C5]" />
            <h3 className="text-base font-bold text-[#17324D] dark:text-[#E2EEF4]">
              Dispatch Specialist Outreach Camp
            </h3>
          </div>
          <button type="button" onClick={onClose} className="text-[#64748B] hover:text-[#17324D]">
            <X className="w-5 h-5" />
          </button>
        </div>

        {success && (
          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 text-emerald-800 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Outreach camp dispatched & slots published to patient portal!</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div>
            <label className="block font-semibold text-[#17324D] dark:text-[#D1E8E2] mb-1">
              Clinical Speciality
            </label>
            <select
              value={speciality}
              onChange={(e) => {
                setSpeciality(e.target.value);
                if (e.target.value === 'Cardiology') setDoctorName('Dr. Ananya Mehta (MD, DM)');
                if (e.target.value === 'Orthopaedics') setDoctorName('Dr. Rahul Shah (MS Ortho)');
                if (e.target.value === 'Ophthalmology') setDoctorName('Dr. Neha Kulkarni (MS)');
                if (e.target.value === 'Paediatrics') setDoctorName('Dr. Amit Deshmukh (MD)');
              }}
              className="w-full p-2.5 rounded-xl border border-[#DDE8E4] dark:border-[#1A3A3A] bg-[#F5F9F7] dark:bg-[#0F2929] text-[#17324D] dark:text-[#E2EEF4]"
            >
              <option value="Cardiology">Cardiology</option>
              <option value="Orthopaedics">Orthopaedics</option>
              <option value="Ophthalmology">Ophthalmology</option>
              <option value="Paediatrics">Paediatrics</option>
              <option value="Dermatology">Dermatology</option>
              <option value="General Medicine">General Medicine</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-[#17324D] dark:text-[#D1E8E2] mb-1">
              Assigned Hospital Specialist
            </label>
            <input
              type="text"
              value={doctorName}
              onChange={(e) => setDoctorName(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-[#DDE8E4] dark:border-[#1A3A3A] bg-[#F5F9F7] dark:bg-[#0F2929] text-[#17324D] dark:text-[#E2EEF4] font-semibold"
              required
            />
          </div>

          <div>
            <label className="block font-semibold text-[#17324D] dark:text-[#D1E8E2] mb-1">
              Target Rural Destination (PHC / Sub-Centre)
            </label>
            <select
              value={destinationPHC}
              onChange={(e) => setDestinationPHC(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-[#DDE8E4] dark:border-[#1A3A3A] bg-[#F5F9F7] dark:bg-[#0F2929] text-[#17324D] dark:text-[#E2EEF4]"
            >
              {mockHospitalProfile.assignedPHCs.map((phc) => (
                <option key={phc} value={phc}>{phc}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-[#17324D] dark:text-[#D1E8E2] mb-1">Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-[#DDE8E4] dark:border-[#1A3A3A] bg-[#F5F9F7] dark:bg-[#0F2929] text-[#17324D] dark:text-[#E2EEF4]"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-[#17324D] dark:text-[#D1E8E2] mb-1">Total Patient Slots</label>
              <input
                type="number"
                min={5}
                max={50}
                value={totalSlots}
                onChange={(e) => setTotalSlots(Number(e.target.value))}
                className="w-full p-2.5 rounded-xl border border-[#DDE8E4] dark:border-[#1A3A3A] bg-[#F5F9F7] dark:bg-[#0F2929] text-[#17324D] dark:text-[#E2EEF4]"
                required
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-[#17324D] dark:text-[#D1E8E2] mb-1">Camp Timings</label>
            <input
              type="text"
              value={timeSlot}
              onChange={(e) => setTimeSlot(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-[#DDE8E4] dark:border-[#1A3A3A] bg-[#F5F9F7] dark:bg-[#0F2929] text-[#17324D] dark:text-[#E2EEF4]"
              required
            />
          </div>

          <div className="pt-3 flex items-center justify-end gap-2 border-t border-[#DDE8E4] dark:border-[#1A3A3A]">
            <button
              type="button"
              onClick={onClose}
              className="py-2 px-4 rounded-xl border border-[#DDE8E4] dark:border-[#1A3A3A] font-semibold text-[#64748B]"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="py-2 px-5 rounded-xl bg-[#087F6D] hover:bg-[#073B3A] text-white font-bold flex items-center gap-1.5 shadow-xs disabled:opacity-50"
            >
              {isSubmitting ? (
                <RotateCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <CheckCircle2 className="w-3.5 h-3.5" />
              )}
              <span>Publish Outreach Schedule</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
