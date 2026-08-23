// HealthSure — Patient Mobile Bottom Navigation Bar
// frontend/src/components/patient/PatientBottomNav.tsx

import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Calendar,
  Activity,
  FileText,
  Share2,
  Menu,
} from 'lucide-react';

interface PatientBottomNavProps {
  onOpenMobileMenu: () => void;
}

export const PatientBottomNav: React.FC<PatientBottomNavProps> = ({ onOpenMobileMenu }) => {
  const bottomItems = [
    {
      to: '/patient',
      label: 'Home',
      icon: <LayoutDashboard className="w-5 h-5" />,
      end: true,
    },
    {
      to: '/patient/appointments',
      label: 'Appts',
      icon: <Calendar className="w-5 h-5" />,
    },
    {
      to: '/patient/outreach',
      label: 'Outreach',
      icon: <Activity className="w-5 h-5" />,
    },
    {
      to: '/patient/records',
      label: 'Records',
      icon: <FileText className="w-5 h-5" />,
    },
    {
      to: '/patient/referrals',
      label: 'Referrals',
      icon: <Share2 className="w-5 h-5" />,
    },
  ];

  return (
    <nav
      className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 dark:bg-[#072424]/95 backdrop-blur-md border-t border-[#DDE8E4] dark:border-[#1A3A3A] px-2 py-1.5 shadow-lg select-none"
      aria-label="Mobile Navigation Bar"
    >
      <div className="grid grid-cols-6 gap-1 items-center">
        {bottomItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all ${
                isActive
                  ? 'text-[#087F6D] dark:text-[#4FD1C5] font-bold'
                  : 'text-[#64748B] dark:text-[#7B9EA8] hover:text-[#087F6D] font-medium'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <div
                  className={`p-1 rounded-lg transition-colors ${
                    isActive ? 'bg-[#EAF7F2] dark:bg-[#073B3A]' : ''
                  }`}
                >
                  {item.icon}
                </div>
                <span className="text-[10px] mt-0.5 leading-none truncate max-w-full">
                  {item.label}
                </span>
              </>
            )}
          </NavLink>
        ))}

        {/* More Drawer button */}
        <button
          type="button"
          onClick={onOpenMobileMenu}
          className="flex flex-col items-center justify-center py-1 px-1 rounded-xl text-[#64748B] dark:text-[#7B9EA8] hover:text-[#087F6D] font-medium transition-all"
          aria-label="Open all patient sections"
        >
          <div className="p-1 rounded-lg">
            <Menu className="w-5 h-5" />
          </div>
          <span className="text-[10px] mt-0.5 leading-none">More</span>
        </button>
      </div>
    </nav>
  );
};
