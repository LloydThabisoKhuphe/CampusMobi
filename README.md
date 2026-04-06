## CampusMobi –  Web Application
A comprehensive web-based campus application designed for students and staff at Walter Sisulu University.

App is for Students and staff members within the Institution initially for Walter Sisule University, this app allows users to view their cards (staff/student) for Accessing so facilities e.g library , study centre and etc , this app also helps with the navigation within the campus showing you a map or route to take in order to go to a specific destination , and it also allws users to get access to the printing machines and purchasing at the cafeteria which works hand in hand with a built-in Wallet

Built with React.js – Modern frontend framework for scalable web applications.

# Features
Digital Campus Card
Virtual Student/Staff ID card

Used to access facilities such as:

Library
Study centres
Computer labs
Restricted campus buildings
Campus Navigation
Interactive campus map

Route guidance to locations such as:

Lecture halls
Administration offices
Cafeterias
Printing stations
Libraries
Built-in Wallet
Secure digital wallet linked to the user account

Used to pay for:

Printing services
Cafeteria purchases
Other campus services
Printing Machine Access
Send documents to campus printers
Pay directly using wallet balance
View printing history
Facility Access
Digital card used to access:

Library
Study centre
Campus buildings
User Profiles
Users can:

View their digital card
Check wallet balance
Track transaction history
Update profile information
Web-Based Platform
Accessible through any browser:

Chrome
Safari
Edge
Firefox
Example:

https://campusMobi.co.za
Getting Started
Prerequisites
Node.js (v18 or higher)
npm or yarn
Modern browser
Check Node version:

node -v
Quick Installation
Navigate to project folder

cd CampusMobi
Install dependencies

npm install
Start development server

npm start
Open browser

http://localhost:3000

##  Project Structure
CampusConnect/
│
│   ├── docs/
│   │   ├── meetings_logs/
│   │   ├── product_vision.md
│   │   └── Software_management_plan.md
│
├── public/
│   └── index.html
│
├── src/
│
│   ├── components/
│   │   ├── Navbar.js
│   │   ├── WalletCard.js
│   │   └── MapComponent.js
│
│   ├── pages/
│   │   ├── HomePage.js
│   │   ├── CardPage.js
│   │   ├── WalletPage.js
│   │   ├── MapPage.js
│   │   ├── PrintingPage.js
│   │   ├── CafeteriaPage.js
│   │   └── ProfilePage.js
│
│   ├── services/
│   │   ├── AuthService.js
│   │   ├── WalletService.js
│   │   └── PrintingService.js
│
│   ├── constants/
│   │   └── AppConstants.js
│
│   ├── App.js
│   ├── index.js
│
├── package.json
└── README.md

# Configuration
All configuration settings are stored in:

src/constants/AppConstants.js
Example:

export const APP_INFO = {
  APP_NAME: "Campus Connect",
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
  ENABLE_PRINTING: true,
  ENABLE_CAMPUS_MAP: true
};
Campus Map Integration
Campus navigation can use APIs such as:

Google Maps API
OpenStreetMap
Mapbox
Example:

src/components/MapComponent.js
Features:

Show buildings
Show route directions
Locate facilities
Building for Production
Create optimized build:

npm run build
Production files will be generated in:

/build
These files can be deployed to:

Vercel
Netlify
AWS
Render
Deployment
Example deployment using Vercel:

npm install -g vercel
vercel
After deployment the app will be accessible online.

Example:

https://campusconnect.vercel.app
Key Dependencies
React.js
React Router
Axios (API requests)
Material UI or TailwindCSS
Google Maps API
Example:

npm install react-router-dom axios
API Integration
The frontend connects to a backend API.

Example backend technologies:

Node.js

Example API service:

src/services/WalletService.js
Example:

import axios from "axios";

export const getWalletBalance = async (userId) => {
  const response = await axios.get(`/api/wallet/${userId}`);
  return response.data;
};
Troubleshooting
Clear cache

npm cache clean --force
Reset project

rm -rf node_modules
npm install
npm start

# Authors
CampusMobi team members
