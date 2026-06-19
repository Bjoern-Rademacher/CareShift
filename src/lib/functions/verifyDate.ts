import { ISODateString } from "@/types/common";

export function createISODateString(date: string): ISODateString {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z$/.test(date)) {
    throw new Error("Invalid ISO 8601 string");
  }
  return date as ISODateString;
}
export function getMonday(date: Date): Date {
  const d = new Date(date);
  let dayOfWeek = d.getDay();

  if (dayOfWeek === 0) {
    dayOfWeek = 7;
  }

  const diff = dayOfWeek - 1;
  d.setDate(d.getDate() - diff);
  d.setHours(12, 0, 0, 0);

  return d;
}

export function formatDateOnly(date: Date): string {
  return new Intl.DateTimeFormat("de-DE").format(date);
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
