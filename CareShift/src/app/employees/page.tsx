import getData from "@/functions/fetchData";
import { EmployeesResponse } from "@/types/employee";

export default async function EmployeePage() {
  const token = process.env.MOCKFAST_API_TOKEN;

  const data = await getData<EmployeesResponse>(
    "https://mockfast.io/backend/apitemplate/get/888213805131320/employee",
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  console.log(data);

  return (
    <main>
      <h1>Employee Page</h1>
    </main>
  );
}
