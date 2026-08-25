export declare const IST_TIMEZONE = "Asia/Kolkata";
/**
 * Creates an ISO 8601 UTC instant string from an IST date and time string.
 * Example: dateStr="2026-08-28", timeStr="11:30 AM" -> "2026-08-28T06:00:00.000Z"
 * Example: dateStr="2026-08-28", timeStr="10:30 AM" -> "2026-08-28T05:00:00.000Z"
 * Example: dateStr="2026-08-28", timeStr="12:00 PM" -> "2026-08-28T06:30:00.000Z"
 * Example: dateStr="2026-08-29", timeStr="12:30 AM" -> "2026-08-28T19:00:00.000Z"
 */
export declare function createUtcInstantFromIst(dateStr: string, timeStr: string): string;
/**
 * Formats an ISO 8601 UTC instant or Date into 12-hour IST time (e.g., "11:30 AM").
 */
export declare function formatAppointmentTime(isoStringOrDate: string | Date | undefined | null): string;
/**
 * Formats an ISO 8601 UTC instant or Date into IST date (e.g., "2026-08-28").
 */
export declare function formatAppointmentDate(isoStringOrDate: string | Date | undefined | null): string;
