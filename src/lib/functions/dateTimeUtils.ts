import { ISODateString, Weekday } from "@/types/common";

export function createISODateString(date: string): ISODateString {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z$/.test(date)) {
    throw new Error("Invalid ISO 8601 string");
  }

  return date as ISODateString;
}

export function getMonday(date: Date): Date {
  const monday = new Date(date);

  let dayOfWeek = monday.getUTCDay();

  if (dayOfWeek === 0) {
    dayOfWeek = 7;
  }

  monday.setUTCDate(monday.getUTCDate() - (dayOfWeek - 1));
  monday.setUTCHours(0, 0, 0, 0);

  return monday;
}

export function formatDateOnly(date: Date): string {
  return new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

export function formatTimeOnly(date: Date): string {
  return new Intl.DateTimeFormat("de-DE", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "UTC",
  }).format(date);
}

export function getISOWeekNumber(date: Date): number {
  const utcDate = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  );

  const weekday = utcDate.getUTCDay() || 7;

  utcDate.setUTCDate(utcDate.getUTCDate() + 4 - weekday);

  const yearStart = new Date(Date.UTC(utcDate.getUTCFullYear(), 0, 1));

  return Math.ceil(
    ((utcDate.getTime() - yearStart.getTime()) / 86_400_000 + 1) / 7,
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
  const labels: Record<Weekday, string> = {
    MON: "Mon",
    TUE: "Tue",
    WED: "Wed",
    THU: "Thu",
    FRI: "Fri",
    SAT: "Sat",
    SUN: "Sun",
  };

  return labels[getWeekday(date)];
}
