# User Personas and Scenarios — CampusMobi

**Overview**
Three personas representing the primary user groups of CampusMobi at Walter Sisulu University, each grounded in the core problems the platform solves: physical student cards, fragmented campus systems, and long service queues.

## Persona 1: Sipho Dlamini (First-Year Student)

- **Age**: 19
- **Programme**: Bachelor of Computer Science (Year 1)
- **Residence**: On-campus
- **Tech Comfort**: Moderate
- **Connectivity**: Campus Wi-Fi dependent

- **Goals**

    Navigate an unfamiliar campus without getting lost
    Access facilities without a physical card
    Pay for campus services using a digital wallet

- **Frustrations**

    Misplaced his physical student card within his first week
    Spent 25 minutes searching for the Science Block on his first day
    Long queues at the admin office just to top up a campus card

### Scenario — Monday Morning
Sipho opens CampusMobi on his phone before leaving his residence. He sees a low-balance notification and tops up his wallet (R100.00) via the payment gateway in under 5 seconds. He searches "ICT Building" on the Smart Campus Map and follows the walking route from his residence. At the entrance he presents his Virtual Student Card QR code, gains access, and attends his lecture. Afterwards he navigates to the library, scans in using his digital card, and pays for a cafeteria meal from his wallet on the way out, all without touching a physical card.

- **Features used**: User Authentication, Virtual Student Card, Campus Wallet, Smart Campus Map, Notification System

## Persona 2: Dr. Zanele Mokoena (Lecturer and Staff Member)

- **Age**: 41
- **Role**: Senior Lecturer — Faculty of Natural Sciences
- **Tech Comfort**: High
- **Connectivity**: Campus Wi-Fi + personal mobile data

- **Goals**

    Access restricted staff buildings and exam venues reliably
    Pay for cafeteria meals without carrying cash
    Navigate to unfamiliar buildings for cross-faculty meetings

- **Frustrations**

    Occasionally forgets her physical staff card in her office, causing access delays
    Cafeteria card readers are frequently faulty, forcing her to carry cash
    Newer buildings are difficult to locate for first-time visits

### Scenario — Exam Preparation Day
Dr. Mokoena logs into CampusMobi on her laptop using her staff credentials. The system grants her staff-level access via Role-Based Access Control. She searches for the Research Annexe on the Smart Campus Map and follows directions from her office. At the entrance she uses NFC on her phone to scan her Virtual Staff Card and is granted access. After her meeting she heads to the cafeteria and pays R45.00 directly from her Campus Wallet. The low-balance notification that follows prompts her to top up before leaving.

- **Features used**: User Authentication (RBAC), Virtual Staff Card (NFC), Campus Wallet,   Smart Campus Map, Notification System

## Persona 3: Ayanda Ntuli (Final-Year Student)

- **Age**: 23
- **Programme**: Bachelor of Commerce (Year 4)
- **Residence**: Off-campus commuter
- **Tech Comfort**: High
- **Connectivity**: Campus Wi-Fi dependent

- **Goals**

    Skip the daily 30–45 minute cafeteria queue by pre-ordering meals
    Track spending carefully on a tight monthly budget
    Access campus facilities on days she forgets her physical card at home

- **Frustrations**

    Loses up to 45 minutes daily in the cafeteria queue
    No visibility over spending leads to running out of funds mid-week
    Forgets her physical card on commuting days, causing library and lab access issues

### Scenario — A Busy Wednesday
Ayanda arrives on campus and logs into CampusMobi on a campus computer. Her Virtual Student Card loads immediately, replacing her forgotten physical card. She places a cafeteria pre-order for 13:00 collection (R38.00 deducted from wallet), then checks the Smart Campus Map for a seminar room she has never visited. She presents her QR code at the Commerce Building entrance and the seminar room door, both grant access without issue. At 13:00 she collects her pre-ordered meal in under 2 minutes, saving roughly 35 minutes compared to the standard queue. Before leaving she reviews her wallet transaction history and sees her balance is running low.

- **Features used**: User Authentication, Virtual Student Card (QR on campus computer), Campus Wallet, Smart Campus Map, Cafeteria Pre-Order, Notification System