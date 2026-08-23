// HealthSure — Patient Portal Navigation Sidebar
// frontend/src/components/patient/PatientSidebar.tsx

import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Calendar,
  Activity,
  FileText,
  Share2,
  Video,
  Clock,
  User,
  HelpCircle,
  PhoneCall,
  LogOut,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from '../../lib/i18n/useTranslation';

interface PatientSidebarProps {
  onOpenVoiceIVR: () => void;
  onCloseMobileDrawer?: () => void;
}

interface NavItem {
  to: string;
  label: string;
  icon: React.ReactNode;
  badge?: string;
  badgeVariant?: 'teal' | 'amber' | 'blue';
  end?: boolean;
}

export const PatientSidebar: React.FC<PatientSidebarProps> = ({
  onOpenVoiceIVR,
  onCloseMobileDrawer,
}) => {
  const { logout } = useAuth();
  const t = useTranslation();

  const navItems: NavItem[] = [
    {
      to: '/patient',
      label: t.navOverview,
      icon: <LayoutDashboard className="w-4 h-4 shrink-0" />,
      end: true,
    },
    {
      to: '/patient/appointments',
      label: t.navAppointments,
      icon: <Calendar className="w-4 h-4 shrink-0" />,
    },
    {
      to: '/patient/outreach',
      label: t.navOutreach,
      icon: <Activity className="w-4 h-4 shrink-0" />,
      badge: 'Weekly',
      badgeVariant: 'teal',
    },
    {
      to: '/patient/records',
      label: t.navRecords,
      icon: <FileText className="w-4 h-4 shrink-0" />,
    },
    {
      to: '/patient/referrals',
      label: t.navReferrals,
      icon: <Share2 className="w-4 h-4 shrink-0" />,
      badge: '1 Active',
      badgeVariant: 'amber',
    },
    {
      to: '/patient/teleconsultation',
      label: t.navTeleconsult,
      icon: <Video className="w-4 h-4 shrink-0" />,
    },
    {
      to: '/patient/follow-ups',
      label: t.navFollowups,
      icon: <Clock className="w-4 h-4 shrink-0" />,
    },
    {
      to: '/patient/profile',
      label: t.navProfile,
      icon: <User className="w-4 h-4 shrink-0" />,
    },
    {
      to: '/patient/help',
      label: t.navHelp,
      icon: <HelpCircle className="w-4 h-4 shrink-0" />,
    },
  ];

  const getBadgeClass = (variant?: 'teal' | 'amber' | 'blue') => {
    switch (variant) {
      case 'amber':
        return 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300';
      case 'blue':
        return 'bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300';
      case 'teal':
      default:
        return 'bg-[#EAF7F2] dark:bg-[#073B3A] text-[#087F6D] dark:text-[#4FD1C5]';
    }
  };

  return (
    <aside
      className="flex flex-col justify-between h-full bg-white dark:bg-[#072424] border-r border-[#DDE8E4] dark:border-[#1A3A3A] transition-colors overflow-y-auto select-none"
      aria-label="Patient Navigation"
    >
      {/* Brand / Logo section */}
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
          <span>Patient Portal • Care Continuity</span>
        </div>
      </div>

      {/* Navigation items */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto" role="list">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={onCloseMobileDrawer}
            className={({ isActive }) =>
              `flex items-center justify-between px-3 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-150 group focus-visible:outline-2 focus-visible:outline-[#087F6D] ${
                isActive
                  ? 'bg-[#087F6D] text-white shadow-xs'
                  : 'text-[#17324D] dark:text-[#D1E8E2] hover:bg-[#F5F9F7] dark:hover:bg-[#0A2020] hover:text-[#087F6D] dark:hover:text-[#4FD1C5]'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <div className="flex items-center gap-2.5">
                  <span
                    className={`transition-colors ${
                      isActive ? 'text-white' : 'text-[#64748B] dark:text-[#7B9EA8] group-hover:text-[#087F6D] dark:group-hover:text-[#4FD1C5]'
                    }`}
                  >
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </div>

                {item.badge && (
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full transition-colors ${
                      isActive ? 'bg-white/20 text-white' : getBadgeClass(item.badgeVariant)
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

      {/* Bottom Voice / Logout Card */}
      <div className="p-3.5 border-t border-[#DDE8E4] dark:border-[#1A3A3A] space-y-2 bg-[#F5F9F7]/50 dark:bg-[#051818]/50">
        {/* Voice IVR action button */}
        <button
          type="button"
          onClick={() => {
            if (onCloseMobileDrawer) onCloseMobileDrawer();
            onOpenVoiceIVR();
          }}
          className="w-full flex items-center justify-between p-2.5 rounded-xl border border-[#087F6D]/30 bg-[#EAF7F2] dark:bg-[#073B3A]/40 hover:bg-[#087F6D] hover:text-white text-[#073B3A] dark:text-[#D1E8E2] transition-all group focus-visible:outline-2 focus-visible:outline-[#087F6D]"
        >
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#087F6D] text-white flex items-center justify-center group-hover:bg-white group-hover:text-[#087F6D] transition-colors">
              <PhoneCall className="w-3.5 h-3.5" />
            </div>
            <div className="text-left">
              <div className="text-xs font-bold leading-none">HealthSure Voice</div>
              <div className="text-[10px] text-[#64748B] dark:text-[#A7D9CE] group-hover:text-white/80 mt-0.5">
                Toll-Free (1800)
              </div>
            </div>
          </div>
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-white/60 dark:bg-[#0A2020] text-[#087F6D] dark:text-[#4FD1C5] group-hover:bg-white/20 group-hover:text-white">
            Call
          </span>
        </button>

        {/* Logout */}
        <button
          type="button"
          onClick={logout}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-[#64748B] dark:text-[#7B9EA8] hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors focus-visible:outline-2 focus-visible:outline-rose-500"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};
