import {
  UUID,
  Departments,
  EmployeePosition,
  AccessPermission,
  ISODateString,
} from "@/types/common";

export type EmployeeStatus = "ACTIVE" | "DISABLED";

export interface Employee {
  id: UUID;
  name: string;
  email: string;
  employeePosition: EmployeePosition;
  departments: Departments[];
  status: EmployeeStatus;
  accessPermission: AccessPermission;
  createdAt?: ISODateString;
  updatedAt?: ISODateString;
}

export type EmployeeDto = {
  id: UUID;
  name: string;
  email: string;
  employeePosition: EmployeePosition;
  departments: Departments[];
  status: EmployeeStatus;
  accessPermission: AccessPermission;
  createdAt?: ISODateString;
  updatedAt?: ISODateString;
};

export interface EmployeesResponse {
  employees: Employee[];
}
