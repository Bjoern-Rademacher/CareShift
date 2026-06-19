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
