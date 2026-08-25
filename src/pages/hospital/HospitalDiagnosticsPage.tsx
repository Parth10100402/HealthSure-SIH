// HealthSure — Hospital Diagnostics Inventory & Turnaround Page
// frontend/src/pages/hospital/HospitalDiagnosticsPage.tsx

import React, { useState, useEffect } from 'react';
import type { HospitalDiagnosticInventory } from '../../types/hospital';
import { hospitalService } from '../../services/hospitalService';

export const HospitalDiagnosticsPage: React.FC = () => {
  const [diagnostics, setDiagnostics] = useState<HospitalDiagnosticInventory[]>([]);

  const loadData = async () => {
    const data = await hospitalService.getDiagnostics();
    setDiagnostics(data);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleStatusChange = async (id: string, status: 'available' | 'limited' | 'unavailable') => {
    await hospitalService.updateDiagnosticStatus(id, status);
    loadData();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="border-b border-[#DDE8E4] dark:border-[#1A3A3A] pb-4">
        <h1 className="text-xl sm:text-2xl font-bold text-[#17324D] dark:text-[#E2EEF4]">
          Hospital Diagnostic Services & Turnaround Times
        </h1>
      </div>

      {/* Explainer Banner */}
      <div className="p-4 rounded-2xl bg-[#EAF7F2]/60 dark:bg-[#073B3A]/30 border border-[#087F6D]/20 text-xs text-[#17324D] dark:text-[#D1E8E2] space-y-1">
        <strong className="text-[#073B3A] dark:text-[#4FD1C5] font-bold block">
          Pre-Travel Transparency:
        </strong>
        <p className="text-[#64748B] dark:text-[#7B9EA8]">
          When District Hospital Ratnagiri updates diagnostic availability, rural doctors at PHC Khed instantly see whether a 2D-Echo or CT scan machine is operational before referring patients.
        </p>
      </div>

      {/* Diagnostics List */}
      <div className="space-y-3">
        {diagnostics.map((item) => (
          <div
            key={item.id}
            className="p-5 rounded-2xl border border-[#DDE8E4] dark:border-[#1A3A3A] bg-white dark:bg-[#0A2020] flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs"
          >
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-[#F5F9F7] dark:bg-[#0F2929] text-[#64748B]">
                  {item.id}
                </span>
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#EAF7F2] dark:bg-[#073B3A] text-[#087F6D] dark:text-[#4FD1C5]">
                  {item.department}
                </span>
                {item.isEmergencyAvailable && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
                    24x7 Emergency Ready
                  </span>
                )}
              </div>

              <h3 className="text-base font-bold text-[#17324D] dark:text-[#E2EEF4]">
                {item.testName}
              </h3>

              <div className="flex items-center gap-4 text-xs text-[#64748B] dark:text-[#7B9EA8]">
                <span>Turnaround Time: <strong className="text-[#087F6D] dark:text-[#4FD1C5]">{item.turnaroundTime}</strong></span>
                <span>Today's Volume: <strong>{item.testsConductedToday} / {item.dailyCapacity}</strong></span>
              </div>
            </div>

            {/* Status Selector Switch */}
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs text-[#64748B] font-semibold mr-1">Status:</span>

              <button
                type="button"
                onClick={() => handleStatusChange(item.id, 'available')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  item.status === 'available'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-[#F5F9F7] dark:bg-[#0F2929] text-[#64748B] hover:text-[#17324D]'
                }`}
              >
                Available
              </button>

              <button
                type="button"
                onClick={() => handleStatusChange(item.id, 'limited')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  item.status === 'limited'
                    ? 'bg-amber-500 text-white shadow-xs'
                    : 'bg-[#F5F9F7] dark:bg-[#0F2929] text-[#64748B] hover:text-[#17324D]'
                }`}
              >
                Limited
              </button>

              <button
                type="button"
                onClick={() => handleStatusChange(item.id, 'unavailable')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  item.status === 'unavailable'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'bg-[#F5F9F7] dark:bg-[#0F2929] text-[#64748B] hover:text-[#17324D]'
                }`}
              >
                Unavailable
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
