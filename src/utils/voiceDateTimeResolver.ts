/**
 * Voice Date & Time Resolver for HealthSure Voice Agent
 * Handles Hindi, Hinglish, and English relative, absolute, and colloquial date/time expressions.
 */

export interface ResolvedDateTime {
  dateStr?: string; // YYYY-MM-DD
  timeStr?: string; // HH:mm AM/PM (e.g. '11:00 AM')
  time24?: string;  // HH:mm (e.g. '11:00')
  dayOfWeek?: string; // 'Wednesday', etc.
  rawMatch?: string;
  isContextualSame?: boolean;
}

const WEEKDAYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
const HINDI_WEEKDAYS: { [key: string]: number } = {
  'ravivar': 0, 'raviwar': 0, 'etwar': 0, 'itwar': 0, 'aitwar': 0, 'sunday': 0, 'sun': 0, 'रविवार': 0, 'इतवार': 0,
  'somvar': 1, 'somvaar': 1, 'somwar': 1, 'somwaar': 1, 'monday': 1, 'mon': 1, 'सोमवार': 1,
  'mangalvar': 2, 'mangalvaar': 2, 'mangalwar': 2, 'mangalwaar': 2, 'tuesday': 2, 'tue': 2, 'मंगलवार': 2,
  'budhvar': 3, 'budhvaar': 3, 'budhwar': 3, 'budhwaar': 3, 'wednesday': 3, 'wed': 3, 'बुधवार': 3,
  'guruvar': 4, 'guruvaar': 4, 'guruwar': 4, 'guruwaar': 4, 'veervar': 4, 'veerwar': 4, 'brihaspativar': 4, 'thursday': 4, 'thu': 4, 'गुरुवार': 4, 'वीरवार': 4,
  'shukravar': 5, 'shukravaar': 5, 'shukrawar': 5, 'shukrawaar': 5, 'shukrwar': 5, 'shukrvaar': 5, 'friday': 5, 'fri': 5, 'शुक्रवार': 5,
  'shanivar': 6, 'shanivaar': 6, 'shaniwar': 6, 'shaniwaar': 6, 'saturday': 6, 'sat': 6, 'शनिवार': 6,
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

export function resolveVoiceDate(
  text: string,
  baseDate: Date = getReferenceDate()
): { dateStr: string; display: string; isContextualSame?: boolean } | null {
  const lower = text.toLowerCase().trim();

  // 0. Contextual reference to same date
  if (/\b(us din|wahi din|same date|same day|us tareekh|wahi date)\b/i.test(lower)) {
    return { dateStr: '', display: 'Same date', isContextualSame: true };
  }

  // 1. 'aaj' / 'today' / 'आज'
  if (/\b(aaj|today)\b|आज/i.test(lower)) {
    return { dateStr: formatDateYYYYMMDD(baseDate), display: 'Today' };
  }

  // 2. 'kal' / 'tomorrow' / 'कल'
  if (/\b(kal|tomorrow)\b|कल/i.test(lower) && !/\b(kal wala)\b/i.test(lower)) {
    const d = new Date(baseDate);
    d.setDate(d.getDate() + 1);
    return { dateStr: formatDateYYYYMMDD(d), display: 'Tomorrow' };
  }

  // 3. 'parso' / 'day after tomorrow' / 'परसों'
  if (/\b(parso|parson|day after tomorrow)\b|परसों/i.test(lower)) {
    const d = new Date(baseDate);
    d.setDate(d.getDate() + 2);
    return { dateStr: formatDateYYYYMMDD(d), display: 'Day after tomorrow' };
  }

  // 4. Weekend / is weekend
  if (/\b(weekend|is weekend|this weekend)\b/i.test(lower)) {
    const currentDay = baseDate.getDay();
    const diff = (6 - currentDay + 7) % 7 || 7;
    const d = new Date(baseDate);
    d.setDate(d.getDate() + diff);
    return { dateStr: formatDateYYYYMMDD(d), display: 'Saturday (Weekend)' };
  }

  // 5. 'next week' / 'agle hafte'
  if (/\b(next week|agle hafte|agle saptah)\b/i.test(lower) && !Object.keys(HINDI_WEEKDAYS).some(w => lower.includes(w))) {
    const d = new Date(baseDate);
    d.setDate(d.getDate() + 7);
    return { dateStr: formatDateYYYYMMDD(d), display: 'Next Week' };
  }

  // 6. Weekdays with 'next' / 'agla' modifier or standard weekday
  const isNextModifier = /\b(next|agla|agle|aage wala|coming)\b/i.test(lower);

  for (const [key, targetDayIndex] of Object.entries(HINDI_WEEKDAYS)) {
    const regex = new RegExp('(?:^|\\s|\\b)' + key + '(?:\\b|\\s|$)', 'i');
    if (regex.test(lower)) {
      const currentDayIndex = baseDate.getDay();
      let diff = targetDayIndex - currentDayIndex;
      if (diff <= 0) {
        diff += 7;
      }
      // If user explicitly specified "next Wednesday" vs today being Tuesday, add 7 more days
      if (isNextModifier) {
        diff += 7;
      }

      const d = new Date(baseDate);
      d.setDate(d.getDate() + diff);
      const dayName = WEEKDAYS[targetDayIndex];
      const capitalizedDay = dayName.charAt(0).toUpperCase() + dayName.slice(1);
      return {
        dateStr: formatDateYYYYMMDD(d),
        display: isNextModifier ? `Next ${capitalizedDay}` : capitalizedDay,
      };
    }
  }

  // 7. Explicit date format YYYY-MM-DD
  const isoMatch = lower.match(/\b(\d{4})-(\d{2})-(\d{2})\b/);
  if (isoMatch) {
    return { dateStr: isoMatch[0], display: isoMatch[0] };
  }

  // 8. Explicit DD/MM/YYYY or DD-MM-YYYY
  const dmyMatch = lower.match(/\b(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})\b/);
  if (dmyMatch) {
    const day = String(dmyMatch[1]).padStart(2, '0');
    const month = String(dmyMatch[2]).padStart(2, '0');
    const year = dmyMatch[3];
    return { dateStr: `${year}-${month}-${day}`, display: `${year}-${month}-${day}` };
  }

  // 9. Day number with month name e.g. "16 September", "16th Sep"
  const monthNames: { [k: string]: number } = {
    jan: 1, january: 1, feb: 2, february: 2, mar: 3, march: 3,
    apr: 4, april: 4, may: 5, jun: 6, june: 6, jul: 7, july: 7,
    aug: 8, august: 8, sep: 9, sept: 9, september: 9, oct: 10, october: 10,
    nov: 11, november: 11, dec: 12, december: 12
  };
  const textDateMatch = lower.match(/\b(\d{1,2})(?:st|nd|rd|th)?\s+(jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:t(?:ember)?)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\b/i);
  if (textDateMatch) {
    const day = String(parseInt(textDateMatch[1], 10)).padStart(2, '0');
    const mStr = textDateMatch[2].toLowerCase();
    const mKey = Object.keys(monthNames).find(k => mStr.startsWith(k)) || 'sep';
    const month = String(monthNames[mKey] || 9).padStart(2, '0');
    return { dateStr: `2026-${month}-${day}`, display: `${day} ${textDateMatch[2]}` };
  }

  return null;
}

