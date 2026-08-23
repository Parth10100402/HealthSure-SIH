// HealthSure — Semantic Status Badge Component (Fully Localized)
// frontend/src/components/patient/StatusBadge.tsx

import React from 'react';
import { useTranslation } from '../../lib/i18n/useTranslation';

export type StatusVariant =
  | 'confirmed'
  | 'pending'
  | 'completed'
  | 'cancelled'
  | 'available'
  | 'limited'
  | 'unavailable'
  | 'urgent'
  | 'normal'
  | 'due'
  | 'overdue'
  | 'upcoming'
  | 'hospital accepted'
  | 'specialist scheduled';

interface StatusBadgeProps {
  status: StatusVariant | string;
  label?: string;
  className?: string;
  size?: 'sm' | 'md';
}

const STYLE_MAP: Record<string, { bg: string; text: string; border: string; dot: string }> = {
  confirmed: {
    bg: 'bg-emerald-50 dark:bg-emerald-950/40',
    text: 'text-emerald-700 dark:text-emerald-300',
    border: 'border-emerald-200 dark:border-emerald-800/60',
    dot: 'bg-emerald-500',
  },
  available: {
    bg: 'bg-emerald-50 dark:bg-emerald-950/40',
    text: 'text-emerald-700 dark:text-emerald-300',
    border: 'border-emerald-200 dark:border-emerald-800/60',
    dot: 'bg-emerald-500',
  },
  'hospital accepted': {
    bg: 'bg-emerald-50 dark:bg-emerald-950/40',
    text: 'text-emerald-700 dark:text-emerald-300',
    border: 'border-emerald-200 dark:border-emerald-800/60',
    dot: 'bg-emerald-500',
  },
  pending: {
    bg: 'bg-amber-50 dark:bg-amber-950/40',
    text: 'text-amber-700 dark:text-amber-300',
    border: 'border-amber-200 dark:border-amber-800/60',
    dot: 'bg-amber-500',
  },
  due: {
    bg: 'bg-amber-50 dark:bg-amber-950/40',
    text: 'text-amber-700 dark:text-amber-300',
    border: 'border-amber-200 dark:border-amber-800/60',
    dot: 'bg-amber-500',
  },
  limited: {
    bg: 'bg-amber-50 dark:bg-amber-950/40',
    text: 'text-amber-700 dark:text-amber-300',
    border: 'border-amber-200 dark:border-amber-800/60',
    dot: 'bg-amber-500',
  },
  completed: {
    bg: 'bg-teal-50 dark:bg-teal-950/40',
    text: 'text-teal-700 dark:text-teal-300',
    border: 'border-teal-200 dark:border-teal-800/60',
    dot: 'bg-teal-500',
  },
  upcoming: {
    bg: 'bg-sky-50 dark:bg-sky-950/40',
    text: 'text-sky-700 dark:text-sky-300',
    border: 'border-sky-200 dark:border-sky-800/60',
    dot: 'bg-sky-500',
  },
  cancelled: {
    bg: 'bg-rose-50 dark:bg-rose-950/40',
    text: 'text-rose-700 dark:text-rose-300',
    border: 'border-rose-200 dark:border-rose-800/60',
    dot: 'bg-rose-500',
  },
  unavailable: {
    bg: 'bg-rose-50 dark:bg-rose-950/40',
    text: 'text-rose-700 dark:text-rose-300',
    border: 'border-rose-200 dark:border-rose-800/60',
    dot: 'bg-rose-500',
  },
  overdue: {
    bg: 'bg-rose-50 dark:bg-rose-950/40',
    text: 'text-rose-700 dark:text-rose-300',
    border: 'border-rose-200 dark:border-rose-800/60',
    dot: 'bg-rose-500',
  },
  urgent: {
    bg: 'bg-rose-50 dark:bg-rose-950/40',
    text: 'text-rose-700 dark:text-rose-300',
    border: 'border-rose-200 dark:border-rose-800/60',
    dot: 'bg-rose-500',
  },
  normal: {
    bg: 'bg-slate-50 dark:bg-slate-800/50',
    text: 'text-slate-700 dark:text-slate-300',
    border: 'border-slate-200 dark:border-slate-700',
    dot: 'bg-slate-400',
  },
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  label,
  className = '',
  size = 'md',
}) => {
  const t = useTranslation();
  const normalized = status.toLowerCase();
  const style = STYLE_MAP[normalized] || STYLE_MAP.normal;

  const getDefaultLabel = (st: string) => {
    switch (st) {
      case 'confirmed':
        return t.statusConfirmed;
      case 'pending':
        return t.statusPending;
      case 'completed':
        return t.statusCompleted;
      case 'cancelled':
        return t.statusCancelled;
      case 'hospital accepted':
        return t.statusHospitalAccepted;
      case 'urgent':
        return t.statusUrgent;
      case 'normal':
        return t.statusNormal;
      case 'due':
        return t.statusDue;
      case 'overdue':
        return t.statusOverdue;
      case 'upcoming':
        return t.tabUpcoming;
      case 'available':
        return t.statusAvailable;
      case 'limited':
        return t.statusLimited;
      case 'unavailable':
        return t.statusUnavailable;
      default:
        return st.charAt(0).toUpperCase() + st.slice(1);
    }
  };

  const displayLabel = label || getDefaultLabel(normalized);
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs font-medium';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border ${style.bg} ${style.text} ${style.border} ${sizeClasses} font-semibold transition-colors ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${style.dot}`} aria-hidden="true" />
      <span>{displayLabel}</span>
    </span>
  );
};
