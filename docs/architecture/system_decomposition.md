# System Decomposition — CampusMobi

## Overview

CampusMobi is decomposed into six major modules, each with a clearly defined responsibility.
The decomposition follows the layered architecture adopted in the architecture overview,
ensuring separation of concerns between the frontend, backend services, and data layer.

---

## Modules

1. Authentication & User Management
2. Virtual Student/Staff Card
3. Campus Wallet
4. Smart Campus Map & Navigation
5. Calendar
6. Notification System

---

## Component Responsibilities

### 1. Authentication & User Management

Handles all identity-related operations for students, staff, and administrators.

- Secure login using student/staff User-ID/email and password
- Role-Based Access Control (RBAC) — distinguishes between Student, Staff, and Admin roles
  and restricts access to features accordingly
- Session token generation and expiry (tokens expire after 24 hours)
- Rate limiting on failed login attempts (max 5 per minute)
- Password hashing using bcrypt
- User profile management — view and update personal details, view activity and simulated transaction
  history

**Interfaces with:** Virtual Card module (to confirm identity before generating card),
Campus Wallet (to link wallet to authenticated user), Notification System (to send login alerts)

---

### 2. Virtual Student/Staff Card

Provides a digital replacement for the physical campus card, used for identity verification
and facility access.

- Generates a unique QR code per user session for scanning at access points
- Supports NFC for compatible devices (staff cards)
- Validates user identity at access-controlled entry points (library, labs, lecture halls,
  restricted buildings)
- Logs all access events (timestamp, location, user ID) for security auditing
- Denies access and returns an error for unverified or expired sessions

**Interfaces with:** Authentication module (to verify user session before card generation),
Admin Dashboard (access logs are viewable by admins)

---

### 3. Campus Wallet(demo)

Manages all financial transactions and balances for campus services.

- Displays current simulated wallet balance on the user's home screen and profile page
- Allows users to simulate funds 
- Maintains a full transaction history of the simulated wallet transaction

**Interfaces with:** Authentication module (wallet is linked to a verified user account),

---

### 4. Smart Campus Map & Navigation

Provides interactive, browser-based navigation across the WSU campus.

- Renders an interactive map displaying all key campus locations — lecture halls, labs,
  library, cafeteria, admin offices, residences, and restricted buildings
- Accepts location search queries and highlights the selected destination
- Generates walking routes between a user's current location and their chosen destination
  with estimated travel time
- Labels landmarks along routes to aid orientation
- Responsive and mobile-friendly for use on smartphones and campus computers
- Integrates with a mapping API (Google Maps API, Mapbox, or OpenStreetMap)

**Interfaces with:** Authentication module (map is only accessible to logged-in users),
Virtual Card module (building locations shown on map correspond to access-controlled entry
points)

---

### 6. Notification System

Delivers in-app alerts to users based on system events triggered by other modules.

- Generate reminders for upcoming events and lectures 
- Display system notifcations (e.g updates)
- Delivered via in-app notifications visible on the user's home screen
- Planned extension to real-time notifications using WebSockets or a push notification service

**Interfaces with:** Campus Wallet (financial event triggers)

---

## Module Interaction Summary

| Module                        | Depends On                        | Provides To                        |
|-------------------------------|-----------------------------------|------------------------------------|
| Authentication & User Mgmt    | —                                 | All other modules                  |
| Virtual Student/Staff Card    | Authentication                    | Admin Dashboard, Access Points     |
| Campus Wallet                 | Authentication                    | -                                  |
| Smart Campus Map              | Authentication                    | Users (navigation output)          |
| Cafeteria Service Integration | Campus Wallet, Authentication     | Notification System, Users         |
| Notification System           | Campus Wallet, Cafeteria Service  | Users                              |

---

## Notes on Scope

The Admin Dashboard is listed as a planned feature in the features list and is not yet
decomposed into a full module. When implemented it will interface with the Authentication
module (user management), the Virtual Card module (access logs), and the Campus Wallet
(simulated transaction monitoring). It is acknowledged here to ensure the decomposition remains
consistent with the full product vision.
