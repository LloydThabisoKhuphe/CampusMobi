# CampusMobi - Features  

## Features  

### User Authentication  
- **Stability**: stable  
- **Description**: Secure login system for students, staff, and administrators using student ID or email  
- **Properties**:  
  - Passwords are hashed with bcrypt (salt rounds >= 10)  
  - Role-based access control (RBAC) implemented  
  - Session tokens expire after 24 hours  
  - Failed login attempts rate-limited to 5 per minute  
- **Test Criteria**:  
  - [x] Valid credentials return authentication token  
  - [x] Invalid credentials return 401 error  
  - [x] Role-based access restricts unauthorized actions  
  - [x] Rate limiting blocks excessive attempts  

---

### Virtual Student Card  
- **Stability**: stable  
- **Description**: Digital student identification using QR/NFC for access and verification across campus  
- **Properties**:  
  - Unique QR code generated per user session  
  - NFC support for compatible devices  
  - Secure identity verification for access points  
- **Test Criteria**:  
  - [x] QR code generates successfully  
  - [x] QR/NFC scan validates user identity  
  - [x] Unauthorized access is denied  

---

### Campus Wallet  
- **Stability**: stable  
- **Description**: Digital wallet for managing funds and making campus-related payments  
- **Properties**:  
  - Integration with payment gateways for fund loading  
  - Transaction history is stored and retrievable  
  - Secure payment processing with encryption  
- **Test Criteria**:  
  - [x] Users can load funds successfully  
  - [x] Transactions are recorded accurately  
  - [x] Payment failures are handled gracefully  

---

### Smart Campus Map  
- **Stability**: in-progress  
- **Description**: Interactive campus navigation system with real-time directions  
- **Properties**:  
  - Displays key locations (lecture halls, labs, residences, etc.)  
  - Provides route guidance between locations  
  - Responsive and mobile-friendly interface  
- **Test Criteria**:  
  - [x] Map loads with campus locations  
  - [x] Users can search for locations  
  - [ ] Real-time navigation updates accurately  

---

### Service Integration (Printing Services)  
- **Stability**: in-progress  
- **Description**: Integration for booking and managing printing services on campus  
- **Properties**:  
  - Users can book printing slots  
  - Booking confirmations are stored  
  - System prevents double bookings  
- **Test Criteria**:  
  - [x] Users can book a printing slot  
  - [x] Booking conflicts are prevented  
  - [ ] Booking history is displayed correctly  

---

### Notifications System  
- **Stability**: in-progress  
- **Description**: System for sending alerts related to account and transactions  
- **Properties**:  
  - Low balance alerts  
  - Payment confirmation notifications  
  - Delivered via in-app notifications  
- **Test Criteria**:  
  - [x] Low balance alert is triggered correctly  
  - [x] Payment confirmation is sent after transaction  
  - [ ] Notifications are received in real-time  

---

### Admin Dashboard  
- **Stability**: planned  
- **Description**: Administrative interface for managing users, services, and system activity  
- **Properties**:  
  - View and manage user accounts  
  - Monitor transactions and usage metrics  
  - Verify campus service providers  
- **Test Criteria**:  
  - [ ] Admin can view all users  
  - [ ] Admin can monitor transactions  
  - [ ] Admin can manage service providers  

---

### Analytics & Reporting  
- **Stability**: planned  
- **Description**: System analytics to track usage, performance, and adoption metrics  
- **Properties**:  
  - Tracks daily active users  
  - Monitors transaction volume  
  - Generates reports for decision-making  
- **Test Criteria**:  
  - [ ] Reports generate successfully  
  - [ ] Metrics reflect accurate data  
  - [ ] Dashboard updates in near real-time  

---

### Security Enhancements  
- **Stability**: planned  
- **Description**: Advanced security features to protect user data and transactions  
- **Properties**:  
  - Two-factor authentication (2FA)  
  - End-to-end encryption for sensitive data  
  - Secure API communication (HTTPS)  
- **Test Criteria**:  
  - [ ] 2FA is enforced during login  
  - [ ] Data is encrypted in transit  
  - [ ] Unauthorized access attempts are logged  

---

### User Profile Management  
- **Stability**: planned  
- **Description**: Allows users to manage their personal information and activity  
- **Properties**:  
  - Update personal details  
  - View transaction and usage history  
- **Test Criteria**:  
  - [ ] Users can update profile details  
  - [ ] Changes persist correctly  
  - [ ] History is displayed accurately  
