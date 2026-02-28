/**
 * Date utilities — all comparisons use LOCAL calendar date so they are
 * timezone-safe regardless of where the user's browser runs.
 *
 * Why NOT toISOString().split("T")[0]:
 *   toISOString() returns a UTC timestamp.  In UTC+2 at 00:30 local time,
 *   UTC is still the previous day → split("T")[0] returns yesterday, which
 *   would allow users to pick "today" and have it rejected as a past date.
 */

/**
 * Returns today's date as a YYYY-MM-DD string using the browser's local
 * calendar (getFullYear / getMonth / getDate — all local time).
 */
export function getTodayString(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/**
 * Returns true when dateStr (YYYY-MM-DD) is strictly before today.
 * String comparison is safe here because ISO date strings sort lexicographically.
 */
export function isPastDate(dateStr: string): boolean {
  return dateStr < getTodayString();
}

/**
 * Returns true when dateStr is today or in the future.
 * Use this as the positive guard before saving a due_date.
 */
export function isTodayOrFuture(dateStr: string): boolean {
  return dateStr >= getTodayString();
}
