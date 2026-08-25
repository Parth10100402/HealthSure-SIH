// HealthSure — Hospital Operational Reports & Metrics Page
// frontend/src/pages/hospital/HospitalReportsPage.tsx

import React from 'react';
import {
  Share2,
  Activity,
  Stethoscope,
  TrendingUp,
  Users,
} from 'lucide-react';

export const HospitalReportsPage: React.FC = () => {
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="border-b border-[#DDE8E4] dark:border-[#1A3A3A] pb-4">
        <h1 className="text-xl sm:text-2xl font-bold text-[#17324D] dark:text-[#E2EEF4]">
          Hospital Operational & Continuity Reports
        </h1>
      </div>

      {/* 4 Core Operational KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl border border-[#DDE8E4] dark:border-[#1A3A3A] bg-white dark:bg-[#0A2020] space-y-2 shadow-xs">
          <div className="flex items-center justify-between text-xs text-[#64748B]">
            <span className="font-bold uppercase tracking-wider text-[10px]">Today's Total OPD</span>
            <Users className="w-4 h-4 text-[#087F6D]" />
          </div>
          <div className="text-2xl font-extrabold text-[#17324D] dark:text-[#E2EEF4]">248</div>
          <div className="text-[11px] text-[#087F6D] dark:text-[#4FD1C5] font-semibold flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            <span>+12% vs last Friday</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl border border-[#DDE8E4] dark:border-[#1A3A3A] bg-white dark:bg-[#0A2020] space-y-2 shadow-xs">
          <div className="flex items-center justify-between text-xs text-[#64748B]">
            <span className="font-bold uppercase tracking-wider text-[10px]">Referral Acceptance</span>
            <Share2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">94.2%</div>
          <div className="text-[11px] text-[#64748B] dark:text-[#7B9EA8]">
            Average decision time: 3.4 hrs
          </div>
        </div>

        <div className="p-5 rounded-2xl border border-[#DDE8E4] dark:border-[#1A3A3A] bg-white dark:bg-[#0A2020] space-y-2 shadow-xs">
          <div className="flex items-center justify-between text-xs text-[#64748B]">
            <span className="font-bold uppercase tracking-wider text-[10px]">Outreach Utilization</span>
            <Activity className="w-4 h-4 text-[#087F6D]" />
          </div>
          <div className="text-2xl font-extrabold text-[#17324D] dark:text-[#E2EEF4]">86.5%</div>
          <div className="text-[11px] text-[#087F6D] dark:text-[#4FD1C5] font-semibold">
            Rural camp seat occupancy
          </div>
        </div>

        <div className="p-5 rounded-2xl border border-[#DDE8E4] dark:border-[#1A3A3A] bg-white dark:bg-[#0A2020] space-y-2 shadow-xs">
          <div className="flex items-center justify-between text-xs text-[#64748B]">
            <span className="font-bold uppercase tracking-wider text-[10px]">Diagnostics TAT</span>
            <Stethoscope className="w-4 h-4 text-[#087F6D]" />
          </div>
          <div className="text-2xl font-extrabold text-[#17324D] dark:text-[#E2EEF4]">98.1%</div>
          <div className="text-[11px] text-emerald-600 font-semibold">
            On-time report delivery
          </div>
        </div>
      </div>

      {/* Operational Breakdown Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* PHC Referral Volume */}
        <div className="p-5 rounded-2xl border border-[#DDE8E4] dark:border-[#1A3A3A] bg-white dark:bg-[#0A2020] space-y-4 shadow-xs">
          <h3 className="text-sm font-bold text-[#17324D] dark:text-[#E2EEF4]">
            Referrals Inflow by Rural Health Centre
          </h3>

          <div className="space-y-3 text-xs">
            <div className="space-y-1">
              <div className="flex justify-between font-semibold">
                <span>PHC Khed</span>
                <span className="text-[#087F6D]">42 Patients (48%)</span>
              </div>
              <div className="w-full h-2 rounded-full bg-[#EAF7F2] dark:bg-[#0F2929] overflow-hidden">
                <div className="h-full bg-[#087F6D] rounded-full" style={{ width: '48%' }} />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between font-semibold">
                <span>PHC Guhagar</span>
                <span className="text-[#087F6D]">26 Patients (30%)</span>
              </div>
              <div className="w-full h-2 rounded-full bg-[#EAF7F2] dark:bg-[#0F2929] overflow-hidden">
                <div className="h-full bg-[#087F6D] rounded-full" style={{ width: '30%' }} />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between font-semibold">
                <span>Sub-Centre Chiplun Rural</span>
                <span className="text-[#087F6D]">19 Patients (22%)</span>
              </div>
              <div className="w-full h-2 rounded-full bg-[#EAF7F2] dark:bg-[#0F2929] overflow-hidden">
                <div className="h-full bg-[#087F6D] rounded-full" style={{ width: '22%' }} />
              </div>
            </div>
          </div>
        </div>

        {/* Outreach Travel Distance Saved */}
        <div className="p-5 rounded-2xl border border-[#DDE8E4] dark:border-[#1A3A3A] bg-white dark:bg-[#0A2020] space-y-4 shadow-xs">
          <h3 className="text-sm font-bold text-[#17324D] dark:text-[#E2EEF4]">
            Rural Patient Travel Distance & Out-of-Pocket Savings
          </h3>

          <div className="space-y-3 text-xs">
            <div className="p-3.5 rounded-xl bg-[#EAF7F2]/60 dark:bg-[#073B3A]/30 border border-[#087F6D]/20 space-y-1">
              <span className="text-[10px] text-[#64748B] uppercase font-bold">Cumulative Travel Averted</span>
              <div className="text-xl font-extrabold text-[#087F6D] dark:text-[#4FD1C5]">
                1,840 Kilometres
              </div>
              <p className="text-[#64748B] dark:text-[#7B9EA8]">
                Villagers evaluated locally at PHCs without travelling 45km each way to Ratnagiri.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-[#F5F9F7] dark:bg-[#0F2929] border border-[#DDE8E4]/60 dark:border-[#1A3A3A] space-y-1">
              <span className="text-[10px] text-[#64748B] uppercase font-bold">Estimated Rural Expense Saved</span>
              <div className="text-xl font-extrabold text-[#17324D] dark:text-[#E2EEF4]">
                ₹42,500
              </div>
              <p className="text-[#64748B] dark:text-[#7B9EA8]">
                Estimated savings on bus fares, lost daily wages, and escort travel expenses.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
