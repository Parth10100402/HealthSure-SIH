// HealthSure — Government / Public Health Admin Sidebar Component
// frontend/src/components/admin/AdminSidebar.tsx

import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Building2,
  Share2,
  Activity,
  Calendar,
  Video,
  Clock,
  Stethoscope,
  FileBarChart,
  Settings,
  LogOut,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { mockAdminProfile } from '../../data/adminMockData';
import { useTranslation } from '../../lib/i18n/useTranslation';

interface AdminSidebarProps {
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

export const AdminSidebar: React.FC<AdminSidebarProps> = ({ onCloseMobileDrawer }) => {
  const { logout } = useAuth();
  const t = useTranslation();

  const navItems: NavItem[] = [
    {
      to: '/admin',
      label: t.navOverview,
      icon: <LayoutDashboard className="w-4 h-4 shrink-0" />,
      end: true,
    },
    {
      to: '/admin/facilities',
      label: t.navFacilities,
      icon: <Building2 className="w-4 h-4 shrink-0" />,
      badge: '6 Units',
      badgeVariant: 'teal',
    },
    {
      to: '/admin/referrals',
      label: t.navReferrals,
      icon: <Share2 className="w-4 h-4 shrink-0" />,
      badge: '438 Act.',
      badgeVariant: 'amber',
    },
    {
      to: '/admin/outreach',
      label: t.navOutreach,
      icon: <Activity className="w-4 h-4 shrink-0" />,
      badge: '126 MMU',
      badgeVariant: 'teal',
    },
    {
      to: '/admin/appointments',
      label: t.navAppointments,
      icon: <Calendar className="w-4 h-4 shrink-0" />,
    },
    {
      to: '/admin/teleconsultations',
      label: t.navTeleconsult,
      icon: <Video className="w-4 h-4 shrink-0" />,
    },
    {
      to: '/admin/follow-ups',
      label: t.navFollowups,
      icon: <Clock className="w-4 h-4 shrink-0" />,
      badge: '17 Due',
      badgeVariant: 'amber',
    },
    {
      to: '/admin/diagnostics',
      label: t.navDiagnostics,
      icon: <Stethoscope className="w-4 h-4 shrink-0" />,
    },
    {
      to: '/admin/reports',
      label: t.navReports,
      icon: <FileBarChart className="w-4 h-4 shrink-0" />,
    },
    {
      to: '/admin/settings',
      label: t.navSettings,
      icon: <Settings className="w-4 h-4 shrink-0" />,
    },
  ];

  return (
    <aside
      className="flex flex-col justify-between h-full bg-white dark:bg-[#072424] border-r border-[#DDE8E4] dark:border-[#1A3A3A] transition-colors overflow-y-auto select-none"
      aria-label="Government Public Health Navigation"
    >
      {/* Top: Brand Header */}
      <div>
        <div className="p-4 sm:p-5 border-b border-[#DDE8E4] dark:border-[#1A3A3A]">
          <div className="flex items-center">
            <img
              src="/healthsure-logo.png"
              alt="HealthSure"
              className="h-9 sm:h-10 w-auto object-contain"
            />
          </div>
          <div className="mt-2.5 flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#EAF7F2] dark:bg-[#073B3A]/60 border border-[#087F6D]/20 text-[11px] font-bold text-[#087F6D] dark:text-[#4FD1C5]">
            <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">Public Health Administration</span>
          </div>
        </div>

        {/* Navigation Link List */}
        <nav className="p-3 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={onCloseMobileDrawer}
              className={({ isActive }) =>
                `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all group ${
                  isActive
                    ? 'bg-[#087F6D] text-white shadow-xs'
                    : 'text-[#64748B] dark:text-[#7B9EA8] hover:bg-[#F5F9F7] dark:hover:bg-[#0F2929] hover:text-[#17324D] dark:hover:text-[#E2EEF4]'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className="flex items-center gap-3 min-w-0">
                    <span className={isActive ? 'text-white' : 'text-[#087F6D] dark:text-[#4FD1C5]'}>
                      {item.icon}
                    </span>
                    <span className="truncate">{item.label}</span>
                  </div>

                  {item.badge && (
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : item.badgeVariant === 'amber'
                          ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                          : 'bg-[#EAF7F2] text-[#087F6D] dark:bg-[#073B3A] dark:text-[#4FD1C5]'
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

      {/* Bottom: Admin Profile summary & Sign Out */}
      <div className="p-4 border-t border-[#DDE8E4] dark:border-[#1A3A3A] space-y-3 bg-[#F5F9F7]/50 dark:bg-[#051818]/50">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#087F6D] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
            MH
          </div>
          <div className="min-w-0 flex-1">
            <div className="font-bold text-xs text-[#17324D] dark:text-[#E2EEF4] truncate">
              {mockAdminProfile.fullName}
            </div>
            <div className="text-[10px] text-[#64748B] dark:text-[#7B9EA8] truncate">
              {mockAdminProfile.id} • Maharashtra
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl border border-rose-200 dark:border-rose-900/40 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>{t.navLogout}</span>
        </button>
      </div>
    </aside>
  );
};
