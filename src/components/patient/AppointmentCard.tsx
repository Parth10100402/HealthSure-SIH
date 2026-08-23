// HealthSure — Appointment Card & Booking Modal Components (Fully Localized)
// frontend/src/components/patient/AppointmentCard.tsx

import React, { useState } from 'react';
import {
  Calendar,
  Building2,
  AlertCircle,
  X,
  RotateCw,
  Video,
} from 'lucide-react';
import type { Appointment } from '../../types/patient';
import { StatusBadge } from './StatusBadge';
import { patientService } from '../../services/patientService';
import { useTranslation } from '../../lib/i18n/useTranslation';

interface AppointmentCardProps {
  appointment: Appointment;
  onCancelled?: () => void;
}

export const AppointmentCard: React.FC<AppointmentCardProps> = ({
  appointment,
  onCancelled,
}) => {
  const t = useTranslation();
  const [isCancelling, setIsCancelling] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const handleCancel = async () => {
    if (!window.confirm(t.cancelConfirm)) return;
    setIsCancelling(true);
    await patientService.cancelAppointment(appointment.id);
    setIsCancelling(false);
    if (onCancelled) onCancelled();
  };

  return (
    <>
      <div className="rounded-2xl border border-[#DDE8E4] dark:border-[#1A3A3A] bg-white dark:bg-[#0A2020] p-4 sm:p-5 space-y-4 hover:border-[#087F6D]/50 transition-all shadow-xs">
        {/* Header with Type & Status */}
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-bold tracking-wider text-[#087F6D] dark:text-[#4FD1C5] uppercase">
                {appointment.speciality}
              </span>
              {appointment.isOutreachVisit && (
                <span className="px-2 py-0.5 rounded-md bg-[#EAF7F2] dark:bg-[#073B3A] text-[#087F6D] dark:text-[#4FD1C5] text-[10px] font-bold">
                  {t.navOutreach}
                </span>
              )}
              {appointment.type === 'teleconsultation' && (
                <span className="px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 text-[10px] font-bold flex items-center gap-1">
                  <Video className="w-3 h-3" /> {t.navTeleconsult}
                </span>
              )}
            </div>
            <h4 className="text-base font-bold text-[#17324D] dark:text-[#E2EEF4]">
              {appointment.doctorName}
            </h4>
            <p className="text-xs text-[#64748B] dark:text-[#7B9EA8]">
              {appointment.doctorQualification}
            </p>
          </div>

          <StatusBadge status={appointment.status} />
        </div>

        {/* Date, Time, Facility details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2 border-t border-[#DDE8E4]/60 dark:border-[#1A3A3A] text-xs text-[#17324D] dark:text-[#D1E8E2]">
          <div className="flex items-center gap-2 bg-[#F5F9F7] dark:bg-[#0F2929] px-3 py-2 rounded-xl">
            <Calendar className="w-4 h-4 text-[#087F6D] shrink-0" />
            <div>
              <div className="text-[10px] text-[#64748B] dark:text-[#7B9EA8]">{t.preferredDateLabel}</div>
              <div className="font-bold">
                {appointment.date} • {appointment.time}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-[#F5F9F7] dark:bg-[#0F2929] px-3 py-2 rounded-xl">
            <Building2 className="w-4 h-4 text-[#087F6D] shrink-0" />
            <div className="min-w-0">
              <div className="text-[10px] text-[#64748B] dark:text-[#7B9EA8]">{t.hospitalFacility}</div>
              <div className="font-bold truncate">{appointment.facility}</div>
            </div>
          </div>
        </div>

        {/* Token & Room */}
        <div className="flex items-center justify-between text-xs px-3 py-2 rounded-xl bg-[#EAF7F2]/60 dark:bg-[#073B3A]/30 border border-[#087F6D]/20">
          <div>
            <span className="text-[#64748B] dark:text-[#7B9EA8]">{t.token}: </span>
            <strong className="text-[#073B3A] dark:text-[#4FD1C5]">{appointment.tokenNumber}</strong>
          </div>
          {appointment.roomNumber && (
            <div>
              <span className="text-[#64748B] dark:text-[#7B9EA8]">{t.room}: </span>
              <span className="font-semibold text-[#17324D] dark:text-[#D1E8E2]">{appointment.roomNumber}</span>
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 pt-1">
          <button
            type="button"
            onClick={() => setDetailsOpen(true)}
            className="flex-1 py-2 px-3 rounded-xl border border-[#DDE8E4] dark:border-[#1A3A3A] text-xs font-semibold text-[#17324D] dark:text-[#D1E8E2] hover:bg-[#F5F9F7] dark:hover:bg-[#0F2929] transition-colors"
          >
            {t.viewInstructions}
          </button>

          {appointment.status === 'confirmed' && (
            <button
              type="button"
              onClick={handleCancel}
              disabled={isCancelling}
              className="py-2 px-3 rounded-xl border border-rose-200 dark:border-rose-900/60 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors disabled:opacity-50"
            >
              {isCancelling ? t.cancelling : t.cancelApt}
            </button>
          )}
        </div>
      </div>

      {/* Appointment Instructions Modal */}
      {detailsOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-[#0A2020] rounded-2xl border border-[#DDE8E4] dark:border-[#1A3A3A] p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-[#DDE8E4] dark:border-[#1A3A3A] pb-3">
              <h3 className="text-base font-bold text-[#17324D] dark:text-[#E2EEF4]">
                {t.instructionsTitle}
              </h3>
              <button
                type="button"
                onClick={() => setDetailsOpen(false)}
                className="p-1 rounded-lg text-[#64748B] hover:text-[#17324D] dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 py-2 text-xs">
              <div className="bg-[#F5F9F7] dark:bg-[#0F2929] p-3.5 rounded-xl space-y-1">
                <div className="font-bold text-[#17324D] dark:text-[#E2EEF4]">{t.reasonSymptomsLabel}:</div>
                <p className="text-[#64748B] dark:text-[#7B9EA8]">{appointment.reasonForVisit}</p>
              </div>

              {appointment.instructions && (
                <div className="bg-[#EAF7F2] dark:bg-[#073B3A]/40 p-3.5 rounded-xl border border-[#087F6D]/20 space-y-1">
                  <div className="font-bold text-[#087F6D] dark:text-[#4FD1C5] flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4" />
                    {t.instructionsTitle}:
                  </div>
                  <p className="text-[#17324D] dark:text-[#D1E8E2]">{appointment.instructions}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-2">
                <div className="border border-[#DDE8E4] dark:border-[#1A3A3A] p-3 rounded-xl">
                  <div className="text-[10px] text-[#64748B] dark:text-[#7B9EA8]">{t.token}</div>
                  <div className="text-sm font-bold text-[#087F6D]">{appointment.tokenNumber}</div>
                </div>
                <div className="border border-[#DDE8E4] dark:border-[#1A3A3A] p-3 rounded-xl">
                  <div className="text-[10px] text-[#64748B] dark:text-[#7B9EA8]">{t.room}</div>
                  <div className="text-sm font-bold text-[#17324D] dark:text-[#E2EEF4]">{appointment.roomNumber || 'General OPD'}</div>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setDetailsOpen(false)}
              className="w-full py-2.5 rounded-xl bg-[#087F6D] hover:bg-[#073B3A] text-white text-xs font-semibold"
            >
              {t.closeBtn}
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export const AppointmentBookingModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onBooked: (apt: Appointment) => void;
}> = ({ isOpen, onClose, onBooked }) => {
  const t = useTranslation();
  const [speciality, setSpeciality] = useState('Cardiology');
  const [doctorName, setDoctorName] = useState('Dr. Ananya Mehta');
  const [facility, setFacility] = useState('District Hospital Ratnagiri');
  const [date, setDate] = useState('2026-08-28');
  const [time, setTime] = useState('10:30 AM');
  const [reason, setReason] = useState('');
  const [type, setType] = useState<Appointment['type']>('in-person');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      alert(t.fieldRequired);
      return;
    }
    setIsSubmitting(true);
    const created = await patientService.bookAppointment({
      doctorName,
      doctorQualification: 'MD / Specialist',
      speciality,
      facility,
      facilityType: facility.includes('PHC') ? 'PHC' : 'District Hospital',
      date,
      time,
      type,
      reasonForVisit: reason,
      instructions: 'Please arrive 15 minutes before scheduled slot with prior prescriptions.',
    });
    setIsSubmitting(false);
    onBooked(created);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white dark:bg-[#0A2020] rounded-2xl border border-[#DDE8E4] dark:border-[#1A3A3A] p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between border-b border-[#DDE8E4] dark:border-[#1A3A3A] pb-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-[#087F6D]" />
            <h3 className="text-base font-bold text-[#17324D] dark:text-[#E2EEF4]">
              {t.bookModalTitle}
            </h3>
          </div>
          <button type="button" onClick={onClose} className="text-[#64748B] hover:text-[#17324D] dark:hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-[#17324D] dark:text-[#D1E8E2] mb-1">{t.selectSpecialityLabel}</label>
            <select
              value={speciality}
              onChange={(e) => {
                setSpeciality(e.target.value);
                if (e.target.value === 'Cardiology') setDoctorName('Dr. Ananya Mehta');
                else if (e.target.value === 'Orthopaedics') setDoctorName('Dr. Rahul Shah');
                else if (e.target.value === 'Dermatology') setDoctorName('Dr. Priya Shah');
                else setDoctorName('Dr. Rajesh Patil');
              }}
              className="w-full rounded-xl border border-[#DDE8E4] dark:border-[#1A3A3A] bg-[#F5F9F7] dark:bg-[#0F2929] px-3 py-2.5 text-[#17324D] dark:text-[#E2EEF4] font-medium"
            >
              <option value="Cardiology">{t.cardiology}</option>
              <option value="Orthopaedics">{t.orthopaedics}</option>
              <option value="Dermatology">{t.dermatology}</option>
              <option value="General Medicine">{t.generalMedicine}</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-[#17324D] dark:text-[#D1E8E2] mb-1">{t.selectFacilityLabel}</label>
            <select
              value={facility}
              onChange={(e) => setFacility(e.target.value)}
              className="w-full rounded-xl border border-[#DDE8E4] dark:border-[#1A3A3A] bg-[#F5F9F7] dark:bg-[#0F2929] px-3 py-2.5 text-[#17324D] dark:text-[#E2EEF4] font-medium"
            >
              <option value="District Hospital Ratnagiri">District Hospital Ratnagiri</option>
              <option value="PHC Khed Clinic (Visiting Specialist)">PHC Khed Clinic (Visiting Specialist)</option>
              <option value="Sub-District Hospital Chiplun">Sub-District Hospital Chiplun</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-[#17324D] dark:text-[#D1E8E2] mb-1">{t.preferredDateLabel}</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-xl border border-[#DDE8E4] dark:border-[#1A3A3A] bg-[#F5F9F7] dark:bg-[#0F2929] px-3 py-2.5 text-[#17324D] dark:text-[#E2EEF4]"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#17324D] dark:text-[#D1E8E2] mb-1">{t.timeSlotLabel}</label>
              <select
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full rounded-xl border border-[#DDE8E4] dark:border-[#1A3A3A] bg-[#F5F9F7] dark:bg-[#0F2929] px-3 py-2.5 text-[#17324D] dark:text-[#E2EEF4]"
              >
                <option value="09:30 AM">09:30 AM (Slot 1)</option>
                <option value="10:30 AM">10:30 AM (Slot 2)</option>
                <option value="11:30 AM">11:30 AM (Slot 3)</option>
                <option value="02:30 PM">02:30 PM (Slot 4)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-[#17324D] dark:text-[#D1E8E2] mb-1">{t.consultModeLabel}</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setType('in-person')}
                className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-all ${
                  type === 'in-person'
                    ? 'border-[#087F6D] bg-[#EAF7F2] dark:bg-[#073B3A] text-[#087F6D] dark:text-[#4FD1C5]'
                    : 'border-[#DDE8E4] dark:border-[#1A3A3A] text-[#64748B]'
                }`}
              >
                {t.inPersonMode}
              </button>
              <button
                type="button"
                onClick={() => setType('teleconsultation')}
                className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-all ${
                  type === 'teleconsultation'
                    ? 'border-[#087F6D] bg-[#EAF7F2] dark:bg-[#073B3A] text-[#087F6D] dark:text-[#4FD1C5]'
                    : 'border-[#DDE8E4] dark:border-[#1A3A3A] text-[#64748B]'
                }`}
              >
                {t.teleconsultMode}
              </button>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-[#17324D] dark:text-[#D1E8E2] mb-1">
              {t.reasonSymptomsLabel} <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={2}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={t.reasonPlaceholder}
              className="w-full rounded-xl border border-[#DDE8E4] dark:border-[#1A3A3A] bg-[#F5F9F7] dark:bg-[#0F2929] px-3 py-2 text-[#17324D] dark:text-[#E2EEF4]"
              required
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#DDE8E4] dark:border-[#1A3A3A]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-[#DDE8E4] dark:border-[#1A3A3A] text-xs font-semibold text-[#64748B]"
            >
              {t.cancelBtn}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl bg-[#087F6D] hover:bg-[#073B3A] text-white text-xs font-bold transition-colors disabled:opacity-60 flex items-center gap-1.5"
            >
              {isSubmitting ? (
                <>
                  <RotateCw className="w-3.5 h-3.5 animate-spin" />
                  <span>{t.confirmBtn}…</span>
                </>
              ) : (
                <span>{t.confirmBookingBtn}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
