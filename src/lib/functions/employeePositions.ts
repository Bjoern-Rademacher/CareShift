import type { EmployeePosition } from "@/types/common";

export const POSITION_LABELS: Record<EmployeePosition, string> = {
  DOCTOR: "Doctor",
  HEAD_DOCTOR: "Head doctor",
  SURGEON: "Surgeon",
  NURSE: "Nurse",
  INTERN: "Intern",
  MEDICAL_ASSISTANT: "Medical assistant",
};

export function getPositionLabel(position: EmployeePosition): string {
  return POSITION_LABELS[position];
}
