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

export type DisplayEmployee = EmployeeBase;

export type AssignableEmployee = EmployeeBase & {
  departments: Departments[];
  position: EmployeePosition;
  status: EmployeeStatus;
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
