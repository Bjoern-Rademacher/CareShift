//making sure, dates are provided correctly
import { ISODateString } from "@/functions/verifyDate";
import { Departments } from "@/types/common";

export interface Shift {
  id: string; //uuid
  departments: Departments[];
  startTime: ISODateString;
  endTime: ISODateString;
  role?: string; //the assigned role eg. doctor, nurse, technician
}
