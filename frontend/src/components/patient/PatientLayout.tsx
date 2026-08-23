// HealthSure — Patient Portal Master Layout
// frontend/src/components/patient/PatientLayout.tsx

import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { PatientSidebar } from './PatientSidebar';
import { PatientHeader } from './PatientHeader';
import { PatientBottomNav } from './PatientBottomNav';
import { ConnectivityBanner } from './ConnectivityBanner';
import { VoiceIVRModal } from './VoiceIVRModal';
import { X } from 'lucide-react';

export const PatientLayout: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [voiceIVROpen, setVoiceIVROpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F5F9F7] dark:bg-[#051818] text-[#17324D] dark:text-[#E2EEF4] flex flex-col font-sans transition-colors duration-150">
      {/* Connectivity Status Banner */}
      <ConnectivityBanner />

      <div className="flex-1 flex min-h-0 relative">
        {/* ── Desktop Sidebar ─────────────────────────────────────────────── */}
        <div className="hidden lg:block w-64 xl:w-72 shrink-0 h-screen sticky top-0 z-20">
          <PatientSidebar onOpenVoiceIVR={() => setVoiceIVROpen(true)} />
        </div>

        {/* ── Mobile Drawer Backdrop & Drawer ─────────────────────────────── */}
        {mobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-50 flex">
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in"
              onClick={() => setMobileMenuOpen(false)}
              aria-hidden="true"
            />

            {/* Slide-out Menu */}
            <div className="relative w-4/5 max-w-xs bg-white dark:bg-[#072424] h-full shadow-2xl z-50 flex flex-col animate-in slide-in-from-left duration-200">
              <div className="absolute top-3.5 right-3.5 z-10">
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 rounded-lg text-[#64748B] hover:text-[#17324D] dark:text-[#7B9EA8] dark:hover:text-white hover:bg-[#F5F9F7] dark:hover:bg-[#0A2020] transition-colors focus-visible:outline-2 focus-visible:outline-[#087F6D]"
                  aria-label="Close navigation drawer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <PatientSidebar
                onOpenVoiceIVR={() => setVoiceIVROpen(true)}
                onCloseMobileDrawer={() => setMobileMenuOpen(false)}
              />
            </div>
          </div>
        )}

        {/* ── Main Content Area ────────────────────────────────────────────── */}
        <div className="flex-1 flex flex-col min-w-0 min-h-screen">
          {/* Top Header */}
          <PatientHeader
            onOpenMobileMenu={() => setMobileMenuOpen(true)}
            onOpenVoiceIVR={() => setVoiceIVROpen(true)}
          />

          {/* Sub-page content */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto pb-24 lg:pb-12 space-y-6">
            <Outlet />
          </main>
        </div>
      </div>

      {/* ── Mobile Bottom Navigation Bar ─────────────────────────────────── */}
      <PatientBottomNav onOpenMobileMenu={() => setMobileMenuOpen(true)} />

      {/* ── Voice / IVR Phone Assistance Simulator Modal ─────────────────── */}
      <VoiceIVRModal isOpen={voiceIVROpen} onClose={() => setVoiceIVROpen(false)} />
    </div>
  );
};
