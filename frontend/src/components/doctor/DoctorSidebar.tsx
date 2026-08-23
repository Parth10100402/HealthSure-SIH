// HealthSure — Doctor Sidebar Component
// frontend/src/components/doctor/DoctorSidebar.tsx

import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Calendar,
  Share2,
  Video,
  FileText,
  Clock,
  Activity,
  User,
  LogOut,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { mockDoctorProfile } from '../../data/doctorMockData';
import { useTranslation } from '../../lib/i18n/useTranslation';

interface DoctorSidebarProps {
  onCloseMobileDrawer?: () => void;
}

interface NavItem {
  to: string;
  label: string;
  icon: React.ReactNode;
  badge?: string;
  badgeVariant?: 'teal' | 'amber';
  end?: boolean;
}

export const DoctorSidebar: React.FC<DoctorSidebarProps> = ({ onCloseMobileDrawer }) => {
  const { logout } = useAuth();
  const t = useTranslation();

  const navItems: NavItem[] = [
    {
      to: '/doctor',
      label: t.navOverview,
      icon: <LayoutDashboard className="w-4 h-4 shrink-0" />,
      end: true,
    },
    {
      to: '/doctor/appointments',
      label: t.navTodayPatients,
      icon: <Calendar className="w-4 h-4 shrink-0" />,
      badge: '8 Today',
      badgeVariant: 'teal',
    },
    {
      to: '/doctor/referrals',
      label: t.navReferrals,
      icon: <Share2 className="w-4 h-4 shrink-0" />,
      badge: '3 New',
      badgeVariant: 'amber',
    },
    {
      to: '/doctor/teleconsultation',
      label: t.navTeleconsult,
      icon: <Video className="w-4 h-4 shrink-0" />,
      badge: '2 Live',
      badgeVariant: 'teal',
    },
    {
      to: '/doctor/records',
      label: t.navRecords,
      icon: <FileText className="w-4 h-4 shrink-0" />,
    },
    {
      to: '/doctor/follow-ups',
      label: t.navFollowups,
      icon: <Clock className="w-4 h-4 shrink-0" />,
    },
    {
      to: '/doctor/outreach',
      label: t.navOutreach,
      icon: <Activity className="w-4 h-4 shrink-0" />,
      badge: 'PHC Khed',
      badgeVariant: 'teal',
    },
    {
      to: '/doctor/profile',
      label: t.navProfile,
      icon: <User className="w-4 h-4 shrink-0" />,
    },
  ];

  return (
    <aside
      className="flex flex-col justify-between h-full bg-white dark:bg-[#072424] border-r border-[#DDE8E4] dark:border-[#1A3A3A] transition-colors overflow-y-auto select-none"
      aria-label="Doctor Clinical Navigation"
    >
      {/* Top: Brand Header */}
      <div>
        <div className="p-4 sm:p-5 border-b border-[#DDE8E4] dark:border-[#1A3A3A]">
          <div className="flex items-center">
            <img
              src="/healthsure-logo.png"
              alt="HealthSure"
              className="h-8 sm:h-9 w-auto object-contain max-w-[170px]"
            />
          </div>
          <div className="mt-2.5 flex items-center gap-1.5 text-[11px] font-semibold text-[#087F6D] dark:text-[#4FD1C5]">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Doctor Clinical Console</span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="p-3 space-y-1" aria-label="Clinical Menu">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={onCloseMobileDrawer}
              className={({ isActive }) =>
                `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-[#087F6D] text-white shadow-xs'
                    : 'text-[#17324D] dark:text-[#D1E8E2] hover:bg-[#F5F9F7] dark:hover:bg-[#0A2020]'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className="flex items-center gap-2.5">
                    {item.icon}
                    <span>{item.label}</span>
                  </div>

                  {item.badge && (
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : item.badgeVariant === 'amber'
                          ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300'
                          : 'bg-[#EAF7F2] dark:bg-[#073B3A] text-[#087F6D] dark:text-[#4FD1C5]'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Bottom: Doctor Clinical Hospital Assignment card & Logout */}
      <div className="p-3.5 border-t border-[#DDE8E4] dark:border-[#1A3A3A] space-y-2">
        <div className="p-3 rounded-xl bg-[#F5F9F7] dark:bg-[#0A2020] border border-[#DDE8E4] dark:border-[#1A3A3A] space-y-1">
          <div className="text-[10px] font-bold uppercase tracking-wider text-[#64748B] dark:text-[#7B9EA8]">
            Affiliated Station
          </div>
          <div className="text-xs font-bold text-[#17324D] dark:text-[#E2EEF4] truncate">
            {mockDoctorProfile.hospital}
          </div>
          <div className="text-[11px] text-[#087F6D] dark:text-[#4FD1C5] font-semibold">
            {mockDoctorProfile.department}
          </div>
        </div>

        <button
          type="button"
          onClick={() => logout()}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out Doctor Panel</span>
        </button>
      </div>
    </aside>
  );
};
