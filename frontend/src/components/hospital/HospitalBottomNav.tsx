// HealthSure — Hospital Staff Mobile Bottom Navigation
// frontend/src/components/hospital/HospitalBottomNav.tsx

import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Share2,
  Calendar,
  Activity,
  Building2,
  Menu,
} from 'lucide-react';

interface HospitalBottomNavProps {
  onOpenMobileMenu: () => void;
}

export const HospitalBottomNav: React.FC<HospitalBottomNavProps> = ({ onOpenMobileMenu }) => {
  const bottomItems = [
    {
      to: '/hospital',
      label: 'Home',
      icon: <LayoutDashboard className="w-5 h-5" />,
      end: true,
    },
    {
      to: '/hospital/referrals',
      label: 'Referrals',
      icon: <Share2 className="w-5 h-5" />,
    },
    {
      to: '/hospital/appointments',
      label: 'Appts',
      icon: <Calendar className="w-5 h-5" />,
    },
    {
      to: '/hospital/outreach',
      label: 'Outreach',
      icon: <Activity className="w-5 h-5" />,
    },
    {
      to: '/hospital/capacity',
      label: 'Capacity',
      icon: <Building2 className="w-5 h-5" />,
    },
  ];

  return (
    <nav
      className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 dark:bg-[#072424]/95 backdrop-blur-md border-t border-[#DDE8E4] dark:border-[#1A3A3A] px-2 py-1.5 shadow-lg select-none"
      aria-label="Hospital Mobile Navigation"
    >
      <div className="grid grid-cols-6 gap-1 items-center">
        {bottomItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center py-1 px-1 rounded-xl text-[10px] font-bold transition-all ${
                isActive
                  ? 'text-[#087F6D] dark:text-[#4FD1C5]'
                  : 'text-[#64748B] dark:text-[#7B9EA8] hover:text-[#17324D]'
              }`
            }
          >
            {item.icon}
            <span className="mt-0.5">{item.label}</span>
          </NavLink>
        ))}

        <button
          type="button"
          onClick={onOpenMobileMenu}
          className="flex flex-col items-center justify-center py-1 px-1 rounded-xl text-[10px] font-bold text-[#64748B] dark:text-[#7B9EA8] hover:text-[#17324D]"
        >
          <Menu className="w-5 h-5" />
          <span className="mt-0.5">More</span>
        </button>
      </div>
    </nav>
  );
};
