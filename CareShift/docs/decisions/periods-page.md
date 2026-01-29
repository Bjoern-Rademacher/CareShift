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
• Detail Page shows Period ID, Department, StartDate
• On /periods/[id], we fetch all periods and select the one matching the route id because the mock API does not expose /periods/:id and adding endpoints is out of scope for the MVP.
• If the period is not found, a simple “404 – Period not found” screen with a “Back to overview” button s shown

=> Domain Context
• This pages final state is intended to show period details including slots and full editing functionality.
