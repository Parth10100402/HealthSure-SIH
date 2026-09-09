/**
 * Voice Date & Time Resolver for HealthSure Voice Agent
 * Handles Hindi, Hinglish, and English relative and absolute date/time expressions.
 */

export interface ResolvedDateTime {
  dateStr?: string; // YYYY-MM-DD
  timeStr?: string; // HH:mm AM/PM (e.g. '11:00 AM')
  time24?: string;  // HH:mm (e.g. '11:00')
  dayOfWeek?: string; // 'Wednesday', etc.
  rawMatch?: string;
}

const WEEKDAYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
const HINDI_WEEKDAYS: { [key: string]: number } = {
  'ravivar': 0, 'etwar': 0, 'itwar': 0, 'sunday': 0,
  'somvar': 1, 'somvaar': 1, 'monday': 1,
  'mangalvar': 2, 'mangalvaar': 2, 'tuesday': 2,
  'budhvar': 3, 'budhvaar': 3, 'budhwar': 3, 'budhwaar': 3, 'wednesday': 3, 'wed': 3,
  'guruvar': 4, 'guruvaar': 4, 'veervar': 4, 'brihaspativar': 4, 'thursday': 4, 'thu': 4,
  'shukravar': 5, 'shukravaar': 5, 'friday': 5, 'fri': 5,
  'shanivar': 6, 'shanivaar': 6, 'saturday': 6, 'sat': 6,
};

export function getReferenceDate(): Date {
  const now = new Date();
  if (now.getFullYear() === 2026) return now;
  return new Date(2026, 8, 1, 9, 0, 0); // Sep 1, 2026 (Tuesday)
}

export function formatDateYYYYMMDD(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function resolveVoiceDate(text: string, baseDate: Date = getReferenceDate()): { dateStr: string; display: string } | null {
  const lower = text.toLowerCase().trim();

  // 1. 'aaj' / 'today'
  if (/\b(aaj|today)\b/i.test(lower)) {
    return { dateStr: formatDateYYYYMMDD(baseDate), display: 'Today' };
  }

  // 2. 'kal' / 'tomorrow'
  if (/\b(kal|tomorrow)\b/i.test(lower)) {
    const d = new Date(baseDate);
    d.setDate(d.getDate() + 1);
    return { dateStr: formatDateYYYYMMDD(d), display: 'Tomorrow' };
  }


  // 3. 'parso' / 'day after tomorrow'
  if (/\b(parso|parson|day after tomorrow)\b/i.test(lower)) {
    const d = new Date(baseDate);
    d.setDate(d.getDate() + 2);
    return { dateStr: formatDateYYYYMMDD(d), display: 'Day after tomorrow' };
  }

  // 4. Weekdays (Wednesday, budhwar, etc.)
  for (const [key, targetDayIndex] of Object.entries(HINDI_WEEKDAYS)) {
    const regex = new RegExp('\\b' + key + '\\b', 'i');
    if (regex.test(lower)) {
      const currentDayIndex = baseDate.getDay();
      let diff = targetDayIndex - currentDayIndex;
      if (diff <= 0) {
        diff += 7;
      }
      const d = new Date(baseDate);
      d.setDate(d.getDate() + diff);
      const dayName = WEEKDAYS[targetDayIndex];
      const capitalizedDay = dayName.charAt(0).toUpperCase() + dayName.slice(1);
      return {
        dateStr: formatDateYYYYMMDD(d),
        display: capitalizedDay
      };
    }
  }

  // 5. Explicit date format YYYY-MM-DD;
  const isoMatch = lower.match(/\b(\d{4})-(\d{2})-(\d{2})\b/);
  if (isoMatch) {
    return { dateStr: isoMatch[0], display: isoMatch[0] };
  }

  // 6. Explicit DD/MM/YYYY or DD-MM-YYYY
  const dmyMatch = lower.match(/\b(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})\b/);
  if (dmyMatch) {
    const day = String(dmyMatch[1]).padStart(2, '0');
    const month = String(dmyMatch[2]).padStart(2, '0');
    const year = dmyMatch[3];
    return { dateStr: `${year}-${month}-${day}`, display: `${year}-${month}-${day}` };
  }

  return null;
}

export function resolveVoiceTime(text: string): { timeStr: string; time24: string } | null {
  const lower = text.toLowerCase().trim();

  const hindiNumberWords: { [key: string]: number } = {
    'ek': 1, 'do': 2, 'teen': 3, 'chaar': 4, 'char': 4, 'paanch': 5, 'panch': 5,
    'che': 6, 'chhah': 6, 'saat': 7, 'sat': 7, 'aath': 8, 'ath': 8, 'nau': 9,
    'das': 10, 'gyarah': 11, 'gyara': 11, 'barah': 12, 'bara': 12
  };

  let hours = -1;
  let minutes = 0;
  let isPM = false;

  if (/\b(shaam|sham|dopahar|raat|evening|night|afternoon|pm)\b/i.test(lower)) {
    isPM = true;
  }
  if (/\b(subah|morning|am)\b/i.test(lower)) {
    isPM = false;
  }

  // Check digits e.g. '11 baje', '11:30', '10 am'
  const digitMatch = lower.match(/\b(\d{1,2})(s?:(\d{2}))?\s+(am|pm|baje)?\b/i);
  if (digitMatch && (digitMatch[3] || lower.includes('baje') || digitMatch[2])) {
    const h = parseInt(digitMatch[1], 10);
    const m = digitMatch[2] ? parseInt(digitMatch[2], 10) : 0;
    const modifier = digitMatch[3]?.toLowerCase();

    if (modifier === 'pm' || (h < 12 && isPM && h <= 8)) {
      hours = (h === 12) ? 12 : h + 12;
    } else if (modifier === 'am' || (!isPM && h <= 12)) {
      hours = (h === 12) ? 0 : h;
    } else {
      hours = h;
    }
    minutes = m;
  } else {
    for (const [w, val] of Object.entries(hindiNumberWords)) {
      const wRegex = new RegExp('\\b' + w + '\\s*(?:baje)?\\b', 'i');
      if (wRegex.test(lower)) {
        if (isPM && val < 12 && val <= 8) {
          hours = val + 12;
        } else {
          hours = val;
        }
        break;
      }
    }
  }

  if (hours !== -1 && hours >= 0 && hours < 24) {
    const h12 = hours % 12 === 0 ? 12 : hours % 12;
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const minStr = String(minutes).padStart(2, '0');
    return {
      timeStr: `${h12}:${minStr} ${ampm}`,
      time24: `${String(hours).padStart(2, '0')}:${minStr}`
    };
  }

  return null;
}
