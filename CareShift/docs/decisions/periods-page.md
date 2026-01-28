23rd jan 2026

Session no.1

<b>Intent</b>
• User can view periods filtered by department and week

<b>Decision</b>
• Weekmodel = mon-sun
• Week selection by date - pick the monday of the week. This is temporary to make UI work with mock API
• in a real backend, I'd use a range query or ISO week parameter
• no month view & week numbers in MVP to reduce UI complexity

<b>Domain Context</b>
• a period is one week mon-sun scoped per department
• this page shows schedule periods, slot details are accessed via period detail view

<b>Session Boundaries (!ToDo)</b>
• adding month view & week numbers
• creating authentication and authorization based logic
• ADMIN = see all periods
• USER = see periods for relevant departments only
• DISPLAY = see published periods only
