export type ISODateString = string & { __brand: "ISODate" };

export function createISODateString(date: string): ISODateString {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z$/.test(date)) {
    throw new Error("Invalid ISO 8601 string");
  }
  return date as ISODateString;
}
