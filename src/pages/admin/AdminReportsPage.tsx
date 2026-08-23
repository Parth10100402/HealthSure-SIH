// HealthSure — Government Admin Reports & Audits Page
// frontend/src/pages/admin/AdminReportsPage.tsx

import React, { useState, useEffect } from 'react';
import {
  FileBarChart,
  Download,
  Eye,
  Calendar,
  X,
  Printer,
} from 'lucide-react';
import { adminService } from '../../services/adminService';
import { useTranslation } from '../../lib/i18n/useTranslation';
import type { AdminReportItem } from '../../types/admin';

export const AdminReportsPage: React.FC = () => {
  const t = useTranslation();
  const [reports, setReports] = useState<AdminReportItem[]>([]);
  const [selectedReport, setSelectedReport] = useState<AdminReportItem | null>(null);

  useEffect(() => {
    adminService.getReports().then(setReports);
  }, []);

  const handleExport = (report: AdminReportItem, format: 'PDF' | 'CSV') => {
    alert(`Exporting "${report.title}" as ${format} formatted report for Government Health Directorate.`);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="border-b border-[#DDE8E4] dark:border-[#1A3A3A] pb-4">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#EAF7F2] dark:bg-[#073B3A] text-[#087F6D] dark:text-[#4FD1C5] text-xs font-bold mb-1">
          <FileBarChart className="w-3.5 h-3.5" />
          <span>Executive Audits & Continuity Analytics</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-bold text-[#17324D] dark:text-[#E2EEF4]">
          {t.operationalReports} & Data Exports
        </h1>
        <p className="text-xs sm:text-sm text-[#64748B] dark:text-[#7B9EA8] mt-0.5">
          Generate structured public health reports across referral completion, specialist outreach, and rural tele-health coverage.
        </p>
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {reports.map((report) => (
          <div
            key={report.id}
            className="p-5 rounded-2xl border border-[#DDE8E4] dark:border-[#1A3A3A] bg-white dark:bg-[#0A2020] space-y-4 shadow-xs flex flex-col justify-between"
          >
            <div className="space-y-2.5">
              <div className="flex items-start justify-between gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#EAF7F2] dark:bg-[#073B3A] text-[#087F6D] dark:text-[#4FD1C5]">
                  {report.category}
                </span>
                <span className="text-xs text-[#64748B] dark:text-[#7B9EA8] flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {report.period}
                </span>
              </div>

              <h3 className="text-base font-bold text-[#17324D] dark:text-[#E2EEF4]">
                {report.title}
              </h3>

              <p className="text-xs text-[#64748B] dark:text-[#7B9EA8] leading-relaxed">
                {report.description}
              </p>

              <div className="text-[11px] text-[#64748B] dark:text-[#7B9EA8]">
                Generated: <strong>{report.lastGenerated}</strong> • File Size: {report.fileSize}
              </div>
            </div>

            {/* Actions */}
            <div className="pt-3 border-t border-[#DDE8E4]/60 dark:border-[#1A3A3A] flex flex-wrap items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => setSelectedReport(report)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#DDE8E4] dark:border-[#1A3A3A] text-xs font-semibold text-[#17324D] dark:text-[#D1E8E2] hover:bg-[#F5F9F7] cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5 text-[#087F6D]" />
                <span>{t.viewReport}</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleExport(report, 'CSV')}
                  className="px-3 py-1.5 rounded-xl bg-[#F5F9F7] dark:bg-[#0F2929] border border-[#DDE8E4] dark:border-[#1A3A3A] text-xs font-semibold text-[#17324D] dark:text-[#D1E8E2] hover:border-[#087F6D] cursor-pointer"
                >
                  {t.exportCsv}
                </button>
                <button
                  type="button"
                  onClick={() => handleExport(report, 'PDF')}
                  className="px-3 py-1.5 rounded-xl bg-[#087F6D] hover:bg-[#073B3A] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{t.exportPdf}</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Summary Viewer Modal */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-xl bg-white dark:bg-[#0A2020] rounded-2xl border border-[#DDE8E4] dark:border-[#1A3A3A] p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-[#DDE8E4] dark:border-[#1A3A3A] pb-3">
              <div className="flex items-center gap-2">
                <FileBarChart className="w-5 h-5 text-[#087F6D]" />
                <h3 className="text-base font-bold text-[#17324D] dark:text-[#E2EEF4]">
                  Executive Report Summary
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedReport(null)}
                className="p-1 rounded-lg text-[#64748B] hover:text-[#17324D] dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <h4 className="font-bold text-sm text-[#17324D] dark:text-[#E2EEF4]">{selectedReport.title}</h4>
                <p className="text-[#64748B]">{selectedReport.period} • {selectedReport.category}</p>
              </div>

              <div className="p-4 rounded-xl bg-[#F5F9F7] dark:bg-[#0F2929] border border-[#DDE8E4]/60 dark:border-[#1A3A3A] space-y-2">
                <div className="font-bold text-[#087F6D] dark:text-[#4FD1C5]">Audit Findings Summary:</div>
                <p className="text-[#17324D] dark:text-[#D1E8E2] leading-relaxed">
                  Referral completion rate across Ratnagiri district has risen to 87% (+3.2% increase), driven by low-latency digital token verification and mobile outreach clinics in PHC Khed & Chiplun.
                </p>
                <div className="text-[11px] text-[#64748B]">
                  Certified for State Health Review Committee • Directorate of Health Services, Maharashtra.
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-[#DDE8E4] dark:border-[#1A3A3A] flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => handleExport(selectedReport, 'PDF')}
                className="px-4 py-2 rounded-xl bg-[#087F6D] text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Official Copy</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedReport(null)}
                className="px-4 py-2 rounded-xl border border-[#DDE8E4] text-xs font-semibold"
              >
                {t.closeBtn}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
