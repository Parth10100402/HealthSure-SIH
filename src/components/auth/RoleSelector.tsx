import React from 'react';
import {
  User,
  Stethoscope,
  Building2,
  BarChart3,
} from 'lucide-react';
import type { UserRole } from './types';
import { ROLES } from './types';
import { useTranslation } from '../../lib/i18n/useTranslation';

const ICON_MAP: Record<string, React.ReactNode> = {
  User: <User className="w-6 h-6" />,
  Stethoscope: <Stethoscope className="w-6 h-6" />,
  Building2: <Building2 className="w-6 h-6" />,
  BarChart3: <BarChart3 className="w-6 h-6" />,
};

interface RoleSelectorProps {
  selectedRole: UserRole | null;
  onSelect: (role: UserRole) => void;
}

export const RoleSelector: React.FC<RoleSelectorProps> = ({ selectedRole, onSelect }) => {
  const t = useTranslation();

  const roleLabels: Record<UserRole, { label: string; description: string }> = {
    patient:          { label: t.rolePatientLabel,  description: t.rolePatientDesc },
    doctor:           { label: t.roleDoctorLabel,   description: t.roleDoctorDesc },
    hospital_staff:   { label: t.roleHospitalLabel, description: t.roleHospitalDesc },
    government_admin: { label: t.roleAdminLabel,    description: t.roleAdminDesc },
  };

  return (
    <div className="space-y-5">
      <div className="text-center space-y-1">
        <h2 className="text-xl font-bold text-[#17324D] dark:text-[#E2EEF4]">
          {t.selectRoleTitle}
        </h2>
        <p className="text-sm text-[#64748B] dark:text-[#7B9EA8]">
          {t.selectRoleSubtitle}
        </p>
      </div>

      <div
        role="radiogroup"
        aria-label={t.selectRoleTitle}
        className="grid grid-cols-1 sm:grid-cols-2 gap-3"
      >
        {ROLES.map((role) => {
          const isSelected = selectedRole === role.id;
          const { label, description } = roleLabels[role.id];
          return (
            <button
              key={role.id}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => onSelect(role.id)}
              className={`
                group relative flex items-start gap-3.5 rounded-xl border p-4 text-left
                transition-all duration-150 focus-visible:outline-2 focus-visible:outline-[#087F6D] focus-visible:outline-offset-2
                ${
                  isSelected
                    ? 'border-[#087F6D] bg-[#EAF7F2] dark:bg-[#073B3A]/60 dark:border-[#087F6D] shadow-sm'
                    : 'border-[#DDE8E4] dark:border-[#1A3A3A] bg-white dark:bg-[#0A2020] hover:border-[#087F6D]/60 hover:bg-[#F5F9F7] dark:hover:border-[#087F6D]/50 dark:hover:bg-[#0F2929]'
                }
              `}
            >
              {/* Icon */}
              <div
                className={`
                  flex-shrink-0 flex items-center justify-center w-11 h-11 rounded-lg
                  transition-colors
                  ${
                    isSelected
                      ? 'bg-[#087F6D] text-white'
                      : 'bg-[#F5F9F7] dark:bg-[#0F2929] text-[#087F6D] dark:text-[#4FD1C5] group-hover:bg-[#EAF7F2] dark:group-hover:bg-[#073B3A]/60'
                  }
                `}
                aria-hidden="true"
              >
                {ICON_MAP[role.iconName]}
              </div>

              {/* Text */}
              <div className="flex-1 min-w-0 pt-0.5">
                <div className="font-semibold text-sm text-[#17324D] dark:text-[#D1E8E2]">
                  {label}
                </div>
                <div className="text-xs text-[#64748B] dark:text-[#7B9EA8] mt-0.5 leading-snug">
                  {description}
                </div>
              </div>

              {/* Selected indicator */}
              {isSelected && (
                <div
                  className="flex-shrink-0 w-5 h-5 rounded-full bg-[#087F6D] flex items-center justify-center mt-0.5"
                  aria-hidden="true"
                >
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 12 12">
                    <path
                      d="M2 6l3 3 5-5"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {selectedRole && (
        <p className="text-xs text-center text-[#64748B] dark:text-[#7B9EA8]">
          {t.roleHint}
        </p>
      )}
    </div>
  );
};
