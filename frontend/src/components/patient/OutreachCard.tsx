// HealthSure — Specialist Outreach Card & Multi-Step Booking Modal (Fully Localized)
// frontend/src/components/patient/OutreachCard.tsx

import React, { useState } from 'react';
import {
  Activity,
  Calendar,
  MapPin,
  Users,
  CheckCircle2,
  X,
  ArrowRight,
  RotateCw,
} from 'lucide-react';
import type { SpecialistOutreach, Appointment } from '../../types/patient';
import { patientService } from '../../services/patientService';
import { useTranslation } from '../../lib/i18n/useTranslation';

interface OutreachCardProps {
  outreach: SpecialistOutreach;
  onBookingSuccess?: (appointment: Appointment) => void;
}

export const OutreachCard: React.FC<OutreachCardProps> = ({
  outreach,
  onBookingSuccess,
}) => {
  const t = useTranslation();
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);

  const isLowSlots = outreach.availableSlots <= 8 && outreach.availableSlots > 0;
  const isFull = outreach.availableSlots === 0;

  return (
    <>
      <div className="rounded-2xl border border-[#DDE8E4] dark:border-[#1A3A3A] bg-white dark:bg-[#0A2020] p-5 sm:p-6 space-y-4 hover:border-[#087F6D] transition-all shadow-xs flex flex-col justify-between">
        <div className="space-y-3">
          {/* Top category & slot status */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-1 rounded-md bg-[#087F6D] text-white text-xs font-bold uppercase tracking-wider">
                {outreach.speciality}
              </span>
              <span className="text-[11px] font-semibold text-[#073B3A] dark:text-[#4FD1C5] bg-[#EAF7F2] dark:bg-[#073B3A]/40 px-2 py-0.5 rounded-md">
                {t.mmuVehicle}
              </span>
            </div>

            {/* Slot counter badge */}
            <div
              className={`px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 ${
                isFull
                  ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300'
                  : isLowSlots
                  ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300'
                  : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>{isFull ? t.statusUnavailable : `${outreach.availableSlots} ${t.slotsAvailable}`}</span>
            </div>
          </div>

          {/* Doctor and Parent Hospital */}
          <div>
            <h4 className="text-base sm:text-lg font-bold text-[#17324D] dark:text-[#E2EEF4]">
              {outreach.doctorName}
            </h4>
            <p className="text-xs text-[#64748B] dark:text-[#7B9EA8]">
              {outreach.doctorQualification} • {outreach.hospital}
            </p>
          </div>

          {/* Outreach Location & Date Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-[#17324D] dark:text-[#D1E8E2] pt-1">
            <div className="flex items-center gap-2 bg-[#F5F9F7] dark:bg-[#0F2929] px-3 py-2 rounded-xl">
              <MapPin className="w-4 h-4 text-[#087F6D] shrink-0" />
              <div>
                <div className="text-[10px] text-[#64748B] dark:text-[#7B9EA8]">{t.location}</div>
                <div className="font-bold">{outreach.outreachLocation}</div>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-[#F5F9F7] dark:bg-[#0F2929] px-3 py-2 rounded-xl">
              <Calendar className="w-4 h-4 text-[#087F6D] shrink-0" />
              <div>
                <div className="text-[10px] text-[#64748B] dark:text-[#7B9EA8]">{t.preferredDateLabel}</div>
                <div className="font-bold">{outreach.date} • {outreach.timeSlot}</div>
              </div>
            </div>
          </div>

          {/* Key Instruction snippet */}
          {outreach.instructions?.[0] && (
            <p className="text-xs text-[#64748B] dark:text-[#7B9EA8] line-clamp-1 italic bg-[#EAF7F2]/40 dark:bg-[#073B3A]/20 px-3 py-1.5 rounded-lg border border-[#087F6D]/15">
              💡 {outreach.instructions[0]}
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 pt-3 border-t border-[#DDE8E4]/60 dark:border-[#1A3A3A]">
          <button
            type="button"
            onClick={() => setDetailsModalOpen(true)}
            className="flex-1 py-2.5 px-3 rounded-xl border border-[#DDE8E4] dark:border-[#1A3A3A] text-xs font-semibold text-[#17324D] dark:text-[#D1E8E2] hover:bg-[#F5F9F7] dark:hover:bg-[#0F2929] transition-colors"
          >
            {t.viewInstructions}
          </button>

          <button
            type="button"
            disabled={isFull}
            onClick={() => setBookingModalOpen(true)}
            className="flex-1 py-2.5 px-4 rounded-xl bg-[#087F6D] hover:bg-[#073B3A] text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            <span>{t.bookOutreachSlot}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Camp Details Modal */}
      {detailsModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white dark:bg-[#0A2020] rounded-2xl border border-[#DDE8E4] dark:border-[#1A3A3A] p-6 space-y-5 shadow-2xl animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-[#DDE8E4] dark:border-[#1A3A3A] pb-3">
              <div>
                <span className="px-2 py-0.5 rounded bg-[#087F6D] text-white text-[10px] font-bold uppercase">
                  {outreach.speciality}
                </span>
                <h3 className="text-lg font-bold text-[#17324D] dark:text-[#E2EEF4] mt-1">{outreach.doctorName}</h3>
                <p className="text-xs text-[#64748B] dark:text-[#7B9EA8]">
                  {outreach.doctorQualification} • {outreach.hospital}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setDetailsModalOpen(false)}
                className="p-1 rounded-lg text-[#64748B] hover:text-[#17324D] dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-3.5 rounded-xl bg-[#EAF7F2] dark:bg-[#073B3A]/40 border border-[#087F6D]/20 space-y-1">
                <div className="font-bold text-[#087F6D] dark:text-[#4FD1C5]">{t.medicalKitVerified}</div>
                <p className="text-[#17324D] dark:text-[#D1E8E2]">{outreach.speciality} Outreach Camp • {outreach.hospital}</p>
              </div>

              <div>
                <div className="font-bold text-[#17324D] dark:text-[#E2EEF4] mb-2">{t.instructionsTitle}</div>
                <ul className="space-y-2">
                  {outreach.instructions.map((inst, i) => (
                    <li key={i} className="flex items-start gap-2 text-[#64748B] dark:text-[#7B9EA8]">
                      <CheckCircle2 className="w-4 h-4 text-[#087F6D] shrink-0 mt-0.5" />
                      <span>{inst}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 pt-3 border-t border-[#DDE8E4] dark:border-[#1A3A3A]">
              <button
                type="button"
                onClick={() => setDetailsModalOpen(false)}
                className="px-4 py-2.5 rounded-xl border border-[#DDE8E4] dark:border-[#1A3A3A] text-xs font-semibold"
              >
                {t.closeBtn}
              </button>
              <button
                type="button"
                disabled={isFull}
                onClick={() => {
                  setDetailsModalOpen(false);
                  setBookingModalOpen(true);
                }}
                className="px-5 py-2.5 rounded-xl bg-[#087F6D] hover:bg-[#073B3A] text-white text-xs font-bold transition-all disabled:opacity-50"
              >
                {t.bookOutreachSlot}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Booking Modal */}
      {bookingModalOpen && (
        <OutreachBookingModal
          outreach={outreach}
          isOpen={bookingModalOpen}
          onClose={() => setBookingModalOpen(false)}
          onSuccess={(apt) => {
            setBookingModalOpen(false);
            if (onBookingSuccess) onBookingSuccess(apt);
          }}
        />
      )}
    </>
  );
};

export const OutreachBookingModal: React.FC<{
  outreach: SpecialistOutreach;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (appointment: Appointment) => void;
}> = ({ outreach, isOpen, onClose, onSuccess }) => {
  const t = useTranslation();
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      alert(t.fieldRequired);
      return;
    }
    setIsSubmitting(true);
    const result = await patientService.bookOutreachSlot(outreach.id, reason);
    setIsSubmitting(false);
    if (result.success && result.appointment) {
      onSuccess(result.appointment);
    } else {
      alert(result.message || 'Unable to book slot.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white dark:bg-[#0A2020] rounded-2xl border border-[#DDE8E4] dark:border-[#1A3A3A] p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between border-b border-[#DDE8E4] dark:border-[#1A3A3A] pb-3">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-[#087F6D]" />
            <h3 className="text-base font-bold text-[#17324D] dark:text-[#E2EEF4]">
              {t.bookOutreachSlot}
            </h3>
          </div>
          <button type="button" onClick={onClose} className="text-[#64748B] hover:text-[#17324D] dark:hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="p-3 bg-[#F5F9F7] dark:bg-[#0F2929] rounded-xl space-y-1">
            <div className="font-bold text-[#17324D] dark:text-[#E2EEF4]">{outreach.doctorName}</div>
            <div className="text-[#087F6D] dark:text-[#4FD1C5] font-semibold">{outreach.speciality}</div>
            <div className="text-[#64748B] dark:text-[#7B9EA8]">📅 {outreach.date} • {outreach.timeSlot}</div>
          </div>

          <div>
            <label className="block font-semibold text-[#17324D] dark:text-[#D1E8E2] mb-1">
              {t.reasonSymptomsLabel} <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={3}
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
