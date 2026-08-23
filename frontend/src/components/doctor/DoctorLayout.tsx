// HealthSure — Master Doctor Console Layout
// frontend/src/components/doctor/DoctorLayout.tsx

import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { DoctorSidebar } from './DoctorSidebar';
import { DoctorHeader } from './DoctorHeader';
import { DoctorBottomNav } from './DoctorBottomNav';

export const DoctorLayout: React.FC = () => {
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F5F9F7] dark:bg-[#051818] text-[#17324D] dark:text-[#D1E8E2] flex transition-colors">
      {/* ── Desktop Left Sidebar (Fixed) ─────────────────────────────────── */}
      <div className="hidden lg:block w-64 shrink-0 h-screen sticky top-0">
        <DoctorSidebar />
      </div>

      {/* ── Mobile Slide-over Drawer ─────────────────────────────────────── */}
      {mobileDrawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileDrawerOpen(false)}
            aria-hidden="true"
          />

          {/* Drawer content */}
          <div className="relative w-72 max-w-[80vw] h-full bg-white dark:bg-[#072424] shadow-2xl z-10 flex flex-col">
            <DoctorSidebar onCloseMobileDrawer={() => setMobileDrawerOpen(false)} />
          </div>
        </div>
      )}

      {/* ── Main Content Area ────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Doctor Header */}
        <DoctorHeader onToggleMobileDrawer={() => setMobileDrawerOpen(!mobileDrawerOpen)} />

        {/* Dynamic Nested Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto pb-20 lg:pb-8">
          <Outlet />
        </main>

        {/* Mobile Bottom Nav */}
        <DoctorBottomNav onOpenMobileMenu={() => setMobileDrawerOpen(true)} />
      </div>
    </div>
  );
};
