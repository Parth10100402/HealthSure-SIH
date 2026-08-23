// HealthSure — Master Hospital Staff Console Layout
// frontend/src/components/hospital/HospitalLayout.tsx

import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { HospitalSidebar } from './HospitalSidebar';
import { HospitalHeader } from './HospitalHeader';
import { HospitalBottomNav } from './HospitalBottomNav';

export const HospitalLayout: React.FC = () => {
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F5F9F7] dark:bg-[#051818] text-[#17324D] dark:text-[#D1E8E2] flex transition-colors">
      {/* ── Desktop Left Sidebar (Fixed) ─────────────────────────────────── */}
      <div className="hidden lg:block w-64 shrink-0 h-screen sticky top-0">
        <HospitalSidebar />
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
            <HospitalSidebar onCloseMobileDrawer={() => setMobileDrawerOpen(false)} />
          </div>
        </div>
      )}

      {/* ── Main Content Area ────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Hospital Header */}
        <HospitalHeader onToggleMobileDrawer={() => setMobileDrawerOpen(!mobileDrawerOpen)} />

        {/* Dynamic Nested Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto pb-20 lg:pb-8">
          <Outlet />
        </main>

        {/* Mobile Bottom Nav */}
        <HospitalBottomNav onOpenMobileMenu={() => setMobileDrawerOpen(true)} />
      </div>
    </div>
  );
};
