/**
 * Format a time string to 00:00.000 format (mm:ss.xxx).
 * Accepts: "42.350", "0:42.350", "20444", "0020444", "712500", etc.
 * Pure digits are split as: [remaining=min][2 digits=sec][3 digits=ms]
 */
export function formatTime(input: string): string {
  if (!input || input === '--') return '';

  // Remove everything except digits, colons, and dots
  const cleaned = input.replace(/[^\d:.]/g, '');
  if (!cleaned) return '';

  // Already in m:ss.xxx or mm:ss.xxx format
  if (/^\d{1,2}:\d{2}\.\d{1,3}$/.test(cleaned)) {
    const [minSec, ms] = cleaned.split('.');
    const [min, sec] = minSec.split(':');
    return `${min.padStart(2, '0')}:${sec}.${ms.padEnd(3, '0')}`;
  }

  // ss.xxx format (no minutes)
  if (/^\d{1,2}\.\d{1,3}$/.test(cleaned)) {
    const [sec, ms] = cleaned.split('.');
    return `00:${sec.padStart(2, '0')}.${ms.padEnd(3, '0')}`;
  }

  // Pure digits — max 7 digits (mmssmmm), split from the right
  if (/^\d+$/.test(cleaned)) {
    const trimmed = cleaned.slice(-7).padStart(5, '0');
    const ms = trimmed.slice(-3);
    const sec = trimmed.slice(-5, -3);
    const min = trimmed.slice(0, -5) || '0';
    return `${min.padStart(2, '0')}:${sec}.${ms}`;
  }

  return cleaned;
}

/**
 * Validate a time string (should be 00:00.000 or empty)
 */
export function isValidTime(time: string): boolean {
  if (!time) return true;
  return /^\d{2}:\d{2}\.\d{3}$/.test(time);
}

/**
 * Format gap string. Accepts "+5.700", "5.700", "--", etc.
 */
export function formatGap(input: string): string {
  if (!input || input === '--' || input === '-') return '--';

  const cleaned = input.replace(/[^\d.+\-]/g, '');
  if (!cleaned || cleaned === '+' || cleaned === '-') return '--';

  if (cleaned.startsWith('+')) return cleaned;
  if (/^\d/.test(cleaned)) return `+${cleaned}`;

  return cleaned;
}

/**
 * Parse a time string to milliseconds for comparison
 */
export function timeToMs(time: string): number {
  if (!time) return 0;
  const match = time.match(/^(\d{1,2}):(\d{2})\.(\d{3})$/);
  if (!match) return 0;
  return parseInt(match[1]) * 60000 + parseInt(match[2]) * 1000 + parseInt(match[3]);
}
