// HealthSure — Government / Public Health Admin Bottom Navigation Component
// frontend/src/components/admin/AdminBottomNav.tsx

import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Building2,
  Share2,
  Activity,
  Menu,
} from 'lucide-react';
import { useTranslation } from '../../lib/i18n/useTranslation';

interface AdminBottomNavProps {
  onOpenMobileMenu: () => void;
}

export const AdminBottomNav: React.FC<AdminBottomNavProps> = ({ onOpenMobileMenu }) => {
  const t = useTranslation();

  const items = [
    { to: '/admin', label: t.navOverview, icon: <LayoutDashboard className="w-5 h-5" />, end: true },
    { to: '/admin/facilities', label: t.navFacilities, icon: <Building2 className="w-5 h-5" /> },
    { to: '/admin/referrals', label: t.navReferrals, icon: <Share2 className="w-5 h-5" /> },
    { to: '/admin/outreach', label: t.navOutreach, icon: <Activity className="w-5 h-5" /> },
  ];

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#072424]/95 backdrop-blur-md border-t border-[#DDE8E4] dark:border-[#1A3A3A] px-3 py-1.5 flex items-center justify-around">
      {items.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          className={({ isActive }) =>
            `flex flex-col items-center justify-center p-1.5 rounded-xl transition-colors ${
              isActive
                ? 'text-[#087F6D] dark:text-[#4FD1C5] font-bold'
                : 'text-[#64748B] dark:text-[#7B9EA8] hover:text-[#17324D]'
            }`
          }
        >
          {item.icon}
          <span className="text-[10px] mt-0.5">{item.label}</span>
        </NavLink>
      ))}

      <button
        type="button"
        onClick={onOpenMobileMenu}
        className="flex flex-col items-center justify-center p-1.5 rounded-xl text-[#64748B] dark:text-[#7B9EA8] hover:text-[#17324D] cursor-pointer"
      >
        <Menu className="w-5 h-5" />
        <span className="text-[10px] mt-0.5">More</span>
      </button>
    </div>
  );
};
