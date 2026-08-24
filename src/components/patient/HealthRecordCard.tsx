// HealthSure — Health Record Card & Detail Modal Component (Fully Localized)
// frontend/src/components/patient/HealthRecordCard.tsx

import React, { useState } from 'react';
import {
  Pill,
  Activity,
  Eye,
  X,
  Download,
} from 'lucide-react';
import type { HealthRecord } from '../../types/patient';
import { useTranslation } from '../../lib/i18n/useTranslation';
import { useAuth } from '../../context/AuthContext';
import { downloadHealthRecordPDF } from '../../utils/pdfGenerator';

export const HealthRecordCard: React.FC<{ record: HealthRecord }> = ({ record }) => {
  const { user } = useAuth();
  const t = useTranslation();
  const [detailsOpen, setDetailsOpen] = useState(false);

  const getRecordTypeBadge = (type: HealthRecord['recordType']) => {
    switch (type) {
      case 'consultation':
        return <span className="px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 text-[10px] font-bold">{t.recordTypeOPD}</span>;
      case 'prescription':
        return <span className="px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold">{t.prescribedMedicines}</span>;
      case 'diagnostic':
        return <span className="px-2 py-0.5 rounded-md bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 text-[10px] font-bold">{t.recordTypeLab}</span>;
      case 'referral_summary':
        return <span className="px-2 py-0.5 rounded-md bg-teal-50 dark:bg-teal-950/50 text-teal-700 dark:text-teal-300 text-[10px] font-bold">{t.recordTypeReferral}</span>;
    }
  };

  return (
    <>
      <div className="rounded-2xl border border-[#DDE8E4] dark:border-[#1A3A3A] bg-white dark:bg-[#0A2020] p-5 space-y-4 hover:border-[#087F6D]/60 transition-all shadow-xs">
        {/* Top meta row */}
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              {getRecordTypeBadge(record.recordType)}
              <span className="text-xs text-[#64748B] dark:text-[#7B9EA8]">📅 {record.date}</span>
            </div>
            <h4 className="text-base font-bold text-[#17324D] dark:text-[#E2EEF4]">
              {record.title}
            </h4>
            <p className="text-xs text-[#64748B] dark:text-[#7B9EA8]">
              {record.doctorName} ({record.speciality}) • {record.facility}
            </p>
          </div>

          <button
            type="button"
            onClick={() => setDetailsOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#DDE8E4] dark:border-[#1A3A3A] bg-[#F5F9F7] dark:bg-[#0F2929] hover:bg-[#EAF7F2] text-xs font-semibold text-[#17324D] dark:text-[#D1E8E2] transition-colors shrink-0 cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5 text-[#087F6D]" />
            <span>{t.viewAll}</span>
          </button>
        </div>

        {/* Clinical notes excerpt */}
        <div className="p-3.5 rounded-xl bg-[#F5F9F7] dark:bg-[#0F2929] border border-[#DDE8E4]/60 dark:border-[#1A3A3A] text-xs">
          <div className="text-[10px] font-bold text-[#64748B] dark:text-[#7B9EA8] uppercase tracking-wider mb-1">
            {t.clinicalAssessment} ({record.doctorName}):
          </div>
          <p className="text-[#17324D] dark:text-[#D1E8E2] leading-relaxed">
            {record.clinicalAssessmentNotes}
          </p>
        </div>

        {/* Vitals summary preview if available */}
        {record.vitals && (
          <div className="flex flex-wrap gap-2 text-xs">
            {record.vitals.bloodPressure && (
              <span className="px-2.5 py-1 rounded-lg bg-[#EAF7F2] dark:bg-[#073B3A]/40 text-[#073B3A] dark:text-[#4FD1C5] font-semibold">
                BP: {record.vitals.bloodPressure}
              </span>
            )}
            {record.vitals.pulseRate && (
              <span className="px-2.5 py-1 rounded-lg bg-[#F5F9F7] dark:bg-[#0F2929] text-[#17324D] dark:text-[#D1E8E2] border border-[#DDE8E4] dark:border-[#1A3A3A]">
                Pulse: {record.vitals.pulseRate}
              </span>
            )}
            {record.vitals.bloodSugarMgDl && (
              <span className="px-2.5 py-1 rounded-lg bg-[#F5F9F7] dark:bg-[#0F2929] text-[#17324D] dark:text-[#D1E8E2] border border-[#DDE8E4] dark:border-[#1A3A3A]">
                Sugar: {record.vitals.bloodSugarMgDl}
              </span>
            )}
          </div>
        )}

        {/* Prescriptions preview */}
        {record.prescriptions && record.prescriptions.length > 0 && (
          <div className="pt-1 flex items-center justify-between text-xs text-[#64748B] dark:text-[#7B9EA8]">
            <div className="flex items-center gap-1.5">
              <Pill className="w-4 h-4 text-[#087F6D]" />
              <span>{record.prescriptions.length} {t.prescribedMedicines} ({record.prescriptions.map(p => p.name).join(', ')})</span>
            </div>
          </div>
        )}

        {/* Lab reports preview */}
        {record.labReports && record.labReports.length > 0 && (
          <div className="pt-1 flex items-center justify-between text-xs text-[#64748B] dark:text-[#7B9EA8]">
            <div className="flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <span>{record.labReports.length} {t.labReportsAttached}</span>
            </div>
          </div>
        )}
      </div>

      {/* Record Details Modal */}
      {detailsOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-white dark:bg-[#0A2020] rounded-2xl border border-[#DDE8E4] dark:border-[#1A3A3A] p-6 space-y-5 shadow-2xl animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-[#DDE8E4] dark:border-[#1A3A3A] pb-3">
              <div>
                <div className="flex items-center gap-2">
                  {getRecordTypeBadge(record.recordType)}
                  <span className="font-mono text-xs text-[#64748B] dark:text-[#7B9EA8]">{t.idLabel}: {record.id}</span>
                </div>
                <h3 className="text-lg font-bold text-[#17324D] dark:text-[#E2EEF4] mt-1">{record.title}</h3>
                <p className="text-xs text-[#64748B] dark:text-[#7B9EA8]">
                  {record.doctorName} • {record.facility} • {record.date}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setDetailsOpen(false)}
                className="p-1 rounded-lg text-[#64748B] hover:text-[#17324D] dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content sections */}
            <div className="space-y-4 text-xs">
              {/* Clinical notes */}
              <div className="p-4 rounded-xl bg-[#F5F9F7] dark:bg-[#0F2929] border border-[#DDE8E4] dark:border-[#1A3A3A] space-y-1.5">
                <div className="font-bold text-[#17324D] dark:text-[#E2EEF4]">{t.clinicalAssessment}</div>
                <p className="text-[#64748B] dark:text-[#7B9EA8] leading-relaxed whitespace-pre-line">
                  {record.clinicalAssessmentNotes}
                </p>
              </div>

              {/* Vitals Grid */}
              {record.vitals && (
                <div>
                  <div className="font-bold text-[#17324D] dark:text-[#E2EEF4] mb-2">{t.recentVitalsHeading}</div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <div className="p-3 rounded-xl border border-[#DDE8E4] dark:border-[#1A3A3A] bg-white dark:bg-[#0A2020]">
                      <div className="text-[10px] text-[#64748B] dark:text-[#7B9EA8]">Blood Pressure</div>
                      <div className="text-sm font-bold text-[#087F6D]">{record.vitals.bloodPressure || 'N/A'}</div>
                    </div>
                    <div className="p-3 rounded-xl border border-[#DDE8E4] dark:border-[#1A3A3A] bg-white dark:bg-[#0A2020]">
                      <div className="text-[10px] text-[#64748B] dark:text-[#7B9EA8]">Pulse Rate</div>
                      <div className="text-sm font-bold text-[#17324D] dark:text-[#E2EEF4]">{record.vitals.pulseRate || 'N/A'}</div>
                    </div>
                    <div className="p-3 rounded-xl border border-[#DDE8E4] dark:border-[#1A3A3A] bg-white dark:bg-[#0A2020]">
                      <div className="text-[10px] text-[#64748B] dark:text-[#7B9EA8]">Blood Glucose</div>
                      <div className="text-sm font-bold text-[#17324D] dark:text-[#E2EEF4]">{record.vitals.bloodSugarMgDl ? `${record.vitals.bloodSugarMgDl} mg/dL` : 'N/A'}</div>
                    </div>
                    <div className="p-3 rounded-xl border border-[#DDE8E4] dark:border-[#1A3A3A] bg-white dark:bg-[#0A2020]">
                      <div className="text-[10px] text-[#64748B] dark:text-[#7B9EA8]">SpO2 %</div>
                      <div className="text-sm font-bold text-[#17324D] dark:text-[#E2EEF4]">{record.vitals.spo2Percent ? `${record.vitals.spo2Percent}%` : 'N/A'}</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Prescriptions Table */}
              {record.prescriptions && record.prescriptions.length > 0 && (
                <div>
                  <div className="font-bold text-[#17324D] dark:text-[#E2EEF4] mb-2">{t.prescribedMedicines}</div>
                  <div className="border border-[#DDE8E4] dark:border-[#1A3A3A] rounded-xl overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[#F5F9F7] dark:bg-[#0F2929] border-b border-[#DDE8E4] dark:border-[#1A3A3A] text-[#64748B] dark:text-[#7B9EA8]">
                        <tr>
                          <th className="p-2.5 font-bold">Medicine</th>
                          <th className="p-2.5 font-bold">Dosage & Frequency</th>
                          <th className="p-2.5 font-bold">Duration</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#DDE8E4] dark:divide-[#1A3A3A]">
                        {record.prescriptions.map((rx, idx) => (
                          <tr key={idx}>
                            <td className="p-2.5 font-bold text-[#17324D] dark:text-[#E2EEF4]">{rx.name}</td>
                            <td className="p-2.5 text-[#64748B] dark:text-[#7B9EA8]">{rx.dosage} • {rx.frequency}</td>
                            <td className="p-2.5 text-[#64748B] dark:text-[#7B9EA8]">{rx.duration}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between gap-3 pt-3 border-t border-[#DDE8E4] dark:border-[#1A3A3A]">
              <button
                type="button"
                onClick={() => downloadHealthRecordPDF(record, user)}
                className="px-4 py-2 rounded-xl border border-[#087F6D] text-[#087F6D] dark:text-[#4FD1C5] font-semibold text-xs flex items-center gap-1.5 hover:bg-[#EAF7F2] dark:hover:bg-[#073B3A]/30 transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{t.downloadPdf}</span>
              </button>
              <button
                type="button"
                onClick={() => setDetailsOpen(false)}
                className="px-5 py-2 rounded-xl bg-[#087F6D] hover:bg-[#073B3A] text-white text-xs font-bold transition-colors cursor-pointer"
              >
                {t.closeBtn}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
