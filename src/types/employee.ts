import {
  UUID,
  Departments,
  EmployeePosition,
  AccessPermission,
} from "@/types/common";

export type EmployeeStatus = "ACTIVE" | "DISABLED";

export type EmployeeBase = {
  id: UUID;
  firstName: string;
  lastName: string;
};

export type AssignableEmployee = EmployeeBase & {
  departments: Departments[];
  position: EmployeePosition;
};

export type DisplayEmployee = EmployeeBase & {
  departments: Departments[];
  position: EmployeePosition;
  status: EmployeeStatus;
};

export type ValidatableEmployee = {
  id: string;
  firstName: string;
  lastName: string;
};

export type EmployeeAdminView = EmployeeBase & {
  email: string;
  departments: Departments[];
  position: EmployeePosition;
  status: EmployeeStatus;
  accessPermission: AccessPermission;
};

export type AuthUser = {
  id: UUID;
  email: string;
  passwordHash: string;
  accessPermission: AccessPermission;
};

export const Position = {
  DOCTOR: "DOCTOR",
  HEAD_DOCTOR: "HEAD_DOCTOR",
  SURGEON: "SURGEON",
  NURSE: "NURSE",
  INTERN: "INTERN",
  MEDICAL_ASSISTANT: "MEDICAL_ASSISTANT",
} as const;

export type Position = (typeof Position)[keyof typeof Position];
