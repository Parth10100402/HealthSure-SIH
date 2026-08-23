// HealthSure — Government Admin Diagnostics Availability & Readiness Page
// frontend/src/pages/admin/AdminDiagnosticsPage.tsx

import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Stethoscope, Search, Activity } from 'lucide-react';
import { adminService } from '../../services/adminService';
import { useTranslation } from '../../lib/i18n/useTranslation';
import type { DiagnosticServiceAvailability } from '../../types/admin';

interface AdminContextType {
  selectedDistrict: string;
  selectedFacility: string;
}

export const AdminDiagnosticsPage: React.FC = () => {
  const t = useTranslation();
  const { selectedFacility } = useOutletContext<AdminContextType>();

  const [diagnostics, setDiagnostics] = useState<DiagnosticServiceAvailability[]>([]);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    adminService.getDiagnostics(selectedFacility, categoryFilter).then(setDiagnostics);
  }, [selectedFacility, categoryFilter]);

  const filtered = diagnostics.filter(
    (d) =>
      d.testName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.facility.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="border-b border-[#DDE8E4] dark:border-[#1A3A3A] pb-4">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#EAF7F2] dark:bg-[#073B3A] text-[#087F6D] dark:text-[#4FD1C5] text-xs font-bold mb-1">
          <Stethoscope className="w-3.5 h-3.5" />
          <span>Diagnostic Readiness & Gap Analysis</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-bold text-[#17324D] dark:text-[#E2EEF4]">
          {t.diagnosticReadiness}
        </h1>
        <p className="text-xs sm:text-sm text-[#64748B] dark:text-[#7B9EA8] mt-0.5">
          Identify diagnostic gaps and equipment readiness across primary health centres and district hospitals.
        </p>
      </div>

      {/* Gap Analysis Summary Banner */}
      <div className="p-4 rounded-2xl bg-[#EAF7F2] dark:bg-[#073B3A]/40 border border-[#087F6D]/20 text-xs text-[#17324D] dark:text-[#D1E8E2] space-y-2">
        <div className="font-bold text-[#087F6D] dark:text-[#4FD1C5] flex items-center gap-1.5">
          <Activity className="w-4 h-4" />
          <span>Public Health Diagnostic Gap Insights:</span>
        </div>
        <p className="text-[#64748B] dark:text-[#7B9EA8] leading-relaxed">
          Primary Health Centres (PHC Khed, PHC Chiplun, PHC Dapoli) provide 100% on-site coverage for basic point-of-care diagnostics (CBC, ECG, Blood Glucose, Urinalysis). Advanced tertiary imaging (2D Echo, CT Scan) routes seamlessly through HealthSure inter-facility referral passes to District Hospital Ratnagiri.
        </p>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-[#0A2020] p-4 rounded-2xl border border-[#DDE8E4] dark:border-[#1A3A3A] shadow-xs">
        <div className="flex gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: 'all', label: 'All Categories' },
            { id: 'Haematology', label: 'Haematology' },
            { id: 'Cardiology', label: 'Cardiology' },
            { id: 'Radiology', label: 'Radiology' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setCategoryFilter(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors border ${
                categoryFilter === tab.id
                  ? 'bg-[#087F6D] border-[#087F6D] text-white shadow-xs'
                  : 'border-[#DDE8E4] dark:border-[#1A3A3A] bg-white dark:bg-[#0A2020] text-[#64748B] dark:text-[#7B9EA8] hover:text-[#17324D]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-[#64748B] dark:text-[#7B9EA8] absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search test name, facility..."
            className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-[#DDE8E4] dark:border-[#1A3A3A] bg-[#F5F9F7] dark:bg-[#0F2929] text-xs font-medium text-[#17324D] dark:text-[#E2EEF4]"
          />
        </div>
      </div>

      {/* Diagnostics Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((item) => (
          <div
            key={item.id}
            className="p-5 rounded-2xl border border-[#DDE8E4] dark:border-[#1A3A3A] bg-white dark:bg-[#0A2020] space-y-3 shadow-xs hover:border-[#087F6D] transition-colors"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#087F6D] dark:text-[#4FD1C5]">
                  {item.category}
                </span>
                <h3 className="text-base font-bold text-[#17324D] dark:text-[#E2EEF4] mt-0.5">
                  {item.testName}
                </h3>
                <p className="text-xs text-[#64748B] dark:text-[#7B9EA8]">
                  {item.facility} ({item.facilityType})
                </p>
              </div>

              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                  item.status === 'Available'
                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                    : item.status === 'Referral Required'
                    ? 'bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300'
                    : 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                }`}
              >
                {item.status}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs bg-[#F5F9F7] dark:bg-[#0F2929] p-3 rounded-xl border border-[#DDE8E4]/60 dark:border-[#1A3A3A]">
              <div>
                <div className="text-[10px] text-[#64748B] dark:text-[#7B9EA8]">Equipment Status</div>
                <div className="font-bold text-xs text-[#17324D] dark:text-[#E2EEF4]">{item.equipmentStatus}</div>
              </div>
              <div>
                <div className="text-[10px] text-[#64748B] dark:text-[#7B9EA8]">Daily Test Volume</div>
                <div className="font-bold text-xs text-[#087F6D] dark:text-[#4FD1C5]">{item.dailyVolume} Tests/Day</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