export function resolveVoiceTime(
  text: string
): { timeStr: string; time24: string; isContextualSame?: boolean; isPeriodOnly?: boolean; period?: 'morning' | 'afternoon' | 'evening' } | null {
  const lower = text.toLowerCase().trim();

  // 0. Contextual same time
  if (/\b(same time|wahi time|us samay|us waqt)\b/i.test(lower)) {
    return { timeStr: '', time24: '', isContextualSame: true };
  }

  // 1. Period only requests: morning, afternoon, evening
  const isPeriodOnly = !/\b\d{1,2}\b|\b(gyarah|barah|das|nau|aath|saat|che|panch|chaar|teen|do|ek)\b/i.test(lower);
  if (isPeriodOnly) {
    if (/\b(subah|morning)\b/i.test(lower)) {
      return { timeStr: '10:00 AM', time24: '10:00', isPeriodOnly: true, period: 'morning' };
    }
    if (/\b(dopahar|afternoon)\b/i.test(lower)) {
      return { timeStr: '02:00 PM', time24: '14:00', isPeriodOnly: true, period: 'afternoon' };
    }
    if (/\b(shaam|sham|evening|raat|night)\b/i.test(lower)) {
      return { timeStr: '05:00 PM', time24: '17:00', isPeriodOnly: true, period: 'evening' };
    }
  }

  // 2. Colloquial Hindi times
  // "saadhe gyarah" -> 11:30 AM
  // "saadhe das" -> 10:30 AM
  // "saadhe baarah" -> 12:30 PM
  // "derh baje" -> 1:30 PM
  // "dhai baje" -> 2:30 PM
  if (/\b(saade|saadhe)\s+(gyarah|gyara)\b/i.test(lower)) {
    return { timeStr: '11:30 AM', time24: '11:30' };
  }
  if (/\b(saade|saadhe)\s+(das|dus)\b/i.test(lower)) {
    return { timeStr: '10:30 AM', time24: '10:30' };
  }
  if (/\b(saade|saadhe)\s+(barah|baarah)\b/i.test(lower)) {
    return { timeStr: '12:30 PM', time24: '12:30' };
  }
  if (/\b(derh|dedh)\s*(?:baje)?\b/i.test(lower)) {
    return { timeStr: '01:30 PM', time24: '13:30' };
  }
  if (/\b(dhai|dhaai)\s*(?:baje)?\b/i.test(lower)) {
    return { timeStr: '02:30 PM', time24: '14:30' };
  }

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

  // 3. Digit match with optional minutes and suffix
  // e.g. "11 baje", "11:00 am", "11:30", "12 ke aas paas", "11 baje wala"
  const digitMatch = lower.match(/\b(\d{1,2})(?::(\d{2}))?\s*(?:baje|am|pm|o'clock|ke aas paas|wala)?\b/i);
  if (digitMatch && (digitMatch[2] || lower.includes('baje') || lower.includes('am') || lower.includes('pm') || lower.includes('aas paas') || lower.includes('slot'))) {
    const h = parseInt(digitMatch[1], 10);
    const m = digitMatch[2] ? parseInt(digitMatch[2], 10) : 0;
    const modifier = lower.includes('pm') ? 'pm' : lower.includes('am') ? 'am' : undefined;

    if (modifier === 'pm' || (h < 12 && isPM && h <= 8)) {
      hours = (h === 12) ? 12 : h + 12;
    } else if (modifier === 'am') {
      hours = (h === 12) ? 0 : h;
    } else if (h === 12) {
      // 12 o'clock in medical clinic appointments defaults to 12:00 PM noon unless explicitly marked night
      hours = (lower.includes('raat') || lower.includes('midnight')) ? 0 : 12;
    } else if (h >= 1 && h <= 7) {
      // In OPD scheduling, 1 to 7 without explicit 'am' or 'subah' defaults to PM (1:00 PM to 7:00 PM)
      hours = h + 12;
    } else {
      hours = (h >= 1 && h <= 6 && isPM) ? h + 12 : h;
    }
    minutes = m;
  } else {
    // 4. Hindi word e.g. "gyarah baje", "das baje"
    for (const [w, val] of Object.entries(hindiNumberWords)) {
      const wRegex = new RegExp('(?:^|\\s|\\b)' + w + '\\s*(?:baje|ke aas paas)?(?:\\b|\\s|$)', 'i');
      if (wRegex.test(lower)) {
        if (val >= 1 && val <= 7 && !lower.includes('subah') && !lower.includes('am')) {
          hours = val + 12;
        } else if (isPM && val < 12 && val <= 8) {
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
    const h12Str = String(h12).padStart(2, '0');
    return {
      timeStr: `${h12Str}:${minStr} ${ampm}`,
      time24: `${String(hours).padStart(2, '0')}:${minStr}`,
    };
  }

  return null;
}
