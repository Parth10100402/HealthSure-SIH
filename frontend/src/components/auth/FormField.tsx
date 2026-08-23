import React from 'react';

interface FormFieldProps {
  id: string;
  label: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  optional?: boolean;
  error?: string;
  icon?: React.ReactNode;
  prefix?: string;
  autoComplete?: string;
  inputMode?: React.InputHTMLAttributes<HTMLInputElement>['inputMode'];
  maxLength?: number;
  hint?: string;
  disabled?: boolean;
}

export const FormField: React.FC<FormFieldProps> = ({
  id,
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  required = false,
  optional = false,
  error,
  icon,
  prefix,
  autoComplete,
  inputMode,
  maxLength,
  hint,
  disabled = false,
}) => {
  const errorId = error ? `${id}-error` : undefined;
  const hintId = hint ? `${id}-hint` : undefined;
  const describedBy = [errorId, hintId].filter(Boolean).join(' ') || undefined;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label
          htmlFor={id}
          className="block text-sm font-semibold text-[#17324D] dark:text-[#D1E8E2]"
        >
          {label}
          {required && (
            <span className="ml-0.5 text-red-500" aria-hidden="true">
              *
            </span>
          )}
          {optional && (
            <span className="ml-1.5 text-xs font-normal text-[#64748B] dark:text-[#7B9EA8]">
              (optional)
            </span>
          )}
        </label>
      </div>

      <div className="relative flex items-stretch">
        {prefix && (
          <span className="inline-flex items-center px-3.5 rounded-l-lg border border-r-0 border-[#DDE8E4] dark:border-[#1A3A3A] bg-[#F5F9F7] dark:bg-[#0F2929] text-sm font-bold text-[#17324D] dark:text-[#D1E8E2] select-none shrink-0">
            {prefix}
          </span>
        )}

        {icon && (
          <div
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B] dark:text-[#7B9EA8] z-10"
            aria-hidden="true"
          >
            {icon}
          </div>
        )}

        <input
          id={id}
          name={id}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          required={required}
          aria-required={required}
          aria-invalid={!!error}
          aria-describedby={describedBy}
          autoComplete={autoComplete}
          inputMode={inputMode}
          maxLength={maxLength}
          disabled={disabled}
          className={`
            w-full border px-3.5 py-3 text-sm text-[#17324D] dark:text-[#E2EEF4]
            bg-white dark:bg-[#0A2020]
            placeholder:text-[#9DB5BD] dark:placeholder:text-[#4A6B75]
            transition-colors
            focus:outline-none focus:ring-2 focus:ring-[#087F6D] focus:border-[#087F6D]
            disabled:opacity-50 disabled:cursor-not-allowed
            ${prefix ? 'rounded-r-lg rounded-l-none' : 'rounded-lg'}
            ${icon ? 'pl-10' : ''}
            ${
              error
                ? 'border-red-400 dark:border-red-600 focus:ring-red-400 focus:border-red-400'
                : 'border-[#DDE8E4] dark:border-[#1A3A3A] hover:border-[#087F6D]/50 dark:hover:border-[#087F6D]/40'
            }
          `}
        />
      </div>

      {hint && !error && (
        <p id={hintId} className="text-xs text-[#64748B] dark:text-[#7B9EA8]">
          {hint}
        </p>
      )}

      {error && (
        <p
          id={errorId}
          role="alert"
          className="flex items-center gap-1.5 text-xs font-medium text-red-600 dark:text-red-400"
        >
          <span aria-hidden="true">⚠</span>
          {error}
        </p>
      )}
    </div>
  );
};
