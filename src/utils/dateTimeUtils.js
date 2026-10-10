/**
 * Utility functions for reliable Indian Standard Time (IST, Asia/Kolkata)
 * date and time parsing, formatting, validation, and HTML5 input conversion.
 */

/**
 * Convert any time string (e.g., '10:00 AM', '14:30', '09:15', '2:00 PM') to total minutes from midnight.
 * Returns -1 if invalid or unparseable.
 */
export function timeToMinutes(timeStr) {
  if (!timeStr || typeof timeStr !== 'string') return -1;
  const clean = timeStr.trim().toUpperCase();

  // Handle 12-hour format e.g. "10:30 AM", "02:15 PM", "12:00 PM"
  const twelveHourMatch = clean.match(/^(\d{1,2}):(\d{2})(?:\s*([AP]M))?$/);
  if (twelveHourMatch) {
    let hours = parseInt(twelveHourMatch[1], 10);
    const minutes = parseInt(twelveHourMatch[2], 10);
    const period = twelveHourMatch[3];

    if (period) {
      if (period === 'PM' && hours < 12) hours += 12;
      if (period === 'AM' && hours === 12) hours = 0;
    }
    return hours * 60 + minutes;
  }

  return -1;
}

/**
 * Validate that endTime is chronologically after startTime on the same day.
 */
export function isEndTimeAfterStartTime(startTime, endTime) {
  const startMins = timeToMinutes(startTime);
  const endMins = timeToMinutes(endTime);

  if (startMins === -1 || endMins === -1) return true; // Can't validate unparseable strings
  return endMins > startMins;
}

/**
 * Format time consistently in 12-hour format: 'HH:MM AM/PM'
 */
export function formatTimeIST(timeStr) {
  if (!timeStr || typeof timeStr !== 'string') return '';
  const clean = timeStr.trim();
  const mins = timeToMinutes(clean);
  if (mins === -1) return clean; // Return original if custom string

  const hours24 = Math.floor(mins / 60);
  const minutes = mins % 60;
  const period = hours24 >= 12 ? 'PM' : 'AM';
  const hours12 = hours24 % 12 === 0 ? 12 : hours24 % 12;

  return `${String(hours12).padStart(2, '0')}:${String(minutes).padStart(2, '0')} ${period}`;
}

/**
 * Format a start and end time range consistently: '10:00 AM – 11:30 AM'
 */
export function formatTimeRange(startStr, endStr) {
  const formattedStart = formatTimeIST(startStr);
  const formattedEnd = formatTimeIST(endStr);

  if (formattedStart && formattedEnd) {
    return `${formattedStart} – ${formattedEnd}`;
  }
  return formattedStart || formattedEnd || 'TO BE ANNOUNCED';
}

/**
 * Convert 12-hour or arbitrary time string to 'HH:MM' 24-hour string for <input type="time" />
 */
export function to24HourInput(timeStr) {
  if (!timeStr) return '';
  const mins = timeToMinutes(timeStr);
  if (mins === -1) return '';

  const hours = Math.floor(mins / 60);
  const minutes = mins % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

/**
 * Convert HTML5 <input type="time" /> 'HH:MM' string to 'HH:MM AM/PM'
 */
export function from24HourInput(time24) {
  if (!time24) return '';
  const [h, m] = time24.split(':').map((v) => parseInt(v, 10));
  if (isNaN(h) || isNaN(m)) return time24;

  const period = h >= 12 ? 'PM' : 'AM';
  const hours12 = h % 12 === 0 ? 12 : h % 12;
  return `${String(hours12).padStart(2, '0')}:${String(m).padStart(2, '0')} ${period}`;
}

/**
 * Format an ISO date or 'YYYY-MM-DD' cleanly for IST display: e.g. 'OCTOBER 24, 2026'
 */
export function formatDateIST(dateStr) {
  if (!dateStr) return '';
  // Avoid accidental UTC shifts by splitting the YYYY-MM-DD directly
  const match = String(dateStr).match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (match) {
    const year = parseInt(match[1], 10);
    const month = parseInt(match[2], 10) - 1;
    const day = parseInt(match[3], 10);
    const d = new Date(year, month, day);
    return d.toLocaleDateString('en-IN', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).toUpperCase();
  }
  return String(dateStr).toUpperCase();
}
