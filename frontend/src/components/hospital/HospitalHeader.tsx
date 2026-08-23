// HealthSure — Hospital Staff Header Component (Fully Localized)
// frontend/src/components/hospital/HospitalHeader.tsx

import React, { useState } from 'react';
import {
  Menu,
  ChevronDown,
  LogOut,
  Building2,
  Sun,
  Moon,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { mockHospitalProfile } from '../../data/hospitalMockData';
import { useTranslation } from '../../lib/i18n/useTranslation';
import { LanguageSelector } from '../auth/LanguageSelector';

interface HospitalHeaderProps {
  onToggleMobileDrawer: () => void;
}

export const HospitalHeader: React.FC<HospitalHeaderProps> = ({ onToggleMobileDrawer }) => {
  const { user, logout, theme, toggleTheme } = useAuth();
  const t = useTranslation();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 bg-white/95 dark:bg-[#072424]/95 backdrop-blur-md border-b border-[#DDE8E4] dark:border-[#1A3A3A] px-4 sm:px-6 py-3 transition-colors">
      <div className="flex items-center justify-between gap-4">
        {/* Left: Mobile hamburger & Hospital facility badge */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onToggleMobileDrawer}
            className="lg:hidden p-2 rounded-xl text-[#64748B] hover:text-[#17324D] dark:hover:text-white hover:bg-[#F5F9F7] dark:hover:bg-[#0F2929] transition-colors"
            aria-label="Open Navigation Drawer"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#EAF7F2] dark:bg-[#073B3A] text-[#087F6D] dark:text-[#4FD1C5] flex items-center justify-center font-bold text-sm shrink-0 border border-[#087F6D]/20">
              <Building2 className="w-5 h-5" />
            </div>

            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs sm:text-sm font-bold text-[#17324D] dark:text-[#E2EEF4]">
                  {mockHospitalProfile.name}
                </span>
                <span className="hidden sm:inline-flex px-2 py-0.5 rounded-full bg-[#EAF7F2] dark:bg-[#073B3A] text-[#087F6D] dark:text-[#4FD1C5] text-[10px] font-bold">
                  {mockHospitalProfile.id}
                </span>
              </div>
              <div className="text-[11px] text-[#64748B] dark:text-[#7B9EA8] truncate max-w-[200px] sm:max-w-none">
                {t.district}: {mockHospitalProfile.district} • {t.occupiedBeds}: {mockHospitalProfile.occupiedBeds}/{mockHospitalProfile.totalBeds}
              </div>
            </div>
          </div>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-2">
          {/* Language Selector */}
          <div className="hidden sm:block">
            <LanguageSelector />
          </div>

          {/* Theme Switcher */}
          <button
            type="button"
            onClick={toggleTheme}
            className="p-2 rounded-xl text-[#64748B] dark:text-[#7B9EA8] hover:text-[#17324D] dark:hover:text-white hover:bg-[#F5F9F7] dark:hover:bg-[#0F2929] transition-colors"
            title="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Hospital Staff Menu */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              className="flex items-center gap-1.5 p-1.5 rounded-xl hover:bg-[#F5F9F7] dark:hover:bg-[#0F2929] text-[#17324D] dark:text-[#E2EEF4] transition-colors cursor-pointer"
            >
              <div className="w-7 h-7 rounded-lg bg-[#087F6D] text-white flex items-center justify-center font-bold text-xs">
                DH
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-[#64748B]" />
            </button>

            {profileDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-[#0A2020] rounded-2xl border border-[#DDE8E4] dark:border-[#1A3A3A] shadow-xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="p-2.5 border-b border-[#DDE8E4] dark:border-[#1A3A3A]">
                  <div className="font-bold text-xs text-[#17324D] dark:text-[#E2EEF4]">{user?.fullName || 'Hospital Administrator'}</div>
                  <div className="text-[10px] text-[#64748B] dark:text-[#7B9EA8]">{mockHospitalProfile.name}</div>
                  <div className="text-[10px] text-[#087F6D] font-mono mt-0.5">{t.designation}: {mockHospitalProfile.nodalOfficer}</div>
                </div>

                <div className="pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      logout();
                    }}
                    className="w-full flex items-center gap-2 p-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>{t.navLogout}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
