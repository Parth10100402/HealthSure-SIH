// HealthSure — Reusable Accessible Empty State Component
// frontend/src/components/patient/EmptyState.tsx

import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  className = '',
}) => {
  return (
    <div
      className={`rounded-2xl border border-dashed border-[#DDE8E4] dark:border-[#1A3A3A] bg-white/50 dark:bg-[#0A2020]/40 p-8 sm:p-12 text-center flex flex-col items-center justify-center space-y-4 ${className}`}
    >
      <div className="w-14 h-14 rounded-2xl bg-[#EAF7F2] dark:bg-[#073B3A]/60 flex items-center justify-center text-[#087F6D] dark:text-[#4FD1C5]">
        <Icon className="w-7 h-7" aria-hidden="true" />
      </div>
      <div className="max-w-sm space-y-1.5">
        <h3 className="text-base font-bold text-[#17324D] dark:text-[#E2EEF4]">{title}</h3>
        <p className="text-xs sm:text-sm text-[#64748B] dark:text-[#7B9EA8] leading-relaxed">
          {description}
        </p>
      </div>
      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="inline-flex items-center gap-2 rounded-lg bg-[#087F6D] hover:bg-[#073B3A] text-white text-xs sm:text-sm font-semibold px-4 py-2.5 transition-all shadow-xs focus-visible:outline-2 focus-visible:outline-[#087F6D] focus-visible:outline-offset-2"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};
