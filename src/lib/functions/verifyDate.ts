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
