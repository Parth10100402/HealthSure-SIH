// HealthSure — Patient Portal Top Header (Fully Localized)
// frontend/src/components/patient/PatientHeader.tsx

import React, { useState } from 'react';
import {
  Menu,
  PhoneCall,
  ChevronDown,
  LogOut,
  User,
  HelpCircle,
  Building2,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from '../../lib/i18n/useTranslation';
import { LanguageSelector } from '../auth/LanguageSelector';
import { ThemeToggle } from '../auth/ThemeToggle';
import { NotificationPanel } from './NotificationPanel';
import { mockPatientProfile } from '../../data/patientMockData';
import { HEALTHSURE_IVR_NUMBER } from '../../config/constants';

interface PatientHeaderProps {
  onOpenMobileMenu: () => void;
  onOpenVoiceIVR: () => void;
}

export const PatientHeader: React.FC<PatientHeaderProps> = ({
  onOpenMobileMenu,
  onOpenVoiceIVR,
}) => {
  const { user, logout } = useAuth();
  const t = useTranslation();
  const navigate = useNavigate();
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  const patientName = user?.fullName || mockPatientProfile.fullName;
  const patientId = mockPatientProfile.id; // 'HS-10248'

  return (
    <header className="sticky top-0 z-30 bg-white/95 dark:bg-[#0A2020]/95 backdrop-blur-xs border-b border-[#DDE8E4] dark:border-[#1A3A3A] px-4 sm:px-6 py-2.5 transition-colors">
      <div className="flex items-center justify-between gap-3">
        {/* Left: Mobile hamburger + Mobile logo */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onOpenMobileMenu}
            className="lg:hidden p-2 rounded-xl border border-[#DDE8E4] dark:border-[#1A3A3A] text-[#17324D] dark:text-[#E2EEF4] hover:bg-[#F5F9F7] dark:hover:bg-[#0F2929] transition-colors focus-visible:outline-2 focus-visible:outline-[#087F6D]"
            aria-label="Open navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Logo on mobile/tablet */}
          <div className="flex items-center lg:hidden">
            <img
              src="/healthsure-logo.png"
              alt="HealthSure"
              className="h-7 sm:h-8 w-auto object-contain max-w-[140px]"
            />
          </div>

          {/* Patient registered facility badge (desktop) */}
          <div className="hidden lg:flex items-center gap-2 text-xs text-[#64748B] dark:text-[#7B9EA8]">
            <Building2 className="w-4 h-4 text-[#087F6D] dark:text-[#4FD1C5]" />
            <span>
              {t.registeredPHC}: <strong className="text-[#17324D] dark:text-[#E2EEF4]">{mockPatientProfile.registeredFacility}</strong>
            </span>
          </div>
        </div>

        {/* Right: HealthSure Voice shortcut + Notifications + Language + Theme + Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick Voice Call Button on desktop */}
          <button
            type="button"
            onClick={onOpenVoiceIVR}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#087F6D]/30 bg-[#EAF7F2] dark:bg-[#073B3A]/40 text-[#087F6D] dark:text-[#4FD1C5] text-xs font-bold hover:bg-[#087F6D] hover:text-white transition-all shadow-2xs focus-visible:outline-2 focus-visible:outline-[#087F6D]"
            aria-label="Call HealthSure Voice IVR"
          >
            <PhoneCall className="w-3.5 h-3.5" />
            <span>{HEALTHSURE_IVR_NUMBER}</span>
          </button>

          {/* Notifications */}
          <NotificationPanel />

          {/* Language selector */}
          <div className="hidden sm:block">
            <LanguageSelector />
          </div>

          {/* Theme toggle */}
          <ThemeToggle />

          {/* Patient Profile Menu */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setProfileMenuOpen(!profileMenuOpen)}
              className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-xl border border-[#DDE8E4] dark:border-[#1A3A3A] bg-[#F5F9F7] dark:bg-[#0F2929] hover:border-[#087F6D] transition-colors text-left focus-visible:outline-2 focus-visible:outline-[#087F6D]"
              aria-expanded={profileMenuOpen}
              aria-label="Patient account menu"
            >
              <div className="w-7 h-7 rounded-lg bg-[#087F6D] text-white flex items-center justify-center font-bold text-xs shrink-0">
                {patientName.charAt(0)}
              </div>
              <div className="hidden md:block">
                <div className="text-xs font-bold text-[#17324D] dark:text-[#E2EEF4] leading-none">
                  {patientName}
                </div>
                <div className="text-[10px] font-semibold text-[#087F6D] dark:text-[#4FD1C5] mt-0.5">
                  {patientId}
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-[#64748B] dark:text-[#7B9EA8] hidden md:block" />
            </button>

            {/* Profile Dropdown */}
            {profileMenuOpen && (
              <div
                className="absolute right-0 mt-2 w-56 rounded-2xl border border-[#DDE8E4] dark:border-[#1A3A3A] bg-white dark:bg-[#0A2020] shadow-xl z-50 p-2 space-y-1 animate-in fade-in zoom-in-95 duration-100"
                role="menu"
              >
                <div className="px-3 py-2 border-b border-[#DDE8E4]/60 dark:border-[#1A3A3A]">
                  <div className="text-xs font-bold text-[#17324D] dark:text-[#E2EEF4]">
                    {patientName}
                  </div>
                  <div className="text-[11px] text-[#087F6D] dark:text-[#4FD1C5] font-semibold">
                    {t.idLabel}: {patientId} • ABHA: {mockPatientProfile.abhaId.substring(0, 7)}…
                  </div>
                </div>

                <Link
                  to="/patient/profile"
                  onClick={() => setProfileMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-[#17324D] dark:text-[#D1E8E2] hover:bg-[#F5F9F7] dark:hover:bg-[#0F2929]"
                  role="menuitem"
                >
                  <User className="w-4 h-4 text-[#087F6D]" />
                  <span>{t.navProfile}</span>
                </Link>

                <Link
                  to="/patient/help"
                  onClick={() => setProfileMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-[#17324D] dark:text-[#D1E8E2] hover:bg-[#F5F9F7] dark:hover:bg-[#0F2929]"
                  role="menuitem"
                >
                  <HelpCircle className="w-4 h-4 text-[#087F6D]" />
                  <span>{t.navHelp}</span>
                </Link>

                <div className="pt-1 border-t border-[#DDE8E4]/60 dark:border-[#1A3A3A]">
                  <button
                    type="button"
                    onClick={() => {
                      setProfileMenuOpen(false);
                      logout();
                      navigate('/login');
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-left"
                    role="menuitem"
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
