import { DateTime } from "luxon";
import { formatDate, getStartOfDay } from "./date";

export type OpeningHoursRange = {
  from: string;
  to: string;
};

type OpeningHoursDays = {
  [key: string]: OpeningHoursRange[];
};

type OpeningHoursExcept = {
  dates: string[];
};

export type OpeningHours = {
  days: OpeningHoursDays;
  except: OpeningHoursExcept;
};

/**
 * Week days in the order they are displayed, starting on Monday
 */
export const WeekDays = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
] as const;

export type WeekDay = (typeof WeekDays)[number];

/**
 * Time ranges per week day, as stored in `OpeningHours.days`. Only open days
 * have a key, a day without key is closed.
 */
export type WeeklySchedule = Partial<Record<WeekDay, OpeningHoursRange[]>>;

export const Days = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
];

/**
 * If a given date is in the days of the registered opening hours
 */
export function isInOpeningHoursDay(
  _openingHours: OpeningHours | OpeningHoursDays,
  date: Date
): boolean {
  const openDays = _openingHours.days
    ? Object.keys(_openingHours.days)
    : Object.keys(_openingHours);
  return openDays.includes(Days[date.getDay()]);
}

/**
 * Converts an opening hours data object into a readable string
 */
export function openingHoursToString(
  _openingHours: OpeningHours | OpeningHoursDays,
  locale: string
) {
  const openingHours = _openingHours.days
    ? (_openingHours as OpeningHours)
    : ({ days: _openingHours } as OpeningHours);
  const { t } = useI18n();

  // Opening hours
  const days = Object.keys(openingHours.days).map(
    (day) =>
      `${t(`week_days.${day}`)}, ${openingHours.days[day]
        .map((range) => `${range.from} - ${range.to} ${t("hour")}`)
        .join(" & ")}`
  );

  // Upcoming exceptions
  const nextWeek = DateTime.now().plus({ days: 30 }).toJSDate();
  const closed = (openingHours?.except?.dates || [])
    .filter(
      (d) =>
        new Date(d) >= getStartOfDay() &&
        new Date(d) < nextWeek &&
        isInOpeningHoursDay(_openingHours, new Date(d))
    )
    .map((d) => formatDate(d, "dd, DD.MM", locale));

  return `${days.join("<br />")}${
    closed.length > 0 ? `<br/>${t("closed_at")}: ${closed.join(", ")}` : ""
  }`;
}

/**
 * If a location is open on a given date (YYYY-MM-DD), taking closed dates into
 * account. Without opening hours a location is considered to be always open.
 */
export function isOpenOnDate(
  openingHours: OpeningHours | null | undefined,
  date: string
): boolean {
  if (!openingHours?.days) {
    return true;
  }
  if (openingHours.except?.dates?.includes(date)) {
    return false;
  }
  const day = Days[new Date(`${date}T00:00:00Z`).getUTCDay()]!;
  return (openingHours.days[day]?.length || 0) > 0;
}
