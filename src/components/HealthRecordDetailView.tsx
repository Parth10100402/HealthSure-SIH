import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  FileText, 
  Calendar, 
  Activity, 
  AlertTriangle, 
  CheckCircle2, 
  Stethoscope, 
  User
} from 'lucide-react';
import type { MedicalReport } from '../types/health';
import { getReportById } from '../services/reportService';

interface HealthRecordDetailViewProps {
  reportId?: string;
  initialReport?: MedicalReport | null;
  onBack: () => void;
}

export const HealthRecordDetailView: React.FC<HealthRecordDetailViewProps> = ({
  reportId,
  initialReport,
  onBack
}) => {
  const [report, setReport] = useState<MedicalReport | null>(initialReport || null);
  const [isLoading, setIsLoading] = useState<boolean>(!initialReport && !!reportId);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    async function loadReport() {
      if (!initialReport && reportId) {
        setIsLoading(true);
        try {
          const res = await getReportById(reportId);
          if (res) {
            setReport(res);
          } else {
            setErrorMsg('Unable to locate the specified health record.');
          }
        } catch {
          setErrorMsg('Failed to load health record details.');
        } finally {
          setIsLoading(false);
        }
      }
    }
    loadReport();
  }, [reportId, initialReport]);

  if (isLoading) {
    return (
      <div className="p-12 text-center rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
        <Activity className="w-8 h-8 text-blue-400 animate-spin mx-auto" />
        <p className="text-xs text-slate-400 font-medium">Opening medical report...</p>
      </div>
    );
  }

  if (errorMsg || !report) {
    return (
      <div className="p-8 text-center rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
        <AlertTriangle className="w-10 h-10 text-rose-500 mx-auto" />
        <h3 className="text-base font-bold text-white">Record Not Found</h3>
        <p className="text-xs text-slate-400">{errorMsg || 'The report could not be loaded.'}</p>
        <button
          onClick={onBack}
          className="px-4 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs"
        >
          Back to Reports
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* TOP NAVIGATION BAR */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 font-bold text-xs flex items-center gap-2 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Medical Suite</span>
        </button>

        <span className="text-xs font-mono text-slate-500">ID: {report.id}</span>
      </div>

      {/* REPORT PATIENT BANNER CARD */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-600/20 border border-blue-500/30 text-blue-400 flex items-center justify-center shrink-0">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-white">{report.title || 'Medical Lab Report'}</h1>
              <p className="text-xs text-slate-400 flex items-center gap-3 mt-0.5">
                <span className="flex items-center gap-1"><User className="w-3.5 h-3.5 text-blue-400" /> {report.patientName}</span>
                <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5 text-blue-400" /> {report.date || report.uploadedDate}</span>
              </p>
            </div>
          </div>

          <span className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs font-bold w-fit">
            {report.department || report.category || 'General Health'}
          </span>
        </div>

        {/* OVERALL SUMMARY */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Overall Report Summary</h3>
          <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-medium">
            {report.summary || report.diagnosis || 'The lab test values have been processed. Review key findings and biomarker metrics below.'}
          </p>
        </div>
      </div>

      {/* BIOMARKER PARAMETERS TABLE */}
      {report.parameters && report.parameters.length > 0 && (
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center space-x-2 text-white font-bold text-sm">
            <Activity className="w-4 h-4 text-blue-400" />
            <span>Measured Biomarker Parameters</span>
          </div>

          <div className="divide-y divide-slate-800 rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden text-xs">
            <div className="grid grid-cols-12 p-3 font-bold text-slate-400 bg-slate-900/60 uppercase text-[10px]">
              <span className="col-span-4">Parameter Name</span>
              <span className="col-span-3">Patient Value</span>
              <span className="col-span-3">Reference Range</span>
              <span className="col-span-2 text-right">Status</span>
            </div>

            {report.parameters.map((p: any, idx: number) => {
              const isAbnormal = p.status === 'High' || p.status === 'Low' || p.status === 'Critical';
              return (
                <div key={idx} className="grid grid-cols-12 p-3.5 items-center font-medium">
                  <div className="col-span-4">
                    <span className="text-white font-bold block">{p.name}</span>
                    {p.explanation && (
                      <span className="text-[11px] text-slate-400 block mt-0.5">{p.explanation}</span>
                    )}
                  </div>

                  <span className={`col-span-3 font-bold ${isAbnormal ? 'text-amber-400' : 'text-emerald-400'}`}>
                    {p.value} {p.unit}
                  </span>

                  <span className="col-span-3 text-slate-400 font-mono">
                    {p.referenceRange || 'Normal'}
                  </span>

                  <div className="col-span-2 text-right">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      isAbnormal 
                        ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' 
                        : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    }`}>
                      {p.status || 'Normal'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* AI RECOMMENDATIONS & LIFESTYLE */}
      {report.recommendations && report.recommendations.length > 0 && (
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center space-x-2 text-white font-bold text-sm">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Health Guidance & Next Steps</span>
          </div>

          <ul className="space-y-2 text-xs text-slate-300 font-medium">
            {report.recommendations.map((rec: string, idx: number) => (
              <li key={idx} className="flex items-start space-x-2 p-3 rounded-xl bg-slate-950 border border-slate-800/60">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 shrink-0" />
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* RECOMMENDED SPECIALIST & DISCLAIMER */}
      <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400 font-medium">
        <div className="flex items-center space-x-2">
          <Stethoscope className="w-4 h-4 text-blue-400 shrink-0" />
          <span>Recommended Specialty: <strong className="text-white">{report.assignedSpecialist || 'General Physician'}</strong></span>
        </div>

        <p className="text-[11px] text-slate-500 italic max-w-md text-right">
          This report summary provides educational information. Please discuss all lab results with a qualified healthcare professional.
        </p>
      </div>

    </div>
  );
};
