export type ISODateString = string & { __brand: "ISODate" };

export type UUID = string;

export type AccessPermission =
  | "ADMIN"
  | "USER"
  | "DISPLAY_STAFF"
  | "DISPLAY_PUBLIC";
//defining permission levels

export type Departments = "ER" | "ICU" | "SURGERY" | "RADIOLOGY";
//defining possible departments

export type EmployeePosition =
  | "DOCTOR"
  | "HEAD_DOCTOR"
  | "SURGEON"
  | "NURSE"
  | "INTERN"
  | "MEDICAL_ASSISTANT";

export type Weekday = "MON" | "TUE" | "WED" | "THU" | "FRI" | "SAT" | "SUN";

export type LocalTimeString = `${number}${number}:${number}${number}`;
