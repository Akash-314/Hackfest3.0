/**
 * HackFest 3.0 Event Time & Deadline Utilities
 * Event Host: Student Developer Club, REC Banda
 * Canonical Event Timezone: Indian Standard Time (IST / Asia/Kolkata, UTC+05:30)
 */

export const EVENT_TIMEZONE = 'Asia/Kolkata';
export const EVENT_TIMEZONE_OFFSET = '+05:30';

/**
 * Safely parse an event deadline string into a JavaScript Date object.
 * If no timezone is specified in the string, Indian Standard Time (+05:30) is applied.
 * Returns null if the string is empty, invalid, or a descriptive placeholder like "CLOSING SOON".
 */
export function parseEventDeadline(deadlineStr) {
  if (!deadlineStr || typeof deadlineStr !== 'string') return null;

  const trimmed = deadlineStr.trim();
  if (!trimmed) return null;

  // If it's a non-date descriptive status string, return null
  if (/^(closing soon|tba|tbd|to be announced|soon|open|closed)/i.test(trimmed)) {
    return null;
  }

  // 1. Check if string already contains timezone info (Z, GMT, UTC, or +/-offset)
  const hasTimezone = /(Z|[+-]\d{2}:?\d{2}|UTC|GMT|IST)$/i.test(trimmed);

  let dateToParse = trimmed;
  if (!hasTimezone) {
    // If it has a time like "12:00 PM" or "23:59", append IST offset +05:30
    if (/\d{1,2}:\d{2}/.test(trimmed)) {
      dateToParse = `${trimmed} GMT+0530`;
    } else {
      // If date only like "October 20, 2026", set to end of that day in IST: 23:59:59 GMT+0530
      dateToParse = `${trimmed} 23:59:59 GMT+0530`;
    }
  }

  const timestamp = Date.parse(dateToParse);
  if (isNaN(timestamp)) {
    // Fallback: try raw Date.parse
    const rawTimestamp = Date.parse(trimmed);
    if (isNaN(rawTimestamp)) return null;
    return new Date(rawTimestamp);
  }

  return new Date(timestamp);
}

/**
 * Check whether a deadline has strictly passed relative to current time.
 * Returns false if deadline is invalid, null, or descriptive.
 */
export function isDeadlineExpired(deadlineStr) {
  const deadlineDate = parseEventDeadline(deadlineStr);
  if (!deadlineDate) return false;
  return Date.now() > deadlineDate.getTime();
}

/**
 * Formats a Date or timestamp string in the official event timezone (IST).
 */
export function formatEventDateTime(dateInput) {
  if (!dateInput) return '';
  const date = typeof dateInput === 'string' ? parseEventDeadline(dateInput) : dateInput;
  if (!date || isNaN(date.getTime())) return String(dateInput);

  return new Intl.DateTimeFormat('en-IN', {
    timeZone: EVENT_TIMEZONE,
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(date);
}
