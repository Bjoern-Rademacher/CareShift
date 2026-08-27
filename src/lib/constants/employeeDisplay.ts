import {
  ClipboardPlus,
  GraduationCap,
  HeartPulse,
  Scissors,
  ShieldCheck,
  Stethoscope,
} from "lucide-react";

import type { LucideIcon } from "lucide-react";
import type { EmployeePosition } from "@/types/common";

type EmployeeName = {
  firstName: string;
  lastName: string;
};

export const EMPLOYEE_POSITION_ICONS = {
  DOCTOR: Stethoscope,
  HEAD_DOCTOR: ShieldCheck,
  SURGEON: Scissors,
  NURSE: HeartPulse,
  INTERN: GraduationCap,
  MEDICAL_ASSISTANT: ClipboardPlus,
} satisfies Record<EmployeePosition, LucideIcon>;

export function getEmployeeFullName(employee: EmployeeName): string {
  return `${employee.firstName} ${employee.lastName}`.trim();
}

export function getEmployeeInitials(employee: EmployeeName): string {
  return `${employee.firstName.charAt(0)}${employee.lastName.charAt(
    0,
  )}`.toUpperCase();
}

export function getPositionLabel(position: EmployeePosition): string {
  return position
    .toLowerCase()
    .replaceAll("_", " ")
    .replace(/^\w/, (letter) => letter.toUpperCase());
}
