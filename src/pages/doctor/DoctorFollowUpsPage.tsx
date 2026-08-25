// HealthSure — Doctor Follow-ups Management Page
// frontend/src/pages/doctor/DoctorFollowUpsPage.tsx

import React, { useState, useEffect } from 'react';
import type { FollowUp } from '../../types/patient';
import { doctorService } from '../../services/doctorService';

export const DoctorFollowUpsPage: React.FC = () => {
  const [followUps, setFollowUps] = useState<FollowUp[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'due' | 'upcoming' | 'completed'>('due');

  useEffect(() => {
    doctorService.getFollowUps().then(setFollowUps);
  }, []);

  const filtered = followUps.filter((f) =>
    activeTab === 'all' ? true : f.status === activeTab
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="border-b border-[#DDE8E4] dark:border-[#1A3A3A] pb-4">
        <h1 className="text-xl sm:text-2xl font-bold text-[#17324D] dark:text-[#E2EEF4]">
          Clinical Follow-Up Tracking
        </h1>
      </div>

      {/* Tabs */}
      <div className="flex rounded-xl border border-[#DDE8E4] dark:border-[#1A3A3A] p-1 bg-white dark:bg-[#0A2020] gap-1 self-start inline-flex">
        {[
          { id: 'due', label: 'Due Now (1)' },
          { id: 'upcoming', label: 'Upcoming (1)' },
          { id: 'completed', label: 'Completed (1)' },
          { id: 'all', label: 'All Follow-ups (3)' },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              activeTab === tab.id
                ? 'bg-[#087F6D] text-white shadow-xs'
                : 'text-[#64748B] dark:text-[#7B9EA8]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Follow-up Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((fol) => (
          <div
            key={fol.id}
            className="p-5 rounded-2xl border border-[#DDE8E4] dark:border-[#1A3A3A] bg-white dark:bg-[#0A2020] space-y-3 shadow-xs flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded-lg bg-[#EAF7F2] dark:bg-[#073B3A] text-[#087F6D] dark:text-[#4FD1C5]">
                  {fol.id}
                </span>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                    fol.status === 'due'
                      ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/50'
                      : fol.status === 'completed'
                      ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50'
                      : 'bg-blue-50 text-blue-700 dark:bg-blue-950/50'
                  }`}
                >
                  {fol.status.toUpperCase()}
                </span>
              </div>

              <h3 className="text-base font-bold text-[#17324D] dark:text-[#E2EEF4]">
                {fol.title}
              </h3>

              <div className="p-3 rounded-xl bg-[#F5F9F7] dark:bg-[#0F2929] text-xs space-y-1">
                <div className="text-[#17324D] dark:text-[#E2EEF4]">
                  <strong>Target Date:</strong> {fol.dueDate}
                </div>
                <div className="text-[#64748B] dark:text-[#7B9EA8]">
                  <strong>Instructions:</strong> {fol.instructions}
                </div>
                <div className="text-[#087F6D] dark:text-[#4FD1C5] font-semibold text-[11px]">
                  Mode: {fol.mode === 'teleconsultation' ? 'Tele-OPD Session' : 'In-Person PHC Outreach'}
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-[#DDE8E4]/60 dark:border-[#1A3A3A] flex items-center justify-between">
              <span className="text-[11px] text-[#64748B]">Parth Sharma • HS-10248</span>
              <button
                type="button"
                onClick={() => alert(`Marked follow-up ${fol.id} as verified and reviewed.`)}
                className="py-1.5 px-3 rounded-xl bg-[#087F6D] text-white text-xs font-bold shadow-xs hover:bg-[#073B3A]"
              >
                Mark Reviewed
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
