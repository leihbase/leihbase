import { DateTime, type DateTimeFormatOptions } from "luxon";

const Days = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
];

const FORMATS = {
  "DD MMM YYYY": DateTime.DATE_MED,
  "ddd, DD.MM": { weekday: "long", month: "2-digit", day: "2-digit" },
  "dd, DD.MM": { weekday: "short", month: "2-digit", day: "2-digit" },
  "DD.MM.YYYY": { year: "numeric", month: "2-digit", day: "2-digit" },
  "dd, D MMM YYYY": {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  },
} satisfies Record<string, DateTimeFormatOptions>;

/**
 * Formats the calendar date of a date. Dates are stored as UTC midnight (and
 * "YYYY-MM-DD" strings are parsed as such), so the UTC date is used, otherwise
 * the previous day would be shown in time zones behind UTC.
 */
export function formatDate(
  date: string | Date,
  format: keyof typeof FORMATS,
  locale: string
) {
  return DateTime.fromJSDate(new Date(date), { zone: "utc" })
    .setLocale(locale)
    .toLocaleString(FORMATS[format]);
}

export function isDateOnDays(date: Date, days: string[]) {
  return days.includes(Days[date.getDay()]!);
}

export function isToday(date: Date): boolean {
  return getStartOfDay().getTime() == startOfDate(date).getTime();
}

export function isSameDate(date1: Date, date2: Date): boolean {
  return startOfDate(date1).getTime() == startOfDate(date2).getTime();
}

export function getStartOfDay() {
  var startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  return startOfDay;
}

export function startOfDate(date: Date): Date {
  const d = new Date(date.getTime());
  d.setHours(0, 0, 0, 0);
  return d;
}

export function startOfUTCDate(date: Date): Date {
  const d = new Date(date.getTime());
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

export function endOfDate(date: Date): Date {
  const d = new Date(date.getTime());
  d.setHours(23, 59, 59, 999);
  return d;
}

export function endOfUTCDate(date: Date): Date {
  const d = new Date(date.getTime());
  d.setUTCHours(23, 59, 59, 999);
  return d;
}

export function toShortISO(date: Date): string {
  return date.toISOString().split("T")[0]!;
}

export function subtractDays(date: Date, days: number) {
  var d = new Date(date);
  return new Date(d.setDate(d.getDate() - days));
}

export function addDays(date: Date, days: number) {
  var d = new Date(date);
  return new Date(d.setDate(d.getDate() + days));
}
