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
