// HealthSure — Patient Mobile Bottom Navigation Bar (Simplified 5-Item Touch Bar)
// frontend/src/components/patient/PatientBottomNav.tsx

import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Calendar,
  FileText,
  PhoneCall,
  Menu,
} from 'lucide-react';
import { HEALTHSURE_IVR_TEL } from '../../config/constants';

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
      to: '/patient/records',
      label: 'Health',
      icon: <FileText className="w-5 h-5" />,
    },
  ];

  return (
    <nav
      className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 dark:bg-[#072424]/95 backdrop-blur-md border-t border-[#DDE8E4] dark:border-[#1A3A3A] px-2 py-1 shadow-2xl select-none"
      aria-label="Mobile Navigation Bar"
    >
      <div className="grid grid-cols-5 gap-1 items-center max-w-md mx-auto">
        {/* Core 3 Navigation Tabs */}
        {bottomItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center py-1.5 px-1 rounded-2xl transition-all cursor-pointer ${
                isActive
                  ? 'text-[#087F6D] dark:text-[#4FD1C5] font-bold'
                  : 'text-[#64748B] dark:text-[#7B9EA8] hover:text-[#087F6D] font-medium'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <div
                  className={`p-1.5 rounded-xl transition-colors ${
                    isActive ? 'bg-[#EAF7F2] dark:bg-[#073B3A]' : ''
                  }`}
                >
                  {item.icon}
                </div>
                <span className="text-[11px] mt-0.5 leading-none font-semibold">
                  {item.label}
                </span>
              </>
            )}
          </NavLink>
        ))}

        {/* 4. Direct 1-Tap Emergency Call Tab */}
        <a
          href={HEALTHSURE_IVR_TEL}
          className="flex flex-col items-center justify-center py-1.5 px-1 rounded-2xl text-[#087F6D] dark:text-[#4FD1C5] font-bold hover:opacity-90 transition-all cursor-pointer"
          aria-label="Call HealthSure IVR Hotline"
        >
          <div className="p-1.5 rounded-xl bg-emerald-500 text-white shadow-xs animate-bounce">
            <PhoneCall className="w-5 h-5" />
          </div>
          <span className="text-[11px] mt-0.5 leading-none font-bold text-emerald-700 dark:text-emerald-400">
            Call IVR
          </span>
        </a>

        {/* 5. More Menu Drawer button */}
        <button
          type="button"
          onClick={onOpenMobileMenu}
          className="flex flex-col items-center justify-center py-1.5 px-1 rounded-2xl text-[#64748B] dark:text-[#7B9EA8] hover:text-[#087F6D] font-medium transition-all cursor-pointer"
          aria-label="Open all patient sections"
        >
          <div className="p-1.5 rounded-xl">
            <Menu className="w-5 h-5" />
          </div>
          <span className="text-[11px] mt-0.5 leading-none font-semibold">Menu</span>
        </button>
      </div>
    </nav>
  );
};
