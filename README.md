# CampusMobi

A simple campus assistant for **Walter Sisulu University**.

Students can sign in, open a digital student card, check a class calendar, get reminders, find campus buildings, and try a demo wallet. Staff can verify a student number from the digital card.

This rewrite is meant for a live demo: the code is short, the folders are clear, and you do not need a database.

## What you can show

- Sign in as a student or staff member (or continue as a guest)
- Dashboard with today's schedule and announcements
- Digital campus card with a QR-style code
- Staff verification of a student number
- Calendar add / remove events
- Notifications created from new events
- Campus map search
- Demo wallet top-up and payment (not real money)

## Demo accounts

| Role | Username | Password |
| --- | --- | --- |
| Student | `220045678` | `student123` |
| Staff | `staff01` | `staff123` |

## How to run

You need Node.js 18 or newer.

```bash
cd CampusMobi
npm install
npm run install:all
npm start
```

Then open:

- App: [http://localhost:3000](http://localhost:3000)
- API: [http://localhost:4000/api/health](http://localhost:4000/api/health)

The React app forwards `/api` requests to the Express server.

## Folders

```
CampusMobi/
  client/                 React frontend (HTML, CSS, JavaScript)
    src/pages/            One screen per feature
    src/components/       Navbar, calendar, QR mark
    src/context/          Login session
  server/                 Node.js + Express backend
    src/index.js          All API routes
    src/data.js           Demo users, map, wallet, calendar
    src/auth.js           Simple session tokens
  docs/                   Original project documents
```

## How a request works

1. The React page calls `/api/...`
2. Express checks the login token
3. The server reads or updates the in-memory demo data
4. The page shows the result

Wallet payments and calendar events reset when you restart the server. That is intentional for a presentation.
