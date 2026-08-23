// HealthSure — Government Admin Facilities Monitoring Page
// frontend/src/pages/admin/AdminFacilitiesPage.tsx

import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Building2, Search, AlertTriangle } from 'lucide-react';
import { adminService } from '../../services/adminService';
import { useTranslation } from '../../lib/i18n/useTranslation';
import type { FacilityPerformance } from '../../types/admin';

interface AdminContextType {
  selectedDistrict: string;
  selectedFacility: string;
}

export const AdminFacilitiesPage: React.FC = () => {
  const t = useTranslation();
  const { selectedDistrict } = useOutletContext<AdminContextType>();

  const [facilities, setFacilities] = useState<FacilityPerformance[]>([]);
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    adminService.getFacilities(selectedDistrict, typeFilter).then(setFacilities);
  }, [selectedDistrict, typeFilter]);

  const filtered = facilities.filter((f) => {
    return (
      f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.district.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.taluka.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="border-b border-[#DDE8E4] dark:border-[#1A3A3A] pb-4">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#EAF7F2] dark:bg-[#073B3A] text-[#087F6D] dark:text-[#4FD1C5] text-xs font-bold mb-1">
          <Building2 className="w-3.5 h-3.5" />
          <span>Health Facility Infrastructure & Tiers</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-bold text-[#17324D] dark:text-[#E2EEF4]">
          {t.navFacilities} Monitoring & Performance
        </h1>
        <p className="text-xs sm:text-sm text-[#64748B] dark:text-[#7B9EA8] mt-0.5">
          Evaluate rural Sub-Centres, PHCs, and District Hospitals across patient load, referral completion, and specialist outreach.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-[#0A2020] p-4 rounded-2xl border border-[#DDE8E4] dark:border-[#1A3A3A] shadow-xs">
        {/* Type Filter Pills */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: 'all', label: 'All Types' },
            { id: 'PHC', label: 'PHCs' },
            { id: 'Sub-Centre', label: 'Sub-Centres' },
            { id: 'District Hospital', label: 'District Hospitals' },
            { id: 'Sub-District Hospital', label: 'Sub-District Hospitals' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setTypeFilter(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors border ${
                typeFilter === tab.id
                  ? 'bg-[#087F6D] border-[#087F6D] text-white shadow-xs'
                  : 'border-[#DDE8E4] dark:border-[#1A3A3A] bg-white dark:bg-[#0A2020] text-[#64748B] dark:text-[#7B9EA8] hover:text-[#17324D]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-[#64748B] dark:text-[#7B9EA8] absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search facility name, taluka..."
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-[#DDE8E4] dark:border-[#1A3A3A] bg-[#F5F9F7] dark:bg-[#0F2929] text-xs font-medium text-[#17324D] dark:text-[#E2EEF4] focus:outline-none focus:ring-2 focus:ring-[#087F6D]"
          />
        </div>
      </div>

      {/* Facilities Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((fac) => (
          <div
            key={fac.id}
            className="p-5 rounded-2xl border border-[#DDE8E4] dark:border-[#1A3A3A] bg-white dark:bg-[#0A2020] space-y-4 shadow-xs hover:border-[#087F6D] transition-colors flex flex-col justify-between"
          >
            <div className="space-y-3">
              {/* Top Row: Type & Status */}
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#EAF7F2] dark:bg-[#073B3A] text-[#087F6D] dark:text-[#4FD1C5]">
                    {fac.type}
                  </span>
                  <h3 className="text-base font-bold text-[#17324D] dark:text-[#E2EEF4] mt-1">
                    {fac.name}
                  </h3>
                  <p className="text-xs text-[#64748B] dark:text-[#7B9EA8]">
                    District: {fac.district} • Taluka: {fac.taluka}
                  </p>
                </div>

                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                    fac.status === 'Operational'
                      ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                      : 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                  }`}
                >
                  {fac.status === 'Operational' ? t.statusOperational : t.statusAttentionRequired}
                </span>
              </div>

              {/* Performance Indicator Grid */}
              <div className="grid grid-cols-2 gap-2 text-xs bg-[#F5F9F7] dark:bg-[#0F2929] p-3 rounded-xl border border-[#DDE8E4]/60 dark:border-[#1A3A3A]">
                <div>
                  <div className="text-[10px] text-[#64748B] dark:text-[#7B9EA8]">{t.patientsServed}</div>
                  <div className="font-bold text-sm text-[#17324D] dark:text-[#E2EEF4]">{fac.patientsServed.toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-[10px] text-[#64748B] dark:text-[#7B9EA8]">Referral Completion</div>
                  <div className="font-bold text-sm text-[#087F6D] dark:text-[#4FD1C5]">{fac.referralCompletionRate}%</div>
                </div>
                <div>
                  <div className="text-[10px] text-[#64748B] dark:text-[#7B9EA8]">Specialist Visits</div>
                  <div className="font-bold text-sm text-[#17324D] dark:text-[#E2EEF4]">{fac.outreachVisitsCount}</div>
                </div>
                <div>
                  <div className="text-[10px] text-[#64748B] dark:text-[#7B9EA8]">Teleconsultations</div>
                  <div className="font-bold text-sm text-blue-600 dark:text-blue-400">{fac.teleconsultationsCount}</div>
                </div>
              </div>

              {/* Attention Issue Note if flagged */}
              {fac.issueFlag && (
                <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 text-[11px] text-amber-800 dark:text-amber-300 flex items-start gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-amber-600" />
                  <span>{fac.issueFlag}</span>
                </div>
              )}
            </div>

            {/* Bottom Actions */}
            <div className="pt-3 border-t border-[#DDE8E4]/60 dark:border-[#1A3A3A] flex items-center justify-between text-xs">
              <span className="text-[#64748B] dark:text-[#7B9EA8]">Facility ID: {fac.id}</span>
              <button
                type="button"
                onClick={() => alert(`Reviewing clinical network profile for ${fac.name}.`)}
                className="font-bold text-[#087F6D] dark:text-[#4FD1C5] hover:underline"
              >
                Inspect Health Desk →
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
