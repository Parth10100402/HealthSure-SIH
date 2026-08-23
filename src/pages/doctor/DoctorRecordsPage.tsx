// HealthSure — Doctor Patient Longitudinal Record View
// frontend/src/pages/doctor/DoctorRecordsPage.tsx

import React, { useState, useEffect } from 'react';
import {
  Activity,
  Download,
} from 'lucide-react';
import { mockPatientProfile } from '../../data/patientMockData';
import { doctorService } from '../../services/doctorService';
import type { HealthRecord } from '../../types/patient';

export const DoctorRecordsPage: React.FC = () => {
  const [records, setRecords] = useState<HealthRecord[]>([]);

  useEffect(() => {
    doctorService.getPatientClinicalRecord('HS-10248').then((data) => {
      setRecords(data.records);
    });
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#DDE8E4] dark:border-[#1A3A3A] pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#17324D] dark:text-[#E2EEF4]">
            Patient Longitudinal Health Record
          </h1>
          <p className="text-xs sm:text-sm text-[#64748B] dark:text-[#7B9EA8] mt-0.5">
            Verified unified health history across PHC Khed, Sub-centres, and District Hospital Ratnagiri.
          </p>
        </div>

        <button
          type="button"
          onClick={() => alert('Downloading verified clinical summary as PDF...')}
          className="inline-flex items-center gap-2 rounded-xl border border-[#087F6D] text-[#087F6D] dark:text-[#4FD1C5] hover:bg-[#EAF7F2] text-xs font-semibold px-4 py-2.5 transition-colors self-start sm:self-auto"
        >
          <Download className="w-4 h-4" />
          <span>Export Clinical Summary</span>
        </button>
      </div>

      {/* ── PATIENT DEMOGRAPHICS & CLINICAL IDENTITY ─────────────────────── */}
      <div className="p-5 rounded-2xl border border-[#DDE8E4] dark:border-[#1A3A3A] bg-white dark:bg-[#0A2020] space-y-4 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#DDE8E4]/60 dark:border-[#1A3A3A] pb-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#EAF7F2] dark:bg-[#073B3A] text-[#087F6D] dark:text-[#4FD1C5] flex items-center justify-center font-bold text-lg">
              RS
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-[#17324D] dark:text-[#E2EEF4]">
                  {mockPatientProfile.fullName}
                </h2>
                <span className="font-mono font-bold text-xs bg-[#F5F9F7] dark:bg-[#0F2929] px-2.5 py-0.5 rounded-md text-[#087F6D] dark:text-[#4FD1C5]">
                  {mockPatientProfile.id}
                </span>
              </div>
              <p className="text-xs text-[#64748B] dark:text-[#7B9EA8]">
                {mockPatientProfile.age} Yrs • {mockPatientProfile.gender} • Village: {mockPatientProfile.village}, Taluka: {mockPatientProfile.taluka}
              </p>
            </div>
          </div>

          <div className="text-xs space-y-0.5 sm:text-right">
            <span className="text-[#64748B] block">Registered Primary Centre:</span>
            <strong className="text-[#17324D] dark:text-[#E2EEF4] font-semibold">
              {mockPatientProfile.registeredFacility}
            </strong>
          </div>
        </div>

        {/* Clinical alerts & vitals strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-[#F5F9F7] dark:bg-[#0F2929] border border-[#DDE8E4]/50 dark:border-[#1A3A3A]">
            <span className="text-[10px] text-[#64748B] block uppercase font-bold">ABHA Number</span>
            <strong className="font-mono text-[#087F6D] dark:text-[#4FD1C5]">{mockPatientProfile.abhaId}</strong>
          </div>

          <div className="p-3 rounded-xl bg-[#F5F9F7] dark:bg-[#0F2929] border border-[#DDE8E4]/50 dark:border-[#1A3A3A]">
            <span className="text-[10px] text-[#64748B] block uppercase font-bold">Blood Group</span>
            <strong className="text-[#17324D] dark:text-[#E2EEF4] font-bold">{mockPatientProfile.bloodGroup}</strong>
          </div>

          <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50">
            <span className="text-[10px] text-amber-800 dark:text-amber-300 block uppercase font-bold">Chronic Conditions</span>
            <strong className="text-amber-900 dark:text-amber-200 truncate block">
              {mockPatientProfile.chronicConditions.join(', ')}
            </strong>
          </div>

          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50">
            <span className="text-[10px] text-rose-800 dark:text-rose-300 block uppercase font-bold">Allergies</span>
            <strong className="text-rose-900 dark:text-rose-200 truncate block">
              {mockPatientProfile.allergies.join(', ')}
            </strong>
          </div>
        </div>
      </div>

      {/* ── LONGITUDINAL CLINICAL TIMELINE ───────────────────────────────── */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-[#17324D] dark:text-[#E2EEF4]">
          Chronological Clinical History
        </h3>

        <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-[#DDE8E4] dark:before:bg-[#1A3A3A]">
          {records.map((record) => (
            <div key={record.id} className="relative">
              {/* Dot */}
              <div className="absolute -left-6 top-1.5 w-5 h-5 rounded-full bg-[#087F6D] border-2 border-white dark:border-[#0A2020] text-white flex items-center justify-center">
                <Activity className="w-3 h-3" />
              </div>

              {/* Record Card */}
              <div className="p-5 rounded-2xl border border-[#DDE8E4] dark:border-[#1A3A3A] bg-white dark:bg-[#0A2020] space-y-3 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#DDE8E4]/60 dark:border-[#1A3A3A] pb-2.5">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#087F6D] dark:text-[#4FD1C5]">
                      {record.recordType.toUpperCase()} • {record.speciality}
                    </span>
                    <h4 className="text-sm font-bold text-[#17324D] dark:text-[#E2EEF4]">
                      {record.title}
                    </h4>
                  </div>
                  <div className="text-xs text-[#64748B] dark:text-[#7B9EA8] font-semibold">
                    📅 {record.date} • {record.facility}
                  </div>
                </div>

                <p className="text-xs text-[#64748B] dark:text-[#7B9EA8] leading-relaxed">
                  {record.clinicalAssessmentNotes}
                </p>

                {/* Vitals summary if recorded */}
                {record.vitals && (
                  <div className="p-3 rounded-xl bg-[#F5F9F7] dark:bg-[#0F2929] flex flex-wrap gap-4 text-xs font-mono">
                    {record.vitals.bloodPressure && <span>BP: <strong>{record.vitals.bloodPressure}</strong></span>}
                    {record.vitals.pulseRate && <span>HR: <strong>{record.vitals.pulseRate}</strong></span>}
                    {record.vitals.spo2Percent && <span>SpO2: <strong>{record.vitals.spo2Percent}</strong></span>}
                  </div>
                )}

                {/* Prescriptions item list if recorded */}
                {record.prescriptions && record.prescriptions.length > 0 && (
                  <div className="space-y-1.5 pt-1">
                    <span className="text-[11px] font-bold text-[#17324D] dark:text-[#E2EEF4]">
                      Prescribed Medications:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {record.prescriptions.map((rx) => (
                        <div key={rx.id} className="p-2 rounded-lg bg-[#F5F9F7] dark:bg-[#0F2929] text-xs">
                          <strong className="text-[#087F6D] dark:text-[#4FD1C5]">{rx.name}</strong> ({rx.dosage}) — {rx.frequency}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
