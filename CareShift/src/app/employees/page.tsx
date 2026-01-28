import getData from "@/functions/fetchData";
import { EmployeesResponse } from "@/types/employee";

export default async function EmployeePage() {
  const employeeData = await getData<EmployeesResponse>(
    "https://mockfast.io/backend/apitemplate/get/888213805131320/employee"
  );

  console.log(employeeData);

  return (
    <main>
      <h1>Employee Page</h1>
    </main>
  );
}
