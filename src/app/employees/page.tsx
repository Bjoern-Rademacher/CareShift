"use client";

import { useState, useEffect } from "react";

import * as ui from "@/ui/classes";

import { AssignableEmployee } from "@/types/employee";

import { getDepartmentLabel } from "@/lib/functions/departments";

type Filter = "ALL" | "ACTIVE" | "DISABLED";

export default function EmployeesPage() {
  const [filter, setFilter] = useState<Filter>("ACTIVE");
  const [employees, setEmployees] = useState<AssignableEmployee[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadEmployees() {
      try {
        setError(null);

        const url =
          filter === "ALL"
            ? "/api/employees/display"
            : `/api/employees/display?status=${filter}`;

        const response = await fetch(url);

        if (!response.ok) {
          throw new Error("Failed to load employees");
        }

        const data = await response.json();

        setEmployees(data.employees);
      } catch {
        setError("Failed to load employees");
      }
    }

    loadEmployees().catch(console.error);
  }, [filter]);

  return (
    <main className={ui.page}>
      {error && <p>{error}</p>}
      <section className={`${ui.section} ${ui.card}`}>
        <h1 className={ui.title}>Employees</h1>

        <p className={ui.subtitle}>
          Staff overview with departments, positions, status, and access level.
        </p>

        <section className="mt-6 flex gap-2">
          <button
            className={filter === "ALL" ? ui.buttonPrimary : ui.button}
            onClick={() => setFilter("ALL")}
          >
            All
          </button>

          <button
            className={filter === "ACTIVE" ? ui.buttonPrimary : ui.button}
            onClick={() => setFilter("ACTIVE")}
          >
            Active
          </button>

          <button
            className={filter === "DISABLED" ? ui.buttonPrimary : ui.button}
            onClick={() => setFilter("DISABLED")}
          >
            Disabled
          </button>
        </section>

        <section className="mt-8 grid gap-4 md:grid-cols-2">
          {employees.map((employee) => (
            <article key={employee.id} className={ui.card}>
              <h2 className="text-xl font-semibold">{`${employee.firstName} ${employee.lastName}`}</h2>

              <dl className="mt-4 space-y-2 text-sm">
                <div>
                  <dt className="text-base font-semibold">Position</dt>
                  <dd>{employee.position}</dd>
                </div>

                <div>
                  <dt className="text-base font-semibold">Departments</dt>
                  <dd>
                    <ul>
                      {employee.departments.map((d) => (
                        <li key={d}>{getDepartmentLabel(d)}</li>
                      ))}
                    </ul>
                  </dd>
                </div>

                <div>
                  <dt className="text-base font-semibold">Status</dt>
                  <dd>{employee.status}</dd>
                </div>
              </dl>

              <button className={`${ui.button} mt-4`} disabled>
                Show active schedules
              </button>
            </article>
          ))}
        </section>
      </section>
    </main>
  );
}
