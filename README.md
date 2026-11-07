# Student Support Ticket System

MVP for the University Student Support Office. Students submit questions as tickets,
a support manager assigns each ticket to an agent, and the student can always see who
owns the ticket and what state it is in.

Team 2: Jamal Alrefai (Product Owner), Hamza Alayoubi (Scrum Master, Developer).
Work is planned in Jira; each pull request references its Jira work items.

## MVP features

| Feature | Jira epic | What it does |
| --- | --- | --- |
| Ticket submission | Ticket Submission | Student enters subject, category and description and receives a unique ticket ID |
| Status tracking & assignment | Status Tracking & Assignment | Manager assigns tickets to agents; agents move tickets through Open, In Progress, Resolved, Closed; students see status and owner |
| Communication thread | Communication Thread | Student and staff exchange messages inside the ticket |

Out of scope for this release: analytics and reports, mobile app, email, chatbot.

## Running it

Open `index.html` in a browser. No installation or server is needed.

Use the "Signed in as" menu to switch between the demo users (two students, two
agents, one manager) and see each role's screens.

## Technical notes

- Plain HTML, CSS and JavaScript, chosen so the MVP runs anywhere without setup.
- Data is stored in the browser's localStorage, so it is per browser and per device.
  A real deployment would replace `store.js` with calls to a backend and a database.
- There is no real login yet; the user menu simulates the three roles.
