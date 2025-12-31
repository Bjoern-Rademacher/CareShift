import {
  Departments,
  EmployeePosition,
  AccessPermission,
} from "@/types/common";
import { ISODateString } from "@/functions/verifyDate";

export type EmployeeStatus = "ACTIVE" | "DISABLED";

export interface Employee {
  id: string; // uuid
  name: string; // full name
  email: string; // to login and recieve notifications
  employeePosition: EmployeePosition; // internal Role, eg. Doctor Nurse etc.
  departments: Departments[]; // one or multiple departments the employee works in
  status: EmployeeStatus; // active or disabled, when ill or in holdays
  accesPermission: AccessPermission; // data access permission-level
  createdAt?: ISODateString;
  updatedAt?: ISODateString;
}

export interface EmployeesResponse {
  employees: Employee[];
}
