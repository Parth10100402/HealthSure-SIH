// HealthSure — Health Records Page
// frontend/src/pages/patient/HealthRecordsPage.tsx

import React, { useState, useEffect } from 'react';
import {
  FileText,
  Download,
} from 'lucide-react';
import type { HealthRecord } from '../../types/patient';
import { patientService } from '../../services/patientService';
import { mockPatientProfile } from '../../data/patientMockData';
import { useTranslation } from '../../lib/i18n/useTranslation';
import { useAuth } from '../../context/AuthContext';
import { HealthRecordCard } from '../../components/patient/HealthRecordCard';
import { EmptyState } from '../../components/patient/EmptyState';
import { downloadHealthRecordPDF } from '../../utils/pdfGenerator';

export const HealthRecordsPage: React.FC = () => {
  const { user } = useAuth();
  const t = useTranslation();
  const [records, setRecords] = useState<HealthRecord[]>([]);
  const [typeFilter, setTypeFilter] = useState<'all' | 'consultation' | 'prescription' | 'diagnostic' | 'referral_summary'>('all');

  useEffect(() => {
    patientService.getHealthRecords().then((data) => {
      setRecords(data);
    });
  }, []);

  const filteredRecords = records.filter(
    (r) => typeFilter === 'all' || r.recordType === typeFilter
  );

  const handleDownloadSummary = () => {
    const targetRecord = filteredRecords[0] || records[0];
    if (targetRecord) {
      downloadHealthRecordPDF(targetRecord, user || mockPatientProfile);
    } else {
      downloadHealthRecordPDF(
        {
          id: 'HS-REC-LATEST',
          date: new Date().toISOString().split('T')[0],
          facility: (user as any)?.village || 'PHC Khed',
          doctorName: 'Dr. Ananya Mehta',
          speciality: 'Cardiology',
          title: 'Routine Clinical Evaluation',
          clinicalAssessmentNotes: 'No active chronic complications noted.',
          recordType: 'consultation',
        },
        user || mockPatientProfile
      );
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#DDE8E4] dark:border-[#1A3A3A] pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#17324D] dark:text-[#E2EEF4]">
            {t.recordsPageTitle}
          </h1>
        </div>

        <button
          type="button"
          onClick={handleDownloadSummary}
          className="inline-flex items-center gap-2 rounded-xl border border-[#087F6D] text-[#087F6D] dark:text-[#4FD1C5] hover:bg-[#EAF7F2] dark:hover:bg-[#073B3A]/40 text-xs sm:text-sm font-semibold px-4 py-2.5 transition-colors shrink-0 self-start sm:self-auto cursor-pointer"
        >
          <Download className="w-4 h-4" />
          <span>{t.downloadPdf}</span>
        </button>
      </div>

      {/* Patient Clinical Profile Summary Strip */}
      <div className="rounded-2xl bg-white dark:bg-[#0A2020] border border-[#DDE8E4] dark:border-[#1A3A3A] p-4 sm:p-5 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs shadow-xs">
        <div className="space-y-1">
          <div className="text-[#64748B] dark:text-[#7B9EA8] text-[10px] font-bold uppercase">{t.abhaCardLabel}</div>
          <div className="font-bold text-[#17324D] dark:text-[#E2EEF4]">{mockPatientProfile.abhaId}</div>
        </div>

        <div className="space-y-1">
          <div className="text-[#64748B] dark:text-[#7B9EA8] text-[10px] font-bold uppercase">{t.bloodGroup}</div>
          <div className="font-bold text-[#087F6D] dark:text-[#4FD1C5]">{mockPatientProfile.bloodGroup}</div>
        </div>

        <div className="space-y-1">
          <div className="text-[#64748B] dark:text-[#7B9EA8] text-[10px] font-bold uppercase">{t.chronicConditions}</div>
          <div className="font-semibold text-[#17324D] dark:text-[#E2EEF4] truncate">
            {mockPatientProfile.chronicConditions.join(', ')}
          </div>
        </div>

        <div className="space-y-1">
          <div className="text-[#64748B] dark:text-[#7B9EA8] text-[10px] font-bold uppercase">{t.allergies}</div>
          <div className="font-semibold text-rose-600 dark:text-rose-400 truncate">
            {mockPatientProfile.allergies.join(', ')}
          </div>
        </div>
      </div>

      {/* Type Filter Buttons */}
      <div className="flex rounded-2xl border border-[#DDE8E4] dark:border-[#1A3A3A] p-1.5 bg-white dark:bg-[#0A2020] gap-1 overflow-x-auto">
        {[
          { id: 'all', label: t.tabAll },
          { id: 'consultation', label: t.recordTypeOPD },
          { id: 'prescription', label: t.prescribedMedicines },
          { id: 'diagnostic', label: t.recordTypeLab },
          { id: 'referral_summary', label: t.recordTypeReferral },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setTypeFilter(tab.id as typeof typeFilter)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
              typeFilter === tab.id
                ? 'bg-[#087F6D] text-white shadow-xs'
                : 'text-[#64748B] dark:text-[#7B9EA8] hover:text-[#17324D]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Records list */}
      {filteredRecords.length === 0 ? (
        <EmptyState
          icon={FileText}
          title={t.noData}
          description={t.emptyDesc}
        />
      ) : (
        <div className="space-y-4">
          {filteredRecords.map((record) => (
            <HealthRecordCard key={record.id} record={record} />
          ))}
        </div>
      )}
    </div>
  );
};
