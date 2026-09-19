<div align="center">

# CareShift

**A scheduling tool for hospital employees**

CareShift helps administrators create, assign, validate, and publish weekly schedules. Published schedules can then be viewed through employee and display accounts.

</div>

---

## Contents

<table>
  <tr>
    <td width="50%" valign="top">
      <ul>
        <li><a href="#user-roles">User roles</a></li>
        <li><a href="#core-workflow">Core workflow</a></li>
        <li><a href="#schedule-lifecycle">Schedule lifecycle</a></li>
        <li>
          <a href="#assignment-and-validation-rules">
            Assignment and validation rules
          </a>
        </li>
        <li><a href="#roadmap">Roadmap</a></li>
      </ul>
    </td>
    <td width="50%" valign="top">
      <ul>
        <li><a href="#tech-stack">Tech stack</a></li>
        <li><a href="#testing">Testing</a></li>
        <li>
          <a href="#how-schedule-creation-works">
            How schedule creation works
          </a>
        </li>
        <li>
          <a href="#example-template-rules">
            Example template rules
          </a>
        </li>
        <li><a href="#error-handling">Error handling</a></li>
      </ul>
    </td>
  </tr>
</table>

---

## User roles

<table>
  <tr>
    <th align="left">Admin</th>
    <th align="left">Employee</th>
    <th align="left">Display</th>
  </tr>
  <tr>
    <td valign="top">
      - Creates schedules for each department.<br><br>
      - Assigns employees manually or with auto-assign.<br><br>
      - Validates and publishes schedules.<br><br>
      - Returns published schedules to draft and re-edits them.<br><br>
      - Views employee information and assigned shifts.
    </td>
    <td valign="top">
      - Can view their own shifts.<br><br>
      - Can access only the published schedules they are assigned to.<br><br>
      - Can view their employee profile.
    </td>
    <td valign="top">
      Displays published schedules on shared screens in staff-only areas.<br><br>
      Can access all published schedules and filter them by department.
    </td>
  </tr>
</table>

---

## Core workflow

The core workflow and heart of CareShift is its schedule creation and employee assignment system.

Version 1 focuses on creating weekly schedules, assigning employees either manually or automatically, validating those assignments against the scheduling rules, and finally publishing the completed schedule.

<ol>
  <li>
    <strong>Create</strong> a weekly schedule for a department from template rules stored in the database.
  </li>
  <li>
    <strong>Assign</strong> employees manually or use the automatic assignment function.
  </li>
  <li>
    <strong>Validate</strong> the completed assignments against the scheduling rules.
  </li>
  <li>
    <strong>Publish</strong> the validated schedule for employees and display accounts.
  </li>
  <li>
    <strong>Return to draft</strong> if a published schedule needs to be edited again.
  </li>
</ol>

The Underlying scheduling rules are intentionally kept small and currently do not support individual exceptions. Development focused on making the core workflow reliable instead of adding a large number of loosely connected features.

To keep the displayed information consistent, all persistent schedule data is loaded from the database and every update is written directly back to it.

---

## Schedule lifecycle

Every schedule moves through three states:

<table>
  <tr>
    <th align="left">Status</th>
    <th align="left">Meaning</th>
  </tr>
  <tr>
    <td><code>DRAFT</code></td>
    <td>
      The schedule can be edited and employees can be assigned, replaced, or removed.
      Draft schedules are not publicly visible.
    </td>
  </tr>
  <tr>
    <td><code>VALIDATED</code></td>
    <td>
      All current assignments have passed the scheduling rules.
      The schedule is ready to be published.
    </td>
  </tr>
  <tr>
    <td><code>PUBLISHED</code></td>
    <td>
      The schedule is visible to assigned employees and display accounts.
      It can no longer be edited directly.
    </td>
  </tr>
</table>

A published schedule can be returned to draft when changes are needed. During re-editing, it loses its public visibility and must be validated again before it can be republished.

---

## Assignment and validation rules

The frontend prevents known conflicting interactions wherever possible. Before an assignment is written to the database, the backend validates it again.

Current scheduling rules include:

<ul>
  <li>Every shift slot must be assigned before a schedule can be published.</li>
  <li>Employees cannot be assigned to overlapping shifts.</li>
  <li>The minimum rest period for each employee is 11 hours between two shifts.</li>
  <li>Employees can work a maximum of 40 hours in any rolling seven-day period, with overnight shifts split across both days.</li>
  <li>Employees must match the position and department required by the shift slot.</li>
</ul>

The same rules are checked again when the complete schedule is validated or published. This prevents manipulated, outdated, or concurrent requests from bypassing the scheduling rules.

---

## Roadmap

### Planned next steps

