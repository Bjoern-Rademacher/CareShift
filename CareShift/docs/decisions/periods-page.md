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
• Admin can view shift slots for a selected period (read-only)

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

=> Intent
• Admin can assign employees to shift slots

=> Decision

=> Domain Context
•

=> Session Boundaries
•

################################################

=> Intent
•

=> Decision

=> Domain Context
•

=> Session Boundaries
•
