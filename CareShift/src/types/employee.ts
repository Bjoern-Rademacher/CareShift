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
  name: string; // full name
  email: string; // to login and recieve notifications
  employeePosition: EmployeePosition; // internal Role, eg. Doctor Nurse etc.
  departments: Departments[]; // one or multiple departments the employee works in
  status: EmployeeStatus; // active or disabled, when ill or in holdays
  accessPermission: AccessPermission; // data access permission-level
  createdAt?: ISODateString;
  updatedAt?: ISODateString;
}

export interface EmployeesResponse {
  employees: Employee[];
}