<ul>
  <li>Production-ready authentication and account management</li>
  <li>Complete employee login and support for multiple employee accounts</li>
  <li>A protected reset function for restoring the deployed demo data</li>
  <li>
    Automated regression tests to complement the existing manual testing of
    the core scheduling workflows
  </li>
</ul>

### Possible future features

<ul>
  <li>Shift-change requests and absence requests</li>
  <li>Configurable scheduling rules and individual exceptions</li>
  <li>Notifications and messaging</li>
  <li>Additional departments and staffing templates</li>
  <li>More advanced autofill and optimization strategies</li>
</ul>

CareShift is a portfolio demonstration and has not been designed or certified for use with real medical or sensitive patient data.

---

## Tech stack

<table>
  <tr>
    <th align="left">Area</th>
    <th align="left">Technology</th>
  </tr>
  <tr>
    <td>Frontend</td>
    <td>React, Next.js App Router, TypeScript and Tailwind CSS</td>
  </tr>
  <tr>
    <td>Backend</td>
    <td>Next.js API routes and server-side use cases</td>
  </tr>
  <tr>
    <td>Database</td>
    <td>PostgreSQL</td>
  </tr>
  <tr>
    <td>Database access</td>
    <td>Prisma ORM</td>
  </tr>
  <tr>
    <td>Runtime</td>
    <td>Node.js</td>
  </tr>
</table>

The application separates responsibilities into:

<ul>
  <li>Server-rendered pages and client components</li>
  <li>API routes for HTTP request and response handling</li>
  <li>Use cases for application workflows</li>
  <li>Database query functions</li>
  <li>Pure scheduling and validation functions</li>
  <li>Shared domain and API types</li>
  <li>Custom React hooks for independent frontend workflows</li>
</ul>

---

## Testing

The core scheduling workflows have been tested manually from schedule creation through assignment, validation, publishing, and re-editing.

Automated unit and integration tests are planned to complement the existing manual testing.

---

## How schedule creation works

The administrator selects a department and a week to create the schedule for.

CareShift currently supports complete weeks from Monday to Sunday. The backend normalizes the selected date to Monday and calculates the end of the week automatically.

The <code>generateScheduleFromTemplate</code> use case controls the complete creation workflow:

<ol>
  <li>
    It normalizes the selected date to Monday and checks whether a schedule
    already exists for that department and week.
  </li>
  <li>
    It loads the department's active template rules from the database.
  </li>
  <li>
    It generates the required shift slots in memory, including their position,
    time, department, and slot number.
  </li>
  <li>
    It writes the schedule period and all generated shift slots to the database
    in one transaction.
  </li>
</ol>

Each shift slot is connected to its schedule through the period ID and starts with an empty <code>employeeId</code>.

After successful creation, the administrator sees the empty draft schedule and can start assigning employees manually or through workload-balanced autofill.

During schedule editing, a client-side mutation lock prevents overlapping requests in the same browser session.

Every accepted assignment is written directly to the database. If an assignment violates a scheduling rule, the request is rejected and the concrete issues are shown in the frontend.

Autofill follows the same rules as manual assignment. If no valid employee can be found for a shift, that slot remains unfilled.

After all slots have been filled, the schedule must pass validation before it can be published.

---

## Example template rules

The seeded ICU template demonstrates how schedules are generated.

<table>
  <tr>
    <th align="left">Shift</th>
    <th align="left">Doctors</th>
    <th align="left">Nurses</th>
  </tr>
  <tr>
    <td>Morning</td>
    <td>1</td>
    <td>2</td>
  </tr>
  <tr>
    <td>Evening</td>
    <td>1</td>
    <td>2</td>
  </tr>
  <tr>
    <td>Night</td>
    <td>1</td>
    <td>2</td>
  </tr>
</table>

One head doctor is additionally required on weekdays from 08:00 to 16:00.

For every required position and slot, CareShift creates a separate database entry. The template defines what is needed; employee assignments are added afterward.

---

## Error handling

Routes and use cases share a consistent error structure with three possible outcomes:

<table>
  <tr>
    <th align="left">Outcome</th>
    <th align="left">Behaviour</th>
  </tr>
  <tr>
    <td><strong>Expected success</strong></td>
    <td>
      The operation returns <code>ok: true</code> together with its result data.
    </td>
  </tr>
  <tr>
    <td><strong>Expected failure</strong></td>
    <td>
      A known business-rule failure returns <code>ok: false</code> with a specific error code, message, and optional list of issues.
    </td>
  </tr>
  <tr>
    <td><strong>Unexpected system failure</strong></td>
    <td>
      Database, network, parsing, and runtime failures are treated as technical errors. The real server error is logged while the frontend receives a safe error message.
    </td>
  </tr>
</table>

For example, a schedule that cannot be validated returns a concrete failure containing the affected assignments instead of throwing a generic application error.
