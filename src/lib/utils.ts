// HealthSure Frontend — Utility Library
// src/lib/utils.ts

/**
 * Merge class names (lightweight clsx replacement).
 * For more complex cases, install and use `clsx` + `tailwind-merge`.
 */
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

/**
 * Format a date string to a readable locale format.
 */
export function formatDate(dateStr: string, locale = 'en-IN'): string {
  try {
    return new Date(dateStr).toLocaleDateString(locale, {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

/**
 * Format a phone number to a readable format (Indian standard).
 */
export function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 10) {
    return `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`;
  }
  return phone;
}

/**
 * Delay utility for mock async operations.
 */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Truncate text to a maximum length.
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + '...';
}

/**
 * Check if a string is a valid Indian mobile number.
 */
export function isValidIndianMobile(mobile: string): boolean {
  const digits = mobile.replace(/\D/g, '');
  return /^[6-9]\d{9}$/.test(digits);
}

/**
 * Check if a string is a valid email address.
 */
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
