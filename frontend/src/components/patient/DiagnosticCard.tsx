// HealthSure — Diagnostic & Medicine Availability Components (Fully Localized)
// frontend/src/components/patient/DiagnosticCard.tsx

import React from 'react';
import {
  Building2,
  Clock,
} from 'lucide-react';
import type { DiagnosticTest, MedicineStock } from '../../types/patient';
import { StatusBadge } from './StatusBadge';
import { useTranslation } from '../../lib/i18n/useTranslation';

export const DiagnosticCard: React.FC<{ diagnostic: DiagnosticTest }> = ({ diagnostic }) => {
  const t = useTranslation();

  return (
    <div className="rounded-2xl border border-[#DDE8E4] dark:border-[#1A3A3A] bg-white dark:bg-[#0A2020] p-5 space-y-4 hover:border-[#087F6D]/50 transition-all shadow-xs flex flex-col justify-between">
      <div className="space-y-3">
        {/* Top badges */}
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-bold text-[#087F6D] dark:text-[#4FD1C5] uppercase tracking-wider">
                {diagnostic.category}
              </span>
              {diagnostic.isFreeGovtService && (
                <span className="px-2 py-0.5 rounded-md bg-[#EAF7F2] dark:bg-[#073B3A] text-[#087F6D] dark:text-[#4FD1C5] text-[10px] font-bold">
                  {t.freeServiceBadge}
                </span>
              )}
            </div>
            <h4 className="text-base font-bold text-[#17324D] dark:text-[#E2EEF4]">
              {diagnostic.testName}
            </h4>
          </div>

          <StatusBadge status={diagnostic.availability} />
        </div>

        {/* Facility & Timings */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-[#17324D] dark:text-[#D1E8E2]">
          <div className="flex items-center gap-2 bg-[#F5F9F7] dark:bg-[#0F2929] p-2.5 rounded-xl">
            <Building2 className="w-4 h-4 text-[#087F6D] shrink-0" />
            <div className="min-w-0">
              <div className="text-[10px] text-[#64748B] dark:text-[#7B9EA8]">{t.hospitalFacility}</div>
              <div className="font-semibold truncate">{diagnostic.facility}</div>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-[#F5F9F7] dark:bg-[#0F2929] p-2.5 rounded-xl">
            <Clock className="w-4 h-4 text-[#087F6D] shrink-0" />
            <div>
              <div className="text-[10px] text-[#64748B] dark:text-[#7B9EA8]">{t.tatLabel}</div>
              <div className="font-semibold">{diagnostic.turnaroundTime}</div>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="p-3 rounded-xl bg-[#F5F9F7]/80 dark:bg-[#0F2929]/50 border border-[#DDE8E4]/60 dark:border-[#1A3A3A] text-xs space-y-1">
          <div className="font-semibold text-[#17324D] dark:text-[#E2EEF4] flex items-center gap-1">
            <span>{t.timingLabel}: {diagnostic.timing}</span>
          </div>
          <p className="text-[#64748B] dark:text-[#7B9EA8]">
            <strong>{t.prerequisitesLabel}:</strong> {diagnostic.prerequisites}
          </p>
        </div>
      </div>

      <div className="pt-3 border-t border-[#DDE8E4]/60 dark:border-[#1A3A3A] flex items-center justify-between text-xs text-[#64748B] dark:text-[#7B9EA8]">
        <span>{t.freeServiceBadge}</span>
        <button
          type="button"
          onClick={() => alert(`Token inquiry sent to ${diagnostic.facility} for ${diagnostic.testName}.`)}
          className="font-bold text-[#087F6D] dark:text-[#4FD1C5] hover:underline"
        >
          {t.viewAll} →
        </button>
      </div>
    </div>
  );
};

export const MedicineCard: React.FC<{ medicine: MedicineStock }> = ({ medicine }) => {
  const t = useTranslation();

  return (
    <div className="rounded-2xl border border-[#DDE8E4] dark:border-[#1A3A3A] bg-white dark:bg-[#0A2020] p-5 space-y-4 hover:border-[#087F6D]/50 transition-all shadow-xs flex flex-col justify-between">
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-bold text-[#087F6D] dark:text-[#4FD1C5] uppercase tracking-wider">
                {medicine.category}
              </span>
              {medicine.isEssentialDrug && (
                <span className="px-2 py-0.5 rounded-md bg-[#EAF7F2] dark:bg-[#073B3A] text-[#087F6D] dark:text-[#4FD1C5] text-[10px] font-bold">
                  {t.essentialDrugBadge}
                </span>
              )}
            </div>
            <h4 className="text-base font-bold text-[#17324D] dark:text-[#E2EEF4] mt-1">
              {medicine.medicineName}
            </h4>
            <p className="text-xs text-[#64748B] dark:text-[#7B9EA8]">
              {t.genericName}: {medicine.genericName}
            </p>
          </div>

          <StatusBadge status={medicine.availability} />
        </div>

        {/* Facility & Dosage form */}
        <div className="grid grid-cols-2 gap-2 text-xs text-[#17324D] dark:text-[#D1E8E2]">
          <div className="bg-[#F5F9F7] dark:bg-[#0F2929] p-2.5 rounded-xl">
            <div className="text-[10px] text-[#64748B] dark:text-[#7B9EA8]">{t.dosageForm}</div>
            <div className="font-semibold">{medicine.dosageForm}</div>
          </div>

          <div className="bg-[#F5F9F7] dark:bg-[#0F2929] p-2.5 rounded-xl">
            <div className="text-[10px] text-[#64748B] dark:text-[#7B9EA8]">{t.hospitalFacility}</div>
            <div className="font-semibold truncate">{medicine.facility}</div>
          </div>
        </div>

        {/* Dispensary Note */}
        <div className="p-2.5 rounded-xl bg-[#EAF7F2]/60 dark:bg-[#073B3A]/30 text-xs text-[#073B3A] dark:text-[#A7D9CE]">
          {t.dispensaryHours}
        </div>
      </div>

      <div className="pt-3 border-t border-[#DDE8E4]/60 dark:border-[#1A3A3A] flex items-center justify-between text-xs text-[#64748B] dark:text-[#7B9EA8]">
        <span>{medicine.stockStatusText}</span>
        <button
          type="button"
          onClick={() => alert(`Reserved pickup for ${medicine.medicineName} at ${medicine.facility} Dispensary.`)}
          className="font-bold text-[#087F6D] dark:text-[#4FD1C5] hover:underline"
        >
          {t.confirmBtn} →
        </button>
      </div>
    </div>
  );
};
