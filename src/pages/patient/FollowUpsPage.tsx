// HealthSure — Follow-ups Management Page
// frontend/src/pages/patient/FollowUpsPage.tsx

import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';
import type { FollowUp } from '../../types/patient';
import { patientService } from '../../services/patientService';
import { useTranslation } from '../../lib/i18n/useTranslation';
import { FollowUpCard } from '../../components/patient/TeleconsultationCard';
import { EmptyState } from '../../components/patient/EmptyState';

export const FollowUpsPage: React.FC = () => {
  const t = useTranslation();
  const [followUps, setFollowUps] = useState<FollowUp[]>([]);
  const [statusFilter, setStatusFilter] = useState<'all' | 'due' | 'upcoming' | 'completed'>('all');

  useEffect(() => {
    patientService.getFollowUps().then((data) => {
      setFollowUps(data);
    });
  }, []);

  const filtered = followUps.filter((f) =>
    statusFilter === 'all' ? true : f.status === statusFilter
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="border-b border-[#DDE8E4] dark:border-[#1A3A3A] pb-4">
        <h1 className="text-xl sm:text-2xl font-bold text-[#17324D] dark:text-[#E2EEF4]">
          {t.followupsPageTitle}
        </h1>
      </div>

      {/* Filter Tabs */}
      <div className="flex rounded-xl border border-[#DDE8E4] dark:border-[#1A3A3A] p-1 bg-white dark:bg-[#0A2020] gap-1 inline-flex">
        {[
          { id: 'all', label: t.tabAll },
          { id: 'due', label: t.dueNow },
          { id: 'upcoming', label: t.upcoming },
          { id: 'completed', label: t.completed },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setStatusFilter(tab.id as typeof statusFilter)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
              statusFilter === tab.id
                ? 'bg-[#087F6D] text-white shadow-xs'
                : 'text-[#64748B] dark:text-[#7B9EA8]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* List Grid */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={Clock}
          title={t.noData}
          description={t.emptyDesc}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((item) => (
            <FollowUpCard key={item.id} followUp={item} />
          ))}
        </div>
      )}
    </div>
  );
};
