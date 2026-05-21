"use client";

import { useState } from "react";

import * as ui from "@/ui/classes";

import { mockStore } from "@/lib/mock/store";

type Filter = "ALL" | "ACTIVE" | "DISABLED";

export default function EmployeesPage() {
  const [filter, setFilter] = useState<Filter>("ACTIVE");

  const filteredEmployees = mockStore.employees.filter((employee) => {
    if (filter === "ALL") return true;

    return employee.status === filter;
  });

  return (
    <main className={ui.page}>
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
          {filteredEmployees.map((employee) => (
            <article key={employee.id} className={ui.card}>
              <h2 className="text-xl font-semibold">{employee.name}</h2>

              <p className={ui.subtitle}>{employee.email}</p>

              <dl className="mt-4 space-y-2 text-sm">
                <div>
                  <dt className="font-medium">Position</dt>
                  <dd>{employee.employeePosition}</dd>
                </div>

                <div>
                  <dt className="font-medium">Departments</dt>
                  <dd>{employee.departments.join(", ")}</dd>
                </div>

                <div>
                  <dt className="font-medium">Status</dt>
                  <dd>{employee.status}</dd>
                </div>

                <div>
                  <dt className="font-medium">Access</dt>
                  <dd>{employee.accessPermission}</dd>
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
