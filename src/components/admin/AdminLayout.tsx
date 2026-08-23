// HealthSure — Government / Public Health Admin Layout
// frontend/src/components/admin/AdminLayout.tsx

import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { AdminSidebar } from './AdminSidebar';
import { AdminHeader } from './AdminHeader';
import { AdminBottomNav } from './AdminBottomNav';

export const AdminLayout: React.FC = () => {
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [selectedDistrict, setSelectedDistrict] = useState('all');
  const [selectedFacility, setSelectedFacility] = useState('all');

  return (
    <div className="min-h-screen bg-[#F5F9F7] dark:bg-[#051818] text-[#17324D] dark:text-[#D1E8E2] flex transition-colors">
      {/* ── Desktop Left Sidebar (Fixed) ─────────────────────────────────── */}
      <div className="hidden lg:block w-64 shrink-0 h-screen sticky top-0">
        <AdminSidebar />
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
            <AdminSidebar onCloseMobileDrawer={() => setMobileDrawerOpen(false)} />
          </div>
        </div>
      )}

      {/* ── Main Content Area ────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Admin Header with Filters */}
        <AdminHeader
          onToggleMobileDrawer={() => setMobileDrawerOpen(!mobileDrawerOpen)}
          selectedDistrict={selectedDistrict}
          onDistrictChange={setSelectedDistrict}
          selectedFacility={selectedFacility}
          onFacilityChange={setSelectedFacility}
        />

        {/* Dynamic Nested Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto pb-20 lg:pb-8">
          <Outlet context={{ selectedDistrict, selectedFacility }} />
        </main>

        {/* Mobile Bottom Nav */}
        <AdminBottomNav onOpenMobileMenu={() => setMobileDrawerOpen(true)} />
      </div>
    </div>
  );
};
