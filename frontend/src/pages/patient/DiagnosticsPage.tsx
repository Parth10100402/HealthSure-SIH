// HealthSure — Diagnostic Availability Page (Fully Localized)
// frontend/src/pages/patient/DiagnosticsPage.tsx

import React, { useState, useEffect } from 'react';
import { Stethoscope, Search } from 'lucide-react';
import type { DiagnosticTest } from '../../types/patient';
import { patientService } from '../../services/patientService';
import { useTranslation } from '../../lib/i18n/useTranslation';
import { DiagnosticCard } from '../../components/patient/DiagnosticCard';
import { EmptyState } from '../../components/patient/EmptyState';

export const DiagnosticsPage: React.FC = () => {
  const t = useTranslation();
  const [diagnostics, setDiagnostics] = useState<DiagnosticTest[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [facilityFilter, setFacilityFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  useEffect(() => {
    patientService.getDiagnostics(searchQuery, facilityFilter).then((data) => {
      setDiagnostics(data);
    });
  }, [searchQuery, facilityFilter]);

  const filteredTests = diagnostics.filter(
    (d) => categoryFilter === 'all' || d.category === categoryFilter
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="border-b border-[#DDE8E4] dark:border-[#1A3A3A] pb-4">
        <h1 className="text-xl sm:text-2xl font-bold text-[#17324D] dark:text-[#E2EEF4]">
          {t.diagnosticsPageTitle}
        </h1>
        <p className="text-xs sm:text-sm text-[#64748B] dark:text-[#7B9EA8] mt-0.5">
          {t.diagnosticsPageDesc}
        </p>
      </div>

      {/* Search and Facility filter */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-white dark:bg-[#0A2020] p-4 rounded-2xl border border-[#DDE8E4] dark:border-[#1A3A3A] shadow-xs">
        {/* Search Box */}
        <div className="sm:col-span-2 relative">
          <Search className="w-4 h-4 text-[#64748B] dark:text-[#7B9EA8] absolute left-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t.searchPlaceholder}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-[#DDE8E4] dark:border-[#1A3A3A] bg-[#F5F9F7] dark:bg-[#0F2929] text-xs font-medium text-[#17324D] dark:text-[#E2EEF4] focus:outline-none focus:ring-2 focus:ring-[#087F6D]"
          />
        </div>

        {/* Facility Filter */}
        <div>
          <select
            value={facilityFilter}
            onChange={(e) => setFacilityFilter(e.target.value)}
            className="w-full py-2.5 px-3 rounded-xl border border-[#DDE8E4] dark:border-[#1A3A3A] bg-[#F5F9F7] dark:bg-[#0F2929] text-xs font-semibold text-[#17324D] dark:text-[#E2EEF4] focus:outline-none focus:ring-2 focus:ring-[#087F6D]"
          >
            <option value="all">{t.filterSpeciality}</option>
            <option value="phc">PHC Khed</option>
            <option value="hospital">District Hospital Ratnagiri</option>
          </select>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {['all', 'Blood Tests', 'Cardiology', 'Radiology'].map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setCategoryFilter(cat)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors border ${
              categoryFilter === cat
                ? 'bg-[#087F6D] border-[#087F6D] text-white shadow-xs'
                : 'border-[#DDE8E4] dark:border-[#1A3A3A] bg-white dark:bg-[#0A2020] text-[#64748B] dark:text-[#7B9EA8] hover:text-[#17324D]'
            }`}
          >
            {cat === 'all' ? t.tabAll : cat}
          </button>
        ))}
      </div>

      {/* Diagnostics Grid */}
      {filteredTests.length === 0 ? (
        <EmptyState
          icon={Stethoscope}
          title={t.noData}
          description={t.emptyDesc}
          actionLabel={t.cancelBtn}
          onAction={() => {
            setSearchQuery('');
            setFacilityFilter('all');
            setCategoryFilter('all');
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTests.map((diag) => (
            <DiagnosticCard key={diag.id} diagnostic={diag} />
          ))}
        </div>
      )}
    </div>
  );
};
