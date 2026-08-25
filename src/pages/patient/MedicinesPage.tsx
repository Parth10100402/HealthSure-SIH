// HealthSure — Medicine Stock Availability Page (Fully Localized)
// frontend/src/pages/patient/MedicinesPage.tsx

import React, { useState, useEffect } from 'react';
import { Pill, Search } from 'lucide-react';
import type { MedicineStock } from '../../types/patient';
import { patientService } from '../../services/patientService';
import { useTranslation } from '../../lib/i18n/useTranslation';
import { MedicineCard } from '../../components/patient/DiagnosticCard';
import { EmptyState } from '../../components/patient/EmptyState';

export const MedicinesPage: React.FC = () => {
  const t = useTranslation();
  const [medicines, setMedicines] = useState<MedicineStock[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  useEffect(() => {
    patientService.getMedicines(searchQuery, categoryFilter).then((data) => {
      setMedicines(data);
    });
  }, [searchQuery, categoryFilter]);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="border-b border-[#DDE8E4] dark:border-[#1A3A3A] pb-4">
        <h1 className="text-xl sm:text-2xl font-bold text-[#17324D] dark:text-[#E2EEF4]">
          {t.medicinesPageTitle}
        </h1>
      </div>

      {/* Search & Category Filter */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-white dark:bg-[#0A2020] p-4 rounded-2xl border border-[#DDE8E4] dark:border-[#1A3A3A] shadow-xs">
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

        <div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full py-2.5 px-3 rounded-xl border border-[#DDE8E4] dark:border-[#1A3A3A] bg-[#F5F9F7] dark:bg-[#0F2929] text-xs font-semibold text-[#17324D] dark:text-[#E2EEF4] focus:outline-none focus:ring-2 focus:ring-[#087F6D]"
          >
            <option value="all">{t.filterSpeciality}</option>
            <option value="Cardiovascular">Cardiovascular (BP / Heart)</option>
            <option value="Diabetes">Diabetes Care</option>
            <option value="Pain & Fever">Pain & Fever Relief</option>
            <option value="Antibiotics">Antibiotics</option>
            <option value="Maternal & Child">Maternal & Child (ORS/IFA)</option>
          </select>
        </div>
      </div>

      {/* Medicine Cards Grid */}
      {medicines.length === 0 ? (
        <EmptyState
          icon={Pill}
          title={t.noData}
          description={t.emptyDesc}
          actionLabel={t.cancelBtn}
          onAction={() => {
            setSearchQuery('');
            setCategoryFilter('all');
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {medicines.map((med) => (
            <MedicineCard key={med.id} medicine={med} />
          ))}
        </div>
      )}
    </div>
  );
};
