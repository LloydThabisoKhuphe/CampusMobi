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
# CampusMobi –  Web Application
CampusMobi is a web-based campus assistant application designed for students at **Walter Sisulu University**.The goal of the system is to help students manage their daily academic and campus activities in one place.

This application is for Students and staff members within the Institution initially for Walter Sisulu University, this app allows users to view their cards (staff/student) for Accessing so facilities e.g library , study centre and etc , this app also helps with the navigation within the campus showing you a map or route to a specific destination.

Built using **React.js**, the system is designed to be lightweight, easy to use, and accessible through any modern web browser.

## Features

### User Authentication
Students can log into the system securely and access their personal dashboard.

### Dashboard
A central dashboard allows users to easily navigate between all system features.

### Virtual Student Card
A digital student card is provided within the system. It displays student details along with a QR code that can be used for identification purposes when accessing campus facilities.

### Calendar
The system provides a calendar where students can:

- View their academic schedule
- Manage events such as classes

### Schedule Notifications
Notifications are generated based on calendar events to:

- Remind students of upcoming classes
- Help students stay organized

### Campus Map
Students can view a simplified campus map or list of locations, including:
- Lecture halls
- Library
- Administration offices

Selecting a location shows basic information to assist with navigation.

### Wallet (Demo)
The wallet feature allows students to:
- View a balance
- Simulate adding funds
- Simulate payments

>**Note**: This feature is for demonstration purposes only and does not involve real transactions.

### Web-Based Platform
CampusMobi runs in a web browser and can be accessed on:
- Chrome
- Edge
- Safari
- Firefox

**Development URL (Example)**: `http://localhost:3000`

## Getting Started

## Using Node.js 

#### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Modern browser

**Check Node version:**
node -v

## Quick Installation

1. Navigate to project folder
> cd CampusMobi

2. Install dependencies
> npm install

3. Start development server
> npm start

## Using Springboot

#### Prerequisites
-Java Development Kit (JDK)
-Apache Maven or Gradle
-Modern browser
-IDE such as IntelliJ IDEA or Visual Studio Code

**Check Java version:**
java -version

**Check Maven version:**
mvn -version

## Quick Installation

Navigate to project folder
cd CampusMobi

Build and install dependencies
mvn clean install

Start the Spring Boot application
mvn spring-boot:run

**Alternative (Using Gradle)**
Build project
./gradlew build
Run application
./gradlew bootRun 


4. Open browser
http://localhost:3000

##  Project Structure
```
CampusMobi/
│
├── docs/
│   ├── meeting_logs/
│   ├── agile/
│   ├── features/
│   ├── product_vision.md
│   └── software_management_plan.md
│
├── public/
│   └── index.html
│
├── src/
│   ├── components/
│   │   ├── Navbar.js
│   │   ├── WalletCard.js
│   │   └── MapComponent.js
│   │
│   ├── pages/
│   │   ├── LoginPage.js
│   │   ├── Dashboard.js
│   │   ├── CardPage.js
│   │   ├── CalendarPage.js
│   │   ├── MapPage.js
│   │   ├── WalletPage.js
│   │   └── NotificationsPage.js
│   │
│   ├── services/
│   │   ├── AuthService.js
│   │   └── WalletService.js
│   │
│   ├── constants/
│   │   └── AppConstants.js
│   │
│   ├── App.js
│   └── index.js
│
├── package.json
└── README.md
```
## Configuration
All configuration settings are stored in:

src/constants/AppConstants.js
```
Example:

export const APP_INFO = {
  APP_NAME: "CampusMobi",
  UNIVERSITY: "Walter Sisulu University",
  VERSION: "1.0.0"
};
Theme Customization
export const COLORS = {
  PRIMARY: "#0057B8",
  SECONDARY: "#FFC72C",
  BACKGROUND: "#F5F5F5"
};
Feature Flags
export const FEATURES = {
  ENABLE_WALLET: true,
  ENABLE_CAMPUS_MAP: true
};
```
## Building for Production
To create an optimized production build:

> npm run build

Production files will be generated in /build folder
These files can be deployed using:

- Vercel
- Netlify
- Render

## Deployment
Example deployment using Vercel:

> npm install -g vercel
vercel

After deployment the app will be accessible online.

## Key Dependencies
- React.js
- React Router
- Axios

Install Example:
> npm install react-router-dom axios

## Notes
- The wallet system uses simulated transactions (no real payments).
- Notifications are triggered from calendar events.
- The campus map is simplified and does not use external APIs.
- The system is developed as a Minimum Viable Product (MVP).

# Authors
CampusMobi team members 
