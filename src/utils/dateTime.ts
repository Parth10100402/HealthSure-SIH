// HealthSure — Canonical DateTime & Timezone Utility (India Standard Time Asia/Kolkata)
// backend/src/utils/dateTime.ts

export const IST_TIMEZONE = 'Asia/Kolkata';

/**
 * Creates an ISO 8601 UTC instant string from an IST date and time string.
 * Example: dateStr="2026-08-28", timeStr="11:30 AM" -> "2026-08-28T06:00:00.000Z"
 * Example: dateStr="2026-08-28", timeStr="10:30 AM" -> "2026-08-28T05:00:00.000Z"
 * Example: dateStr="2026-08-28", timeStr="12:00 PM" -> "2026-08-28T06:30:00.000Z"
 * Example: dateStr="2026-08-29", timeStr="12:30 AM" -> "2026-08-28T19:00:00.000Z"
 */
export function createUtcInstantFromIst(dateStr: string, timeStr: string): string {
  if (!dateStr) return new Date().toISOString();

  const parts = dateStr.split('-').map(Number);
  const year = parts[0] || 2026;
  const month = parts[1] || 8;
  const day = parts[2] || 28;

  let hours = 9;
  let minutes = 0;

  if (timeStr) {
    const timeMatch = timeStr.trim().match(/^(\d{1,2}):(\d{2})(?:\s*([AP]M))?$/i);
    if (timeMatch) {
      hours = parseInt(timeMatch[1], 10);
      minutes = parseInt(timeMatch[2], 10);
      const meridiem = timeMatch[3] ? timeMatch[3].toUpperCase() : null;

      if (meridiem === 'PM' && hours < 12) {
        hours += 12;
      } else if (meridiem === 'AM' && hours === 12) {
        hours = 0;
      }
    }
  }

  // IST is UTC + 05:30 (330 minutes)
  const istOffsetMs = (5 * 60 + 30) * 60 * 1000;
  const utcDateMs = Date.UTC(year, month - 1, day, hours, minutes, 0, 0) - istOffsetMs;
  return new Date(utcDateMs).toISOString();
}

/**
 * Formats an ISO 8601 UTC instant or Date into 12-hour IST time (e.g., "11:30 AM").
 */
export function formatAppointmentTime(isoStringOrDate: string | Date | undefined | null): string {
  if (!isoStringOrDate) return '10:30 AM';
  
  if (typeof isoStringOrDate === 'string' && /^\d{1,2}:\d{2}\s*[AP]M$/i.test(isoStringOrDate.trim())) {
    return isoStringOrDate.trim().toUpperCase();
  }

  const date = typeof isoStringOrDate === 'string' ? new Date(isoStringOrDate) : isoStringOrDate;
  if (isNaN(date.getTime())) return String(isoStringOrDate);

  return new Intl.DateTimeFormat('en-US', {
    timeZone: IST_TIMEZONE,
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).format(date);
}

/**
 * Formats an ISO 8601 UTC instant or Date into IST date (e.g., "2026-08-28").
 */
export function formatAppointmentDate(isoStringOrDate: string | Date | undefined | null): string {
  if (!isoStringOrDate) return '2026-08-28';

  if (typeof isoStringOrDate === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(isoStringOrDate.trim())) {
    return isoStringOrDate.trim();
  }

  const date = typeof isoStringOrDate === 'string' ? new Date(isoStringOrDate) : isoStringOrDate;
  if (isNaN(date.getTime())) return String(isoStringOrDate);

  return new Intl.DateTimeFormat('en-CA', {
    timeZone: IST_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}
