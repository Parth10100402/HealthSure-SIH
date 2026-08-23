// HealthSure — Doctor Mobile Bottom Navigation
// frontend/src/components/doctor/DoctorBottomNav.tsx

import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Calendar,
  Share2,
  Video,
  FileText,
  Menu,
} from 'lucide-react';

interface DoctorBottomNavProps {
  onOpenMobileMenu: () => void;
}

export const DoctorBottomNav: React.FC<DoctorBottomNavProps> = ({ onOpenMobileMenu }) => {
  const bottomItems = [
    {
      to: '/doctor',
      label: 'Home',
      icon: <LayoutDashboard className="w-5 h-5" />,
      end: true,
    },
    {
      to: '/doctor/appointments',
      label: 'Patients',
      icon: <Calendar className="w-5 h-5" />,
    },
    {
      to: '/doctor/referrals',
      label: 'Referrals',
      icon: <Share2 className="w-5 h-5" />,
    },
    {
      to: '/doctor/teleconsultation',
      label: 'Tele-OPD',
      icon: <Video className="w-5 h-5" />,
    },
    {
      to: '/doctor/records',
      label: 'Vault',
      icon: <FileText className="w-5 h-5" />,
    },
  ];

  return (
    <nav
      className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 dark:bg-[#072424]/95 backdrop-blur-md border-t border-[#DDE8E4] dark:border-[#1A3A3A] px-2 py-1.5 shadow-lg select-none"
      aria-label="Doctor Mobile Navigation"
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

        {/* Menu button to open full drawer */}
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
