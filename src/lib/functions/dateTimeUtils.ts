import type { ISODateString, Weekday } from "@/types/common";

const MILLISECONDS_PER_DAY = 86_400_000;
const MILLISECONDS_PER_HOUR = 3_600_000;

const DATE_FORMATTER = new Intl.DateTimeFormat("de-DE", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  timeZone: "UTC",
});

const TIME_FORMATTER = new Intl.DateTimeFormat("de-DE", {
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
  timeZone: "UTC",
});

const WEEKDAY_LABELS: Record<Weekday, string> = {
  MON: "Mon",
  TUE: "Tue",
  WED: "Wed",
  THU: "Thu",
  FRI: "Fri",
  SAT: "Sat",
  SUN: "Sun",
};

type DateTimeValue = Date | string;

type TimeRange = {
  startTime: DateTimeValue;
  endTime: DateTimeValue;
};

function toDate(value: DateTimeValue): Date {
  return value instanceof Date ? value : new Date(value);
}

function getTimestamp(value: DateTimeValue): number {
  return value instanceof Date ? value.getTime() : new Date(value).getTime();
}

export function createISODateString(value: string): ISODateString {
  const isoDatePattern = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z$/;

  if (!isoDatePattern.test(value)) {
    throw new Error("Invalid ISO 8601 string.");
  }

  return value as ISODateString;
}

export function getMonday(date: Date): Date {
  const monday = new Date(date);
  const weekday = monday.getUTCDay() || 7;

  monday.setUTCDate(monday.getUTCDate() - (weekday - 1));
  monday.setUTCHours(0, 0, 0, 0);

  return monday;
}

export function formatDateOnly(date: Date): string {
  return DATE_FORMATTER.format(date);
}

export function formatTimeOnly(date: Date): string {
  return TIME_FORMATTER.format(date);
}

export function getISOWeekNumber(date: Date): number {
  const utcDate = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  );

  const weekday = utcDate.getUTCDay() || 7;

  utcDate.setUTCDate(utcDate.getUTCDate() + 4 - weekday);

  const yearStart = new Date(Date.UTC(utcDate.getUTCFullYear(), 0, 1));

  return Math.ceil(
    ((utcDate.getTime() - yearStart.getTime()) / MILLISECONDS_PER_DAY + 1) / 7,
  );
}

export function getWeekdayDate(weekStart: Date, dayOffset: number): Date {
  return new Date(
    Date.UTC(
      weekStart.getUTCFullYear(),
      weekStart.getUTCMonth(),
      weekStart.getUTCDate() + dayOffset,
      0,
      0,
      0,
      0,
    ),
  );
}

export function createShiftDateTime(day: Date, localTime: string): Date {
  const [hoursRaw, minutesRaw] = localTime.split(":");

  const hours = Number(hoursRaw);
  const minutes = Number(minutesRaw);

  if (
    !Number.isInteger(hours) ||
    !Number.isInteger(minutes) ||
    hours < 0 ||
    hours > 23 ||
    minutes < 0 ||
    minutes > 59
  ) {
    throw new Error(`Invalid local time: ${localTime}`);
  }

  return new Date(
    Date.UTC(
      day.getUTCFullYear(),
      day.getUTCMonth(),
      day.getUTCDate(),
      hours,
      minutes,
      0,
      0,
    ),
  );
}

export function getWeekday(date: Date): Weekday {
  switch (date.getUTCDay()) {
    case 1:
      return "MON";

    case 2:
      return "TUE";

    case 3:
      return "WED";

    case 4:
      return "THU";

    case 5:
      return "FRI";

    case 6:
      return "SAT";

    case 0:
      return "SUN";

    default:
      throw new Error("Invalid weekday.");
  }
}

export function formatWeekday(date: Date): string {
  return WEEKDAY_LABELS[getWeekday(date)];
}

export function formatWeekdayDate(value: DateTimeValue): string {
  const date = toDate(value);

  return `${formatWeekday(date)}, ${formatDateOnly(date)}`;
}

export function formatSchedulePeriodRange(
  startDate: Date,
  endDate: Date,
): string {
  const inclusiveEndDate = new Date(endDate);

  inclusiveEndDate.setUTCDate(inclusiveEndDate.getUTCDate() - 1);

  return `${formatDateOnly(startDate)} – ${formatDateOnly(inclusiveEndDate)}`;
}

export function getDurationHours(
  startTime: DateTimeValue,
  endTime: DateTimeValue,
): number {
  return (
    (getTimestamp(endTime) - getTimestamp(startTime)) / MILLISECONDS_PER_HOUR
  );
}

export function getTotalDurationHours(
  timeRanges: readonly TimeRange[],
): number {
  return timeRanges.reduce(
    (total, range) => total + getDurationHours(range.startTime, range.endTime),
    0,
  );
}

export function formatDurationHours(hours: number): string {
  const value = Number.isInteger(hours) ? hours.toString() : hours.toFixed(1);

  return `${value} h`;
}

export function formatDayMonth(date: Date): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    timeZone: "UTC",
  }).format(date);
}

export function formatTimeRange(startTime: Date, endTime: Date): string {
  return `${formatTimeOnly(startTime)} – ${formatTimeOnly(endTime)}`;
}

export function parseDateOnly(value: unknown): Date | null {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return null;
  }

  const date = new Date(`${value}T00:00:00.000Z`);

  if (
    Number.isNaN(date.getTime()) ||
    date.toISOString().slice(0, 10) !== value
  ) {
    return null;
  }

  return date;
}
