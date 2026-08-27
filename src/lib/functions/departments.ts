// src/lib/departments.ts

import type { Departments } from "@/types/common";

export const DEPARTMENT_LABELS: Record<Departments, string> = {
  ER: "Emergency Room",
  ICU: "Intensive Care Unit",
  SURGERY: "Surgery",
  RADIOLOGY: "Radiology",
};

export function getDepartmentLabel(department: Departments): string {
  return DEPARTMENT_LABELS[department];
}

export const DEPARTMENT_SHORT_LABELS: Record<Departments, string> = {
  ER: "ER",
  ICU: "ICU",
  SURGERY: "Surgery",
  RADIOLOGY: "Radiology",
};

export function getDepartmentShortLabel(department: Departments): string {
  return DEPARTMENT_SHORT_LABELS[department];
}
