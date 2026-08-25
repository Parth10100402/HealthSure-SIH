// HealthSure — Government Admin Settings Page
// frontend/src/pages/admin/AdminSettingsPage.tsx

import React from 'react';
import { Settings, ShieldCheck, Building2 } from 'lucide-react';
import { mockAdminProfile } from '../../data/adminMockData';
import { useTranslation } from '../../lib/i18n/useTranslation';

export const AdminSettingsPage: React.FC = () => {
  const t = useTranslation();

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="border-b border-[#DDE8E4] dark:border-[#1A3A3A] pb-4">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#EAF7F2] dark:bg-[#073B3A] text-[#087F6D] dark:text-[#4FD1C5] text-xs font-bold mb-1">
          <Settings className="w-3.5 h-3.5" />
          <span>Directorate Administration Settings</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-bold text-[#17324D] dark:text-[#E2EEF4]">
          {t.navSettings} & Nodal Jurisdiction
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Nodal Officer Profile */}
        <section className="p-5 rounded-2xl bg-white dark:bg-[#0A2020] border border-[#DDE8E4] dark:border-[#1A3A3A] space-y-4 shadow-xs">
          <h2 className="text-sm font-bold text-[#17324D] dark:text-[#E2EEF4] flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#087F6D]" />
            <span>Nodal Officer Credentials</span>
          </h2>

          <div className="space-y-3 text-xs">
            <div>
              <label className="text-[#64748B] block mb-1">Administrator Designation</label>
              <input
                type="text"
                readOnly
                value={mockAdminProfile.fullName}
                className="w-full p-2.5 rounded-xl border border-[#DDE8E4] dark:border-[#1A3A3A] bg-[#F5F9F7] dark:bg-[#0F2929] text-[#17324D] dark:text-[#E2EEF4] font-semibold"
              />
            </div>

            <div>
              <label className="text-[#64748B] block mb-1">Government Admin ID</label>
              <input
                type="text"
                readOnly
                value={mockAdminProfile.id}
                className="w-full p-2.5 rounded-xl border border-[#DDE8E4] dark:border-[#1A3A3A] bg-[#F5F9F7] dark:bg-[#0F2929] text-[#087F6D] dark:text-[#4FD1C5] font-mono font-bold"
              />
            </div>

            <div>
              <label className="text-[#64748B] block mb-1">State Department</label>
              <input
                type="text"
                readOnly
                value={mockAdminProfile.department}
                className="w-full p-2.5 rounded-xl border border-[#DDE8E4] dark:border-[#1A3A3A] bg-[#F5F9F7] dark:bg-[#0F2929] text-[#17324D] dark:text-[#E2EEF4]"
              />
            </div>

            <div>
              <label className="text-[#64748B] block mb-1">Official Nodal Email</label>
              <input
                type="text"
                readOnly
                value={mockAdminProfile.email}
                className="w-full p-2.5 rounded-xl border border-[#DDE8E4] dark:border-[#1A3A3A] bg-[#F5F9F7] dark:bg-[#0F2929] text-[#17324D] dark:text-[#E2EEF4]"
              />
            </div>
          </div>
        </section>

        {/* Assigned Districts & Monitoring Alerts */}
        <section className="p-5 rounded-2xl bg-white dark:bg-[#0A2020] border border-[#DDE8E4] dark:border-[#1A3A3A] space-y-4 shadow-xs">
          <h2 className="text-sm font-bold text-[#17324D] dark:text-[#E2EEF4] flex items-center gap-2">
            <Building2 className="w-4 h-4 text-[#087F6D]" />
            <span>Assigned Geographic Districts</span>
          </h2>

          <div className="space-y-3 text-xs">
            <p className="text-[#64748B] dark:text-[#7B9EA8]">
              Your administrative credentials have active monitoring authorization across these districts:
            </p>

            <div className="flex flex-wrap gap-2">
              {mockAdminProfile.assignedDistricts.map((dist) => (
                <span
                  key={dist}
                  className="px-3 py-1.5 rounded-xl bg-[#EAF7F2] dark:bg-[#073B3A] text-[#087F6D] dark:text-[#4FD1C5] font-bold text-xs border border-[#087F6D]/20"
                >
                  ✓ {dist} District
                </span>
              ))}
            </div>

            <div className="pt-3 border-t border-[#DDE8E4]/60 dark:border-[#1A3A3A] space-y-2">
              <span className="font-bold text-[#17324D] dark:text-[#E2EEF4] block">
                Automatic Bottleneck Thresholds
              </span>
              <label className="flex items-center gap-2 text-[#17324D] dark:text-[#D1E8E2] cursor-pointer">
                <input type="checkbox" defaultChecked className="accent-[#087F6D] rounded" />
                <span>Alert when referrals pending hospital triage exceed 10 cases</span>
              </label>
              <label className="flex items-center gap-2 text-[#17324D] dark:text-[#D1E8E2] cursor-pointer">
                <input type="checkbox" defaultChecked className="accent-[#087F6D] rounded" />
                <span>Trigger SMS to ASHA workers when patient follow-ups become overdue</span>
              </label>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
