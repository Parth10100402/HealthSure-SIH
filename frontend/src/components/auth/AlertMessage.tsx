import React from 'react';
import { AlertCircle, CheckCircle2, Info, AlertTriangle } from 'lucide-react';

type AlertVariant = 'error' | 'success' | 'warning' | 'info';

interface AlertMessageProps {
  variant: AlertVariant;
  message: string;
  className?: string;
}

const config: Record<AlertVariant, { icon: React.ReactNode; classes: string }> = {
  error: {
    icon: <AlertCircle className="w-4 h-4 shrink-0" aria-hidden="true" />,
    classes:
      'bg-red-50 border-red-200 text-red-700 dark:bg-red-950/40 dark:border-red-800/60 dark:text-red-300',
  },
  success: {
    icon: <CheckCircle2 className="w-4 h-4 shrink-0" aria-hidden="true" />,
    classes:
      'bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-950/40 dark:border-emerald-800/60 dark:text-emerald-300',
  },
  warning: {
    icon: <AlertTriangle className="w-4 h-4 shrink-0" aria-hidden="true" />,
    classes:
      'bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-950/40 dark:border-amber-800/60 dark:text-amber-300',
  },
  info: {
    icon: <Info className="w-4 h-4 shrink-0" aria-hidden="true" />,
    classes:
      'bg-[#EAF7F2] border-[#DDE8E4] text-[#17324D] dark:bg-[#073B3A]/40 dark:border-[#087F6D]/40 dark:text-[#A7D9CE]',
  },
};

export const AlertMessage: React.FC<AlertMessageProps> = ({ variant, message, className = '' }) => {
  const { icon, classes } = config[variant];

  return (
    <div
      role={variant === 'error' ? 'alert' : 'status'}
      aria-live={variant === 'error' ? 'assertive' : 'polite'}
      className={`flex items-start gap-2.5 rounded-lg border px-3.5 py-3 text-sm font-medium leading-snug ${classes} ${className}`}
    >
      {icon}
      <span>{message}</span>
    </div>
  );
};
