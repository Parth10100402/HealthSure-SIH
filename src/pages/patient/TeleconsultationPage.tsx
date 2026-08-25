// HealthSure — Teleconsultation Management Page
// frontend/src/pages/patient/TeleconsultationPage.tsx

import React, { useState, useEffect } from 'react';
import { Video } from 'lucide-react';
import type { Teleconsultation } from '../../types/patient';
import { patientService } from '../../services/patientService';
import { useTranslation } from '../../lib/i18n/useTranslation';
import { TeleconsultationCard } from '../../components/patient/TeleconsultationCard';
import { EmptyState } from '../../components/patient/EmptyState';

export const TeleconsultationPage: React.FC = () => {
  const t = useTranslation();
  const [teleconsults, setTeleconsults] = useState<Teleconsultation[]>([]);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');

  useEffect(() => {
    patientService.getTeleconsultations().then((data) => {
      setTeleconsults(data);
    });
  }, []);

  const filtered = teleconsults.filter((item) =>
    activeTab === 'upcoming' ? item.status === 'upcoming' || item.status === 'waiting' : item.status === 'completed'
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="border-b border-[#DDE8E4] dark:border-[#1A3A3A] pb-4">
        <h1 className="text-xl sm:text-2xl font-bold text-[#17324D] dark:text-[#E2EEF4]">
          {t.teleconsultPageTitle}
        </h1>
      </div>

      {/* Tab Switcher */}
      <div className="flex rounded-xl border border-[#DDE8E4] dark:border-[#1A3A3A] p-1 bg-white dark:bg-[#0A2020] gap-1 self-start inline-flex">
        <button
          type="button"
          onClick={() => setActiveTab('upcoming')}
          className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
            activeTab === 'upcoming'
              ? 'bg-[#087F6D] text-white shadow-xs'
              : 'text-[#64748B] dark:text-[#7B9EA8]'
          }`}
        >
          {t.tabUpcoming} ({teleconsults.filter((i) => i.status === 'upcoming' || i.status === 'waiting').length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('past')}
          className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
            activeTab === 'past'
              ? 'bg-[#087F6D] text-white shadow-xs'
              : 'text-[#64748B] dark:text-[#7B9EA8]'
          }`}
        >
          {t.completed} ({teleconsults.filter((i) => i.status === 'completed').length})
        </button>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={Video}
          title={t.noData}
          description={t.emptyDesc}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((tele) => (
            <TeleconsultationCard key={tele.id} teleconsult={tele} />
          ))}
        </div>
      )}
    </div>
  );
};
