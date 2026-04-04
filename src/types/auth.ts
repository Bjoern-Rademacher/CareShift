export type Role = "admin" | "employee" | "viewer";

export type CurrentUser = {
  userId: string;
  role: Role;
  employeeId?: string;
  department?: string;
};
