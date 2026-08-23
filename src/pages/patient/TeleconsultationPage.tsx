// HealthSure — Teleconsultation Management Page (Fully Localized)
// frontend/src/pages/patient/TeleconsultationPage.tsx

import React, { useState, useEffect } from 'react';
import {
  Video,
  Signal,
  ShieldCheck,
} from 'lucide-react';
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
      <div className="space-y-3 border-b border-[#DDE8E4] dark:border-[#1A3A3A] pb-4">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#EAF7F2] dark:bg-[#073B3A] text-[#087F6D] dark:text-[#4FD1C5] text-xs font-bold">
          <Video className="w-3.5 h-3.5" />
          {t.navTeleconsult}
        </div>
        <h1 className="text-xl sm:text-2xl font-bold text-[#17324D] dark:text-[#E2EEF4]">
          {t.teleconsultPageTitle}
        </h1>
        <p className="text-xs sm:text-sm text-[#64748B] dark:text-[#7B9EA8]">
          {t.teleconsultPageDesc}
        </p>
      </div>

      {/* Low Bandwidth Architecture Explainer */}
      <div className="rounded-2xl bg-white dark:bg-[#0A2020] border border-[#DDE8E4] dark:border-[#1A3A3A] p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs shadow-xs">
        <div className="flex items-start gap-2.5 p-3 rounded-xl bg-[#F5F9F7] dark:bg-[#0F2929] border border-[#DDE8E4] dark:border-[#1A3A3A]">
          <Signal className="w-5 h-5 text-[#087F6D] shrink-0 mt-0.5" />
          <div>
            <strong className="text-[#17324D] dark:text-[#E2EEF4] block font-bold">{t.lowBandwidthExplainTitle}</strong>
            <p className="text-[#64748B] dark:text-[#7B9EA8] mt-0.5">
              {t.lowBandwidthExplainDesc}
            </p>
          </div>
        </div>

        <div className="flex items-start gap-2.5 p-3 rounded-xl bg-[#F5F9F7] dark:bg-[#0F2929] border border-[#DDE8E4] dark:border-[#1A3A3A]">
          <ShieldCheck className="w-5 h-5 text-[#087F6D] shrink-0 mt-0.5" />
          <div>
            <strong className="text-[#17324D] dark:text-[#E2EEF4] block font-bold">{t.prescriptionSyncTitle}</strong>
            <p className="text-[#64748B] dark:text-[#7B9EA8] mt-0.5">
              {t.prescriptionSyncDesc}
            </p>
          </div>
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="flex rounded-xl border border-[#DDE8E4] dark:border-[#1A3A3A] p-1 bg-white dark:bg-[#0A2020] gap-1 self-start inline-flex">
        <button
          type="button"
          onClick={() => setActiveTab('upcoming')}
          className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-colors ${
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
          className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-colors ${
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
