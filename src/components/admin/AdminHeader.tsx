// HealthSure — Government / Public Health Admin Header Component
// frontend/src/components/admin/AdminHeader.tsx

import React, { useState, useEffect, useRef } from 'react';
import {
  Menu,
  ChevronDown,
  LogOut,
  Sun,
  Moon,
  Filter,
  Layers,
  ShieldCheck,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { mockAdminProfile } from '../../data/adminMockData';
import { useTranslation } from '../../lib/i18n/useTranslation';
import { LanguageSelector } from '../auth/LanguageSelector';

interface AdminHeaderProps {
  onToggleMobileDrawer: () => void;
  selectedDistrict?: string;
  onDistrictChange?: (dist: string) => void;
  selectedFacility?: string;
  onFacilityChange?: (fac: string) => void;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({
  onToggleMobileDrawer,
  selectedDistrict = 'all',
  onDistrictChange,
  selectedFacility = 'all',
  onFacilityChange,
}) => {
  const { user, logout, theme, toggleTheme } = useAuth();
  const t = useTranslation();
  const navigate = useNavigate();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const adminName = user?.fullName || mockAdminProfile.fullName;
  const adminId = user?.id || mockAdminProfile.id;
  const designation = mockAdminProfile.designation;
  const department = mockAdminProfile.department;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setProfileDropdownOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setProfileDropdownOpen(false);
      }
    };

    if (profileDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [profileDropdownOpen]);

  return (
    <header className="sticky top-0 z-30 bg-white/95 dark:bg-[#072424]/95 backdrop-blur-md border-b border-[#DDE8E4] dark:border-[#1A3A3A] px-4 sm:px-6 py-3 transition-colors">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        {/* Left: Mobile hamburger & Jurisdiction Header */}
        <div className="flex items-center justify-between lg:justify-start gap-3">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onToggleMobileDrawer}
              className="lg:hidden p-2 rounded-xl text-[#64748B] hover:text-[#17324D] dark:hover:text-white hover:bg-[#F5F9F7] dark:hover:bg-[#0F2929] transition-colors"
              aria-label="Open Admin Navigation Drawer"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#EAF7F2] dark:bg-[#073B3A] text-[#087F6D] dark:text-[#4FD1C5] flex items-center justify-center font-bold text-sm shrink-0 border border-[#087F6D]/20">
                <Layers className="w-5 h-5" />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs sm:text-sm font-bold text-[#17324D] dark:text-[#E2EEF4]">
                    Maharashtra Public Health
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-[#EAF7F2] dark:bg-[#073B3A] text-[#087F6D] dark:text-[#4FD1C5] text-[10px] font-bold">
                    {adminId}
                  </span>
                </div>
                <div className="text-[11px] text-[#64748B] dark:text-[#7B9EA8]">
                  HealthSure Administration • Konkan & Western Division
                </div>
              </div>
            </div>
          </div>

          {/* Quick theme & lang for mobile */}
          <div className="flex items-center gap-1 lg:hidden">
            <LanguageSelector />
            <button
              type="button"
              onClick={toggleTheme}
              className="p-2 rounded-xl text-[#64748B] dark:text-[#7B9EA8]"
              title="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Center/Right: Geographic Tier Filter Bar & Controls */}
        <div className="flex flex-wrap items-center justify-between lg:justify-end gap-2.5 pt-2 lg:pt-0 border-t lg:border-t-0 border-[#DDE8E4]/60 dark:border-[#1A3A3A]">
          {/* Location Filters */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {/* State Pill (Fixed) */}
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#F5F9F7] dark:bg-[#0F2929] border border-[#DDE8E4] dark:border-[#1A3A3A] text-xs font-semibold text-[#17324D] dark:text-[#E2EEF4]">
              <span className="text-[10px] text-[#64748B] uppercase">{t.stateLabel}:</span>
              <span>Maharashtra</span>
            </div>

            {/* District Selector */}
            <div className="flex items-center gap-1 bg-[#F5F9F7] dark:bg-[#0F2929] border border-[#DDE8E4] dark:border-[#1A3A3A] rounded-lg px-2 py-1 text-xs">
              <Filter className="w-3 h-3 text-[#087F6D]" />
              <select
                value={selectedDistrict}
                onChange={(e) => onDistrictChange?.(e.target.value)}
                className="bg-transparent text-xs font-semibold text-[#17324D] dark:text-[#E2EEF4] focus:outline-none cursor-pointer"
              >
                <option value="all">{t.allDistricts}</option>
                <option value="Ratnagiri">Ratnagiri</option>
                <option value="Sindhudurg">Sindhudurg</option>
                <option value="Raigad">Raigad</option>
              </select>
            </div>

            {/* Facility Selector */}
            <div className="flex items-center gap-1 bg-[#F5F9F7] dark:bg-[#0F2929] border border-[#DDE8E4] dark:border-[#1A3A3A] rounded-lg px-2 py-1 text-xs">
              <select
                value={selectedFacility}
                onChange={(e) => onFacilityChange?.(e.target.value)}
                className="bg-transparent text-xs font-semibold text-[#17324D] dark:text-[#E2EEF4] focus:outline-none cursor-pointer"
              >
                <option value="all">{t.allFacilities}</option>
                <option value="District Hospital Ratnagiri">District Hospital Ratnagiri</option>
                <option value="Sub-District Hospital Chiplun">Sub-District Hospital Chiplun</option>
                <option value="PHC Khed">PHC Khed</option>
                <option value="PHC Guhagar">PHC Guhagar</option>
                <option value="Sub-Centre Bharne">Sub-Centre Bharne</option>
              </select>
            </div>
          </div>

          {/* Right Tools (Desktop) */}
          <div className="hidden lg:flex items-center gap-2">
            <LanguageSelector />

            <button
              type="button"
              onClick={toggleTheme}
              className="p-2 rounded-xl text-[#64748B] dark:text-[#7B9EA8] hover:text-[#17324D] dark:hover:text-white hover:bg-[#F5F9F7] dark:hover:bg-[#0F2929] transition-colors"
              title="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
            </button>

            {/* Admin Profile Menu */}
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-1.5 p-1.5 rounded-xl hover:bg-[#F5F9F7] dark:hover:bg-[#0F2929] text-[#17324D] dark:text-[#E2EEF4] transition-colors cursor-pointer"
                aria-label="Admin profile menu"
              >
                <div className="w-8 h-8 rounded-lg bg-[#087F6D] text-white flex items-center justify-center font-bold text-xs">
                  {adminName.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()}
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-[#64748B]" />
              </button>

              {profileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-72 sm:w-80 max-w-[calc(100vw-24px)] bg-white dark:bg-[#0A2020] rounded-2xl border border-[#DDE8E4] dark:border-[#1A3A3A] shadow-2xl p-3 z-50 animate-in fade-in zoom-in-95 duration-150 space-y-2">
                  <div className="p-3 rounded-xl bg-[#F5F9F7] dark:bg-[#0F2929] border border-[#DDE8E4]/60 dark:border-[#1A3A3A] space-y-1">
                    <div className="font-bold text-sm text-[#17324D] dark:text-[#E2EEF4] break-words">{adminName}</div>
                    <div className="text-xs text-[#087F6D] dark:text-[#4FD1C5] font-semibold flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                      <span>{t.roleAdminLabel}</span>
                    </div>
                    <div className="text-[11px] text-[#64748B] dark:text-[#7B9EA8] break-words">{designation}</div>
                    <div className="text-[11px] text-[#64748B] dark:text-[#7B9EA8] break-words">{department}</div>
                  </div>

                  <div className="pt-2 border-t border-[#DDE8E4]/60 dark:border-[#1A3A3A]">
                    <button
                      type="button"
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        logout();
                        navigate('/login');
                      }}
                      className="w-full flex items-center gap-2.5 p-2 rounded-xl text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer text-left"
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
      </div>
    </header>
  );
};
