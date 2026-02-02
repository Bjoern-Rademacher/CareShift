################################################

23rd jan 2026

=> Intent
• User can view periods filtered by department and week

=> Decision
• Weekmodel = mon-sun
• Week selection by date - pick the monday of the week. This is temporary to make UI work with mock API
• in a real backend, I'd use a range query or ISO week parameter
• no month view & week numbers in MVP to reduce UI complexity

=> Domain Context
• a period is one week mon-sun scoped per department
• this page shows schedule periods, slot details are accessed via period detail view

=> Session Boundaries (!ToDo)
• adding month view & week numbers
• creating authentication and authorization based logic
• ADMIN = see all periods
• USER = see periods for relevant departments only
• DISPLAY = see published periods only

################################################

29 jan 2026

=> Intent
• User can open a period detail (/periods/:id) by clicking “show details” next to a period.

=> Decision
• Detail Page renders Period ID, Department, StartDate
• period data is resolved by fetching all periods, then selecting by route [id] because mock api does not expose /periods/:id
• Missing periods are handled by a scoped 404 page with recovery path

=> Domain Context
• A Period is a weekly container (Mon–Sun) for one department.
• Periods are the parent entity for shift slots and future scheduling actions.

=> Session Boundaries (!ToDo)
• No auto-redirects, no timers, no error telemetry.
• No slot rendering

################################################

29 jan 2026

=> Intent
• User can view shift slots for a selected period (read-only)

=> Decision
• On /periods/:id, slots are fetched from the mock API and adapted via a small adapter function to keep UI data flow independent from the API response shape.
• Slots are rendered as a simple table (read-only)

=> Domain Context
• Shift slots are a time block within a period
• A shift slot can be assigned to a employee or remain unassigned
• Each slot belongs to exactly one period and may cross midnight.

=> Session Boundaries

• Creating new slots
• Editing existing slots
• Assigning employees to slots

################################################

31 jan 2026

=> Intent
• Assign employees to shift slots

=> Decision
• Assign is rendered per row because it is slot-scoped, colocated with the affected data, clearly arranged for the user, and avoids hidden selection state.
• Assigning an employee updates the employeeId field on the selected slot in local UI state and sends a PATCH/PUT request to the mock API; persistence is not guaranteed.
• Employee selection is handled in a modal dialog to isolate assignment state and avoid inline table complexity.

=> Domain Context
• Assigning employees to a slot is admin-only
• Assignment is represented by setting employeeId on the slot.
• Assignment rules (availability, conflicts, requirements) are domain concerns but not enforced in this slice.

=> Session Boundaries
• Availability-check
• Employee requirements matching
• Unassigning employee from slot

################################################

feb 2026

=> Intent
•

=> Decision
•
•
•

=> Domain Context
•
•
•

=> Session Boundaries
•
•
•

################################################

=> Intent
•

=> Decision
•
•
•

=> Domain Context
•
•
•

=> Session Boundaries
•
•
•
